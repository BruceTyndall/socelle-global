-- WO-OVERHAUL-16: White-label configuration per reseller
-- ADD ONLY — no existing tables modified

CREATE TABLE IF NOT EXISTS white_label_config (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id         uuid NOT NULL REFERENCES reseller_accounts(id) ON DELETE CASCADE UNIQUE,
  app_name            text,
  tagline             text,
  primary_color       text,
  secondary_color     text,
  logo_url            text,
  favicon_url         text,
  custom_domain       text,
  custom_css          text,
  hide_powered_by     bool DEFAULT false,
  email_from_name     text,
  email_from_address  text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
