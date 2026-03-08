-- WO-CMS-01: CMS Schema & RLS
-- Creates all 8 cms_* tables per CMS_ARCHITECTURE.md
-- Add-only migration — never modify existing tables

-- ============================================================
-- 1. cms_spaces
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 2. cms_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  block_schema JSONB NOT NULL DEFAULT '[]',
  seo_defaults JSONB DEFAULT '{}',
  preview_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 3. cms_pages
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES cms_spaces(id) ON DELETE CASCADE,
  template_id UUID REFERENCES cms_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seo_title TEXT,
  seo_description TEXT,
  seo_og_image TEXT,
  seo_canonical TEXT,
  seo_schema_type TEXT DEFAULT 'WebPage',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (space_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages (status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_cms_pages_space_status ON cms_pages (space_id, status);

-- ============================================================
-- 4. cms_blocks
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  is_reusable BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_blocks_type ON cms_blocks (type);
CREATE INDEX IF NOT EXISTS idx_cms_blocks_reusable ON cms_blocks (is_reusable) WHERE is_reusable = true;

-- ============================================================
-- 5. cms_page_blocks (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  block_id UUID NOT NULL REFERENCES cms_blocks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  overrides JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (page_id, position)
);

CREATE INDEX IF NOT EXISTS idx_cms_page_blocks_page ON cms_page_blocks (page_id);

-- ============================================================
-- 6. cms_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES cms_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  hero_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  reading_time INTEGER,
  featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  seo_og_image TEXT,
  seo_canonical TEXT,
  source_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (space_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cms_posts_status ON cms_posts (status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_cms_posts_category ON cms_posts (category);
CREATE INDEX IF NOT EXISTS idx_cms_posts_featured ON cms_posts (featured) WHERE featured = true;

-- ============================================================
-- 7. cms_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_assets_mime ON cms_assets (mime_type);

-- ============================================================
-- 8. cms_docs
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES cms_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  body TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (space_id, slug)
);

-- ============================================================
-- updated_at trigger function (reusable)
-- ============================================================
CREATE OR REPLACE FUNCTION cms_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all cms_* tables that have updated_at
CREATE TRIGGER trg_cms_spaces_updated_at
  BEFORE UPDATE ON cms_spaces
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

CREATE TRIGGER trg_cms_templates_updated_at
  BEFORE UPDATE ON cms_templates
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

CREATE TRIGGER trg_cms_pages_updated_at
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

CREATE TRIGGER trg_cms_blocks_updated_at
  BEFORE UPDATE ON cms_blocks
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

CREATE TRIGGER trg_cms_posts_updated_at
  BEFORE UPDATE ON cms_posts
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

CREATE TRIGGER trg_cms_docs_updated_at
  BEFORE UPDATE ON cms_docs
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

-- ============================================================
-- RLS: Enable on all tables
-- ============================================================
ALTER TABLE cms_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_docs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Helper: check if current user is admin
-- Uses user_profiles table role column (admin, platform_admin)

-- ---- cms_spaces ----
-- Admin: full access
CREATE POLICY "cms_spaces_admin_all" ON cms_spaces
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Public: read all (spaces are metadata)
CREATE POLICY "cms_spaces_public_read" ON cms_spaces
  FOR SELECT TO anon, authenticated
  USING (true);

-- ---- cms_templates ----
-- Admin only: full access
CREATE POLICY "cms_templates_admin_all" ON cms_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- No public access to templates

-- ---- cms_pages ----
-- Admin: full access
CREATE POLICY "cms_pages_admin_all" ON cms_pages
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Public: read published only
CREATE POLICY "cms_pages_public_read_published" ON cms_pages
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- ---- cms_blocks ----
-- Admin: full access
CREATE POLICY "cms_blocks_admin_all" ON cms_blocks
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Public: read blocks that belong to published pages (via junction)
CREATE POLICY "cms_blocks_public_read" ON cms_blocks
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_page_blocks pb
      JOIN cms_pages p ON p.id = pb.page_id
      WHERE pb.block_id = cms_blocks.id
        AND p.status = 'published'
    )
  );

-- ---- cms_page_blocks ----
-- Admin: full access
CREATE POLICY "cms_page_blocks_admin_all" ON cms_page_blocks
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Public: read where page is published
CREATE POLICY "cms_page_blocks_public_read" ON cms_page_blocks
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_pages
      WHERE cms_pages.id = cms_page_blocks.page_id
        AND cms_pages.status = 'published'
    )
  );

-- ---- cms_posts ----
-- Admin: full access
CREATE POLICY "cms_posts_admin_all" ON cms_posts
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Public: read published only
CREATE POLICY "cms_posts_public_read_published" ON cms_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- ---- cms_assets ----
-- Admin: full access
CREATE POLICY "cms_assets_admin_all" ON cms_assets
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Public: read all assets
CREATE POLICY "cms_assets_public_read" ON cms_assets
  FOR SELECT TO anon, authenticated
  USING (true);

-- ---- cms_docs ----
-- Admin: full access
CREATE POLICY "cms_docs_admin_all" ON cms_docs
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Authenticated: read published docs (not anon)
CREATE POLICY "cms_docs_authenticated_read_published" ON cms_docs
  FOR SELECT TO authenticated
  USING (status = 'published');

-- ============================================================
-- Seed default spaces
-- ============================================================
INSERT INTO cms_spaces (name, slug, description) VALUES
  ('Blog', 'blog', 'Public blog and stories'),
  ('Intelligence', 'intelligence', 'Intelligence briefs and reports'),
  ('Education', 'education', 'Education articles and course content'),
  ('Marketing', 'marketing', 'Marketing campaign content and landing pages'),
  ('Sales', 'sales', 'Sales playbooks, case studies, and scripts'),
  ('Commerce', 'commerce', 'Commerce landing pages and buying guides'),
  ('Jobs', 'jobs', 'Career guides and job market content'),
  ('CRM', 'crm', 'CRM onboarding and help content'),
  ('Help', 'help', 'Help articles and documentation'),
  ('General', 'general', 'General site pages')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed default templates
-- ============================================================
INSERT INTO cms_templates (name, slug, description, block_schema, seo_defaults) VALUES
  ('Landing Page', 'landing-page', 'Full-width landing page with hero, features, and CTA',
   '[{"type":"hero","required":true},{"type":"text","required":false},{"type":"split_feature","required":false},{"type":"stats","required":false},{"type":"testimonial","required":false},{"type":"cta","required":true}]'::jsonb,
   '{"schema_type":"WebPage"}'::jsonb),
  ('Article', 'article', 'Long-form article with hero image and body text',
   '[{"type":"hero","required":true},{"type":"text","required":true},{"type":"image","required":false},{"type":"cta","required":false}]'::jsonb,
   '{"schema_type":"Article"}'::jsonb),
  ('Hub Index', 'hub-index', 'Hub landing page with category grid and featured items',
   '[{"type":"hero","required":true},{"type":"stats","required":false},{"type":"evidence_strip","required":false},{"type":"cta","required":true}]'::jsonb,
   '{"schema_type":"CollectionPage"}'::jsonb),
  ('FAQ Page', 'faq-page', 'Frequently asked questions layout',
   '[{"type":"hero","required":true},{"type":"faq","required":true},{"type":"cta","required":false}]'::jsonb,
   '{"schema_type":"FAQPage"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;
