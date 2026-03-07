-- Migration: B2B Prospects & Touchpoints
-- WO: WO-OVERHAUL-17 backend pass
-- Tables: b2b_prospects, prospect_touchpoints

CREATE TABLE IF NOT EXISTS b2b_prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES crm_companies(id),
  owner_id uuid NOT NULL,
  status text DEFAULT 'identified' CHECK (status IN ('identified','researching','contacted','qualified','proposal_sent','negotiating','won','lost','nurturing')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  source text,
  estimated_value_cents int,
  next_action text,
  next_action_date date,
  lost_reason text,
  tags text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prospect_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES b2b_prospects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  channel text CHECK (channel IN ('email','phone','meeting','event','social','referral','other')),
  subject text,
  body text,
  outcome text,
  sentiment text CHECK (sentiment IN ('positive','neutral','negative')),
  follow_up_date date,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_b2b_prospects_company ON b2b_prospects(company_id);
CREATE INDEX idx_b2b_prospects_owner ON b2b_prospects(owner_id);
CREATE INDEX idx_b2b_prospects_status ON b2b_prospects(status);
CREATE INDEX idx_b2b_prospects_priority ON b2b_prospects(priority);
CREATE INDEX idx_prospect_touchpoints_prospect ON prospect_touchpoints(prospect_id);
CREATE INDEX idx_prospect_touchpoints_user ON prospect_touchpoints(user_id);
