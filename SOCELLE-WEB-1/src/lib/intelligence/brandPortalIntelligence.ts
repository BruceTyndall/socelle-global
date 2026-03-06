// ── Brand Portal Intelligence — Mock Data Layer ────────────────────
// V1: returns mock data shaped for brand portal intelligence views
// V2: will query Supabase intelligence_signals + brand analytics tables
// DATA ACCESS RULE: brand-specific data + anonymized category data (no competitor names)

import type { IntelligenceSignal } from './types';
import { mockSignals } from './mockSignals';

// ── Types ──────────────────────────────────────────────────────────

export type TrendingStatus = 'trending' | 'stable' | 'declining';

export interface BrandMarketPosition {
  trendingStatus: TrendingStatus;
  categoryRanking: number;
  totalInCategory: number;
  adoptionRate: number;          // percentage
  categoryAvgAdoption: number;   // percentage
  categoryName: string;
  quarterOverQuarterGrowth: number; // percentage change
}

export interface KPICard {
  label: string;
  value: string;
  delta?: number;               // percentage change
  deltaLabel?: string;
  prefix?: string;
  suffix?: string;
}

export interface SKUPerformance {
  id: string;
  name: string;
  category: string;
  reorderRate: number;           // percentage
  unitsLast90d: number;
  revenueLast90d: number;
  velocity: 'active' | 'declining' | 'at_risk';
  trend: number;                 // percentage change
}

export interface BrandPerformanceMetrics {
  kpiCards: KPICard[];
  momentumScore: number;         // 0-100
  skuPerformance: SKUPerformance[];
  revenueTrend: number[];        // 12-month trend values
}

export type OperatorTier = 'Pro' | 'Premium' | 'Enterprise';

export interface OperatorData {
  id: string;
  name: string;
  tier: OperatorTier;
  region: string;
  ordersLast90d: number;
  revenueLast90d: number;
  status: 'active' | 'declining' | 'at_risk' | 'new';
  lastOrderDate: string;
  productsCarried: number;
}

export interface GrowthOpportunity {
  segment: string;
  description: string;
  potentialRevenue: string;
  operatorCount: number;
}

export interface ResellerIntelligence {
  totalOperators: number;
  activeOperators: number;
  operators: OperatorData[];
  geographicDistribution: { region: string; count: number; percentage: number }[];
  tierDistribution: { tier: OperatorTier; count: number; percentage: number }[];
  atRiskOperators: OperatorData[];
  growthOpportunities: GrowthOpportunity[];
}

export interface CategoryPosition {
  categoryName: string;
  rank: number;
  totalBrands: number;
  adoptionRate: number;
  categoryAvg: number;
  treatmentTrendImpact: string;
  competitivePosition: 'leader' | 'contender' | 'emerging' | 'niche';
  competitiveContext: string;    // anonymized positioning statement
}

export interface BrandCategoryPositionData {
  categories: CategoryPosition[];
  overallMarketPosition: string;
}

// ── Helper: deterministic "random" for consistent mock data ────────
function seededValue(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return Math.round(min + normalized * (max - min));
}

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

// ── getBrandMarketPosition ─────────────────────────────────────────

export function getBrandMarketPosition(brandSlug: string): BrandMarketPosition {
  const adoptionRate = seededValue(brandSlug + '-adopt', 14, 38);
  const categoryAvg = seededValue(brandSlug + '-catavg', 12, 22);
  const ranking = seededValue(brandSlug + '-rank', 1, 12);
  const growth = seededValue(brandSlug + '-growth', -5, 28);

  const trendingStatus: TrendingStatus =
    growth > 10 ? 'trending' : growth >= 0 ? 'stable' : 'declining';

  return {
    trendingStatus,
    categoryRanking: ranking,
    totalInCategory: seededValue(brandSlug + '-total', 18, 45),
    adoptionRate,
    categoryAvgAdoption: categoryAvg,
    categoryName: getCategoryForBrand(brandSlug),
    quarterOverQuarterGrowth: growth,
  };
}

