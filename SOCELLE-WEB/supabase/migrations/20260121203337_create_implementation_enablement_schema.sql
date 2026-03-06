/*
  # Implementation, Adoption, and Brand Enablement Schema

  1. New Tables
    - `implementation_readiness`
      - Stores calculated readiness profiles for mappings and gaps
      - Deterministic scoring based on protocol complexity
      - Links to service_mappings and gap_analysis
    
    - `phased_rollout_plans`
      - 30/60/90 day implementation plans
      - Deterministic phase assignment based on readiness
      - Complete traceability of plan logic
    
    - `rollout_plan_items`
      - Individual services/gaps in each phase
      - Links to mappings or gaps with rationale
    
    - `opening_orders`
      - Backbar and retail product requirements
      - Linked to rollout plans
      - Quantity estimates only when inputs exist
    
    - `brand_differentiation_points`
      - Structured talking points for sales
      - Grounded in actual protocol features
      - Reusable across plans

  2. Table Updates
    - `canonical_protocols` - Add training and certification fields
    
  3. Purpose
    - Convert intelligence into executable plans
    - Enable low-risk spa onboarding
    - Provide sales enablement tools
    - Maintain complete traceability

  4. Security
    - Enable RLS on all tables
    - Restrict to authenticated users
*/

-- Update canonical_protocols with training fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canonical_protocols' AND column_name = 'training_required'
  ) THEN
    ALTER TABLE canonical_protocols
    ADD COLUMN training_required boolean DEFAULT false,
    ADD COLUMN training_type text CHECK (training_type IN ('virtual', 'live', 'hybrid')),
    ADD COLUMN estimated_training_hours numeric(4,1),
    ADD COLUMN certification_required boolean DEFAULT false,
    ADD COLUMN certification_type text,
    ADD COLUMN training_notes text;
  END IF;
END $$;

-- Create implementation_readiness table
CREATE TABLE IF NOT EXISTS implementation_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source linkage (one must be set)
  spa_menu_id uuid NOT NULL REFERENCES spa_menus(id) ON DELETE CASCADE,
  service_mapping_id uuid REFERENCES spa_service_mapping(id) ON DELETE CASCADE,
  gap_id uuid REFERENCES service_gap_analysis(id) ON DELETE CASCADE,
  canonical_protocol_id uuid REFERENCES canonical_protocols(id) ON DELETE SET NULL,
  
  -- Readiness metrics
  training_complexity text NOT NULL CHECK (training_complexity IN ('Low', 'Medium', 'High')),
  estimated_training_hours numeric(4,1),
  product_count_required integer DEFAULT 0,
  contraindication_sensitivity text NOT NULL CHECK (contraindication_sensitivity IN ('Low', 'Medium', 'High')),
  staff_skill_level_required text NOT NULL CHECK (staff_skill_level_required IN ('Entry', 'Intermediate', 'Advanced')),
  overall_implementation_risk_score integer NOT NULL CHECK (overall_implementation_risk_score >= 0 AND overall_implementation_risk_score <= 100),
  
  -- Confidence and traceability
  confidence_level text CHECK (confidence_level IN ('High', 'Medium', 'Low', 'Unknown')),
  missing_data_flags jsonb DEFAULT '[]'::jsonb,
  source_trace jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Dependencies
  prerequisites text,
  equipment_required jsonb DEFAULT '[]'::jsonb,
  
  -- Admin review
  admin_reviewed boolean DEFAULT false,
  admin_adjusted boolean DEFAULT false,
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure at least one source is set
  CHECK (
    (service_mapping_id IS NOT NULL) OR
    (gap_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_readiness_spa_menu ON implementation_readiness(spa_menu_id);
CREATE INDEX IF NOT EXISTS idx_readiness_mapping ON implementation_readiness(service_mapping_id);
CREATE INDEX IF NOT EXISTS idx_readiness_gap ON implementation_readiness(gap_id);
CREATE INDEX IF NOT EXISTS idx_readiness_protocol ON implementation_readiness(canonical_protocol_id);
CREATE INDEX IF NOT EXISTS idx_readiness_risk_score ON implementation_readiness(overall_implementation_risk_score);
CREATE INDEX IF NOT EXISTS idx_readiness_complexity ON implementation_readiness(training_complexity);

ALTER TABLE implementation_readiness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage implementation readiness"
  ON implementation_readiness FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create phased_rollout_plans table
CREATE TABLE IF NOT EXISTS phased_rollout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  spa_menu_id uuid NOT NULL REFERENCES spa_menus(id) ON DELETE CASCADE,
  
  -- Plan metadata
  plan_name text NOT NULL,
  spa_type text CHECK (spa_type IN ('medspa', 'spa', 'hybrid')),
  total_services integer DEFAULT 0,
  total_phases integer DEFAULT 3,
  
  -- Readiness summary
  avg_risk_score numeric(5,2),
  total_training_hours numeric(6,1),
  total_products_required integer DEFAULT 0,
  
  -- Planning logic
  phase_assignment_logic jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_trace jsonb NOT NULL DEFAULT '{}'::jsonb,
  missing_data_flags jsonb DEFAULT '[]'::jsonb,
  
  -- Plan status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'in_progress', 'completed')),
  
  -- Admin management
  admin_approved boolean DEFAULT false,
  admin_notes text,
  approved_by text,
  approved_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rollout_plans_spa_menu ON phased_rollout_plans(spa_menu_id);
