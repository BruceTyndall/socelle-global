/*
  # Add Anonymous Access to Brand Content for Public Discovery

  ## Summary
  Enable anonymous (not logged in) users to browse active brands and their public content.
  This allows public discovery of brands and their protocols/products before signup.

  ## Changes
  1. New Policies (anon SELECT only)
    - canonical_protocols: SELECT where brand is active
    - pro_products: SELECT where brand is active
    - retail_products: SELECT where brand is active
    - marketing_calendar: Already has anon access, update to filter by active brand

  ## Security Notes
  - Only adds minimal SELECT access for anon users
  - Content filtered to active brands only (status='active')
  - Does NOT weaken any authenticated user policies
  - No INSERT, UPDATE, DELETE for anon users
  - Uses IF NOT EXISTS to avoid duplicate policies

  ## Tables Affected
  - canonical_protocols
  - pro_products
  - retail_products
  - marketing_calendar (update existing policy)

  ## Testing
  - Logged out user can view /brands
  - Logged out user can view /portal/brands/:slug
  - Protocol and product lists visible on brand detail page
*/

-- =============================================================================
-- canonical_protocols: Allow anon to SELECT protocols for active brands
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'canonical_protocols'
    AND policyname = 'Anonymous users can view protocols for active brands'
  ) THEN
    CREATE POLICY "Anonymous users can view protocols for active brands"
      ON canonical_protocols
      FOR SELECT
      TO anon
      USING (
        EXISTS (
          SELECT 1 FROM brands
          WHERE brands.id = canonical_protocols.brand_id
          AND brands.status = 'active'
        )
      );
  END IF;
END $$;

-- =============================================================================
-- pro_products: Allow anon to SELECT products for active brands
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'pro_products'
    AND policyname = 'Anonymous users can view pro products for active brands'
  ) THEN
    CREATE POLICY "Anonymous users can view pro products for active brands"
      ON pro_products
      FOR SELECT
      TO anon
      USING (
        EXISTS (
          SELECT 1 FROM brands
          WHERE brands.id = pro_products.brand_id
          AND brands.status = 'active'
        )
      );
  END IF;
END $$;

-- =============================================================================
-- retail_products: Allow anon to SELECT products for active brands
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'retail_products'
    AND policyname = 'Anonymous users can view retail products for active brands'
  ) THEN
    CREATE POLICY "Anonymous users can view retail products for active brands"
      ON retail_products
      FOR SELECT
      TO anon
      USING (
        EXISTS (
          SELECT 1 FROM brands
          WHERE brands.id = retail_products.brand_id
          AND brands.status = 'active'
        )
      );
  END IF;
END $$;

-- =============================================================================
-- marketing_calendar: Update existing anon policy to filter by active brand
-- =============================================================================

-- Drop the existing "allow all" policy for anon
DROP POLICY IF EXISTS "Allow public read access to marketing_calendar" ON marketing_calendar;

-- Create new policy that filters by active brand
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'marketing_calendar'
    AND policyname = 'Anonymous users can view calendar for active brands'
  ) THEN
    CREATE POLICY "Anonymous users can view calendar for active brands"
      ON marketing_calendar
      FOR SELECT
      TO anon
      USING (
        EXISTS (
          SELECT 1 FROM brands
          WHERE brands.id = marketing_calendar.brand_id
          AND brands.status = 'active'
        )
      );
  END IF;
END $$;

-- =============================================================================
-- Verification: Ensure all tables still have RLS enabled
-- =============================================================================

ALTER TABLE canonical_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE retail_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_calendar ENABLE ROW LEVEL SECURITY;
