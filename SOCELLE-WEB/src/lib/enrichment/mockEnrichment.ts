// ── External Enrichment Pipeline — Mock Data ──────────────────────
// WO-16: Realistic mock enrichment profiles for professional beauty operators + brands
// V1: Static mock data; V2: Supabase enrichment_profiles table queries

import type { OperatorEnrichment, BrandEnrichment } from './types';

// ── Mock Operator Enrichment Profiles ──────────────────────────────

const MOCK_OPERATORS: Record<string, OperatorEnrichment> = {
  // High-end medspa with strong digital presence
  'op-001': {
    google_rating: 4.8,
    google_review_count: 312,
    review_themes: [
      'relaxing facials',
      'knowledgeable estheticians',
      'clean environment',
      'luxury experience',
      'results-driven treatments',
    ],
    review_concerns: ['parking limited', 'booking availability'],
    social_active: true,
    social_brand_mentions: ['SkinCeuticals', 'ZO Skin Health', 'Hydrafacial'],
    website_url: 'https://glowaesthetics.example.com',
    website_mentions_brands: ['SkinCeuticals', 'ZO Skin Health', 'Hydrafacial', 'Allergan'],
    has_online_booking: true,
    service_menu_themes: [
      'HydraFacial',
      'chemical peels',
      'microneedling',
      'Botox',
      'dermal fillers',
      'LED therapy',
    ],
    digital_presence_score: 92,
    yelp_rating: 4.5,
    tripadvisor_rating: null,
    enrichment_date: '2026-02-28T14:30:00Z',
    enrichment_confidence: 'high',
  },

  // Boutique day spa focused on organic treatments
  'op-002': {
    google_rating: 4.6,
    google_review_count: 187,
    review_themes: [
      'organic products',
      'calming atmosphere',
      'great massage',
      'clean skincare',
      'personalized service',
    ],
    review_concerns: ['limited parking', 'small waiting area'],
    social_active: true,
    social_brand_mentions: ['Eminence Organic', 'Naturopathica'],
    website_url: 'https://serenityorganicspa.example.com',
    website_mentions_brands: ['Eminence Organic', 'Naturopathica', 'FarmHouse Fresh'],
    has_online_booking: true,
    service_menu_themes: [
      'organic facials',
      'body wraps',
      'aromatherapy massage',
      'dermaplaning',
      'enzyme peels',
    ],
    digital_presence_score: 78,
    yelp_rating: 4.7,
    tripadvisor_rating: 4.5,
    enrichment_date: '2026-02-26T09:15:00Z',
    enrichment_confidence: 'high',
  },

  // Mid-range salon with treatment room
  'op-003': {
    google_rating: 4.3,
    google_review_count: 94,
    review_themes: [
      'friendly staff',
      'good value',
      'convenient location',
      'quick appointments',
    ],
    review_concerns: ['inconsistent results', 'upselling'],
    social_active: false,
    social_brand_mentions: [],
    website_url: 'https://bellavitasalon.example.com',
    website_mentions_brands: ['Dermalogica', 'OPI'],
    has_online_booking: true,
    service_menu_themes: [
      'express facials',
      'waxing',
      'lash extensions',
      'brow tinting',
      'basic chemical peels',
    ],
    digital_presence_score: 45,
    yelp_rating: 4.0,
    tripadvisor_rating: null,
    enrichment_date: '2026-02-20T11:00:00Z',
    enrichment_confidence: 'medium',
  },

  // Large multi-location medspa chain
  'op-004': {
    google_rating: 4.4,
    google_review_count: 528,
    review_themes: [
      'professional staff',
      'state-of-the-art equipment',
      'efficient service',
      'impressive results',
      'medical-grade treatments',
    ],
    review_concerns: ['corporate feel', 'wait times', 'pricing transparency'],
    social_active: true,
    social_brand_mentions: ['Allergan', 'Galderma', 'SkinCeuticals', 'Hydrafacial'],
    website_url: 'https://elitemedispa.example.com',
    website_mentions_brands: ['Allergan', 'Galderma', 'SkinCeuticals', 'Hydrafacial', 'ZO Skin Health'],
    has_online_booking: true,
    service_menu_themes: [
      'injectables',
      'laser treatments',
      'body contouring',
      'PRP therapy',
      'medical-grade peels',
      'IV therapy',
    ],
    digital_presence_score: 88,
    yelp_rating: 4.2,
    tripadvisor_rating: 4.0,
    enrichment_date: '2026-03-01T16:45:00Z',
    enrichment_confidence: 'high',
  },

  // Solo esthetician — limited digital footprint
  'op-005': {
    google_rating: 5.0,
    google_review_count: 28,
    review_themes: [
      'amazing attention to detail',
      'custom facials',
      'knowledgeable about ingredients',
    ],
    review_concerns: [],
    social_active: true,
    social_brand_mentions: ['iS Clinical', 'Rhonda Allison'],
    website_url: null,
    website_mentions_brands: [],
    has_online_booking: false,
    service_menu_themes: [
      'custom corrective facials',
      'advanced peels',
      'LED therapy',
      'microcurrent',
    ],
    digital_presence_score: 32,
    yelp_rating: null,
    tripadvisor_rating: null,
    enrichment_date: '2026-02-15T08:30:00Z',
    enrichment_confidence: 'low',
  },

  // Resort/hotel spa with strong TripAdvisor presence
  'op-006': {
    google_rating: 4.7,
    google_review_count: 243,
    review_themes: [
      'luxurious atmosphere',
      'excellent couples treatments',
      'resort-quality experience',
      'attentive staff',
      'premium products',
    ],
    review_concerns: ['premium pricing', 'advance booking required'],
    social_active: true,
    social_brand_mentions: ['Elemis', 'Tata Harper', 'La Mer'],
    website_url: 'https://oceanviewresort.example.com/spa',
    website_mentions_brands: ['Elemis', 'Tata Harper', 'La Mer', 'OSEA'],
    has_online_booking: true,
    service_menu_themes: [
      'signature facials',
      'body treatments',
      'couples rituals',
      'hydrotherapy',
      'hot stone massage',
      'seaweed wraps',
    ],
    digital_presence_score: 85,
    yelp_rating: 4.3,
    tripadvisor_rating: 4.8,
    enrichment_date: '2026-03-02T10:00:00Z',
    enrichment_confidence: 'high',
  },
};

