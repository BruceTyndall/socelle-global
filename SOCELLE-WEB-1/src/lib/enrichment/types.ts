// ── External Enrichment Pipeline — Type Definitions ───────────────
// WO-16: Types for operator and brand enrichment from external sources
// V1: Mock data layer; V2: real API integrations (Google, Yelp, social)

// ── Enrichment Sources ─────────────────────────────────────────────

export type EnrichmentSource =
  | 'google_reviews'
  | 'website'
  | 'social'
  | 'yelp'
  | 'tripadvisor';

export type EnrichmentConfidence = 'high' | 'medium' | 'low';

// ── Operator Enrichment Profile ────────────────────────────────────

export interface OperatorEnrichment {
  /** Google Business Profile rating (1.0–5.0) */
  google_rating: number | null;
  /** Total Google review count */
  google_review_count: number | null;
  /** Extracted review themes (e.g. "relaxing facials", "clean skincare") */
  review_themes: string[];
  /** Extracted concerns from negative reviews */
  review_concerns: string[];
  /** Whether operator posts actively on social media */
  social_active: boolean;
  /** Brand names mentioned on social profiles */
  social_brand_mentions: string[];
  /** Primary website URL */
  website_url: string | null;
  /** Brands mentioned on operator website */
  website_mentions_brands: string[];
  /** Whether operator has online booking enabled */
  has_online_booking: boolean;
  /** Extracted service menu themes (e.g. "HydraFacial", "dermaplaning") */
  service_menu_themes: string[];
  /** Composite digital presence score (0–100) */
  digital_presence_score: number;
  /** Yelp rating (1.0–5.0) */
  yelp_rating: number | null;
  /** TripAdvisor rating (1.0–5.0) */
  tripadvisor_rating: number | null;
  /** ISO date of last enrichment run */
  enrichment_date: string;
  /** Confidence level based on data completeness */
  enrichment_confidence: EnrichmentConfidence;
}

// ── Brand Enrichment Profile ───────────────────────────────────────

export interface BrandEnrichment {
  /** Total social media followers across platforms */
  social_followers: number;
  /** Posts per week average */
  social_posting_frequency: number;
  /** Engagement rate as percentage */
  social_engagement_rate: number;
  /** Count of press/media mentions in last 90 days */
  press_mentions: number;
  /** Industry awards and recognitions */
  industry_awards: string[];
  /** ISO date of last enrichment run */
  enrichment_date: string;
}

// ── Scraping Return Types ──────────────────────────────────────────

export interface GoogleReviewData {
  rating: number;
  reviewCount: number;
  themes: string[];
}

export interface WebsiteAnalysis {
  mentionsBrands: string[];
  treatments: string[];
  hasBooking: boolean;
  hasRetailPage: boolean;
  digitalScore: number;
}

export interface SocialPresence {
  active: boolean;
  followers: number;
  postFrequency: number;
  brandMentions: string[];
}

export interface ReviewPlatformData {
  yelpRating: number | null;
  tripadvisorRating: number | null;
  recentThemes: string[];
}
