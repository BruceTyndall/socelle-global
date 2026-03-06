// ── Admin Intelligence Mock Data — WO-14 ──────────────────────────────────
// Mock data layer for admin portal intelligence features.
// All data is local; no Supabase calls. Will be wired to real queries in later waves.

// ── Types ──────────────────────────────────────────────────────────────────

export interface PlatformMetrics {
  totalSignals: number;
  activeSignals: number;
  draftSignals: number;
  archivedSignals: number;
  totalOperators: number;
  totalBrands: number;
  totalOrders: number;
  monthlyRevenue: number;
  operatorGrowth: number;
  brandGrowth: number;
}

export interface AdminSignal {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  views: number;
  clicks: number;
  direction: 'up' | 'down' | 'stable';
}

export interface BrandAnalytics {
  brandName: string;
  totalRevenue: number;
  revenueGrowth: number;
  orderCount: number;
  topProducts: { name: string; revenue: number; orders: number }[];
  resellerCount: number;
  growthTrajectory: 'growing' | 'stable' | 'declining';
}

export interface BrandProtocol {
  id: string;
  name: string;
  description: string;
  skinConcerns: string[];
  products: { name: string; step: number; usage: string }[];
  brandName: string;
}

export interface BrandEducationItem {
  title: string;
  type: string;
  views: number;
  completions: number;
  ceCredits: number;
}

export interface BrandReseller {
  name: string;
  orders: number;
  lastOrder: string;
  tier: string;
  status: string;
  revenue: number;
  city: string;
  state: string;
}

export interface WeeklyInsight {
  id: string;
  title: string;
  description: string;
  metric: string;
  type: 'opportunity' | 'risk' | 'benchmark';
}

export interface AdminReport {
  id: string;
  title: string;
  type: 'campaign' | 'snapshot' | 'report' | 'analysis';
  createdAt: string;
  status: 'published' | 'draft' | 'archived';
  brand?: string;
  metrics: { label: string; value: string }[];
}

// ── Helper ─────────────────────────────────────────────────────────────────

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

// ── Mock Data Functions ────────────────────────────────────────────────────

export function getPlatformMetrics(): PlatformMetrics {
  return {
    totalSignals: 342,
    activeSignals: 287,
    draftSignals: 38,
    archivedSignals: 17,
    totalOperators: 2847,
    totalBrands: 156,
    totalOrders: 4231,
    monthlyRevenue: 847500,
    operatorGrowth: 12.4,
    brandGrowth: 8.7,
  };
}

