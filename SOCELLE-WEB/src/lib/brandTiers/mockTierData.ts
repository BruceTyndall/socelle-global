// ── Mock Tier Data ────────────────────────────────────────────────
// WO-24: Brand Intelligence Packages (Monetization)
// All data is local mock — no Supabase or Stripe integration

import type {
  BrandTier,
  TierFeature,
  TierPricing,
  BrandSubscription,
  IntelligenceReport,
} from './types';

// ── Feature Matrix (18 features) ─────────────────────────────────

export const TIER_FEATURES: TierFeature[] = [
  // Intelligence features
  {
    key: 'market_signals',
    name: 'Market Signals Feed',
    description: 'Real-time market signals and trend alerts',
    includedIn: { basic: true, professional: true, enterprise: true },
    category: 'intelligence',
  },
  {
    key: 'brand_performance_tab',
    name: 'Brand Performance Analytics',
    description: 'SKU velocity, revenue trends, and product performance',
    includedIn: { basic: true, professional: true, enterprise: true },
    category: 'intelligence',
  },
  {
    key: 'reseller_intelligence',
    name: 'Reseller Intelligence',
    description: 'Operator health scores, reorder patterns, and risk alerts',
    includedIn: { basic: false, professional: true, enterprise: true },
    category: 'intelligence',
  },
  {
    key: 'market_position',
    name: 'Market Position Analysis',
    description: 'Category rankings, competitive landscape, and share trends',
    includedIn: { basic: false, professional: false, enterprise: true },
    category: 'intelligence',
  },
  {
    key: 'competitive_benchmarks',
    name: 'Competitive Benchmarks',
    description: 'Anonymized competitor positioning and market share data',
    includedIn: { basic: false, professional: false, enterprise: true },
    category: 'intelligence',
  },
  {
    key: 'predictive_insights',
    name: 'Predictive Insights',
    description: 'Intelligence-driven demand forecasting and trend predictions',
    includedIn: { basic: false, professional: false, enterprise: true },
    category: 'intelligence',
  },
  // Report features
  {
    key: 'monthly_summary',
    name: 'Monthly Summary Report',
    description: 'High-level monthly performance overview',
    includedIn: { basic: true, professional: true, enterprise: true },
    category: 'reports',
  },
  {
    key: 'detailed_monthly_report',
    name: 'Detailed Monthly Intelligence Report',
    description: 'Full 5-section intelligence report with recommendations',
    includedIn: { basic: false, professional: true, enterprise: true },
    category: 'reports',
  },
  {
    key: 'weekly_digest',
    name: 'Weekly Intelligence Digest',
    description: 'Weekly email with key signal changes and opportunities',
    includedIn: { basic: false, professional: true, enterprise: true },
    category: 'reports',
  },
  {
    key: 'custom_reports',
    name: 'Custom Report Builder',
    description: 'Build custom reports with selected metrics and date ranges',
    includedIn: { basic: false, professional: false, enterprise: true },
    category: 'reports',
  },
  {
    key: 'pdf_export',
    name: 'PDF Report Export',
    description: 'Download reports as branded PDF documents',
    includedIn: { basic: false, professional: true, enterprise: true },
    category: 'reports',
  },
  // Tool features
  {
    key: 'campaign_builder',
    name: 'Campaign Builder',
    description: 'Build and manage operator outreach campaigns',
    includedIn: { basic: false, professional: true, enterprise: true },
    category: 'tools',
  },
  {
    key: 'pipeline_management',
    name: 'Pipeline Management',
    description: 'Track operator acquisition pipeline and stages',
    includedIn: { basic: true, professional: true, enterprise: true },
    category: 'tools',
  },
  {
    key: 'ai_advisor',
    name: 'AI Brand Advisor',
    description: 'Conversational AI for strategy and market questions',
    includedIn: { basic: false, professional: true, enterprise: true },
    category: 'tools',
  },
  {
    key: 'api_access',
    name: 'Intelligence API Access',
    description: 'Programmatic access to intelligence data via REST API',
    includedIn: { basic: false, professional: false, enterprise: true },
    category: 'tools',
  },
  // Support features
  {
    key: 'email_support',
    name: 'Email Support',
    description: 'Standard email support with 48-hour response time',
    includedIn: { basic: true, professional: true, enterprise: true },
    category: 'support',
  },
  {
    key: 'priority_support',
    name: 'Priority Support',
    description: 'Priority email and chat support with 4-hour response',
    includedIn: { basic: false, professional: true, enterprise: true },
    category: 'support',
  },
  {
    key: 'dedicated_csm',
    name: 'Dedicated Customer Success Manager',
    description: 'Named CSM with monthly strategy calls',
    includedIn: { basic: false, professional: false, enterprise: true },
    category: 'support',
  },
];

// ── Tier Pricing ─────────────────────────────────────────────────

