# Testing Guide - Multi-Tenant Platform

## Quick Access URLs

- **Public Homepage:** `http://localhost:5173/`
- **Business Portal:** `http://localhost:5173/spa`
- **Brand Admin Portal:** `http://localhost:5173/admin`
- **Business Login:** `http://localhost:5173/spa/login`
- **Brand Admin Login:** `http://localhost:5173/admin/login`

## Creating Test Accounts

### Method 1: Via Signup Pages

#### Create a Business User Account
1. Go to `http://localhost:5173/spa/signup`
2. Enter:
   - Email: `spa@example.com`
   - Password: `password123`
   - Spa Name: `Test Spa & Wellness`
3. Click "Create Account"
4. You'll be logged in automatically

#### Note About Admin Accounts
Admin accounts cannot be created via signup - they must be created manually in the database.

### Method 2: Manual Database Setup (For Admin Accounts)

Since auth users can only be created through Supabase Auth, you have two options:

#### Option A: Use Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Authentication → Users**
3. Click **Add User**
4. Create admin account:
   - Email: `admin@naturopathica.com`
   - Password: `SecureAdmin123!`
   - Check "Auto Confirm User"
5. Copy the new user's UUID
6. Go to **SQL Editor** and run:

```sql
-- Get the user ID from the auth.users table
SELECT id, email FROM auth.users WHERE email = 'admin@naturopathica.com';

-- Insert the admin profile (replace USER_UUID with the actual UUID)
INSERT INTO user_profiles (id, role, brand_id, spa_name, contact_email)
VALUES (
  'USER_UUID_HERE',
  'admin',
  '00000000-0000-0000-0000-000000000001', -- Naturopathica brand
  'Naturopathica Admin',
  'admin@naturopathica.com'
);
```

#### Option B: Quick SQL Setup (Creates Test Accounts)

Run this in Supabase SQL Editor to check if you have any existing users:

```sql
-- Check existing auth users
SELECT
  u.id,
  u.email,
  u.created_at,
  p.role,
  p.brand_id
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

If you see an existing user with admin role, use those credentials.
If not, you'll need to create one via Option A above.

## Test Account Credentials

Once created, use these credentials:

### Admin Account (Naturopathica Brand)
- **Email:** `admin@naturopathica.com`
- **Password:** `SecureAdmin123!` (or whatever you set)
- **Login URL:** `http://localhost:5173/admin/login`
- **Access:** Full Naturopathica brand content management

### Business User Account
- **Email:** `spa@example.com`
- **Password:** `password123`
- **Login URL:** `http://localhost:5173/spa/login`
- **Access:** View all active brands, create implementation plans

## Platform Navigation

### From Public Homepage (/)
- **Get Started** → Business signup (`/spa/signup`)
- **Business Login** → Business portal login (`/spa/login`)
- **Brand Login** → Brand admin login (`/admin/login`)

### From Business Portal (/spa)
- **Back to Home** → Returns to public homepage
- **Dashboard** → View your plans and analytics
- **My Plans** → See all created plans
- **Service Library** → Browse Naturopathica protocols
- **Product Library** → Browse Naturopathica products
- **Sign Out** → Returns to `/spa`

### From Admin Portal (/admin)
- **Home** → Returns to public homepage
- **Submissions** → View business inquiries and plan submissions
- **Ingestion** → Upload and process protocol/product data
- **Protocols** → Manage Naturopathica protocols
- **Products** → Manage PRO and Retail products
- **Calendar** → Marketing calendar events
- **Mixing Rules** → Protocol combination rules
- **Costs** → Product cost management
- **Business Rules** → Implementation guidelines
- **Schema Health** → Database diagnostics
- **Sign Out** → Returns to `/admin/login`

## Admin Features - File Upload & Data Management

### Ingestion Panel (`/admin/ingestion`)

The ingestion panel allows you to manually upload and process data files:

#### Upload Protocol PDFs
1. Navigate to `/admin/ingestion`
2. Click **"Choose File"** in the Protocol PDFs section
3. Select PDF files containing protocol information
4. Click **"Upload and Extract"**
5. System will:
   - Extract text from PDFs
   - Parse protocol structure
   - Save to `canonical_protocols` table
   - Update related steps and products

#### Upload Pricing Excel
1. In the Pricing Data section
2. Upload Excel/CSV files with:
   - Product names
   - SKUs
   - PRO pricing
   - Retail pricing
   - Cost information
