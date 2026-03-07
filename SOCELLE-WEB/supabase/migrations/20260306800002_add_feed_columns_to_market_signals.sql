-- W15-02: Add source_feed_id and is_duplicate to market_signals
-- ADD ONLY — never edit existing migrations (AGENT_SCOPE_REGISTRY §Backend Agent)
-- Authority: build_tracker.md WO W15-02
--
-- source_feed_id: FK to data_feeds.id — links each signal to its originating feed
-- is_duplicate: boolean flag for dedup pipeline (downstream can filter/merge)
--
-- Existing rows unaffected: both columns default to NULL/false.

ALTER TABLE public.market_signals
  ADD COLUMN IF NOT EXISTS source_feed_id uuid REFERENCES data_feeds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_duplicate boolean NOT NULL DEFAULT false;

-- Index for feed-level signal queries (admin dashboard, feed health)
CREATE INDEX IF NOT EXISTS idx_market_signals_source_feed_id
  ON public.market_signals (source_feed_id)
  WHERE source_feed_id IS NOT NULL;

-- Index for dedup filtering
CREATE INDEX IF NOT EXISTS idx_market_signals_is_duplicate
  ON public.market_signals (is_duplicate)
  WHERE is_duplicate = true;

COMMENT ON COLUMN public.market_signals.source_feed_id IS
  'W15-02: FK to data_feeds.id — which feed produced this signal. NULL for manual/legacy signals.';

COMMENT ON COLUMN public.market_signals.is_duplicate IS
  'W15-02: Dedup flag. true = this signal has been identified as a duplicate of another signal. Downstream queries can filter these out.';
