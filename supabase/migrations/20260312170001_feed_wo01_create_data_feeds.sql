-- FEED-WO-01: Create public.data_feeds table with health tracking columns
-- This migration creates the data_feeds table that was defined in the local-only
-- migration 20260306600001 but was never applied to the remote DB.
-- Applied via FEED-WO-01 execution 2026-03-09
-- ADD ONLY — never modify existing migrations

CREATE TABLE IF NOT EXISTS public.data_feeds (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text        NOT NULL,
  feed_type             text        NOT NULL CHECK (feed_type IN ('rss', 'api', 'webhook', 'scraper')),
  category              text        NOT NULL CHECK (category IN (
    'trade_pub', 'regulatory', 'academic', 'social',
    'jobs', 'events', 'ingredients', 'brand_news',
    'press_release', 'association', 'supplier',
    'regional', 'government', 'market_data'
  )),
  endpoint_url          text,
  api_key_env_var       text,
  poll_interval_minutes int         DEFAULT 60,
  is_enabled            boolean     DEFAULT false,
  provenance_tier       int         DEFAULT 2 CHECK (provenance_tier IN (1, 2, 3)),
  attribution_label     text,
  last_fetched_at       timestamptz,
  last_error            text,
  signal_count          int         DEFAULT 0,
  -- FEED-WO-04 health tracking (included here to avoid a separate ALTER migration)
  consecutive_failures  int         DEFAULT 0,
  last_success_at       timestamptz,
  health_status         text        DEFAULT 'healthy'
                          CHECK (health_status IN ('healthy', 'degraded', 'failed')),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE public.data_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_data_feeds" ON public.data_feeds
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('platform_admin', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_data_feeds_enabled   ON public.data_feeds (is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_data_feeds_category  ON public.data_feeds (category);
CREATE INDEX IF NOT EXISTS idx_data_feeds_health    ON public.data_feeds (health_status);
CREATE INDEX IF NOT EXISTS idx_data_feeds_type      ON public.data_feeds (feed_type);

CREATE OR REPLACE FUNCTION public.update_data_feeds_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS data_feeds_updated_at ON public.data_feeds;
CREATE TRIGGER data_feeds_updated_at
  BEFORE UPDATE ON public.data_feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_data_feeds_updated_at();

COMMENT ON TABLE  public.data_feeds IS
  'FEED-WO-01: Admin-managed registry of all external data sources. '
  'health_status + consecutive_failures track feed reliability (FEED-WO-04). '
  'Toggle is_enabled from /admin/feeds. feed-orchestrator only processes enabled feeds.';
COMMENT ON COLUMN public.data_feeds.is_enabled IS
  'Admin toggle — feed-orchestrator only processes enabled feeds';
COMMENT ON COLUMN public.data_feeds.api_key_env_var IS
  'Name of Supabase secret holding the API key (e.g. NEWSAPI_KEY)';
COMMENT ON COLUMN public.data_feeds.provenance_tier IS
  '1=Direct/Owned, 2=Public/Structured, 3=Aggregated/Derived (SOCELLE_DATA_PROVENANCE_POLICY.md)';
COMMENT ON COLUMN public.data_feeds.consecutive_failures IS
  'FEED-WO-04: Count of consecutive failures since last success. Reset to 0 on success.';
COMMENT ON COLUMN public.data_feeds.health_status IS
  'FEED-WO-04: healthy=running clean, degraded=1-2 failures, failed=3+ consecutive failures';
