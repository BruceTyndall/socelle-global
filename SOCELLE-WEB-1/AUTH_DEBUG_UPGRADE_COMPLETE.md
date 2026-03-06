# Auth Debug & UX Hardening - Complete

All authentication issues are now visible, public pages show proper loading/error states, and login flows are standardized.

---

## Files Changed

### 1. src/pages/admin/DebugPanel.tsx (NEW)
**Admin-only debug panel at /admin/debug**
- Shows Supabase configuration status (URL and anon key)
- Displays current user session state (ID, email, session existence)
- Shows profile object (role, brand_id, business_id)
- Runs 3 lightweight database tests:
  - Brands table (count + first 3 records)
  - Canonical protocols (count)
  - PRO products (count)
- Detects and highlights RLS errors with clear messaging
- Copy-to-clipboard button for full debug JSON

### 2. src/App.tsx
**Added debug route**
- New route: `/admin/debug` → `<AdminDebugPanel />`
- Protected with admin role requirements
- Import added for AdminDebugPanel component

### 3. src/components/ProtectedRoute.tsx
**Enhanced route protection with profile edge case handling**
- Added check: if user is authenticated but profile is null after loading, show helpful screen
- Screen displays "Profile Not Loaded" with retry button
- Retry triggers `window.location.reload()`
- Prevents silent failures when profile fetch fails
- Supports both `admin` and `platform_admin` roles for admin routes

### 4. src/pages/admin/AdminLogin.tsx
**Fixed post-login redirect destination**
- Changed redirect from `/admin/brands` to `/admin/inbox`
- Both useEffect auto-redirect and form submit navigate to inbox
- Consistent with expected admin landing page

### 5. src/pages/business/Login.tsx
**Already correct**
- Redirects to `/portal/dashboard` with replace: true
- Auto-redirects if already logged in

### 6. src/pages/brand/Login.tsx
**Already correct**
- Redirects to `/brand/dashboard` with replace: true
- Auto-redirects if already logged in with brand role

### 7. src/pages/public/Brands.tsx
**RLS-aware error handling**
- Detects RLS/permission errors explicitly
- Shows user-friendly message: "Public brand discovery is blocked by database security policies"
- Clear guidance to sign in or contact support

### 8. src/pages/business/BrandDetail.tsx
**Enhanced empty states for all content sections**
- Protocols: Shows "No protocols visible" with explanation
- Marketing: Shows "No marketing events visible" with explanation
- PRO Products: Shows "No PRO products visible" with explanation
- Retail Products: Shows "No retail products visible" with explanation
- Error handling: Logs errors but doesn't fail entire page
- Each empty state hints at possible RLS restrictions

### 9. src/components/ConfigCheck.tsx
**Already present and working**
- Blocks app if VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing
- Shows clear configuration screen with missing variables listed
- Prevents broken state from propagating

---

## What Was Fixed

### A) Auth Debugging Made Visible
✓ New `/admin/debug` panel shows all auth state
✓ Detects and highlights RLS policy errors
✓ Copy debug info to clipboard for troubleshooting
✓ Shows Supabase config, user session, profile, and database connectivity

### B) ProtectedRoute Never Fails Silently
✓ If profile fails to load, shows retry screen
✓ Clear error messaging for users
✓ No more blank screens or infinite loading
✓ Supports platform_admin role everywhere

### C) Post-Login Redirects Standardized
✓ Business login → `/portal/dashboard`
✓ Brand login → `/brand/dashboard`
✓ Admin login → `/admin/inbox`
✓ All use `replace: true` to prevent back-button loops

### D) Public Brand Pages Non-Blank
✓ Loading states with spinners
✓ Empty state cards with helpful hints
✓ RLS errors show clear messages
✓ No silent failures or blank pages
✓ Links to login and debug panel where appropriate

### E) Supabase Config Guard Active
✓ ConfigCheck prevents app from running without env vars
✓ Shows missing variables clearly
✓ User can't proceed into broken state

---

## Quick Self-Test Checklist

### Test in Incognito Window:

#### 1. Public Brand Discovery
- [ ] Navigate to `/brands` - should show loading spinner, then brands OR clear RLS message
- [ ] Should not show blank page
- [ ] Error messages guide user to sign in or contact support

#### 2. Business Login
- [ ] Login at `/portal/login` redirects to `/portal/dashboard`
- [ ] Page refresh keeps user logged in
- [ ] Already logged-in users are auto-redirected
- [ ] Back button doesn't return to login page

#### 3. Brand Login
- [ ] Login at `/brand/login` redirects to `/brand/dashboard`
- [ ] business_user accounts are blocked from brand routes
- [ ] Page refresh keeps user logged in
- [ ] Already logged-in brand admins are auto-redirected

