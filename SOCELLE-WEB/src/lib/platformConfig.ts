/**
 * Platform Configuration
 * Centralizes all hardcoded values, thresholds, and brand-specific settings.
 * Supports multi-brand white-labeling.
 */

// ─── Retry & Timing Configuration ────────────────────────────────
export const RETRY_CONFIG = {
  /** Delay after profile fetch failure before retry (ms) */
  PROFILE_FETCH_DELAY: 800,
  /** Delay after profile auto-creation before re-fetch (ms) */
  PROFILE_CREATE_DELAY: 500,
  /** Delay after critical error before retry (ms) */
  CRITICAL_ERROR_DELAY: 800,
  /** Max retries for profile fetch */
  MAX_PROFILE_RETRIES: 2,
} as const;

// ─── Service Mapping Thresholds ──────────────────────────────────
export const MAPPING_THRESHOLDS = {
  /** Minimum score for "Exact" match */
  EXACT_MATCH: 90,
  /** Minimum score for "Partial" match */
  PARTIAL_MATCH: 70,
  /** Minimum score for "Candidate" match */
  CANDIDATE_MATCH: 40,
  /** Seasonal boost for relevant matches (added to score) */
  SEASONAL_BOOST: 5,
  /** Maximum confidence score */
  MAX_SCORE: 100,
} as const;

// ─── Duration Match Scoring ──────────────────────────────────────
export const DURATION_THRESHOLDS = {
  EXACT: { max_diff: 0, score: 100 },
  CLOSE: { max_diff: 5, score: 90 },
  NEAR: { max_diff: 10, score: 75 },
  MODERATE: { max_diff: 15, score: 50 },
  FAR: { max_diff: 30, score: 25 },
} as const;

// ─── Scoring Weights ─────────────────────────────────────────────
export const SCORING_WEIGHTS = {
  NAME: 0.50,
  DURATION: 0.20,
  CATEGORY: 0.20,
  CONCERN: 0.10,
} as const;

// ─── Retail Attach Scoring ───────────────────────────────────────
export const RETAIL_ATTACH_SCORES = {
  PROTOCOL_ALLOWED: 50,
  EXACT_CATEGORY: 25,
  RELATED_CATEGORY: 15,
  CONCERN_MATCH_PER: 10,
  MAX_CONCERN_BONUS: 30,
  SEASONAL_BONUS: 10,
} as const;

// ─── AI Concierge Limits ─────────────────────────────────────────
export const CONCIERGE_LIMITS = {
  PROTOCOLS: 15,
  RETAIL_PRODUCTS: 25,
  PRO_PRODUCTS: 25,
  MARKETING_CALENDAR: 12,
} as const;

// ─── Query & Pagination ──────────────────────────────────────────
export const QUERY_CONFIG = {
  /** Default page size for paginated queries */
  DEFAULT_PAGE_SIZE: 25,
  /** Maximum rows for unbounded queries */
  MAX_QUERY_LIMIT: 100,
  /** Default limit for medspa tables */
  MEDSPA_LIMIT: 100,
} as const;

// ─── Default Categories ──────────────────────────────────────────
export const DEFAULT_CATEGORY = 'FACIALS';

export const SERVICE_CATEGORIES = [
  'FACIALS',
  'FACIAL ENHANCEMENTS / ADD-ONS',
  'ADVANCED / CORRECTIVE FACIALS',
  'MASSAGE THERAPY',
  'BODY SCRUBS / POLISHES',
  'BODY WRAPS / BODY TREATMENTS',
  'HAND & FOOT TREATMENTS',
  'HYDROTHERAPY / RITUALS',
  'ONCOLOGY-SAFE SERVICES',
  'SEASONAL / LIMITED SERVICES',
  'MED-SPA TREATMENTS',
] as const;

// ─── Multi-Brand Concierge Configuration ─────────────────────────
export interface BrandConciergeConfig {
  displayName: string;
  tagline: string;
  description: string;
  disclaimer: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

/**
 * Get concierge config for a specific brand.
 * Falls back to platform defaults for unknown brands.
 */
export function getBrandConciergeConfig(brandSlug?: string): BrandConciergeConfig {
  const brandConfigs: Record<string, BrandConciergeConfig> = {
    naturopathica: {
      displayName: 'Naturopathica Concierge',
      tagline: 'Your Brand & Product Expert',
      description: 'I\'m your governed AI assistant for Naturopathica. I can explain products, protocols, budgets, and implementation—all based on verified data.',
      disclaimer: 'Responses based on verified Naturopathica data only',
      accentColor: '#059669',
      gradientFrom: 'from-emerald-600',
      gradientTo: 'to-teal-700',
    },
  };

  return brandConfigs[brandSlug ?? ''] ?? {
    displayName: 'Brand Concierge',
    tagline: 'Your Brand & Product Expert',
    description: 'I\'m your AI assistant. I can explain products, protocols, budgets, and implementation—all based on verified brand data.',
    disclaimer: 'Responses based on verified brand data only',
    accentColor: '#3b82f6',
    gradientFrom: 'from-pro-navy',
    gradientTo: 'to-pro-charcoal',
  };
}

// ─── Supabase Error Code Map ─────────────────────────────────────
export const SUPABASE_ERROR_MAP: Record<string, string> = {
  PGRST301: 'You do not have permission to access this resource.',
  PGRST116: 'The requested record was not found.',
  '42501': 'You do not have permission to perform this action.',
  '23505': 'This record already exists.',
  '23503': 'This record references data that does not exist.',
  '42P01': 'The requested data table is not available.',
  PGRST204: 'No data was returned from the server.',
};
