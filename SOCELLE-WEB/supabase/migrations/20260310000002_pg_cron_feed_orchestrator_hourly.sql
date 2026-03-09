-- pg_cron: Change feed-orchestrator from 6-hourly to hourly (FOUND-WO-12)
-- ADD ONLY — never edit existing migrations
--
-- The previous schedule (20260309100002) set feed-orchestrator to every 6 hours.
-- Owner spec requires hourly. This migration unschedules the old job and
-- reschedules at hourly cadence.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule the 6-hourly job
DO $$
BEGIN
  PERFORM cron.unschedule('feed-orchestrator-6h');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- Schedule hourly feed-orchestrator
SELECT cron.schedule(
  'feed-orchestrator-hourly',
  '0 * * * *',
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
