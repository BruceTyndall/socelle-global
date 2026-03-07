-- Migration: Deals + Deal Activities
-- WO: WO-OVERHAUL-14 (Sales Platform schema)

CREATE TABLE IF NOT EXISTS deals (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id         uuid        REFERENCES sales_pipelines(id),
  stage_id            uuid        REFERENCES pipeline_stages(id),
  owner_id            uuid        NOT NULL,
  contact_id          uuid,
  company_id          uuid,
  title               text        NOT NULL,
  value_cents         int         DEFAULT 0,
  currency            text        DEFAULT 'USD',
  expected_close_date date,
  actual_close_date   date,
  status              text        DEFAULT 'open'
                                  CHECK (status IN ('open','won','lost','stalled')),
  lost_reason         text,
  probability_pct     numeric,
  notes               text,
  tags                text[]      DEFAULT '{}',
  metadata            jsonb       DEFAULT '{}',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deal_activities (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id       uuid        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL,
  activity_type text        NOT NULL
                            CHECK (activity_type IN ('call','email','meeting','note','task','demo','proposal')),
  subject       text,
  body          text,
  scheduled_at  timestamptz,
  completed_at  timestamptz,
  outcome       text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_deals_pipeline   ON deals(pipeline_id);
CREATE INDEX idx_deals_stage      ON deals(stage_id);
CREATE INDEX idx_deals_owner      ON deals(owner_id);
CREATE INDEX idx_deals_contact    ON deals(contact_id);
CREATE INDEX idx_deals_company    ON deals(company_id);
CREATE INDEX idx_deals_status     ON deals(status);
CREATE INDEX idx_deal_activities_deal ON deal_activities(deal_id);
CREATE INDEX idx_deal_activities_user ON deal_activities(user_id);
CREATE INDEX idx_deal_activities_type ON deal_activities(activity_type);
