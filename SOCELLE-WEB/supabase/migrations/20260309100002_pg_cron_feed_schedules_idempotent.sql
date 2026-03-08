-- pg_cron schedules for the full feed pipeline (idempotent)
-- ADD ONLY — never edit existing migrations (AGENT_SCOPE_REGISTRY §Backend Agent)
--
-- This migration makes all feed-pipeline cron jobs idempotent by:
--   1. Unscheduling any existing job with the same name (IF EXISTS).
--   2. Re-scheduling with the canonical definition.
--
-- Schedules:
--   ingest-rss-30m        — every 30 min, batch ingest RSS sources
--   rss-to-signals-30m    — every 30 min (offset 15 min), promote items to signals
--   feed-orchestrator-6h  — every 6 hours, full feed-orchestrator sweep
--
-- Prerequisites: pg_cron + pg_net extensions (created in 20260307000010)

-- ── Ensure extensions exist ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── 1. ingest-rss: every 30 minutes ────────────────────────────────────────
DO $$
BEGIN
  -- Remove previous schedule if it exists (idempotent)
  PERFORM cron.unschedule('ingest-rss-30m');
EXCEPTION WHEN OTHERS THEN
  -- Job did not exist; nothing to unschedule
  NULL;
END;
$$;

SELECT cron.schedule(
  'ingest-rss-30m',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/ingest-rss',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{"batch_size": 10}'::jsonb
  );
  $$
);

-- ── 2. rss-to-signals: every 30 minutes, offset by 15 min ──────────────────
DO $$
BEGIN
  PERFORM cron.unschedule('rss-to-signals-30m');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

SELECT cron.schedule(
  'rss-to-signals-30m',
  '15,45 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/rss-to-signals',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{"limit": 100}'::jsonb
  );
  $$
);

-- ── 3. feed-orchestrator: every 6 hours ─────────────────────────────────────
DO $$
BEGIN
  PERFORM cron.unschedule('feed-orchestrator-6h');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

SELECT cron.schedule(
  'feed-orchestrator-6h',
  '0 */6 * * *',
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
