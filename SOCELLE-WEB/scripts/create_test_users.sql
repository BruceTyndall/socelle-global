/*
  # Create Test Users for Platform Testing

  Creates three test users with different roles:
  1. Business User (spa_user role)
  2. Brand Admin (brand_admin role)
  3. Platform Admin (admin role)

  ## Test User Credentials
  - Business: test-business@platform.dev / TestPass123!
  - Brand: test-brand@platform.dev / TestPass123!
  - Admin: test-admin@platform.dev / TestPass123!

  ## Important Notes
  - This script creates users directly in auth.users (requires service role key)
  - Run this script using Supabase SQL editor with service role permissions
  - Passwords are hashed using pgcrypto crypt function
  - Each user gets a corresponding profile in user_profiles table
*/

-- Create test business user (spa_user)
DO $$
DECLARE
  business_user_id uuid := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = business_user_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      business_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test-business@platform.dev',
      crypt('TestPass123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Insert or update user profile
  INSERT INTO user_profiles (
    id,
    role,
    spa_name,
    contact_email,
    created_at,
    updated_at
  ) VALUES (
    business_user_id,
    'spa_user',
    'Test Spa & Wellness',
    'test-business@platform.dev',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'spa_user',
    spa_name = 'Test Spa & Wellness',
    contact_email = 'test-business@platform.dev',
    updated_at = NOW();
END $$;

-- Create test brand admin user
DO $$
DECLARE
  brand_user_id uuid := 'b0000000-0000-0000-0000-000000000001';
  naturopathica_brand_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = brand_user_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      brand_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test-brand@platform.dev',
      crypt('TestPass123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Insert or update user profile
  INSERT INTO user_profiles (
    id,
    role,
    brand_id,
    contact_email,
    created_at,
    updated_at
  ) VALUES (
    brand_user_id,
    'brand_admin',
    naturopathica_brand_id,
    'test-brand@platform.dev',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'brand_admin',
    brand_id = naturopathica_brand_id,
    contact_email = 'test-brand@platform.dev',
    updated_at = NOW();
END $$;

-- Create test admin user
DO $$
DECLARE
  admin_user_id uuid := 'c0000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test-admin@platform.dev',
      crypt('TestPass123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Insert or update user profile
  INSERT INTO user_profiles (
    id,
    role,
    contact_email,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin',
    'test-admin@platform.dev',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    contact_email = 'test-admin@platform.dev',
    updated_at = NOW();
END $$;

-- Verify test users were created
SELECT
  u.email,
  p.role,
  p.spa_name,
  p.brand_id,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Not Confirmed'
  END as email_status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email LIKE 'test-%@platform.dev'
ORDER BY u.email;
