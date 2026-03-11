-- CMS-WO-11: pg_cron schedules for Daily Briefs & Weekly Market Memos
-- Authority: WO_MASTER_PLATFORM_UPGRADE.md P1 GATE
-- Calls edge function /functions/v1/generate-briefs?type=daily and ?type=weekly

-- 1. Daily Brief (Mon-Fri at 07:00 UTC)
SELECT cron.schedule(
  'generate-daily-brief',
  '0 7 * * 1-5',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/generate-briefs?type=daily',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  )
  $$
);

-- 2. Weekly Market Memo (Monday at 08:00 UTC)
SELECT cron.schedule(
  'generate-weekly-memo',
  '0 8 * * 1',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/generate-briefs?type=weekly',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  )
  $$
);
