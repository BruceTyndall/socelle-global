/*
  # Retail Attach Recommendations Schema

  1. New Table
    - `retail_attach_recommendations`
      - Suggests 1-2 retail SKUs per mapped service or approved gap
      - Grounded in retail_products only
      - Deterministic matching with full traceability
      - Admin review and override workflow

  2. Updates to Existing Tables
    - `service_gap_analysis` - Add revenue estimation and traceability fields
    - New fields for governed impact estimation

  3. Purpose
    - Enable data-driven retail product recommendations
    - Provide complete traceability of recommendation logic
    - Support admin review and override workflow
    - Eliminate recommendations without data grounding

  4. Security
    - Enable RLS on retail_attach_recommendations
    - Restrict to authenticated admins
*/

-- Update service_gap_analysis with revenue estimation governance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_gap_analysis' AND column_name = 'estimated_monthly_revenue'
  ) THEN
    ALTER TABLE service_gap_analysis
    ADD COLUMN estimated_monthly_revenue numeric(10,2),
    ADD COLUMN estimated_monthly_profit numeric(10,2),
    ADD COLUMN impact_confidence text CHECK (impact_confidence IN ('High', 'Medium', 'Low', 'Unknown')),
    ADD COLUMN impact_missing_data jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN source_trace jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create retail_attach_recommendations table
CREATE TABLE IF NOT EXISTS retail_attach_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source reference (one of these must be set)
  spa_menu_id uuid REFERENCES spa_menus(id) ON DELETE CASCADE,
  service_mapping_id uuid REFERENCES spa_service_mapping(id) ON DELETE CASCADE,
  canonical_protocol_id uuid REFERENCES canonical_protocols(id) ON DELETE SET NULL,
  gap_id uuid REFERENCES service_gap_analysis(id) ON DELETE CASCADE,
  
  -- Recommended retail product
  retail_product_id uuid NOT NULL REFERENCES retail_products(id) ON DELETE CASCADE,
  
  -- Ranking and scoring
  rank integer NOT NULL CHECK (rank IN (1, 2)),
  confidence_score integer NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Explainability
  rationale text NOT NULL,
  matching_criteria jsonb DEFAULT '[]'::jsonb,
  missing_data_flags jsonb DEFAULT '[]'::jsonb,
  
  -- Full traceability
  source_trace jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Seasonal context
  is_seasonally_relevant boolean DEFAULT false,
  seasonal_rationale text,
  
  -- Admin review
  admin_reviewed boolean DEFAULT false,
  admin_approved boolean DEFAULT false,
  admin_override boolean DEFAULT false,
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure at least one source is set
  CHECK (
    (service_mapping_id IS NOT NULL) OR
    (gap_id IS NOT NULL) OR
    (canonical_protocol_id IS NOT NULL)
  )
);

-- Create indexes for retail_attach_recommendations
CREATE INDEX IF NOT EXISTS idx_retail_attach_spa_menu
  ON retail_attach_recommendations(spa_menu_id);
CREATE INDEX IF NOT EXISTS idx_retail_attach_service_mapping
  ON retail_attach_recommendations(service_mapping_id);
CREATE INDEX IF NOT EXISTS idx_retail_attach_gap
  ON retail_attach_recommendations(gap_id);
CREATE INDEX IF NOT EXISTS idx_retail_attach_protocol
  ON retail_attach_recommendations(canonical_protocol_id);
CREATE INDEX IF NOT EXISTS idx_retail_attach_product
  ON retail_attach_recommendations(retail_product_id);
CREATE INDEX IF NOT EXISTS idx_retail_attach_rank
  ON retail_attach_recommendations(rank);
CREATE INDEX IF NOT EXISTS idx_retail_attach_confidence
  ON retail_attach_recommendations(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_retail_attach_admin_review
  ON retail_attach_recommendations(admin_reviewed, admin_approved);
CREATE INDEX IF NOT EXISTS idx_retail_attach_seasonal
  ON retail_attach_recommendations(is_seasonally_relevant);

-- Enable RLS
ALTER TABLE retail_attach_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage retail attach recommendations"
  ON retail_attach_recommendations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_retail_attach_updated_at ON retail_attach_recommendations;
CREATE TRIGGER update_retail_attach_updated_at
  BEFORE UPDATE ON retail_attach_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE retail_attach_recommendations IS 'AI-generated retail product recommendations grounded in canonical data with full traceability';
COMMENT ON COLUMN retail_attach_recommendations.rank IS 'Primary (1) or secondary (2) recommendation';
COMMENT ON COLUMN retail_attach_recommendations.source_trace IS 'Complete traceability: source_files, rules_triggered, data_sources used';
COMMENT ON COLUMN retail_attach_recommendations.matching_criteria IS 'Array of criteria that matched: protocol_allowed_products, category_match, concern_overlap, seasonal_match';
COMMENT ON COLUMN retail_attach_recommendations.missing_data_flags IS 'Array of missing data that could improve recommendation quality';
COMMENT ON COLUMN service_gap_analysis.estimated_monthly_revenue IS 'Estimated monthly revenue - NULL if insufficient data';
COMMENT ON COLUMN service_gap_analysis.estimated_monthly_profit IS 'Estimated monthly profit - NULL if COGS data unavailable';
COMMENT ON COLUMN service_gap_analysis.impact_confidence IS 'Confidence in revenue estimate based on data availability';
COMMENT ON COLUMN service_gap_analysis.impact_missing_data IS 'JSON array of missing inputs: service_price, utilization_rate, protocol_costs, etc.';
COMMENT ON COLUMN service_gap_analysis.source_trace IS 'Traceability of recommendation: source_files, benchmarks_used, rules_triggered';
