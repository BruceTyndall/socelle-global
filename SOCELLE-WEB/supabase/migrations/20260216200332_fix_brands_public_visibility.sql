/*
  # Fix Brand Visibility for Public/Anonymous Users

  ## Problem
  - The brands table has RLS enabled
  - The existing public policy checks `status = 'active'`
  - But the frontend code filters by `is_published = true`
  - This causes anonymous users to see "No published brands" even though Naturopathica exists

  ## Changes
  1. Drop the old "Public can view active brands" policy
  2. Create new policies that allow anon + authenticated to view published brands
  3. Ensure Naturopathica is marked as published (already is, but verify)

  ## Security
  - Anonymous (anon) users can SELECT brands where is_published = true
  - Authenticated users can SELECT all published brands
  - This is safe because we only expose brands that are explicitly published
*/

-- Drop the old policy that uses wrong column
DROP POLICY IF EXISTS "Public can view active brands" ON brands;

-- Create new policy for anonymous users to view published brands
CREATE POLICY "Anonymous users can view published brands"
  ON brands
  FOR SELECT
  TO anon
  USING (is_published = true);

-- Create new policy for authenticated users to view published brands
CREATE POLICY "Authenticated users can view published brands"
  ON brands
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Ensure Naturopathica is published (idempotent update)
UPDATE brands
SET is_published = true
WHERE slug = 'naturopathica' OR name ILIKE '%naturopathica%';
