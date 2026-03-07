-- W14-02: Blog/editorial stories table
-- Authority: build_tracker.md WO W14-02
-- Data label: LIVE — table + RLS (admin write, public read published)

-- ── Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text,
  hero_image_url text,
  author_name text DEFAULT 'Socelle Editorial',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category text,
  tags text[] DEFAULT '{}',
  related_signal_ids uuid[] DEFAULT '{}',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stories_slug ON public.stories (slug);
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.stories (status);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON public.stories (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_category ON public.stories (category);

-- ── Updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_stories_updated_at();

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Admin: full CRUD
CREATE POLICY stories_admin_all ON public.stories
  FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'user_role') = 'admin'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'user_role') = 'admin'
  );

-- Public: read published stories only
CREATE POLICY stories_public_read ON public.stories
  FOR SELECT
  USING (status = 'published');

-- ── Comment ────────────────────────────────────────────────────
COMMENT ON TABLE public.stories IS 'W14-02: Blog/editorial stories — admin-managed, public-readable when published';
