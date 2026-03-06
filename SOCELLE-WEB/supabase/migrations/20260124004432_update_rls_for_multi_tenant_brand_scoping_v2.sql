/*
  # Update RLS Policies for Multi-Tenant Brand Scoping

  1. Brand Content Tables (canonical_protocols, products, etc.)
    - Brand admins can only access their brand's content
    - Business users can view all active brands' content
    - Platform admins have full access

  2. CRM Tables (spa_leads, plan_outputs)
    - Brand admins can see their brand's leads/plans
    - Platform admins have full access
    - Business self-service will be added later

  3. Configuration Tables (mixing_rules, retail_attach_rules, etc.)
    - Brand admins can manage their brand's rules
    - Business users can view rules for active brands
    - Platform admins have full access

  4. Security Principles
    - Brand admins can ONLY see their own brand's data
    - Cross-brand competitive data is hidden from brand admins
    - Only platform admins see cross-brand analytics
*/

-- ============================================================================
-- CANONICAL PROTOCOLS RLS
-- ============================================================================

DROP POLICY IF EXISTS "Spa users can view canonical protocols" ON canonical_protocols;
DROP POLICY IF EXISTS "Admins can manage canonical protocols" ON canonical_protocols;
DROP POLICY IF EXISTS "Brand admins manage their protocols" ON canonical_protocols;
DROP POLICY IF EXISTS "Business users view active brand protocols" ON canonical_protocols;
DROP POLICY IF EXISTS "Platform admins full access protocols" ON canonical_protocols;

CREATE POLICY "Brand admins manage their protocols"
  ON canonical_protocols FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = canonical_protocols.brand_id
      AND user_profiles.role IN ('admin', 'brand_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.brand_id = canonical_protocols.brand_id
      AND user_profiles.role IN ('admin', 'brand_admin')
    )
  );

CREATE POLICY "Business users view active brand protocols"
  ON canonical_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('spa_user', 'business_user')
    )
    AND EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = canonical_protocols.brand_id
      AND brands.status = 'active'
    )
  );

CREATE POLICY "Platform admins full access protocols"
  ON canonical_protocols FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'platform_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'platform_admin'
    )
  );

-- ============================================================================
-- PRO PRODUCTS RLS
-- ============================================================================

DROP POLICY IF EXISTS "Spa users can view pro products" ON pro_products;
DROP POLICY IF EXISTS "Admins can manage pro products" ON pro_products;
DROP POLICY IF EXISTS "Brand admins manage their products" ON pro_products;
DROP POLICY IF EXISTS "Business users view active brand products" ON pro_products;
DROP POLICY IF EXISTS "Platform admins full access products" ON pro_products;

CREATE POLICY "Brand admins manage their products"
  ON pro_products FOR ALL
  TO authenticated
  USING (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')))
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')));

CREATE POLICY "Business users view active brand products"
  ON pro_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('spa_user', 'business_user'))
    AND brand_id IN (SELECT id FROM brands WHERE status = 'active')
  );

CREATE POLICY "Platform admins full access products"
  ON pro_products FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'));

-- ============================================================================
-- RETAIL PRODUCTS RLS
-- ============================================================================

DROP POLICY IF EXISTS "Spa users can view retail products" ON retail_products;
DROP POLICY IF EXISTS "Admins can manage retail products" ON retail_products;
DROP POLICY IF EXISTS "Brand admins manage their retail products" ON retail_products;
DROP POLICY IF EXISTS "Business users view active brand retail products" ON retail_products;
DROP POLICY IF EXISTS "Platform admins full access retail products" ON retail_products;

CREATE POLICY "Brand admins manage their retail products"
  ON retail_products FOR ALL
  TO authenticated
  USING (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')))
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')));

CREATE POLICY "Business users view active brand retail products"
  ON retail_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('spa_user', 'business_user'))
    AND brand_id IN (SELECT id FROM brands WHERE status = 'active')
  );

CREATE POLICY "Platform admins full access retail products"
  ON retail_products FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'));

-- ============================================================================
-- MIXING RULES, RETAIL ATTACH, PRICING RLS
-- ============================================================================

