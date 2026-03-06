# Brand Visibility Fix - Complete

**Date:** February 16, 2026
**Status:** ✅ All fixes implemented and tested

---

## Summary

Fixed brand visibility across both public and business portal pages to ensure published brands (starting with Naturopathica) display consistently regardless of login state, with proper authentication-aware navigation.

---

## Changes Made

### A) Public Brands Page (`/brands`) ✅

**File:** `src/pages/public/Brands.tsx`

**Changes:**
1. **Updated Query Filter**
   - Changed from `eq('status', 'active')` to `eq('is_published', true)`
   - Now shows only published brands (consistent with business portal)

2. **Added Auth-Aware CTAs**
   - Added two CTAs per brand card:
     - "Explore Brand" → `/portal/brands/:slug`
     - "Upload Menu & See Brand Fit" → `/portal/plans/new?brand=:slug`
   - Implemented `getAuthAwareLink()` helper function
   - If not logged in, redirects to `/portal/login?returnTo={originalPath}`
   - Preserves destination URL for post-login redirect

3. **Improved Empty State**
   - Added icon (Leaf)
   - Clear message: "No published brands available at the moment."
   - Helpful hint: "Brands need to be published by an administrator to appear here."

4. **Fixed Signup CTA**
   - Changed from `/spa/signup` to `/portal/signup`
   - Only shows signup CTA when user is NOT logged in
   - Consistent with authentication flow

**Key Implementation:**
```typescript
const getAuthAwareLink = (path: string) => {
  if (user) return path;
  return `/portal/login?returnTo=${encodeURIComponent(path)}`;
};
```

---

### B) Business Portal Home (`/portal`) ✅

**File:** `src/pages/business/PortalHome.tsx`

**Changes:**
1. **Made Entire Card Clickable**
   - Converted outer `<div>` to `<Link>` element
   - Entire card now navigates to `/portal/brands/:slug`
   - Added hover effects: shadow, border color, background transitions
   - Used `group` class for coordinated hover states

2. **Improved Empty States**
   - Added icon (Leaf) to empty state
   - Two scenarios handled:
     - When searching: "Try adjusting your search or browse all brands."
     - No brands at all: "No published brands available. Brands need to be published by an administrator."

3. **Fixed Button Event Handling**
   - Added `onClick={(e) => e.stopPropagation()}` to button container
   - Prevents card click from interfering with button clicks
   - Both "Explore Brand" and "Upload Menu & See Brand Fit" buttons work independently

**Already Working:**
- ✅ Fetches `is_published = true` brands
- ✅ "Explore Brand" button routes to `/portal/brands/:slug`
- ✅ "Upload Menu & See Brand Fit" routes to `/portal/plans/new?brand=:slug`

---

### C) Login Page Return URL Support ✅

**File:** `src/pages/business/Login.tsx`

**Changes:**
1. **Added Query Parameter Support**
   - Now checks for `returnTo` query parameter first
   - Falls back to `location.state.from` if no query param
   - Finally defaults to `/portal/dashboard` if neither exists

**Implementation:**
```typescript
const params = new URLSearchParams(location.search);
const returnTo = params.get('returnTo');
const from = (location.state as any)?.from;

const destination = returnTo || (from ? `${from.pathname}${from.search || ''}` : '/portal/dashboard');
navigate(destination);
```

**Flow:**
1. User clicks "Explore Brand" on public brands page (not logged in)
2. Redirected to `/portal/login?returnTo=/portal/brands/naturopathica`
3. After successful login, redirected to `/portal/brands/naturopathica`
4. User lands exactly where they intended

---

## User Flows

### Flow 1: Public → Brand Detail (Not Logged In)
1. Visit `/brands` (no login required)
2. See Naturopathica card with full description
3. Click "Explore Brand"
4. Redirect to `/portal/login?returnTo=/portal/brands/naturopathica`
5. Log in
6. Land on Naturopathica brand detail page

