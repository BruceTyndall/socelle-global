/**
 * Enterprise Intelligence API — Mock Data
 * WO-21: Mock endpoints, clients, and usage statistics.
 */

import type { ApiEndpoint, ApiClient, ApiUsage, ApiPricingTier } from './types';

// ─── Endpoints ───────────────────────────────────────────────────
const MOCK_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'ep-001',
    path: '/v1/intelligence/signals',
    method: 'GET',
    summary: 'List market intelligence signals',
    description:
      'Returns paginated market intelligence signals including trending ingredients, category shifts, pricing movements, and adoption velocity data across the professional beauty industry. Supports filtering by category, region, time range, and signal strength.',
    category: 'Intelligence',
    tier: 'starter',
    params: [
      { name: 'category', type: 'string', required: false, description: 'Filter by signal category: skincare, haircare, devices, ingredients, compliance' },
      { name: 'region', type: 'string', required: false, description: 'Filter by US region: northeast, southeast, midwest, west, southwest' },
      { name: 'min_strength', type: 'number', required: false, description: 'Minimum signal strength (0-100)' },
      { name: 'since', type: 'string', required: false, description: 'ISO 8601 date — return signals created after this date' },
      { name: 'limit', type: 'number', required: false, description: 'Results per page (default: 25, max: 100)' },
      { name: 'offset', type: 'number', required: false, description: 'Pagination offset' },
    ],
    responseExample: JSON.stringify(
      {
        data: [
          {
            id: 'sig-8a3f',
            title: 'Peptide Complex Adoption Surge',
            category: 'ingredients',
            strength: 87,
            direction: 'rising',
            region: 'national',
            first_detected: '2026-02-18T00:00:00Z',
            affected_categories: ['skincare', 'anti-aging'],
            summary: 'Peptide-based protocols have seen 34% increased adoption among medspas in Q1 2026.',
          },
        ],
        meta: { total: 142, limit: 25, offset: 0 },
      },
      null,
      2
    ),
  },
  {
    id: 'ep-002',
    path: '/v1/intelligence/trends',
    method: 'GET',
    summary: 'Retrieve trend analysis reports',
    description:
      'Returns trend analysis data showing movement patterns across product categories, treatment modalities, and ingredient families. Includes historical time-series data for charting adoption curves.',
    category: 'Intelligence',
    tier: 'professional',
    params: [
      { name: 'category', type: 'string', required: true, description: 'Trend category: products, treatments, ingredients, pricing' },
      { name: 'period', type: 'string', required: false, description: 'Time period: 30d, 90d, 6m, 1y (default: 90d)' },
      { name: 'granularity', type: 'string', required: false, description: 'Data granularity: daily, weekly, monthly (default: weekly)' },
    ],
    responseExample: JSON.stringify(
      {
        data: {
          category: 'ingredients',
          period: '90d',
          trends: [
            {
              name: 'Exosomes',
              current_score: 92,
              change_30d: +18,
              time_series: [
                { date: '2026-01-06', score: 74 },
                { date: '2026-01-13', score: 78 },
                { date: '2026-01-20', score: 83 },
              ],
            },
          ],
        },
      },
      null,
      2
    ),
  },
  {
    id: 'ep-003',
    path: '/v1/brands/{brand_id}/analytics',
    method: 'GET',
    summary: 'Brand performance analytics',
    description:
      'Returns performance analytics for a specific brand including order velocity, reseller adoption rate, average order value, category share, and competitive positioning data.',
    category: 'Brands',
    tier: 'professional',
    params: [
      { name: 'brand_id', type: 'string', required: true, description: 'Brand UUID' },
      { name: 'period', type: 'string', required: false, description: 'Time period: 30d, 90d, 6m, 1y (default: 90d)' },
      { name: 'metrics', type: 'string', required: false, description: 'Comma-separated metrics: orders, revenue, aov, adoption, share' },
    ],
    responseExample: JSON.stringify(
      {
        data: {
          brand_id: 'b-29a1c4',
          brand_name: 'Environ Skin Care',
          period: '90d',
          metrics: {
            total_orders: 847,
            revenue: 284300,
            average_order_value: 335.66,
            reseller_count: 128,
            new_resellers_period: 14,
            category_share: 0.087,
            category_rank: 3,
          },
        },
      },
      null,
      2
    ),
  },
  {
    id: 'ep-004',
    path: '/v1/market/categories',
    method: 'GET',
    summary: 'Market category overview',
    description:
      'Returns market overview data for all tracked product and service categories including size estimates, growth rates, top brands, and emerging sub-categories within the professional beauty space.',
    category: 'Market Data',
    tier: 'starter',
    params: [
      { name: 'segment', type: 'string', required: false, description: 'Segment filter: skincare, haircare, devices, wellness, injectables' },
      { name: 'include_brands', type: 'boolean', required: false, description: 'Include top brands per category (default: false)' },
    ],
    responseExample: JSON.stringify(
      {
        data: [
          {
            id: 'cat-skin',
            name: 'Professional Skincare',
            segment: 'skincare',
            estimated_market_size_usd: 18400000000,
            yoy_growth: 0.072,
            top_brands: ['SkinCeuticals', 'Environ', 'Circadia', 'Revision'],
            emerging_subcategories: ['Peptide Complexes', 'Exosome Therapy', 'Barrier Repair'],
          },
        ],
        meta: { total: 12 },
      },
      null,
      2
    ),
  },
  {
    id: 'ep-005',
    path: '/v1/intelligence/reports',
    method: 'POST',
    summary: 'Generate custom intelligence report',
    description:
      'Triggers generation of a custom intelligence report based on specified parameters. Returns a report ID that can be polled for completion. Enterprise-tier clients receive priority processing and white-label formatting options.',
    category: 'Reports',
    tier: 'enterprise',
    params: [
      { name: 'report_type', type: 'string', required: true, description: 'Report type: market_overview, competitive_analysis, trend_forecast, category_deep_dive' },
      { name: 'categories', type: 'string[]', required: true, description: 'Array of category IDs to include' },
      { name: 'period', type: 'string', required: false, description: 'Analysis period: 90d, 6m, 1y (default: 90d)' },
      { name: 'format', type: 'string', required: false, description: 'Output format: json, pdf, xlsx (default: json)' },
      { name: 'white_label', type: 'boolean', required: false, description: 'Enterprise only — remove Socelle branding' },
    ],
    responseExample: JSON.stringify(
      {
        data: {
          report_id: 'rpt-7f2a9b',
          status: 'processing',
          estimated_completion: '2026-03-04T14:30:00Z',
          poll_url: '/v1/intelligence/reports/rpt-7f2a9b',
        },
      },
      null,
      2
    ),
  },
];

