-- W15-02: Feed run log — records every orchestrator execution per feed
-- ADD ONLY — never edit existing migrations (AGENT_SCOPE_REGISTRY §Backend Agent)
-- Authority: build_tracker.md WO W15-02
--
-- Captures: which feed, when, how many signals, duration, errors.
-- Used by /admin/feeds to show run history + health dashboards.

CREATE TABLE IF NOT EXISTS feed_run_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid NOT NULL REFERENCES data_feeds(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'error', 'skipped')),
  signals_created int NOT NULL DEFAULT 0,
  signals_updated int NOT NULL DEFAULT 0,
  items_fetched int NOT NULL DEFAULT 0,
  duration_ms int,
  error_message text,
  http_status int,
  created_at timestamptz DEFAULT now()
);

-- RLS: admin only (matches data_feeds policy)
ALTER TABLE feed_run_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to feed_run_log"
  ON feed_run_log FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes for common queries
CREATE INDEX idx_feed_run_log_feed_id ON feed_run_log (feed_id);
CREATE INDEX idx_feed_run_log_started_at ON feed_run_log (started_at DESC);
CREATE INDEX idx_feed_run_log_status ON feed_run_log (status) WHERE status = 'error';

COMMENT ON TABLE feed_run_log IS 'W15-02: Per-feed execution log for feed-orchestrator. Each row = one feed processing attempt.';
COMMENT ON COLUMN feed_run_log.feed_id IS 'FK to data_feeds — which feed was processed';
COMMENT ON COLUMN feed_run_log.signals_created IS 'Number of new market_signals rows inserted this run';
COMMENT ON COLUMN feed_run_log.signals_updated IS 'Number of existing market_signals rows updated (upsert match)';
COMMENT ON COLUMN feed_run_log.items_fetched IS 'Total items parsed from source (RSS items, API results)';
COMMENT ON COLUMN feed_run_log.duration_ms IS 'Wall-clock milliseconds from fetch start to DB write complete';
COMMENT ON COLUMN feed_run_log.http_status IS 'HTTP response status from upstream feed endpoint';
