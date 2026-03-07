-- WO follow-up: replace mock brand automations/promotions with DB-backed storage
-- ADD ONLY migration

-- ------------------------------------------------------------
-- brand_automation_rules
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('order_confirmation', 'shipping_notification', 'reorder_reminder')),
  enabled boolean NOT NULL DEFAULT true,
  trigger_days int,
  description text NOT NULL,
  last_triggered_at timestamptz,
  trigger_count int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brand_automation_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brand_automation_rules_admin_all ON brand_automation_rules;
CREATE POLICY brand_automation_rules_admin_all ON brand_automation_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.role IN ('admin', 'platform_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.role IN ('admin', 'platform_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS brand_automation_rules_brand_user_crud ON brand_automation_rules;
CREATE POLICY brand_automation_rules_brand_user_crud ON brand_automation_rules
  FOR ALL
  USING (
    brand_id IN (
      SELECT up.brand_id
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.brand_id IS NOT NULL
    )
  )
  WITH CHECK (
    brand_id IN (
      SELECT up.brand_id
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.brand_id IS NOT NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_brand_automation_rules_brand_id ON brand_automation_rules(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_automation_rules_rule_type ON brand_automation_rules(rule_type);

-- ------------------------------------------------------------
-- brand_tier_discounts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_tier_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('active', 'elite', 'master')),
  discount_percent numeric NOT NULL,
  min_units int,
  description text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brand_tier_discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brand_tier_discounts_admin_all ON brand_tier_discounts;
CREATE POLICY brand_tier_discounts_admin_all ON brand_tier_discounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.role IN ('admin', 'platform_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.role IN ('admin', 'platform_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS brand_tier_discounts_brand_user_crud ON brand_tier_discounts;
CREATE POLICY brand_tier_discounts_brand_user_crud ON brand_tier_discounts
  FOR ALL
  USING (
    brand_id IN (
      SELECT up.brand_id
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.brand_id IS NOT NULL
    )
  )
  WITH CHECK (
    brand_id IN (
      SELECT up.brand_id
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.brand_id IS NOT NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_brand_tier_discounts_brand_id ON brand_tier_discounts(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_tier_discounts_tier ON brand_tier_discounts(tier);

-- ------------------------------------------------------------
-- brand_volume_discounts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_volume_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  min_units int NOT NULL,
  max_units int,
  discount_percent numeric NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brand_volume_discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brand_volume_discounts_admin_all ON brand_volume_discounts;
CREATE POLICY brand_volume_discounts_admin_all ON brand_volume_discounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.role IN ('admin', 'platform_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.role IN ('admin', 'platform_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS brand_volume_discounts_brand_user_crud ON brand_volume_discounts;
CREATE POLICY brand_volume_discounts_brand_user_crud ON brand_volume_discounts
  FOR ALL
  USING (
    brand_id IN (
      SELECT up.brand_id
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.brand_id IS NOT NULL
    )
  )
  WITH CHECK (
    brand_id IN (
      SELECT up.brand_id
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.brand_id IS NOT NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_brand_volume_discounts_brand_id ON brand_volume_discounts(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_volume_discounts_min_units ON brand_volume_discounts(min_units);
