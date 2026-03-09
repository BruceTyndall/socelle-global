# CTRL-WO-04: Entitlements Chain Verification Report

**Date:** 2026-03-10
**Chain Status:** PARTIAL -> FIXED
**TypeScript:** `npx tsc --noEmit` = 0 errors
**Tests:** 9/9 passing (`src/lib/__tests__/entitlements.test.ts`)

---

## Chain Overview

The SOCELLE entitlements system uses two parallel gating mechanisms:

1. **Module-level gating** (ModuleRoute): `account_module_access` table -> `ModuleAccessContext` -> `useModuleAccess` -> `ModuleRoute` -> `UpgradePrompt` (module variant)
2. **Tier-level gating** (TierGate): `subscriptions` table -> `useTier` -> `TierGate` -> `PaywallOverlay` -> `UpgradePrompt` (tier variant)

Both systems are well-designed and complementary:
- ModuleRoute gates specific feature modules (shop, education, CRM, etc.)
- TierGate gates content by subscription tier (free/starter/pro/enterprise)

---

## Link-by-Link Status

### 1. subscription_plans table

| Aspect | Status | Notes |
|--------|--------|-------|
| Table exists (migration) | OK | `20260223000001` + `20260308100001` |
| `modules_included` column | **FIXED** | Was missing. Added as `TEXT[]` in `20260310100001` |
| `price_monthly` / `price_annual` | **FIXED** | Added as GENERATED columns from `monthly_price_cents` / `annual_price_cents` |
| `trial_days` column | **FIXED** | Added with DEFAULT 0 in `20260310100001` |
| `is_featured` column | **FIXED** | Added with DEFAULT false in `20260310100001` |
| `description` column | **FIXED** | Added as TEXT in `20260310100001` |
| Seed data `modules_included` values | **FIXED** | Seeded per plan tier in `20260310100001` |
| RLS | OK | Public SELECT policy exists |

### 2. account_module_access table

| Aspect | Status | Notes |
|--------|--------|-------|
| CREATE TABLE | **FIXED** | Was missing. RLS migration existed but table did not. Created in `20260310100001` |
| RLS policies | OK | `20260308200001` has SELECT + ALL policies (idempotent with IF EXISTS) |
| Columns match frontend | OK | `module_key`, `access_type`, `expires_at`, `granted_at`, `is_active` all present |
| Realtime subscription | OK | `ModuleAccessContext` subscribes to `postgres_changes` on this table |
| `updated_at` trigger | **FIXED** | Added in `20260310100001` |

### 3. account_subscriptions table

| Aspect | Status | Notes |
|--------|--------|-------|
| CREATE TABLE | **FIXED** | Was missing. `useSubscription.ts` references it but no migration existed. Created in `20260310100001` |
| RLS policies | **FIXED** | Added SELECT for users + ALL for service_role/admins |
| Columns match frontend | OK | `account_id`, `plan_id`, `status`, `billing_cycle`, `current_period_end`, `trial_ends_at` |
| `updated_at` trigger | **FIXED** | Added in `20260310100001` |

### 4. ModuleAccessContext (Provider)

| Aspect | Status | Notes |
|--------|--------|-------|
| Mounted in App.tsx | OK | Wraps all routes |
| Reads from `account_module_access` | OK | Filters by `account_id` + `is_active = true` |
| Checks expiry | OK | `expires_at` compared against `new Date()` |
| Realtime updates | OK | Supabase channel subscription for live changes |
| Account ID resolution | OK | Uses `profile.business_id ?? profile.brand_id ?? user.id` |

### 5. useModuleAccess hook

| Aspect | Status | Notes |
|--------|--------|-------|
| Returns `hasAccess` | OK | Boolean based on record lookup + expiry check |
| Returns `isLoading` | OK | From context |
| Returns `accessType` | OK | `plan`, `trial`, `override`, or `free` |
| Returns `expiresAt` | OK | Parsed Date or null |

### 6. ModuleRoute component

| Aspect | Status | Notes |
|--------|--------|-------|
| Loading state | OK | Shows skeleton placeholder |
| Access denied | OK | Renders `UpgradePrompt` with `moduleKey` |
| Access granted | OK | Renders children |
| Used in App.tsx | OK | 68+ routes gated across 7 module keys |

### 7. UpgradePrompt (module variant, `modules/_core/components/`)

| Aspect | Status | Notes |
|--------|--------|-------|
| Shows module metadata | OK | Label + description from MODULE_META lookup |
| Shows matching plans | OK | Queries `useSubscriptionPlans`, filters by `modules_included` |
| Trial CTA | OK | Shows trial button if any matching plan has `trial_days > 0` |
| "View Plans" CTA | OK | Links to `/pricing` |
| DEMO label | OK | Displays "Subscription gating -- DEMO" per governance |

### 8. useTier hook

