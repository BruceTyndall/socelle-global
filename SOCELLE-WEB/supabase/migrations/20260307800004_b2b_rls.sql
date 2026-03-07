-- WO-OVERHAUL-16: RLS policies for all B2B reseller tables
-- ADD ONLY — no existing policies modified

-- ============================================================
-- reseller_accounts
-- ============================================================
ALTER TABLE reseller_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reseller_accounts_select_own"
  ON reseller_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "reseller_accounts_update_own"
  ON reseller_accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "reseller_accounts_admin_all"
  ON reseller_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- reseller_clients
-- ============================================================
ALTER TABLE reseller_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reseller_clients_select_own"
  ON reseller_clients FOR SELECT
  USING (
    reseller_id IN (
      SELECT id FROM reseller_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reseller_clients_insert_own"
  ON reseller_clients FOR INSERT
  WITH CHECK (
    reseller_id IN (
      SELECT id FROM reseller_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reseller_clients_update_own"
  ON reseller_clients FOR UPDATE
  USING (
    reseller_id IN (
      SELECT id FROM reseller_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reseller_clients_admin_all"
  ON reseller_clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- white_label_config
-- ============================================================
ALTER TABLE white_label_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "white_label_config_select_own"
  ON white_label_config FOR SELECT
  USING (
    reseller_id IN (
      SELECT id FROM reseller_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "white_label_config_update_own"
  ON white_label_config FOR UPDATE
  USING (
    reseller_id IN (
      SELECT id FROM reseller_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "white_label_config_admin_all"
  ON white_label_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- reseller_revenue
-- ============================================================
ALTER TABLE reseller_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reseller_revenue_select_own"
  ON reseller_revenue FOR SELECT
  USING (
    reseller_id IN (
      SELECT id FROM reseller_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reseller_revenue_admin_all"
  ON reseller_revenue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
