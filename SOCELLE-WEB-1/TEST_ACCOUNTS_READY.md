# Test Accounts - Ready to Use

## Quick Setup (2 Steps)

### Step 1: Sign Up Via UI (3 accounts)

Open your dev server and create these accounts:

1. **Business Account**
   - Go to: http://localhost:5173/portal/signup
   - Email: `test-business@platform.dev`
   - Password: `TestPass123!`
   - Fill in any business name (will be overwritten)
   - Complete signup

2. **Brand Account**
   - Go to: http://localhost:5173/portal/signup
   - Email: `test-brand@platform.dev`
   - Password: `TestPass123!`
   - Fill in any business name (will be overwritten)
   - Complete signup

3. **Admin Account**
   - Go to: http://localhost:5173/portal/signup
   - Email: `test-admin@platform.dev`
   - Password: `TestPass123!`
   - Fill in any business name (will be overwritten)
   - Complete signup

### Step 2: Run SQL Script

Open Supabase SQL Editor and run:

```bash
scripts/setup_test_users.sql
```

Or copy-paste the SQL from that file into the Supabase SQL Editor.

---

## Login Credentials

Once setup is complete, use these to test:

### Business User
- **Email**: test-business@platform.dev
- **Password**: TestPass123!
- **Login**: http://localhost:5173/portal/login
- **Lands On**: /portal/dashboard
- **Role**: business
- **Business**: Serenity Spa & Wellness

### Brand User
- **Email**: test-brand@platform.dev
- **Password**: TestPass123!
- **Login**: http://localhost:5173/brand/login
- **Lands On**: /brand/dashboard
- **Role**: brand
- **Brand**: Naturopathica

### Admin User
- **Email**: test-admin@platform.dev
- **Password**: TestPass123!
- **Login**: http://localhost:5173/admin/login
- **Lands On**: /admin/inbox
- **Role**: admin

---

## Verification

After running the SQL, you should see:

```
email                          | role     | spa_name                   | brand_id     | business_name           | login_url
test-admin@platform.dev        | admin    | Platform Admin             | null         | null                    | Login at: /admin/login
test-brand@platform.dev        | brand    | Naturopathica Brand        | 00000000...  | null                    | Login at: /brand/login
test-business@platform.dev     | business | Serenity Spa & Wellness    | null         | Serenity Spa & Wellness | Login at: /portal/login
```

---

## What Each Account Can Do

### Business User
- Browse brand catalog
- Upload service menus
- Get AI recommendations
- View implementation plans
- Access protocol library

### Brand User
- View dashboard with engagement stats
- Manage brand content
- Review business submissions
- Access analytics

### Admin User
- View all submissions
- Manage data ingestion
- Edit protocols and products
- Configure business rules
- Monitor schema health
- Manage mixing rules and costs

---

## Troubleshooting

**"User not found" in SQL output?**
- Make sure you completed the signup via the UI first
- Check that you used the exact email addresses listed above

**Can't log in after setup?**
- Clear browser cache/cookies
- Try incognito/private mode
- Verify the SQL script ran successfully

**Wrong dashboard after login?**
- Check the role in user_profiles table
- Re-run the SQL setup script

**Brand user can't see content?**
- Verify brand_id is set to '00000000-0000-0000-0000-000000000001'
- This is the Naturopathica brand ID

---

## Files Reference

- `QUICK_TEST_SETUP.md` - Detailed step-by-step guide
- `scripts/setup_test_users.sql` - SQL script to configure roles
- `scripts/seedTestUsers.ts` - Alternative automated setup (requires service key)
- `scripts/TEST_USERS_README.md` - Additional documentation