| Aspect | Status | Notes |
|--------|--------|-------|
| TanStack Query | OK | Migrated to v5 |
| Reads from `subscriptions` | OK | Falls back to `user_profiles.subscription_tier` |
| 42P01 fallback | OK | Returns `pro` + `isDemo: true` if table missing |
| `meetsMinimumTier()` | OK | Rank comparison (free=0 < starter=1 < pro=2 < enterprise=3) |
| Legacy "growth" normalization | OK | Maps to "pro" |

### 9. TierGate component

| Aspect | Status | Notes |
|--------|--------|-------|
| Loading state | OK | Shows skeleton |
| Tier met | OK | Renders children |
| Tier not met (no fallback) | OK | Renders `PaywallOverlay` with blurred preview |
| Tier not met (custom fallback) | OK | Renders custom fallback |
| Tests | OK | 4 tests in `components/gates/__tests__/TierGate.test.tsx` |

### 10. PaywallOverlay + UpgradePrompt (tier variant, `components/gates/`)

| Aspect | Status | Notes |
|--------|--------|-------|
| Blur effect | OK | CSS blur + opacity transition |
| Tier comparison display | OK | Shows current tier -> required tier |
| Feature list | OK | TIER_FEATURES per tier aligned with V1 pricing |
| "View Plans" CTA | OK | Links to `/pricing` |

---

## Module Key Inventory

### Defined in MODULE_KEYS (`ModuleAccessContext.tsx`)

| Key | Has routes in App.tsx | In MODULE_META (UpgradePrompt) |
|-----|----------------------|-------------------------------|
| `MODULE_SHOP` | Yes (14 routes) | Yes |
| `MODULE_INGREDIENTS` | Yes (3 routes) | Yes |
| `MODULE_EDUCATION` | Yes (12 routes) | Yes |
| `MODULE_SALES` | Yes (16 routes) | Yes |
| `MODULE_MARKETING` | Yes (7 routes) | Yes |
| `MODULE_RESELLER` | Yes (4 routes) | Yes |
| `MODULE_CRM` | Yes (18 routes) | Yes |
| `MODULE_MOBILE` | No (deferred) | Yes |

All 7 module keys used in App.tsx are defined in both `MODULE_KEYS` and `MODULE_META`.
`MODULE_MOBILE` is defined but not yet routed -- expected per multi-platform roadmap (Phase 6).

### modules_included mapping (seeded in migration)

| Plan | Modules |
|------|---------|
| Free (operator) | none |
| Professional (operator) | `MODULE_EDUCATION`, `MODULE_INGREDIENTS` |
| Business (operator) | `MODULE_SHOP`, `MODULE_EDUCATION`, `MODULE_INGREDIENTS`, `MODULE_SALES`, `MODULE_MARKETING`, `MODULE_CRM` |
| Enterprise (operator) | All 8 modules |
| Free (brand) | none |
| Growth (brand) | `MODULE_MARKETING`, `MODULE_CRM` |
| Scale (brand) | `MODULE_MARKETING`, `MODULE_CRM`, `MODULE_SALES`, `MODULE_RESELLER` |

---

## Fixes Applied

### Migration: `20260310100001_entitlements_chain_fix.sql`

1. **Added missing columns to `subscription_plans`**: `price_monthly` (generated), `price_annual` (generated), `modules_included`, `trial_days`, `is_featured`, `description`
2. **Seeded `modules_included`** for all 7 existing plans
3. **Created `account_module_access` table** with proper schema, indexes, RLS trigger
4. **Created `account_subscriptions` table** with proper schema, indexes, RLS policies, trigger

### Tests: `src/lib/__tests__/entitlements.test.ts`

9 tests covering:
- useTier: unauthenticated default, active subscription, legacy normalization, DEMO fallback, meetsMinimumTier
- Module key inventory: all App.tsx keys in MODULE_KEYS, MODULE_MOBILE deferred status
- Tier rank ordering: ascending order, four canonical tiers

---

## Architecture Note: Two Gating Systems

The codebase has two complementary but separate gating systems:

1. **ModuleRoute** — per-module access via `account_module_access` table. Used for feature-level gating (shop, CRM, etc.). Populated when a subscription is activated (or manually via admin overrides).

2. **TierGate** — tier-level access via `subscriptions` table + `useTier`. Used for content-level gating (pro-only intelligence features, export formats, etc.).

Both work correctly as designed. They serve different purposes:
- ModuleRoute answers: "Does this account have access to the CRM module?"
- TierGate answers: "Does this user meet the Pro tier minimum?"

The missing piece is a **subscription activation flow** (when a user subscribes via Stripe, populate both `account_subscriptions` and `account_module_access`). This is the domain of the Stripe webhook handler (protected file -- not modified per governance rules).

---

## Remaining Items (Not In Scope for CTRL-WO-04)

| Item | Owner | Notes |
|------|-------|-------|
| Stripe webhook -> populate `account_module_access` on subscription change | Commerce/Payment (protected) | Requires Stripe integration work |
| Stripe webhook -> populate `account_subscriptions` | Commerce/Payment (protected) | Same as above |
| Admin UI for manual module access grants | Admin Portal | Future WO |
| MODULE_MOBILE route gating | Multi-Platform Agent | Phase 6 |
