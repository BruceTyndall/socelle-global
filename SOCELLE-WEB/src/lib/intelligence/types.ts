// ── Intelligence Hub — Core Types ──────────────────────────────────
// V1: typed for mock data; V2: maps to Supabase market_signals table
// V3 (W15-04): expanded signal_types from feed pipeline + provenance + tier

export type SignalType =
  | 'product_velocity'
  | 'treatment_trend'
  | 'ingredient_momentum'
  | 'brand_adoption'
  | 'regional'
  | 'pricing_benchmark'
  | 'regulatory_alert'
  | 'education'
  // W15-04: feed-derived signal types (from CATEGORY_SIGNAL_TYPE map)
  | 'industry_news'
  | 'brand_update'
  | 'press_release'
  | 'social_trend'
  | 'job_market'
  | 'event_signal'
  | 'research_insight'
  | 'ingredient_trend'
  | 'market_data'
  | 'regional_market'
  | 'supply_chain';

export type SignalDirection = 'up' | 'down' | 'stable';

export type TierVisibility = 'free' | 'pro' | 'admin';

export interface IntelligenceSignal {
  id: string;
  rss_item_id?: string;
  signal_type: SignalType;
  signal_key: string;
  title: string;
  description: string;
  magnitude: number; // percentage change or score
  direction: SignalDirection;
  region?: string;
  category?: string;
  related_brands?: string[];
  related_products?: string[];
  updated_at: string;
  source?: string;
  // W15-04: provenance + tier fields
  source_url?: string;
  source_name?: string;
  source_feed_id?: string;
  confidence_score?: number;
  tier_visibility?: TierVisibility;
  image_url?: string;
  is_duplicate?: boolean;
  fingerprint?: string;
  similar_signals?: IntelligenceSignal[];
  // INTEL-MEDSPA-01: classification + scoring (were computed at ingest but missing from type)
  impact_score?: number;
  vertical?: string;
  topic?: string;
  tier_min?: string;
  primary_environment?: string;
  primary_vertical?: string;
  service_tags?: string[];
  product_tags?: string[];
  claim_tags?: string[];
  region_tags?: string[];
  trend_tags?: string[];
  brand_names?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  score_importance?: number;
  // MERCH-INTEL-03-FINAL: Premium Data Gates
  requires_credit?: boolean;
  status?: string;
  // MERCH-REMEDIATION-01: source authority tier (1=regulatory, 2=academic, 3=trade_pub)
  provenance_tier?: number;
  // INTEL-PREMIUM-01: premium content fields
  article_body?: string;
  article_html?: string;
  hero_image_url?: string;
  image_urls?: string[];
  content_segment?: string;
  topic_tags?: string[];
  reading_time_minutes?: number;
  word_count?: number;
  quality_score?: number;
  is_enriched?: boolean;
  enriched_at?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  author?: string;
  published_at?: string;
  geo_source?: string;
}

export type IntelligenceChannelAudience = 'all' | 'provider' | 'brand';
export type IntelligenceChannelTierMin = 'free' | 'paid';

export interface IntelligenceChannelTag {
  tag_code: string;
  display_label: string;
  category_group: string;
  weight: number;
  required: boolean;
  signal_count: number;
  engagement_per_signal: number;
  unique_actor_count: number;
  tag_rank: number;
}

export interface IntelligenceChannel {
  channel_id: string;
  slug: string;
  name: string;
  eyebrow?: string;
  summary: string;
  audience: IntelligenceChannelAudience;
  tier_min: IntelligenceChannelTierMin;
  icon_key: string;
  accent_token: string;
  region_scope: string[];
  vertical_scope: string[];
  signal_type_scope: SignalType[];
  sort_order: number;
  configured_tag_count: number;
  required_tag_count: number;
  weighted_signal_count: number;
  weighted_engagement_score: number;
  weighted_unique_actor_count: number;
  last_published_at?: string | null;
  last_event_at?: string | null;
  top_tags: IntelligenceChannelTag[];
  top_signals: IntelligenceSignal[];
  personalization_score: number;
  rank_score: number;
  is_locked: boolean;
}

export interface MarketPulse {
  total_professionals: number;
  total_brands: number;
  active_signals: number;
  signals_this_week: number;
  trending_category: string;
}

export type ContentSegment =
  | 'breaking'
  | 'deep_dive'
  | 'trend_report'
  | 'research'
  | 'product_launch'
  | 'regulatory_update'
  | 'opinion'
  | 'how_to'
  | 'event_coverage'
  | 'market_data'
  | 'social_pulse';

export type SignalFilterKey = 'all' | SignalType;
