import { supabase } from './supabase';
import { performServiceMapping } from './mappingEngine';
import { performGapAnalysis } from './gapAnalysisEngine';
import { generateAllRetailAttachForMenu } from './retailAttachEngine';
import { validateInput, validateOutput, blockedResult, type GuardrailResult } from './analysis/guardrails';
import { withCreditGate } from './analysis/creditGate';
import { fetchSignalsForServiceCategories, type SignalEnrichment } from './analysis/signalEnrichment';
import { createScopedLogger } from './logger';

const planLog = createScopedLogger('PlanOrchestrator');

/** Structured output type for guarded plan orchestration */
export interface PlanOrchestrationOutput {
  summary: {
    totalServices: number;
    mappedServices: number;
    identifiedGaps: number;
    retailOpportunities: number;
    openingOrderTotal: number;
  };
  services: ParsedService[];
  mappings: ReturnType<typeof performServiceMapping> extends Promise<infer R> ? R : never;
  gaps: ReturnType<typeof performGapAnalysis> extends Promise<infer R> ? R : never;
  retailRecommendations: Array<{
    serviceName: string;
    productSKU: string;
    productName: string;
    rationale: string;
    strategy: string;
    estimatedAttachRate: number;
  }>;
  openingOrder: Array<{
    productName: string;
    productSKU: string;
    quantity: number;
    unitPrice: number;
    totalCost: number;
  }>;
  signalEnrichment: SignalEnrichment | null;
}

interface ParsedService {
  service_name: string;
  service_description: string;
  duration_minutes: number;
  price: number;
  category: string;
}

function parseMenuText(menuText: string): ParsedService[] {
  const services: ParsedService[] = [];
  const lines = menuText.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const match = line.match(/^(.*?)\s*-\s*(\d+)\s*min\s*-\s*\$(\d+)/i);
    if (match) {
      const [, name, duration, price] = match;
      services.push({
        service_name: name.trim(),
        service_description: name.trim(),
        duration_minutes: parseInt(duration),
        price: parseFloat(price),
        category: inferCategory(name.trim())
      });
    }
  }

  return services;
}

function inferCategory(serviceName: string): string {
  const name = serviceName.toLowerCase();

  if (name.includes('facial') || name.includes('face')) return 'FACIALS';
  if (name.includes('massage')) return 'MASSAGE THERAPY';
  if (name.includes('body wrap') || name.includes('wrap')) return 'BODY WRAPS / BODY TREATMENTS';
  if (name.includes('scrub') || name.includes('polish')) return 'BODY SCRUBS / POLISHES';
  if (name.includes('manicure') || name.includes('pedicure') || name.includes('hand') || name.includes('foot')) return 'HAND & FOOT TREATMENTS';
  if (name.includes('peel') || name.includes('laser') || name.includes('microneedling')) return 'MED-SPA TREATMENTS';

  return 'FACIALS';
}

