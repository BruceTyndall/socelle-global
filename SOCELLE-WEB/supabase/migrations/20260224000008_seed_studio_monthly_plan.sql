-- ============================================================
-- Seed studio_monthly subscription plan
-- Required by Pricing.tsx which calls startCheckout('studio_monthly')
-- Data-only — zero schema changes to subscription_plans
-- ============================================================

INSERT INTO subscription_plans (id, name, description, price_cents, interval, features)
VALUES (
  'studio_monthly',
  'Socelle Studio',
  'For multi-location spas and enterprise wellness groups who need shared management, team access, and white-label exports.',
  14900,
  'month',
  '["Everything in Pro", "Multi-location management", "Shared brand preferences across locations", "White-label PDF export", "Priority support", "Consolidated order management", "Team seats (up to 5 users)", "Quarterly strategy review call"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