// ─── Clients ─────────────────────────────────────────────────────
const MOCK_CLIENTS: ApiClient[] = [
  {
    id: 'cli-001',
    clientName: 'GlowUp Analytics',
    apiKey: 'sk_live_gUA8x...redacted',
    tier: 'starter',
    rateLimitPerMinute: 30,
    monthlyQuota: 10000,
    monthlyUsed: 4821,
    active: true,
    createdAt: '2026-01-15T10:00:00Z',
    contactEmail: 'api@glowupanalytics.com',
  },
  {
    id: 'cli-002',
    clientName: 'Derma Intelligence Corp',
    apiKey: 'sk_live_dIC3r...redacted',
    tier: 'professional',
    rateLimitPerMinute: 120,
    monthlyQuota: 100000,
    monthlyUsed: 67342,
    active: true,
    createdAt: '2025-11-03T14:00:00Z',
    contactEmail: 'dev@dermaintel.com',
  },
  {
    id: 'cli-003',
    clientName: 'BeautyTech Ventures',
    apiKey: 'sk_live_bTV9k...redacted',
    tier: 'enterprise',
    rateLimitPerMinute: 600,
    monthlyQuota: -1, // unlimited
    monthlyUsed: 241893,
    active: true,
    createdAt: '2025-08-20T09:00:00Z',
    contactEmail: 'engineering@beautytech.vc',
  },
];

