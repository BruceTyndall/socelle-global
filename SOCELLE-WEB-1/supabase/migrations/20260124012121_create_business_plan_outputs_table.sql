/*
  # Create Business Plan Outputs Table

  1. New Table
    - `business_plan_outputs` - Simplified outputs for business portal plans
      - `id` (uuid, primary key)
      - `plan_id` (uuid, references plans)
      - `output_type` (text: overview, protocol_matches, gaps, retail_attach, activation_assets)
      - `output_data` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can only access outputs for their own plans

  Note: The existing plan_outputs table is for the admin/spa system.
  This new table is specifically for the business portal plan wizard flow.
*/

CREATE TABLE IF NOT EXISTS business_plan_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  output_type text NOT NULL,
  output_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_plan_outputs_plan ON business_plan_outputs(plan_id);
CREATE INDEX IF NOT EXISTS idx_business_plan_outputs_type ON business_plan_outputs(plan_id, output_type);

ALTER TABLE business_plan_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business plan outputs"
  ON business_plan_outputs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = business_plan_outputs.plan_id 
      AND plans.business_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own business plan outputs"
  ON business_plan_outputs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = business_plan_outputs.plan_id 
      AND plans.business_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own business plan outputs"
  ON business_plan_outputs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = business_plan_outputs.plan_id 
      AND plans.business_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = business_plan_outputs.plan_id 
      AND plans.business_user_id = auth.uid()
    )
  );
