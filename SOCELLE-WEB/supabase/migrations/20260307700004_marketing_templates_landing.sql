-- WO-OVERHAUL-15: Marketing Platform — Content Templates + Landing Pages
-- ADD ONLY migration

-- content_templates
CREATE TABLE IF NOT EXISTS content_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email','landing_page','social','ad')),
  thumbnail_url text,
  html_body text,
  is_system bool DEFAULT false,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- landing_pages
CREATE TABLE IF NOT EXISTS landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content_blocks jsonb DEFAULT '[]',
  seo_title text,
  meta_description text,
  is_published bool DEFAULT false,
  conversion_goal text,
  views int DEFAULT 0,
  conversions int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_templates_type ON content_templates(type);
CREATE INDEX IF NOT EXISTS idx_content_templates_tenant_id ON content_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_campaign_id ON landing_pages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_is_published ON landing_pages(is_published);