// ── getBrandPerformanceMetrics ──────────────────────────────────────

export function getBrandPerformanceMetrics(brandSlug: string): BrandPerformanceMetrics {
  const baseRevenue = seededValue(brandSlug + '-rev', 18000, 145000);
  const activeOps = seededValue(brandSlug + '-ops', 12, 68);
  const avgOrder = seededValue(brandSlug + '-aov', 280, 1200);
  const reorderRate = seededValue(brandSlug + '-reorder', 42, 88);
  const momentum = seededValue(brandSlug + '-momentum', 35, 92);

  const kpiCards: KPICard[] = [
    {
      label: 'Total Revenue (90d)',
      value: baseRevenue >= 1000 ? `$${(baseRevenue / 1000).toFixed(1)}k` : `$${baseRevenue}`,
      delta: seededValue(brandSlug + '-revdelta', -8, 24),
      deltaLabel: 'vs prior quarter',
    },
    {
      label: 'Active Operators',
      value: activeOps.toString(),
      delta: seededValue(brandSlug + '-opsdelta', -3, 12),
      deltaLabel: 'vs prior quarter',
    },
    {
      label: 'Avg Order Value',
      value: `$${avgOrder}`,
      delta: seededValue(brandSlug + '-aovdelta', -5, 15),
      deltaLabel: 'vs prior quarter',
    },
    {
      label: 'Reorder Rate',
      value: `${reorderRate}%`,
      delta: seededValue(brandSlug + '-reorderdelta', -4, 8),
      deltaLabel: 'vs prior quarter',
    },
  ];

  // Generate 12-month revenue trend
  const revenueTrend: number[] = [];
  for (let i = 0; i < 12; i++) {
    const base = baseRevenue / 3; // monthly ~= quarterly / 3
    const variation = seededValue(brandSlug + `-month${i}`, -20, 20) / 100;
    const growthFactor = 1 + (i / 12) * 0.15; // slight upward trend
    revenueTrend.push(Math.round(base * (1 + variation) * growthFactor));
  }

  // Generate SKU performance
  const skuNames = [
    { name: 'Advanced Peptide Complex Serum', category: 'Anti-aging' },
    { name: 'Barrier Repair Recovery Cream', category: 'Post-procedure' },
    { name: 'Brightening Vitamin C Concentrate', category: 'Brightening' },
    { name: 'Professional Hydration Gel Mask', category: 'Hydration' },
    { name: 'Retinol Renewal System (0.5%)', category: 'Anti-aging' },
    { name: 'Tranexamic Acid Targeted Serum', category: 'Hyperpigmentation' },
    { name: 'Daily Defense SPF 40', category: 'Sun protection' },
    { name: 'Exfoliating AHA Treatment Peel', category: 'Resurfacing' },
  ];

  const skuPerformance: SKUPerformance[] = skuNames.map((sku, idx) => {
    const reorder = seededValue(brandSlug + `-sku${idx}-reorder`, 20, 95);
    const trend = seededValue(brandSlug + `-sku${idx}-trend`, -25, 35);
    const velocity: SKUPerformance['velocity'] =
      trend > 5 ? 'active' : trend >= -10 ? 'declining' : 'at_risk';
    return {
      id: `sku-${idx + 1}`,
      name: sku.name,
      category: sku.category,
      reorderRate: reorder,
      unitsLast90d: seededValue(brandSlug + `-sku${idx}-units`, 15, 380),
      revenueLast90d: seededValue(brandSlug + `-sku${idx}-rev`, 800, 28000),
      velocity,
      trend,
    };
  });

  // Sort: active first, then declining, then at_risk
  const velocityOrder = { active: 0, declining: 1, at_risk: 2 };
  skuPerformance.sort((a, b) => velocityOrder[a.velocity] - velocityOrder[b.velocity]);

  return { kpiCards, momentumScore: momentum, skuPerformance, revenueTrend };
}

// ── getResellerIntelligence ────────────────────────────────────────

