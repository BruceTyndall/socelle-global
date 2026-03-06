/*
  # Add Protocol Details and Data Integrity Tracking

  ## Overview
  Expands the database schema to store complete protocol step-by-step instructions,
  product usage details, costing data, and document ingestion tracking. Ensures all
  recommendations are grounded in actual ingested content.

  ## New Tables

  ### 1. canonical_protocol_steps
  Stores step-by-step instructions for each canonical protocol
  - `id` (uuid, primary key) - Unique identifier
  - `canonical_protocol_id` (uuid, FK) - Links to canonical_protocols
  - `step_number` (integer) - Sequential order of steps
  - `step_title` (text) - Brief step title (e.g., "Cleanse", "Exfoliate")
  - `step_instructions` (text) - Detailed instructions for this step
  - `timing_minutes` (integer, nullable) - Time allocated for this step
  - `technique_notes` (text, nullable) - Special techniques or tips
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. canonical_protocol_step_products
  Links specific products to specific protocol steps
  - `id` (uuid, primary key) - Unique identifier
  - `protocol_step_id` (uuid, FK) - Links to canonical_protocol_steps
  - `product_id` (uuid, nullable) - FK to product table (backbar or retail)
  - `product_name` (text) - Product name for lookup/reference
  - `product_type` (text) - BACKBAR or RETAIL
  - `usage_amount` (text, nullable) - Amount to use (e.g., "2 pumps", "dime-sized")
  - `usage_unit` (text, nullable) - Unit of measurement
  - `notes` (text, nullable) - Special usage notes
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. protocol_costing
  Stores cost analysis for each protocol
  - `id` (uuid, primary key) - Unique identifier
  - `canonical_protocol_id` (uuid, FK) - Links to canonical_protocols
  - `estimated_cogs` (decimal, nullable) - Estimated cost of goods sold
  - `cogs_confidence` (text) - High, Medium, or Low confidence
  - `cost_notes` (text, nullable) - Explanation of cost calculation
  - `source_reference` (text, nullable) - PDF file/page reference
  - `last_updated` (timestamptz) - Last update timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. document_ingestion_log
  Tracks which PDFs have been processed and ingested
  - `id` (uuid, primary key) - Unique identifier
  - `source_file` (text) - Filename of source PDF
  - `doc_type` (text) - protocol, mixing_guide, cost_analysis, retail_guide, marketing
  - `status` (text) - pending, processing, completed, failed
  - `extraction_confidence` (text) - High, Medium, Low
  - `extracted_at` (timestamptz, nullable) - When extraction completed
  - `exceptions` (jsonb) - Any errors or warnings during extraction
  - `metadata` (jsonb) - Additional info about the document
  - `created_at` (timestamptz) - Creation timestamp

  ## Schema Updates

  ### service_mappings (add column)
  - `missing_data_flags` (jsonb) - Track what data is incomplete

  ## Security
  - Enable RLS on all new tables
  - Public read access for lookups
  - Authenticated users can manage data

  ## Important Notes
  - All protocol recommendations must reference canonical_protocols
  - Product recommendations must reference actual products in database
  - Cost calculations must be based on protocol_costing or computed from products
  - Fuzzy matching is ONLY for connecting marketing calendar to canonical protocols
*/

-- 1. Create canonical_protocol_steps table
CREATE TABLE IF NOT EXISTS canonical_protocol_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_protocol_id uuid NOT NULL REFERENCES canonical_protocols(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  step_title text NOT NULL,
  step_instructions text NOT NULL,
  timing_minutes integer,
  technique_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(canonical_protocol_id, step_number)
);

ALTER TABLE canonical_protocol_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to protocol_steps"
  ON canonical_protocol_steps FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated read access to protocol_steps"
  ON canonical_protocol_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert protocol_steps"
  ON canonical_protocol_steps FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update protocol_steps"
  ON canonical_protocol_steps FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete protocol_steps"
  ON canonical_protocol_steps FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_protocol_steps_protocol_id 
  ON canonical_protocol_steps(canonical_protocol_id);

-- 2. Create canonical_protocol_step_products table
CREATE TABLE IF NOT EXISTS canonical_protocol_step_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_step_id uuid NOT NULL REFERENCES canonical_protocol_steps(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('BACKBAR', 'RETAIL', 'CONSUMABLE', 'TOOL')),
  usage_amount text,
  usage_unit text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE canonical_protocol_step_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to step_products"
  ON canonical_protocol_step_products FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated read access to step_products"
  ON canonical_protocol_step_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert step_products"
  ON canonical_protocol_step_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update step_products"
  ON canonical_protocol_step_products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete step_products"
  ON canonical_protocol_step_products FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_step_products_step_id 
  ON canonical_protocol_step_products(protocol_step_id);

