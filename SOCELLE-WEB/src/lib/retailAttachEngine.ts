import { supabase } from './supabase';
import { validateInput, validateOutput, blockedResult, type GuardrailResult } from './analysis/guardrails';
import { withCreditGate } from './analysis/creditGate';
import { fetchRelevantSignals, type SignalEnrichment } from './analysis/signalEnrichment';
import { createScopedLogger } from './logger';

const retailLog = createScopedLogger('RetailAttachEngine');

export interface RetailAttachRecommendation {
  retail_product_id: string;
  retail_product_name: string;
  rank: 1 | 2;
  confidence_score: number;
  rationale: string;
  matching_criteria: string[];
  missing_data_flags: string[];
  source_trace: any;
  is_seasonally_relevant: boolean;
  seasonal_rationale: string | null;
}

interface RetailProduct {
  id: string;
  product_name: string;
  category: string;
  target_concerns: string[];
  msrp: number;
  wholesale: number;
  status: string;
}

async function getRetailProducts(
  protocolCategory?: string,
  _protocolConcerns?: string[]
): Promise<RetailProduct[]> {
  let query = supabase
    .from('retail_products')
    .select('id, product_name, category, target_concerns, msrp, wholesale, status')
    .eq('status', 'Active');

  // Push category filter to DB when we have a protocol category
  if (protocolCategory) {
    const cat = protocolCategory.toLowerCase();
    // Broad match: products whose category contains the protocol's category keyword or vice versa
    query = query.or(
      `category.ilike.%${cat}%,category.ilike.%facial%,category.ilike.%body%,category.ilike.%serum%,category.ilike.%cleanser%`
    );
  }

  const { data } = await query.limit(100);
  return data || [];
}

async function getSeasonallyFeaturedProducts(): Promise<Map<string, string>> {
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const { data: marketingData } = await supabase
    .from('marketing_calendar')
    .select('month_name, featured_products')
    .eq('year', 2026)
    .in('month', [currentMonth, nextMonth]);

  const seasonalMap = new Map<string, string>();

  if (marketingData) {
    for (const month of marketingData) {
      for (const productName of month.featured_products || []) {
        seasonalMap.set(productName.toLowerCase(), month.month_name);
      }
    }
  }

  return seasonalMap;
}

function calculateProductScore(
  product: RetailProduct,
  protocolAllowedProducts: string[],
  protocolConcerns: string[],
  protocolCategory: string,
  seasonalMap: Map<string, string>
): {
  score: number;
  criteria: string[];
  rationale: string[];
  isSeasonal: boolean;
  seasonalReason: string | null;
} {
  const criteria: string[] = [];
  const rationale: string[] = [];
  let score = 0;
  let isSeasonal = false;
  let seasonalReason: string | null = null;

  const productNameLower = product.product_name.toLowerCase();

  if (protocolAllowedProducts.some(p => p.toLowerCase().includes(productNameLower) || productNameLower.includes(p.toLowerCase()))) {
    score += 50;
    criteria.push('protocol_allowed_products');
    rationale.push(`Listed in protocol allowed products`);
  }

  if (product.category && protocolCategory) {
    const prodCat = product.category.toLowerCase();
    const protoCat = protocolCategory.toLowerCase();

    if (prodCat === protoCat) {
      score += 25;
      criteria.push('exact_category_match');
      rationale.push(`Exact category match: ${product.category}`);
    } else if (
      (prodCat.includes('facial') && protoCat.includes('facial')) ||
      (prodCat.includes('body') && protoCat.includes('body')) ||
      (prodCat.includes('serum') && protoCat.includes('treatment')) ||
      (prodCat.includes('cleanser') && protoCat.includes('facial'))
    ) {
      score += 15;
      criteria.push('related_category_match');
      rationale.push(`Related category: ${product.category} ↔ ${protocolCategory}`);
    }
  }

  const concernMatches = product.target_concerns.filter(pc =>
    protocolConcerns.some(tc =>
      pc.toLowerCase().includes(tc.toLowerCase()) ||
      tc.toLowerCase().includes(pc.toLowerCase())
    )
  );

  if (concernMatches.length > 0) {
    const concernScore = Math.min(30, concernMatches.length * 10);
    score += concernScore;
    criteria.push('concern_overlap');
    rationale.push(`Addresses ${concernMatches.length} overlapping concern(s): ${concernMatches.slice(0, 2).join(', ')}`);
  }

  const seasonalMonth = seasonalMap.get(productNameLower);
  if (seasonalMonth) {
    score += 10;
    criteria.push('seasonal_match');
    rationale.push(`Featured in ${seasonalMonth} marketing calendar`);
    isSeasonal = true;
    seasonalReason = `Featured in ${seasonalMonth} marketing calendar`;
  }

  return {
    score,
    criteria,
    rationale,
    isSeasonal,
    seasonalReason
  };
}