export function getAdminSignals(): AdminSignal[] {
  return [
    {
      id: 'as-001',
      title: 'Peptide Complex Serums Velocity Surge',
      description: 'Professional-grade peptide serums showing reorder rate 2.3x category average across medspa accounts.',
      type: 'product_velocity',
      status: 'active',
      createdAt: daysAgo(2),
      views: 1247,
      clicks: 342,
      direction: 'up',
    },
    {
      id: 'as-002',
      title: 'LED Therapy Add-On Protocol Adoption',
      description: 'LED light therapy being added to 34% more facial protocols this quarter.',
      type: 'treatment_trend',
      status: 'active',
      createdAt: daysAgo(3),
      views: 982,
      clicks: 287,
      direction: 'up',
    },
    {
      id: 'as-003',
      title: 'Tranexamic Acid Formulation Momentum',
      description: 'Tranexamic acid appearing in 18% more professional formulations this quarter.',
      type: 'ingredient_momentum',
      status: 'active',
      createdAt: daysAgo(4),
      views: 856,
      clicks: 198,
      direction: 'up',
    },
    {
      id: 'as-004',
      title: 'Southwest Medspa Demand Surge',
      description: 'Arizona and Nevada medspas driving highest order volume growth regionally.',
      type: 'regional',
      status: 'active',
      createdAt: daysAgo(5),
      views: 723,
      clicks: 167,
      direction: 'up',
    },
    {
      id: 'as-005',
      title: 'MoCRA Compliance Tracking Update',
      description: 'FDA MoCRA compliance deadlines approaching. Brands with facility registration showing higher trust scores.',
      type: 'regulatory_alert',
      status: 'active',
      createdAt: daysAgo(1),
      views: 1534,
      clicks: 412,
      direction: 'up',
    },
    {
      id: 'as-006',
      title: 'Chemical Peel Volume Decline',
      description: 'Glycolic and TCA peel solutions showing slight decline as device-based resurfacing gains market share.',
      type: 'product_velocity',
      status: 'active',
      createdAt: daysAgo(6),
      views: 645,
      clicks: 134,
      direction: 'down',
    },
    {
      id: 'as-007',
      title: 'Exosome Facial Protocol Revenue Impact',
      description: 'Medspas reporting 3x higher average ticket when incorporating exosome serums into microneedling protocols.',
      type: 'treatment_trend',
      status: 'active',
      createdAt: daysAgo(7),
      views: 912,
      clicks: 256,
      direction: 'up',
    },
    {
      id: 'as-008',
      title: 'DTC Brands Professional Line Launch Analysis',
      description: 'Consumer-first brands creating professional-only SKUs. 5 brands announced pro lines this quarter.',
      type: 'brand_adoption',
      status: 'active',
      createdAt: daysAgo(8),
      views: 567,
      clicks: 145,
      direction: 'up',
    },
    {
      id: 'as-009',
      title: 'Q2 Sunscreen Pricing Benchmark',
      description: 'Professional sunscreen wholesale prices seeing compression as more brands enter the category.',
      type: 'pricing_benchmark',
      status: 'draft',
      createdAt: daysAgo(1),
      views: 0,
      clicks: 0,
      direction: 'down',
    },
    {
      id: 'as-010',
      title: 'Scalp Treatment Menu Expansion Opportunity',
      description: 'Day spas adding scalp analysis and LED scalp therapy to service menus.',
      type: 'treatment_trend',
      status: 'draft',
      createdAt: daysAgo(2),
      views: 0,
      clicks: 0,
      direction: 'up',
    },
    {
      id: 'as-011',
      title: 'Bakuchiol Interest Plateau Report',
      description: 'Bakuchiol interest plateauing after initial surge. Not replacing retinoids in advanced protocols.',
      type: 'ingredient_momentum',
      status: 'archived',
      createdAt: daysAgo(30),
      views: 2345,
      clicks: 567,
      direction: 'down',
    },
    {
      id: 'as-012',
      title: 'Protocol-Based Product Training ROI',
      description: 'Brands offering protocol-based education seeing 2.1x faster professional adoption.',
      type: 'education',
      status: 'active',
      createdAt: daysAgo(4),
      views: 789,
      clicks: 234,
      direction: 'up',
    },
    {
      id: 'as-013',
      title: 'Northeast Clean Beauty Demand Index',
      description: 'New York and New England operators showing strongest preference for clean and sustainable formulations.',
      type: 'regional',
      status: 'active',
      createdAt: daysAgo(9),
      views: 456,
      clicks: 123,
      direction: 'up',
    },
    {
      id: 'as-014',
      title: 'Fermented Actives Formulation Trend',
      description: 'Fermented ingredient complexes seeing renewed interest in professional channels with stronger clinical data.',
      type: 'ingredient_momentum',
      status: 'draft',
      createdAt: daysAgo(3),
      views: 0,
      clicks: 0,
      direction: 'up',
    },
    {
      id: 'as-015',
      title: 'Express Facial Format Revenue Analysis',
      description: 'Sub-30-minute express facials converting first-time clients at higher rates with strong retail attachment.',
      type: 'treatment_trend',
      status: 'active',
      createdAt: daysAgo(5),
      views: 678,
      clicks: 189,
      direction: 'up',
    },
    {
      id: 'as-016',
      title: 'Polyglutamic Acid Hydration Signal',
      description: 'PGA emerging as next-generation hydration ingredient with 4x water-binding capacity vs hyaluronic acid.',
      type: 'ingredient_momentum',
      status: 'active',
      createdAt: daysAgo(6),
      views: 534,
      clicks: 156,
      direction: 'up',
    },
    {
      id: 'as-017',
      title: 'Device Certification Program Demand',
      description: 'Demand for brand-certified device training programs up 29% as professionals seek certification.',
      type: 'education',
      status: 'active',
      createdAt: daysAgo(7),
      views: 445,
      clicks: 112,
      direction: 'up',
    },
    {
      id: 'as-018',
      title: 'Ingredient Disclosure Regulation Update',
      description: 'State-level ingredient disclosure requirements expanding. California and New York leading.',
      type: 'regulatory_alert',
      status: 'draft',
      createdAt: daysAgo(2),
      views: 0,
      clicks: 0,
      direction: 'up',
    },
  ];
}

export function getBrandAnalytics(): BrandAnalytics {
  return {
    brandName: 'Dermalogica',
    totalRevenue: 284500,
    revenueGrowth: 14.2,
    orderCount: 387,
    topProducts: [
      { name: 'Daily Microfoliant', revenue: 42300, orders: 156 },
      { name: 'BioLumin-C Serum', revenue: 38700, orders: 134 },
      { name: 'Precleanse Oil', revenue: 31200, orders: 112 },
      { name: 'Multi-Active Toner', revenue: 24800, orders: 98 },
      { name: 'Skin Smoothing Cream', revenue: 21400, orders: 87 },
    ],
    resellerCount: 142,
    growthTrajectory: 'growing',
  };
}

