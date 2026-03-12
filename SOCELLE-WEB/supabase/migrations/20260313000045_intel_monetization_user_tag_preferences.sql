-- INTEL-MONETIZATION-01
-- Durable preference graph foundation for onboarding + behavior-driven
-- Intelligence personalization.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_vertical text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_plan text DEFAULT NULL;

COMMENT ON COLUMN public.user_profiles.onboarding_vertical IS
  'Selected onboarding vertical used to seed Intelligence preferences.';

COMMENT ON COLUMN public.user_profiles.onboarding_plan IS
  'Selected onboarding plan slug used for personalization and conversion analysis.';

CREATE TABLE IF NOT EXISTS public.user_tag_preferences (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_code text NOT NULL REFERENCES public.taxonomy_tags(tag_code) ON DELETE CASCADE,
  score double precision NOT NULL DEFAULT 0,
  event_count integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'behavior'
    CHECK (source IN ('onboarding', 'behavior', 'manual')),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_event_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tag_code)
);

COMMENT ON TABLE public.user_tag_preferences IS
  'User-specific tag affinity scores that drive personalized Intelligence ranking.';

CREATE INDEX IF NOT EXISTS idx_user_tag_preferences_user_score
  ON public.user_tag_preferences (user_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_user_tag_preferences_tag_code
  ON public.user_tag_preferences (tag_code);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_user_tag_preferences_updated_at'
  ) THEN
    CREATE TRIGGER set_user_tag_preferences_updated_at
      BEFORE UPDATE ON public.user_tag_preferences
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

ALTER TABLE public.user_tag_preferences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_tag_preferences'
      AND policyname = 'Users can read own tag preferences'
  ) THEN
    CREATE POLICY "Users can read own tag preferences"
      ON public.user_tag_preferences
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_tag_preferences'
      AND policyname = 'Users can insert own tag preferences'
  ) THEN
    CREATE POLICY "Users can insert own tag preferences"
      ON public.user_tag_preferences
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_tag_preferences'
      AND policyname = 'Users can update own tag preferences'
  ) THEN
    CREATE POLICY "Users can update own tag preferences"
      ON public.user_tag_preferences
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_tag_preferences'
      AND policyname = 'Service role manages user tag preferences'
  ) THEN
    CREATE POLICY "Service role manages user tag preferences"
      ON public.user_tag_preferences
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_user_tag_preference_delta(
  p_user_id uuid,
  p_tag_codes text[],
  p_delta double precision,
  p_source text DEFAULT 'behavior',
  p_event_at timestamptz DEFAULT now()
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row_count integer := 0;
BEGIN
  IF p_user_id IS NULL OR COALESCE(array_length(p_tag_codes, 1), 0) = 0 THEN
    RETURN 0;
  END IF;

  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Not authorized to update tag preferences';
  END IF;

  IF p_source NOT IN ('onboarding', 'behavior', 'manual') THEN
    RAISE EXCEPTION 'Invalid preference source: %', p_source;
  END IF;

  WITH valid_tags AS (
    SELECT DISTINCT t.tag_code
    FROM public.taxonomy_tags AS t
    WHERE t.is_active = true
      AND t.tag_code = ANY (p_tag_codes)
  )
  INSERT INTO public.user_tag_preferences (
    user_id,
    tag_code,
    score,
    event_count,
    source,
    first_seen_at,
    last_event_at
  )
  SELECT
    p_user_id,
    valid_tags.tag_code,
    GREATEST(-25, LEAST(100, p_delta)),
    CASE WHEN p_source = 'behavior' THEN 1 ELSE 0 END,
    p_source,
    COALESCE(p_event_at, now()),
    COALESCE(p_event_at, now())
  FROM valid_tags
  ON CONFLICT (user_id, tag_code) DO UPDATE
  SET
    score = GREATEST(
      -25,
      LEAST(100, public.user_tag_preferences.score + EXCLUDED.score)
    ),
    event_count = public.user_tag_preferences.event_count
      + CASE WHEN p_source = 'behavior' THEN 1 ELSE 0 END,
    source = CASE
      WHEN p_source = 'manual' THEN 'manual'
      WHEN public.user_tag_preferences.source = 'manual' THEN public.user_tag_preferences.source
      ELSE p_source
    END,
    last_event_at = GREATEST(
      public.user_tag_preferences.last_event_at,
      EXCLUDED.last_event_at
    ),
    updated_at = now();

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  RETURN v_row_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_user_tag_preference_delta(
  uuid,
  text[],
  double precision,
  text,
  timestamptz
) TO authenticated, service_role;
