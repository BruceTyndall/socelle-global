// ── Brand Intelligence — Mock Data Layer ──────────────────────────────────────
// V1: deterministic mock data based on brand slug
// V2: swap to Supabase intelligence_signals + analytics queries

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BrandPeerData {
  /** Number of licensed professionals using this brand */
  professionalCount: number;
  /** Most common business type using this brand */
  primarySegment: string;
  /** Percentage of similar businesses that stock this brand */
  peerAdoptionPercent: number;
  /** Average number of SKUs stocked from this brand */
  avgSkusStocked: number;
  /** Recommendation label for spas like the viewer */
  peerRecommendation: string;
}

export interface BrandReorderData {
  /** Average days between reorders */
  avgDaysBetweenOrders: number;
  /** Descriptive frequency label */
  frequencyLabel: string;
  /** Most reordered product category */
  topReorderCategory: string;
  /** Percent of accounts on auto-reorder */
  autoReorderPercent: number;
}

export interface BrandProtocol {
  name: string;
  category: string;
  popularity: 'high' | 'medium' | 'low';
}

export interface ProfessionalAlsoBought {
  productName: string;
  brandName: string;
  category: string;
  adoptionPercent: number;
}

// ── Deterministic hash for consistent mock data per slug ──────────────────────

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    const char = slug.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Trending Brands ──────────────────────────────────────────────────────────

const TRENDING_SLUGS = new Set([
  'skinceuticals', 'is-clinical', 'jan-marini', 'alastin',
  'eltamd', 'revision-skincare', 'environ', 'cosmedix',
  'image-skincare', 'pca-skin', 'hydrafacial', 'dermalogica',
]);

/**
 * Determines if a brand is currently trending on the platform.
 * V1: curated list + hash-based for unknown slugs.
 */
export function isBrandTrending(brandSlug: string): boolean {
  if (TRENDING_SLUGS.has(brandSlug)) return true;
  // ~30% of unknown brands are "trending"
  return hashSlug(brandSlug) % 10 < 3;
}

// ── Adoption Count ──────────────────────────────────────────────────────────

const ADOPTION_MAP: Record<string, number> = {
  'skinceuticals': 342,
  'is-clinical': 287,
  'jan-marini': 198,
  'alastin': 176,
  'eltamd': 412,
  'revision-skincare': 234,
  'environ': 156,
  'cosmedix': 189,
  'image-skincare': 267,
  'pca-skin': 223,
  'hydrafacial': 378,
  'dermalogica': 445,
  'obagi': 201,
  'neocutis': 134,
  'colorescience': 167,
  'skinmedica': 289,
  'zo-skin-health': 312,
  'glytone': 98,
  'epionce': 112,
  'replenix': 87,
};

/**
 * Returns the number of spas/professionals that added this brand this quarter.
 * V1: curated map + hash-generated for unknown slugs.
 */
export function getBrandAdoptionCount(brandSlug: string): number {
  if (ADOPTION_MAP[brandSlug]) return ADOPTION_MAP[brandSlug];
  // Generate between 24 and 180 for unknown brands
  return 24 + (hashSlug(brandSlug) % 157);
}

// ── Category Tags ────────────────────────────────────────────────────────────

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  'skinceuticals': ['Clinical', 'Anti-aging', 'Antioxidants'],
  'is-clinical': ['Clinical', 'Growth Factors', 'Brightening'],
  'jan-marini': ['Clinical', 'Retinol', 'Resurfacing'],
  'alastin': ['Post-Procedure', 'Barrier Repair', 'Regenerative'],
  'eltamd': ['Sun Protection', 'Sensitive Skin', 'Mineral'],
  'revision-skincare': ['Clinical', 'Multi-Peptide', 'Anti-aging'],
  'environ': ['Vitamin A', 'Step-Up System', 'Clinical'],
  'cosmedix': ['Clean-Clinical', 'Chirally Correct', 'Brightening'],
  'image-skincare': ['Multi-Category', 'Professional Peels', 'Hydration'],
  'pca-skin': ['Clinical', 'Peels', 'Hyperpigmentation'],
  'hydrafacial': ['Device-Paired', 'Hydration', 'Treatment Room'],
  'dermalogica': ['Education-Led', 'Skin Health', 'Backbar'],
  'obagi': ['Clinical', 'Rx-Adjacent', 'Hyperpigmentation'],
  'skinmedica': ['Growth Factors', 'Clinical', 'Anti-aging'],
  'zo-skin-health': ['Clinical', 'Aggressive Protocols', 'Retinol'],
};

/**
 * Returns category/specialty tags for a brand.
 */
