-- Migration: Ecommerce Extras Schema
-- WO: WO-OVERHAUL-11 (backend pass)
-- Tables: discount_codes, shipping_methods, reviews, wishlists, wishlist_items

-- ============================================================
-- discount_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('percentage','fixed_amount','free_shipping')),
  value_cents int,
  percentage int,
  minimum_order_cents int,
  maximum_uses int,
  current_uses int DEFAULT 0,
  is_active bool DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- shipping_methods
-- ============================================================
CREATE TABLE IF NOT EXISTS shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  carrier text,
  estimated_days_min int,
  estimated_days_max int,
  base_rate_cents int NOT NULL,
  per_item_rate_cents int DEFAULT 0,
  free_above_cents int,
  is_active bool DEFAULT true,
  sort_order int DEFAULT 0
);

ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES orders(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  is_verified_purchase bool DEFAULT false,
  is_approved bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- wishlists
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text DEFAULT 'My Wishlist',
  is_public bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- wishlist_items
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  added_at timestamptz DEFAULT now()
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product ON wishlist_items(product_id);
