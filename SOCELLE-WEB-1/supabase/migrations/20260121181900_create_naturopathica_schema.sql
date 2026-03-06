/*
  # Naturopathica Service Mapping Platform Schema

  ## Overview
  Complete database schema for storing Naturopathica reference libraries, spa menus,
  and mapping results for the Account Manager service-mapping engine.

  ## New Tables

  ### Reference Libraries
  
  1. `canonical_protocols` - Official Naturopathica treatment protocols
    - `id` (uuid, primary key)
    - `protocol_name` (text, exact name, unique)
    - `category` (text, service category)
    - `target_concerns` (text[], array of concerns)
    - `modalities_steps` (jsonb, nullable, steps/modalities if available)
    - `typical_duration` (text, nullable)
    - `allowed_products` (text[], nullable)
    - `contraindications` (text[], nullable)
    - `created_at` (timestamptz)

  2. `pro_products` - Professional-use products
    - `id` (uuid, primary key)
    - `product_name` (text, exact name, unique)
    - `product_function` (text, function/outcomes)
    - `key_ingredients` (text[], nullable)
    - `in_service_usage_allowed` (text, yes/no/unknown)
    - `contraindications` (text[], nullable)
    - `created_at` (timestamptz)

  3. `retail_products` - Take-home retail products
    - `id` (uuid, primary key)
    - `product_name` (text, exact name, unique)
    - `product_function` (text, function/outcomes)
    - `target_concerns` (text[], concerns addressed)
    - `key_ingredients` (text[], nullable)
    - `regimen_placement` (text, nullable, AM/PM)
    - `created_at` (timestamptz)

  4. `mixing_rules` - Product combination and formulation rules
    - `id` (uuid, primary key)
    - `rule_type` (text, compatibility/concentration/restriction)
    - `product_references` (text[], products involved)
    - `rule_description` (text, the rule constraint)
    - `severity` (text, mandatory/warning/info)
    - `created_at` (timestamptz)

  5. `treatment_costs` - COGS data for treatments
    - `id` (uuid, primary key)
    - `item_type` (text, protocol/product/step)
    - `item_reference` (text, name or identifier)
    - `cost_per_unit` (numeric, nullable)
    - `unit_type` (text, nullable, ml/application/treatment)
    - `typical_usage_amount` (numeric, nullable)
    - `notes` (text, nullable)
    - `created_at` (timestamptz)

  ### Spa Menu Management

  6. `spa_menus` - Uploaded spa menus
    - `id` (uuid, primary key)
    - `spa_name` (text)
    - `upload_date` (timestamptz)
    - `raw_menu_data` (text, original menu text/data)
    - `parse_status` (text, pending/parsed/reviewed)
    - `created_at` (timestamptz)

  7. `spa_services` - Parsed individual services
    - `id` (uuid, primary key)
    - `menu_id` (uuid, foreign key to spa_menus)
    - `service_name` (text)
    - `category` (text)
    - `duration` (text, nullable)
    - `price` (numeric, nullable)
    - `description` (text, nullable)
    - `keywords` (text[], extracted keywords)
    - `created_at` (timestamptz)

  8. `service_mappings` - Mapping results
    - `id` (uuid, primary key)
    - `service_id` (uuid, foreign key to spa_services)
    - `solution_type` (text, Protocol/Custom-Built)
    - `solution_reference` (text, protocol name or custom treatment name)
    - `match_type` (text, Direct Fit/Partial Fit/Adjacent Opportunity)
    - `confidence` (text, High/Medium/Low)
    - `rationale` (text)
    - `custom_build_details` (jsonb, nullable, products and steps for custom builds)
    - `retail_attach` (text[], SKU recommendations)
    - `cogs_status` (text, Known/Partial/Unknown)
    - `cogs_amount` (numeric, nullable)
    - `pricing_guidance` (text, nullable)
    - `created_at` (timestamptz)

  ## Security
  All tables enable RLS with policies for authenticated users.
*/