export function getBrandCategoryTags(brandSlug: string): string[] {
  if (CATEGORY_TAG_MAP[brandSlug]) return CATEGORY_TAG_MAP[brandSlug];
  // Generic fallback based on hash
  const options = [
    ['Professional Grade', 'Skincare'],
    ['Clinical', 'Treatment Room'],
    ['Clean Beauty', 'Professional'],
    ['Backbar', 'Retail-Ready'],
    ['Specialty', 'Results-Driven'],
  ];
  return options[hashSlug(brandSlug) % options.length];
}

// ── Treatment Protocol Context ──────────────────────────────────────────────

const PROTOCOL_MAP: Record<string, BrandProtocol[]> = {
  'skinceuticals': [
    { name: 'Advanced Anti-Aging Facial', category: 'Anti-aging', popularity: 'high' },
    { name: 'Brightening Peel Protocol', category: 'Brightening', popularity: 'high' },
    { name: 'Post-Laser Recovery', category: 'Post-procedure', popularity: 'medium' },
    { name: 'Acne Clarifying Treatment', category: 'Acne', popularity: 'medium' },
  ],
  'is-clinical': [
    { name: 'Fire & Ice Facial', category: 'Resurfacing', popularity: 'high' },
    { name: 'Growth Factor Renewal', category: 'Regenerative', popularity: 'high' },
    { name: 'Brightening Complex Treatment', category: 'Brightening', popularity: 'medium' },
  ],
  'alastin': [
    { name: 'Post-Procedure Recovery Protocol', category: 'Post-procedure', popularity: 'high' },
    { name: 'Laser Aftercare Program', category: 'Post-procedure', popularity: 'high' },
    { name: 'Injectable Recovery Support', category: 'Post-procedure', popularity: 'medium' },
  ],
  'eltamd': [
    { name: 'Daily Protection Protocol', category: 'Sun protection', popularity: 'high' },
    { name: 'Post-Peel Sun Care', category: 'Post-procedure', popularity: 'high' },
    { name: 'Sensitive Skin Barrier Program', category: 'Barrier repair', popularity: 'medium' },
  ],
  'hydrafacial': [
    { name: 'Signature HydraFacial', category: 'Hydration', popularity: 'high' },
    { name: 'Platinum HydraFacial', category: 'Premium', popularity: 'high' },
    { name: 'Clarifying Booster Protocol', category: 'Acne', popularity: 'medium' },
    { name: 'Age-Refinement Booster', category: 'Anti-aging', popularity: 'medium' },
  ],
  'pca-skin': [
    { name: 'Modified Jessner Peel', category: 'Chemical peels', popularity: 'high' },
    { name: 'Sensi Peel Protocol', category: 'Sensitive skin', popularity: 'high' },
    { name: 'Ultra Peel Forte', category: 'Resurfacing', popularity: 'medium' },
  ],
};

/**
 * Returns treatment protocols associated with a brand.
 */
export function getBrandProtocols(brandSlug: string): BrandProtocol[] {
  if (PROTOCOL_MAP[brandSlug]) return PROTOCOL_MAP[brandSlug];
  // Generic fallback protocols
  const hash = hashSlug(brandSlug);
  const templates: BrandProtocol[][] = [
    [
      { name: 'Signature Facial Protocol', category: 'Facial', popularity: 'high' },
      { name: 'Deep Hydration Treatment', category: 'Hydration', popularity: 'medium' },
    ],
    [
      { name: 'Corrective Skin Program', category: 'Corrective', popularity: 'high' },
      { name: 'Maintenance Facial', category: 'Maintenance', popularity: 'medium' },
    ],
    [
      { name: 'Express Treatment Protocol', category: 'Express', popularity: 'medium' },
      { name: 'Advanced Renewal Facial', category: 'Anti-aging', popularity: 'high' },
    ],
  ];
  return templates[hash % templates.length];
}

/**
 * Returns protocol names as a simple string array (convenience wrapper).
 */
export function getBrandProtocolNames(brandSlug: string): string[] {
  return getBrandProtocols(brandSlug).map((p) => p.name);
}

// ── Peer Adoption Data ──────────────────────────────────────────────────────

