-- Migration: CTRL-WO-04 — Fix entitlements chain gaps
-- Adds missing columns to subscription_plans and creates account_module_access table.
-- Authority: docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md

-- ── 1. Add missing columns to subscription_plans ─────────────────────────────
-- The frontend (useSubscriptionPlans, useSubscription, UpgradePrompt) expects:
--   price_monthly (numeric), price_annual (numeric), modules_included (text[]),
--   trial_days (integer), is_featured (boolean), description (text)
-- The existing table has monthly_price_cents / annual_price_cents but NOT these.

ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS price_monthly NUMERIC(10,2) GENERATED ALWAYS AS (monthly_price_cents / 100.0) STORED,
  ADD COLUMN IF NOT EXISTS price_annual  NUMERIC(10,2) GENERATED ALWAYS AS (annual_price_cents  / 100.0) STORED,
  ADD COLUMN IF NOT EXISTS modules_included TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trial_days INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- ── 2. Seed modules_included for existing plans ──────────────────────────────
-- Map the existing plan slugs to the MODULE_* keys used in the frontend.

UPDATE subscription_plans SET modules_included = '{}'
  WHERE slug = 'free' AND plan_type = 'operator';

UPDATE subscription_plans SET modules_included = '{MODULE_EDUCATION,MODULE_INGREDIENTS}'
  WHERE slug = 'professional' AND plan_type = 'operator';

UPDATE subscription_plans SET modules_included = '{MODULE_SHOP,MODULE_EDUCATION,MODULE_INGREDIENTS,MODULE_SALES,MODULE_MARKETING,MODULE_CRM}'
  WHERE slug = 'business' AND plan_type = 'operator';

UPDATE subscription_plans SET modules_included = '{MODULE_SHOP,MODULE_EDUCATION,MODULE_INGREDIENTS,MODULE_SALES,MODULE_MARKETING,MODULE_CRM,MODULE_RESELLER,MODULE_MOBILE}'
  WHERE slug = 'enterprise' AND plan_type = 'operator';

UPDATE subscription_plans SET modules_included = '{}'
  WHERE slug = 'brand_free' AND plan_type = 'brand';

UPDATE subscription_plans SET modules_included = '{MODULE_MARKETING,MODULE_CRM}'
  WHERE slug = 'growth' AND plan_type = 'brand';

UPDATE subscription_plans SET modules_included = '{MODULE_MARKETING,MODULE_CRM,MODULE_SALES,MODULE_RESELLER}'
  WHERE slug = 'scale' AND plan_type = 'brand';

-- Mark Business plan as featured
UPDATE subscription_plans SET is_featured = true WHERE slug = 'business';

-- ── 3. Create account_module_access table ────────────────────────────────────
-- The ModuleAccessContext reads from this table. RLS policy already exists
-- (migration 20260308200001) but the table itself was never created.

CREATE TABLE IF NOT EXISTS account_module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  module_key TEXT NOT NULL,
  access_type TEXT NOT NULL DEFAULT 'plan',   -- 'plan' | 'trial' | 'override' | 'free'
  is_active BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(account_id, module_key)
);

CREATE INDEX IF NOT EXISTS idx_ama_account ON account_module_access(account_id);
CREATE INDEX IF NOT EXISTS idx_ama_module ON account_module_access(module_key);

-- Enable RLS (idempotent — the existing RLS migration uses IF EXISTS)
ALTER TABLE account_module_access ENABLE ROW LEVEL SECURITY;

-- ── 4. Create account_subscriptions table ────────────────────────────────────
-- The useSubscription hook reads from this table (joined with subscription_plans).

CREATE TABLE IF NOT EXISTS account_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',       -- 'active' | 'trialing' | 'past_due' | 'canceled'
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days',
  trial_ends_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acct_sub_account ON account_subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_acct_sub_status ON account_subscriptions(status);

ALTER TABLE account_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own account subscription
CREATE POLICY "Users read own account subscription"
  ON account_subscriptions FOR SELECT
  USING (
    account_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'platform_admin')
    )
  );

-- Only service role / admins can manage subscriptions
CREATE POLICY "Service role manages account subscriptions"
  ON account_subscriptions FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'platform_admin')
    )
  );

-- ── 5. Updated_at triggers ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_account_module_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_module_access_updated_at
  BEFORE UPDATE ON account_module_access
  FOR EACH ROW
  EXECUTE FUNCTION update_account_module_access_updated_at();

CREATE OR REPLACE FUNCTION update_account_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_subscriptions_updated_at
  BEFORE UPDATE ON account_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_subscriptions_updated_at();
