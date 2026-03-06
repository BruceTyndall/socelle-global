/*
  # Create Brand Training Modules Table

  1. New Tables
    - `brand_training_modules`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, foreign key to brands)
      - `title` (text) - Module title
      - `description` (text) - Module description
      - `format` (text) - Format: pdf, video, link, slide_deck
      - `duration` (text) - Duration like "15 min", "1 hour"
      - `level` (text) - Skill level: beginner, intermediate, advanced
      - `resource_url` (text) - Link to the training resource
      - `sort_order` (integer) - Display order
      - `is_published` (boolean) - Whether module is published
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on brand_training_modules table
    - Platform admins can manage all modules
    - Brand admins can manage their brand's modules
    - Business users can view published modules of active brands
*/

CREATE TABLE IF NOT EXISTS brand_training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  format text NOT NULL CHECK (format IN ('pdf', 'video', 'link', 'slide_deck')),
  duration text,
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  resource_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS brand_training_modules_sort_idx ON brand_training_modules(brand_id, sort_order);

ALTER TABLE brand_training_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage all training modules"
  ON brand_training_modules FOR ALL
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

CREATE POLICY "Brand admins can manage their training modules"
  ON brand_training_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_training_modules.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = brand_training_modules.brand_id
      AND user_profiles.role IN ('brand_admin', 'admin')
    )
  );

CREATE POLICY "Business users can view published training modules"
  ON brand_training_modules FOR SELECT
  TO authenticated
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_training_modules.brand_id
      AND brands.status = 'active'
    ) AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'business_user'
    )
  );

CREATE TRIGGER update_brand_training_modules_updated_at
  BEFORE UPDATE ON brand_training_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();