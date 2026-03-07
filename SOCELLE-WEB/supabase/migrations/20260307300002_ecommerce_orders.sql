-- Migration: Ecommerce Orders Schema
-- WO: WO-OVERHAUL-11 (backend pass)
-- Tables: orders, order_items

-- ============================================================
-- orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  subtotal_cents int NOT NULL,
  discount_cents int DEFAULT 0,
  tax_cents int DEFAULT 0,
  shipping_cents int DEFAULT 0,
  total_cents int NOT NULL,
  currency text DEFAULT 'USD',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price_cents int NOT NULL,
  total_price_cents int NOT NULL,
  product_snapshot jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_stripe_pi ON orders(stripe_payment_intent_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
