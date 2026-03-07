-- WO-OVERHAUL-15: Marketing Platform — Campaigns + Campaign Content
-- ADD ONLY migration

-- campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email','sms','push','in_app','social','multi_channel')),
  status text DEFAULT 'draft' CHECK (status IN ('draft','scheduled','active','paused','completed')),
  audience_segment_id uuid,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  goal text,
  goal_value numeric,
  created_by uuid,
  tenant_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- campaign_content
CREATE TABLE IF NOT EXISTS campaign_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  channel text NOT NULL,
  subject text,
  preview_text text,
  body_html text,
  body_text text,
  template_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaign_content_campaign_id ON campaign_content(campaign_id);
