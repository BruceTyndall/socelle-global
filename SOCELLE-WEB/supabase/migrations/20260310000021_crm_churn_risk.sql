-- Migration: Add churn_risk_score and last_visit_at to crm_contacts
-- WO: CRM-WO-09 — Rebooking engine UI
-- Safe: ADD COLUMN IF NOT EXISTS — no data at risk

ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS churn_risk_score INTEGER DEFAULT 0
    CHECK (churn_risk_score BETWEEN 0 AND 100);

ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMPTZ;

-- Index for churn risk queries (find high-risk contacts)
CREATE INDEX IF NOT EXISTS idx_crm_contacts_churn_risk ON crm_contacts(churn_risk_score DESC);
