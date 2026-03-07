# DOC GATE QA REPORT -- WO-OVERHAUL-09

**Date:** 2026-03-07
**Agent:** Doc Gate QA Agent (claude-opus-4-6)
**Scope:** All files modified in Wave Overhaul Phases 1-8

---

## FAIL 1: External doc reference as authority — PASS

No `.tsx` or `.ts` files in `src/` reference `GOVERNANCE.md`, `MASTER_WORK_ORDER.md`, `REBUILD_PLAN`, or `IMPLEMENTATION_PLAN`. All authority references cite `build_tracker.md` and `SOCELLE_CANONICAL_DOCTRINE.md` correctly.

---

## FAIL 2: New WO/plan docs outside build_tracker — PASS

No unauthorized governance documents were created. No parallel plan files detected.

---

## FAIL 3: Contradiction with command docs (design locks) — FAIL (2 violations)

### Violation 3a: BrandStorefront.tsx hardcoded hex values
**File:** `src/pages/public/BrandStorefront.tsx` lines 20-35, 405-409, 605-607
17 hardcoded hex values (`#141418`, `#F6F3EF`, `#EFEBE6`, `#FFFFFF`, `#1F2428`, `#15191D`, `#6E879B`, `#5F8A72`, `#A97A4C`, etc.) and 9 `rgba()` values defined as a local `MN` object instead of using Tailwind tokens (`text-graphite`, `bg-mn-bg`, `text-accent`, `text-signal-up`, `text-signal-warn`).
**Severity:** Medium. The values match the Pearl Mineral V2 palette (not off-brand), but the doctrine requires Tailwind token usage on public pages to prevent drift.

### Violation 3b: MainNav.tsx hardcoded hex values
**File:** `src/components/MainNav.tsx` lines 124, 137, 145, 153, 244, 258, 267, 276
8 instances of `bg-[#1F2428]`, `text-[#F7F5F2]`, `hover:bg-[#2a3038]` used for CTA buttons and portal shortcut links. Should use `bg-graphite` / `text-mn-bg` Tailwind tokens.

### Violation 3c: rgba() gradient overlays in landing pages
**Files:**
- `src/pages/public/ForSalons.tsx:131`
- `src/pages/public/ForMedspas.tsx:130`
- `src/pages/public/Professionals.tsx:118`

All use inline `linear-gradient(160deg, rgba(246,243,239,...))` instead of Tailwind bg-gradient utilities or CSS custom properties.

**No font-serif or pro-* token violations found.** Comments referencing "no font-serif" are documentation only. No DM Serif Display, Playfair Display, or Inter font references detected.

---

## FAIL 4: Fake-live claims — PASS

All DEMO surfaces have appropriate labeling:
- **Home.tsx:** `DemoBadge` component renders "Preview" on non-live data; `SignalPreview` shows `PREVIEW` banner; `isAnyLive` flag drives display.
- **Events.tsx:** `DEMO` badge visible (line 116), `DEMO_EVENTS` hardcoded array clearly labeled.
- **ForSalons.tsx / ForMedspas.tsx:** Visible `DEMO` badges on metrics rows and education sections.
- **Plans.tsx:** `DEMO` badge on pricing tiers (W12-02).
- **Brands.tsx:** Intelligence filter chips labeled `DEMO` (line 424).
- **ForBrands.tsx:** Dynamic `LIVE`/`DEMO` label driven by `isLive` flag (line 185).
- **Professionals.tsx:** `DEMO` badge on metrics (line 257).
- **BrandStorefront.tsx:** `PREVIEW` badge when `isLive=false` on intel sections.
- **StoriesIndex.tsx / StoryDetail.tsx:** `isLive` flag from hooks drives PREVIEW display.

The `animate-pulse` instances in Brands.tsx and BrandStorefront.tsx are **loading skeletons** (not fake-live indicators) -- these are compliant.

---

## FAIL 5: Omitted routes vs SITE_MAP — FAIL (1 violation)

### Violation 5a: `/for-buyers` route in GLOBAL_SITE_MAP but missing from App.tsx
`GLOBAL_SITE_MAP.md` lists `/for-buyers` -> `pages/public/ForBuyers.tsx`, but:
- No `ForBuyers` component found in `src/` (file does not exist)
- No `/for-buyers` route in `App.tsx`

All other routes in GLOBAL_SITE_MAP.md are present in App.tsx. The portal, brand, and admin route trees are complete.

