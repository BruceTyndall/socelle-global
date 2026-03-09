-- ai_rate_limits — Sliding-window rate limiting for ai-orchestrator
-- ADD ONLY — never edit existing migrations
--
-- Rate limits per subscription tier (owner decision #7):
--   Starter:    5/min, 5 burst
--   Pro:       15/min, 10 burst
--   Enterprise: 60/min, 30 burst
--
-- Design: One row per user. Each request UPDATEs the row with a sliding
-- window check. The edge function reads window_start + request_count
-- and decides whether to allow or reject (429).

CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  request_count INT NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by user_id (PK already covers this)
-- Additional index on window_start for potential cleanup queries
CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_window
  ON public.ai_rate_limits (window_start);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_ai_rate_limits_updated_at'
  ) THEN
    CREATE TRIGGER set_ai_rate_limits_updated_at
      BEFORE UPDATE ON public.ai_rate_limits
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can read their own rate limit status
CREATE POLICY "Users can read own rate limit"
  ON public.ai_rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete (edge function uses service role key)
CREATE POLICY "Service role manages rate limits"
  ON public.ai_rate_limits
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── check_rate_limit RPC ─────────────────────────────────────────────────────
-- Called by ai-orchestrator BEFORE deduct_credits.
-- Returns: { allowed: bool, current_count: int, limit: int, resets_at: timestamptz }
--
-- Sliding window: if window_start is older than 60 seconds, reset the window.
-- Otherwise increment request_count and compare against tier limit.

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_tier_limit INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row ai_rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ := now();
  v_window_end TIMESTAMPTZ;
  v_new_count INT;
BEGIN
  -- Upsert: create row if user has never made an AI request
  INSERT INTO ai_rate_limits (user_id, request_count, window_start)
  VALUES (p_user_id, 0, v_now)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock the row for this user
  SELECT * INTO v_row
  FROM ai_rate_limits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If window has expired (>60s old), reset it
  IF v_row.window_start + INTERVAL '60 seconds' <= v_now THEN
    UPDATE ai_rate_limits
    SET request_count = 1, window_start = v_now
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'allowed', true,
      'current_count', 1,
      'limit', p_tier_limit,
      'resets_at', v_now + INTERVAL '60 seconds'
    );
  END IF;

  -- Window is still active — check if adding one more exceeds limit
  v_new_count := v_row.request_count + 1;
  v_window_end := v_row.window_start + INTERVAL '60 seconds';

  IF v_new_count > p_tier_limit THEN
    -- Rate limit exceeded — do NOT increment
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', v_row.request_count,
      'limit', p_tier_limit,
      'resets_at', v_window_end
    );
  END IF;

  -- Allowed — increment count
  UPDATE ai_rate_limits
  SET request_count = v_new_count
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', v_new_count,
    'limit', p_tier_limit,
    'resets_at', v_window_end
  );
END;
$$;
