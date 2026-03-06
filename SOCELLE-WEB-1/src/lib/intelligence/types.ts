// ── Intelligence Hub — Core Types ──────────────────────────────────
// V1: typed for mock data; V2: maps directly to Supabase intelligence_signals table

export type SignalType =
  | 'product_velocity'
  | 'treatment_trend'
  | 'ingredient_momentum'
  | 'brand_adoption'
  | 'regional'
  | 'pricing_benchmark'
  | 'regulatory_alert'
  | 'education';

export type SignalDirection = 'up' | 'down' | 'stable';

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
}

export interface MarketPulse {
  total_professionals: number;
  total_brands: number;
  active_signals: number;
  signals_this_week: number;
  trending_category: string;
}

export type SignalFilterKey = 'all' | SignalType;