export function getResellerIntelligence(brandSlug: string): ResellerIntelligence {
  const operatorNames = [
    { name: 'Luminous Day Spa', tier: 'Premium' as OperatorTier, region: 'Northeast US' },
    { name: 'Radiance MedSpa & Wellness', tier: 'Enterprise' as OperatorTier, region: 'Southeast US' },
    { name: 'Glow Aesthetics Studio', tier: 'Pro' as OperatorTier, region: 'Southwest US' },
    { name: 'The Skin Lab', tier: 'Pro' as OperatorTier, region: 'West Coast' },
    { name: 'Vitality Wellness Center', tier: 'Premium' as OperatorTier, region: 'Midwest US' },
    { name: 'Pure Beauty Bar', tier: 'Pro' as OperatorTier, region: 'Southeast US' },
    { name: 'Elite Skin Institute', tier: 'Enterprise' as OperatorTier, region: 'Northeast US' },
    { name: 'Bloom Medical Aesthetics', tier: 'Premium' as OperatorTier, region: 'West Coast' },
    { name: 'Serene Skin Studio', tier: 'Pro' as OperatorTier, region: 'Midwest US' },
    { name: 'Aura Clinical Spa', tier: 'Premium' as OperatorTier, region: 'Southwest US' },
    { name: 'Derma Solutions Clinic', tier: 'Enterprise' as OperatorTier, region: 'Northeast US' },
    { name: 'Luxe Beauty Collective', tier: 'Pro' as OperatorTier, region: 'Southeast US' },
  ];

  const operators: OperatorData[] = operatorNames.map((op, idx) => {
    const orders = seededValue(brandSlug + `-op${idx}-orders`, 0, 14);
    const status: OperatorData['status'] =
      orders >= 4 ? 'active' :
      orders >= 2 ? 'declining' :
      orders === 0 ? 'new' : 'at_risk';
    return {
      id: `op-${idx + 1}`,
      name: op.name,
      tier: op.tier,
      region: op.region,
      ordersLast90d: orders,
      revenueLast90d: seededValue(brandSlug + `-op${idx}-rev`, 500, 18000),
      status,
      lastOrderDate: daysAgo(seededValue(brandSlug + `-op${idx}-last`, 2, 120)),
      productsCarried: seededValue(brandSlug + `-op${idx}-products`, 1, 8),
    };
  });

  const activeOperators = operators.filter(o => o.status === 'active' || o.status === 'declining').length;
  const atRiskOperators = operators.filter(o => o.status === 'at_risk' || o.status === 'declining');

  // Geographic distribution
  const regionCounts = new Map<string, number>();
  for (const op of operators) {
    regionCounts.set(op.region, (regionCounts.get(op.region) || 0) + 1);
  }
  const geographicDistribution = Array.from(regionCounts.entries())
    .map(([region, count]) => ({
      region,
      count,
      percentage: Math.round((count / operators.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Tier distribution
  const tierCounts = new Map<OperatorTier, number>();
  for (const op of operators) {
    tierCounts.set(op.tier, (tierCounts.get(op.tier) || 0) + 1);
  }
  const tierDistribution: ResellerIntelligence['tierDistribution'] = (
    ['Pro', 'Premium', 'Enterprise'] as OperatorTier[]
  ).map(tier => ({
    tier,
    count: tierCounts.get(tier) || 0,
    percentage: Math.round(((tierCounts.get(tier) || 0) / operators.length) * 100),
  }));

  // Growth opportunities
  const growthOpportunities: GrowthOpportunity[] = [
    {
      segment: 'Medspa Expansion',
      description: 'High-revenue medspas in Southeast US showing 34% growth in your category. 8 new medspas opened this quarter matching your brand profile.',
      potentialRevenue: '$24k-$36k',
      operatorCount: 8,
    },
    {
      segment: 'Protocol Bundling',
      description: 'Operators using your products in multi-step protocols reorder 2.1x more frequently. 5 operators currently using single-product orders could benefit from protocol education.',
      potentialRevenue: '$12k-$18k',
      operatorCount: 5,
    },
    {
      segment: 'Premium Tier Upgrade',
      description: 'Pro-tier operators with consistent reorder patterns showing readiness for Premium engagement. Device protocol add-ons could increase average order value by 40%.',
      potentialRevenue: '$8k-$14k',
      operatorCount: 4,
    },
  ];

  return {
    totalOperators: operators.length,
    activeOperators,
    operators,
    geographicDistribution,
    tierDistribution,
    atRiskOperators,
    growthOpportunities,
  };
}

// ── getBrandCategoryPosition ───────────────────────────────────────

export function getBrandCategoryPosition(brandSlug: string): BrandCategoryPositionData {
  const primaryCategory = getCategoryForBrand(brandSlug);
  const rank = seededValue(brandSlug + '-catrank', 1, 15);
  const totalBrands = seededValue(brandSlug + '-cattotal', 20, 48);
  const adoptionRate = seededValue(brandSlug + '-catadopt', 14, 36);
  const categoryAvg = seededValue(brandSlug + '-catavg2', 12, 22);

  const competitivePosition: CategoryPosition['competitivePosition'] =
    rank <= 3 ? 'leader' :
    rank <= 8 ? 'contender' :
    rank <= 12 ? 'emerging' : 'niche';

  const positionLabels: Record<CategoryPosition['competitivePosition'], string> = {
    leader: 'Your brand ranks in the top tier for this category. Strong adoption across operator segments with above-average reorder rates.',
    contender: 'Solid mid-market positioning with growth trajectory. Adoption rate trends suggest upward category movement next quarter.',
    emerging: 'Growing category presence with targeted operator adoption. Protocol-based education showing strongest conversion path.',
    niche: 'Specialized positioning resonating with specific operator segments. Depth of engagement in target accounts is above category average.',
  };

  const categories: CategoryPosition[] = [
    {
      categoryName: primaryCategory,
      rank,
      totalBrands,
      adoptionRate,
      categoryAvg,
      treatmentTrendImpact: getTreatmentTrendForCategory(primaryCategory),
      competitivePosition,
      competitiveContext: positionLabels[competitivePosition],
    },
  ];

  // Add secondary category if brand slug suggests multi-category
  const secondaryCategory = getSecondaryCategoryForBrand(brandSlug);
  if (secondaryCategory) {
    const secRank = seededValue(brandSlug + '-secrank', 3, 20);
    const secTotal = seededValue(brandSlug + '-sectotal', 15, 40);
    const secAdoption = seededValue(brandSlug + '-secadopt', 8, 28);
    const secAvg = seededValue(brandSlug + '-secavg', 10, 20);
    const secPosition: CategoryPosition['competitivePosition'] =
      secRank <= 3 ? 'leader' : secRank <= 8 ? 'contender' : secRank <= 12 ? 'emerging' : 'niche';

    categories.push({
      categoryName: secondaryCategory,
      rank: secRank,
      totalBrands: secTotal,
      adoptionRate: secAdoption,
      categoryAvg: secAvg,
      treatmentTrendImpact: getTreatmentTrendForCategory(secondaryCategory),
      competitivePosition: secPosition,
      competitiveContext: positionLabels[secPosition],
    });
  }

  const overallMap: Record<CategoryPosition['competitivePosition'], string> = {
    leader: 'Category Leader — strong market position with high operator adoption',
    contender: 'Strong Contender — solid positioning with growth trajectory',
    emerging: 'Emerging Player — growing presence with targeted adoption',
    niche: 'Niche Specialist — deep engagement within focused segments',
  };

  return {
    categories,
    overallMarketPosition: overallMap[competitivePosition],
  };
}

// ── getBrandTopSignals ─────────────────────────────────────────────

export function getBrandTopSignals(brandSlug: string): IntelligenceSignal[] {
  const category = getCategoryForBrand(brandSlug);

  // Filter signals relevant to this brand's category or mentioning related topics
  const relevant = mockSignals.filter(signal => {
    // Match on category overlap
    if (signal.category && categoryOverlap(signal.category, category)) return true;
    // Match on signal type relevance to brands
    if (signal.signal_type === 'brand_adoption') return true;
    if (signal.signal_type === 'treatment_trend' && signal.magnitude > 20) return true;
    if (signal.signal_type === 'regulatory_alert') return true;
    return false;
  });

  // Sort by magnitude and recency, take top 5
  const sorted = relevant
    .sort((a, b) => {
      const magDiff = Math.abs(b.magnitude) - Math.abs(a.magnitude);
      if (Math.abs(magDiff) > 10) return magDiff;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 5);

  return sorted;
}

// ── Private helpers ────────────────────────────────────────────────

function getCategoryForBrand(slug: string): string {
  const categoryMap: Record<string, string> = {
    'skinceuticals': 'Anti-aging',
    'jan-marini': 'Anti-aging',
    'is-clinical': 'Brightening',
    'alastin': 'Post-procedure',
    'elta-md': 'Sun protection',
    'obagi': 'Hyperpigmentation',
    'revision': 'Anti-aging',
    'skinmedica': 'Regenerative',
    'pca-skin': 'Resurfacing',
    'image-skincare': 'Professional skincare',
  };
  return categoryMap[slug] || 'Professional skincare';
}

function getSecondaryCategoryForBrand(slug: string): string | null {
  const secondaryMap: Record<string, string> = {
    'skinceuticals': 'Brightening',
    'alastin': 'Regenerative',
    'obagi': 'Resurfacing',
    'pca-skin': 'Anti-aging',
  };
  return secondaryMap[slug] || null;
}

function getTreatmentTrendForCategory(category: string): string {
  const trendMap: Record<string, string> = {
    'Anti-aging': 'LED therapy add-ons and exosome protocols are driving 34% more demand for anti-aging actives in treatment rooms.',
    'Post-procedure': 'Barrier repair kits are becoming mandatory aftercare, creating predictable restock cycles for post-procedure products.',
    'Brightening': 'Tranexamic acid formulations gaining ground alongside vitamin C, expanding the brightening protocol toolkit.',
    'Hyperpigmentation': 'Multi-modal resurfacing protocols are increasing demand for targeted hyperpigmentation actives.',
    'Sun protection': 'Professional sunscreen demand remains strong with tinted mineral formulations commanding premium positioning.',
    'Resurfacing': 'Combination resurfacing (chemical + device) is standard practice, though standalone peel solutions face device competition.',
    'Hydration': 'Polyglutamic acid emergence is expanding the hydration ingredient landscape beyond hyaluronic acid.',
    'Regenerative': 'Exosome-based treatments emerging as premium offering, driving 3x higher average tickets in medspas.',
    'Professional skincare': 'Protocol-based product training seeing 2.1x faster professional adoption versus product-only education.',
  };
  return trendMap[category] || 'Treatment room intelligence indicates steady demand with emerging protocol integration opportunities.';
}

function categoryOverlap(signalCategory: string, brandCategory: string): boolean {
  const lowerSignal = signalCategory.toLowerCase();
  const lowerBrand = brandCategory.toLowerCase();

  // Direct match
  if (lowerSignal.includes(lowerBrand) || lowerBrand.includes(lowerSignal)) return true;

  // Semantic overlaps
  const overlapMap: Record<string, string[]> = {
    'anti-aging': ['premium treatments', 'biotech actives', 'plant actives'],
    'post-procedure': ['barrier support', 'device protocols'],
    'brightening': ['hyperpigmentation'],
    'hyperpigmentation': ['brightening'],
    'resurfacing': ['advanced protocols'],
    'professional skincare': ['brand growth', 'brand positioning', 'professional education'],
  };

  const mappedCategories = overlapMap[lowerBrand] || [];
  return mappedCategories.some(c => lowerSignal.includes(c));
}