#### 4. Admin Login
- [ ] Login at `/admin/login` redirects to `/admin/inbox`
- [ ] Non-admin users are blocked
- [ ] Page refresh keeps user logged in
- [ ] Already logged-in admins are auto-redirected

#### 5. Admin Debug Panel
- [ ] Navigate to `/admin/debug` as admin
- [ ] See auth state, profile, and database test results
- [ ] RLS errors are highlighted with clear messaging
- [ ] Copy debug info button works

#### 6. Brand Detail Page
- [ ] Navigate to `/portal/brands/:slug`
- [ ] Shows loading state
- [ ] Empty sections show helpful "not visible" messages
- [ ] Brand stats display even if sub-data is empty

#### 7. Profile Load Failure
- [ ] If profile fails to load, see "Profile Not Loaded" screen
- [ ] Retry button reloads page
- [ ] No infinite spinner

#### 8. 404 Page
- [ ] Navigate to `/nonexistent-page`
- [ ] Shows friendly 404 with "Go Home" button
- [ ] Does not crash or show blank page

---

## Debug Panel Features

The new debug panel at `/admin/debug` provides:

### Configuration Status
- Checks if VITE_SUPABASE_URL is set
- Checks if VITE_SUPABASE_ANON_KEY is set
- Visual checkmarks/x-marks for each

### Authentication State
- User authenticated: Yes/No
- User ID and email if logged in
- Session active: Yes/No

### Profile State
- Profile loaded: Yes/No
- Role, Brand ID, Business ID
- Warns if user is authenticated but profile is missing

### Database Tests
- Runs 3 test queries on page load
- Re-run tests with button click
- Each test shows:
  - Success with data count
  - Sample records (for brands)
  - OR error with RLS detection
- RLS errors highlighted in amber with clear message

### Copy to Clipboard
- Single button copies all debug info as JSON
- Includes timestamp, config, auth, profile, and test results
- Useful for support tickets

---

## Error Messages for Users

### RLS Blocked (Public Brands)
```
Public brand discovery is blocked by database security policies.
Please contact support or sign in to view brands.
```

### Profile Not Loaded
```
Your user profile could not be loaded.
This may be a temporary issue.
[Retry Button]
```

### Empty Brand Content
```
No protocols visible
Brand content may not be published yet, or database
policies may be restricting access.
```

### RLS in Debug Panel
```
RLS Policy Issue Detected
RLS is blocking this query for the current role.
Fix policies in Supabase.
```

---

## Technical Details

### Profile Edge Case Handling
- Added explicit check: `user && !profile && !loading`
- Shows retry screen instead of failing silently
- Prevents route guards from allowing through without profile

### RLS Error Detection
- Checks for Supabase error code 'PGRST301'
- Checks for 'permission' or 'rls' in error message
- Highlights with amber warning box
- Provides actionable guidance

### Empty State Pattern
All brand detail empty states follow:
```tsx
<div className="bg-[color]-50 rounded-lg p-6 border border-[color]-200">
  <p className="text-slate-700 mb-2 font-medium">[Thing] not visible</p>
  <p className="text-sm text-slate-600">
    Content may not be published or accessible.
  </p>
</div>
```

### Admin Role Support
- All admin checks now include 'platform_admin' role
- isAdmin helper already updated
- ProtectedRoute requireAdmin supports both
- Debug panel accessible to both roles

---

## Next Steps

1. Test all login flows with real user accounts
2. Navigate to `/admin/debug` and verify database tests
3. Check `/brands` in incognito - should show brands or clear error
4. Test profile retry flow (may need to simulate DB failure)
5. Verify empty states on brand detail pages
6. Test 404 handling with random URLs

---

## How to Use Debug Panel

1. Log in as admin or platform_admin
2. Navigate to `/admin/debug`
3. Review:
   - Is Supabase configured? (should be ✓)
   - Is user authenticated? (should be ✓)
   - Is profile loaded? (should be ✓ with your role)
   - Do database tests pass? (should be ✓ with counts)
4. If any RLS errors appear, check Supabase policies
5. Click "Copy Debug Info" to get JSON for support tickets
6. Use "Re-run Tests" button to test after policy changes

---

## Summary

All authentication and UX issues are now visible and recoverable:
- Debug panel makes all auth state transparent
- ProtectedRoute handles profile failure gracefully
- Public pages never blank, always show loading or error
- Login redirects are consistent and use replace: true
- RLS errors are detected and explained to users
- Empty states guide users instead of confusing them
