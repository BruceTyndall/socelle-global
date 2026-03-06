/*
  # Create Orders and Order Items Tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique, auto-generated)
      - `brand_id` (uuid, foreign key to brands)
      - `business_id` (uuid, foreign key to businesses)
      - `created_by` (uuid, foreign key to auth.users)
      - `status` (text) - submitted, reviewing, sent_to_brand, confirmed, fulfilled, cancelled
      - `subtotal` (numeric)
      - `commission_percent` (numeric, default 8)
      - `commission_total` (numeric)
      - `admin_fee` (numeric, default 0)
      - `notes` (text) - business order notes
      - `admin_notes` (text) - internal admin notes
      - `brand_notes` (text) - notes to send to brand
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_type` (text) - 'pro' or 'retail'
      - `product_id` (uuid)
      - `product_name` (text)
      - `sku` (text)
      - `unit_price` (numeric)
      - `qty` (integer)
      - `line_total` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Business users can view their own orders
    - Admins can view and manage all orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || LPAD(floor(random() * 1000000)::text, 6, '0'),
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  commission_percent numeric(5,2) DEFAULT 8,
  commission_total numeric(10,2) DEFAULT 0,
  admin_fee numeric(10,2) DEFAULT 0,
  notes text,
  admin_notes text,
  brand_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_type text NOT NULL,
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  sku text,
  unit_price numeric(10,2) NOT NULL,
  qty integer NOT NULL DEFAULT 1,
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Business users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'platform_admin')
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'platform_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'platform_admin')
    )
  );

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'platform_admin')
    )
  );

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'platform_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'platform_admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_brand_id ON orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
