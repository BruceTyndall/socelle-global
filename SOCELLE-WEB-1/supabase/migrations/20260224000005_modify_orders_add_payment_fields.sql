/*
  # Modify orders: add payment, shipping, and tracking fields

  The existing orders table captures order intent (what was ordered, by whom,
  for which brand) but has no mechanism for:
    - Connecting to a Stripe PaymentIntent (payment capture)
    - Tracking payment state separately from fulfillment state
    - Recording the reseller's tier at the moment the order was placed
      (tier may change over time; the price applied at order time must be auditable)
    - Storing shipping and billing addresses
    - Tracking shipment once the brand fulfills

  Order status lifecycle (now enforced via CHECK constraint):
    pending_payment  → order created, awaiting Stripe payment confirmation
    submitted        → payment captured, order visible to brand
    confirmed        → brand has acknowledged the order
    fulfilled        → brand has packed and handed to carrier
    shipped          → tracking number added, in transit
    delivered        → confirmed delivered
    cancelled        → cancelled before fulfillment
    refunded         → payment reversed after fulfillment

  Payment status lifecycle:
    unpaid           → no payment attempt yet
    authorized       → payment intent created, card authorised
    captured         → payment successfully charged
    failed           → payment attempt failed
    refunded         → payment reversed
    partial_refund   → partial credit issued
*/

-- ─────────────────────────────────────────────
-- 1. ADD NEW COLUMNS
-- ─────────────────────────────────────────────

ALTER TABLE orders
  -- Payment
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
    CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN (
      'unpaid', 'authorized', 'captured', 'failed', 'refunded', 'partial_refund'
    )),

  -- Audit: snapshot the reseller's tier at order time
  -- Tier can change; we need to know which price tier was applied
  ADD COLUMN IF NOT EXISTS reseller_tier_at_order text DEFAULT NULL
    CONSTRAINT orders_reseller_tier_check
    CHECK (reseller_tier_at_order IN ('active', 'elite', 'master')),

  -- Addresses stored as JSONB: { name, line1, line2, city, state, zip, country }
  ADD COLUMN IF NOT EXISTS shipping_address jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS billing_address  jsonb DEFAULT NULL,

  -- Fulfillment tracking (brand fills these in when order ships)
  ADD COLUMN IF NOT EXISTS tracking_number  text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tracking_carrier text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shipped_at       timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS delivered_at     timestamptz DEFAULT NULL;

-- ─────────────────────────────────────────────
-- 2. LOCK DOWN ORDER STATUS VALUES
--    The original column has no CHECK constraint.
--    Add one now, expanding to include the new checkout statuses.
-- ─────────────────────────────────────────────

-- Drop any existing check constraint on status before adding the new one
DO $$ BEGIN
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending_payment',
    'submitted',
    'reviewing',
    'sent_to_brand',
    'confirmed',
    'fulfilled',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ));

-- ─────────────────────────────────────────────
-- 3. INDEXES
-- ─────────────────────────────────────────────

-- Payment intent lookup (Stripe webhook needs to find order by intent ID)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent
  ON orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Payment status filter (admin dashboard: unpaid orders, failed payments)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON orders (payment_status);

-- Fulfilment queue: brand sees submitted orders in date order
CREATE INDEX IF NOT EXISTS idx_orders_brand_submitted
  ON orders (brand_id, created_at DESC)
  WHERE status = 'submitted';

-- ─────────────────────────────────────────────
-- 4. COMMENTS
-- ─────────────────────────────────────────────

COMMENT ON COLUMN orders.stripe_payment_intent_id IS
  'Stripe PaymentIntent ID. Created during checkout, used by webhook to '
  'update payment_status and advance order to submitted.';

COMMENT ON COLUMN orders.payment_status IS
  'Payment lifecycle state, separate from order fulfillment status. '
  'Updated by Stripe webhook events via the stripe-webhook Edge Function.';

COMMENT ON COLUMN orders.reseller_tier_at_order IS
  'Snapshot of the reseller''s tier at the moment the order was placed. '
  'Immutable after order creation — required for pricing audit trail.';

COMMENT ON COLUMN orders.shipping_address IS
  'JSONB shipping address: { name, line1, line2, city, state, zip, country }. '
  'Collected during checkout, passed to brand for fulfillment.';

COMMENT ON COLUMN orders.tracking_number IS
  'Carrier tracking number. Set by brand admin when order is shipped. '
  'Triggers status transition to shipped and notification to business.';
