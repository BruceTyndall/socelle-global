-- ── CTRL-WO-01: Feature Flag System ──────────────────────────────────────────
-- Authority: docs/operations/OPERATION_BREAKOUT.md → CTRL-WO-01
-- Creates feature_flags table with RLS for admin write / authenticated read.

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text DEFAULT '',
  default_enabled boolean DEFAULT false,
  enabled_tiers text[] DEFAULT '{}',
  enabled_user_ids uuid[] DEFAULT '{}',
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: only admins can write, authenticated can read
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read flags"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      JOIN public.user_profiles p ON p.id = u.id
      WHERE u.id = auth.uid() AND p.role IN ('admin', 'platform_admin')
    )
  );
