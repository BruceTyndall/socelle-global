/*
  # Create User Profiles and Plan Submissions Schema

  1. Purpose
    - Separate spa users from admin users via role-based access
    - Track plan submissions tied to individual spa user accounts
    - Enable returning users to access their saved work
    - Support admin review workflow for submissions

  2. New Tables
    
    **user_profiles**
    - id (uuid, FK to auth.users)
    - role (enum: 'spa_user', 'admin')
    - spa_name (text, nullable) - Spa/business name for spa users
    - contact_email (text, nullable)
    - contact_phone (text, nullable)
    - created_at (timestamptz)
    - updated_at (timestamptz)
    
    **plan_submissions**
    - id (uuid, PK)
    - user_id (uuid, FK to auth.users) - Who created this submission
    - submission_status (enum: 'draft', 'submitted', 'under_review', 'approved', 'completed')
    - spa_name (text) - Spa business name
    - spa_type (enum: 'medspa', 'spa', 'hybrid')
    - spa_location (text, nullable)
    - contact_name (text, nullable)
    - contact_email (text, nullable)
    - contact_phone (text, nullable)
    - menu_uploaded (boolean, default false)
    - menu_file_url (text, nullable)
    - spa_menu_id (uuid, nullable, FK to spa_menus) - Links to parsed menu
    - analysis_completed (boolean, default false)
    - plan_generated (boolean, default false)
    - plan_output_id (uuid, nullable, FK to plan_outputs)
    - admin_notes (text, nullable)
    - last_viewed_by_admin (uuid, nullable)
    - last_viewed_at (timestamptz, nullable)
    - created_at (timestamptz)
    - updated_at (timestamptz)

    **admin_activity_log**
    - id (uuid, PK)
    - submission_id (uuid, FK to plan_submissions)
    - admin_user_id (uuid, FK to auth.users)
    - activity_type (text) - 'status_change', 'note_added', 'viewed', 'exported'
    - activity_details (jsonb, nullable)
    - created_at (timestamptz)

  3. Security (RLS Policies)
    
    **user_profiles**
    - Users can read/update their own profile
    - Admins can read all profiles
    
    **plan_submissions**
    - Spa users can read/write only their own submissions (user_id = auth.uid())
    - Admins can read/write all submissions
    
    **admin_activity_log**
    - Only admins can read/write
    - Spa users cannot access

  4. Indexes
    - user_profiles.role (for role filtering)
    - plan_submissions.user_id (for user's submission lookup)
    - plan_submissions.submission_status (for admin inbox filtering)
    - admin_activity_log.submission_id (for activity timeline)

  5. Notes
    - This replaces the current "spa_leads" approach for the spa-facing portal
    - Existing spa_leads table remains for admin-initiated pipeline management
    - plan_submissions are user-initiated, spa_leads are admin-managed
*/

-- Create role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('spa_user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create submission status enum
DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'spa_user',
  spa_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create plan_submissions table
CREATE TABLE IF NOT EXISTS plan_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_status submission_status DEFAULT 'draft',
  spa_name text NOT NULL,
  spa_type spa_type_enum DEFAULT 'spa',
  spa_location text,
  contact_name text,
  contact_email text,
  contact_phone text,
  menu_uploaded boolean DEFAULT false,
  menu_file_url text,
  spa_menu_id uuid REFERENCES spa_menus(id) ON DELETE SET NULL,
  analysis_completed boolean DEFAULT false,
  plan_generated boolean DEFAULT false,
  plan_output_id uuid REFERENCES plan_outputs(id) ON DELETE SET NULL,
  admin_notes text,
  last_viewed_by_admin uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES plan_submissions(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_plan_submissions_user_id ON plan_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_submissions_status ON plan_submissions(submission_status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_submission_id ON admin_activity_log(submission_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- RLS Policies for plan_submissions

-- Spa users can read their own submissions
CREATE POLICY "Users can view own submissions"
  ON plan_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Spa users can create submissions
CREATE POLICY "Users can create submissions"
  ON plan_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Spa users can update their own submissions
CREATE POLICY "Users can update own submissions"
  ON plan_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all submissions
CREATE POLICY "Admins can view all submissions"
  ON plan_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Admins can update all submissions
CREATE POLICY "Admins can update all submissions"
  ON plan_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- RLS Policies for admin_activity_log

-- Only admins can read activity log
CREATE POLICY "Admins can view activity log"
  ON admin_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Only admins can insert activity log
CREATE POLICY "Admins can create activity log"
  ON admin_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DO $$ BEGIN
  CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_plan_submissions_updated_at
    BEFORE UPDATE ON plan_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add helpful comments
COMMENT ON TABLE user_profiles IS 'User authentication profiles with role-based access (spa_user or admin)';
COMMENT ON TABLE plan_submissions IS 'Spa user-initiated plan submissions tracked through the workflow';
COMMENT ON TABLE admin_activity_log IS 'Audit trail of admin actions on submissions';
