/*
  V2-PLAT-04: Add onboarding columns to user_profiles

  Stores the role and interests selected during the onboarding flow
  so they can drive feed personalization and Intelligence Hub defaults.

  - onboarding_role: operator | provider | brand | student (nullable)
  - onboarding_interests: text[] of interest keys (nullable, default empty)
  - onboarding_completed_at: timestamptz (nullable, set when flow finishes)
*/

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_role text DEFAULT NULL
    CONSTRAINT user_profiles_onboarding_role_check
    CHECK (onboarding_role IN ('operator', 'provider', 'brand', 'student')),

  ADD COLUMN IF NOT EXISTS onboarding_interests text[] DEFAULT '{}',

  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN user_profiles.onboarding_role IS
  'Role selected during post-signup onboarding flow (V2-PLAT-04). '
  'Values: operator, provider, brand, student. NULL = onboarding not completed.';

COMMENT ON COLUMN user_profiles.onboarding_interests IS
  'Interest tags selected during onboarding (V2-PLAT-04). '
  'Example: {market_intelligence,treatment_trends,revenue_optimization}.';

COMMENT ON COLUMN user_profiles.onboarding_completed_at IS
  'Timestamp when the user completed the onboarding flow. NULL = not completed.';
