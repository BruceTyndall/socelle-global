-- Grant admin access to Bruce's account and verify
-- Run in Supabase SQL Editor for your project

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'bruetyndallprofessional@gmail.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth.users record found for bruetyndallprofessional@gmail.com. Sign up first at /portal/signup.';
  END IF;

  INSERT INTO user_profiles (id, role, spa_name, contact_email)
  VALUES (target_user_id, 'admin', 'Platform Administrator', 'bruetyndallprofessional@gmail.com')
  ON CONFLICT (id)
  DO UPDATE
  SET role = 'admin',
      spa_name = COALESCE(user_profiles.spa_name, 'Platform Administrator'),
      contact_email = COALESCE(user_profiles.contact_email, 'bruetyndallprofessional@gmail.com'),
      updated_at = now();
END $$;

SELECT
  au.email,
  up.role,
  up.brand_id,
  up.business_id,
  up.updated_at
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'bruetyndallprofessional@gmail.com';
