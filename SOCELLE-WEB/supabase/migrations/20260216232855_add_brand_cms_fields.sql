/*
  # Add Brand CMS Fields

  1. New Columns
    - `short_description` (text) - Brief description, max 200 chars
    - `long_description` (text) - Extended description
    - `category_tags` (text[]) - Array of category/feature tags
    - `contact_email` (text) - Brand contact email
    - `hero_image_url` (text) - Hero image for brand page
    - `hero_video_url` (text) - Optional hero video URL
    - `theme` (jsonb) - Brand theme settings (colors, typography, density, hero_variant)
    - `is_published` (boolean) - Publication status
    - `published_at` (timestamptz) - Publication timestamp

  2. Purpose
    - Enable rich brand customization in admin CMS
    - Store theme configuration for dynamic brand pages
    - Track publication workflow

  3. Defaults
    - is_published defaults to false (draft mode)
    - theme defaults to null (will be set by admin)
    - All text fields nullable for gradual completion
*/

-- Add new columns to brands table
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS category_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS hero_video_url text,
  ADD COLUMN IF NOT EXISTS theme jsonb,
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Update existing Naturopathica brand with sample theme
UPDATE brands
SET
  short_description = 'Holistic skincare rooted in botanical science',
  is_published = true,
  published_at = now(),
  theme = jsonb_build_object(
    'colors', jsonb_build_object(
      'primary', '#2C5F3F',
      'secondary', '#8B9D83',
      'accent', '#D4A574',
      'surface', '#F8F7F4',
      'text', '#1A1A1A'
    ),
    'typography', 'luxury',
    'density', 'spacious',
    'hero_variant', 'full_bleed'
  )
WHERE slug = 'naturopathica';