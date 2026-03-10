-- AUTH-CORE-02: block_data_bindings table
-- Maps {{variable_name}} placeholders in block content to live data sources.
-- Consumed by DataBindingEngine.ts for variable substitution at render time.

CREATE TABLE IF NOT EXISTS block_data_bindings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id      UUID        REFERENCES cms_blocks(id) ON DELETE CASCADE,
  variable_name TEXT        NOT NULL,
  data_source   TEXT        NOT NULL CHECK (data_source IN ('market_signals', 'data_feeds', 'user_profiles', 'custom')),
  field_path    TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS block_data_bindings_block_idx
  ON block_data_bindings (block_id);

ALTER TABLE block_data_bindings ENABLE ROW LEVEL SECURITY;

-- Platform admins have full access
CREATE POLICY "block_data_bindings_admin_all"
  ON block_data_bindings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'platform_admin')
    )
  );
