# Quick Test User Setup

## Step 1: Create the Accounts via Signup

Open three browser tabs/windows and sign up:

### Tab 1: Business User
1. Go to `/portal/signup`
2. Fill in:
   - Email: `test-business@platform.dev`
   - Password: `TestPass123!`
   - Business Name: `Serenity Spa & Wellness`
   - Complete signup

### Tab 2: Brand User
1. Go to `/portal/signup`
2. Fill in:
   - Email: `test-brand@platform.dev`
   - Password: `TestPass123!`
   - Business Name: `Naturopathica Brand`
   - Complete signup

### Tab 3: Admin User
1. Go to `/portal/signup`
2. Fill in:
   - Email: `test-admin@platform.dev`
   - Password: `TestPass123!`
   - Business Name: `Admin User`
   - Complete signup

---

## Step 2: Set Roles via SQL

After all three accounts are created, run this SQL in your Supabase SQL Editor:

```sql
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
  END IF;
END $$;

-- Update Brand User
UPDATE user_profiles
SET role = 'brand',
    brand_id = '00000000-0000-0000-0000-000000000001',
    spa_name = 'Naturopathica Brand'
WHERE id = (SELECT id FROM auth.users WHERE email = 'test-brand@platform.dev');

-- Update Admin User
UPDATE user_profiles
SET role = 'admin',
    spa_name = 'Platform Admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'test-admin@platform.dev');

-- Verify the setup
SELECT
  u.email,
  p.role,
  p.spa_name,
  p.brand_id,
  b.name as business_name
FROM auth.users u
JOIN user_profiles p ON p.id = u.id
LEFT JOIN businesses b ON b.id = p.business_id
WHERE u.email IN ('test-business@platform.dev', 'test-brand@platform.dev', 'test-admin@platform.dev')
ORDER BY u.email;
```

You should see output like:
- test-admin@platform.dev | admin | Platform Admin | null | null
- test-brand@platform.dev | brand | Naturopathica Brand | 00000000-0000-0000-0000-000000000001 | null
- test-business@platform.dev | business | Serenity Spa & Wellness | null | Serenity Spa & Wellness

---

## Step 3: Test Login

Now you can log in with these accounts:

| Role | Email | Password | Login Page | Lands On |
|------|-------|----------|------------|----------|
| **Business** | test-business@platform.dev | TestPass123! | /portal/login | /portal/dashboard |
| **Brand** | test-brand@platform.dev | TestPass123! | /brand/login | /brand/dashboard |
| **Admin** | test-admin@platform.dev | TestPass123! | /admin/login | /admin/inbox |

---

## Quick Access Links

- Business Login: http://localhost:5173/portal/login
- Brand Login: http://localhost:5173/brand/login
- Admin Login: http://localhost:5173/admin/login
- Public Home: http://localhost:5173/

---

## Expected Behavior

✅ **Business User** should see:
- Business Portal navigation
- Dashboard with stats
- My Plans section
- Explore Brands

✅ **Brand User** should see:
- Brand Portal navigation
- Dashboard with activity
- Content, Submissions, Settings tabs

✅ **Admin User** should see:
- Admin navigation
- Submissions inbox
- All admin tools (Ingestion, Protocols, etc.)

✅ **All users** should have:
- Clear logout button
- Link back to home
- No dead ends or missing navigation
