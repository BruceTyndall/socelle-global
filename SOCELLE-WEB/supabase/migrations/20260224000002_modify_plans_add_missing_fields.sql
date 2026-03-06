/*
  # Modify plans: add missing fields and fix brand admin RLS

  1. Missing columns (confirmed absent from original migration):
     - business_id    (uuid, FK to businesses) — links plan to a business record.
                      Currently only business_user_id (FK to auth.users) exists.
                      Referenced in brand portal queries and businesses RLS policy
                      from 20260223000002 — that policy has been silently broken.
     - fit_score      (numeric 5,2) — overall brand fit score 0–100, computed
                      at analysis completion. Queried in brand dashboard and
                      PlansList but never defined in schema.
     - completed_at   (timestamptz) — when status moved to 'ready'. Enables
                      efficient "most recent ready plan" queries without full scan.

  2. Missing RLS policies:
     - Brand admins had no SELECT policy on plans. The brand dashboard
       queries plans filtered by brand_id — this has been returning empty
       results for all brand admin users.
     - Brand admins had no SELECT policy on business_plan_outputs. The
       pipeline value calculation on the brand dashboard was silently broken.

  All column additions use IF NOT EXISTS — safe to run on a database
  where these were added manually.
*/

-- ─────────────────────────────────────────────
-- 1. PLANS — add missing columns
-- ─────────────────────────────────────────────

ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS business_id uuid
    REFERENCES businesses(id) ON DELETE SET NULL,

  ADD COLUMN IF NOT EXISTS fit_score numeric(5,2) DEFAULT NULL
    CONSTRAINT plans_fit_score_check
    CHECK (fit_score >= 0 AND fit_score <= 100),

  ADD COLUMN IF NOT EXISTS completed_at timestamptz DEFAULT NULL;

-- Index: brand dashboard queries plans by brand_id frequently
CREATE INDEX IF NOT EXISTS idx_plans_brand_id
  ON plans (brand_id);

-- Index: business_id lookups (brand CRM drill-down to reseller's plans)
CREATE INDEX IF NOT EXISTS idx_plans_business_id
  ON plans (business_id)
  WHERE business_id IS NOT NULL;

-- Index: recent completed plans per brand (brand dashboard "Recent Analyses")
CREATE INDEX IF NOT EXISTS idx_plans_brand_completed
  ON plans (brand_id, completed_at DESC)
  WHERE completed_at IS NOT NULL;

COMMENT ON COLUMN plans.business_id IS
  'FK to businesses table. Links this analysis to a business record. '
  'Nullable for backward compat — existing plans only have business_user_id.';

COMMENT ON COLUMN plans.fit_score IS
  'Overall brand fit score 0–100, computed when analysis reaches ready status. '
  'Stored here for fast dashboard queries rather than reading from output JSONB.';

COMMENT ON COLUMN plans.completed_at IS
  'Timestamp when plan status moved to ready. NULL = analysis not yet complete.';

-- ─────────────────────────────────────────────
-- 2. PLANS — brand admin RLS (was completely missing)
-- ─────────────────────────────────────────────

-- Brand admins can read plans for their brand (brand dashboard, analytics)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'plans'
    AND policyname = 'Brand admins can view their brand plans'
  ) THEN
    CREATE POLICY "Brand admins can view their brand plans"
      ON plans FOR SELECT
      TO authenticated
      USING (
        brand_id IN (
          SELECT brand_id FROM user_profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'brand_admin')
          AND brand_id IS NOT NULL
        )
      );
  END IF;
END $$;

-- Platform admins can view all plans
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'plans'
    AND policyname = 'Platform admins can view all plans'
  ) THEN
    CREATE POLICY "Platform admins can view all plans"
      ON plans FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid()
          AND role = 'platform_admin'
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 3. BUSINESS_PLAN_OUTPUTS — brand admin RLS (was completely missing)
-- ─────────────────────────────────────────────

-- Brand admins can read outputs for plans belonging to their brand.
-- Required for: pipeline value calculation, recent analyses list.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'business_plan_outputs'
    AND policyname = 'Brand admins can view their brand plan outputs'
  ) THEN
    CREATE POLICY "Brand admins can view their brand plan outputs"
      ON business_plan_outputs FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM plans
          JOIN user_profiles ON user_profiles.id = auth.uid()
          WHERE plans.id = business_plan_outputs.plan_id
          AND plans.brand_id = user_profiles.brand_id
          AND user_profiles.role IN ('admin', 'brand_admin')
          AND user_profiles.brand_id IS NOT NULL
        )
      );
  END IF;
END $$;

-- Platform admins can view all outputs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'business_plan_outputs'
    AND policyname = 'Platform admins can view all plan outputs'
  ) THEN
    CREATE POLICY "Platform admins can view all plan outputs"
      ON business_plan_outputs FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid()
          AND role = 'platform_admin'
        )
      );
  END IF;
END $$;