export async function orchestratePlanGeneration(
  submissionId: string,
  menuText: string,
  _userId: string
): Promise<{ success: boolean; planOutputId?: string; error?: string }> {
  try {
    const services = parseMenuText(menuText);

    if (services.length === 0) {
      return {
        success: false,
        error: 'No services found in menu. Please use format: "Service Name - 60 min - $150"'
      };
    }

    const { data: submission, error: submissionError } = await supabase
      .from('plan_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();

    if (submissionError || !submission) {
      return { success: false, error: 'Submission not found' };
    }

    await supabase
      .from('plan_submissions')
      .update({
        submission_status: 'under_review',
        menu_uploaded: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    const { data: existingMenu } = await supabase
      .from('spa_menus')
      .select('id')
      .eq('plan_submission_id', submissionId)
      .maybeSingle();

    let menuId: string;

    if (existingMenu) {
      menuId = existingMenu.id;

      await supabase
        .from('spa_menu_services')
        .delete()
        .eq('spa_menu_id', menuId);

      await supabase
        .from('spa_menus')
        .update({
          raw_menu_text: menuText,
          total_services_count: services.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', menuId);
    } else {
      const { data: newMenu, error: newMenuError } = await supabase
        .from('spa_menus')
        .insert({
          plan_submission_id: submissionId,
          spa_name: submission.spa_name,
          raw_menu_text: menuText,
          total_services_count: services.length,
          facials_count: services.filter(s => s.category === 'FACIALS').length,
          massage_count: services.filter(s => s.category === 'MASSAGE THERAPY').length,
          body_count: services.filter(s => ['BODY WRAPS / BODY TREATMENTS', 'BODY SCRUBS / POLISHES'].includes(s.category)).length,
          handfeet_count: services.filter(s => s.category === 'HAND & FOOT TREATMENTS').length,
          medspa_count: services.filter(s => s.category === 'MED-SPA TREATMENTS').length
        })
        .select()
        .single();

      if (newMenuError || !newMenu) {
        return { success: false, error: 'Failed to create menu record' };
      }
      menuId = newMenu.id;
    }

    const serviceInserts = services.map((service, index) => ({
      spa_menu_id: menuId,
      service_name: service.service_name,
      service_description: service.service_description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      category: service.category,
      display_order: index + 1
    }));

    const { error: servicesError } = await supabase
      .from('spa_menu_services')
      .insert(serviceInserts);

    if (servicesError) {
      console.error('Error inserting services:', servicesError);
      return { success: false, error: 'Failed to save services' };
    }

    await supabase
      .from('plan_submissions')
      .update({
        spa_menu_id: menuId,
        menu_uploaded: true
      })
      .eq('id', submissionId);

    const mappingResults = await performServiceMapping(menuId);

    await supabase
      .from('protocol_mappings')
      .delete()
      .eq('spa_menu_id', menuId);

    for (const mapping of mappingResults) {
      await supabase
        .from('protocol_mappings')
        .insert({
          spa_menu_id: menuId,
          spa_service_name: mapping.serviceName,
          solution_type: mapping.solutionType,
          solution_reference: mapping.solutionReference,
          match_type: mapping.matchType,
          confidence_level: mapping.confidence,
          rationale: mapping.rationale
        });
    }

    const gapAnalysis = await performGapAnalysis(
      menuId,
      submission.spa_type || 'spa'
    );

    await supabase
      .from('service_gaps')
      .delete()
      .eq('spa_menu_id', menuId);

    for (const gap of gapAnalysis) {
      await supabase
        .from('service_gaps')
        .insert({
          spa_menu_id: menuId,
          gap_type: gap.gap_type,
          gap_category: gap.gap_category,
          gap_description: gap.gap_description,
          priority_level: gap.priority_level,
          recommended_protocol_id: gap.recommended_protocol_id,
          rationale: gap.rationale
        });
    }

    await generateAllRetailAttachForMenu(menuId);

    const { data: retailRecommendationsData } = await supabase
      .from('retail_attach_recommendations')
      .select('*')
      .eq('spa_menu_id', menuId)
      .limit(20);

    const retailRecommendations = (retailRecommendationsData || []).map(rec => ({
      serviceName: rec.service_name || 'General',
      productSKU: rec.product_sku || '',
      productName: rec.product_name || 'Product',
      rationale: rec.recommendation_rationale || '',
      strategy: rec.attachment_strategy || 'Cross-sell',
      estimatedAttachRate: rec.estimated_attach_rate || 0.3
    }));

    const { data: proProducts } = await supabase
      .from('pro_products')
      .select('*')
      .eq('status', 'Active')
      .limit(10);

    const openingOrder = (proProducts || []).map((product, index) => ({
      productName: product.product_name,
      productSKU: product.sku,
      quantity: 2 + index,
      unitPrice: product.pro_price || 0,
      totalCost: (product.pro_price || 0) * (2 + index)
    }));

    // Live signal enrichment — query market_signals for context
    const serviceCategories = [...new Set(services.map((s) => s.category))];
    let signalEnrichment: SignalEnrichment | null = null;
    try {
      signalEnrichment = await fetchSignalsForServiceCategories(serviceCategories);
      planLog.info('Signals fetched for plan', {
        signalCount: signalEnrichment.signalCount,
      });
    } catch {
      planLog.warn('Signal enrichment failed — continuing without signals');
    }

    const { data: planOutput, error: planOutputError } = await supabase
      .from('plan_outputs')
      .insert({
        plan_submission_id: submissionId,
        output_type: 'full_implementation_plan',
        output_format: 'json',
        output_data: {
          summary: {
            totalServices: services.length,
            mappedServices: mappingResults.length,
            identifiedGaps: gapAnalysis.length,
            retailOpportunities: retailRecommendations.length,
            openingOrderTotal: openingOrder.reduce((sum, item) => sum + (item.totalCost || 0), 0)
          },
          services,
          mappings: mappingResults,
          gaps: gapAnalysis,
          retailRecommendations,
          openingOrder,
          signalEnrichment,
        }
      })
      .select()
      .single();

    if (planOutputError || !planOutput) {
      console.error('Error creating plan output:', planOutputError);
      return { success: false, error: 'Failed to save plan output' };
    }

    await supabase
      .from('plan_submissions')
      .update({
        submission_status: 'completed',
        analysis_completed: true,
        plan_generated: true,
        plan_output_id: planOutput.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    return { success: true, planOutputId: planOutput.id };

  } catch (error) {
    console.error('Orchestration error:', error);

    await supabase
      .from('plan_submissions')
      .update({
        submission_status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Guarded plan orchestration — validates input through guardrails,
 * checks credit balance, executes orchestration, deducts credits.
 */
export async function orchestrateGuardedPlanGeneration(
  submissionId: string,
  menuText: string,
  userId: string,
): Promise<GuardrailResult<{ success: boolean; planOutputId?: string; error?: string }>> {
  // 1. Guardrail input check
  const inputCheck = validateInput(menuText, 'planOrchestrator');
  if (!inputCheck.valid) {
    return blockedResult('planOrchestrator', inputCheck.blockReason ?? 'Invalid input.');
  }

  // 2. Credit gate + execution
  const result = await withCreditGate(userId, 'planOrchestrator', async () => {
    return orchestratePlanGeneration(submissionId, menuText, userId);
  });

  // 3. Wrap output with guardrail metadata
  return validateOutput(result, 'planOrchestrator', [
    'canonical_protocols',
    'spa_menus',
    'pro_products',
    'retail_products',
    'market_signals',
  ]);
}
