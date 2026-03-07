-- Migration: Proposals
-- WO: WO-OVERHAUL-14 (Sales Platform schema)

CREATE TABLE IF NOT EXISTS proposals (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id          uuid        REFERENCES deals(id) ON DELETE CASCADE,
  contact_id       uuid,
  title            text        NOT NULL,
  status           text        DEFAULT 'draft'
                               CHECK (status IN ('draft','sent','viewed','accepted','rejected','expired')),
  content_blocks   jsonb       DEFAULT '[]',
  total_value_cents int        DEFAULT 0,
  valid_until      date,
  sent_at          timestamptz,
  viewed_at        timestamptz,
  accepted_at      timestamptz,
  signature_data   jsonb,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_proposals_deal    ON proposals(deal_id);
CREATE INDEX idx_proposals_contact ON proposals(contact_id);
CREATE INDEX idx_proposals_status  ON proposals(status);
