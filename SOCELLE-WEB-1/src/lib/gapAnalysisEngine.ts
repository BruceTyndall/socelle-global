import { supabase } from './supabase';


export interface GapAnalysis {
  gap_type: 'category_gap' | 'seasonal_gap' | 'treatment_type_gap' | 'signature_missing' | 'enhancement_missing';
  gap_category: string;
  gap_description: string;
  priority_level: 'High' | 'Medium' | 'Low';
  recommended_protocol_id: string | null;
  rationale: string;
  is_seasonal: boolean;
  seasonal_window: string | null;
  marketing_theme: string | null;
  estimated_revenue_impact: string | null;
  estimated_monthly_revenue: number | null;
  estimated_monthly_profit: number | null;
  impact_confidence: 'High' | 'Medium' | 'Low' | 'Unknown';
  impact_missing_data: string[];
  implementation_complexity: string;
  source_trace: any;
}

interface SpaCategories {
  [key: string]: number;
}

interface CanonicalInventory {
  [category: string]: Array<{
    id: string;
    protocol_name: string;
    category: string;
    target_concerns: string[];
    completion_status: string;
  }>;
}

interface CategoryBenchmark {
  category: string;
  min_service_count: number;
  priority_level: 'High' | 'Medium' | 'Low';
  notes: string;
}

async function getCategoryBenchmarks(spaType: 'medspa' | 'spa' | 'hybrid'): Promise<CategoryBenchmark[]> {
  const { data } = await supabase
    .from('service_category_benchmarks')
    .select('*')
    .eq('spa_type', spaType)
    .eq('is_active', true);

  return data || [];
}

async function getRevenueDefaults(spaType: 'medspa' | 'spa' | 'hybrid'): Promise<any> {
  const { data } = await supabase
    .from('revenue_model_defaults')
    .select('*')
    .eq('spa_type', spaType)
    .eq('is_active', true)
    .single();

  return data;
}

async function getCanonicalInventory(): Promise<CanonicalInventory> {
  const { data: protocols } = await supabase
    .from('canonical_protocols')
    .select('id, protocol_name, category, target_concerns, completion_status')
    .in('completion_status', ['steps_complete', 'fully_complete']);

  const inventory: CanonicalInventory = {};

  if (protocols) {
    for (const protocol of protocols) {
      const category = protocol.category.toUpperCase();
      if (!inventory[category]) {
        inventory[category] = [];
      }
      inventory[category].push(protocol);
    }
  }

  return inventory;
}

async function getCurrentSeasonalProtocols(): Promise<Array<{
  protocol_name: string;
  month_name: string;
  theme: string;
  canonical_protocol?: any;
}>> {
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const thirdMonth = nextMonth === 12 ? 1 : nextMonth + 1;

  const { data: marketingData } = await supabase
    .from('marketing_calendar')
    .select('month_name, theme, featured_protocols')
    .eq('year', 2026)
    .in('month', [currentMonth, nextMonth, thirdMonth]);

  const { data: canonicalProtocols } = await supabase
    .from('canonical_protocols')
    .select('*')
    .in('completion_status', ['steps_complete', 'fully_complete']);

  const seasonalProtocols: Array<{
    protocol_name: string;
    month_name: string;
    theme: string;
    canonical_protocol?: any;
  }> = [];

  if (marketingData && canonicalProtocols) {
    for (const month of marketingData) {
      for (const featuredName of month.featured_protocols) {
        const matchingProtocol = canonicalProtocols.find(p =>
          p.protocol_name.toLowerCase().includes(featuredName.toLowerCase()) ||
          featuredName.toLowerCase().includes(p.protocol_name.toLowerCase())
        );

        seasonalProtocols.push({
          protocol_name: featuredName,
          month_name: month.month_name,
          theme: month.theme,
          canonical_protocol: matchingProtocol
        });
      }
    }
  }

  return seasonalProtocols;
}

