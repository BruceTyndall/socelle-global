-- Migration: Subscription & Entitlement Tables
-- WO: Subscription/Entitlement Backend
-- Authority: docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md

-- Subscription plans catalog
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'operator',
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  annual_price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_monthly_price_id TEXT,
  stripe_annual_price_id TEXT,
  features JSONB NOT NULL DEFAULT '[]',
  limits JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days',
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Studio add-on subscriptions
CREATE TABLE IF NOT EXISTS studio_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  annual_price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_monthly_price_id TEXT,
  stripe_annual_price_id TEXT,
  allowed_roles TEXT[] NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User's active add-ons
CREATE TABLE IF NOT EXISTS user_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES studio_addons(id),
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, addon_id)
);

-- Studio bundles
CREATE TABLE IF NOT EXISTS studio_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  annual_price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_monthly_price_id TEXT,
  stripe_annual_price_id TEXT,
  addon_ids UUID[] NOT NULL DEFAULT '{}',
  savings_percent INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage metering (for tier limits)
CREATE TABLE IF NOT EXISTS usage_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_key, period_start)
);

-- Feature flags (admin can toggle features globally)
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  required_plan TEXT,
  required_addon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_user_addons_user ON user_addons(user_id);
CREATE INDEX idx_usage_meters_user_period ON usage_meters(user_id, period_start);
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
