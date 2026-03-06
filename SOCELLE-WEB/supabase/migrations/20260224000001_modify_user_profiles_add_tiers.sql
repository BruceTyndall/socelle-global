/*
  # Add Reseller and Brand Tier Columns to user_profiles

  These two columns are the prerequisite for everything in Phase 1.
  Every feature gate, tiered price lookup, and access control decision
  in the commerce layer reads from these columns.

  Changes:
    - reseller_tier (text, nullable) — 'active' | 'elite' | 'master'
      NULL = this user is not a reseller / tier not yet assigned
    - brand_tier (text, nullable) — 'emerging' | 'pro' | 'premium'
      NULL = this user is not a brand / tier not yet assigned

  Both default to NULL so all existing user records are unaffected.
  Text (not enum) so new tiers can be added without ALTER TYPE migrations.
  CHECK constraints enforce valid values.
*/

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS reseller_tier text DEFAULT NULL
    CONSTRAINT user_profiles_reseller_tier_check
    CHECK (reseller_tier IN ('active', 'elite', 'master')),

  ADD COLUMN IF NOT EXISTS brand_tier text DEFAULT NULL
    CONSTRAINT user_profiles_brand_tier_check
    CHECK (brand_tier IN ('emerging', 'pro', 'premium'));

-- Partial indexes: most users have NULL here, so index only the non-null rows
CREATE INDEX IF NOT EXISTS idx_user_profiles_reseller_tier
  ON user_profiles (reseller_tier)
  WHERE reseller_tier IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_brand_tier
  ON user_profiles (brand_tier)
  WHERE brand_tier IS NOT NULL;

-- Comments
COMMENT ON COLUMN user_profiles.reseller_tier IS
  'Commerce tier for reseller accounts. NULL = not a reseller or tier unassigned. '
  'Drives: product pricing tier, min order thresholds, exclusive product access. '
  'Set by platform admin or automated tier promotion rules.';

COMMENT ON COLUMN user_profiles.brand_tier IS
  'Brand classification tier. NULL = not a brand account. '
  'Drives: commission rate, search placement, analytics depth. '
  'Set by platform admin on brand onboarding.';