-- Canonical Protocols
CREATE TABLE IF NOT EXISTS canonical_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_name text UNIQUE NOT NULL,
  category text NOT NULL,
  target_concerns text[] DEFAULT '{}',
  modalities_steps jsonb,
  typical_duration text,
  allowed_products text[] DEFAULT '{}',
  contraindications text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE canonical_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read canonical_protocols"
  ON canonical_protocols FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert canonical_protocols"
  ON canonical_protocols FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update canonical_protocols"
  ON canonical_protocols FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete canonical_protocols"
  ON canonical_protocols FOR DELETE
  TO authenticated
  USING (true);

-- PRO Products
CREATE TABLE IF NOT EXISTS pro_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text UNIQUE NOT NULL,
  product_function text NOT NULL,
  key_ingredients text[] DEFAULT '{}',
  in_service_usage_allowed text DEFAULT 'unknown',
  contraindications text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pro_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read pro_products"
  ON pro_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert pro_products"
  ON pro_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update pro_products"
  ON pro_products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete pro_products"
  ON pro_products FOR DELETE
  TO authenticated
  USING (true);

-- Retail Products
CREATE TABLE IF NOT EXISTS retail_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text UNIQUE NOT NULL,
  product_function text NOT NULL,
  target_concerns text[] DEFAULT '{}',
  key_ingredients text[] DEFAULT '{}',
  regimen_placement text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE retail_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read retail_products"
  ON retail_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert retail_products"
  ON retail_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update retail_products"
  ON retail_products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete retail_products"
  ON retail_products FOR DELETE
  TO authenticated
  USING (true);

-- Mixing Rules
CREATE TABLE IF NOT EXISTS mixing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL,
  product_references text[] DEFAULT '{}',
  rule_description text NOT NULL,
  severity text DEFAULT 'mandatory',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mixing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read mixing_rules"
  ON mixing_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert mixing_rules"
  ON mixing_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update mixing_rules"
  ON mixing_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete mixing_rules"
  ON mixing_rules FOR DELETE
  TO authenticated
  USING (true);

-- Treatment Costs
CREATE TABLE IF NOT EXISTS treatment_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,
  item_reference text NOT NULL,
  cost_per_unit numeric,
  unit_type text,
  typical_usage_amount numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE treatment_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read treatment_costs"
  ON treatment_costs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert treatment_costs"
  ON treatment_costs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update treatment_costs"
  ON treatment_costs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete treatment_costs"
  ON treatment_costs FOR DELETE
  TO authenticated
  USING (true);

-- Spa Menus
CREATE TABLE IF NOT EXISTS spa_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spa_name text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  raw_menu_data text NOT NULL,
  parse_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE spa_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read spa_menus"
  ON spa_menus FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert spa_menus"
  ON spa_menus FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update spa_menus"
  ON spa_menus FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete spa_menus"
  ON spa_menus FOR DELETE
  TO authenticated
  USING (true);

-- Spa Services
CREATE TABLE IF NOT EXISTS spa_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES spa_menus(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  category text NOT NULL,
  duration text,
  price numeric,
  description text,
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE spa_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read spa_services"
  ON spa_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert spa_services"
  ON spa_services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update spa_services"
  ON spa_services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete spa_services"
  ON spa_services FOR DELETE
  TO authenticated
  USING (true);

-- Service Mappings
CREATE TABLE IF NOT EXISTS service_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES spa_services(id) ON DELETE CASCADE,
  solution_type text NOT NULL,
  solution_reference text NOT NULL,
  match_type text NOT NULL,
  confidence text NOT NULL,
  rationale text NOT NULL,
  custom_build_details jsonb,
  retail_attach text[] DEFAULT '{}',
  cogs_status text DEFAULT 'Unknown',
  cogs_amount numeric,
  pricing_guidance text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read service_mappings"
  ON service_mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert service_mappings"
  ON service_mappings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update service_mappings"
  ON service_mappings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete service_mappings"
  ON service_mappings FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_spa_services_menu_id ON spa_services(menu_id);
CREATE INDEX IF NOT EXISTS idx_service_mappings_service_id ON service_mappings(service_id);
CREATE INDEX IF NOT EXISTS idx_canonical_protocols_category ON canonical_protocols(category);
CREATE INDEX IF NOT EXISTS idx_spa_services_category ON spa_services(category);