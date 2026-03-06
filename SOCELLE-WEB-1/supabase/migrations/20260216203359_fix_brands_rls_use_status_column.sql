/*
  # Fix Brand RLS Policies to Use Correct Column

  ## Problem
  - Previous migration created policies checking `is_published = true`
  - But the brands table uses `status` column (brand_status enum)
  - This causes all brand queries to fail with column not found errors

  ## Changes
  1. Drop incorrect policies that reference is_published
  2. Create correct policies using status = 'active'
  3. Ensure Naturopathica has status = 'active'

  ## Security
  - Anonymous users can SELECT brands where status = 'active'
  - Authenticated users can SELECT brands where status = 'active'
  - This is safe because we only expose brands explicitly set to active status
*/

-- Drop the incorrect policies
DROP POLICY IF EXISTS "Anonymous users can view published brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can view published brands" ON brands;
DROP POLICY IF EXISTS "Public can view active brands" ON brands;

-- Create correct policy for anonymous users to view active brands
CREATE POLICY "Anonymous users can view active brands"
  ON brands
  FOR SELECT
  TO anon
  USING (status = 'active');

-- Create correct policy for authenticated users to view active brands
CREATE POLICY "Authenticated users can view active brands"
  ON brands
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Ensure Naturopathica is active (idempotent update)
UPDATE brands
SET status = 'active'
WHERE slug = 'naturopathica' OR name ILIKE '%naturopathica%';