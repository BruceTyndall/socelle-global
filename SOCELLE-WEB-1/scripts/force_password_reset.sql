-- Manually set the password for the admin user
-- NOTE: This only works if you have pgcrypto extension enabled, which Supabase does by default for auth.
-- However, auth.users usually requires using the Supabase API to hash passwords correctly (bcrypt).
-- SQL updates to encrypted_password directly are risky if the hashing algorithm doesn't match perfectly.

-- SAFE METHOD: Update the user's password using the Supabase GoTrue API logic
-- But since we can't run GoTrue logic from here, we will use the pgcrypto extension if available.

UPDATE auth.users
SET encrypted_password = crypt('Thailand1990!!', gen_salt('bf'))
WHERE email = 'debvaihello@gmail.com';

-- Verify the update
SELECT email, encrypted_password, updated_at
FROM auth.users
WHERE email = 'debvaihello@gmail.com';