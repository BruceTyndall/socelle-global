-- Migration: RLS Policies for Subscription Tables
-- Authority: docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- subscription_plans: public catalog, read-only for all
CREATE POLICY "subscription_plans_select_all"
  ON subscription_plans FOR SELECT
  USING (true);

-- subscriptions: users can only see/manage their own
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- studio_addons: public catalog, read-only for all
CREATE POLICY "studio_addons_select_all"
  ON studio_addons FOR SELECT
  USING (true);

-- user_addons: users can only see/manage their own
CREATE POLICY "user_addons_select_own"
  ON user_addons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_addons_insert_own"
  ON user_addons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_addons_update_own"
  ON user_addons FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- studio_bundles: public catalog, read-only for all
CREATE POLICY "studio_bundles_select_all"
  ON studio_bundles FOR SELECT
  USING (true);

-- usage_meters: users can see/update their own, insert for authenticated
CREATE POLICY "usage_meters_select_own"
  ON usage_meters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usage_meters_insert_authenticated"
  ON usage_meters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_meters_update_own"
  ON usage_meters FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- feature_flags: read for all, write for admin only
CREATE POLICY "feature_flags_select_all"
  ON feature_flags FOR SELECT
  USING (true);

CREATE POLICY "feature_flags_insert_admin"
  ON feature_flags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "feature_flags_update_admin"
  ON feature_flags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "feature_flags_delete_admin"
  ON feature_flags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
