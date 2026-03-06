/*
  # Brand Portal Commerce Access

  1. Brand Admin RLS for orders
     - Brand admins can view/update orders for their brand

  2. Brand Admin RLS for order_items
     - Brand admins can view order items for their brand's orders

  3. Brand Admin RLS for businesses
     - Brand admins can view businesses that have plans/orders with their brand

  4. Commercial product fields
     - Add sku, category, msrp_price, wholesale_price, stock_count, is_active,
       is_bestseller to pro_products and retail_products

  5. brand_messages table
     - Thread-based messaging between brand reps and retailers
*/

-- ═══════════════════════════════════════════════
-- 1. ORDERS — brand admin read/update access
-- ═══════════════════════════════════════════════

CREATE POLICY "Brand admins can view their brand orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = orders.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );

CREATE POLICY "Brand admins can update their brand orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = orders.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = orders.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );

-- ═══════════════════════════════════════════════
-- 2. ORDER_ITEMS — brand admin read access
-- ═══════════════════════════════════════════════

CREATE POLICY "Brand admins can view their brand order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN user_profiles ON user_profiles.id = auth.uid()
      WHERE orders.id = order_items.order_id
      AND user_profiles.brand_id = orders.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );

-- ═══════════════════════════════════════════════
-- 3. BUSINESSES — brand admin read access (for retailers)
-- ═══════════════════════════════════════════════

CREATE POLICY "Brand admins can view businesses with their brand plans"
  ON businesses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plans
      JOIN user_profiles ON user_profiles.id = auth.uid()
      WHERE plans.business_id = businesses.id
      AND user_profiles.brand_id = plans.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );

-- ═══════════════════════════════════════════════
-- 4. PRODUCT COMMERCIAL FIELDS
-- ═══════════════════════════════════════════════

-- pro_products commercial additions
ALTER TABLE pro_products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS msrp_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS wholesale_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS stock_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_bestseller boolean DEFAULT false;

-- retail_products commercial additions
ALTER TABLE retail_products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS msrp_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS wholesale_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS stock_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_bestseller boolean DEFAULT false;

-- ═══════════════════════════════════════════════
-- 5. BRAND MESSAGES TABLE
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS brand_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    uuid        NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  business_id uuid        REFERENCES businesses(id) ON DELETE SET NULL,
  sender_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type text        NOT NULL CHECK (sender_type IN ('brand', 'retailer')),
  content     text        NOT NULL,
  read_at     timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE brand_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_brand_messages_brand_id    ON brand_messages(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_messages_business_id ON brand_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_brand_messages_created_at  ON brand_messages(created_at DESC);

CREATE POLICY "Brand admins can view their brand messages"
  ON brand_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_messages.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );

CREATE POLICY "Brand admins can insert brand messages"
  ON brand_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_messages.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );

CREATE POLICY "Business users can view their messages"
  ON brand_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.business_id = brand_messages.business_id
    )
  );

CREATE POLICY "Business users can insert messages"
  ON brand_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.business_id = brand_messages.business_id
    )
  );

CREATE POLICY "Message senders can mark as read"
  ON brand_messages FOR UPDATE
  TO authenticated
  USING (
    sender_id != auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = brand_messages.brand_id
        AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
      )
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.business_id = brand_messages.business_id
      )
    )
  );