function analyzeSpaCategories(serviceMappings: any[], benchmarks: CategoryBenchmark[]): SpaCategories {
  const categories: SpaCategories = {};

  for (const benchmark of benchmarks) {
    categories[benchmark.category] = 0;
  }

  for (const mapping of serviceMappings) {
    const category = (mapping.service_category || '').toUpperCase();
    const name = (mapping.service_name || '').toLowerCase();

    if (category.includes('FACIAL') || name.includes('facial')) {
      categories['FACIALS'] = (categories['FACIALS'] || 0) + 1;
    } else if (category.includes('BODY') || name.includes('body') || name.includes('wrap')) {
      categories['BODY'] = (categories['BODY'] || 0) + 1;
    } else if (category.includes('MASSAGE') || name.includes('massage')) {
      categories['MASSAGE'] = (categories['MASSAGE'] || 0) + 1;
    } else if (
      category.includes('ENHANCEMENT') ||
      category.includes('ADD-ON') ||
      name.includes('eye') ||
      name.includes('lip') ||
      name.includes('hand') ||
      name.includes('foot')
    ) {
      categories['ENHANCEMENTS'] = (categories['ENHANCEMENTS'] || 0) + 1;
    } else if (name.includes('oncology') || name.includes('cancer')) {
      categories['ONCOLOGY'] = (categories['ONCOLOGY'] || 0) + 1;
    }
  }

  return categories;
}

function getSpaTypeTreatmentFocus(spaType: 'medspa' | 'spa' | 'hybrid'): string[] {
  if (spaType === 'medspa') {
    return ['results-driven', 'clinical', 'anti-aging', 'acne', 'pigmentation', 'resurfacing'];
  } else if (spaType === 'spa') {
    return ['relaxation', 'wellness', 'ritual', 'aromatherapy', 'hydration', 'soothing'];
  } else {
    return ['results-driven', 'wellness', 'clinical', 'relaxation', 'anti-aging'];
  }
}

function calculateRevenueEstimate(
  servicePrice: number | null,
  utilizationRate: number | null,
  protocolCogs: number | null
): {
  revenue: number | null;
  profit: number | null;
  confidence: 'High' | 'Medium' | 'Low' | 'Unknown';
  missingData: string[];
} {
  const missingData: string[] = [];

  if (!servicePrice) missingData.push('service_price');
  if (!utilizationRate) missingData.push('utilization_rate');
  if (!protocolCogs) missingData.push('protocol_cogs');

  if (!servicePrice || !utilizationRate) {
    return {
      revenue: null,
      profit: null,
      confidence: 'Unknown',
      missingData
    };
  }

  const revenue = servicePrice * utilizationRate;
  const profit = protocolCogs ? revenue - (protocolCogs * utilizationRate) : null;

  let confidence: 'High' | 'Medium' | 'Low' = 'Medium';
  if (missingData.length === 0) {
    confidence = 'High';
  } else if (missingData.length >= 2) {
    confidence = 'Low';
  }

  return {
    revenue,
    profit,
    confidence,
    missingData
  };
}

