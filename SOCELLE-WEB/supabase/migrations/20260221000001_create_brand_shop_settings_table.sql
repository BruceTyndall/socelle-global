-- Create brand_shop_settings table
-- Required for the Admin Brand Editor "Shop" settings tab

CREATE TABLE IF NOT EXISTS brand_shop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,

  -- Visibility
  shop_enabled BOOLEAN NOT NULL DEFAULT true,
  show_retail_products BOOLEAN NOT NULL DEFAULT true,
  show_pro_products BOOLEAN NOT NULL DEFAULT false,

  -- Ordering
  min_order_amount NUMERIC(10, 2) DEFAULT NULL,
  max_order_quantity INTEGER DEFAULT NULL,
  order_note TEXT DEFAULT NULL,

  -- Display settings
  featured_product_ids UUID[] DEFAULT '{}',
  product_sort_order TEXT NOT NULL DEFAULT 'alpha', -- alpha | price_asc | price_desc | featured

  -- Contact / fulfillment
  fulfillment_email TEXT DEFAULT NULL,
  fulfillment_phone TEXT DEFAULT NULL,
  fulfillment_notes TEXT DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(brand_id)
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_brand_shop_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS brand_shop_settings_updated_at ON brand_shop_settings;
CREATE TRIGGER brand_shop_settings_updated_at
  BEFORE UPDATE ON brand_shop_settings
  FOR EACH ROW EXECUTE FUNCTION update_brand_shop_settings_updated_at();

-- RLS
ALTER TABLE brand_shop_settings ENABLE ROW LEVEL SECURITY;

-- Admins and brand admins can read/write their brand's settings
CREATE POLICY "Brand admins can manage shop settings"
  ON brand_shop_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = brand_shop_settings.brand_id
        AND user_profiles.role IN ('admin', 'brand_admin', 'platform_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = brand_shop_settings.brand_id
        AND user_profiles.role IN ('admin', 'brand_admin', 'platform_admin')
    )
  );

-- Platform admins can access all shop settings
CREATE POLICY "Platform admins can manage all shop settings"
  ON brand_shop_settings
  FOR ALL
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

-- Business users (spas) can read shop settings for brands they interact with
CREATE POLICY "Business users can read shop settings"
  ON brand_shop_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('business_user', 'spa_user')
    )
    AND shop_enabled = true
  );

-- Index for lookups by brand_id
CREATE INDEX IF NOT EXISTS idx_brand_shop_settings_brand_id ON brand_shop_settings(brand_id);

-- Seed default shop settings for any existing brands that don't have a record yet
INSERT INTO brand_shop_settings (brand_id)
SELECT id FROM brands
WHERE id NOT IN (SELECT brand_id FROM brand_shop_settings)
ON CONFLICT (brand_id) DO NOTHING;