3. System maps to `pro_products` and `retail_products` tables

#### Direct Protocol Entry
Alternatively, use the **Protocols** tab to:
- View existing protocols
- Edit protocol details
- Add new protocols manually
- Manage protocol steps
- Configure product usage

### Current Ingestion Status

The existing implementation includes:
- PDF extraction service (`src/lib/pdfExtractionService.ts`)
- Ingestion service (`src/lib/ingestionService.ts`)
- Manual data entry interfaces
- Bulk upload capabilities

## Testing Workflows

### Workflow 1: Business User Journey
1. Go to public homepage (`/`)
2. Click "Get Started"
3. Sign up with new account
4. Redirected to dashboard
5. Click "Create Your First Plan"
6. Upload service menu
7. View AI-generated recommendations
8. Navigate back home via "Back to Home" link

### Workflow 2: Admin Content Management
1. Log in at `/admin/login`
2. Go to Ingestion panel
3. Upload protocol PDFs
4. Navigate to Protocols tab
5. Review extracted data
6. Edit/refine protocol details
7. Publish to make available to businesses
8. Return home via "Home" link

### Workflow 3: Multi-Tenant Isolation Test
1. Create second brand (manual SQL):
```sql
INSERT INTO brands (name, slug, status, description)
VALUES (
  'Test Brand',
  'test-brand',
  'active',
  'A test brand for multi-tenancy verification'
);
```

2. Create brand admin for Test Brand:
```sql
-- After creating auth user in dashboard
INSERT INTO user_profiles (id, role, brand_id, spa_name, contact_email)
VALUES (
  'NEW_USER_UUID',
  'brand_admin',
  (SELECT id FROM brands WHERE slug = 'test-brand'),
  'Test Brand Admin',
  'admin@testbrand.com'
);
```

3. Log in as Test Brand admin
4. Verify you ONLY see Test Brand data
5. Log in as Naturopathica admin
6. Verify you ONLY see Naturopathica data
7. Log in as business user
8. Verify you see ALL active brands

## Troubleshooting

### Can't Log In
- Check that user exists in `auth.users` table
- Verify `user_profiles` entry exists with matching UUID
- Confirm password is correct
- Check browser console for errors

### Admin Can't See Data
- Verify `brand_id` is set in user_profiles
- Check that brand exists in `brands` table
- Confirm RLS policies are active:
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('canonical_protocols', 'pro_products', 'retail_products')
ORDER BY tablename, policyname;
```

### Business User Can't See Protocols
- Check that brands status is 'active':
```sql
UPDATE brands SET status = 'active' WHERE slug = 'naturopathica';
```
- Verify protocols have correct brand_id:
```sql
SELECT id, name, brand_id FROM canonical_protocols LIMIT 5;
```

### Navigation Issues
- Clear browser cache
- Check that routes are correctly mounted in App.tsx
- Verify layout components render properly

## Database Inspection Queries

### View All Users and Roles
```sql
SELECT
  up.id,
  au.email,
  up.role,
  b.name as brand_name,
  up.spa_name
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
LEFT JOIN brands b ON up.brand_id = b.id
ORDER BY up.role, au.email;
```

### View Brand Content Summary
```sql
SELECT
  b.name as brand,
  b.status,
  COUNT(DISTINCT cp.id) as protocols,
  COUNT(DISTINCT pp.id) as pro_products,
  COUNT(DISTINCT rp.id) as retail_products
FROM brands b
LEFT JOIN canonical_protocols cp ON b.id = cp.brand_id
LEFT JOIN pro_products pp ON b.id = pp.brand_id
LEFT JOIN retail_products rp ON b.id = rp.brand_id
GROUP BY b.id, b.name, b.status
ORDER BY b.name;
```

### Check RLS Policy Access
```sql
-- As admin user
SET ROLE authenticated;
SELECT id, name, brand_id FROM canonical_protocols LIMIT 5;

-- Should only see your brand's protocols
```

## Next Steps

1. **Create your admin account** using Supabase Dashboard
2. **Create a test business user** via signup page
3. **Upload some test protocols** via ingestion panel
4. **Test navigation** between portals
5. **Verify RLS isolation** by creating second brand

## Need Help?

Check these files for implementation details:
- Auth: `src/lib/auth.tsx`
- Routing: `src/App.tsx`
- RLS Policies: `supabase/migrations/*_rls_*.sql`
- Ingestion: `src/components/IngestionView.tsx`