export async function performGapAnalysis(
  spaMenuId: string,
  spaType: 'medspa' | 'spa' | 'hybrid' = 'spa'
): Promise<GapAnalysis[]> {
  const gaps: GapAnalysis[] = [];

  const { data: serviceMappings } = await supabase
    .from('spa_service_mapping')
    .select('*')
    .eq('spa_menu_id', spaMenuId);

  if (!serviceMappings || serviceMappings.length === 0) {
    return gaps;
  }

  const benchmarks = await getCategoryBenchmarks(spaType);
  const revenueDefaults = await getRevenueDefaults(spaType);
  const canonicalInventory = await getCanonicalInventory();
  const seasonalProtocols = await getCurrentSeasonalProtocols();
  const treatmentFocus = getSpaTypeTreatmentFocus(spaType);

  if (benchmarks.length === 0) {
    console.warn(`No benchmarks configured for spa type: ${spaType}. Category gap analysis disabled.`);
  }

  const spaCategories = analyzeSpaCategories(serviceMappings, benchmarks);

  for (const benchmark of benchmarks) {
    const count = spaCategories[benchmark.category] || 0;

    if (count < benchmark.min_service_count) {
      const availableProtocols = canonicalInventory[benchmark.category] || [];

      const existingMappedProtocolIds = serviceMappings
        .filter(m => m.canonical_protocol_id)
        .map(m => m.canonical_protocol_id);

      const unmappedProtocols = availableProtocols.filter(
        p => !existingMappedProtocolIds.includes(p.id)
      );

      if (unmappedProtocols.length > 0) {
        let recommendedProtocol = unmappedProtocols[0];

        for (const protocol of unmappedProtocols) {
          const matchesFocus = treatmentFocus.some(focus =>
            protocol.protocol_name.toLowerCase().includes(focus) ||
            protocol.target_concerns.some(c => c.toLowerCase().includes(focus))
          );

          if (matchesFocus) {
            recommendedProtocol = protocol;
            break;
          }
        }

        const { data: protocolCosting } = await supabase
          .from('protocol_costing')
          .select('estimated_cogs')
          .eq('canonical_protocol_id', recommendedProtocol.id)
          .single();

        const avgServicePrice = serviceMappings
          .filter(m => m.service_price)
          .reduce((sum, m, _, arr) => sum + (m.service_price / arr.length), 0) || null;

        const utilization = revenueDefaults?.default_utilization_per_month || null;
        const cogs = protocolCosting?.estimated_cogs || null;

        const revenueEstimate = calculateRevenueEstimate(avgServicePrice, utilization, cogs);

        const sourceTrace = {
          benchmark_used: `${spaType}/${benchmark.category}`,
          min_service_count: benchmark.min_service_count,
          current_count: count,
          treatment_focus: treatmentFocus,
          revenue_model_source: revenueDefaults ? 'revenue_model_defaults' : 'none',
          protocol_costing_source: cogs ? 'protocol_costing' : 'none'
        };

        let rationale = `Benchmark: ${benchmark.notes || `Minimum ${benchmark.min_service_count} services recommended`}. `;
        rationale += `Current menu has ${count} ${benchmark.category} service(s). `;
        rationale += `Recommend adding "${recommendedProtocol.protocol_name}" to meet ${spaType} standards.`;

        gaps.push({
          gap_type: 'category_gap',
          gap_category: benchmark.category,
          gap_description: `Only ${count} ${benchmark.category.toLowerCase()} service(s). Benchmark: ${benchmark.min_service_count}+`,
          priority_level: benchmark.priority_level,
          recommended_protocol_id: recommendedProtocol.id,
          rationale,
          is_seasonal: false,
          seasonal_window: null,
          marketing_theme: null,
          estimated_revenue_impact: revenueEstimate.revenue
            ? `~$${Math.round(revenueEstimate.revenue).toLocaleString()}/month`
            : null,
          estimated_monthly_revenue: revenueEstimate.revenue,
          estimated_monthly_profit: revenueEstimate.profit,
          impact_confidence: revenueEstimate.confidence,
          impact_missing_data: revenueEstimate.missingData,
          implementation_complexity: 'Low - Protocol fully documented',
          source_trace: sourceTrace
        });
      }
    }
  }

  const spaServiceNames = serviceMappings.map(m => m.service_name.toLowerCase());

  for (const seasonal of seasonalProtocols) {
    if (!seasonal.canonical_protocol) continue;

    const alreadyOffered = spaServiceNames.some(name =>
      name.includes(seasonal.protocol_name.toLowerCase()) ||
      seasonal.protocol_name.toLowerCase().includes(name)
    );

    if (!alreadyOffered) {
      const isHighPriority = seasonal.month_name === new Date().toLocaleString('default', { month: 'long' });

      const { data: protocolCosting } = await supabase
        .from('protocol_costing')
        .select('estimated_cogs')
        .eq('canonical_protocol_id', seasonal.canonical_protocol.id)
        .single();

      const avgServicePrice = serviceMappings
        .filter(m => m.service_price)
        .reduce((sum, m, _, arr) => sum + (m.service_price / arr.length), 0) || null;

      const utilization = revenueDefaults?.default_utilization_per_month ? revenueDefaults.default_utilization_per_month * 0.5 : null;
      const cogs = protocolCosting?.estimated_cogs || null;

      const revenueEstimate = calculateRevenueEstimate(avgServicePrice, utilization, cogs);

      const sourceTrace = {
        marketing_calendar_month: seasonal.month_name,
        marketing_theme: seasonal.theme,
        featured_protocol: seasonal.protocol_name,
        revenue_model_source: revenueDefaults ? 'revenue_model_defaults' : 'none',
        seasonal_adjustment: 'utilization × 0.5 (partial month)'
      };

      gaps.push({
        gap_type: 'seasonal_gap',
        gap_category: seasonal.canonical_protocol.category,
        gap_description: `Missing seasonal protocol: "${seasonal.protocol_name}"`,
        priority_level: isHighPriority ? 'High' : 'Medium',
        recommended_protocol_id: seasonal.canonical_protocol.id,
        rationale: `"${seasonal.canonical_protocol.protocol_name}" is featured in ${seasonal.month_name} marketing calendar under theme: "${seasonal.theme}". Aligning menu with seasonal promotions drives bookings.`,
        is_seasonal: true,
        seasonal_window: seasonal.month_name,
        marketing_theme: seasonal.theme,
        estimated_revenue_impact: revenueEstimate.revenue
          ? `~$${Math.round(revenueEstimate.revenue).toLocaleString()} (${seasonal.month_name})`
          : null,
        estimated_monthly_revenue: revenueEstimate.revenue,
        estimated_monthly_profit: revenueEstimate.profit,
        impact_confidence: revenueEstimate.confidence,
        impact_missing_data: revenueEstimate.missingData,
        implementation_complexity: 'Low - Seasonal timing planned',
        source_trace: sourceTrace
      });
    }
  }

  const hasSignatureFacial = serviceMappings.some(m =>
    m.service_name.toLowerCase().includes('signature') &&
    (m.service_category || '').toLowerCase().includes('facial')
  );

  const facialCount = spaCategories['FACIALS'] || 0;

  if (!hasSignatureFacial && facialCount > 0) {
    const facialProtocols = canonicalInventory['FACIALS'] || [];
    const signatureCandidate = facialProtocols.find(p =>
      p.protocol_name.toLowerCase().includes('signature') ||
      p.protocol_name.toLowerCase().includes('pure results')
    );

    if (signatureCandidate) {
      const { data: protocolCosting } = await supabase
        .from('protocol_costing')
        .select('estimated_cogs')
        .eq('canonical_protocol_id', signatureCandidate.id)
        .single();

      const avgServicePrice = serviceMappings
        .filter(m => m.service_price)
        .reduce((sum, m, _, arr) => sum + (m.service_price / arr.length), 0) || null;

      const utilization = revenueDefaults?.default_utilization_per_month || null;
      const cogs = protocolCosting?.estimated_cogs || null;

      const revenueEstimate = calculateRevenueEstimate(avgServicePrice, utilization, cogs);

      const sourceTrace = {
        gap_type: 'signature_missing',
        analysis: 'No service name contains "signature" + facial category',
        revenue_model_source: revenueDefaults ? 'revenue_model_defaults' : 'none'
      };

      gaps.push({
        gap_type: 'signature_missing',
        gap_category: 'FACIALS',
        gap_description: 'No signature facial identified',
        priority_level: 'High',
        recommended_protocol_id: signatureCandidate.id,
        rationale: `Every spa needs a signature treatment. "${signatureCandidate.protocol_name}" can serve as your flagship facial, representing your brand's approach.`,
        is_seasonal: false,
        seasonal_window: null,
        marketing_theme: null,
        estimated_revenue_impact: revenueEstimate.revenue
          ? `~$${Math.round(revenueEstimate.revenue).toLocaleString()}/month`
          : null,
        estimated_monthly_revenue: revenueEstimate.revenue,
        estimated_monthly_profit: revenueEstimate.profit,
        impact_confidence: revenueEstimate.confidence,
        impact_missing_data: revenueEstimate.missingData,
        implementation_complexity: 'Medium - Staff training required',
        source_trace: sourceTrace
      });
    }
  }

  const enhancementCount = spaCategories['ENHANCEMENTS'] || 0;
  if (enhancementCount < 2 && facialCount > 2) {
    const enhancementProtocols = [
      ...(canonicalInventory['ENHANCEMENTS'] || []),
      ...(canonicalInventory['EYE'] || []),
      ...(canonicalInventory['HAND'] || []),
      ...(canonicalInventory['FOOT'] || [])
    ];

    if (enhancementProtocols.length > 0) {
      const { data: protocolCosting } = await supabase
        .from('protocol_costing')
        .select('estimated_cogs')
        .eq('canonical_protocol_id', enhancementProtocols[0].id)
        .single();

      const attachRate = revenueDefaults?.default_attach_rate || null;
      const avgServicePrice = serviceMappings
        .filter(m => m.service_price)
        .reduce((sum, m, _, arr) => sum + (m.service_price / arr.length), 0) || null;

      const enhancementPrice = avgServicePrice ? avgServicePrice * 0.4 : null;
      const utilization = revenueDefaults?.default_utilization_per_month && attachRate
        ? Math.round(revenueDefaults.default_utilization_per_month * (attachRate / 100))
        : null;
      const cogs = protocolCosting?.estimated_cogs || null;

      const revenueEstimate = calculateRevenueEstimate(enhancementPrice, utilization, cogs);

      const sourceTrace = {
        gap_type: 'enhancement_missing',
        attach_rate_used: attachRate,
        price_assumption: 'avg_service_price × 0.4',
        revenue_model_source: revenueDefaults ? 'revenue_model_defaults' : 'none'
      };

      gaps.push({
        gap_type: 'enhancement_missing',
        gap_category: 'ENHANCEMENTS',
        gap_description: 'Limited enhancement services',
        priority_level: 'High',
        recommended_protocol_id: enhancementProtocols[0].id,
        rationale: `Enhancement services increase ticket size. "${enhancementProtocols[0].protocol_name}" can be added to any facial with minimal time and high margins.`,
        is_seasonal: false,
        seasonal_window: null,
        marketing_theme: null,
        estimated_revenue_impact: revenueEstimate.revenue
          ? `~$${Math.round(revenueEstimate.revenue).toLocaleString()}/month (incremental)`
          : null,
        estimated_monthly_revenue: revenueEstimate.revenue,
        estimated_monthly_profit: revenueEstimate.profit,
        impact_confidence: revenueEstimate.confidence,
        impact_missing_data: revenueEstimate.missingData,
        implementation_complexity: 'Low - Quick add-on',
        source_trace: sourceTrace
      });
    }
  }

  for (const gap of gaps) {
    await supabase.from('service_gap_analysis').insert({
      spa_menu_id: spaMenuId,
      gap_type: gap.gap_type,
      gap_category: gap.gap_category,
      gap_description: gap.gap_description,
      priority_level: gap.priority_level,
      recommended_protocol_id: gap.recommended_protocol_id,
      rationale: gap.rationale,
      is_seasonal: gap.is_seasonal,
      seasonal_window: gap.seasonal_window,
      marketing_theme: gap.marketing_theme,
      estimated_revenue_impact: gap.estimated_revenue_impact,
      estimated_monthly_revenue: gap.estimated_monthly_revenue,
      estimated_monthly_profit: gap.estimated_monthly_profit,
      impact_confidence: gap.impact_confidence,
      impact_missing_data: gap.impact_missing_data,
      implementation_complexity: gap.implementation_complexity,
      source_trace: gap.source_trace,
      status: 'identified'
    });
  }

  return gaps;
}

export async function getGapAnalysisSummary(spaMenuId: string): Promise<{
  total_gaps: number;
  by_priority: { high: number; medium: number; low: number };
  by_type: { [key: string]: number };
  seasonal_opportunities: number;
  estimated_total_revenue: number | null;
}> {
  const { data: gaps } = await supabase
    .from('service_gap_analysis')
    .select('*')
    .eq('spa_menu_id', spaMenuId);

  if (!gaps || gaps.length === 0) {
    return {
      total_gaps: 0,
      by_priority: { high: 0, medium: 0, low: 0 },
      by_type: {},
      seasonal_opportunities: 0,
      estimated_total_revenue: null
    };
  }

  const byPriority = {
    high: gaps.filter(g => g.priority_level === 'High').length,
    medium: gaps.filter(g => g.priority_level === 'Medium').length,
    low: gaps.filter(g => g.priority_level === 'Low').length
  };

  const byType: { [key: string]: number } = {};
  for (const gap of gaps) {
    byType[gap.gap_type] = (byType[gap.gap_type] || 0) + 1;
  }

  const totalRevenue = gaps
    .filter(g => g.estimated_monthly_revenue)
    .reduce((sum, g) => sum + (g.estimated_monthly_revenue || 0), 0);

  return {
    total_gaps: gaps.length,
    by_priority: byPriority,
    by_type: byType,
    seasonal_opportunities: gaps.filter(g => g.is_seasonal).length,
    estimated_total_revenue: totalRevenue > 0 ? totalRevenue : null
  };
}
