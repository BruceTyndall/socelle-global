-- ── 1. Premium Data Gates (MERCH-INTEL-03-FINAL) ──────────────────
-- Adds a flag for high-magnitude historical signals requiring Credit spend
ALTER TABLE public.market_signals 
ADD COLUMN IF NOT EXISTS requires_credit boolean DEFAULT false;

-- ── 2. 30-Day Archive Cron Job ──────────────────────────────────────
-- Runs daily at 2:00 AM to evaluate and archive aging signals
SELECT cron.schedule(
  'archive-signals-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.edge_function_base_url', true) || '/archive-signals',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