---

## FAIL 6: Ecommerce elevated above Intelligence Hub — PASS

**MainNav.tsx:** `NAV_LINKS` array position 1 is `{ to: '/intelligence', label: 'Intelligence' }`. No "Shop" link appears anywhere in the public nav. Commerce routes are portal-scoped only (`/portal/orders`, `/brand/orders`, `/brand/products`).

**Home.tsx hero:** Primary CTA is `"Get Intelligence Access" -> /request-access`. Secondary CTA is `"Explore Intelligence" -> /intelligence`. No commerce CTAs on the homepage.

**CTA flow:** Discovery -> Intelligence -> Trust -> Transaction is followed correctly.

---

## FAIL 7: Outreach/cold email content — PASS (with advisory)

**send-email edge function** (`supabase/functions/send-email/index.ts`): Handles only transactional types: `welcome`, `plan_complete`, `order_status`, `new_order`, `access_request`. No cold email or outreach templates.

**Advisory (non-blocking):** The word "outreach" appears in mock/admin data contexts:
- `adminIntelligence.ts:462` -- mock insight text about "targeted outreach"
- `mockTierData.ts` -- mock brand tier feature descriptions
- `mockAdvisor.ts:183` -- AI advisor mock response
- `AdminSeeding.tsx:89` -- admin documentation about follow-up process
- `AdminApprovalQueue.tsx` -- `outreach_status` DB column reference

These are **internal admin/mock data references**, not cold email copy. The `outreach_status` column is a CRM tracking field, not an email drafting surface. **No violation**, but flagged for awareness.

---

## ADDITIONAL CHECKS

### LIVE/DEMO Labeling — PASS
Every public data surface has explicit LIVE or DEMO labeling in code comments and/or visible UI badges. The `isLive` pattern from `useIntelligence()` is applied consistently across hooks.

### api_key_encrypted — PASS
**File:** `src/pages/admin/AdminApiControlHub.tsx` lines 5, 28, 47
The field is referenced **only in security comments** warning to exclude it. It is never queried, displayed, or included in any SELECT statement. Backend-only access is enforced correctly.

### Commerce/Auth Modifications — PASS
`auth.tsx`, `useCart.ts`, `ProtectedRoute.tsx`, `create-checkout`, and `stripe-webhook` show no changes in the Wave Overhaul timeframe. Last modification predates the overhaul.

### RLS on New Tables — PASS
All 7 required tables have RLS enabled with appropriate policies:

| Table | RLS | Policies |
|---|---|---|
| `cms_pages` | Enabled | Public read (published), Admin manage |
| `blog_posts` | Enabled | Public read (published), Admin manage |
| `media_library` | Enabled | Authenticated view, Admin manage |
| `live_data_feeds` | Enabled | Admin manage only (no public read -- correct for feed config) |
| `sitemap_entries` | Enabled | Public read (active), Admin manage |
| `api_registry` | Enabled | Admin manage |
| `api_route_map` | Enabled | Admin manage |

### PII in Analytics — PASS
No personal data exposure found in analytics hooks or admin dashboards. No `trackUser`, `user_email.*log`, or similar patterns detected.

---

## OVERALL VERDICT: CONDITIONAL PASS

**2 FAIL conditions triggered (FAIL 3, FAIL 5). Neither is a deploy-blocker, but both require remediation.**

### Remediation Required

| # | Issue | Priority | Effort |
|---|---|---|---|
| R1 | `BrandStorefront.tsx`: Replace 17 hardcoded hex + 9 rgba() with Tailwind tokens | Medium | 1 hr |
| R2 | `MainNav.tsx`: Replace 8 instances of `bg-[#1F2428]`/`text-[#F7F5F2]` with `bg-graphite`/`text-mn-bg` | Low | 15 min |
| R3 | `ForSalons.tsx`, `ForMedspas.tsx`, `Professionals.tsx`: Replace rgba() gradient overlays with Tailwind utilities | Low | 30 min |
| R4 | Create `/for-buyers` route + `ForBuyers.tsx` page, OR remove from `GLOBAL_SITE_MAP.md` | Medium | Decide scope |

### No Remediation Needed
- FAIL 1, 2, 4, 6, 7: All clean
- api_key_encrypted: Properly guarded
- Commerce/Auth: Untouched
- RLS: Complete
- PII: Clean
