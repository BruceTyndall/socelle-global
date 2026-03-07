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
}

export interface MarketPulse {
  total_professionals: number;
  total_brands: number;
  active_signals: number;
  signals_this_week: number;
  trending_category: string;
}

export type SignalFilterKey = 'all' | SignalType;
