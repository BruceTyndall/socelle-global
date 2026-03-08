-- V2-INTEL-04: Schedule pg_cron jobs for ingest-rss and rss-to-signals
-- ADD ONLY — never edit existing migrations (AGENT_SCOPE_REGISTRY §Backend Agent)
-- Authority: build_tracker.md WO V2-INTEL-04
--
-- Gap: feed-orchestrator has cron jobs (daily + 6h tier-1), but
-- ingest-rss (rss_sources → rss_items) and rss-to-signals (rss_items → market_signals)
-- had no scheduled invocation. This migration adds them.
--
-- Schedule:
--   ingest-rss:      every 30 minutes (rotating batches of 10 sources)
--   rss-to-signals:  every 30 minutes, offset by 15 min (promotes qualifying items)
--
-- Prerequisites: pg_cron + pg_net extensions (created in 20260307000010)

-- ── 1. ingest-rss: every 30 minutes ────────────────────────────────────────────
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

-- ── 2. rss-to-signals: every 30 minutes, offset by 15 min ──────────────────────
-- Runs 15 minutes after ingest-rss so newly ingested items are available
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
