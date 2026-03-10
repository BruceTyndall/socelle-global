-- Migration: CRM Consent Audit Log
-- WO: CRM-WO-08 — Consent audit log UI (/portal/crm/consent)
-- Depends on: crm_contacts, auth.users

CREATE TABLE IF NOT EXISTS crm_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('marketing', 'data', 'transactional')),
  status TEXT NOT NULL CHECK (status IN ('opted_in', 'opted_out', 'pending')),
  channel TEXT NOT NULL DEFAULT 'web',
  recorded_by UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

ALTER TABLE crm_consent_log ENABLE ROW LEVEL SECURITY;

-- Business-scoped access: user must share business with contact
CREATE POLICY "owner_access" ON crm_consent_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM crm_contacts c
      JOIN user_profiles up ON up.id = auth.uid()
      WHERE c.id = crm_consent_log.contact_id
        AND up.business_id = c.business_id
    )
  );

-- Platform admin full access
CREATE POLICY "platform_admin_all" ON crm_consent_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'platform_admin')
    )
  );

-- Index for contact lookups
CREATE INDEX IF NOT EXISTS idx_crm_consent_log_contact ON crm_consent_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_consent_log_recorded_at ON crm_consent_log(recorded_at DESC);
