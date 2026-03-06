-- Upgrade an account to admin role
-- Replace 'debvaihello@gmail.com' with the email of the account you want to upgrade

UPDATE user_profiles
SET
  role = 'admin',
  spa_name = 'Platform Administrator'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'debvaihello@gmail.com'
);

-- Verify the upgrade
SELECT
  au.email,
  up.role,
  up.spa_name
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'debvaihello@gmail.com';
