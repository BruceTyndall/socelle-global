-- Check if the user exists and their confirmation status
SELECT 
  id, 
  email, 
  confirmed_at, 
  last_sign_in_at, 
  created_at 
FROM auth.users 
WHERE email = 'debvaihello@gmail.com';