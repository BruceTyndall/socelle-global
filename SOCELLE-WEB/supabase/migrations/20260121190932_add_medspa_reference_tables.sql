/*
  # Add Med-Spa Reference Tables

  ## Overview
  Adds specialized tables for med-spa treatment protocols, product recommendations,
  and application contexts to support med-spa focused service mapping.

  ## New Tables

  1. `medspa_treatments` - Med-spa treatment protocols with pre/post care
    - `id` (uuid, primary key)
    - `treatment_name` (text, unique)
    - `treatment_type` (text, e.g., Chemical Peels, Injectables, etc.)
    - `why_popular` (text, commercial rationale)
    - `pre_treatment_products` (text[], product names)
    - `post_treatment_products` (text[], product names)
    - `retail_extension` (text[], recommended retail products)
    - `created_at` (timestamptz)

  2. `medspa_products` - Products with med-spa specific context
    - `id` (uuid, primary key)
    - `product_name` (text)
    - `category` (text)
    - `size` (text)
    - `retail_price` (numeric)
    - `backbar_price` (numeric)
    - `medspa_application` (text, PRE/IN/POST/AT-HOME)
    - `value_proposition` (text)
    - `priority` (text, CRITICAL/HIGH/RECOMMENDED)
    - `why_excels` (text)
    - `created_at` (timestamptz)

  3. `medspa_product_kits` - Pre-configured product kits
    - `id` (uuid, primary key)
    - `kit_name` (text)
    - `total_value` (numeric)
    - `use_case` (text)
    - `rationale` (text)
    - `product_names` (text[])
    - `created_at` (timestamptz)

  ## Security
  Enable RLS on all tables with policies for authenticated users.
*/

-- Med-Spa Treatments
CREATE TABLE IF NOT EXISTS medspa_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_name text NOT NULL,
  treatment_type text NOT NULL,
  why_popular text NOT NULL,
  pre_treatment_products text[] DEFAULT '{}',
  post_treatment_products text[] DEFAULT '{}',
  retail_extension text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medspa_treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read medspa_treatments"
  ON medspa_treatments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert medspa_treatments"
  ON medspa_treatments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update medspa_treatments"
  ON medspa_treatments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete medspa_treatments"
  ON medspa_treatments FOR DELETE
  TO authenticated
  USING (true);

-- Med-Spa Products
CREATE TABLE IF NOT EXISTS medspa_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  category text NOT NULL,
  size text,
  retail_price numeric,
  backbar_price numeric,
  medspa_application text NOT NULL,
  value_proposition text NOT NULL,
  priority text DEFAULT 'RECOMMENDED',
  why_excels text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medspa_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read medspa_products"
  ON medspa_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert medspa_products"
  ON medspa_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update medspa_products"
  ON medspa_products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete medspa_products"
  ON medspa_products FOR DELETE
  TO authenticated
  USING (true);

-- Med-Spa Product Kits
CREATE TABLE IF NOT EXISTS medspa_product_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_name text NOT NULL,
  total_value numeric NOT NULL,
  use_case text NOT NULL,
  rationale text NOT NULL,
  product_names text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medspa_product_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read medspa_product_kits"
  ON medspa_product_kits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert medspa_product_kits"
  ON medspa_product_kits FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update medspa_product_kits"
  ON medspa_product_kits FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete medspa_product_kits"
  ON medspa_product_kits FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medspa_treatments_type ON medspa_treatments(treatment_type);
CREATE INDEX IF NOT EXISTS idx_medspa_products_category ON medspa_products(category);
CREATE INDEX IF NOT EXISTS idx_medspa_products_priority ON medspa_products(priority);