export async function generateRetailAttachRecommendations(
  protocolId: string,
  protocolName: string,
  protocolCategory: string,
  protocolConcerns: string[],
  protocolAllowedProducts: string[]
): Promise<RetailAttachRecommendation[]> {
  const [retailProducts, seasonalMap, signalData] = await Promise.all([
    getRetailProducts(protocolCategory, protocolConcerns),
    getSeasonallyFeaturedProducts(),
    fetchRelevantSignals({ categories: [protocolCategory] }).catch(() => null),
  ]);

  if (signalData && signalData.signalCount > 0) {
    retailLog.info('Signals fetched for retail attach', {
      signalCount: signalData.signalCount,
      protocolCategory,
    });
  }

  if (retailProducts.length === 0) {
    return [];
  }

  const scoredProducts = retailProducts.map(product => {
    const scoring = calculateProductScore(
      product,
      protocolAllowedProducts,
      protocolConcerns,
      protocolCategory,
      seasonalMap
    );

    return {
      product,
      ...scoring
    };
  });

  scoredProducts.sort((a, b) => b.score - a.score);

  const recommendations: RetailAttachRecommendation[] = [];
  const missingData: string[] = [];

  if (protocolAllowedProducts.length === 0) {
    missingData.push('protocol_allowed_products');
  }
  if (protocolConcerns.length === 0) {
    missingData.push('protocol_target_concerns');
  }

  for (let i = 0; i < Math.min(2, scoredProducts.length); i++) {
    const scored = scoredProducts[i];

    if (scored.score === 0) {
      continue;
    }

    const sourceTrace = {
      protocol_id: protocolId,
      protocol_name: protocolName,
      protocol_category: protocolCategory,
      protocol_concerns: protocolConcerns,
      protocol_allowed_products: protocolAllowedProducts,
      matching_algorithm: 'deterministic_scoring',
      score_breakdown: {
        total: scored.score,
        from_allowed_products: scored.criteria.includes('protocol_allowed_products') ? 50 : 0,
        from_category: scored.criteria.includes('exact_category_match') ? 25 : scored.criteria.includes('related_category_match') ? 15 : 0,
        from_concerns: scored.criteria.includes('concern_overlap') ? (scored.score - 50 - 25 - 10) : 0,
        from_seasonal: scored.criteria.includes('seasonal_match') ? 10 : 0
      },
      seasonal_check_performed: true,
      current_month: new Date().toLocaleString('default', { month: 'long' })
    };

    recommendations.push({
      retail_product_id: scored.product.id,
      retail_product_name: scored.product.product_name,
      rank: (i + 1) as 1 | 2,
      confidence_score: Math.min(100, scored.score),
      rationale: scored.rationale.join('. '),
      matching_criteria: scored.criteria,
      missing_data_flags: missingData,
      source_trace: sourceTrace,
      is_seasonally_relevant: scored.isSeasonal,
      seasonal_rationale: scored.seasonalReason
    });
  }

  return recommendations;
}