export function getBrandProtocols(): BrandProtocol[] {
  return [
    {
      id: 'bp-001',
      name: 'Pro Power Peel Protocol',
      description: 'Multi-layer chemical peel system combining salicylic, glycolic, and lactic acids for progressive resurfacing. Customizable intensity for different skin types and tolerance levels.',
      skinConcerns: ['Hyperpigmentation', 'Fine Lines', 'Texture', 'Congestion'],
      products: [
        { name: 'PreCleanse Oil', step: 1, usage: 'Apply to dry skin, emulsify with water' },
        { name: 'Special Cleansing Gel', step: 2, usage: 'Double cleanse, 60-second massage' },
        { name: 'Multi-Active Toner', step: 3, usage: 'Prep skin, balance pH' },
        { name: 'Pro Power Peel 30%', step: 4, usage: 'Apply evenly, monitor 5-8 minutes' },
        { name: 'UltraCalming Serum Concentrate', step: 5, usage: 'Neutralize and soothe' },
        { name: 'Barrier Repair Complex', step: 6, usage: 'Restore barrier function' },
      ],
      brandName: 'Dermalogica',
    },
    {
      id: 'bp-002',
      name: 'BioLumin-C Brightening Facial',
      description: 'Advanced vitamin C brightening protocol targeting dullness, uneven tone, and photoaging. Incorporates LED therapy for enhanced product penetration.',
      skinConcerns: ['Dullness', 'Uneven Tone', 'Photoaging', 'Dark Spots'],
      products: [
        { name: 'PreCleanse Balm', step: 1, usage: 'Melt-away cleanse, warm towel removal' },
        { name: 'Daily Microfoliant', step: 2, usage: 'Enzyme exfoliation, 2-minute activation' },
        { name: 'BioLumin-C Serum', step: 3, usage: 'Apply to treatment zones' },
        { name: 'MultiVitamin Power Firm', step: 4, usage: 'Massage into skin with effleurage' },
        { name: 'Prisma Protect SPF 30', step: 5, usage: 'Final protective layer' },
      ],
      brandName: 'Dermalogica',
    },
    {
      id: 'bp-003',
      name: 'UltraCalming Recovery Protocol',
      description: 'Specialized protocol for sensitized, reactive skin. Focuses on barrier restoration and inflammation reduction using oat-based actives.',
      skinConcerns: ['Sensitivity', 'Redness', 'Rosacea', 'Barrier Damage'],
      products: [
        { name: 'UltraCalming Cleanser', step: 1, usage: 'Gentle cleanse, no friction' },
        { name: 'Calm Water Gel', step: 2, usage: 'Hydration layer, pat application' },
        { name: 'UltraCalming Serum Concentrate', step: 3, usage: 'Targeted inflammation zones' },
        { name: 'Barrier Defense Booster', step: 4, usage: 'Mix 3 drops into moisturizer' },
        { name: 'Skin Recovery SPF 50', step: 5, usage: 'Mineral protection, no chemical filters' },
      ],
      brandName: 'Dermalogica',
    },
    {
      id: 'bp-004',
      name: 'AGE Smart Renewal Protocol',
      description: 'Anti-aging protocol combining retinol, peptides, and vitamin C for comprehensive age management. Designed for mature skin with chronoaging concerns.',
      skinConcerns: ['Wrinkles', 'Loss of Firmness', 'Age Spots', 'Chronoaging'],
      products: [
        { name: 'PreCleanse Oil', step: 1, usage: 'Oil cleanse to remove makeup' },
        { name: 'Skin Resurfacing Cleanser', step: 2, usage: 'Lactic acid cleanse, 90 seconds' },
        { name: 'Age Reversal Eye Complex', step: 3, usage: 'Orbital bone application' },
        { name: 'Overnight Retinol Repair 1%', step: 4, usage: 'Professional-strength, even application' },
        { name: 'Dynamic Skin Recovery SPF 50', step: 5, usage: 'Polypeptide moisturizer with SPF' },
      ],
      brandName: 'Dermalogica',
    },
    {
      id: 'bp-005',
      name: 'Clear Start Acne Protocol',
      description: 'Acne management protocol for oily and breakout-prone skin. Combines salicylic acid with niacinamide for oil regulation and bacterial control.',
      skinConcerns: ['Acne', 'Excess Oil', 'Congestion', 'Post-Inflammatory Hyperpigmentation'],
      products: [
        { name: 'Clearing Skin Wash', step: 1, usage: 'Salicylic acid cleanse, focus T-zone' },
        { name: 'Breakout Clearing Booster', step: 2, usage: 'Spot treatment on active lesions' },
        { name: 'Oil Clearing Matte Moisturizer SPF 15', step: 3, usage: 'Lightweight coverage' },
      ],
      brandName: 'Dermalogica',
    },
    {
      id: 'bp-006',
      name: 'Hydration Intensive Protocol',
      description: 'Deep hydration protocol for dehydrated, devitalized skin. Multi-layer approach using hyaluronic acid at varying molecular weights for full-depth hydration.',
      skinConcerns: ['Dehydration', 'Tightness', 'Fine Lines', 'Dull Texture'],
      products: [
        { name: 'Micellar Prebiotic PreCleanse', step: 1, usage: 'Gentle micellar removal' },
        { name: 'Intensive Moisture Cleanser', step: 2, usage: 'Cream cleanse, no stripping' },
        { name: 'Hyaluronic Acid Fill & Treat', step: 3, usage: 'Multi-weight HA application' },
        { name: 'Skin Smoothing Cream', step: 4, usage: 'Occlusive seal, massage technique' },
        { name: 'Prisma Protect SPF 30', step: 5, usage: 'Luminous finish protection' },
      ],
      brandName: 'Dermalogica',
    },
  ];
}

