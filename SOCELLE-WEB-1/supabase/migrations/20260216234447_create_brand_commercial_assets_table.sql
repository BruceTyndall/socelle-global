/*
  # Create Brand Commercial Assets Table

  1. New Tables
    - `brand_commercial_assets`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, foreign key to brands)
      - `title` (text) - Asset title
      - `asset_type` (text) - Type: sell_sheet, price_list, margin_guide, terms, moq_info
      - `resource_url` (text) - Link to the asset
      - `notes` (text) - Additional notes
      - `is_internal_only` (boolean) - Only visible to platform admins
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on brand_commercial_assets table
    - Platform admins can manage all assets
    - Brand admins can manage their brand's assets
    - Business users can view non-internal assets of active brands
*/

CREATE TABLE IF NOT EXISTS brand_commercial_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('sell_sheet', 'price_list', 'margin_guide', 'terms', 'moq_info')),
  resource_url text,
  notes text,
  is_internal_only boolean DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS brand_commercial_assets_sort_idx ON brand_commercial_assets(brand_id, sort_order);

ALTER TABLE brand_commercial_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage all commercial assets"
  ON brand_commercial_assets FOR ALL
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

CREATE POLICY "Brand admins can manage their commercial assets"
  ON brand_commercial_assets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_commercial_assets.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_commercial_assets.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  );

CREATE POLICY "Business users can view non-internal commercial assets"
  ON brand_commercial_assets FOR SELECT
  TO authenticated
  USING (
    is_internal_only = false AND
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_commercial_assets.brand_id
      AND brands.status = 'active'
    ) AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'business_user'
    )
  );

CREATE TRIGGER update_brand_commercial_assets_updated_at
  BEFORE UPDATE ON brand_commercial_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();