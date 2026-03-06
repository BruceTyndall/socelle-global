/*
  # Add Auto Profile Creation System

  1. Changes
    - Add email column to user_profiles table
    - Create handle_new_user() trigger function
    - Create trigger on auth.users for automatic profile creation
    - Add RLS policy to allow profile insertion

  2. Purpose
    - Automatically create user_profiles when users sign up
    - Store user email in profiles for easy access
    - Fix login failures caused by missing profiles

  3. Security
    - Trigger runs with SECURITY DEFINER to bypass RLS
    - INSERT policy allows profile creation via trigger
*/

-- Add email column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create trigger function for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Drop old restrictive insert policy if it exists
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;

-- Create new insert policy that allows trigger to work
CREATE POLICY "Allow profile insert"
ON user_profiles
FOR INSERT
WITH CHECK (true);

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates user_profiles entry when new user signs up';
