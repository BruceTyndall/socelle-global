/*
  # Create Brands and Businesses Tables

  1. New Enum Types
    - `brand_status` - active, inactive, pending
    - `business_type` - spa, salon, barbershop, medspa, wellness_center, other

  2. New Tables
    - `brands`
      - Core brand information (name, slug, description, logo, website)
      - Status field for activation control
      
    - `businesses`
      - Business operator information
      - Type classification
      - Creator tracking

  3. User Profile Extensions
    - Add `brand_id` for brand admin association
    - Add `business_id` for business user association

  4. Security
    - Enable RLS on brands and businesses
    - Public can view active brands
    - Brand admins can manage their brand only
    - Business users can manage their business only
    - Platform admins have full access

  5. Seed Data
    - Create Naturopathica as first brand
    - Associate existing admin users with Naturopathica
*/

-- Create new enum types
CREATE TYPE brand_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE business_type AS ENUM ('spa', 'salon', 'barbershop', 'medspa', 'wellness_center', 'other');

-- Create brands table
CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  status brand_status DEFAULT 'active',
  description text,
  logo_url text,
  website_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create businesses table
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type business_type DEFAULT 'spa',
  location text,
  created_by_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add tenant columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN brand_id uuid REFERENCES brands(id);
ALTER TABLE user_profiles ADD COLUMN business_id uuid REFERENCES businesses(id);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Brands RLS Policies
CREATE POLICY "Public can view active brands"
  ON brands FOR SELECT
  USING (status = 'active');

CREATE POLICY "Brand admins can view their brand"
  ON brands FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brands.id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  );

CREATE POLICY "Platform admins can view all brands"
  ON brands FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'platform_admin'
    )
  );

CREATE POLICY "Brand admins can update their brand"
  ON brands FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brands.id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brands.id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  );

CREATE POLICY "Platform admins can manage all brands"
  ON brands FOR ALL
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

-- Businesses RLS Policies
CREATE POLICY "Business users can view their business"
  ON businesses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.business_id = businesses.id
    )
  );

CREATE POLICY "Business users can update their business"
  ON businesses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.business_id = businesses.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.business_id = businesses.id
    )
  );

CREATE POLICY "Authenticated users can create businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Platform admins can manage all businesses"
  ON businesses FOR ALL
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed Naturopathica brand
INSERT INTO brands (id, name, slug, status, description, logo_url, website_url)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Naturopathica',
  'naturopathica',
  'active',
  'Holistic skincare and spa solutions rooted in botanical science',
  '/naturopathica-logo.svg',
  'https://naturopathica.com'
);

-- Associate existing admin users with Naturopathica
UPDATE user_profiles
SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE role = 'admin' AND brand_id IS NULL;