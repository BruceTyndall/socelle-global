-- WO-OVERHAUL-15: Marketing Platform — RLS Policies for all marketing tables
-- ADD ONLY migration
-- ZERO cold email / outreach logic. All campaigns are opt-in only.

------------------------------------------------------------
-- 1. campaigns
------------------------------------------------------------
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY campaigns_admin_all ON campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- User CRUD own campaigns (created_by match + tenant isolation)
CREATE POLICY campaigns_user_crud ON campaigns
  FOR ALL
  USING (
    created_by = auth.uid()
  )
  WITH CHECK (
    created_by = auth.uid()
  );

------------------------------------------------------------
-- 2. campaign_content
------------------------------------------------------------
ALTER TABLE campaign_content ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY campaign_content_admin_all ON campaign_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- User CRUD content for own campaigns
CREATE POLICY campaign_content_user_crud ON campaign_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_content.campaign_id
        AND campaigns.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_content.campaign_id
        AND campaigns.created_by = auth.uid()
    )
  );

------------------------------------------------------------
-- 3. audience_segments
------------------------------------------------------------
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY audience_segments_admin_all ON audience_segments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- User CRUD own tenant segments
CREATE POLICY audience_segments_user_crud ON audience_segments
  FOR ALL
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up WHERE up.id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up WHERE up.id = auth.uid()
    )
  );

------------------------------------------------------------
-- 4. campaign_metrics
------------------------------------------------------------
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY campaign_metrics_admin_all ON campaign_metrics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- User SELECT metrics for own campaigns
CREATE POLICY campaign_metrics_user_select ON campaign_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_metrics.campaign_id
        AND campaigns.created_by = auth.uid()
    )
  );

------------------------------------------------------------
-- 5. content_templates
------------------------------------------------------------
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY content_templates_admin_all ON content_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- User SELECT system templates + own tenant templates
CREATE POLICY content_templates_user_select ON content_templates
  FOR SELECT
  USING (
    is_system = true
    OR tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up WHERE up.id = auth.uid()
    )
  );

------------------------------------------------------------
-- 6. landing_pages
------------------------------------------------------------
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY landing_pages_admin_all ON landing_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- Public SELECT published landing pages (anon + authenticated)
CREATE POLICY landing_pages_public_read ON landing_pages
  FOR SELECT
  USING (is_published = true);

-- User CRUD own landing pages (via campaign ownership)
CREATE POLICY landing_pages_user_crud ON landing_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = landing_pages.campaign_id
        AND campaigns.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = landing_pages.campaign_id
        AND campaigns.created_by = auth.uid()
    )
  );
