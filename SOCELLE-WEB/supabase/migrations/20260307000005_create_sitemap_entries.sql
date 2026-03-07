-- Migration: create sitemap_entries table
-- Phase 2 Backend Schema Foundation

CREATE TABLE IF NOT EXISTS public.sitemap_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loc text UNIQUE NOT NULL,
  changefreq text DEFAULT 'weekly' CHECK (changefreq IN ('always','hourly','daily','weekly','monthly','yearly','never')),
  priority numeric(2,1) DEFAULT 0.5 CHECK (priority >= 0 AND priority <= 1),
  lastmod timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  source text DEFAULT 'manual' CHECK (source IN ('manual','auto','cms','blog')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sitemap_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active entries" ON public.sitemap_entries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sitemap" ON public.sitemap_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );
