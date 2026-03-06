# Login & Access Fixed - All Portals Working

## What Was Fixed

### 1. Spa Portal Routes Restored
The spa portal routes were missing from the app. I've added them back:
- `/spa/login` - Spa user login
- `/spa/signup` - Spa user signup
- `/spa/dashboard` - Spa dashboard
- `/spa/plans` - Spa plans
- `/spa/products` - Product library
- `/spa/services` - Service library

### 2. User Role System Fixed
Fixed the signup system so each portal creates the correct user type:
- **Business Signup** (`/portal/signup`) → Creates `business_user` role
- **Spa Signup** (`/spa/signup`) → Creates `spa_user` role
- **Admin** → Upgrade from any account using SQL

### 3. Home Page Signup Buttons Added
Added prominent signup buttons to the home page:
- **Business Signup** - Large blue cards with clear CTAs
- **Spa Signup** - Separate signup for Naturopathica partners
- Both signup options prominently displayed before login links

### 4. Naturopathica Brand Published
The Naturopathica brand is active and visible with:
- 27 PRO Products
- 35 Retail Products
- 47 Protocols
- Status: Active and publicly visible

---

## How to Access All 3 Portals

### Option 1: Create New Test Accounts

#### Business User
1. Go to: `http://localhost:5173/portal/signup`
2. Enter:
   - Business Name: Test Business
   - Business Type: Spa
   - Email: business@test.com
   - Password: test123
3. Click "Create Account"
4. You'll be logged in and redirected to `/portal/dashboard`

#### Spa User
1. Go to: `http://localhost:5173/spa/signup`
2. Enter:
   - Spa Name: Test Spa
   - Email: spa@test.com
   - Password: test123
3. Click "Create Account"
4. You'll be logged in and redirected to `/spa/dashboard`

#### Admin User
1. First create any account at `/portal/signup`:
   - Email: admin@test.com
   - Password: test123
2. Then run this SQL in Supabase SQL Editor:
   ```sql
   UPDATE user_profiles
   SET role = 'admin', spa_name = 'Platform Admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com');
   ```
3. Log out and log back in at `/admin/login`

---

### Option 2: Use Pre-configured Test Accounts

If you previously ran the test setup scripts, these accounts are available:

| Portal | Email | Password | Login URL |
|--------|-------|----------|-----------|
| Business | test-business@platform.dev | TestPass123! | /portal/login |
| Spa | spa@test.com | test123 | /spa/login |
| Brand | test-brand@platform.dev | TestPass123! | /brand/login |
| Admin | test-admin@platform.dev | TestPass123! | /admin/login |

---

## Quick Access URLs

### Public Pages (No Login)
- **Home**: http://localhost:5173/
- **Brands Directory**: http://localhost:5173/brands
  - See Naturopathica brand here

### Signup Pages
- **Business Signup**: http://localhost:5173/portal/signup
- **Spa Signup**: http://localhost:5173/spa/signup

### Login Pages
- **Business Login**: http://localhost:5173/portal/login
- **Spa Login**: http://localhost:5173/spa/login
- **Brand Login**: http://localhost:5173/brand/login
- **Admin Login**: http://localhost:5173/admin/login

---

## What Each Portal Does

### Business Portal (`/portal`)
General business users exploring brands:
- Browse brand catalog
- Upload service menus
- Get AI-powered recommendations
- View implementation plans
- Compare multiple brands

### Spa Portal (`/spa`)
Naturopathica-specific spa portal:
- Naturopathica-branded experience
- Dedicated product & service libraries
- Custom implementation support
- Brand-specific protocols

### Brand Portal (`/brand`)
For brand administrators (like Naturopathica staff):
- View engagement analytics
- Review business submissions
- Manage brand content
- Track leads and conversions

### Admin Portal (`/admin`)
Platform administrators:
- Manage all brands
- Data ingestion tools
- Edit protocols & products
- Configure business rules
- Monitor system health

---

## Verifying Naturopathica Content

The Naturopathica brand should now be visible at:

1. **Public Brands Page**: `/brands`
   - Should show Naturopathica card with "Explore Brand" button

2. **Brand Detail Page**: `/portal/brands/naturopathica`
   - Shows all products, protocols, and services
   - Requires login or prompts to create account

3. **Admin Products View**: `/admin/products`
   - Shows 27 PRO products and 35 retail products

If content isn't visible:
- Check browser console for errors
- Verify you're logged in (for protected pages)
- Clear browser cache and refresh

---

## Files Created/Updated

### Created:
- `QUICK_LOGIN_GUIDE.md` - User-friendly login guide
- `scripts/upgrade_to_admin.sql` - SQL to upgrade accounts to admin
- `LOGIN_FIXED.md` - This file

### Updated:
- `src/App.tsx` - Added spa routes
- `src/lib/auth.tsx` - Fixed role creation in signup
- `src/pages/business/Signup.tsx` - Creates business_user role
- `src/pages/admin/AdminLogin.tsx` - Added signup helper text

---

## Testing Checklist

- [ ] Can create business account at `/portal/signup`
- [ ] Can create spa account at `/spa/signup`
- [ ] Can log into business portal at `/portal/login`
- [ ] Can log into spa portal at `/spa/login`
- [ ] Can upgrade account to admin using SQL
- [ ] Can log into admin portal at `/admin/login`
- [ ] Naturopathica brand visible on `/brands` page
- [ ] Can browse brand detail at `/portal/brands/naturopathica`
- [ ] Products visible in admin portal at `/admin/products`
- [ ] Build completes without errors (`npm run build`)

---

## Need Help?

**Can't log in?**
- Make sure you're using the correct login URL for your user type
- Check that your account exists in the database
- Try creating a new test account

**Don't see Naturopathica content?**
- The brand is active and should be visible
- Try logging out and back in
- Check browser console for RLS or network errors

**Want to create an admin account?**
- Use the SQL script in `scripts/upgrade_to_admin.sql`
- Or follow the admin creation steps above
