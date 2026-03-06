-- =============================================================================
-- Migration: create_firebase_uid_map
-- Date:      2026-02-27
-- Purpose:   Identity Bridge — Option B (Lookup Table)
--            Maps Firebase Auth UIDs → Supabase Auth UUIDs so that
--            Mobile SlotForce users can access Socelle marketplace features
--            (Shop, Messages) without a second sign-up.
-- =============================================================================

-- ── Table ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.firebase_uid_map (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid     text        NOT NULL UNIQUE,
  supabase_uid     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_at        timestamptz NOT NULL DEFAULT now(),
  -- Optional: store the email that created the link for audit/debugging
  linked_email     text
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_firebase_uid_map_firebase ON public.firebase_uid_map(firebase_uid);
CREATE INDEX idx_firebase_uid_map_supabase ON public.firebase_uid_map(supabase_uid);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.firebase_uid_map ENABLE ROW LEVEL SECURITY;

-- Users may only read/write their own mapping row (matched by supabase_uid)
CREATE POLICY "owner_select" ON public.firebase_uid_map
  FOR SELECT USING (auth.uid() = supabase_uid);

CREATE POLICY "owner_insert" ON public.firebase_uid_map
  FOR INSERT WITH CHECK (auth.uid() = supabase_uid);

-- Only service-role can delete rows (account unlink is admin action)
-- (No DELETE policy for user role — users cannot unlink their own identity)

-- ── Subscription usage tracking ──────────────────────────────────────────────
-- Adds a monthly gap-analysis counter to user_profiles.
-- Used by the Web PaywallGate (G_max = 3 free analyses / month).
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS gap_analysis_count_month  int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gap_analysis_reset_at     timestamptz;

-- ── Helper function: increment gap analysis count ────────────────────────────
-- Called by the plan orchestrator after each successful analysis.
CREATE OR REPLACE FUNCTION public.increment_gap_analysis_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reset_at timestamptz;
BEGIN
  SELECT gap_analysis_reset_at INTO v_reset_at
  FROM public.user_profiles
  WHERE id = p_user_id;

  -- Reset counter if we've rolled into a new calendar month
  IF v_reset_at IS NULL OR date_trunc('month', v_reset_at) < date_trunc('month', now()) THEN
    UPDATE public.user_profiles
    SET gap_analysis_count_month = 1,
        gap_analysis_reset_at    = now()
    WHERE id = p_user_id;
  ELSE
    UPDATE public.user_profiles
    SET gap_analysis_count_month = gap_analysis_count_month + 1
    WHERE id = p_user_id;
  END IF;
END;
$$;
