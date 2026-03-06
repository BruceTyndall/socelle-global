# Login Setup & Testing Guide

## Overview

The platform now has clear login entry points for all three user roles. Each role has a dedicated portal with proper navigation, logout functionality, and role-appropriate landing pages.

---

## Login Entry Points

### Public Home Page (/)

The homepage now includes a "Already have an account?" section with three clear login options:

1. **Business Login** → `/portal/login`
   - For spas, salons, and service businesses

2. **Brand Login** → `/brand/login`
   - For professional brands and suppliers

3. **Admin Login** → `/admin/login`
   - Platform administration access

---

## Creating Test Accounts

### Quick Method (Recommended)

Use the signup page and then update the role via SQL:

1. **Business User**
   - Go to `/portal/signup`
   - Email: `test-business@platform.dev`
   - Password: `TestPass123!`
   - Fill in business details
   - After signup, run SQL to confirm role:
   ```sql
   UPDATE user_profiles
   SET role = 'business'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'test-business@platform.dev');
   ```

2. **Admin User**
   - Go to `/portal/signup`
   - Email: `test-admin@platform.dev`
   - Password: `TestPass123!`
   - After signup, run SQL to set admin role:
   ```sql
   UPDATE user_profiles
   SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'test-admin@platform.dev');
   ```

3. **Brand User**
   - Go to `/portal/signup`
   - Email: `test-brand@platform.dev`
   - Password: `TestPass123!`
   - After signup, run SQL to set brand role:
   ```sql
   UPDATE user_profiles
   SET role = 'brand',
       brand_id = '00000000-0000-0000-0000-000000000001'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'test-brand@platform.dev');
   ```

### Automated Method

If you have the Supabase service role key:

1. Add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```

2. Run the seed script:
   ```bash
   npx tsx scripts/seedTestUsers.ts
   ```

---

## Test Credentials

Once created, use these credentials to test each portal:

| Role | Email | Password | Login URL | Dashboard |
|------|-------|----------|-----------|-----------|
| **Business** | test-business@platform.dev | TestPass123! | /portal/login | /portal/dashboard |
| **Brand** | test-brand@platform.dev | TestPass123! | /brand/login | /brand/dashboard |
| **Admin** | test-admin@platform.dev | TestPass123! | /admin/login | /admin/inbox |

---

## User Experience Flows

### Business User Flow
1. Visit `/` (home page)
2. Click "Business Login" in the login section
3. Login with credentials
4. Lands on `/portal/dashboard`
5. Has access to:
   - Dashboard
   - My Plans
   - Explore Brands
   - Logout button always visible

### Brand User Flow
1. Visit `/` (home page)
2. Click "Brand Login" in the login section
3. Login with credentials
4. Lands on `/brand/dashboard`
5. Has access to:
   - Dashboard
   - Content Management
   - Submissions
   - Settings
   - Home and Logout buttons in header

### Admin User Flow
1. Visit `/` (home page)
2. Click "Admin Login" in the login section
3. Login with credentials
4. Lands on `/admin/inbox`
5. Has access to:
   - Submissions (Inbox)
   - Ingestion
   - Protocols
   - Products
   - Calendar
   - Mixing Rules
   - Costs
   - Business Rules
   - Schema Health
   - Home and Logout buttons in header

---

## Navigation Features

### All Layouts Include:
- Clear app logo that links to the appropriate "home"
- Visible logout button
- User email/name display
- Link back to public home page

### Role-Specific Homes:
- **Business** → `/portal/dashboard`
- **Brand** → `/brand/dashboard`
- **Admin** → `/admin/inbox`

---

## Protected Routes

Routes require authentication:
- `/portal/dashboard`
- `/portal/plans/*`
- `/brand/*` (all brand portal routes)
- `/admin/*` (all admin routes)

Public routes (no login required):
- `/` (home)
- `/portal` (explore brands)
- `/portal/brands/:slug` (brand detail pages)

---

## Return URL Preservation

When users click "Upload Menu & See Brand Fit" without being logged in:
1. They're redirected to `/portal/login`
2. After successful login, they're automatically sent to `/portal/plans/new`
3. Any query parameters (like `?brand=naturopathica`) are preserved

---

## Troubleshooting

**Can't log in?**
- Verify the user exists in `auth.users`
- Check the role in `user_profiles`
- Ensure email is confirmed (`email_confirmed_at` is set)

**Redirected to wrong dashboard?**
- Check the `role` field in `user_profiles`
- Brand users need `brand_id` set
- Admin users must have `role = 'admin'`

**No navigation visible?**
- Ensure user is authenticated
- Check that the layout is being used (routes in App.tsx)
- Verify protected routes are properly configured

---

## Files Modified

- `src/App.tsx` - Added brand routes
- `src/layouts/BrandLayout.tsx` - New brand portal layout
- `src/pages/brand/Dashboard.tsx` - New brand dashboard
- `src/pages/public/Home.tsx` - Added login section
- `src/components/ProtectedRoute.tsx` - Fixed redirect and return URL
- `src/pages/business/Login.tsx` - Added return URL handling
- `scripts/seedTestUsers.ts` - Test user seeding script
- `scripts/TEST_USERS_README.md` - Detailed setup instructions

---

## Next Steps

1. Create the test accounts using one of the methods above
2. Test login flow for each role
3. Verify navigation works correctly
4. Ensure logout returns to appropriate page
5. Test protected routes and redirects
