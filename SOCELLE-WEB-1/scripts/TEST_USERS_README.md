# Test User Accounts

## Quick Setup (Option 1: Use Signup Pages)

The easiest way to create test accounts is to use the signup pages:

### 1. Business User
1. Go to `/portal/signup`
2. Sign up with:
   - Email: `test-business@platform.dev`
   - Password: `TestPass123!`
   - Business Name: `Serenity Spa & Wellness`
   - Business Type: `spa`
3. After signup, run this SQL to set role:
```sql
UPDATE user_profiles
SET role = 'business'
WHERE id = (SELECT id FROM auth.users WHERE email = 'test-business@platform.dev');
```

### 2. Admin User
1. Go to `/portal/signup`
2. Sign up with:
   - Email: `test-admin@platform.dev`
   - Password: `TestPass123!`
3. After signup, run this SQL to set role:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'test-admin@platform.dev');
```

### 3. Brand User
1. Go to `/portal/signup`
2. Sign up with:
   - Email: `test-brand@platform.dev`
   - Password: `TestPass123!`
3. After signup, run this SQL to set role and brand:
```sql
UPDATE user_profiles
SET role = 'brand',
    brand_id = '00000000-0000-0000-0000-000000000001'
WHERE id = (SELECT id FROM auth.users WHERE email = 'test-brand@platform.dev');
```

---

## Automated Setup (Option 2: Script with Service Key)

If you have the Supabase service role key:

1. Add to `.env`:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Run:
```bash
npx tsx scripts/seedTestUsers.ts
```

---

## Test Credentials

Once created, use these to log in:

| Role | Email | Password | Login URL | Dashboard |
|------|-------|----------|-----------|-----------|
| Business | test-business@platform.dev | TestPass123! | /portal/login | /portal/dashboard |
| Brand | test-brand@platform.dev | TestPass123! | /brand/login | /brand/dashboard |
| Admin | test-admin@platform.dev | TestPass123! | /admin/login | /admin/inbox |
