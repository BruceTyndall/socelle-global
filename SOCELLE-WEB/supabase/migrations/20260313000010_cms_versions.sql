-- AUTH-CORE-01: cms_versions table
-- Tracks draft/published/archived history for blocks, pages, and posts.
-- Enables VersionHistory.tsx timeline and one-click restore.

CREATE TABLE IF NOT EXISTS cms_versions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     TEXT        NOT NULL CHECK (entity_type IN ('block', 'page', 'post')),
  entity_id       UUID        NOT NULL,
  version_number  INTEGER     NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  content         JSONB       NOT NULL DEFAULT '{}',
  created_by      UUID        REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  UNIQUE(entity_id, version_number)
);

CREATE INDEX IF NOT EXISTS cms_versions_entity_idx
  ON cms_versions (entity_id, version_number DESC);

ALTER TABLE cms_versions ENABLE ROW LEVEL SECURITY;

-- Platform admins have full access
CREATE POLICY "cms_versions_admin_all"
  ON cms_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'platform_admin')
    )
  );

-- Authenticated users may read published versions
CREATE POLICY "cms_versions_auth_read_published"
  ON cms_versions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'published'
  );
