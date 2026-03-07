-- Migration: RLS policies for Sales Platform tables
-- WO: WO-OVERHAUL-14 (Sales Platform schema)

-- ============================================================
-- Enable RLS on all Sales tables
-- ============================================================
ALTER TABLE sales_pipelines   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payouts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- sales_pipelines: owner SELECT/INSERT/UPDATE; admin ALL
-- ============================================================
CREATE POLICY "sales_pipelines_select_own"
  ON sales_pipelines FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "sales_pipelines_insert_own"
  ON sales_pipelines FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "sales_pipelines_update_own"
  ON sales_pipelines FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "sales_pipelines_admin_all"
  ON sales_pipelines FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- pipeline_stages: access via parent pipeline ownership; admin ALL
-- ============================================================
CREATE POLICY "pipeline_stages_select_via_pipeline"
  ON pipeline_stages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_pipelines
      WHERE sales_pipelines.id = pipeline_stages.pipeline_id
        AND sales_pipelines.owner_id = auth.uid()
    )
  );

CREATE POLICY "pipeline_stages_insert_via_pipeline"
  ON pipeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_pipelines
      WHERE sales_pipelines.id = pipeline_id
        AND sales_pipelines.owner_id = auth.uid()
    )
  );

CREATE POLICY "pipeline_stages_update_via_pipeline"
  ON pipeline_stages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_pipelines
      WHERE sales_pipelines.id = pipeline_stages.pipeline_id
        AND sales_pipelines.owner_id = auth.uid()
    )
  );

CREATE POLICY "pipeline_stages_admin_all"
  ON pipeline_stages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- deals: owner SELECT/INSERT/UPDATE; admin ALL
-- ============================================================
CREATE POLICY "deals_select_own"
  ON deals FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "deals_insert_own"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "deals_update_own"
  ON deals FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "deals_admin_all"
  ON deals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- deal_activities: user CRUD own; admin ALL
-- ============================================================
CREATE POLICY "deal_activities_select_own"
  ON deal_activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "deal_activities_insert_own"
  ON deal_activities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "deal_activities_update_own"
  ON deal_activities FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "deal_activities_delete_own"
  ON deal_activities FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "deal_activities_admin_all"
  ON deal_activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- proposals: user CRUD via deal ownership; admin ALL; anon SELECT (sent, by id)
-- ============================================================
CREATE POLICY "proposals_select_via_deal"
  ON proposals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = proposals.deal_id
        AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "proposals_insert_via_deal"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_id
        AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "proposals_update_via_deal"
  ON proposals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = proposals.deal_id
        AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "proposals_delete_via_deal"
  ON proposals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = proposals.deal_id
        AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "proposals_admin_all"
  ON proposals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "proposals_anon_select_sent"
  ON proposals FOR SELECT
  TO anon
  USING (status = 'sent');

-- ============================================================
-- commission_rules: admin ALL only
-- ============================================================
CREATE POLICY "commission_rules_admin_all"
  ON commission_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- commission_payouts: user SELECT own; admin ALL
-- ============================================================
CREATE POLICY "commission_payouts_select_own"
  ON commission_payouts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "commission_payouts_admin_all"
  ON commission_payouts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
