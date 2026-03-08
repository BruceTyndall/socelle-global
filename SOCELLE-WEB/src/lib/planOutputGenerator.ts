import { supabase } from './supabase';
import { generateBrandNarrative } from './brandDifferentiationEngine';
import { validateInput, validateOutput, blockedResult, type GuardrailResult } from './analysis/guardrails';
import { withCreditGate } from './analysis/creditGate';
import { createScopedLogger } from './logger';

const planOutputLog = createScopedLogger('PlanOutputGenerator');

interface PlanGenerationInput {
  spaLeadId: string;
  spaMenuId: string;
  rolloutPlanId: string;
  includePricing?: boolean;
  customNotes?: string;
}

export async function generateSalesReadyPlan(input: PlanGenerationInput): Promise<string | null> {
  const { spaLeadId, spaMenuId, rolloutPlanId, includePricing = false } = input;

  const { data: lead } = await supabase
    .from('spa_leads')
    .select('*')
    .eq('id', spaLeadId)
    .single();

  if (!lead) return null;

  const { data: menu } = await supabase
    .from('spa_menus')
    .select('*')
    .eq('id', spaMenuId)
    .single();

  if (!menu) return null;

  const executiveSummary = await generateExecutiveSummary(lead, menu, spaMenuId);
  const menuValidation = await generateMenuValidationSection(spaMenuId);
  const growthOpportunities = await generateGrowthOpportunitiesSection(spaMenuId);
  const implementationRoadmap = await generateImplementationRoadmapSection(rolloutPlanId);
  const openingOrder = await generateOpeningOrderSection(rolloutPlanId);
  const brandDifferentiation = await generateBrandDifferentiationSection(lead.spa_type, rolloutPlanId);
  const dataAssumptions = await generateDataAssumptionsSection(spaMenuId, rolloutPlanId);

  const shareableToken = generateShareableToken();

  const { data: planOutput, error } = await supabase
    .from('plan_outputs')
    .insert({
      spa_lead_id: spaLeadId,
      spa_menu_id: spaMenuId,
      rollout_plan_id: rolloutPlanId,
      plan_title: `${lead.spa_name} - Implementation Plan`,
      plan_version: 1,
      plan_status: 'draft',
      executive_summary: executiveSummary,
      menu_validation_section: menuValidation,
      growth_opportunities_section: growthOpportunities,
      implementation_roadmap_section: implementationRoadmap,
      opening_order_section: openingOrder,
      brand_differentiation_section: brandDifferentiation,
      data_assumptions_section: dataAssumptions,
      shareable_link_token: shareableToken,
      shareable_link_active: false,
      include_pricing: includePricing,
      generation_trace: {
        generated_at: new Date().toISOString(),
        spa_lead_id: spaLeadId,
        spa_menu_id: spaMenuId,
        rollout_plan_id: rolloutPlanId,
        sections_generated: [
          'executive_summary',
          'menu_validation',
          'growth_opportunities',
          'implementation_roadmap',
          'opening_order',
          'brand_differentiation',
          'data_assumptions'
        ]
      }
    })
    .select()
    .single();

  if (error || !planOutput) {
    console.error('Error creating plan output:', error);
    return null;
  }

  await supabase
    .from('spa_leads')
    .update({
      current_plan_id: planOutput.id,
      plan_generated: true,
      lead_status: 'proposal_sent'
    })
    .eq('id', spaLeadId);

  await supabase
    .from('lead_activities')
    .insert({
      spa_lead_id: spaLeadId,
      activity_type: 'proposal_sent',
      activity_title: 'Implementation Plan Generated',
      activity_description: `Plan version 1 created with ${Object.keys(executiveSummary).length} sections`,
      created_by: 'system',
      related_plan_id: planOutput.id
    });

  return planOutput.id;
}

async function generateExecutiveSummary(lead: any, _menu: any, spaMenuId: string): Promise<any> {
  const { data: mappings } = await supabase
    .from('spa_service_mapping')
    .select('*, canonical_protocols(protocol_name)')
    .eq('spa_menu_id', spaMenuId);

  const { data: gaps } = await supabase
    .from('service_gap_analysis')
    .select('*')
    .eq('spa_menu_id', spaMenuId)
    .eq('admin_approved', true);

  const totalServices = mappings?.length || 0;
  const confirmedMappings = mappings?.filter(m => m.confidence_level === 'High').length || 0;
  const totalGaps = gaps?.length || 0;

  const currentRevenue = mappings?.reduce((sum: number, m: any) =>
    sum + (m.estimated_monthly_revenue || 0), 0) || 0;

  const gapRevenue = gaps?.reduce((sum: number, g: any) =>
    sum + (g.estimated_monthly_revenue || 0), 0) || 0;

  return {
    spa_name: lead.spa_name,
    spa_type: lead.spa_type,
    location: lead.location,
    current_state: {
      total_services: totalServices,
      confirmed_protocols: confirmedMappings,
      working_well: confirmedMappings >= totalServices * 0.7
        ? 'Strong protocol alignment with existing menu'
        : 'Good foundation with opportunity for optimization',
      estimated_current_revenue: currentRevenue
    },
    growth_opportunity: {
      recommended_additions: totalGaps,
      estimated_additional_revenue: gapRevenue,
      growth_potential_percent: currentRevenue > 0
        ? Math.round((gapRevenue / currentRevenue) * 100)
        : 0
    },
    key_highlights: [
      `${confirmedMappings} services validated with high confidence`,
      `${totalGaps} strategic growth opportunities identified`,
      gapRevenue > 0 ? `$${Math.round(gapRevenue).toLocaleString()} monthly revenue potential` : null,
      'Phased 90-day rollout minimizes operational risk'
    ].filter(Boolean),
    generated_at: new Date().toISOString()
  };
}

