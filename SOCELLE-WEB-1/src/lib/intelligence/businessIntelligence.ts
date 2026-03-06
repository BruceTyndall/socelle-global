// ── Business Intelligence Data Layer ───────────────────────────────
// WO-11 Task 1: Mock data for business portal intelligence features
// V1: Static mock data; V2: Supabase queries + real operator profiles

import type { IntelligenceSignal } from './types';
import type { EducationContent } from '../education/types';
import { mockSignals } from './mockSignals';
import { mockEducationContent } from '../education/mockContent';

// ── Types ──────────────────────────────────────────────────────────

export interface OperatorInsight {
  id: string;
  title: string;
  description: string;
  category: 'growth' | 'risk' | 'trend' | 'benchmark' | 'education';
  urgency: 'high' | 'medium' | 'low';
  actionLabel?: string;
  actionHref?: string;
  updatedAt: string;
}

export interface GrowthOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedRevenueLift: string;
  peerAdoptionPct: number;
  actionLabel: string;
  actionHref: string;
}

export interface DemandSignal {
  id: string;
  title: string;
  description: string;
  trendDirection: 'up' | 'down' | 'stable';
  magnitude: number;
  region: string;
  category: string;
  relatedBrands: string[];
}

export interface ReorderRisk {
  id: string;
  productName: string;
  brandName: string;
  daysSinceLastOrder: number;
  averageReorderCycleDays: number;
  riskLevel: 'overdue' | 'upcoming' | 'healthy';
  suggestedAction: string;
}

export interface SpendingPattern {
  month: string;
  amount: number;
}

export interface BrandDiversityItem {
  brandName: string;
  percentage: number;
  color: string;
}

export interface ReorderHealth {
  productName: string;
  brandName: string;
  status: 'healthy' | 'warning' | 'overdue';
  daysSinceOrder: number;
  avgCycleDays: number;
}

export interface OperatorPerformance {
  spendingPatterns: SpendingPattern[];
  totalSpendThisQuarter: number;
  spendChangeVsLastQuarter: number;
  brandDiversity: BrandDiversityItem[];
  reorderHealth: ReorderHealth[];
  momentumScore: number;
  momentumLabel: string;
}

export interface WhitespaceOpportunity {
  id: string;
  category: string;
  title: string;
  description: string;
  peerAdoptionPct: number;
  topBrands: string[];
}

export interface UpsellSuggestion {
  id: string;
  currentProduct: string;
  suggestedProduct: string;
  suggestedBrand: string;
  reason: string;
  marginUplift: string;
}

export interface ProductMixItem {
  category: string;
  yourPct: number;
  peerAvgPct: number;
}

export interface ProductIntelligence {
  productMixVsPeers: ProductMixItem[];
  whitespaceOpportunities: WhitespaceOpportunity[];
  upsellSuggestions: UpsellSuggestion[];
}

export interface BrandIntelligenceContext {
  brandName: string;
  trendingStatus: 'rising' | 'stable' | 'declining';
  peerAdoptionCount: number;
  signalSummary: string;
}

// ── Helper ─────────────────────────────────────────────────────────

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

// ── getOperatorInsights ────────────────────────────────────────────
// Returns 3-5 personalized intelligence signals based on operator profile

