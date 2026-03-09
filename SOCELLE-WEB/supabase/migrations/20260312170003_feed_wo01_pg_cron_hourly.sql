-- FEED-WO-01: Wire feed-orchestrator-hourly pg_cron job
-- Prerequisites: pg_cron + pg_net extensions must be enabled on the project.
-- This replaces/supplements existing ingest-rss-hourly (which runs every 2h).
-- The feed-orchestrator dispatches ALL enabled data_feeds (not just rss_sources).
-- ADD ONLY — never modify existing migrations

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any stale previous versions of this job (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('feed-orchestrator-hourly');
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

DO $$
BEGIN
  PERFORM cron.unschedule('feed-orchestrator-6h');
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

-- Schedule feed-orchestrator every hour at :00
SELECT cron.schedule(
  'feed-orchestrator-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://rumdmulxzmjtsplsjngi.supabase.co/functions/v1/feed-orchestrator',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  );
  $$
);

COMMENT ON EXTENSION pg_cron IS 'FEED-WO-01: pg_cron schedules feed-orchestrator-hourly at 0 * * * *';