async function generateMenuValidationSection(spaMenuId: string): Promise<any> {
  const { data: mappings } = await supabase
    .from('spa_service_mapping')
    .select(`
      *,
      canonical_protocols(protocol_name, category)
    `)
    .eq('spa_menu_id', spaMenuId)
    .order('confidence_level', { ascending: false });

  const grouped = (mappings || []).reduce((acc: any, mapping: any) => {
    const level = mapping.confidence_level || 'Unknown';
    if (!acc[level]) acc[level] = [];
    acc[level].push({
      service_name: mapping.service_name,
      protocol_name: mapping.canonical_protocols?.protocol_name,
      category: mapping.canonical_protocols?.category,
      price: mapping.service_price,
      explanation: mapping.mapping_explanation
    });
    return acc;
  }, {});

  return {
    total_services: mappings?.length || 0,
    confidence_breakdown: {
      high: grouped.High?.length || 0,
      medium: grouped.Medium?.length || 0,
      low: grouped.Low?.length || 0
    },
    services_by_confidence: grouped,
    validation_summary: `${grouped.High?.length || 0} services validated with high confidence. ${
      grouped.Medium?.length || 0
    } services require review. System has mapped your existing offerings to Naturopathica's clinical protocols.`
  };
}

async function generateGrowthOpportunitiesSection(spaMenuId: string): Promise<any> {
  const { data: gaps } = await supabase
    .from('service_gap_analysis')
    .select(`
      *,
      canonical_protocols(protocol_name, category, typical_duration)
    `)
    .eq('spa_menu_id', spaMenuId)
    .eq('admin_approved', true)
    .order('priority_score', { ascending: false });

  const { data: seasonal } = await supabase
    .from('marketing_calendar')
    .select('*')
    .eq('year', 2026)
    .gte('month', new Date().getMonth() + 1)
    .order('month')
    .limit(3);

  const seasonalThemes = seasonal?.map(s => s.theme).join(', ') || 'Year-round relevance';

  return {
    total_opportunities: gaps?.length || 0,
    estimated_revenue_impact: gaps?.reduce((sum: number, g: any) =>
      sum + (g.estimated_monthly_revenue || 0), 0) || 0,
    recommended_services: gaps?.map((gap: any) => ({
      protocol_name: gap.canonical_protocols?.protocol_name,
      category: gap.canonical_protocols?.category,
      why_recommend: gap.gap_description,
      seasonal_alignment: gap.seasonal_alignment,
      estimated_revenue: gap.estimated_monthly_revenue,
      priority: gap.priority_score >= 80 ? 'High' : gap.priority_score >= 60 ? 'Medium' : 'Standard'
    })) || [],
    seasonal_context: seasonalThemes,
    why_now: `Upcoming themes (${seasonalThemes}) create natural marketing momentum for service launches.`
  };
}

async function generateImplementationRoadmapSection(rolloutPlanId: string): Promise<any> {
  const { data: plan } = await supabase
    .from('phased_rollout_plans')
    .select('*')
    .eq('id', rolloutPlanId)
    .single();

  const { data: items } = await supabase
    .from('rollout_plan_items')
    .select('*')
    .eq('rollout_plan_id', rolloutPlanId)
    .order('phase_number, sort_order');

  const phases = [1, 2, 3].map(phaseNum => {
    const phaseItems = items?.filter(i => i.phase_number === phaseNum) || [];
    return {
      phase_number: phaseNum,
      phase_name: phaseItems[0]?.phase_name || `Phase ${phaseNum}`,
      services: phaseItems.map(item => ({
        name: item.service_name,
        protocol: item.protocol_name,
        rationale: item.phase_rationale,
        training_hours: item.training_hours,
        risk_score: item.risk_score
      })),
      total_training_hours: phaseItems.reduce((sum, i) => sum + (i.training_hours || 0), 0),
      avg_risk: phaseItems.length > 0
        ? Math.round(phaseItems.reduce((sum, i) => sum + (i.risk_score || 0), 0) / phaseItems.length)
        : 0
    };
  }).filter(p => p.services.length > 0);

  return {
    total_phases: phases.length,
    total_training_hours: plan?.total_training_hours || 0,
    avg_risk_score: Math.round(plan?.avg_risk_score || 0),
    phases: phases,
    risk_management_approach: 'Services are sequenced by complexity. Phase 1 builds confidence with low-risk offerings. Phase 2 expands the menu. Phase 3 introduces advanced protocols.',
    training_support: 'Virtual and live training available. Certification programs for advanced protocols.'
  };
}

