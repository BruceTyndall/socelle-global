/*
  # Create product_pricing table — tiered wholesale pricing per SKU

  Replaces the single wholesale_price column on pro_products/retail_products
  with a flexible tier × product pricing matrix.

  Tier vocabulary:
    'msrp'   — consumer suggested retail price. Visible to everyone,
               used for "you save X%" display on brand storefronts.
    'active' — standard reseller wholesale. Available to any verified
               reseller (reseller_tier = 'active' or above).
    'elite'  — preferred pricing for Elite resellers.
    'master' — best pricing, exclusive to Master resellers.

  The existing wholesale_price column on pro_products/retail_products
  remains as a fallback when no entry exists in this table for a given tier.
  New products should have pricing set here; old products fall back to the
  column value until migrated.

  Price resolution logic (implemented in application via useProductPrice hook):
    1. Look up product_pricing WHERE product_id + tier = user's reseller_tier
    2. Fall back to one tier down (master → elite → active)
    3. Final fallback: pro_products.wholesale_price / retail_products.wholesale_price
    4. If still no price: product is not orderable (not shown in cart-eligible UI)

  RLS design:
    - Brand admins   → full CRUD for their brand's product pricing
    - Business users → SELECT only, all tiers for active brand products
                       (application filters to correct tier at query time)
    - Platform admin → full access
    - Anonymous      → no access (pricing is authenticated B2B only)
*/

-- ─────────────────────────────────────────────
-- TABLE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_pricing (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid        NOT NULL,
  product_type text        NOT NULL
                           CHECK (product_type IN ('pro', 'retail')),
  brand_id     uuid        NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  tier         text        NOT NULL
                           CHECK (tier IN ('msrp', 'active', 'elite', 'master')),
  price        numeric(10,2) NOT NULL
                           CHECK (price >= 0),
  currency     text        NOT NULL DEFAULT 'usd',
  min_qty      integer     NOT NULL DEFAULT 1
                           CHECK (min_qty >= 1),
                           -- Minimum order quantity required to access this tier price.
                           -- Brands use this for case-pack minimums (e.g. min 6 units
                           -- at the elite price, otherwise active price applies).
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  -- One price per product per tier — brand updates this row, never inserts a duplicate
  UNIQUE (product_id, product_type, tier)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

-- Primary lookup: resolve price for a specific product + tier
CREATE INDEX IF NOT EXISTS idx_product_pricing_lookup
  ON product_pricing (product_id, product_type, tier)
  WHERE is_active = true;

-- Brand admin view: all pricing for a brand's catalog
CREATE INDEX IF NOT EXISTS idx_product_pricing_brand
  ON product_pricing (brand_id, product_type)
  WHERE is_active = true;

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────

CREATE TRIGGER update_product_pricing_updated_at
  BEFORE UPDATE ON product_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────

ALTER TABLE product_pricing ENABLE ROW LEVEL SECURITY;

-- Brand admins: full management of their brand's pricing
CREATE POLICY "Brand admins manage their product pricing"
  ON product_pricing FOR ALL
  TO authenticated
  USING (
    brand_id IN (
      SELECT brand_id FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'brand_admin')
      AND brand_id IS NOT NULL
    )
  )
  WITH CHECK (
    brand_id IN (
      SELECT brand_id FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'brand_admin')
      AND brand_id IS NOT NULL
    )
  );

-- Business users: read pricing for active brands (all tiers visible;
-- application filters to the user's tier at query time)
CREATE POLICY "Business users can view pricing for active brands"
  ON product_pricing FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('business_user', 'spa_user')
    )
    AND brand_id IN (
      SELECT id FROM brands WHERE status = 'active'
    )
  );

-- Platform admins: full access
CREATE POLICY "Platform admins have full access to product pricing"
  ON product_pricing FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  );

-- ─────────────────────────────────────────────
-- HELPER RPC: resolve_product_price
-- Returns the correct price for a product given a reseller tier,
-- with automatic fallback through lower tiers.
-- Called by the application's useProductPrice hook.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION resolve_product_price(
  p_product_id   uuid,
  p_product_type text,
  p_tier         text DEFAULT 'active'
)
RETURNS TABLE (
  resolved_tier  text,
  price          numeric(10,2),
  currency       text,
  min_qty        integer
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  tier_order text[] := ARRAY['master', 'elite', 'active', 'msrp'];
  try_tier   text;
  idx        integer;
BEGIN
  -- Find the starting index for the requested tier
  SELECT array_position(tier_order, p_tier) INTO idx;

  -- If unrecognised tier, start from 'active'
  IF idx IS NULL THEN
    idx := 3;
  END IF;

  -- Walk down the tier ladder until a price is found
  FOR i IN idx..array_length(tier_order, 1) LOOP
    try_tier := tier_order[i];

    RETURN QUERY
      SELECT
        pp.tier,
        pp.price,
        pp.currency,
        pp.min_qty
      FROM product_pricing pp
      WHERE pp.product_id   = p_product_id
        AND pp.product_type = p_product_type
        AND pp.tier         = try_tier
        AND pp.is_active    = true
      LIMIT 1;

    -- If a row was returned, stop searching
    IF FOUND THEN
      RETURN;
    END IF;
  END LOOP;

  -- No price found at any tier — return empty (caller handles no-price state)
  RETURN;
END;
$$;

COMMENT ON FUNCTION resolve_product_price(uuid, text, text) IS
  'Returns the best available price for a product at the given reseller tier, '
  'falling back through master → elite → active → msrp until a price is found. '
  'Returns empty if no pricing is configured. SECURITY DEFINER so business users '
  'can call it without needing direct SELECT on product_pricing.';

-- ─────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────

COMMENT ON TABLE product_pricing IS
  'Tiered wholesale pricing per product per reseller tier. '
  'One row per (product_id, product_type, tier) combination. '
  'Brands set pricing here; the resolve_product_price() RPC resolves '
  'the correct price for a given user at query time.';