// ── Mock Brand Enrichment Profiles ─────────────────────────────────

const MOCK_BRANDS: Record<string, BrandEnrichment> = {
  'brand-001': {
    social_followers: 245_000,
    social_posting_frequency: 5.2,
    social_engagement_rate: 3.8,
    press_mentions: 14,
    industry_awards: [
      'Skin Inc. Best Professional Serum 2025',
      'AES Innovation Award 2025',
      'NewBeauty Award Winner',
    ],
    enrichment_date: '2026-03-01T12:00:00Z',
  },
  'brand-002': {
    social_followers: 128_000,
    social_posting_frequency: 3.1,
    social_engagement_rate: 4.5,
    press_mentions: 8,
    industry_awards: [
      'ISPA Innovation Award 2025',
      'Organic Beauty Award Finalist',
    ],
    enrichment_date: '2026-02-28T09:00:00Z',
  },
  'brand-003': {
    social_followers: 510_000,
    social_posting_frequency: 7.0,
    social_engagement_rate: 2.1,
    press_mentions: 22,
    industry_awards: [
      'Allure Best of Beauty Pro 2025',
      'CEW Beauty Creator Award',
      'FDA 510(k) Cleared Device',
    ],
    enrichment_date: '2026-03-02T14:30:00Z',
  },
  'brand-004': {
    social_followers: 67_000,
    social_posting_frequency: 2.0,
    social_engagement_rate: 5.2,
    press_mentions: 3,
    industry_awards: [],
    enrichment_date: '2026-02-20T16:00:00Z',
  },
};

// ── Default fallback profile ───────────────────────────────────────

const DEFAULT_OPERATOR: OperatorEnrichment = {
  google_rating: null,
  google_review_count: null,
  review_themes: [],
  review_concerns: [],
  social_active: false,
  social_brand_mentions: [],
  website_url: null,
  website_mentions_brands: [],
  has_online_booking: false,
  service_menu_themes: [],
  digital_presence_score: 0,
  yelp_rating: null,
  tripadvisor_rating: null,
  enrichment_date: new Date().toISOString(),
  enrichment_confidence: 'low',
};

const DEFAULT_BRAND: BrandEnrichment = {
  social_followers: 0,
  social_posting_frequency: 0,
  social_engagement_rate: 0,
  press_mentions: 0,
  industry_awards: [],
  enrichment_date: new Date().toISOString(),
};

// ── Public Accessors ───────────────────────────────────────────────

/**
 * Retrieve enrichment profile for an operator.
 * Falls back to a known mock profile if operatorId isn't matched,
 * cycling through available mocks for demo purposes.
 */
export function getOperatorEnrichment(operatorId: string): OperatorEnrichment {
  if (MOCK_OPERATORS[operatorId]) {
    return MOCK_OPERATORS[operatorId];
  }

  // Deterministic fallback: hash operatorId to pick a mock profile
  const keys = Object.keys(MOCK_OPERATORS);
  const hash = operatorId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const key = keys[hash % keys.length];
  return MOCK_OPERATORS[key] || DEFAULT_OPERATOR;
}

/**
 * Retrieve enrichment profile for a brand.
 * Falls back to a known mock profile if brandId isn't matched.
 */
export function getBrandEnrichment(brandId: string): BrandEnrichment {
  if (MOCK_BRANDS[brandId]) {
    return MOCK_BRANDS[brandId];
  }

  const keys = Object.keys(MOCK_BRANDS);
  const hash = brandId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const key = keys[hash % keys.length];
  return MOCK_BRANDS[key] || DEFAULT_BRAND;
}

/**
 * Get all mock operator profiles (for admin/debug views).
 */
export function getAllOperatorEnrichments(): Record<string, OperatorEnrichment> {
  return { ...MOCK_OPERATORS };
}

/**
 * Get all mock brand profiles (for admin/debug views).
 */
export function getAllBrandEnrichments(): Record<string, BrandEnrichment> {
  return { ...MOCK_BRANDS };
}
