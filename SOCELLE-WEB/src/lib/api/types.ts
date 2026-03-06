/**
 * Enterprise Intelligence API — Type Definitions
 * WO-21: API client, usage, endpoint, and tier types.
 */

// ─── Tier ────────────────────────────────────────────────────────
export type ApiTier = 'starter' | 'professional' | 'enterprise';

// ─── Client ──────────────────────────────────────────────────────
export interface ApiClient {
  id: string;
  clientName: string;
  apiKey: string;
  tier: ApiTier;
  rateLimitPerMinute: number;
  monthlyQuota: number;
  monthlyUsed: number;
  active: boolean;
  createdAt: string;
  contactEmail: string;
}

// ─── Usage ───────────────────────────────────────────────────────
export interface ApiUsage {
  clientId: string;
  date: string;
  endpoint: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
}

// ─── Endpoint Parameter ──────────────────────────────────────────
export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

// ─── Endpoint Definition ─────────────────────────────────────────
export interface ApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  summary: string;
  params: ApiParam[];
  responseExample: string;
  tier: ApiTier;
  category: string;
}

// ─── Pricing Tier ────────────────────────────────────────────────
export interface ApiPricingTier {
  tier: ApiTier;
  name: string;
  price: string;
  priceNote: string;
  requests: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
}