async function generateOpeningOrderSection(rolloutPlanId: string): Promise<any> {
  const { data: order } = await supabase
    .from('opening_orders')
    .select('*')
    .eq('rollout_plan_id', rolloutPlanId)
    .single();

  if (!order) {
    return {
      backbar_products: [],
      retail_products: [],
      checklists: {},
      note: 'Opening order will be finalized after service selection confirmation'
    };
  }

  return {
    backbar_products: order.backbar_products || [],
    retail_products: order.retail_products || [],
    estimated_investment: {
      backbar: order.estimated_backbar_investment,
      retail: order.estimated_retail_investment,
      total: order.total_estimated_investment
    },
    seasonal_launch: {
      recommended_window: order.recommended_launch_window,
      rationale: order.seasonal_rationale
    },
    checklists: {
      setup: order.setup_checklist || [],
      training: order.training_checklist || [],
      launch: order.launch_checklist || []
    }
  };
}

async function generateBrandDifferentiationSection(spaType: string, rolloutPlanId: string): Promise<any> {
  const narrative = await generateBrandNarrative(
    spaType as 'medspa' | 'spa' | 'hybrid',
    rolloutPlanId
  );

  return {
    headline: 'Why Partner with Naturopathica',
    introduction: narrative.introduction,
    talking_points: narrative.talking_points,
    plan_highlights: narrative.plan_specific_highlights,
    source_verification: 'All claims grounded in protocol design, safety features, and system capabilities'
  };
}

async function generateDataAssumptionsSection(spaMenuId: string, _rolloutPlanId: string): Promise<any> {
  const { data: readiness } = await supabase
    .from('implementation_readiness')
    .select('missing_data_flags')
    .eq('spa_menu_id', spaMenuId);

  const allMissingFlags = readiness?.flatMap(r => r.missing_data_flags || []) || [];
  const uniqueMissingFlags = [...new Set(allMissingFlags)];

  return {
    data_sources: [
      'Spa menu analysis and service mapping',
      'Naturopathica canonical protocol library',
      'Product catalog (backbar and retail)',
      'Marketing calendar and seasonal strategy',
      'Implementation readiness scoring',
      'Business rules and revenue models'
    ],
    confidence_level: uniqueMissingFlags.length === 0 ? 'High' :
                      uniqueMissingFlags.length <= 3 ? 'Medium' : 'Moderate',
    missing_data: uniqueMissingFlags.length > 0 ? uniqueMissingFlags : null,
    estimation_approach: 'All revenue estimates based on published price points and industry-standard utilization assumptions. No quantities estimated without explicit inputs.',
    assumptions: [
      'Service pricing reflects spa-provided menu data',
      'Utilization rates based on industry benchmarks for similar spa types',
      'Training hours reflect protocol complexity and certification requirements',
      'Implementation risk scores calculated deterministically from protocol metadata'
    ]
  };
}

function generateShareableToken(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function activateShareableLink(planId: string): Promise<string | null> {
  const { data } = await supabase
    .from('plan_outputs')
    .update({ shareable_link_active: true })
    .eq('id', planId)
    .select('shareable_link_token')
    .single();

  return data?.shareable_link_token || null;
}

export async function getPlanByToken(token: string): Promise<any> {
  const { data } = await supabase
    .from('plan_outputs')
    .select(`
      *,
      spa_leads(spa_name, location, spa_type),
      spa_menus(spa_name)
    `)
    .eq('shareable_link_token', token)
    .eq('shareable_link_active', true)
    .single();

  return data;
}

// ── Guarded Plan Output Generation ───────────────────────────────────────────

/**
 * Guarded plan output generation — validates input, checks credits,
 * generates plan, wraps output with guardrail metadata.
 */
export async function generateGuardedSalesReadyPlan(
  input: PlanGenerationInput,
  userId: string,
): Promise<GuardrailResult<{ planId: string | null }>> {
  // Guardrail input check (use IDs as proxy — no raw text to check here)
  const inputText = `${input.spaLeadId} ${input.spaMenuId} ${input.customNotes ?? ''}`;
  const inputCheck = validateInput(inputText, 'planOutputGenerator');
  if (!inputCheck.valid && inputCheck.blocked) {
    return blockedResult(
      'planOutputGenerator',
      inputCheck.blockReason ?? 'Input blocked by safety guardrails.',
    );
  }

  // Credit gate + execution
  const planId = await withCreditGate(userId, 'planOutputGenerator', async () => {
    return generateSalesReadyPlan(input);
  });

  planOutputLog.info('Guarded plan output generated', { planId });

  // Wrap output
  return validateOutput({ planId }, 'planOutputGenerator', [
    'spa_leads',
    'spa_menus',
    'spa_service_mapping',
    'service_gap_analysis',
    'phased_rollout_plans',
    'canonical_protocols',
  ]);
}
