-- ═══════════════════════════════════════════════════════════════
-- MERCH-INTEL-01 Phase 2: pg_cron schedules for all ingest functions
-- Adds automated schedules for RSS ingestion, feed orchestrator,
-- OpenFDA, Open Beauty Facts, events, and jobs ingest edge functions.
-- Authority: MERCH-INTEL-01 work order
-- ═══════════════════════════════════════════════════════════════

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ── RSS Ingestion: every 15 minutes ─────────────────────────────
SELECT cron.schedule(
  'rss-ingestion-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/rss-ingestion',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = '*/15 * * * *';

-- ── Feed Orchestrator: every 30 minutes ─────────────────────────
SELECT cron.schedule(
  'feed-orchestrator-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/feed-orchestrator',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = '*/30 * * * *';

-- ── OpenFDA Ingest: daily at 03:00 UTC ──────────────────────────
SELECT cron.schedule(
  'ingest-openfda-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-openfda',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = '0 3 * * *';

-- ── Open Beauty Facts Sync: daily at 04:00 UTC ──────────────────
SELECT cron.schedule(
  'open-beauty-facts-sync-daily',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/open-beauty-facts-sync',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = '0 4 * * *';

-- ── Events Ingest: daily at 05:00 UTC ───────────────────────────
SELECT cron.schedule(
  'ingest-events-daily',
  '0 5 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-events',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = '0 5 * * *';

-- ── Jobs External Ingest: daily at 05:30 UTC ────────────────────
SELECT cron.schedule(
  'ingest-jobs-external-daily',
  '30 5 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-jobs-external',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = '30 5 * * *';

-- Verify: SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