export function getOperatorInsights(
  _operatorType: string = 'spa',
  _location: string = 'Southwest US'
): OperatorInsight[] {
  return [
    {
      id: 'oi-001',
      title: 'Peptide serums are outpacing your current back bar',
      description:
        'Professional-grade peptide serums are showing 2.3x reorder velocity across medspas in your region. Top spas in the Southwest are adding copper peptide and multi-peptide eye complexes to their anti-aging protocols.',
      category: 'trend',
      urgency: 'high',
      actionLabel: 'Browse peptide serums',
      actionHref: '/brands',
      updatedAt: daysAgo(0),
    },
    {
      id: 'oi-002',
      title: 'Your reorder cycle for barrier repair is 12 days overdue',
      description:
        'Based on your average consumption pattern, your barrier repair kit inventory should have been replenished 12 days ago. Consistent stock-outs can impact post-procedure aftercare quality.',
      category: 'risk',
      urgency: 'high',
      actionLabel: 'Reorder now',
      actionHref: '/portal/orders',
      updatedAt: daysAgo(1),
    },
    {
      id: 'oi-003',
      title: 'LED therapy adoption is accelerating in your market',
      description:
        'LED light therapy add-ons grew 34% this quarter among your peer group. Red (633nm) and near-infrared (830nm) wavelengths are being added to post-treatment recovery protocols at the highest rate.',
      category: 'growth',
      urgency: 'medium',
      actionLabel: 'Explore LED protocols',
      actionHref: '/education',
      updatedAt: daysAgo(2),
    },
    {
      id: 'oi-004',
      title: 'Your brand diversity is above average — but concentrated',
      description:
        'You source from 6 brands (peer average: 4.2). However, 68% of your spend goes to a single brand. Diversifying your back bar can improve margin negotiation leverage and reduce supply chain risk.',
      category: 'benchmark',
      urgency: 'low',
      updatedAt: daysAgo(3),
    },
    {
      id: 'oi-005',
      title: 'New CE course: Tranexamic Acid for Hyperpigmentation',
      description:
        'A new CE-eligible course on tranexamic acid clinical applications is now available. This ingredient is appearing in 18% more professional formulations this quarter — directly relevant to your corrective facial menu.',
      category: 'education',
      urgency: 'low',
      actionLabel: 'Start course',
      actionHref: '/education',
      updatedAt: daysAgo(4),
    },
  ];
}

// ── getGrowthOpportunity ───────────────────────────────────────────

export function getGrowthOpportunity(): GrowthOpportunity {
  return {
    id: 'go-001',
    title: 'You\'re under-indexed in post-procedure aftercare',
    description:
      'Based on your treatment room profile, peer spas with similar service menus stock 3-4 post-procedure barrier repair SKUs. You currently carry 1. This category is seeing 67% first-time order growth this quarter — your clients likely need these products after microneedling and peel services.',
    category: 'Post-procedure Care',
    estimatedRevenueLift: '$1,200–$2,400/quarter',
    peerAdoptionPct: 78,
    actionLabel: 'Explore post-procedure products',
    actionHref: '/brands',
  };
}

// ── getDemandSignal ────────────────────────────────────────────────

export function getDemandSignal(): DemandSignal {
  return {
    id: 'ds-001',
    title: 'Exosome facial protocols trending in your area',
    description:
      'Medspas within 50 miles are adopting exosome-based treatments at 3x the national rate. Operators reporting a 3x higher average ticket when incorporating exosome serums into microneedling protocols. This is the fastest-growing premium treatment category in the Southwest.',
    trendDirection: 'up',
    magnitude: 42,
    region: 'Southwest US',
    category: 'Premium Treatments',
    relatedBrands: ['AnteAGE', 'Benev', 'CALECIM'],
  };
}

// ── getReorderRisk ─────────────────────────────────────────────────

export function getReorderRisk(): ReorderRisk {
  return {
    id: 'rr-001',
    productName: 'Alastin Regenerating Skin Nectar',
    brandName: 'Alastin Skincare',
    daysSinceLastOrder: 47,
    averageReorderCycleDays: 35,
    riskLevel: 'overdue',
    suggestedAction:
      'You last ordered this product 47 days ago. Your average reorder cycle is 35 days. Stock may be running low — consider reordering to maintain aftercare continuity for your microneedling clients.',
  };
}

// ── getOperatorPerformance ─────────────────────────────────────────

export function getOperatorPerformance(): OperatorPerformance {
  return {
    spendingPatterns: [
      { month: 'Oct', amount: 3420 },
      { month: 'Nov', amount: 4180 },
      { month: 'Dec', amount: 3890 },
      { month: 'Jan', amount: 4650 },
      { month: 'Feb', amount: 5210 },
      { month: 'Mar', amount: 4870 },
    ],
    totalSpendThisQuarter: 14730,
    spendChangeVsLastQuarter: 18,
    brandDiversity: [
      { brandName: 'SkinCeuticals', percentage: 38, color: '#8C6B6E' },
      { brandName: 'Alastin', percentage: 22, color: '#D4A44C' },
      { brandName: 'iS Clinical', percentage: 16, color: '#3B82F6' },
      { brandName: 'EltaMD', percentage: 12, color: '#22C55E' },
      { brandName: 'Jan Marini', percentage: 8, color: '#A855F7' },
      { brandName: 'Other', percentage: 4, color: '#94A3B8' },
    ],
    reorderHealth: [
      { productName: 'C E Ferulic', brandName: 'SkinCeuticals', status: 'healthy', daysSinceOrder: 18, avgCycleDays: 30 },
      { productName: 'Regenerating Skin Nectar', brandName: 'Alastin', status: 'overdue', daysSinceOrder: 47, avgCycleDays: 35 },
      { productName: 'Active Serum', brandName: 'iS Clinical', status: 'healthy', daysSinceOrder: 12, avgCycleDays: 28 },
      { productName: 'UV Clear SPF 46', brandName: 'EltaMD', status: 'warning', daysSinceOrder: 26, avgCycleDays: 28 },
      { productName: 'Retinol Plus Mask', brandName: 'Jan Marini', status: 'healthy', daysSinceOrder: 8, avgCycleDays: 45 },
    ],
    momentumScore: 74,
    momentumLabel: 'Growing',
  };
}

