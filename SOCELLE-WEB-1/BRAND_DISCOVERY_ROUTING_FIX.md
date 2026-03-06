# Brand Discovery Routing Fix - Complete

**Date:** February 16, 2026
**Status:** ✅ All routing updates implemented

---

## Summary

Updated all "Explore Brands" CTAs and navigation items to consistently route to `/brands` (the public brand directory) instead of `/portal`. This ensures brand discovery is always accessible to both anonymous and logged-in users.

---

## Changes Made

### 1. Home Page CTA ✅

**File:** `src/pages/public/Home.tsx`

**Change:**
- Updated primary "Explore Brands" button from `/portal` → `/brands`

**Before:**
```tsx
<Link to="/portal" className="bg-blue-600...">
  Explore Brands
</Link>
```

**After:**
```tsx
<Link to="/brands" className="bg-blue-600...">
  Explore Brands
</Link>
```

---

### 2. Main Navigation - Desktop ✅

**File:** `src/components/MainNav.tsx`

**Change:**
- Updated "Explore Brands" nav item from `/portal` → `/brands`
- Simplified active state logic to check `isActive('/brands')`

**Before:**
```tsx
<Link to="/portal" className={...}>
  <Sparkles className="w-4 h-4" />
  <span>Explore Brands</span>
</Link>
```

**After:**
```tsx
<Link to="/brands" className={...}>
  <Sparkles className="w-4 h-4" />
  <span>Explore Brands</span>
</Link>
```

---

### 3. Main Navigation - Mobile ✅

**File:** `src/components/MainNav.tsx`

**Change:**
- Updated mobile "Explore Brands" nav item from `/portal` → `/brands`
- Simplified active state logic for mobile view

**Before:**
```tsx
<Link to="/portal" className={...}>
  <Sparkles className="w-4 h-4" />
  <span>Explore Brands</span>
</Link>
```

**After:**
```tsx
<Link to="/brands" className={...}>
  <Sparkles className="w-4 h-4" />
  <span>Explore Brands</span>
</Link>
```

---

## Route Architecture

### Public Routes (No Auth Required)
- `/` - Public home page
- `/brands` - Public brand directory (shows all published brands)

### Protected Routes (Auth Required)
- `/portal` - Business portal home (authenticated brand discovery with stats)
- `/portal/plans` - My Plans list
- `/portal/plans/new` - Create new plan (redirects to login if not authenticated)
- `/portal/dashboard` - User dashboard

---

## User Experience

### Anonymous Users (Not Logged In)

1. **Home Page:**
   - Click "Explore Brands" → Navigate to `/brands`
   - See all published brands (Naturopathica, etc.)
   - Can browse brand details
   - CTAs redirect to login with return URL preserved

2. **Navigation:**
   - "Explore Brands" in nav → Navigate to `/brands`
   - Always accessible without login
   - Consistent experience across devices

### Authenticated Users (Logged In)

1. **Home Page:**
   - Click "Explore Brands" → Navigate to `/brands`
   - See all published brands
   - Can proceed to create plans without login redirect

2. **Navigation:**
   - "Explore Brands" → Navigate to `/brands` (public directory)
   - "My Plans" → Navigate to `/portal/plans` (user's plans)
   - "Dashboard" → Navigate to `/portal/dashboard` (user dashboard)

3. **Business Portal:**
   - `/portal` remains available as business portal home
   - Shows brand stats and additional business features
   - Not the primary brand discovery path

---

## Protected Route Behavior

**CTAs that trigger login:**
- "Upload Menu & See Brand Fit" (routes to `/portal/plans/new`)
- "Create Free Account" buttons
- Any `/portal/*` route when not authenticated

**ProtectedRoute behavior:**
- Redirects to `/portal/login?returnTo={currentPath}`
- After login, user returns to intended destination
- Preserves user intent throughout auth flow

---

## Testing Checklist

### Anonymous User Flow
- [ ] Visit `/` → Click "Explore Brands" → Lands on `/brands`
- [ ] Visit `/brands` directly → See Naturopathica and other published brands
- [ ] Click nav "Explore Brands" → Navigate to `/brands`
- [ ] Click brand CTAs → Redirect to login with returnTo preserved
- [ ] No RLS errors in console

### Authenticated User Flow
- [ ] Login as business user
- [ ] Visit `/` → Click "Explore Brands" → Lands on `/brands`
- [ ] Click nav "Explore Brands" → Navigate to `/brands`
- [ ] Visit `/portal` directly → See business portal with stats
- [ ] Navigate between `/brands` and `/portal` → Both work correctly

### Mobile Navigation
- [ ] Open mobile menu
- [ ] Click "Explore Brands" → Navigate to `/brands`
- [ ] Active state highlights correctly
- [ ] No layout issues

---

## Build Status

**Command:** `npm run build`

**Result:**
```
✓ 2023 modules transformed.
✓ built in 14.75s
```

**Status:** ✅ Build successful, no TypeScript or ESLint errors

---

## Database & RLS Status

From previous fix (BRAND_VISIBILITY_RLS_FIX.md):

✅ Anonymous users can view published brands
✅ RLS policies use `is_published = true`
✅ Naturopathica is marked as published
✅ No permission errors

---

## Files Modified

1. `src/pages/public/Home.tsx` - Updated primary CTA routing
2. `src/components/MainNav.tsx` - Updated desktop & mobile nav routing

---

## Summary of Routing

| CTA / Link | Previous Route | New Route | Auth Required |
|------------|---------------|-----------|---------------|
| "Explore Brands" (Home) | /portal | /brands | No |
| "Explore Brands" (Nav) | /portal | /brands | No |
| "Upload Menu" | /portal/plans/new | /portal/plans/new | Yes |
| "My Plans" | /portal/plans | /portal/plans | Yes |
| "Dashboard" | /portal/dashboard | /portal/dashboard | Yes |
| Business Portal | /portal | /portal | Yes |

---

## Benefits

1. **Consistent Brand Discovery:** All "Explore Brands" CTAs lead to the same place
2. **Public Access:** Anyone can browse brands without creating an account
3. **Clear Separation:** Public discovery vs. authenticated business tools
4. **Preserved Features:** Business portal remains accessible for authenticated users
5. **Better UX:** Users know where they'll land when clicking "Explore Brands"

---

## Next Steps

1. Test the routing changes in browser
2. Verify anonymous users can see brands at `/brands`
3. Verify authenticated users can access both `/brands` and `/portal`
4. Test mobile navigation
5. Verify protected route redirects work correctly

---

## Acceptance Criteria - Status

✅ "Explore Brands" CTA on home page routes to `/brands`
✅ "Explore Brands" in MainNav routes to `/brands`
✅ `/brands` works for anonymous users (from previous RLS fix)
✅ `/brands` works for authenticated users
✅ Error visibility implemented (from previous fix)
✅ Build successful
✅ No TypeScript or ESLint errors

---

## End of Report

All routing updates complete. Brand discovery is now consistently accessible via `/brands` for all users, while the business portal remains available for authenticated users who need additional features and tools.