CREATE INDEX IF NOT EXISTS idx_step_products_product_name 
  ON canonical_protocol_step_products(product_name);

-- 3. Create protocol_costing table
CREATE TABLE IF NOT EXISTS protocol_costing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_protocol_id uuid NOT NULL REFERENCES canonical_protocols(id) ON DELETE CASCADE,
  estimated_cogs decimal(10, 2),
  cogs_confidence text CHECK (cogs_confidence IN ('High', 'Medium', 'Low')),
  cost_notes text,
  source_reference text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(canonical_protocol_id)
);

ALTER TABLE protocol_costing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to protocol_costing"
  ON protocol_costing FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated read access to protocol_costing"
  ON protocol_costing FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert protocol_costing"
  ON protocol_costing FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update protocol_costing"
  ON protocol_costing FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete protocol_costing"
  ON protocol_costing FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_protocol_costing_protocol_id 
  ON protocol_costing(canonical_protocol_id);

-- 4. Create document_ingestion_log table
CREATE TABLE IF NOT EXISTS document_ingestion_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file text NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('protocol', 'mixing_guide', 'cost_analysis', 'retail_guide', 'marketing', 'other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  extraction_confidence text CHECK (extraction_confidence IN ('High', 'Medium', 'Low', 'Unknown')),
  extracted_at timestamptz,
  exceptions jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_file)
);

ALTER TABLE document_ingestion_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to ingestion_log"
  ON document_ingestion_log FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated read access to ingestion_log"
  ON document_ingestion_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert ingestion_log"
  ON document_ingestion_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ingestion_log"
  ON document_ingestion_log FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete ingestion_log"
  ON document_ingestion_log FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_status 
  ON document_ingestion_log(status);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_doc_type 
  ON document_ingestion_log(doc_type);

-- 5. Update service_mappings table with missing_data_flags column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_mappings' AND column_name = 'missing_data_flags'
  ) THEN
    ALTER TABLE service_mappings ADD COLUMN missing_data_flags jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create a view for complete protocol details (joins steps and products)
CREATE OR REPLACE VIEW protocol_complete_details AS
SELECT 
  cp.id as protocol_id,
  cp.protocol_name,
  cp.category,
  cp.target_concerns,
  cp.typical_duration,
  pc.estimated_cogs,
  pc.cogs_confidence,
  json_agg(
    json_build_object(
      'step_number', cps.step_number,
      'step_title', cps.step_title,
      'step_instructions', cps.step_instructions,
      'timing_minutes', cps.timing_minutes,
      'technique_notes', cps.technique_notes,
      'products', (
        SELECT json_agg(
          json_build_object(
            'product_name', cpsp.product_name,
            'product_type', cpsp.product_type,
            'usage_amount', cpsp.usage_amount,
            'usage_unit', cpsp.usage_unit,
            'notes', cpsp.notes
          )
        )
        FROM canonical_protocol_step_products cpsp
        WHERE cpsp.protocol_step_id = cps.id
      )
    ) ORDER BY cps.step_number
  ) FILTER (WHERE cps.id IS NOT NULL) as steps
FROM canonical_protocols cp
LEFT JOIN protocol_costing pc ON pc.canonical_protocol_id = cp.id
LEFT JOIN canonical_protocol_steps cps ON cps.canonical_protocol_id = cp.id
GROUP BY cp.id, cp.protocol_name, cp.category, cp.target_concerns, cp.typical_duration, 
         pc.estimated_cogs, pc.cogs_confidence;

-- Add comments documenting the data integrity rules
COMMENT ON TABLE canonical_protocol_steps IS 
  'Protocol step-by-step instructions. ALL protocol recommendations must reference entries in canonical_protocols. Never invent or assume protocol names.';

COMMENT ON TABLE canonical_protocol_step_products IS 
  'Products used in each protocol step. Product names must match entries in naturopathica_backbar_products or naturopathica_retail_products. Never invent product names.';

COMMENT ON TABLE protocol_costing IS 
  'Cost of goods sold for protocols. All cost calculations must be based on actual product costs or documented in source_reference. Never estimate without data.';

COMMENT ON TABLE document_ingestion_log IS 
  'Tracks which source PDFs have been processed. Use this to verify data provenance and identify gaps in coverage.';

COMMENT ON COLUMN service_mappings.missing_data_flags IS 
  'JSON flags for incomplete data: {protocol_steps_missing: bool, product_details_missing: bool, costing_missing: bool, needs_pdf_extraction: bool}';
