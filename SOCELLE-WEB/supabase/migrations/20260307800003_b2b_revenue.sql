-- WO-OVERHAUL-16: Reseller revenue tracking
-- ADD ONLY — no existing tables modified

CREATE TABLE IF NOT EXISTS reseller_revenue (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id       uuid NOT NULL REFERENCES reseller_accounts(id) ON DELETE CASCADE,
  source_type       text NOT NULL CHECK (source_type IN ('subscription','course','product','commission')),
  source_id         uuid,
  amount_cents      int NOT NULL,
  platform_fee_cents int DEFAULT 0,
  net_cents         int NOT NULL,
  period_start      date,
  period_end        date,
  status            text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','paid')),
  paid_at           timestamptz,
  created_at        timestamptz DEFAULT now()
);
