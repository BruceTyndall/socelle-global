-- Migration: Fix pg_cron targets + enable all 202 data_feeds
-- WO-OVERHAUL-06 — Fix the feed pipeline
-- Authority: build_tracker.md WO-OVERHAUL-06
--
-- Changes:
--   1. Unschedule the old daily-live-data-refresh cron job (pointed at refresh-live-data)
--   2. Schedule new daily cron job at 00:00 UTC → feed-orchestrator (all feeds)
--   3. Schedule 6-hour cron job → feed-orchestrator (tier 1 high-priority feeds only)
--   4. Flip all 202 data_feeds rows to is_enabled = true
--   5. Add data_payload column to live_data_feeds (spec requirement)
--
-- Prerequisites: pg_cron + pg_net extensions (created in 20260307000010)

-- ── 1. Remove the old cron job that pointed at refresh-live-data ────────────
SELECT cron.unschedule('daily-live-data-refresh');

-- ── 2. Daily batch: all feeds via feed-orchestrator at 00:00 UTC ────────────
SELECT cron.schedule(
  'daily-feed-orchestrator',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/feed-orchestrator',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ── 3. Every 6 hours: tier 1 (high-priority) feeds only ────────────────────
SELECT cron.schedule(
  'tier1-feed-orchestrator-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/feed-orchestrator',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{"tier": 1}'::jsonb
  );
  $$
);

-- ── 4. Enable all 202 data_feeds ────────────────────────────────────────────
UPDATE public.data_feeds SET is_enabled = true;

-- ── 5. Add data_payload column to live_data_feeds ───────────────────────────
ALTER TABLE public.live_data_feeds
  ADD COLUMN IF NOT EXISTS data_payload jsonb;

COMMENT ON COLUMN public.live_data_feeds.data_payload IS
  'Raw JSON payload from the most recent fetch — written by refresh-live-data edge function';
