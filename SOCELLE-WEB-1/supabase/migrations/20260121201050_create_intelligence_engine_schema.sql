/*
  # Core Intelligence Engine Schema

  1. New Tables
    - `spa_service_mapping`
      - Maps spa menu services to canonical protocols
      - Stores confidence scores and match explanations
      - Tracks admin overrides
    
    - `service_gap_analysis`
      - Identifies missing services per spa
      - Recommends canonical protocols to fill gaps
      - Includes seasonal relevance and priority

  2. Changes to spa_menus
    - Add `spa_type` field (medspa, spa, hybrid)
    - Add `analysis_status` tracking
    - Add metadata for spa location/brand

  3. Purpose
    - Ground all recommendations in canonical data
    - Enable deterministic, explainable service mapping
    - Provide gap analysis with seasonal intelligence
    - Support admin review and override workflow

  4. Security
    - Enable RLS on all new tables
    - Restrict access to authenticated admins
*/

-- Add spa_type and analysis tracking to spa_menus
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'spa_type_enum') THEN
    CREATE TYPE spa_type_enum AS ENUM ('medspa', 'spa', 'hybrid');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spa_menus' AND column_name = 'spa_type'
  ) THEN
    ALTER TABLE spa_menus
    ADD COLUMN spa_type spa_type_enum DEFAULT 'spa' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spa_menus' AND column_name = 'spa_location'
  ) THEN
    ALTER TABLE spa_menus
    ADD COLUMN spa_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spa_menus' AND column_name = 'analysis_status'
  ) THEN
    ALTER TABLE spa_menus
    ADD COLUMN analysis_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spa_menus' AND column_name = 'last_analyzed_at'
  ) THEN
    ALTER TABLE spa_menus
    ADD COLUMN last_analyzed_at timestamptz;
  END IF;
END $$;

-- Create match_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_type_enum') THEN
    CREATE TYPE match_type_enum AS ENUM ('Exact', 'Partial', 'Candidate', 'No Match');
  END IF;
END $$;

-- Create spa_service_mapping table
CREATE TABLE IF NOT EXISTS spa_service_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source service reference
  spa_menu_id uuid NOT NULL REFERENCES spa_menus(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  service_category text,
  service_duration text,
  service_price numeric(10,2),
  service_description text,
  
  -- Mapping to canonical protocol
  canonical_protocol_id uuid REFERENCES canonical_protocols(id) ON DELETE SET NULL,
  
  -- Matching metadata
  match_type match_type_enum NOT NULL DEFAULT 'No Match',
  confidence_score integer NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  mapping_notes text NOT NULL,
  missing_data_flags text[] DEFAULT '{}',
  
  -- Matching criteria breakdown
  name_similarity_score integer DEFAULT 0,
  duration_match_score integer DEFAULT 0,
  category_match_score integer DEFAULT 0,
  concern_match_score integer DEFAULT 0,
  
  -- Seasonal relevance
  is_seasonally_relevant boolean DEFAULT false,
  seasonal_rationale text,
  
  -- Admin review
  admin_reviewed boolean DEFAULT false,
  admin_override boolean DEFAULT false,
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for spa_service_mapping
CREATE INDEX IF NOT EXISTS idx_service_mapping_spa_menu
  ON spa_service_mapping(spa_menu_id);
CREATE INDEX IF NOT EXISTS idx_service_mapping_protocol
  ON spa_service_mapping(canonical_protocol_id);
CREATE INDEX IF NOT EXISTS idx_service_mapping_match_type
  ON spa_service_mapping(match_type);
CREATE INDEX IF NOT EXISTS idx_service_mapping_confidence
  ON spa_service_mapping(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_service_mapping_admin_review
  ON spa_service_mapping(admin_reviewed, admin_override);

-- Enable RLS on spa_service_mapping
ALTER TABLE spa_service_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage service mappings"
  ON spa_service_mapping FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create gap_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gap_type_enum') THEN
    CREATE TYPE gap_type_enum AS ENUM (
      'category_gap',
      'seasonal_gap',
      'treatment_type_gap',
      'signature_missing',
      'enhancement_missing'
    );
  END IF;
END $$;

-- Create priority enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level_enum') THEN
    CREATE TYPE priority_level_enum AS ENUM ('High', 'Medium', 'Low');
  END IF;
END $$;

-- Create service_gap_analysis table
CREATE TABLE IF NOT EXISTS service_gap_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Spa reference
  spa_menu_id uuid NOT NULL REFERENCES spa_menus(id) ON DELETE CASCADE,
  
  -- Gap identification
  gap_type gap_type_enum NOT NULL,
  gap_category text NOT NULL,
  gap_description text NOT NULL,
  priority_level priority_level_enum NOT NULL DEFAULT 'Medium',
  
  -- Recommended solution (only completed protocols)
  recommended_protocol_id uuid REFERENCES canonical_protocols(id) ON DELETE SET NULL,
  rationale text NOT NULL,
  
  -- Seasonal context
  is_seasonal boolean DEFAULT false,
  seasonal_window text,
  marketing_theme text,
  
  -- Business context
  estimated_revenue_impact text,
  implementation_complexity text,
  
  -- Admin review
  status text DEFAULT 'identified',
  admin_reviewed boolean DEFAULT false,
  admin_action text,
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for service_gap_analysis
CREATE INDEX IF NOT EXISTS idx_gap_analysis_spa_menu
  ON service_gap_analysis(spa_menu_id);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_protocol
  ON service_gap_analysis(recommended_protocol_id);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_priority
  ON service_gap_analysis(priority_level);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_gap_type
  ON service_gap_analysis(gap_type);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_status
  ON service_gap_analysis(status);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_seasonal
  ON service_gap_analysis(is_seasonal);

-- Enable RLS on service_gap_analysis
ALTER TABLE service_gap_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage gap analysis"
  ON service_gap_analysis FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_spa_service_mapping_updated_at ON spa_service_mapping;
CREATE TRIGGER update_spa_service_mapping_updated_at
  BEFORE UPDATE ON spa_service_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_gap_analysis_updated_at ON service_gap_analysis;
CREATE TRIGGER update_service_gap_analysis_updated_at
  BEFORE UPDATE ON service_gap_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE spa_service_mapping IS 'Maps spa menu services to canonical protocols with confidence scoring and admin review';
COMMENT ON TABLE service_gap_analysis IS 'Identifies service gaps and recommends canonical protocols to fill them';
COMMENT ON COLUMN spa_service_mapping.confidence_score IS 'Match confidence from 0-100 based on name, duration, category, and concern similarity';
COMMENT ON COLUMN spa_service_mapping.missing_data_flags IS 'Flags like protocol_incomplete, duration_mismatch, category_unknown';
COMMENT ON COLUMN service_gap_analysis.rationale IS 'Data-backed explanation for why this gap exists and why this protocol is recommended';
