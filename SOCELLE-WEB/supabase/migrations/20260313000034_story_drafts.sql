-- CMS-WO-07: story_drafts table + RLS + pg_cron auto-ingest schedule
-- Authority: WO_MASTER_PLATFORM_UPGRADE.md P1 GATE
-- Feeds flow: rss_items → feeds-to-drafts edge fn → story_drafts (pending)
-- Editors promote approved drafts to cms_posts (CMS-WO-08 workflow)

-- ── story_drafts table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.story_drafts (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  rss_item_id      uuid        REFERENCES public.rss_items(id)        ON DELETE SET NULL,
  signal_id        uuid        REFERENCES public.market_signals(id)   ON DELETE SET NULL,
  feed_id          uuid        REFERENCES public.data_feeds(id)       ON DELETE SET NULL,
  title            text        NOT NULL,
  excerpt          text,
  body             text,
  hero_image       text,
  source_url       text,
  source_name      text,
  category         text,
  tags             text[]      NOT NULL DEFAULT '{}',
  vertical         text,
  fingerprint      text        NOT NULL,
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','approved','rejected','published')),
  reviewed_by      uuid        REFERENCES public.user_profiles(id)    ON DELETE SET NULL,
  reviewed_at      timestamptz,
  rejection_reason text,
  promoted_post_id uuid        REFERENCES public.cms_posts(id)        ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Dedup: one draft per source item (fingerprint = guid or link)
CREATE UNIQUE INDEX IF NOT EXISTS story_drafts_fingerprint_idx
  ON public.story_drafts (fingerprint);

CREATE INDEX IF NOT EXISTS story_drafts_status_idx
  ON public.story_drafts (status);

CREATE INDEX IF NOT EXISTS story_drafts_created_at_idx
  ON public.story_drafts (created_at DESC);

-- updated_at auto-stamp
CREATE OR REPLACE TRIGGER story_drafts_updated_at
  BEFORE UPDATE ON public.story_drafts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────
ALTER TABLE public.story_drafts ENABLE ROW LEVEL SECURITY;

-- Only platform_admin can read or write story_drafts
CREATE POLICY "admin_all_story_drafts"
  ON public.story_drafts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── pg_cron: feeds-to-drafts at :15 past each hour ──────────────
-- Offset 15 min from feed-orchestrator (:00) so drafts are created
-- from fresh rss_items, not stale ones.
SELECT cron.schedule(
  'feeds-to-drafts-hourly',
  '15 * * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/feeds-to-drafts',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  )
  $$
);
