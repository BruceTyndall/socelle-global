-- INTEL-PREMIUM-01 Part A: Add enrichment columns to market_signals
-- Supports article-enricher edge function for full-text extraction,
-- OG metadata, quality scoring, and content segmentation.
-- Authority: PREMIUM_CONTENT_SPEC.md §Part A

ALTER TABLE public.market_signals
  ADD COLUMN IF NOT EXISTS article_body text,
  ADD COLUMN IF NOT EXISTS article_html text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_segment text
    CHECK (content_segment IN (
      'breaking', 'deep_dive', 'trend_report', 'research',
      'product_launch', 'regulatory_update', 'opinion',
      'how_to', 'event_coverage', 'market_data', 'social_pulse'
    )),
  ADD COLUMN IF NOT EXISTS topic_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS word_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_score integer DEFAULT 0
    CHECK (quality_score >= 0 AND quality_score <= 100),
  ADD COLUMN IF NOT EXISTS is_enriched boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS enriched_at timestamptz,
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS geo_source text;

-- Performance indexes for enrichment queries and UI sorting
CREATE INDEX IF NOT EXISTS idx_market_signals_quality_score ON market_signals (quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_market_signals_content_segment ON market_signals (content_segment);
CREATE INDEX IF NOT EXISTS idx_market_signals_is_enriched ON market_signals (is_enriched) WHERE is_enriched = false;
CREATE INDEX IF NOT EXISTS idx_market_signals_published_at ON market_signals (published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_market_signals_hero_image ON market_signals (hero_image_url) WHERE hero_image_url IS NOT NULL;
