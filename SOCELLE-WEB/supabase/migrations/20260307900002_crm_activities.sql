-- Migration: CRM Activities & Tags
-- WO: WO-OVERHAUL-17 backend pass
-- Tables: crm_activities, crm_tags

CREATE TABLE IF NOT EXISTS crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES crm_contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES crm_companies(id),
  user_id uuid NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('call','email','meeting','note','task','sms','visit','treatment','purchase')),
  subject text,
  body text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  outcome text,
  duration_minutes int,
  is_pinned bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#6E879B',
  category text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_crm_activities_contact ON crm_activities(contact_id);
CREATE INDEX idx_crm_activities_company ON crm_activities(company_id);
CREATE INDEX idx_crm_activities_user ON crm_activities(user_id);
CREATE INDEX idx_crm_activities_type ON crm_activities(activity_type);
CREATE INDEX idx_crm_tags_category ON crm_tags(category);
