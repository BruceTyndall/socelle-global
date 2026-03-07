-- WO-OVERHAUL-16: B2B Reseller accounts + clients
-- ADD ONLY — no existing tables modified

CREATE TABLE IF NOT EXISTS reseller_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL UNIQUE,
  company_name  text NOT NULL,
  company_slug  text UNIQUE NOT NULL,
  tier          text DEFAULT 'starter' CHECK (tier IN ('starter','growth','pro','enterprise')),
  commission_rate_pct numeric DEFAULT 10,
  white_label_enabled bool DEFAULT false,
  custom_domain text,
  brand_colors  jsonb DEFAULT '{}',
  logo_url      text,
  is_active     bool DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reseller_clients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id     uuid NOT NULL REFERENCES reseller_accounts(id) ON DELETE CASCADE,
  client_user_id  uuid NOT NULL,
  status          text DEFAULT 'invited' CHECK (status IN ('invited','active','suspended')),
  invited_at      timestamptz DEFAULT now(),
  activated_at    timestamptz,
  notes           text,
  created_at      timestamptz DEFAULT now()
);