export function getBrandResellers(): BrandReseller[] {
  return [
    { name: 'Glow Medspa & Wellness', orders: 34, lastOrder: daysAgo(3), tier: 'Premier', status: 'active', revenue: 28400, city: 'Scottsdale', state: 'AZ' },
    { name: 'The Skin Studio NYC', orders: 28, lastOrder: daysAgo(5), tier: 'Premier', status: 'active', revenue: 24200, city: 'New York', state: 'NY' },
    { name: 'Pacific Dermatology Spa', orders: 22, lastOrder: daysAgo(7), tier: 'Standard', status: 'active', revenue: 19800, city: 'San Diego', state: 'CA' },
    { name: 'Luminaire Day Spa', orders: 19, lastOrder: daysAgo(4), tier: 'Standard', status: 'active', revenue: 16500, city: 'Austin', state: 'TX' },
    { name: 'Belle Aesthetics', orders: 15, lastOrder: daysAgo(12), tier: 'Standard', status: 'active', revenue: 13200, city: 'Miami', state: 'FL' },
    { name: 'Revive Clinical Spa', orders: 12, lastOrder: daysAgo(8), tier: 'Standard', status: 'active', revenue: 10400, city: 'Denver', state: 'CO' },
    { name: 'Serenity Skin Clinic', orders: 8, lastOrder: daysAgo(21), tier: 'Standard', status: 'warning', revenue: 6800, city: 'Portland', state: 'OR' },
    { name: 'Urban Glow Medspa', orders: 5, lastOrder: daysAgo(45), tier: 'Standard', status: 'at-risk', revenue: 4200, city: 'Chicago', state: 'IL' },
    { name: 'Desert Rose Wellness', orders: 3, lastOrder: daysAgo(60), tier: 'Standard', status: 'at-risk', revenue: 2100, city: 'Phoenix', state: 'AZ' },
    { name: 'Bloom Beauty Bar', orders: 2, lastOrder: daysAgo(90), tier: 'Standard', status: 'inactive', revenue: 1400, city: 'Nashville', state: 'TN' },
  ];
}

export function getBrandEducation(): BrandEducationItem[] {
  return [
    { title: 'Pro Power Peel Certification Course', type: 'Course', views: 2340, completions: 1890, ceCredits: 4.0 },
    { title: 'BioLumin-C Application Techniques', type: 'Video', views: 1856, completions: 1423, ceCredits: 1.5 },
    { title: 'Skin Analysis & Prescription Guide', type: 'PDF Guide', views: 3120, completions: 2870, ceCredits: 2.0 },
    { title: 'UltraCalming Protocol for Reactive Skin', type: 'Course', views: 1245, completions: 987, ceCredits: 3.0 },
    { title: 'Retinol Protocols: Safety & Efficacy', type: 'Webinar', views: 2567, completions: 1934, ceCredits: 2.5 },
    { title: 'Product Knowledge: AGE Smart Line', type: 'Video', views: 1678, completions: 1234, ceCredits: 1.0 },
    { title: 'Consultation Framework for Acne Clients', type: 'PDF Guide', views: 945, completions: 812, ceCredits: 1.5 },
    { title: 'Advanced Chemical Peel Theory', type: 'Course', views: 1890, completions: 1456, ceCredits: 5.0 },
  ];
}

