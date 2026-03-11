-- Migration for CMS-WO-10: Create content_placements table

CREATE TABLE IF NOT EXISTS content_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_key TEXT NOT NULL,  -- e.g. 'intel_hub_editorial_rail', 'home_featured', 'category_medspa_hero'
  cms_post_id UUID REFERENCES cms_posts(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,        -- NULL = no expiry
  segment TEXT[],                -- NULL = all users; ['medspa'] = medspa users only
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(placement_key, cms_post_id)
);

-- Enable RLS
ALTER TABLE content_placements ENABLE ROW LEVEL SECURITY;

-- Admins get full CRUD access
CREATE POLICY "Admins can manage content_placements" ON content_placements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'platform_admin'
    )
  );

-- Authenticated users can read active, unexpired placements
CREATE POLICY "Authenticated users can read active content_placements" ON content_placements
  FOR SELECT
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND auth.role() = 'authenticated'
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_placements_key ON content_placements(placement_key);
CREATE INDEX IF NOT EXISTS idx_content_placements_active ON content_placements(is_active) WHERE is_active = true;
