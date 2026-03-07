-- Migration: Ecommerce Products Schema
-- WO: WO-OVERHAUL-11 (backend pass)
-- Tables: products, product_categories, product_variants

-- Enable RLS on all tables created here
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;

-- ============================================================
-- product_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES product_categories(id),
  sort_order int DEFAULT 0,
  image_url text,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  price_cents int NOT NULL,
  compare_at_price_cents int,
  currency text DEFAULT 'USD',
  sku text,
  stock_quantity int DEFAULT 0,
  track_inventory bool DEFAULT true,
  is_active bool DEFAULT true,
  is_featured bool DEFAULT false,
  category_id uuid REFERENCES product_categories(id),
  brand_id uuid,
  images jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- product_variants
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  price_cents int NOT NULL,
  stock_quantity int DEFAULT 0,
  attributes jsonb DEFAULT '{}'::jsonb,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
