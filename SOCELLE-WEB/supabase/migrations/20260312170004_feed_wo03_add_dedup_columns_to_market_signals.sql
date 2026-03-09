-- FEED-WO-03: Add fingerprint + source_feed_id + is_duplicate to market_signals
-- fingerprint: btoa(title|source|pubDate) — dedup key for rss-to-signals
-- source_feed_id: FK to data_feeds.id — which feed produced this signal
-- is_duplicate: flag for pipeline dedup detection
-- ADD ONLY — never modify existing migrations

ALTER TABLE public.market_signals
  ADD COLUMN IF NOT EXISTS fingerprint     text,
  ADD COLUMN IF NOT EXISTS source_feed_id  uuid REFERENCES public.data_feeds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_duplicate    boolean NOT NULL DEFAULT false;

-- Unique index on fingerprint (allows one signal per content hash)
CREATE UNIQUE INDEX IF NOT EXISTS market_signals_fingerprint_idx
  ON public.market_signals (fingerprint)
  WHERE fingerprint IS NOT NULL;

-- Index for feed-level queries
CREATE INDEX IF NOT EXISTS idx_market_signals_source_feed_id
  ON public.market_signals (source_feed_id)
  WHERE source_feed_id IS NOT NULL;

-- Index for dedup filtering
CREATE INDEX IF NOT EXISTS idx_market_signals_is_duplicate
  ON public.market_signals (is_duplicate)
  WHERE is_duplicate = true;

COMMENT ON COLUMN public.market_signals.fingerprint IS
  'FEED-WO-03: Dedup hash = btoa(title|source|pubDate). Unique constraint prevents double-ingestion.';
COMMENT ON COLUMN public.market_signals.source_feed_id IS
  'FEED-WO-03: FK to data_feeds.id — which feed produced this signal. NULL for manual/legacy signals.';
COMMENT ON COLUMN public.market_signals.is_duplicate IS
  'FEED-WO-03: true = detected as duplicate of another signal with same fingerprint.';
