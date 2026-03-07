-- WO-OVERHAUL-15: Marketing Platform — Audience Segments
-- ADD ONLY migration

CREATE TABLE IF NOT EXISTS audience_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  tenant_id uuid,
  filter_rules jsonb DEFAULT '{}',
  estimated_size int DEFAULT 0,
  last_calculated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audience_segments_tenant_id ON audience_segments(tenant_id);

-- Wire FK from campaigns to audience_segments
ALTER TABLE campaigns
  ADD CONSTRAINT fk_campaigns_audience_segment
  FOREIGN KEY (audience_segment_id) REFERENCES audience_segments(id);