// ── getProductIntelligence ─────────────────────────────────────────

export function getProductIntelligence(): ProductIntelligence {
  return {
    productMixVsPeers: [
      { category: 'Anti-aging Serums', yourPct: 32, peerAvgPct: 28 },
      { category: 'Sunscreen / SPF', yourPct: 14, peerAvgPct: 18 },
      { category: 'Cleansers', yourPct: 12, peerAvgPct: 14 },
      { category: 'Post-procedure', yourPct: 8, peerAvgPct: 16 },
      { category: 'Brightening', yourPct: 18, peerAvgPct: 12 },
      { category: 'Hydration', yourPct: 10, peerAvgPct: 8 },
      { category: 'Other', yourPct: 6, peerAvgPct: 4 },
    ],
    whitespaceOpportunities: [
      {
        id: 'ws-001',
        category: 'Post-procedure Aftercare',
        title: 'Barrier repair products top spas like yours stock that you haven\'t tried',
        description:
          'Peer medspas with microneedling and peel services stock an average of 3.4 barrier repair SKUs. Your current assortment has a gap here — this is the fastest-growing category on the platform.',
        peerAdoptionPct: 78,
        topBrands: ['Alastin', 'EltaMD', 'SkinCeuticals'],
      },
      {
        id: 'ws-002',
        category: 'Device Accessories',
        title: 'LED therapy consumables your peer group stocks',
        description:
          'With LED therapy add-ons growing 34% this quarter, top operators are stocking conductive gels, LED-specific serums, and post-LED recovery masks. You haven\'t ordered in this sub-category yet.',
        peerAdoptionPct: 56,
        topBrands: ['Celluma', 'LightStim', 'Dermalux'],
      },
      {
        id: 'ws-003',
        category: 'Scalp Treatments',
        title: 'Scalp health products — an emerging revenue stream',
        description:
          'Day spas and medspas adding scalp treatments to their menu are seeing 28% growth in this segment. New product attachment opportunities are emerging as scalp health goes mainstream.',
        peerAdoptionPct: 32,
        topBrands: ['Philip Kingsley Pro', 'Revela', 'Nutrafol Pro'],
      },
    ],
    upsellSuggestions: [
      {
        id: 'us-001',
        currentProduct: 'C E Ferulic (30ml)',
        suggestedProduct: 'C E Ferulic Professional Backbar (120ml)',
        suggestedBrand: 'SkinCeuticals',
        reason: 'Professional backbar size reduces per-treatment cost by 34%. At your consumption rate, the 120ml format is more cost-effective.',
        marginUplift: '+34% margin improvement',
      },
      {
        id: 'us-002',
        currentProduct: 'Standard Glycolic Peel 30%',
        suggestedProduct: 'Stepped Retinol Renewal System',
        suggestedBrand: 'Jan Marini',
        reason: 'Stepped retinol programs (0.25% to 1.0%) are replacing single-strength peels. Subscription-model velocity is emerging as professionals guide clients through phased protocols.',
        marginUplift: '+$85/client average ticket increase',
      },
      {
        id: 'us-003',
        currentProduct: 'Basic SPF 30 Sunscreen',
        suggestedProduct: 'UV Clear Tinted SPF 46',
        suggestedBrand: 'EltaMD',
        reason: 'Tinted mineral sunscreens command 40% higher retail margins and have stronger client compliance rates. This is the top-selling professional sunscreen on the platform.',
        marginUplift: '+40% retail margin',
      },
    ],
  };
}

// ── getRelevantEducation ───────────────────────────────────────────
// Returns filtered education content relevant to an operator profile

