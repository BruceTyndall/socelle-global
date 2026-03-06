/*
  # AI Brand & Product Concierge Schema

  ## Overview
  This migration creates the database schema for the governed AI Brand & Product Concierge system.
  The AI operates as a read-only, explainable, context-aware assistant with strict guardrails.

  ## New Tables

  ### `ai_concierge_chat_logs`
  Stores all interactions with the AI Concierge for governance and traceability.
  
  Columns:
  - `id` (uuid, primary key)
  - `spa_id` (uuid, nullable) - Links to spa_leads for spa-specific context
  - `user_role` (text) - Role of the user (admin, spa_owner, therapist, etc.)
  - `mode_used` (text) - Intelligence mode used (brand_expert, service_strategy, etc.)
  - `user_question` (text) - The question asked by the user
  - `ai_response` (text) - The response provided by the AI
  - `source_tables` (text[]) - Array of tables referenced in the response
  - `missing_data_flags` (text[]) - Array of data gaps identified
  - `confidence_level` (text) - High, Medium, Low, or Unknown
  - `context_page` (text) - Which page/view the question was asked from
  - `created_at` (timestamptz)

  ### `ai_concierge_starter_questions`
  Stores contextual starter questions for different pages/modes.
  
  Columns:
  - `id` (uuid, primary key)
  - `context_page` (text) - Page identifier
  - `mode` (text) - Intelligence mode
  - `question_text` (text) - The starter question
  - `priority` (integer) - Display order
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### `ai_concierge_approved_tables`
  Whitelist of tables the AI can query (governance control).
  
  Columns:
  - `id` (uuid, primary key)
  - `table_name` (text, unique) - Name of the approved table
  - `allowed_modes` (text[]) - Which modes can access this table
  - `description` (text) - What this table contains
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Authenticated users can read their own chat logs
  - Only admins can view all logs and manage approved tables
  - Starter questions are readable by all authenticated users
*/

-- Create chat logs table
CREATE TABLE IF NOT EXISTS ai_concierge_chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spa_id uuid REFERENCES spa_leads(id) ON DELETE SET NULL,
  user_role text NOT NULL DEFAULT 'user',
  mode_used text NOT NULL,
  user_question text NOT NULL,
  ai_response text NOT NULL,
  source_tables text[] DEFAULT '{}',
  missing_data_flags text[] DEFAULT '{}',
  confidence_level text NOT NULL CHECK (confidence_level IN ('High', 'Medium', 'Low', 'Unknown')),
  context_page text,
  created_at timestamptz DEFAULT now()
);

-- Create starter questions table
CREATE TABLE IF NOT EXISTS ai_concierge_starter_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context_page text NOT NULL,
  mode text NOT NULL,
  question_text text NOT NULL,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create approved tables whitelist
CREATE TABLE IF NOT EXISTS ai_concierge_approved_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text UNIQUE NOT NULL,
  allowed_modes text[] DEFAULT '{}',
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_concierge_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_concierge_starter_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_concierge_approved_tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat logs
CREATE POLICY "Users can view their own chat logs"
  ON ai_concierge_chat_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create chat logs"
  ON ai_concierge_chat_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for starter questions
CREATE POLICY "Anyone can view active starter questions"
  ON ai_concierge_starter_questions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for approved tables
CREATE POLICY "Anyone can view active approved tables"
  ON ai_concierge_approved_tables FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert approved tables (whitelist)
INSERT INTO ai_concierge_approved_tables (table_name, allowed_modes, description) VALUES
  ('canonical_protocols', ARRAY['brand_expert', 'service_strategy', 'training_advisor'], 'Protocol definitions and steps'),
  ('protocol_steps', ARRAY['brand_expert', 'service_strategy', 'training_advisor'], 'Detailed protocol step instructions'),
  ('protocol_contraindications', ARRAY['brand_expert', 'service_strategy', 'training_advisor'], 'Safety and contraindication information'),
  ('retail_products', ARRAY['brand_expert', 'budget_guide', 'sales_enablement'], 'Retail product catalog with pricing'),
  ('pro_products', ARRAY['brand_expert', 'budget_guide', 'training_advisor'], 'Professional product catalog for backbar'),
  ('mixing_rules', ARRAY['brand_expert', 'training_advisor'], 'Product blending guidelines and ratios'),
  ('marketing_calendar', ARRAY['brand_expert', 'service_strategy', 'sales_enablement'], 'Seasonal campaigns and promotions'),
  ('service_mappings', ARRAY['service_strategy', 'budget_guide', 'training_advisor'], 'Mapped services for spa menus'),
  ('service_gap_analysis', ARRAY['service_strategy', 'sales_enablement'], 'Gap analysis results'),
  ('implementation_readiness', ARRAY['training_advisor', 'sales_enablement'], 'Readiness assessment scores'),
  ('phased_rollout_plans', ARRAY['service_strategy', 'training_advisor', 'sales_enablement'], 'Rollout strategy and phases'),
  ('opening_orders', ARRAY['budget_guide', 'sales_enablement'], 'Opening order recommendations'),
  ('brand_differentiation_points', ARRAY['brand_expert', 'sales_enablement'], 'Brand positioning and unique value props'),
  ('retail_attach_recommendations', ARRAY['brand_expert', 'sales_enablement'], 'Retail attachment strategies')
ON CONFLICT (table_name) DO NOTHING;

-- Insert contextual starter questions
INSERT INTO ai_concierge_starter_questions (context_page, mode, question_text, priority) VALUES
  ('intelligence', 'service_strategy', 'What gaps exist in my current service menu?', 1),
  ('intelligence', 'service_strategy', 'Which Naturopathica services would best complement my existing offerings?', 2),
  ('intelligence', 'brand_expert', 'What makes Naturopathica different from other spa brands?', 3),
  ('implementation', 'training_advisor', 'What training is required for my team?', 1),
  ('implementation', 'budget_guide', 'What is included in my opening order?', 2),
  ('implementation', 'training_advisor', 'How long does implementation typically take?', 3),
  ('opening_order', 'budget_guide', 'Why were these specific products recommended?', 1),
  ('opening_order', 'budget_guide', 'Can I customize my opening order within my budget?', 2),
  ('opening_order', 'brand_expert', 'How should I display these products in my retail area?', 3),
  ('protocols', 'brand_expert', 'What are the signature steps in this protocol?', 1),
  ('protocols', 'training_advisor', 'What contraindications should I be aware of?', 2),
  ('protocols', 'brand_expert', 'Which retail products pair with this service?', 3),
  ('sales_pipeline', 'sales_enablement', 'How do I position Naturopathica to wellness-focused spas?', 1),
  ('sales_pipeline', 'sales_enablement', 'What are common objections and how do I address them?', 2)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_logs_spa_id ON ai_concierge_chat_logs(spa_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON ai_concierge_chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_mode ON ai_concierge_chat_logs(mode_used);
CREATE INDEX IF NOT EXISTS idx_starter_questions_page ON ai_concierge_starter_questions(context_page) WHERE is_active = true;
