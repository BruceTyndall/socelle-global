-- Migration 10: create business_interest_signals
-- Brands flag unverified businesses as potential fits or target accounts

CREATE TABLE IF NOT EXISTS business_interest_signals (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  brand_id        uuid        NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type     text        NOT NULL
    CHECK (signal_type IN ('potential_fit', 'target_account', 'rep_visited')),
  internal_note   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, brand_id, signal_type)
);

CREATE INDEX IF NOT EXISTS idx_business_interest_signals_business_id
  ON business_interest_signals(business_id);

CREATE INDEX IF NOT EXISTS idx_business_interest_signals_brand_id
  ON business_interest_signals(brand_id);

COMMENT ON TABLE business_interest_signals IS
  'Brand-to-business interest signals. Used to build outreach pipeline before businesses join the platform.';
COMMENT ON COLUMN business_interest_signals.signal_type IS
  'potential_fit = brand thinks this business would carry their products. target_account = high-priority target. rep_visited = sales rep has made contact.';
