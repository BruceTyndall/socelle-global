-- INTEL-PREMIUM-01: Premium content pipeline schema
-- Authority: PREMIUM_CONTENT_SPEC.md Part A
-- Adds full article body, hero images, content segmentation, quality scoring,
-- and enrichment tracking to market_signals table.
-- All columns use ADD COLUMN IF NOT EXISTS for idempotency.

-- ── New columns ────────────────────────────────────────────────────────────────

ALTER TABLE public.market_signals
  ADD COLUMN IF NOT EXISTS article_body text,
  ADD COLUMN IF NOT EXISTS article_html text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_segment text,
  ADD COLUMN IF NOT EXISTS topic_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS word_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_enriched boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS enriched_at timestamptz,
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS geo_source text;

-- ── CHECK constraints (added separately for IF NOT EXISTS compatibility) ──────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'market_signals_content_segment_check'
  ) THEN
    ALTER TABLE public.market_signals
      ADD CONSTRAINT market_signals_content_segment_check
      CHECK (content_segment IN (
        'breaking', 'deep_dive', 'trend_report', 'research',
        'product_launch', 'regulatory_update', 'opinion',
        'how_to', 'event_coverage', 'market_data', 'social_pulse'
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'market_signals_quality_score_range'
  ) THEN
    ALTER TABLE public.market_signals
      ADD CONSTRAINT market_signals_quality_score_range
      CHECK (quality_score >= 0 AND quality_score <= 100);
  END IF;
END $$;

-- ── Indexes ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_market_signals_quality_score
  ON public.market_signals (quality_score DESC);

CREATE INDEX IF NOT EXISTS idx_market_signals_content_segment
  ON public.market_signals (content_segment);

CREATE INDEX IF NOT EXISTS idx_market_signals_is_enriched
  ON public.market_signals (is_enriched) WHERE is_enriched = false;

CREATE INDEX IF NOT EXISTS idx_market_signals_published_at
  ON public.market_signals (published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_market_signals_hero_image
  ON public.market_signals (hero_image_url) WHERE hero_image_url IS NOT NULL;

-- ── Column comments (WO authority) ─────────────────────────────────────────────

COMMENT ON COLUMN public.market_signals.article_body IS 'INTEL-PREMIUM-01: Full plain-text article content, up to 20K chars. Stripped from article_html.';
COMMENT ON COLUMN public.market_signals.article_html IS 'INTEL-PREMIUM-01: Full HTML article content from content:encoded or fetched source, up to 50K chars.';
COMMENT ON COLUMN public.market_signals.hero_image_url IS 'INTEL-PREMIUM-01: Primary image URL extracted from RSS enclosure/media tags, OG image, or first img in content.';
COMMENT ON COLUMN public.market_signals.image_urls IS 'INTEL-PREMIUM-01: Array of all image URLs found in article content.';
COMMENT ON COLUMN public.market_signals.content_segment IS 'INTEL-PREMIUM-01: Content classification — breaking, deep_dive, trend_report, research, product_launch, regulatory_update, opinion, how_to, event_coverage, market_data, social_pulse.';
COMMENT ON COLUMN public.market_signals.topic_tags IS 'INTEL-PREMIUM-01: Auto-generated topic tags from article content analysis.';
COMMENT ON COLUMN public.market_signals.reading_time_minutes IS 'INTEL-PREMIUM-01: Estimated reading time at 200 WPM.';
COMMENT ON COLUMN public.market_signals.word_count IS 'INTEL-PREMIUM-01: Word count of article_body plain text.';
COMMENT ON COLUMN public.market_signals.quality_score IS 'INTEL-PREMIUM-01: Composite quality score 0-100 based on word count, images, author, provenance, freshness.';
COMMENT ON COLUMN public.market_signals.is_enriched IS 'INTEL-PREMIUM-01: Whether article-enricher has processed this signal (fetched full article + OG data).';
COMMENT ON COLUMN public.market_signals.enriched_at IS 'INTEL-PREMIUM-01: Timestamp when article-enricher last processed this signal.';
COMMENT ON COLUMN public.market_signals.og_title IS 'INTEL-PREMIUM-01: OpenGraph title from source URL.';
COMMENT ON COLUMN public.market_signals.og_description IS 'INTEL-PREMIUM-01: OpenGraph description from source URL.';
COMMENT ON COLUMN public.market_signals.og_image IS 'INTEL-PREMIUM-01: OpenGraph image from source URL.';
COMMENT ON COLUMN public.market_signals.author IS 'INTEL-PREMIUM-01: Article author from dc:creator, author tag, or OG meta.';
COMMENT ON COLUMN public.market_signals.published_at IS 'INTEL-PREMIUM-01: Original publication timestamp from feed pubDate or article meta.';
COMMENT ON COLUMN public.market_signals.geo_source IS 'INTEL-PREMIUM-01: Geographic source detected from URL TLD or content keywords (e.g., US, UK, KR, JP).';
