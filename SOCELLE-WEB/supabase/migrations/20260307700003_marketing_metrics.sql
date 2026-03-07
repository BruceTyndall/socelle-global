-- WO-OVERHAUL-15: Marketing Platform — Campaign Metrics
-- ADD ONLY migration

CREATE TABLE IF NOT EXISTS campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE UNIQUE,
  sends int DEFAULT 0,
  deliveries int DEFAULT 0,
  opens int DEFAULT 0,
  unique_opens int DEFAULT 0,
  clicks int DEFAULT 0,
  unique_clicks int DEFAULT 0,
  bounces int DEFAULT 0,
  unsubscribes int DEFAULT 0,
  conversions int DEFAULT 0,
  revenue_cents int DEFAULT 0,
  last_updated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
