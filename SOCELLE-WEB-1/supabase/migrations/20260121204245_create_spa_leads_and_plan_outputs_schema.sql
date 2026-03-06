/*
  # Spa Leads and Sales-Ready Plan Outputs Schema

  1. New Tables
    - `spa_leads`
      - Tracks prospective spa accounts through sales pipeline
      - Stores contact info, status, and lead source
      - Links to spa_menus for full analysis
    
    - `plan_outputs`
      - Generated sales-ready plans for spas
      - Includes all sections: summary, validation, roadmap, etc.
      - Versioning support for iterative updates
      - Shareable links and PDF generation tracking
    
    - `lead_activities`
      - Notes, follow-ups, and communication log
      - Timeline of interactions with lead
    
    - `plan_sections`
      - Individual sections of plan output
      - Modular content for flexible rendering
      - Supports different section types

  2. Purpose
    - Enable spa-facing guided experience
    - Generate professional sales-ready outputs
    - Track leads through sales pipeline
    - Support plan sharing and collaboration

  3. Security
    - Enable RLS on all tables
    - Restrict to authenticated users
*/

-- Create spa_leads table
CREATE TABLE IF NOT EXISTS spa_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Spa identification
  spa_name text NOT NULL,
  location text,
  spa_type text CHECK (spa_type IN ('medspa', 'spa', 'hybrid', 'unknown')),
  
  -- Contact information
  contact_name text,
  contact_email text,
  contact_phone text,
  
  -- Lead tracking
  lead_source text CHECK (lead_source IN ('website', 'referral', 'sales_team', 'event', 'other')),
  lead_status text DEFAULT 'prospect' CHECK (lead_status IN ('prospect', 'in_review', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost', 'on_hold')),
  
  -- Pipeline data
  estimated_value numeric(10,2),
  probability_percent integer CHECK (probability_percent >= 0 AND probability_percent <= 100),
  expected_close_date date,
  
  -- Links to analysis
  spa_menu_id uuid REFERENCES spa_menus(id) ON DELETE SET NULL,
  current_plan_id uuid,
  
  -- Lead metadata
  menu_upload_completed boolean DEFAULT false,
  analysis_completed boolean DEFAULT false,
  plan_generated boolean DEFAULT false,
  
  -- Sales rep assignment
  assigned_to text,
  
  -- Admin notes
  internal_notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON spa_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON spa_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_spa_menu ON spa_leads(spa_menu_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON spa_leads(created_at DESC);

ALTER TABLE spa_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage leads"
  ON spa_leads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create plan_outputs table
CREATE TABLE IF NOT EXISTS plan_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  spa_lead_id uuid NOT NULL REFERENCES spa_leads(id) ON DELETE CASCADE,
  spa_menu_id uuid NOT NULL REFERENCES spa_menus(id) ON DELETE CASCADE,
  rollout_plan_id uuid REFERENCES phased_rollout_plans(id) ON DELETE SET NULL,
  
  -- Plan metadata
  plan_title text NOT NULL,
  plan_version integer DEFAULT 1,
  plan_status text DEFAULT 'draft' CHECK (plan_status IN ('draft', 'review', 'approved', 'sent', 'archived')),
  
  -- Executive summary
  executive_summary jsonb DEFAULT '{}'::jsonb,
  
  -- Plan sections (structured)
  menu_validation_section jsonb DEFAULT '{}'::jsonb,
  growth_opportunities_section jsonb DEFAULT '{}'::jsonb,
  implementation_roadmap_section jsonb DEFAULT '{}'::jsonb,
  opening_order_section jsonb DEFAULT '{}'::jsonb,
  brand_differentiation_section jsonb DEFAULT '{}'::jsonb,
  data_assumptions_section jsonb DEFAULT '{}'::jsonb,
  
  -- Sharing and export
  shareable_link_token text UNIQUE,
  shareable_link_active boolean DEFAULT false,
  pdf_generated boolean DEFAULT false,
  pdf_url text,
  
  -- Presentation settings
  include_pricing boolean DEFAULT false,
  include_internal_notes boolean DEFAULT false,
  custom_branding jsonb DEFAULT '{}'::jsonb,
  
  -- Generation metadata
  generation_trace jsonb DEFAULT '{}'::jsonb,
  confidence_summary jsonb DEFAULT '{}'::jsonb,
  
  -- Admin management
  approved_by text,
  approved_at timestamptz,
  sent_to_spa_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plan_outputs_lead ON plan_outputs(spa_lead_id);
CREATE INDEX IF NOT EXISTS idx_plan_outputs_menu ON plan_outputs(spa_menu_id);
CREATE INDEX IF NOT EXISTS idx_plan_outputs_status ON plan_outputs(plan_status);
CREATE INDEX IF NOT EXISTS idx_plan_outputs_token ON plan_outputs(shareable_link_token);

ALTER TABLE plan_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage plan outputs"
  ON plan_outputs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create lead_activities table
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  spa_lead_id uuid NOT NULL REFERENCES spa_leads(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type text NOT NULL CHECK (activity_type IN ('note', 'call', 'email', 'meeting', 'proposal_sent', 'follow_up', 'status_change', 'other')),
  activity_title text NOT NULL,
  activity_description text,
  
  -- Scheduling
  activity_date timestamptz DEFAULT now(),
  follow_up_date date,
  follow_up_completed boolean DEFAULT false,
  
  -- Actor
  created_by text NOT NULL,
  
  -- Related entities
  related_plan_id uuid REFERENCES plan_outputs(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_lead ON lead_activities(spa_lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON lead_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_follow_up ON lead_activities(follow_up_date) WHERE follow_up_completed = false;

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage activities"
  ON lead_activities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create plan_sections table (for modular content)
CREATE TABLE IF NOT EXISTS plan_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  plan_output_id uuid NOT NULL REFERENCES plan_outputs(id) ON DELETE CASCADE,
  
  -- Section metadata
  section_key text NOT NULL,
  section_title text NOT NULL,
  section_order integer DEFAULT 0,
  
  -- Content
  section_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Rendering
  include_in_output boolean DEFAULT true,
  section_template text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plan_sections_plan ON plan_sections(plan_output_id);
CREATE INDEX IF NOT EXISTS idx_plan_sections_order ON plan_sections(section_order);

ALTER TABLE plan_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sections"
  ON plan_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add foreign key constraint for current_plan_id in spa_leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'spa_leads_current_plan_id_fkey'
  ) THEN
    ALTER TABLE spa_leads
    ADD CONSTRAINT spa_leads_current_plan_id_fkey
    FOREIGN KEY (current_plan_id) REFERENCES plan_outputs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_spa_leads_updated_at ON spa_leads;
CREATE TRIGGER update_spa_leads_updated_at
  BEFORE UPDATE ON spa_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plan_outputs_updated_at ON plan_outputs;
CREATE TRIGGER update_plan_outputs_updated_at
  BEFORE UPDATE ON plan_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plan_sections_updated_at ON plan_sections;
CREATE TRIGGER update_plan_sections_updated_at
  BEFORE UPDATE ON plan_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_activity_at on spa_leads when activities are added
CREATE OR REPLACE FUNCTION update_lead_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE spa_leads
  SET last_activity_at = NEW.activity_date
  WHERE id = NEW.spa_lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lead_activity ON lead_activities;
CREATE TRIGGER trigger_update_lead_activity
  AFTER INSERT ON lead_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_last_activity();

-- Add helpful comments
COMMENT ON TABLE spa_leads IS 'Prospective spa accounts tracked through sales pipeline with status and contact info';
COMMENT ON TABLE plan_outputs IS 'Generated sales-ready implementation plans with versioning and sharing capabilities';
COMMENT ON TABLE lead_activities IS 'Timeline of interactions, notes, and follow-ups with spa leads';
COMMENT ON TABLE plan_sections IS 'Modular content sections for flexible plan rendering and customization';
COMMENT ON COLUMN plan_outputs.shareable_link_token IS 'Unique token for public read-only access to plan without authentication';
COMMENT ON COLUMN spa_leads.lead_status IS 'Pipeline stage: prospect → in_review → proposal_sent → negotiation → closed_won/lost';
COMMENT ON COLUMN plan_outputs.generation_trace IS 'Complete traceability of data sources and logic used to generate plan';