// ─── Usage ───────────────────────────────────────────────────────
const MOCK_USAGE: ApiUsage[] = [
  // GlowUp Analytics
  { clientId: 'cli-001', date: '2026-03-01', endpoint: '/v1/intelligence/signals', requestCount: 312, errorCount: 2, avgLatencyMs: 145 },
  { clientId: 'cli-001', date: '2026-03-02', endpoint: '/v1/intelligence/signals', requestCount: 287, errorCount: 1, avgLatencyMs: 138 },
  { clientId: 'cli-001', date: '2026-03-03', endpoint: '/v1/market/categories', requestCount: 95, errorCount: 0, avgLatencyMs: 92 },
  { clientId: 'cli-001', date: '2026-03-01', endpoint: '/v1/market/categories', requestCount: 108, errorCount: 0, avgLatencyMs: 88 },
  // Derma Intelligence Corp
  { clientId: 'cli-002', date: '2026-03-01', endpoint: '/v1/intelligence/signals', requestCount: 2841, errorCount: 12, avgLatencyMs: 132 },
  { clientId: 'cli-002', date: '2026-03-02', endpoint: '/v1/intelligence/trends', requestCount: 1563, errorCount: 5, avgLatencyMs: 198 },
  { clientId: 'cli-002', date: '2026-03-03', endpoint: '/v1/brands/{brand_id}/analytics', requestCount: 892, errorCount: 3, avgLatencyMs: 210 },
  { clientId: 'cli-002', date: '2026-03-01', endpoint: '/v1/market/categories', requestCount: 420, errorCount: 0, avgLatencyMs: 95 },
  // BeautyTech Ventures
  { clientId: 'cli-003', date: '2026-03-01', endpoint: '/v1/intelligence/signals', requestCount: 12450, errorCount: 38, avgLatencyMs: 118 },
  { clientId: 'cli-003', date: '2026-03-02', endpoint: '/v1/intelligence/trends', requestCount: 8920, errorCount: 24, avgLatencyMs: 155 },
  { clientId: 'cli-003', date: '2026-03-03', endpoint: '/v1/brands/{brand_id}/analytics', requestCount: 5640, errorCount: 11, avgLatencyMs: 187 },
  { clientId: 'cli-003', date: '2026-03-01', endpoint: '/v1/intelligence/reports', requestCount: 84, errorCount: 1, avgLatencyMs: 1420 },
  { clientId: 'cli-003', date: '2026-03-02', endpoint: '/v1/market/categories', requestCount: 3200, errorCount: 6, avgLatencyMs: 98 },
];

// ─── Pricing Tiers ───────────────────────────────────────────────
const MOCK_PRICING: ApiPricingTier[] = [
  {
    tier: 'starter',
    name: 'Starter',
    price: '$199',
    priceNote: 'per month',
    requests: '10,000 requests/mo',
    features: [
      'Market signals endpoint',
      'Category overview data',
      'Basic filtering & pagination',
      'Community support',
      '30 requests/minute rate limit',
      'JSON response format',
      'Standard SLA (99.5%)',
    ],
    highlighted: false,
    ctaLabel: 'Get Started',
  },
  {
    tier: 'professional',
    name: 'Professional',
    price: '$499',
    priceNote: 'per month',
    requests: '100,000 requests/mo',
    features: [
      'All Starter endpoints',
      'Trend analysis with time-series',
      'Brand performance analytics',
      'Historical data access (1 year)',
      'Priority email support',
      '120 requests/minute rate limit',
      'Webhook notifications',
      'Enhanced SLA (99.9%)',
    ],
    highlighted: true,
    ctaLabel: 'Get Started',
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'contact sales',
    requests: 'Unlimited requests',
    features: [
      'All Professional endpoints',
      'Custom report generation',
      'White-label formatting',
      'Dedicated account manager',
      'Phone + Slack support',
      '600+ requests/minute',
      'Custom webhooks & integrations',
      'Enterprise SLA (99.99%)',
      'On-premise deployment option',
      'Custom data retention',
    ],
    highlighted: false,
    ctaLabel: 'Contact Sales',
  },
];

// ─── Accessor Functions ──────────────────────────────────────────

export function getApiEndpoints(): ApiEndpoint[] {
  return MOCK_ENDPOINTS;
}

export function getApiClients(): ApiClient[] {
  return MOCK_CLIENTS;
}

export function getApiUsage(clientId?: string): ApiUsage[] {
  if (clientId) {
    return MOCK_USAGE.filter((u) => u.clientId === clientId);
  }
  return MOCK_USAGE;
}

export function getApiPricing(): ApiPricingTier[] {
  return MOCK_PRICING;
}

export function getApiClientById(id: string): ApiClient | undefined {
  return MOCK_CLIENTS.find((c) => c.id === id);
}

export function getApiUsageSummary() {
  const totalClients = MOCK_CLIENTS.filter((c) => c.active).length;
  const totalRequests = MOCK_USAGE.reduce((sum, u) => sum + u.requestCount, 0);
  const totalErrors = MOCK_USAGE.reduce((sum, u) => sum + u.errorCount, 0);
  const avgLatency = Math.round(
    MOCK_USAGE.reduce((sum, u) => sum + u.avgLatencyMs, 0) / MOCK_USAGE.length
  );
  // Mock revenue: starter $199, professional $499, enterprise $2499
  const revenueMap: Record<string, number> = { starter: 199, professional: 499, enterprise: 2499 };
  const monthlyRevenue = MOCK_CLIENTS.filter((c) => c.active).reduce(
    (sum, c) => sum + (revenueMap[c.tier] || 0),
    0
  );

  return {
    totalClients,
    totalRequests,
    totalErrors,
    avgLatency,
    monthlyRevenue,
    errorRate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0',
  };
}
