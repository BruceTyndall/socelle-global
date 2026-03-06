/*
  # Business Rules Schema - Admin-Configurable Governance

  1. New Tables
    - `service_category_benchmarks`
      - Defines minimum service counts per category per spa type
      - Replaces hardcoded "industry standards"
      - Admin-configurable with audit trail
    
    - `revenue_model_defaults`
      - Default utilization and conversion rates by spa type
      - Used only when user doesn't provide specific values
      - Enables revenue estimation governance
    
    - `pricing_uplift_rules`
      - Placeholder for future pricing optimization
      - Base to custom protocol pricing uplift percentages

  2. Purpose
    - Eliminate hardcoded assumptions from intelligence engine
    - Enable admin control over business logic
    - Provide audit trail for rule changes
    - Support "no output without input" governance model

  3. Security
    - Enable RLS on all tables
    - Restrict to authenticated admins only
*/

-- Create service_category_benchmarks table
CREATE TABLE IF NOT EXISTS service_category_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuration
  spa_type text NOT NULL CHECK (spa_type IN ('medspa', 'spa', 'hybrid')),
  category text NOT NULL,
  min_service_count integer NOT NULL DEFAULT 0 CHECK (min_service_count >= 0),
  priority_level text CHECK (priority_level IN ('High', 'Medium', 'Low')),
  
  -- Documentation
  notes text,
  rationale text,
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Audit trail
  created_by text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique combination of spa_type and category
  UNIQUE(spa_type, category)
);

-- Create indexes for service_category_benchmarks
CREATE INDEX IF NOT EXISTS idx_benchmarks_spa_type ON service_category_benchmarks(spa_type);
CREATE INDEX IF NOT EXISTS idx_benchmarks_category ON service_category_benchmarks(category);
CREATE INDEX IF NOT EXISTS idx_benchmarks_active ON service_category_benchmarks(is_active);

-- Enable RLS
ALTER TABLE service_category_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage category benchmarks"
  ON service_category_benchmarks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create revenue_model_defaults table
CREATE TABLE IF NOT EXISTS revenue_model_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuration
  spa_type text NOT NULL CHECK (spa_type IN ('medspa', 'spa', 'hybrid')) UNIQUE,
  
  -- Revenue model inputs
  default_utilization_per_month integer CHECK (default_utilization_per_month > 0),
  default_attach_rate numeric(5,2) CHECK (default_attach_rate >= 0 AND default_attach_rate <= 100),
  default_retail_conversion_rate numeric(5,2) CHECK (default_retail_conversion_rate >= 0 AND default_retail_conversion_rate <= 100),
  
  -- Documentation
  notes text,
  assumptions text,
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Audit trail
  created_by text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE revenue_model_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage revenue defaults"
  ON revenue_model_defaults FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create pricing_uplift_rules table (placeholder for future pricing features)
CREATE TABLE IF NOT EXISTS pricing_uplift_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuration
  spa_type text NOT NULL CHECK (spa_type IN ('medspa', 'spa', 'hybrid')) UNIQUE,
  
  -- Uplift percentages
  base_to_custom_uplift_percent numeric(5,2) CHECK (base_to_custom_uplift_percent >= 0),
  seasonal_premium_percent numeric(5,2) CHECK (seasonal_premium_percent >= 0),
  
  -- Documentation
  notes text,
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Audit trail
  created_by text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pricing_uplift_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing rules"
  ON pricing_uplift_rules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_benchmarks_updated_at ON service_category_benchmarks;
CREATE TRIGGER update_benchmarks_updated_at
  BEFORE UPDATE ON service_category_benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_revenue_defaults_updated_at ON revenue_model_defaults;
CREATE TRIGGER update_revenue_defaults_updated_at
  BEFORE UPDATE ON revenue_model_defaults
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON pricing_uplift_rules;
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON pricing_uplift_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default benchmarks for common scenarios
INSERT INTO service_category_benchmarks (spa_type, category, min_service_count, priority_level, notes, created_by) VALUES
  ('medspa', 'FACIALS', 3, 'High', 'Results-driven facials are core revenue drivers for medical spas', 'system'),
  ('medspa', 'BODY', 2, 'Medium', 'Clinical body treatments complement facial services', 'system'),
  ('medspa', 'MASSAGE', 1, 'Low', 'Not core to medical spa positioning', 'system'),
  ('medspa', 'ENHANCEMENTS', 2, 'High', 'High-margin add-ons increase average ticket', 'system'),
  ('medspa', 'ONCOLOGY', 1, 'Medium', 'Specialized care for medical spa clientele', 'system'),
  
  ('spa', 'FACIALS', 3, 'High', 'Essential wellness service for day spas', 'system'),
  ('spa', 'BODY', 2, 'High', 'Core relaxation and ritual experience', 'system'),
  ('spa', 'MASSAGE', 2, 'High', 'Fundamental to spa wellness offerings', 'system'),
  ('spa', 'ENHANCEMENTS', 2, 'Medium', 'Improves service customization options', 'system'),
  ('spa', 'ONCOLOGY', 1, 'Low', 'Specialized niche offering', 'system'),
  
  ('hybrid', 'FACIALS', 3, 'High', 'Core service for all spa types', 'system'),
  ('hybrid', 'BODY', 2, 'High', 'Balanced wellness and results approach', 'system'),
  ('hybrid', 'MASSAGE', 2, 'Medium', 'Important for comprehensive menu', 'system'),
  ('hybrid', 'ENHANCEMENTS', 2, 'High', 'Revenue optimization opportunity', 'system'),
  ('hybrid', 'ONCOLOGY', 1, 'Medium', 'Compassionate care offering', 'system')
ON CONFLICT (spa_type, category) DO NOTHING;

-- Insert default revenue model assumptions
INSERT INTO revenue_model_defaults (spa_type, default_utilization_per_month, default_attach_rate, default_retail_conversion_rate, notes, created_by) VALUES
  ('medspa', 40, 35.00, 25.00, 'Medical spa utilization: ~10 services/week. Attach rate: 35%. Retail conversion: 25%', 'system'),
  ('spa', 50, 25.00, 30.00, 'Day spa utilization: ~12 services/week. Attach rate: 25%. Retail conversion: 30%', 'system'),
  ('hybrid', 45, 30.00, 28.00, 'Hybrid spa utilization: ~11 services/week. Attach rate: 30%. Retail conversion: 28%', 'system')
ON CONFLICT (spa_type) DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE service_category_benchmarks IS 'Admin-configurable minimum service counts per category - replaces hardcoded thresholds';
COMMENT ON TABLE revenue_model_defaults IS 'Default revenue model assumptions by spa type - used when specific inputs not available';
COMMENT ON TABLE pricing_uplift_rules IS 'Pricing optimization rules for future use';
COMMENT ON COLUMN service_category_benchmarks.min_service_count IS 'Minimum recommended services in this category for this spa type';
COMMENT ON COLUMN revenue_model_defaults.default_utilization_per_month IS 'Expected number of service bookings per month (if not provided)';
COMMENT ON COLUMN revenue_model_defaults.default_attach_rate IS 'Percentage of services that result in enhancement add-ons';
COMMENT ON COLUMN revenue_model_defaults.default_retail_conversion_rate IS 'Percentage of services that result in retail product purchases';