export const TIER_PRICING: TierPricing[] = [
  {
    tier: 'basic',
    name: 'Basic',
    monthlyPrice: 0,
    description: 'Essential marketplace presence with foundational intelligence signals.',
    cta: 'Current Plan',
  },
  {
    tier: 'professional',
    name: 'Professional',
    monthlyPrice: 299,
    description: 'Full intelligence suite for growth-focused brands with reseller analytics and campaign tools.',
    highlight: 'Most Popular',
    cta: 'Upgrade',
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 799,
    description: 'Complete market intelligence with competitive benchmarks, predictive insights, and API access.',
    cta: 'Contact Sales',
  },
];

// ── Mock Current Subscription (Professional tier) ────────────────

const MOCK_SUBSCRIPTION: BrandSubscription = {
  brandId: 'mock-brand-001',
  tier: 'professional',
  startDate: '2025-11-01',
  renewalDate: '2026-04-01',
  monthlyPrice: 299,
  status: 'active',
};

// ── Mock Intelligence Reports ────────────────────────────────────

const MOCK_REPORTS: IntelligenceReport[] = [
  {
    id: 'rpt-2026-03',
    brandId: 'mock-brand-001',
    reportDate: '2026-03-01',
    title: 'March 2026 Intelligence Report',
    generatedAt: '2026-03-02T08:00:00Z',
    sections: [
      {
        id: 'market-position',
        title: 'Market Position Summary',
        summary: 'Your brand ranks #4 in the Professional Skincare category, up from #6 last month. Adoption among medspa operators grew 12% MoM.',
        details: [
          'Category rank improved from #6 to #4 (+2 positions)',
          'Active resellers increased to 47 (net +5 from February)',
          'Average operator reorder rate: 78% (industry avg: 62%)',
          'Brand awareness score: 72/100 in target medspa segment',
        ],
        metric: { label: 'Category Rank', value: '#4', trend: 'up' },
      },
      {
        id: 'reseller-health',
        title: 'Reseller Health Scorecard',
        summary: '38 active, 6 declining, 3 at-risk operators in your network. Focus outreach on at-risk accounts to prevent churn.',
        details: [
          '38 operators maintaining healthy reorder patterns',
          '6 operators showing 15-30% decline in order frequency',
          '3 operators flagged at-risk (no orders in 45+ days)',
          'Recommended: Personalized outreach to at-risk accounts',
          'Top performer: Glow Aesthetics MedSpa — 12 reorders this quarter',
        ],
        metric: { label: 'Active Resellers', value: '38', trend: 'up' },
      },
      {
        id: 'category-trends',
        title: 'Category Trend Analysis',
        summary: 'Peptide serums and barrier repair continue to lead demand. Retinoid alternatives gaining traction in the medspa channel.',
        details: [
          'Peptide serums: +28% demand growth (you carry 3 SKUs in this category)',
          'Barrier repair: +22% demand — consider expanding product line',
          'Retinoid alternatives: Emerging trend, 4 competitors launched new SKUs',
          'Clean beauty positioning: Still strong but commoditizing — differentiate on clinical data',
          'Professional-grade sunscreen: Steady demand, your SPF line performing above category average',
        ],
        metric: { label: 'Top Trend', value: 'Peptides +28%', trend: 'up' },
      },
      {
        id: 'competitive-landscape',
        title: 'Competitive Landscape',
        summary: 'Two direct competitors expanded distribution this month. Your differentiation on clinical protocols remains a strong moat.',
        details: [
          'Competitor A expanded to 12 new medspa accounts in your primary market',
          'Competitor B launched a loyalty rebate program for operators',
          'Your clinical protocol library is cited by 64% of operators as a key differentiator',
          'Price positioning: You sit in the premium-mid range, which is optimal for medspa procurement',
        ],
        metric: { label: 'Competitors Tracked', value: '8', trend: 'flat' },
      },
      {
        id: 'recommendations',
        title: 'Strategic Recommendations',
        summary: 'Five actionable recommendations based on this month\'s intelligence analysis.',
        details: [
          'Launch a targeted re-engagement campaign for 3 at-risk accounts (use Campaign Builder)',
          'Expand peptide serum line with a professional-strength option for medspa back-bar',
          'Create a barrier repair protocol document to capture emerging demand',
          'Consider a loyalty incentive to counter Competitor B\'s rebate program',
          'Schedule Q2 strategy calls with top 10 resellers to strengthen relationships',
        ],
      },
    ],
  },
  {
    id: 'rpt-2026-02',
    brandId: 'mock-brand-001',
    reportDate: '2026-02-01',
    title: 'February 2026 Intelligence Report',
    generatedAt: '2026-02-02T08:00:00Z',
    sections: [
      {
        id: 'market-position',
        title: 'Market Position Summary',
        summary: 'Category rank #6 in Professional Skincare. Adoption grew 8% MoM with strong medspa channel performance.',
        details: [
          'Category rank held at #6',
          'Active resellers: 42 (net +3 from January)',
          'Average operator reorder rate: 74%',
        ],
        metric: { label: 'Category Rank', value: '#6', trend: 'flat' },
      },
      {
        id: 'reseller-health',
        title: 'Reseller Health Scorecard',
        summary: '35 active, 5 declining, 2 at-risk operators.',
        details: [
          '35 operators healthy',
          '5 operators declining',
          '2 operators at-risk',
        ],
        metric: { label: 'Active Resellers', value: '35', trend: 'up' },
      },
      {
        id: 'category-trends',
        title: 'Category Trend Analysis',
        summary: 'Peptide serums leading category growth. Clean beauty remains strong.',
        details: [
          'Peptide serums: +24% demand growth',
          'Clean beauty: Steady demand',
        ],
        metric: { label: 'Top Trend', value: 'Peptides +24%', trend: 'up' },
      },
      {
        id: 'competitive-landscape',
        title: 'Competitive Landscape',
        summary: 'Stable competitive environment with no major shifts.',
        details: [
          'No significant competitor moves this month',
          'Your clinical protocol positioning remains differentiated',
        ],
        metric: { label: 'Competitors Tracked', value: '8', trend: 'flat' },
      },
      {
        id: 'recommendations',
        title: 'Strategic Recommendations',
        summary: 'Three recommendations for February focus areas.',
        details: [
          'Increase peptide serum inventory ahead of spring demand',
          'Reach out to declining accounts with education resources',
          'Plan Q1 review with top resellers',
        ],
      },
    ],
  },
  {
    id: 'rpt-2026-01',
    brandId: 'mock-brand-001',
    reportDate: '2026-01-01',
    title: 'January 2026 Intelligence Report',
    generatedAt: '2026-01-03T08:00:00Z',
    sections: [
      {
        id: 'market-position',
        title: 'Market Position Summary',
        summary: 'Starting Q1 at category rank #6. New year presents growth opportunity in medspa channel.',
        details: [
          'Category rank: #6',
          'Active resellers: 39',
          'Average reorder rate: 71%',
        ],
        metric: { label: 'Category Rank', value: '#6', trend: 'flat' },
      },
      {
        id: 'reseller-health',
        title: 'Reseller Health Scorecard',
        summary: '32 active, 5 declining, 2 at-risk operators.',
        details: [
          '32 operators healthy',
          '5 operators declining',
          '2 operators at-risk',
        ],
        metric: { label: 'Active Resellers', value: '32', trend: 'flat' },
      },
      {
        id: 'category-trends',
        title: 'Category Trend Analysis',
        summary: 'Post-holiday demand normalizing. Peptide and barrier repair categories strong.',
        details: [
          'Holiday demand unwinding — normal seasonal pattern',
          'Peptide serums remain top growth category',
        ],
        metric: { label: 'Top Trend', value: 'Peptides +20%', trend: 'up' },
      },
      {
        id: 'competitive-landscape',
        title: 'Competitive Landscape',
        summary: 'Quiet month competitively. Focus on internal execution.',
        details: [
          'No competitor launches or major pricing changes',
        ],
        metric: { label: 'Competitors Tracked', value: '7', trend: 'flat' },
      },
      {
        id: 'recommendations',
        title: 'Strategic Recommendations',
        summary: 'Set up Q1 for growth.',
        details: [
          'Launch new year outreach campaign to lapsed accounts',
          'Audit product catalog for spring seasonal alignment',
          'Set reorder reminder automations for top accounts',
        ],
      },
    ],
  },
];

// ── Access Functions ─────────────────────────────────────────────

export function getTierFeatures(): TierFeature[] {
  return TIER_FEATURES;
}

export function getTierPricing(): TierPricing[] {
  return TIER_PRICING;
}

export function getCurrentSubscription(): BrandSubscription {
  return { ...MOCK_SUBSCRIPTION };
}

export function getMonthlyReport(reportId?: string): IntelligenceReport | undefined {
  if (reportId) {
    return MOCK_REPORTS.find((r) => r.id === reportId);
  }
  return MOCK_REPORTS[0]; // Latest report
}

export function getAllReports(): IntelligenceReport[] {
  return [...MOCK_REPORTS];
}

export function canAccessFeature(featureKey: string, currentTier: BrandTier): boolean {
  const feature = TIER_FEATURES.find((f) => f.key === featureKey);
  if (!feature) return false;
  return feature.includedIn[currentTier];
}

export function getRequiredTier(featureKey: string): BrandTier | null {
  const feature = TIER_FEATURES.find((f) => f.key === featureKey);
  if (!feature) return null;
  if (feature.includedIn.basic) return 'basic';
  if (feature.includedIn.professional) return 'professional';
  return 'enterprise';
}
