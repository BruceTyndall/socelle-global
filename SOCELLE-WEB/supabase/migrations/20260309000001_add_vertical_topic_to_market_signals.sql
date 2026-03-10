-- INTEL-MEDSPA-01: Add vertical, topic, geo, impact_score, tier_min to market_signals
-- ADD ONLY — backward-compatible defaults. Existing rows unaffected.
ALTER TABLE public.market_signals
  ADD COLUMN IF NOT EXISTS vertical text
    CHECK (vertical IN ('medspa', 'salon', 'beauty_brand', 'multi'))
    DEFAULT 'multi',
  ADD COLUMN IF NOT EXISTS topic text
    CHECK (topic IN (
      'pricing', 'treatment_trend', 'ingredient', 'regulation',
      'safety', 'science', 'jobs', 'events', 'technology',
      'consumer_trend', 'market_data', 'brand_news', 'other'
    )),
  ADD COLUMN IF NOT EXISTS geo_country text,
  ADD COLUMN IF NOT EXISTS geo_region text,
  ADD COLUMN IF NOT EXISTS impact_score integer DEFAULT 0
    CHECK (impact_score >= 0 AND impact_score <= 100),
  ADD COLUMN IF NOT EXISTS tier_min text
    CHECK (tier_min IN ('free', 'paid'))
    DEFAULT 'paid';

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_market_signals_vertical
  ON public.market_signals (vertical);
CREATE INDEX IF NOT EXISTS idx_market_signals_topic
  ON public.market_signals (topic);
CREATE INDEX IF NOT EXISTS idx_market_signals_tier_min
  ON public.market_signals (tier_min);
CREATE INDEX IF NOT EXISTS idx_market_signals_impact_score
  ON public.market_signals (impact_score DESC);

COMMENT ON COLUMN public.market_signals.vertical IS
  'INTEL-MEDSPA-01: Business vertical. medspa=med spa/aesthetics, salon=hair/nail/day spa, beauty_brand=brand-side, multi=cross-vertical';
COMMENT ON COLUMN public.market_signals.topic IS
  'INTEL-MEDSPA-01: Signal topic classification for filtering and tiering';
COMMENT ON COLUMN public.market_signals.impact_score IS
  'INTEL-MEDSPA-01: 0-100 composite score: source authority + recency + relevance';
COMMENT ON COLUMN public.market_signals.tier_min IS
  'INTEL-MEDSPA-01: Minimum subscription tier to see this signal. free=visible to all, paid=subscribers only';
