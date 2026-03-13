-- CMS-POWER-01: Add RSS pipeline columns to story_drafts
-- These columns enable:
--   1. feeds-to-drafts edge function ingestion (rss_item_id, feed_id, fingerprint, hero_image, source_url, suggested_products)
--   2. AdminStoryDrafts approval flow (reviewed_at, reviewed_by, rejection_reason, feed:feed_id join)
--   3. publish_story_draft RPC (promoted_post_id)
-- Applied: 2026-03-13

ALTER TABLE public.story_drafts
  ADD COLUMN IF NOT EXISTS rss_item_id       uuid REFERENCES public.rss_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS feed_id           uuid REFERENCES public.data_feeds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fingerprint       text,
  ADD COLUMN IF NOT EXISTS hero_image        text,
  ADD COLUMN IF NOT EXISTS source_url        text,
  ADD COLUMN IF NOT EXISTS source_name       text,
  ADD COLUMN IF NOT EXISTS reviewed_at       timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason  text,
  ADD COLUMN IF NOT EXISTS suggested_products uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS promoted_post_id  uuid REFERENCES public.cms_posts(id) ON DELETE SET NULL;

-- Unique fingerprint index for RSS deduplication (guid ?? link)
CREATE UNIQUE INDEX IF NOT EXISTS story_drafts_fingerprint_key
  ON public.story_drafts(fingerprint)
  WHERE fingerprint IS NOT NULL;

-- GIN index for suggested_products array queries
CREATE INDEX IF NOT EXISTS story_drafts_suggested_products_gin
  ON public.story_drafts USING gin(suggested_products);

-- Index for feed_id FK join (AdminStoryDrafts feed:feed_id(name))
CREATE INDEX IF NOT EXISTS story_drafts_feed_id_idx
  ON public.story_drafts(feed_id)
  WHERE feed_id IS NOT NULL;

-- Index for rss_item_id lookups
CREATE INDEX IF NOT EXISTS story_drafts_rss_item_id_idx
  ON public.story_drafts(rss_item_id)
  WHERE rss_item_id IS NOT NULL;