-- Mixing Rules
DROP POLICY IF EXISTS "Spa users can view mixing rules" ON mixing_rules;
DROP POLICY IF EXISTS "Admins can manage mixing rules" ON mixing_rules;
DROP POLICY IF EXISTS "Brand admins manage mixing rules" ON mixing_rules;
DROP POLICY IF EXISTS "Business users view mixing rules" ON mixing_rules;
DROP POLICY IF EXISTS "Platform admins full access mixing rules" ON mixing_rules;

CREATE POLICY "Brand admins manage mixing rules"
  ON mixing_rules FOR ALL
  TO authenticated
  USING (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')))
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')));

CREATE POLICY "Business users view mixing rules"
  ON mixing_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('spa_user', 'business_user'))
    AND brand_id IN (SELECT id FROM brands WHERE status = 'active')
  );

CREATE POLICY "Platform admins full access mixing rules"
  ON mixing_rules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'));

-- Retail Attach Rules
DROP POLICY IF EXISTS "Spa users can view retail attach rules" ON retail_attach_rules;
DROP POLICY IF EXISTS "Admins can manage retail attach rules" ON retail_attach_rules;
DROP POLICY IF EXISTS "Brand admins manage retail attach rules" ON retail_attach_rules;
DROP POLICY IF EXISTS "Business users view retail attach rules" ON retail_attach_rules;
DROP POLICY IF EXISTS "Platform admins full access retail attach rules" ON retail_attach_rules;

CREATE POLICY "Brand admins manage retail attach rules"
  ON retail_attach_rules FOR ALL
  TO authenticated
  USING (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')))
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')));

CREATE POLICY "Business users view retail attach rules"
  ON retail_attach_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('spa_user', 'business_user'))
    AND brand_id IN (SELECT id FROM brands WHERE status = 'active')
  );

CREATE POLICY "Platform admins full access retail attach rules"
  ON retail_attach_rules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'));

-- Pricing Uplift Rules
DROP POLICY IF EXISTS "Spa users can view pricing uplift rules" ON pricing_uplift_rules;
DROP POLICY IF EXISTS "Admins can manage pricing uplift rules" ON pricing_uplift_rules;
DROP POLICY IF EXISTS "Brand admins manage pricing rules" ON pricing_uplift_rules;
DROP POLICY IF EXISTS "Business users view pricing rules" ON pricing_uplift_rules;
DROP POLICY IF EXISTS "Platform admins full access pricing rules" ON pricing_uplift_rules;

CREATE POLICY "Brand admins manage pricing rules"
  ON pricing_uplift_rules FOR ALL
  TO authenticated
  USING (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')))
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')));

CREATE POLICY "Business users view pricing rules"
  ON pricing_uplift_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('spa_user', 'business_user'))
    AND brand_id IN (SELECT id FROM brands WHERE status = 'active')
  );

CREATE POLICY "Platform admins full access pricing rules"
  ON pricing_uplift_rules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'));

-- ============================================================================
-- BRAND CRM (spa_leads, plan_outputs)
-- ============================================================================

-- Spa Leads: Brand admins see their brand's leads only
DROP POLICY IF EXISTS "Admins can view all spa leads" ON spa_leads;
DROP POLICY IF EXISTS "Admins can manage spa leads" ON spa_leads;
DROP POLICY IF EXISTS "Brand admins view their brand leads" ON spa_leads;
DROP POLICY IF EXISTS "Platform admins view all leads" ON spa_leads;

CREATE POLICY "Brand admins view their brand leads"
  ON spa_leads FOR ALL
  TO authenticated
  USING (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')))
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')));

CREATE POLICY "Platform admins view all leads"
  ON spa_leads FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'));

-- Plan Outputs: Inherit from spa_leads brand scoping
DROP POLICY IF EXISTS "Spa users can view their own plan outputs" ON plan_outputs;
DROP POLICY IF EXISTS "Admins can view all plan outputs" ON plan_outputs;
DROP POLICY IF EXISTS "Admins can manage plan outputs" ON plan_outputs;
DROP POLICY IF EXISTS "Brand admins view their brand plans" ON plan_outputs;
DROP POLICY IF EXISTS "Platform admins view all plans" ON plan_outputs;

CREATE POLICY "Brand admins view their brand plans"
  ON plan_outputs FOR ALL
  TO authenticated
  USING (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')))
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')));

CREATE POLICY "Platform admins view all plans"
  ON plan_outputs FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin'));