export function getRelevantEducation(
  _operatorType: string = 'spa'
): EducationContent[] {
  // V1: Return a curated subset; V2: ML-based relevance scoring
  const relevantIds = [
    'edu-tp-002', // LED integration
    'edu-is-003', // Tranexamic acid
    'edu-bo-001', // Back bar optimization
    'edu-cr-001', // MoCRA compliance
    'edu-tp-004', // Hyperpigmentation plan
    'edu-rs-001', // Home care regimen
    'edu-bo-004', // Service menu pricing
    'edu-dt-001', // IPL/BBL parameters
  ];

  return mockEducationContent.filter((item) => relevantIds.includes(item.id));
}

// ── getMarketSignalsForOperator ────────────────────────────────────
// Returns a filtered subset of market intelligence signals relevant to the operator's segment

export function getMarketSignalsForOperator(
  _operatorType: string = 'spa',
  _location: string = 'Southwest US'
): IntelligenceSignal[] {
  // V1: Filter by relevant signal types; V2: Personalization engine
  const relevantTypes = [
    'product_velocity',
    'treatment_trend',
    'ingredient_momentum',
    'regional',
    'pricing_benchmark',
  ];

  return mockSignals
    .filter((s) => relevantTypes.includes(s.signal_type))
    .sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude))
    .slice(0, 12);
}

// ── getBrandIntelligenceContext ─────────────────────────────────────
// Returns intelligence context for brand matches shown in plan results

export function getBrandIntelligenceContext(brandNames: string[]): BrandIntelligenceContext[] {
  const brandContextMap: Record<string, BrandIntelligenceContext> = {
    'SkinCeuticals': {
      brandName: 'SkinCeuticals',
      trendingStatus: 'stable',
      peerAdoptionCount: 847,
      signalSummary: 'Most-ordered professional brand on the platform. Clinical-grade formulations with strong evidence base. Peer spas report 92% client satisfaction with C E Ferulic protocols.',
    },
    'Alastin': {
      brandName: 'Alastin',
      trendingStatus: 'rising',
      peerAdoptionCount: 412,
      signalSummary: 'Post-procedure category leader seeing 67% first-time order growth. Barrier repair kits becoming mandatory aftercare at top medspas.',
    },
    'iS Clinical': {
      brandName: 'iS Clinical',
      trendingStatus: 'rising',
      peerAdoptionCount: 623,
      signalSummary: 'Active Serum is the fastest-growing SKU in the anti-aging serum category this quarter. Strong velocity across both day spas and medspas.',
    },
    'EltaMD': {
      brandName: 'EltaMD',
      trendingStatus: 'stable',
      peerAdoptionCount: 1024,
      signalSummary: 'Professional sunscreen category leader. Tinted mineral formulations maintaining price points. UV Clear SPF 46 is the top retail attach product across all operator types.',
    },
    'Jan Marini': {
      brandName: 'Jan Marini',
      trendingStatus: 'rising',
      peerAdoptionCount: 318,
      signalSummary: 'Stepped retinol renewal systems gaining traction as professionals move to phased protocols. Subscription-model velocity emerging in this brand\'s product line.',
    },
    'Obagi': {
      brandName: 'Obagi',
      trendingStatus: 'stable',
      peerAdoptionCount: 589,
      signalSummary: 'Legacy clinical brand maintaining steady demand. Nu-Derm system remains strong in corrective protocols for Fitzpatrick III-VI skin types.',
    },
    'ZO Skin Health': {
      brandName: 'ZO Skin Health',
      trendingStatus: 'rising',
      peerAdoptionCount: 476,
      signalSummary: 'Dr. Obagi\'s newer brand showing accelerating adoption in medspas. Getting Skin Ready system driving strong retail attachment rates.',
    },
    'PCA Skin': {
      brandName: 'PCA Skin',
      trendingStatus: 'stable',
      peerAdoptionCount: 534,
      signalSummary: 'Peel and resurfacing category staple. Professional-grade chemical peel solutions holding steady despite device-based resurfacing growth.',
    },
  };

  return brandNames.map((name) => {
    if (brandContextMap[name]) {
      return brandContextMap[name];
    }
    // Fallback for unknown brands
    return {
      brandName: name,
      trendingStatus: 'stable' as const,
      peerAdoptionCount: Math.floor(Math.random() * 300) + 50,
      signalSummary: `Professional brand on the Socelle platform. Peer adoption data is being collected for this brand.`,
    };
  });
}
