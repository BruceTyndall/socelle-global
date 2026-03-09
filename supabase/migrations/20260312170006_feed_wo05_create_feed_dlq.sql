-- FEED-WO-05: Dead Letter Queue for failed feed items
-- Failed items from feed-orchestrator are written here for admin review/retry.
-- Admin can mark items resolved_at + resolved_by.
-- ADD ONLY — never modify existing migrations

CREATE TABLE IF NOT EXISTS public.feed_dlq (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id         uuid        REFERENCES public.data_feeds(id) ON DELETE SET NULL,
  feed_url        text        NOT NULL,
  error_message   text,
  raw_payload     jsonb,
  attempt_count   int         DEFAULT 1,
  created_at      timestamptz DEFAULT now(),
  resolved_at     timestamptz,
  resolved_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.feed_dlq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_feed_dlq" ON public.feed_dlq
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('platform_admin', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS feed_dlq_feed_id_idx    ON public.feed_dlq (feed_id);
CREATE INDEX IF NOT EXISTS feed_dlq_created_at_idx ON public.feed_dlq (created_at DESC);
CREATE INDEX IF NOT EXISTS feed_dlq_resolved_idx   ON public.feed_dlq (resolved_at) WHERE resolved_at IS NULL;

COMMENT ON TABLE public.feed_dlq IS
  'FEED-WO-05: Dead Letter Queue — failed feed items land here for admin review. '
  'resolved_at + resolved_by track when an admin clears the item.';
COMMENT ON COLUMN public.feed_dlq.raw_payload IS
  'The raw feed item JSON that failed to process (for debugging and manual re-ingestion).';
COMMENT ON COLUMN public.feed_dlq.attempt_count IS
  'Number of processing attempts before landing in DLQ.';
