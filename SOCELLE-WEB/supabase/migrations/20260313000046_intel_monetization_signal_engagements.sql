-- INTEL-MONETIZATION-01
-- Anonymous-to-authenticated signal memory: saves, likes, and batched
-- preference syncing for profile-ready Intelligence personalization.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.user_signal_engagements (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_id uuid NOT NULL REFERENCES public.market_signals(id) ON DELETE CASCADE,
  is_saved boolean NOT NULL DEFAULT false,
  is_liked boolean NOT NULL DEFAULT false,
  saved_at timestamptz DEFAULT NULL,
  liked_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, signal_id),
  CONSTRAINT user_signal_engagements_has_state CHECK (is_saved OR is_liked)
);

COMMENT ON TABLE public.user_signal_engagements IS
  'Per-user saved and liked Intelligence signals for profile libraries and personalized feed ranking.';

CREATE INDEX IF NOT EXISTS idx_user_signal_engagements_saved
  ON public.user_signal_engagements (user_id, is_saved, saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_signal_engagements_liked
  ON public.user_signal_engagements (user_id, is_liked, liked_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_user_signal_engagements_updated_at'
  ) THEN
    CREATE TRIGGER set_user_signal_engagements_updated_at
      BEFORE UPDATE ON public.user_signal_engagements
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

ALTER TABLE public.user_signal_engagements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_signal_engagements'
      AND policyname = 'Users can read own signal engagements'
  ) THEN
    CREATE POLICY "Users can read own signal engagements"
      ON public.user_signal_engagements
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
      AND tablename = 'user_signal_engagements'
      AND policyname = 'Users can insert own signal engagements'
  ) THEN
    CREATE POLICY "Users can insert own signal engagements"
      ON public.user_signal_engagements
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
      AND tablename = 'user_signal_engagements'
      AND policyname = 'Users can update own signal engagements'
  ) THEN
    CREATE POLICY "Users can update own signal engagements"
      ON public.user_signal_engagements
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
      AND tablename = 'user_signal_engagements'
      AND policyname = 'Users can delete own signal engagements'
  ) THEN
    CREATE POLICY "Users can delete own signal engagements"
      ON public.user_signal_engagements
      FOR DELETE
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
      AND tablename = 'user_signal_engagements'
      AND policyname = 'Service role manages signal engagements'
  ) THEN
    CREATE POLICY "Service role manages signal engagements"
      ON public.user_signal_engagements
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.merge_user_tag_preference_scores(
  p_user_id uuid,
  p_scores jsonb,
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
  IF p_user_id IS NULL OR p_scores IS NULL OR jsonb_typeof(p_scores) <> 'object' THEN
    RETURN 0;
  END IF;

  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Not authorized to merge tag preferences';
  END IF;

  IF p_source NOT IN ('onboarding', 'behavior', 'manual') THEN
    RAISE EXCEPTION 'Invalid preference source: %', p_source;
  END IF;

  WITH incoming AS (
    SELECT
      key::text AS tag_code,
      GREATEST(-25, LEAST(100, value::double precision)) AS delta
    FROM jsonb_each_text(p_scores)
  ),
  valid_tags AS (
    SELECT
      incoming.tag_code,
      incoming.delta
    FROM incoming
    JOIN public.taxonomy_tags AS t
      ON t.tag_code = incoming.tag_code
    WHERE t.is_active = true
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
    valid_tags.delta,
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

GRANT EXECUTE ON FUNCTION public.merge_user_tag_preference_scores(
  uuid,
  jsonb,
  text,
  timestamptz
) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.merge_user_signal_engagements(
  p_user_id uuid,
  p_engagements jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row_count integer := 0;
BEGIN
  IF p_user_id IS NULL OR p_engagements IS NULL OR jsonb_typeof(p_engagements) <> 'array' THEN
    RETURN 0;
  END IF;

  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Not authorized to merge signal engagements';
  END IF;

  WITH incoming AS (
    SELECT
      p_user_id AS user_id,
      NULLIF(item ->> 'signal_id', '')::uuid AS signal_id,
      COALESCE((item ->> 'is_saved')::boolean, false) AS is_saved,
      COALESCE((item ->> 'is_liked')::boolean, false) AS is_liked,
      NULLIF(item ->> 'saved_at', '')::timestamptz AS saved_at,
      NULLIF(item ->> 'liked_at', '')::timestamptz AS liked_at
    FROM jsonb_array_elements(p_engagements) AS item
  ),
  filtered AS (
    SELECT *
    FROM incoming
    WHERE signal_id IS NOT NULL
      AND (is_saved OR is_liked)
  )
  INSERT INTO public.user_signal_engagements (
    user_id,
    signal_id,
    is_saved,
    is_liked,
    saved_at,
    liked_at
  )
  SELECT
    filtered.user_id,
    filtered.signal_id,
    filtered.is_saved,
    filtered.is_liked,
    COALESCE(filtered.saved_at, CASE WHEN filtered.is_saved THEN now() ELSE NULL END),
    COALESCE(filtered.liked_at, CASE WHEN filtered.is_liked THEN now() ELSE NULL END)
  FROM filtered
  ON CONFLICT (user_id, signal_id) DO UPDATE
  SET
    is_saved = public.user_signal_engagements.is_saved OR EXCLUDED.is_saved,
    is_liked = public.user_signal_engagements.is_liked OR EXCLUDED.is_liked,
    saved_at = CASE
      WHEN public.user_signal_engagements.saved_at IS NULL THEN EXCLUDED.saved_at
      WHEN EXCLUDED.saved_at IS NULL THEN public.user_signal_engagements.saved_at
      ELSE LEAST(public.user_signal_engagements.saved_at, EXCLUDED.saved_at)
    END,
    liked_at = CASE
      WHEN public.user_signal_engagements.liked_at IS NULL THEN EXCLUDED.liked_at
      WHEN EXCLUDED.liked_at IS NULL THEN public.user_signal_engagements.liked_at
      ELSE LEAST(public.user_signal_engagements.liked_at, EXCLUDED.liked_at)
    END,
    updated_at = now();

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  RETURN v_row_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.merge_user_signal_engagements(
  uuid,
  jsonb
) TO authenticated, service_role;
