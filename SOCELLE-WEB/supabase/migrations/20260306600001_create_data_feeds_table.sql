-- W13-01: Admin-managed feed registry
-- Every external data source routes through this table.
-- Admin toggles is_enabled ON/OFF from /admin/feeds.

CREATE TABLE IF NOT EXISTS data_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  feed_type text NOT NULL CHECK (feed_type IN ('rss', 'api', 'webhook', 'scraper')),
  category text NOT NULL CHECK (category IN (
    'trade_pub', 'regulatory', 'academic', 'social',
    'jobs', 'events', 'ingredients', 'brand_news',
    'press_release', 'association', 'supplier',
    'regional', 'government', 'market_data'
  )),
  endpoint_url text,
  api_key_env_var text,
  poll_interval_minutes int DEFAULT 60,
  is_enabled boolean DEFAULT false,
  provenance_tier int DEFAULT 2 CHECK (provenance_tier IN (1, 2, 3)),
  attribution_label text,
  last_fetched_at timestamptz,
  last_error text,
  signal_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: admin only
ALTER TABLE data_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to data_feeds"
  ON data_feeds FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Index for orchestrator queries
CREATE INDEX idx_data_feeds_enabled ON data_feeds (is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_data_feeds_category ON data_feeds (category);
CREATE INDEX idx_data_feeds_feed_type ON data_feeds (feed_type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_data_feeds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER data_feeds_updated_at
  BEFORE UPDATE ON data_feeds
  FOR EACH ROW
  EXECUTE FUNCTION update_data_feeds_updated_at();

COMMENT ON TABLE data_feeds IS 'Admin-managed registry of all external data sources. Toggle is_enabled to activate/deactivate feeds.';
COMMENT ON COLUMN data_feeds.is_enabled IS 'Admin toggle — feed-orchestrator only processes enabled feeds';
COMMENT ON COLUMN data_feeds.api_key_env_var IS 'Name of Supabase secret holding the API key (e.g. NEWSAPI_KEY)';
COMMENT ON COLUMN data_feeds.provenance_tier IS '1=Direct/Owned, 2=Public/Structured, 3=Aggregated/Derived (per SOCELLE_DATA_PROVENANCE_POLICY.md)';
