-- Migration: pg_cron daily refresh for live_data_feeds
-- Phase 6: Live Data Edge Functions + Cron
-- Authority: WO-OVERHAUL-06
--
-- Schedules a daily job at 00:00 UTC that invokes the
-- refresh-live-data Edge Function via pg_net HTTP POST.
--
-- Prerequisites:
--   pg_cron and pg_net extensions must be enabled on the Supabase project.
--   These are project-level settings in the Supabase dashboard.
--   If the extensions are not available, this migration will fail
--   gracefully (IF NOT EXISTS for extensions; cron.schedule will error
--   but won't corrupt any data).
--
-- Secrets used (via current_setting):
--   app.settings.supabase_url        — project API URL
--   app.settings.service_role_key    — service role key for auth

-- ── Enable required extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── Schedule daily refresh at midnight UTC ────────────────────────────────────
SELECT cron.schedule(
  'daily-live-data-refresh',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/refresh-live-data',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