const PEER_DATA_MAP: Record<string, BrandPeerData> = {
  'skinceuticals': {
    professionalCount: 1243,
    primarySegment: 'Medspas & Clinical Spas',
    peerAdoptionPercent: 68,
    avgSkusStocked: 12,
    peerRecommendation: 'Spas like yours typically stock 8-14 SKUs from SkinCeuticals',
  },
  'is-clinical': {
    professionalCount: 967,
    primarySegment: 'Medspas & Dermatology Clinics',
    peerAdoptionPercent: 54,
    avgSkusStocked: 8,
    peerRecommendation: 'Spas like yours typically stock 6-10 SKUs from iS Clinical',
  },
  'eltamd': {
    professionalCount: 1589,
    primarySegment: 'All Professional Segments',
    peerAdoptionPercent: 72,
    avgSkusStocked: 5,
    peerRecommendation: 'Most spas stock the UV Clear + UV Daily duo as baseline',
  },
  'hydrafacial': {
    professionalCount: 1834,
    primarySegment: 'Day Spas & Medspas',
    peerAdoptionPercent: 61,
    avgSkusStocked: 15,
    peerRecommendation: 'Spas like yours typically maintain full booster inventory',
  },
  'dermalogica': {
    professionalCount: 2156,
    primarySegment: 'Day Spas & Salons',
    peerAdoptionPercent: 78,
    avgSkusStocked: 18,
    peerRecommendation: 'Spas like yours typically stock 14-22 SKUs across backbar + retail',
  },
};

/**
 * Returns peer adoption data for a brand.
 */
export function getBrandPeerData(brandSlug: string): BrandPeerData {
  if (PEER_DATA_MAP[brandSlug]) return PEER_DATA_MAP[brandSlug];

  const hash = hashSlug(brandSlug);
  const segments = [
    'Day Spas & Salons',
    'Medspas & Clinical Spas',
    'Boutique Estheticians',
    'Multi-Location Operators',
  ];

  const professionalCount = 120 + (hash % 900);
  const avgSkus = 3 + (hash % 15);
  return {
    professionalCount,
    primarySegment: segments[hash % segments.length],
    peerAdoptionPercent: 20 + (hash % 55),
    avgSkusStocked: avgSkus,
    peerRecommendation: `Spas like yours typically stock ${avgSkus - 2}-${avgSkus + 2} SKUs from this brand`,
  };
}

// ── Reorder Frequency ───────────────────────────────────────────────────────

const REORDER_MAP: Record<string, BrandReorderData> = {
  'skinceuticals': {
    avgDaysBetweenOrders: 28,
    frequencyLabel: 'Monthly',
    topReorderCategory: 'Vitamin C Serums',
    autoReorderPercent: 34,
  },
  'eltamd': {
    avgDaysBetweenOrders: 35,
    frequencyLabel: 'Monthly',
    topReorderCategory: 'UV Clear Broad-Spectrum SPF 46',
    autoReorderPercent: 41,
  },
  'hydrafacial': {
    avgDaysBetweenOrders: 21,
    frequencyLabel: 'Bi-weekly',
    topReorderCategory: 'Treatment Serums & Boosters',
    autoReorderPercent: 52,
  },
  'dermalogica': {
    avgDaysBetweenOrders: 32,
    frequencyLabel: 'Monthly',
    topReorderCategory: 'Backbar Cleansers',
    autoReorderPercent: 28,
  },
  'pca-skin': {
    avgDaysBetweenOrders: 42,
    frequencyLabel: 'Every 6 weeks',
    topReorderCategory: 'Professional Peel Solutions',
    autoReorderPercent: 22,
  },
};

/**
 * Returns reorder frequency data for a brand.
 */
export function getBrandReorderFrequency(brandSlug: string): BrandReorderData {
  if (REORDER_MAP[brandSlug]) return REORDER_MAP[brandSlug];

  const hash = hashSlug(brandSlug);
  const frequencies: Array<{ days: number; label: string }> = [
    { days: 21, label: 'Bi-weekly' },
    { days: 28, label: 'Monthly' },
    { days: 35, label: 'Monthly' },
    { days: 42, label: 'Every 6 weeks' },
    { days: 56, label: 'Every 8 weeks' },
  ];
  const categories = [
    'Core Serums', 'Cleansers & Prep', 'Treatment Masks',
    'SPF Products', 'Moisturizers', 'Specialty Actives',
  ];
  const freq = frequencies[hash % frequencies.length];
  return {
    avgDaysBetweenOrders: freq.days,
    frequencyLabel: freq.label,
    topReorderCategory: categories[hash % categories.length],
    autoReorderPercent: 12 + (hash % 40),
  };
}

// ── "Professionals Also Bought" ─────────────────────────────────────────────

