# Test Users Setup Guide

This guide provides instructions for creating and using test users for the Brand Platform.

## Test User Credentials

### Business User (Service Provider)
- **Email:** `test-business@platform.dev`
- **Password:** `TestPass123!`
- **Role:** `spa_user`
- **Portal:** `/portal`
- **Access:** Business portal, brand discovery, plan creation

### Brand User (Brand Partner)
- **Email:** `test-brand@platform.dev`
- **Password:** `TestPass123!`
- **Role:** `brand_admin`
- **Portal:** `/brand`
- **Access:** Brand management, content, submissions
- **Associated Brand:** Naturopathica

### Admin User (Platform Administrator)
- **Email:** `test-admin@platform.dev`
- **Password:** `TestPass123!`
- **Role:** `admin`
- **Portal:** `/admin`
- **Access:** Full platform administration, data ingestion, protocol management

---

## Setup Method: SQL Script (Recommended)

This method creates test users directly in the database using SQL.

### Prerequisites
- Access to Supabase SQL Editor
- Service role permissions (admin access)

### Steps

1. **Navigate to Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run the Script**
   - Open `scripts/create_test_users.sql`
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Verify Creation**
   - The script includes a verification query at the end
   - You should see three users listed:
     - test-business@platform.dev (spa_user)
     - test-brand@platform.dev (brand_admin)
     - test-admin@platform.dev (admin)

4. **Test Login**
   - Go to appropriate login page:
     - Business: http://localhost:5173/portal/login
     - Brand: http://localhost:5173/brand/login
     - Admin: http://localhost:5173/admin/login
   - Use credentials above

---

## What Each User Can Do

### Business User (`test-business@platform.dev`)

**Accessible Routes:**
- `/portal` - Browse published brands
- `/portal/dashboard` - View dashboard
- `/portal/plans` - View created plans
- `/portal/plans/new` - Upload menu and create new plan
- `/portal/brands/:slug` - View brand details

**Key Features:**
- Browse Naturopathica and other published brands
- Upload service menu
- Get AI-powered brand fit analysis
- View protocol recommendations
- See retail attach opportunities
- Access implementation plans

### Brand User (`test-brand@platform.dev`)

**Accessible Routes:**
- `/brand/dashboard` - Brand dashboard with metrics
- `/brand/content` - Manage brand content (placeholder)
- `/brand/submissions` - View submissions (placeholder)
- `/brand/settings` - Brand settings (placeholder)

**Key Features:**
- View brand performance metrics
- Manage product catalog
- Review business submissions
- Track engagement

**Note:** This user is associated with Naturopathica brand

### Admin User (`test-admin@platform.dev`)

**Accessible Routes:**
- `/admin/inbox` - View all submissions
- `/admin/ingestion` - Data ingestion tools
- `/admin/protocols` - Manage protocols
- `/admin/products` - Manage PRO and retail products
- `/admin/calendar` - Marketing calendar management
- `/admin/mixing` - Mixing rules configuration
- `/admin/costs` - Cost management
- `/admin/rules` - Business rules configuration
- `/admin/health` - Schema health monitoring

**Key Features:**
- Full data access
- Protocol ingestion from PDFs/Word docs
- Product management
- Business rules configuration
- System health monitoring

---

## Testing Workflows

### Business User Flow

1. **Brand Discovery**
   ```
   Login → /portal → Browse Naturopathica → View Details
   ```

2. **Menu Upload & Analysis**
   ```
   Login → /portal/plans/new → Upload Menu → Select Brand → Get Analysis
   ```

3. **View Results**
   ```
   Login → /portal/plans → Click Plan → View Recommendations
   ```

### Brand User Flow

1. **Dashboard Overview**
   ```
   Login → /brand/dashboard → View Metrics
   ```

2. **Manage Content**
   ```
   Login → /brand/content → View/Edit Brand Content
   ```

### Admin User Flow

1. **Review Submissions**
   ```
   Login → /admin/inbox → Review Business Submissions
   ```

2. **Ingest Protocol Data**
   ```
   Login → /admin/ingestion → Upload PDF → Extract Protocols
   ```

3. **Monitor System**
   ```
   Login → /admin/health → Check Schema Status
   ```

---

## Troubleshooting

### Users Not Created

If the SQL script fails:

1. **Check Permissions**
   - Ensure you're using service role key
   - Verify admin access to auth schema

2. **Check for Conflicts**
   - Users might already exist
   - Script uses `ON CONFLICT DO UPDATE` for profiles
   - For auth.users, it checks `IF NOT EXISTS`

3. **Manual Verification**
   ```sql
   -- Check if users exist
   SELECT email, id FROM auth.users
   WHERE email LIKE 'test-%@platform.dev';

   -- Check if profiles exist
   SELECT id, role, spa_name FROM user_profiles
   WHERE contact_email LIKE 'test-%@platform.dev';
   ```

### Login Fails

1. **Verify Email Confirmation**
   ```sql
   SELECT email, email_confirmed_at FROM auth.users
   WHERE email = 'test-business@platform.dev';
   ```
   - If `email_confirmed_at` is NULL, update it:
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email LIKE 'test-%@platform.dev';
   ```

2. **Check Password**
   - Password must be exactly: `TestPass123!`
   - Case-sensitive
   - Includes special character

3. **Clear Browser Cache**
   - Sometimes auth tokens get cached
   - Try incognito/private window

### Wrong Portal Access

If user lands on wrong portal:

1. **Check Profile Role**
   ```sql
   SELECT u.email, p.role FROM auth.users u
   JOIN user_profiles p ON u.id = p.id
   WHERE u.email = 'test-business@platform.dev';
   ```

2. **Verify Redirect Logic**
   - Business users should go to `/portal/dashboard`
   - Brand users should go to `/brand/dashboard`
   - Admins should go to `/admin/inbox`

---

## Cleanup

To remove test users:

```sql
-- Delete user profiles
DELETE FROM user_profiles
WHERE contact_email LIKE 'test-%@platform.dev';

-- Delete auth users
DELETE FROM auth.users
WHERE email LIKE 'test-%@platform.dev';
```

---

## Security Notes

- Test users have fixed UUIDs for consistency
- Passwords are properly hashed using bcrypt
- Email confirmation is set to NOW() (auto-confirmed)
- These are development/testing credentials only
- **Never use these credentials in production**
- Change passwords if deploying to staging/production

---

## Next Steps

After creating test users:

1. Test each login flow
2. Verify role-based access control
3. Test brand discovery (logged out + logged in)
4. Test menu upload and plan creation
5. Verify data isolation between users
6. Test navigation across all portals

---

## Support

If you encounter issues:

1. Check Supabase logs for auth errors
2. Verify RLS policies are not blocking access
3. Check browser console for client-side errors
4. Review network tab for failed API calls

For additional help, refer to:
- `TESTING_GUIDE.md` - Comprehensive testing procedures
- `LOGIN_SETUP_GUIDE.md` - Login flow documentation
- `TWO_PORTAL_ARCHITECTURE.md` - Architecture overview
