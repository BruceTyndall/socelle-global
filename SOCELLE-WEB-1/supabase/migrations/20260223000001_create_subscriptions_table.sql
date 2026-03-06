-- ============================================================
-- Subscriptions table for Stripe-backed monetization
-- Socelle 14-Day Sprint: Commerce MVP
-- ============================================================

-- Subscription plans (lookup table)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,                        -- e.g. 'pro_monthly', 'pro_annual'
  name text NOT NULL,                         -- 'Socelle Pro'
  description text,
  price_cents integer NOT NULL,               -- 4900 = $49.00
  interval text NOT NULL DEFAULT 'month',     -- 'month' | 'year'
  stripe_price_id text,                       -- Stripe Price object ID
  features jsonb DEFAULT '[]'::jsonb,         -- feature list for display
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User subscriptions (one active per user)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES subscription_plans(id),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'inactive',    -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- One active subscription per user
  CONSTRAINT unique_active_subscription UNIQUE (user_id, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read plans (they're public pricing)
CREATE POLICY "Plans are publicly readable"
  ON subscription_plans FOR SELECT
  USING (true);

-- Users can only read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (webhook) can insert/update subscriptions
CREATE POLICY "Service role manages subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Seed the Pro plan
INSERT INTO subscription_plans (id, name, description, price_cents, interval, features)
VALUES (
  'pro_monthly',
  'Socelle Pro',
  'Full revenue intelligence: gap analysis, protocol matches, retail attach, AI concierge, opening orders',
  4900,
  'month',
  '["Full gap analysis with revenue estimates", "Protocol-to-service matching", "Retail attach recommendations", "AI concierge (5 modes)", "Opening order generation", "Monthly revenue reports"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();
