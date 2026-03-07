-- Migration: Commission Rules + Commission Payouts
-- WO: WO-OVERHAUL-14 (Sales Platform schema)

CREATE TABLE IF NOT EXISTS commission_rules (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  type          text        NOT NULL
                            CHECK (type IN ('percentage','fixed','tiered')),
  value         numeric,
  tiers         jsonb,
  applies_to    text        DEFAULT 'all'
                            CHECK (applies_to IN ('all','specific_products','specific_categories')),
  product_ids   uuid[]      DEFAULT '{}',
  category_ids  uuid[]      DEFAULT '{}',
  is_active     bool        DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commission_payouts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL,
  deal_id       uuid        REFERENCES deals(id),
  order_id      uuid,
  rule_id       uuid        REFERENCES commission_rules(id),
  amount_cents  int         NOT NULL,
  currency      text        DEFAULT 'USD',
  status        text        DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','paid','rejected')),
  period_start  date,
  period_end    date,
  notes         text,
  paid_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_commission_rules_active   ON commission_rules(is_active);
CREATE INDEX idx_commission_payouts_user   ON commission_payouts(user_id);
CREATE INDEX idx_commission_payouts_deal   ON commission_payouts(deal_id);
CREATE INDEX idx_commission_payouts_rule   ON commission_payouts(rule_id);
CREATE INDEX idx_commission_payouts_status ON commission_payouts(status);
CREATE INDEX idx_commission_payouts_period ON commission_payouts(period_start, period_end);
