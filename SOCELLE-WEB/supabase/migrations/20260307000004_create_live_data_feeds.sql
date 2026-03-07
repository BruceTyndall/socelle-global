-- Migration: create live_data_feeds table
-- Phase 2 Backend Schema Foundation

CREATE TABLE IF NOT EXISTS public.live_data_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('api','rss','webhook','scrape','manual')),
  source_url text,
  api_key_ref text,
  refresh_interval_minutes integer DEFAULT 60,
  last_refreshed_at timestamptz,
  last_status text DEFAULT 'pending' CHECK (last_status IN ('pending','success','error','disabled')),
  last_error text,
  data_snapshot jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.live_data_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feeds" ON public.live_data_feeds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );
