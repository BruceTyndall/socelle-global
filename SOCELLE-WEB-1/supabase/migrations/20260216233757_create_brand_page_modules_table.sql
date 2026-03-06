/*
  # Create Brand Page Modules Table

  1. New Tables
    - `brand_page_modules`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, foreign key to brands)
      - `module_type` (text) - Type of module: hero, gallery, featured_protocols, etc.
      - `title` (text) - Editable module title
      - `sort_order` (integer) - Order of modules on the page
      - `is_enabled` (boolean) - Whether the module is active
      - `layout_variant` (text) - Layout style for the module
      - `config` (jsonb) - Module-specific configuration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on brand_page_modules table
    - Platform admins can manage all modules
    - Brand admins can manage their brand's modules
    - Public can view enabled modules of published brands
*/

-- Create brand_page_modules table
CREATE TABLE IF NOT EXISTS brand_page_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  module_type text NOT NULL,
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_enabled boolean DEFAULT true,
  layout_variant text DEFAULT 'default',
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for sorting
CREATE INDEX IF NOT EXISTS brand_page_modules_sort_idx ON brand_page_modules(brand_id, sort_order);

-- Enable RLS
ALTER TABLE brand_page_modules ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage all modules
CREATE POLICY "Platform admins can manage all brand page modules"
  ON brand_page_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'platform_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'platform_admin'
    )
  );

-- Brand admins can manage their brand's modules
CREATE POLICY "Brand admins can manage their brand modules"
  ON brand_page_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_page_modules.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_page_modules.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  );

-- Public can view enabled modules of published brands
CREATE POLICY "Public can view enabled modules of published brands"
  ON brand_page_modules FOR SELECT
  USING (
    is_enabled = true AND
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_page_modules.brand_id
      AND brands.is_published = true
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_brand_page_modules_updated_at
  BEFORE UPDATE ON brand_page_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();