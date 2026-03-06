-- Migration 09: create brand_interest_signals
-- Resellers signal interest in unverified brands (Express Interest, Notify Me, page views)

CREATE TABLE IF NOT EXISTS brand_interest_signals (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        uuid        NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  business_id     uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type     text        NOT NULL
    CHECK (signal_type IN ('express_interest', 'notify_me', 'page_view')),
  message         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, business_id, signal_type)
);

CREATE INDEX IF NOT EXISTS idx_brand_interest_signals_brand_id
  ON brand_interest_signals(brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_interest_signals_business_id
  ON brand_interest_signals(business_id);

COMMENT ON TABLE brand_interest_signals IS
  'Reseller-to-brand interest signals. Used to surface demand for unverified brands and notify resellers when brands join.';
COMMENT ON COLUMN brand_interest_signals.signal_type IS
  'express_interest = reseller clicked Express Interest CTA. notify_me = wants email when brand joins. page_view = tracked page view.';