### Flow 2: Public → Plan Creation (Not Logged In)
1. Visit `/brands` (no login required)
2. See Naturopathica card
3. Click "Upload Menu & See Brand Fit"
4. Redirect to `/portal/login?returnTo=/portal/plans/new?brand=naturopathica`
5. Log in
6. Land in plan wizard with Naturopathica pre-selected

### Flow 3: Business Portal → Brand Detail (Logged In)
1. Visit `/portal` (logged in)
2. See brand cards with stats
3. Click anywhere on Naturopathica card
4. Navigate to `/portal/brands/naturopathica`
5. See full brand details

### Flow 4: Business Portal → Plan Creation (Logged In)
1. Visit `/portal` (logged in)
2. Click "Upload Menu & See Brand Fit" on Naturopathica card
3. Navigate to `/portal/plans/new?brand=naturopathica`
4. Wizard opens with brand pre-selected

---

## Data Consistency

### Published Brands Query (Both Pages)
```typescript
const { data, error } = await supabase
  .from('brands')
  .select('*')
  .eq('is_published', true)
  .order('name');
```

**Result:** Naturopathica appears on both `/brands` and `/portal` consistently

---

## Empty State Behavior

### When No Brands Published
**Public Brands Page:**
- Shows icon + message
- Explains brands need to be published by admin
- Maintains clean, professional appearance

**Business Portal:**
- Shows icon + message
- Context-aware (distinguishes between search results and no brands)
- Guides user on next steps

---

## Files Modified

1. **`/src/pages/public/Brands.tsx`**
   - Changed query filter to `is_published`
   - Added auth-aware link helper
   - Added two CTAs with login redirect
   - Improved empty state
   - Fixed signup link

2. **`/src/pages/business/PortalHome.tsx`**
   - Made entire card clickable
   - Added hover effects and transitions
   - Improved empty state messaging
   - Fixed button click event handling

3. **`/src/pages/business/Login.tsx`**
   - Added `returnTo` query parameter support
   - Maintains backward compatibility with state-based redirect

---

## Testing Checklist

### Public Brands Page ✅
- [x] Page loads without login required
- [x] Shows published brands (Naturopathica visible)
- [x] Empty state shows when no published brands
- [x] "Explore Brand" CTA works (redirects to login when not authenticated)
- [x] "Upload Menu & See Brand Fit" CTA works (redirects to login when not authenticated)
- [x] Login redirect preserves destination URL
- [x] After login, lands on intended page

### Business Portal Home ✅
- [x] Shows same published brands as public page
- [x] Brand cards fully clickable (navigate to detail)
- [x] "Explore Brand" button works independently
- [x] "Upload Menu & See Brand Fit" button works independently
- [x] Hover effects work smoothly
- [x] Empty state shows helpful message
- [x] Search filter works correctly

### Login Flow ✅
- [x] `returnTo` query parameter recognized
- [x] After login, redirects to intended destination
- [x] Query parameters preserved (e.g., `?brand=slug`)
- [x] Backward compatible with state-based redirect

---

## Build Status

✅ **Build Successful**
- No TypeScript errors
- No ESLint errors
- No runtime errors
- All imports resolved

---

## Verification Steps

To verify Naturopathica appears correctly:

1. **Check Database:**
   ```sql
   SELECT id, name, slug, is_published
   FROM brands
   WHERE slug = 'naturopathica';
   ```
   Ensure `is_published = true`

2. **Test Public Page (Not Logged In):**
   - Visit `/brands`
   - Verify Naturopathica appears
   - Click "Explore Brand" → should redirect to login
   - Complete login → should land on brand detail

3. **Test Business Portal (Logged In):**
   - Visit `/portal`
   - Verify Naturopathica appears with stats
   - Click card → navigate to brand detail
   - Click "Upload Menu & See Brand Fit" → navigate to wizard with brand preselected

---

## Notes

- **No Schema Changes:** All fixes use existing database structure
- **Auth-Aware:** Public page gracefully handles both logged-in and logged-out states
- **Consistent Data:** Both pages use identical query (`is_published = true`)
- **UX Improvements:** Card interactions are intuitive with clear visual feedback

---

## End of Report

All requirements met. Brand visibility is now consistent across public and business portal pages.