export function getWeeklyInsights(): WeeklyInsight[] {
  return [
    {
      id: 'wi-001',
      title: 'Peptide Serum Category Outperforming',
      description: 'Peptide-based serums are generating 2.3x higher reorder rates than the category average. Consider featuring these in the Intelligence Hub and notifying operators with skincare-focused menus.',
      metric: '+230% reorder rate',
      type: 'opportunity',
    },
    {
      id: 'wi-002',
      title: 'Medspa Operator Churn Risk Detected',
      description: '14 medspa operators have not placed orders in 45+ days. Historical patterns suggest targeted outreach within the next 2 weeks reduces churn by 38%.',
      metric: '14 operators at risk',
      type: 'risk',
    },
    {
      id: 'wi-003',
      title: 'Average Order Value Benchmark',
      description: 'Platform AOV is $847, up 6% from last month. Top-performing operators average $1,240 per order. Brands offering protocol bundles drive 34% higher AOV.',
      metric: '$847 avg (+6%)',
      type: 'benchmark',
    },
    {
      id: 'wi-004',
      title: 'Education-to-Purchase Pipeline Acceleration',
      description: 'Operators who complete at least one brand education course place their first order 3.2x faster. Recommend surfacing education content more prominently in the operator onboarding flow.',
      metric: '3.2x faster conversion',
      type: 'opportunity',
    },
  ];
}

export function getAdminReports(): AdminReport[] {
  return [
    {
      id: 'ar-001',
      title: 'Q1 2026 Marketplace Intelligence Report',
      type: 'report',
      createdAt: daysAgo(5),
      status: 'published',
      metrics: [
        { label: 'Operators Analyzed', value: '2,847' },
        { label: 'Signals Generated', value: '342' },
        { label: 'Revenue Tracked', value: '$4.2M' },
      ],
    },
    {
      id: 'ar-002',
      title: 'Dermalogica Brand Activation — March 2026',
      type: 'campaign',
      createdAt: daysAgo(3),
      status: 'published',
      brand: 'Dermalogica',
      metrics: [
        { label: 'New Accounts', value: '23' },
        { label: 'Campaign Revenue', value: '$34.2k' },
        { label: 'Conversion Rate', value: '18.4%' },
      ],
    },
    {
      id: 'ar-003',
      title: 'iS Clinical Market Penetration Snapshot',
      type: 'snapshot',
      createdAt: daysAgo(7),
      status: 'published',
      brand: 'iS Clinical',
      metrics: [
        { label: 'Market Share', value: '8.2%' },
        { label: 'Active Resellers', value: '89' },
        { label: 'Growth Rate', value: '+14%' },
      ],
    },
    {
      id: 'ar-004',
      title: 'Southwest Regional Demand Analysis',
      type: 'analysis',
      createdAt: daysAgo(10),
      status: 'published',
      metrics: [
        { label: 'Regional Operators', value: '412' },
        { label: 'Top Category', value: 'Sun Protection' },
        { label: 'Growth Rate', value: '+31%' },
      ],
    },
    {
      id: 'ar-005',
      title: 'SkinCeuticals Competitive Intelligence',
      type: 'snapshot',
      createdAt: daysAgo(2),
      status: 'draft',
      brand: 'SkinCeuticals',
      metrics: [
        { label: 'Market Position', value: '#3' },
        { label: 'Account Growth', value: '+22%' },
        { label: 'Avg Order Value', value: '$1,120' },
      ],
    },
    {
      id: 'ar-006',
      title: 'LED Therapy Protocol Impact Study',
      type: 'analysis',
      createdAt: daysAgo(14),
      status: 'published',
      metrics: [
        { label: 'Protocols Tracked', value: '156' },
        { label: 'Revenue Uplift', value: '+34%' },
        { label: 'Client Satisfaction', value: '94%' },
      ],
    },
    {
      id: 'ar-007',
      title: 'Clean Beauty Trend Report — 2026 Outlook',
      type: 'report',
      createdAt: daysAgo(1),
      status: 'draft',
      metrics: [
        { label: 'Brands Tracked', value: '42' },
        { label: 'Category Growth', value: '+28%' },
        { label: 'Operator Interest', value: 'High' },
      ],
    },
    {
      id: 'ar-008',
      title: 'Medspa Operator Retention Analysis',
      type: 'report',
      createdAt: daysAgo(21),
      status: 'archived',
      metrics: [
        { label: 'Retention Rate', value: '87%' },
        { label: 'Avg Lifetime', value: '14 months' },
        { label: 'Churn Drivers', value: '3 identified' },
      ],
    },
  ];
}
