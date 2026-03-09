-- FEED-WO-04: Create feed_run_log table for per-feed health monitoring
-- Records every orchestrator dispatch with status, duration, signal count, error.
-- Mirrors local-only migration 20260306800001 (never pushed to remote).
-- ADD ONLY — never modify existing migrations

CREATE TABLE IF NOT EXISTS public.feed_run_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id         uuid        REFERENCES public.data_feeds(id) ON DELETE CASCADE,
  started_at      timestamptz DEFAULT now(),
  finished_at     timestamptz,
  status          text        CHECK (status IN ('running', 'success', 'error', 'skipped')),
  signals_created int         DEFAULT 0,
  items_fetched   int         DEFAULT 0,
  duration_ms     int,
  error_message   text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.feed_run_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_feed_run_log" ON public.feed_run_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('platform_admin', 'admin')
    )
  );

CREATE POLICY "service_role_insert_feed_run_log" ON public.feed_run_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "service_role_update_feed_run_log" ON public.feed_run_log
  FOR UPDATE TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_feed_run_log_feed_id    ON public.feed_run_log (feed_id);
CREATE INDEX IF NOT EXISTS idx_feed_run_log_started_at ON public.feed_run_log (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_run_log_status     ON public.feed_run_log (status);

COMMENT ON TABLE public.feed_run_log IS
  'FEED-WO-04: Per-feed run history. Every feed-orchestrator dispatch writes a row. '
  'Admin Hub reads this table for feed health dashboard.';
