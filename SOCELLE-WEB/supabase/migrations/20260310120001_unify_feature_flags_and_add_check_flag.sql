-- CTRL-WO-01: Feature Flags schema unification + check_flag RPC
-- Authority: docs/operations/OPERATION_BREAKOUT.md
-- Purpose:
--   1) Normalize drifted feature_flags schemas from earlier migrations.
--   2) Preserve backward compatibility with legacy columns (key/name/is_enabled/etc).
--   3) Add check_flag(user, flag_key, tier) for edge-function server-side gating.

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── Canonical columns (new model) ───────────────────────────────────────────
ALTER TABLE public.feature_flags
  ADD COLUMN IF NOT EXISTS flag_key text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS default_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS enabled_tiers text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS enabled_user_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100);

-- ── Legacy compatibility columns (keep, do not drop) ───────────────────────
ALTER TABLE public.feature_flags
  ADD COLUMN IF NOT EXISTS key text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS is_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS required_plan text,
  ADD COLUMN IF NOT EXISTS required_addon text,
  ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS rollout_pct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conditions jsonb DEFAULT '{}'::jsonb;

-- ── Backfill both directions for compatibility ──────────────────────────────
UPDATE public.feature_flags
SET flag_key = key
WHERE flag_key IS NULL AND key IS NOT NULL;

UPDATE public.feature_flags
SET key = flag_key
WHERE key IS NULL AND flag_key IS NOT NULL;

UPDATE public.feature_flags
SET display_name = COALESCE(display_name, name, flag_key, key)
WHERE display_name IS NULL;

UPDATE public.feature_flags
SET name = COALESCE(name, display_name, flag_key, key)
WHERE name IS NULL;

UPDATE public.feature_flags
SET default_enabled = COALESCE(default_enabled, is_enabled, enabled, false);

UPDATE public.feature_flags
SET is_enabled = COALESCE(is_enabled, default_enabled, enabled, false);

UPDATE public.feature_flags
SET enabled = COALESCE(enabled, default_enabled, is_enabled, false);

UPDATE public.feature_flags
SET rollout_percentage = COALESCE(rollout_percentage, rollout_pct, 0);

UPDATE public.feature_flags
SET rollout_pct = COALESCE(rollout_pct, rollout_percentage, 0);

UPDATE public.feature_flags
SET enabled_tiers = COALESCE(enabled_tiers, '{}'::text[]),
    enabled_user_ids = COALESCE(enabled_user_ids, '{}'::uuid[]),
    conditions = COALESCE(conditions, '{}'::jsonb),
    description = COALESCE(description, ''),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now());

-- If legacy rows still lack a key, derive one from display_name.
UPDATE public.feature_flags
SET flag_key = upper(regexp_replace(display_name, '[^A-Za-z0-9]+', '_', 'g'))
WHERE flag_key IS NULL AND display_name IS NOT NULL;

UPDATE public.feature_flags
SET key = flag_key
WHERE key IS NULL AND flag_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_flags_flag_key
  ON public.feature_flags(flag_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_flags_key_compat
  ON public.feature_flags(key);

-- ── RLS hardening (idempotent) ──────────────────────────────────────────────
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feature_flags'
      AND policyname = 'feature_flags_select_authenticated_v2'
  ) THEN
    CREATE POLICY feature_flags_select_authenticated_v2
      ON public.feature_flags
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feature_flags'
      AND policyname = 'feature_flags_manage_admin_v2'
  ) THEN
    CREATE POLICY feature_flags_manage_admin_v2
      ON public.feature_flags
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'platform_admin', 'super_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.user_profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'platform_admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- ── check_flag RPC (edge function usage) ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_flag(
  p_user_id uuid,
  p_flag_key text,
  p_user_tier text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_default_enabled boolean;
  v_enabled_tiers text[];
  v_enabled_user_ids uuid[];
  v_rollout_percentage integer;
  v_tier text;
  v_bucket integer;
BEGIN
  SELECT
    COALESCE(default_enabled, is_enabled, enabled, false),
    COALESCE(enabled_tiers, '{}'::text[]),
    COALESCE(enabled_user_ids, '{}'::uuid[]),
    COALESCE(rollout_percentage, rollout_pct, 0)
  INTO
    v_default_enabled,
    v_enabled_tiers,
    v_enabled_user_ids,
    v_rollout_percentage
  FROM public.feature_flags
  WHERE COALESCE(flag_key, key) = p_flag_key
  LIMIT 1;

  -- Unknown flag = allow (legacy-compatible fail-open).
  IF NOT FOUND THEN
    RETURN true;
  END IF;

  -- 1) User override
  IF p_user_id IS NOT NULL AND p_user_id = ANY(v_enabled_user_ids) THEN
    RETURN true;
  END IF;

  -- 2) Tier allow-list
  v_tier := lower(COALESCE(p_user_tier, ''));
  IF array_length(v_enabled_tiers, 1) IS NOT NULL AND v_tier <> '' AND v_tier = ANY(v_enabled_tiers) THEN
    RETURN true;
  END IF;

  -- 3) Rollout %
  IF p_user_id IS NOT NULL AND v_rollout_percentage > 0 THEN
    v_bucket := abs((('x' || substr(md5(p_user_id::text), 1, 8))::bit(32)::int)) % 100;
    IF v_bucket < v_rollout_percentage THEN
      RETURN true;
    END IF;
  END IF;

  -- 4) Default
  RETURN v_default_enabled;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_flag(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_flag(uuid, text, text) TO service_role;

-- Seed an edge-level master toggle used by ai-orchestrator.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.feature_flags WHERE COALESCE(flag_key, key) = 'AI_ORCHESTRATOR_ENABLED'
  ) THEN
    UPDATE public.feature_flags
    SET
      flag_key = 'AI_ORCHESTRATOR_ENABLED',
      key = 'AI_ORCHESTRATOR_ENABLED',
      display_name = COALESCE(display_name, 'AI Orchestrator Enabled'),
      name = COALESCE(name, 'AI Orchestrator Enabled'),
      description = COALESCE(description, 'Master feature toggle for ai-orchestrator edge function'),
      default_enabled = COALESCE(default_enabled, true),
      is_enabled = COALESCE(is_enabled, true),
      enabled = COALESCE(enabled, true),
      rollout_percentage = COALESCE(rollout_percentage, 100),
      rollout_pct = COALESCE(rollout_pct, 100),
      updated_at = now()
    WHERE COALESCE(flag_key, key) = 'AI_ORCHESTRATOR_ENABLED';
  ELSE
    INSERT INTO public.feature_flags (
      flag_key, key, display_name, name, description,
      default_enabled, is_enabled, enabled,
      enabled_tiers, enabled_user_ids,
      rollout_percentage, rollout_pct,
      created_at, updated_at
    ) VALUES (
      'AI_ORCHESTRATOR_ENABLED',
      'AI_ORCHESTRATOR_ENABLED',
      'AI Orchestrator Enabled',
      'AI Orchestrator Enabled',
      'Master feature toggle for ai-orchestrator edge function',
      true, true, true,
      '{}'::text[], '{}'::uuid[],
      100, 100,
      now(), now()
    );
  END IF;
END $$;
