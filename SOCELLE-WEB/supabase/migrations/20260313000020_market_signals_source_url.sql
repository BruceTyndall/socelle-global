-- MERCH-INTEL-02: Add source_url to market_signals
-- Fixes feed-orchestrator insert bug (column was being set but didn't exist)
-- Allows linking from signals back to the original source article.

ALTER TABLE market_signals
  ADD COLUMN IF NOT EXISTS source_url text;

COMMENT ON COLUMN market_signals.source_url IS 'Canonical URL of the source article or item that generated this signal. Set by feed-orchestrator from RSS item link.';
