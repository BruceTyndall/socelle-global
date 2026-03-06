/*
  # Create Plans and Menu Uploads Tables

  1. New Tables
    - `plans` - User implementation plans
    - `menu_uploads` - Raw menu data and parsing

  2. Security
    - Enable RLS on all tables
    - Business users can only access their own plans
*/

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_user_id uuid REFERENCES auth.users(id) NOT NULL,
  brand_id uuid REFERENCES brands(id) NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_uploads table
CREATE TABLE IF NOT EXISTS menu_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  source_type text NOT NULL,
  file_path text,
  raw_text text NOT NULL,
  parsed_services jsonb,
  extraction_meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(business_user_id);
CREATE INDEX IF NOT EXISTS idx_plans_brand ON plans(brand_id);
CREATE INDEX IF NOT EXISTS idx_menu_uploads_plan ON menu_uploads(plan_id);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_uploads ENABLE ROW LEVEL SECURITY;

-- Plans RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Users can view own plans'
  ) THEN
    CREATE POLICY "Users can view own plans"
      ON plans FOR SELECT
      TO authenticated
      USING (auth.uid() = business_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Users can create own plans'
  ) THEN
    CREATE POLICY "Users can create own plans"
      ON plans FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = business_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Users can update own plans'
  ) THEN
    CREATE POLICY "Users can update own plans"
      ON plans FOR UPDATE
      TO authenticated
      USING (auth.uid() = business_user_id)
      WITH CHECK (auth.uid() = business_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Users can delete own plans'
  ) THEN
    CREATE POLICY "Users can delete own plans"
      ON plans FOR DELETE
      TO authenticated
      USING (auth.uid() = business_user_id);
  END IF;
END $$;

-- Menu Uploads RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'menu_uploads' AND policyname = 'Users can view own menu uploads'
  ) THEN
    CREATE POLICY "Users can view own menu uploads"
      ON menu_uploads FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM plans 
          WHERE plans.id = menu_uploads.plan_id 
          AND plans.business_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'menu_uploads' AND policyname = 'Users can create own menu uploads'
  ) THEN
    CREATE POLICY "Users can create own menu uploads"
      ON menu_uploads FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM plans 
          WHERE plans.id = menu_uploads.plan_id 
          AND plans.business_user_id = auth.uid()
        )
      );
  END IF;
END $$;