export async function generateRetailAttachForServiceMapping(
  serviceMappingId: string,
  spaMenuId: string
): Promise<void> {
  const { data: mapping } = await supabase
    .from('spa_service_mapping')
    .select(`
      *,
      canonical_protocols (
        id,
        protocol_name,
        category,
        target_concerns,
        allowed_products,
        completion_status
      )
    `)
    .eq('id', serviceMappingId)
    .single();

  if (!mapping || !mapping.canonical_protocols) {
    return;
  }

  const protocol = mapping.canonical_protocols;

  if (!['steps_complete', 'fully_complete'].includes(protocol.completion_status)) {
    return;
  }

  const recommendations = await generateRetailAttachRecommendations(
    protocol.id,
    protocol.protocol_name,
    protocol.category,
    protocol.target_concerns || [],
    protocol.allowed_products || []
  );

  for (const rec of recommendations) {
    await supabase.from('retail_attach_recommendations').insert({
      spa_menu_id: spaMenuId,
      service_mapping_id: serviceMappingId,
      canonical_protocol_id: protocol.id,
      retail_product_id: rec.retail_product_id,
      rank: rec.rank,
      confidence_score: rec.confidence_score,
      rationale: rec.rationale,
      matching_criteria: rec.matching_criteria,
      missing_data_flags: rec.missing_data_flags,
      source_trace: rec.source_trace,
      is_seasonally_relevant: rec.is_seasonally_relevant,
      seasonal_rationale: rec.seasonal_rationale
    });
  }
}

export async function generateRetailAttachForGap(
  gapId: string,
  spaMenuId: string
): Promise<void> {
  const { data: gap } = await supabase
    .from('service_gap_analysis')
    .select(`
      *,
      canonical_protocols (
        id,
        protocol_name,
        category,
        target_concerns,
        allowed_products,
        completion_status
      )
    `)
    .eq('id', gapId)
    .single();

  if (!gap || !gap.canonical_protocols) {
    return;
  }

  const protocol = gap.canonical_protocols;

  if (!['steps_complete', 'fully_complete'].includes(protocol.completion_status)) {
    return;
  }

  const recommendations = await generateRetailAttachRecommendations(
    protocol.id,
    protocol.protocol_name,
    protocol.category,
    protocol.target_concerns || [],
    protocol.allowed_products || []
  );

  for (const rec of recommendations) {
    await supabase.from('retail_attach_recommendations').insert({
      spa_menu_id: spaMenuId,
      gap_id: gapId,
      canonical_protocol_id: protocol.id,
      retail_product_id: rec.retail_product_id,
      rank: rec.rank,
      confidence_score: rec.confidence_score,
      rationale: rec.rationale,
      matching_criteria: rec.matching_criteria,
      missing_data_flags: rec.missing_data_flags,
      source_trace: rec.source_trace,
      is_seasonally_relevant: rec.is_seasonally_relevant,
      seasonal_rationale: rec.seasonal_rationale
    });
  }
}

export async function generateAllRetailAttachForMenu(spaMenuId: string): Promise<void> {
  await supabase
    .from('retail_attach_recommendations')
    .delete()
    .eq('spa_menu_id', spaMenuId);

  const [{ data: mappings }, { data: gaps }] = await Promise.all([
    supabase
      .from('spa_service_mapping')
      .select('id')
      .eq('spa_menu_id', spaMenuId)
      .not('canonical_protocol_id', 'is', null),
    supabase
      .from('service_gap_analysis')
      .select('id')
      .eq('spa_menu_id', spaMenuId)
      .eq('admin_reviewed', true)
      .in('status', ['identified', 'approved'])
      .not('recommended_protocol_id', 'is', null),
  ]);

  if (mappings) {
    await Promise.all(
      mappings.map(mapping => generateRetailAttachForServiceMapping(mapping.id, spaMenuId))
    );
  }

  if (gaps) {
    await Promise.all(
      gaps.map(gap => generateRetailAttachForGap(gap.id, spaMenuId))
    );
  }
}

// ── Guarded Retail Attach ────────────────────────────────────────────────────

/**
 * Guarded retail attach generation — validates input, checks credits,
 * runs recommendations, wraps output with guardrail metadata.
 */
export async function generateGuardedRetailAttach(
  spaMenuId: string,
  userId: string,
): Promise<GuardrailResult<{ completed: boolean }>> {
  // Guardrail input check
  const inputCheck = validateInput(spaMenuId, 'retailAttachEngine');
  if (!inputCheck.valid) {
    return blockedResult('retailAttachEngine', inputCheck.blockReason ?? 'Invalid input.');
  }

  // Credit gate + execution
  await withCreditGate(userId, 'retailAttachEngine', async () => {
    await generateAllRetailAttachForMenu(spaMenuId);
    return { completed: true };
  });

  // Wrap output
  return validateOutput({ completed: true }, 'retailAttachEngine', [
    'retail_products',
    'spa_service_mapping',
    'service_gap_analysis',
    'marketing_calendar',
    'market_signals',
  ]);
}