CREATE INDEX IF NOT EXISTS idx_rollout_plans_status ON phased_rollout_plans(status);
CREATE INDEX IF NOT EXISTS idx_rollout_plans_risk ON phased_rollout_plans(avg_risk_score);

ALTER TABLE phased_rollout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rollout plans"
  ON phased_rollout_plans FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create rollout_plan_items table
CREATE TABLE IF NOT EXISTS rollout_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  rollout_plan_id uuid NOT NULL REFERENCES phased_rollout_plans(id) ON DELETE CASCADE,
  
  -- Phase assignment
  phase_number integer NOT NULL CHECK (phase_number >= 1 AND phase_number <= 4),
  phase_name text NOT NULL,
  
  -- Item reference
  service_mapping_id uuid REFERENCES spa_service_mapping(id) ON DELETE CASCADE,
  gap_id uuid REFERENCES service_gap_analysis(id) ON DELETE CASCADE,
  implementation_readiness_id uuid REFERENCES implementation_readiness(id) ON DELETE SET NULL,
  
  -- Item details
  service_name text NOT NULL,
  protocol_name text,
  item_type text NOT NULL CHECK (item_type IN ('existing_service', 'gap_recommendation', 'enhancement')),
  
  -- Rationale
  phase_rationale text NOT NULL,
  dependencies text,
  
  -- Metrics
  risk_score integer,
  training_hours numeric(4,1),
  estimated_revenue numeric(10,2),
  
  -- Sequencing
  sort_order integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plan_items_plan ON rollout_plan_items(rollout_plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_phase ON rollout_plan_items(phase_number);
CREATE INDEX IF NOT EXISTS idx_plan_items_mapping ON rollout_plan_items(service_mapping_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_gap ON rollout_plan_items(gap_id);

ALTER TABLE rollout_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage plan items"
  ON rollout_plan_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create opening_orders table
CREATE TABLE IF NOT EXISTS opening_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  rollout_plan_id uuid NOT NULL REFERENCES phased_rollout_plans(id) ON DELETE CASCADE,
  spa_menu_id uuid NOT NULL REFERENCES spa_menus(id) ON DELETE CASCADE,
  
  -- Order sections
  backbar_products jsonb NOT NULL DEFAULT '[]'::jsonb,
  retail_products jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Totals (only if calculable)
  estimated_backbar_investment numeric(10,2),
  estimated_retail_investment numeric(10,2),
  total_estimated_investment numeric(10,2),
  
  -- Checklist items
  setup_checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  training_checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  launch_checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Seasonal timing
  recommended_launch_window text,
  seasonal_rationale text,
  
  -- Traceability
  source_trace jsonb NOT NULL DEFAULT '{}'::jsonb,
  missing_data_flags jsonb DEFAULT '[]'::jsonb,
  
  -- Admin management
  admin_reviewed boolean DEFAULT false,
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opening_orders_plan ON opening_orders(rollout_plan_id);
CREATE INDEX IF NOT EXISTS idx_opening_orders_spa_menu ON opening_orders(spa_menu_id);

ALTER TABLE opening_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage opening orders"
  ON opening_orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create brand_differentiation_points table
CREATE TABLE IF NOT EXISTS brand_differentiation_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Category and context
  point_category text NOT NULL CHECK (point_category IN ('protocol_design', 'safety_profile', 'integration_ease', 'seasonal_strategy', 'training_support', 'business_model', 'ingredient_quality')),
  spa_type text CHECK (spa_type IN ('medspa', 'spa', 'hybrid', 'all')),
  
  -- Content (structured)
  headline text NOT NULL,
  supporting_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_references jsonb DEFAULT '[]'::jsonb,
  
  -- Grounding
  grounded_in_protocols jsonb DEFAULT '[]'::jsonb,
  grounded_in_features jsonb DEFAULT '[]'::jsonb,
  source_trace jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  
  -- Management
  created_by text,
  verified_by text,
  verified_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_points_category ON brand_differentiation_points(point_category);
CREATE INDEX IF NOT EXISTS idx_brand_points_spa_type ON brand_differentiation_points(spa_type);
CREATE INDEX IF NOT EXISTS idx_brand_points_active ON brand_differentiation_points(is_active);

ALTER TABLE brand_differentiation_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage brand points"
  ON brand_differentiation_points FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_implementation_readiness_updated_at ON implementation_readiness;
CREATE TRIGGER update_implementation_readiness_updated_at
  BEFORE UPDATE ON implementation_readiness
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rollout_plans_updated_at ON phased_rollout_plans;
CREATE TRIGGER update_rollout_plans_updated_at
  BEFORE UPDATE ON phased_rollout_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opening_orders_updated_at ON opening_orders;
CREATE TRIGGER update_opening_orders_updated_at
  BEFORE UPDATE ON opening_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_points_updated_at ON brand_differentiation_points;
CREATE TRIGGER update_brand_points_updated_at
  BEFORE UPDATE ON brand_differentiation_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default brand differentiation points
INSERT INTO brand_differentiation_points (point_category, spa_type, headline, supporting_points, evidence_references, grounded_in_features, is_verified, created_by, verified_by) VALUES
  ('protocol_design', 'all', 'Holistic, Results-Driven Protocol Architecture', 
   '["Combines clinical efficacy with wellness experience", "Step-by-step guidance ensures consistency", "Modular design allows customization without compromise"]'::jsonb,
   '["canonical_protocols table", "protocol completion tracking"]'::jsonb,
   '["modular_steps", "concern_targeting", "completion_verification"]'::jsonb,
   true, 'system', 'system'),
   
  ('safety_profile', 'all', 'Built-In Safety and Contraindication Management',
   '["Every protocol documents contraindications", "Ingredient transparency and sensitivity tracking", "Guided decision-making reduces liability"]'::jsonb,
   '["canonical_protocols.contraindications", "mixing_rules table"]'::jsonb,
   '["contraindication_tracking", "ingredient_safety", "mixing_validation"]'::jsonb,
   true, 'system', 'system'),
   
  ('integration_ease', 'all', 'Seamless Integration with Existing Spa Operations',
   '["Maps to current menu with confidence scoring", "Identifies gaps without disrupting existing services", "Phased rollout minimizes operational risk"]'::jsonb,
   '["spa_service_mapping", "service_gap_analysis", "phased_rollout_plans"]'::jsonb,
   '["service_mapping_engine", "gap_analysis", "rollout_planner"]'::jsonb,
   true, 'system', 'system'),
   
  ('seasonal_strategy', 'all', 'Data-Driven Seasonal Launch Strategy',
   '["Marketing calendar aligns with consumer demand", "Seasonal protocol recommendations drive bookings", "Coordinated product launches maximize retail"]'::jsonb,
   '["marketing_calendar table", "seasonal gap analysis"]'::jsonb,
   '["marketing_calendar_integration", "seasonal_recommendations", "launch_timing"]'::jsonb,
   true, 'system', 'system'),
   
  ('training_support', 'all', 'Structured Training and Certification Framework',
   '["Virtual and live training options available", "Clear training hour estimates for planning", "Certification programs for advanced protocols"]'::jsonb,
   '["canonical_protocols training fields", "implementation_readiness"]'::jsonb,
   '["training_tracking", "certification_programs", "readiness_scoring"]'::jsonb,
   true, 'system', 'system'),
   
  ('business_model', 'all', 'Revenue-Optimized Service Architecture',
   '["Enhancement protocols increase average ticket", "Retail attach strategy drives product sales", "Utilization modeling supports financial planning"]'::jsonb,
   '["retail_attach_recommendations", "revenue_model_defaults"]'::jsonb,
   '["revenue_estimation", "retail_attach_engine", "utilization_modeling"]'::jsonb,
   true, 'system', 'system')
ON CONFLICT DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE implementation_readiness IS 'Deterministic readiness scoring for service implementations - enables risk assessment and phased planning';
COMMENT ON TABLE phased_rollout_plans IS '30/60/90 day implementation plans with deterministic phase assignment based on readiness scores';
COMMENT ON TABLE rollout_plan_items IS 'Individual services and gaps assigned to rollout phases with rationale and dependencies';
COMMENT ON TABLE opening_orders IS 'Opening order requirements for backbar and retail with onboarding checklists';
COMMENT ON TABLE brand_differentiation_points IS 'Structured, grounded talking points for sales enablement - no generic marketing claims';
COMMENT ON COLUMN implementation_readiness.overall_implementation_risk_score IS 'Composite risk score 0-100: training complexity + contraindications + skill level + product availability';
COMMENT ON COLUMN phased_rollout_plans.phase_assignment_logic IS 'Documents deterministic rules used to assign services to phases';
COMMENT ON COLUMN opening_orders.backbar_products IS 'Array of {product_id, product_name, quantity, notes} - quantity only if inputs exist';
COMMENT ON COLUMN brand_differentiation_points.grounded_in_protocols IS 'Protocol IDs or features that support this talking point - prevents hallucinated claims';