const ALSO_BOUGHT_MAP: Record<string, ProfessionalAlsoBought[]> = {
  'skinceuticals': [
    { productName: 'UV Clear SPF 46', brandName: 'EltaMD', category: 'Sun Protection', adoptionPercent: 72 },
    { productName: 'HA5 Rejuvenating Hydrator', brandName: 'SkinMedica', category: 'Hydration', adoptionPercent: 48 },
    { productName: 'Restorative Skin Complex', brandName: 'Alastin', category: 'Post-Procedure', adoptionPercent: 41 },
    { productName: 'Clinical Repair Complex', brandName: 'Neocutis', category: 'Regenerative', adoptionPercent: 35 },
  ],
  'is-clinical': [
    { productName: 'C E Ferulic', brandName: 'SkinCeuticals', category: 'Antioxidant', adoptionPercent: 65 },
    { productName: 'UV Physical SPF 41', brandName: 'EltaMD', category: 'Sun Protection', adoptionPercent: 58 },
    { productName: 'Retinol 0.5', brandName: 'SkinCeuticals', category: 'Anti-aging', adoptionPercent: 42 },
  ],
  'eltamd': [
    { productName: 'C E Ferulic', brandName: 'SkinCeuticals', category: 'Antioxidant', adoptionPercent: 68 },
    { productName: 'Fire & Ice System', brandName: 'iS Clinical', category: 'Resurfacing', adoptionPercent: 44 },
    { productName: 'Sensi Peel', brandName: 'PCA Skin', category: 'Chemical Peels', adoptionPercent: 38 },
  ],
  'hydrafacial': [
    { productName: 'UV Clear SPF 46', brandName: 'EltaMD', category: 'Sun Protection', adoptionPercent: 74 },
    { productName: 'Hydrating B5 Gel', brandName: 'SkinCeuticals', category: 'Hydration', adoptionPercent: 52 },
    { productName: 'Daily Microfoliant', brandName: 'Dermalogica', category: 'Exfoliation', adoptionPercent: 39 },
  ],
};

/**
 * Returns products that professionals who buy this brand also buy.
 */
export function getProfessionalsAlsoBought(brandSlug: string): ProfessionalAlsoBought[] {
  if (ALSO_BOUGHT_MAP[brandSlug]) return ALSO_BOUGHT_MAP[brandSlug];

  // Generic fallback
  const hash = hashSlug(brandSlug);
  const genericSets: ProfessionalAlsoBought[][] = [
    [
      { productName: 'UV Clear SPF 46', brandName: 'EltaMD', category: 'Sun Protection', adoptionPercent: 62 },
      { productName: 'C E Ferulic', brandName: 'SkinCeuticals', category: 'Antioxidant', adoptionPercent: 48 },
      { productName: 'Hyaluronic Acid Boosting Serum', brandName: 'PCA Skin', category: 'Hydration', adoptionPercent: 35 },
    ],
    [
      { productName: 'Active Serum', brandName: 'iS Clinical', category: 'Multi-Correctional', adoptionPercent: 55 },
      { productName: 'UV Physical SPF 41', brandName: 'EltaMD', category: 'Sun Protection', adoptionPercent: 51 },
      { productName: 'Restorative Skin Complex', brandName: 'Alastin', category: 'Regenerative', adoptionPercent: 32 },
    ],
    [
      { productName: 'Retinol 0.5', brandName: 'SkinCeuticals', category: 'Anti-aging', adoptionPercent: 58 },
      { productName: 'Daily Microfoliant', brandName: 'Dermalogica', category: 'Exfoliation', adoptionPercent: 44 },
      { productName: 'Sensi Peel', brandName: 'PCA Skin', category: 'Chemical Peels', adoptionPercent: 30 },
    ],
  ];
  return genericSets[hash % genericSets.length];
}

// ── Intelligence Filter Options ─────────────────────────────────────────────

export type BrandIntelFilter = 'trending' | 'most_adopted' | 'new_to_platform' | 'medspa_recommended';

export const BRAND_INTEL_FILTERS: Array<{ key: BrandIntelFilter; label: string }> = [
  { key: 'trending', label: 'Trending' },
  { key: 'most_adopted', label: 'Most Adopted' },
  { key: 'new_to_platform', label: 'New to Platform' },
  { key: 'medspa_recommended', label: 'Medspa Recommended' },
];

/**
 * Check if a brand passes a given intelligence filter.
 */
export function brandPassesIntelFilter(brandSlug: string, filter: BrandIntelFilter): boolean {
  const hash = hashSlug(brandSlug);
  switch (filter) {
    case 'trending':
      return isBrandTrending(brandSlug);
    case 'most_adopted':
      return getBrandAdoptionCount(brandSlug) >= 150;
    case 'new_to_platform':
      // ~25% of brands are "new"
      return hash % 4 === 0;
    case 'medspa_recommended':
      // ~40% of brands are medspa-recommended
      return hash % 5 < 2;
  }
}
