/*
  # Create Brand Assets Table

  1. New Tables
    - `brand_assets`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, foreign key to brands)
      - `file_url` (text) - Public URL from Supabase Storage
      - `file_name` (text) - Original filename
      - `file_type` (text) - MIME type
      - `file_size` (integer) - File size in bytes
      - `title` (text) - User-editable title
      - `alt_text` (text) - Accessibility description
      - `caption` (text) - Image caption
      - `collection` (text) - Category: hero, protocols, retail, education, press, general
      - `tags` (text[]) - Array of tag strings
      - `is_featured` (boolean) - Featured asset flag
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Storage
    - Create 'brand-assets' storage bucket for file uploads

  3. Security
    - Enable RLS on brand_assets table
    - Platform admins can manage all assets
    - Brand admins can manage their brand's assets only
    - Public can view assets of published brands
*/

-- Create brand_assets table
CREATE TABLE IF NOT EXISTS brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  title text,
  alt_text text,
  caption text,
  collection text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage all assets
CREATE POLICY "Platform admins can manage all brand assets"
  ON brand_assets FOR ALL
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

-- Brand admins can manage their brand's assets
CREATE POLICY "Brand admins can manage their brand assets"
  ON brand_assets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_assets.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_assets.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  );

-- Public can view assets of published brands
CREATE POLICY "Public can view assets of published brands"
  ON brand_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_assets.brand_id
      AND brands.is_published = true
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_brand_assets_updated_at
  BEFORE UPDATE ON brand_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for brand-assets bucket
CREATE POLICY "Platform admins can upload brand assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-assets' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'platform_admin'
    )
  );

CREATE POLICY "Brand admins can upload their brand assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-assets' AND
    (storage.foldername(name))[1] IN (
      SELECT brand_id::text FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );

CREATE POLICY "Anyone can view brand assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-assets');

CREATE POLICY "Platform admins can delete all brand assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-assets' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'platform_admin'
    )
  );

CREATE POLICY "Brand admins can delete their brand assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-assets' AND
    (storage.foldername(name))[1] IN (
      SELECT brand_id::text FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );