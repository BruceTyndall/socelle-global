-- Migration: Enforce admin-toggle-only feed activation model
-- Follow-up to W13-02 / W13-03 governance requirements
--
-- Rationale:
--   20260307100001_fix_cron_enable_feeds.sql bulk-enabled all feeds.
--   Product policy requires feeds to remain disabled until explicitly
--   enabled from /admin/feeds by an operator.

-- Keep the baseline off by default for all new rows.
ALTER TABLE public.data_feeds
  ALTER COLUMN is_enabled SET DEFAULT false;

-- Corrective reset: restore operator-intent model.
UPDATE public.data_feeds
SET is_enabled = false
WHERE is_enabled = true;
