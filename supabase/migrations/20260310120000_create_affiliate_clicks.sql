-- =============================================================================
-- Migration: affiliate_clicks — PAY-WO-04
-- Date:      2026-03-10
-- Purpose:   Track affiliate link clicks for FTC compliance + commission audit.
--            Each click through an affiliate-tagged product link is logged here.
--            Admin readable; user can insert their own clicks.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id      uuid,
  distributor_id  uuid,
  affiliate_code  text,
  target_url      text         NOT NULL,
  -- Store IP as text (inet type causes issues with some Supabase clients)
  ip_address      text,
  user_agent      text,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affiliate_clicks_user_id_idx    ON public.affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS affiliate_clicks_created_at_idx ON public.affiliate_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_clicks_product_id_idx ON public.affiliate_clicks(product_id);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Users can log their own clicks (anon included — attribution may happen before auth)
CREATE POLICY "authenticated_insert_own_clicks"
  ON public.affiliate_clicks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can read all clicks for reporting
CREATE POLICY "admin_read_all_clicks"
  ON public.affiliate_clicks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
        AND role IN ('platform_admin', 'admin')
    )
  );

-- Service role manages everything (edge function writes)
CREATE POLICY "service_role_manages_clicks"
  ON public.affiliate_clicks
  FOR ALL
  USING (auth.role() = 'service_role');
