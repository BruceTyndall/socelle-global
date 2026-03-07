-- Migration: create media_library table
-- Phase 2 Backend Schema Foundation

CREATE TABLE IF NOT EXISTS public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  storage_path text NOT NULL,
  public_url text,
  alt_text text,
  caption text,
  folder text DEFAULT 'uploads',
  tags text[] DEFAULT '{}',
  width integer,
  height integer,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view media" ON public.media_library
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage media" ON public.media_library
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );
