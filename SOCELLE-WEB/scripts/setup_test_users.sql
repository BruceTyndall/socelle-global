-- =========================================
-- Test User Setup Script
-- =========================================
-- Run this AFTER creating the three test accounts via signup
--
-- Prerequisites:
-- 1. Sign up at /portal/signup with: test-business@platform.dev / TestPass123!
-- 2. Sign up at /portal/signup with: test-brand@platform.dev / TestPass123!
-- 3. Sign up at /portal/signup with: test-admin@platform.dev / TestPass123!
--
-- Then run this script in Supabase SQL Editor
-- =========================================

-- Create business record for Business User and update profile
DO $$
DECLARE
  business_user_id uuid;
  new_business_id uuid;
BEGIN
  -- Get the business user ID
  SELECT id INTO business_user_id
  FROM auth.users
  WHERE email = 'test-business@platform.dev';

  IF business_user_id IS NOT NULL THEN
    -- Create business record
    INSERT INTO businesses (id, name, type, location, created_by_user_id)
    VALUES (
      gen_random_uuid(),
      'Serenity Spa & Wellness',
      'spa',
      'Test Location',
      business_user_id
    )
    RETURNING id INTO new_business_id;

    -- Update user profile
    UPDATE user_profiles
    SET role = 'business',
        spa_name = 'Serenity Spa & Wellness',
        business_id = new_business_id
    WHERE id = business_user_id;

    RAISE NOTICE 'Business user configured successfully';
  ELSE
    RAISE NOTICE 'Business user not found - make sure to sign up first at /portal/signup';
  END IF;
END $$;

-- Update Brand User
DO $$
DECLARE
  brand_user_id uuid;
BEGIN
  SELECT id INTO brand_user_id
  FROM auth.users
  WHERE email = 'test-brand@platform.dev';

  IF brand_user_id IS NOT NULL THEN
    UPDATE user_profiles
    SET role = 'brand',
        brand_id = '00000000-0000-0000-0000-000000000001',
        spa_name = 'Naturopathica Brand'
    WHERE id = brand_user_id;

    RAISE NOTICE 'Brand user configured successfully';
  ELSE
    RAISE NOTICE 'Brand user not found - make sure to sign up first at /portal/signup';
  END IF;
END $$;

-- Update Admin User
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'test-admin@platform.dev';

  IF admin_user_id IS NOT NULL THEN
    UPDATE user_profiles
    SET role = 'admin',
        spa_name = 'Platform Admin'
    WHERE id = admin_user_id;

    RAISE NOTICE 'Admin user configured successfully';
  ELSE
    RAISE NOTICE 'Admin user not found - make sure to sign up first at /portal/signup';
  END IF;
END $$;

-- Verify the setup
SELECT
  u.email,
  p.role,
  p.spa_name,
  p.brand_id,
  b.name as business_name,
  CASE
    WHEN u.email = 'test-business@platform.dev' THEN 'Login at: /portal/login'
    WHEN u.email = 'test-brand@platform.dev' THEN 'Login at: /brand/login'
    WHEN u.email = 'test-admin@platform.dev' THEN 'Login at: /admin/login'
  END as login_url
FROM auth.users u
JOIN user_profiles p ON p.id = u.id
LEFT JOIN businesses b ON b.id = p.business_id
WHERE u.email IN ('test-business@platform.dev', 'test-brand@platform.dev', 'test-admin@platform.dev')
ORDER BY u.email;
