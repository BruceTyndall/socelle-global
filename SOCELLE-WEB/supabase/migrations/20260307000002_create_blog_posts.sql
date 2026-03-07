-- Migration: create blog_posts table
-- Phase 2 Backend Schema Foundation

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  cover_image text,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text,
  tags text[] DEFAULT '{}',
  author_id uuid REFERENCES auth.users(id),
  author_name text,
  author_avatar text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  seo_title text,
  seo_description text,
  og_image text
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
