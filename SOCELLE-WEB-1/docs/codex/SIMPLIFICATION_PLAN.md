# SIMPLIFICATION PLAN
**The PRO Edit — Kill Complexity, Ship Faster**
*February 2026 | Codex Recovery Mode*

---

## The Rule

If removing or simplifying it does not break a feature that exists in MVP_FREEZE.md, it should be simplified. Complexity is not neutral — it creates friction, bugs, and maintenance debt.

---

## 1. Overbuilt Systems

### Overbuilt: 10 AI Engine Modules for MVP Needs
**What exists:** 10 separate engine files in `src/lib/`
**What MVP actually needs:** 4 of them
**The 4 essential engines:**
| Engine | Why Keep |
|---|---|
| `mappingEngine.ts` | Core service → protocol mapping |
| `gapAnalysisEngine.ts` | Gap identification + revenue estimates |
| `retailAttachEngine.ts` | Product recommendations |
| `planOrchestrator.ts` | Coordinates the above 3 |

**The 6 non-blocking engines:**
| Engine | Status | Action |
|---|---|---|
| `openingOrderEngine.ts` | Used in Phase 2 commerce | **Keep but don't call yet** — needed when order pre-population ships |
| `aiConciergeEngine.ts` | Nice to have, not on critical path | **Defer** — don't wire to UI until Phase 3 |
| `phasedRolloutPlanner.ts` | Used in activation kit (Phase 3) | **Defer** |
| `serviceMappingEngine.ts` | Appears to be legacy/stub | **Audit** — may be redundant with mappingEngine |
| `implementationReadinessEngine.ts` | Training complexity scoring | **Defer** — needed for Gap Detail page (P1-B) but not MVP core |
| `brandDifferentiationEngine.ts` | Incomplete, unclear purpose | **Defer** |

**Safe simplification:** Don't touch or remove these files. Just don't add new UI wiring to the deferred ones. Let them sit. Less code activated = fewer surface area bugs.

---

### Overbuilt: 5 Roles for a 2-Role Launch
**What exists:** `spa_user`, `business_user`, `brand_admin`, `admin`, `platform_admin`
**What MVP needs:** 3 functional paths: business user + brand admin + platform admin
**`spa_user`:** Currently normalized to `business_user`. This is fine. Keep the normalization, don't build separate `spa_user` flows.
**`business_manager` / `practitioner`:** Not in MVP. Do not implement.

**Safe simplification:** Leave the role enum as-is. The code already normalizes `spa_user` → `business_user`. Don't add complexity. Just don't build manager/practitioner UI until Phase 3.

---

### Overbuilt: Brand Portal Has 9 Mock Pages
**What exists:** 9 brand portal pages (Orders, Products, Performance, Messages, Campaigns, Automations, Promotions, Customers, Storefront)
**What's real vs mock:**
| Page | Status | MVP Needed? |
|---|---|---|
| Dashboard | ✅ Exists (mock data) | YES — wire to real data (P2-C) |
| Orders | ✅ Exists (mock data) | YES — wire to real orders (P2-B) |
| Products | ✅ Exists (mock data) | YES — wire to real products |
| Performance / Analytics | ✅ Exists (mock data) | YES — wire to real analytics (P2-C) |
| Messages | ✅ Exists (mock UI) | NO — defer, hide from nav |
| Campaigns | ✅ Exists (mock UI) | NO — defer, hide from nav |
| Automations | ✅ Exists (mock UI) | NO — defer, hide from nav |
| Promotions | ✅ Exists (mock UI) | NO — defer, hide from nav |
| Customers | ✅ Exists (mock UI) | PARTIAL — show anonymized retailer list after P2 |
| Storefront | ✅ Exists (mock UI) | PARTIAL — show preview, no editing needed for launch |

**Safe simplification:** Don't delete the pages. Instead, hide non-MVP nav items in `BrandLayout.tsx` behind a simple `MVP_PHASE` flag or just comment out the nav links. Pages stay in code for Phase 3 wiring.

```typescript
// BrandLayout.tsx — hide Phase 3 nav items
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/brand/dashboard', show: true },
  { label: 'Orders', href: '/brand/orders', show: true },
  { label: 'Products', href: '/brand/products', show: true },
  { label: 'Analytics', href: '/brand/analytics', show: true },
  // Phase 3 — hide until wired:
  { label: 'Messages', href: '/brand/messages', show: false },
  { label: 'Campaigns', href: '/brand/campaigns', show: false },
  { label: 'Automations', href: '/brand/automations', show: false },
  { label: 'Promotions', href: '/brand/promotions', show: false },
];
```

---

## 2. Premature Abstractions

### Premature: `aiConciergeEngine.ts` Mode System (5 Modes, Complex Table Access Control)
**What it is:** A mode-based AI response system with 5 intelligence modes, each with an approved table list to prevent unauthorized data access.
**Problem:** No UI currently calls this engine in the business portal (it exists in `lib/` but is not wired to any visible chat or assistant UI).
**Safe simplification:** Leave the file. Do not build a concierge UI until Phase 3. Don't complicate the plan analysis flow by trying to inject AI concierge responses during MVP.

---

### Premature: Revenue Simulator Schema Saving (P2 complexity)
**What's proposed:** Save simulator state per plan in a `revenue_simulations` table.
**MVP simplification:** Don't save state. Store simulator values in component state + URL params (for sharing). A saved state table adds a migration, RLS policy, and query — none of which are needed for MVP. Users can re-enter values; it's acceptable at this stage.

---

### Premature: Brand Placement Products + CPM Tracking
**What's proposed:** Paid placement in brand directory, tracking impressions, placement analytics.
**Safe simplification:** Not in MVP. Hide placement features from brand admin nav. Build after transaction revenue is working.

---

## 3. Unused Components

### Unused: Toast System — Built But Not Wired
**What exists:** `src/components/Toast.tsx` — fully built notification system with success/error/info variants
**Current state:** Built but not called anywhere in the business or brand portal pages on API errors
**Safe simplification:** This is a "wire up, not build" task. In every try/catch block in business portal pages, replace `setError(message)` with `showToast(message, 'error')`. Low complexity, high quality improvement. Schedule for Phase 0 or Phase 1.

---

### Unused: `ErrorState.tsx` Not Used in Brand Portal
**What exists:** `src/components/ErrorState.tsx` reusable error component
**Where it's missing:** `src/pages/brand/Dashboard.tsx` has no error state for failed fetches
**Safe simplification:** Add `<ErrorState>` on fetch error. One-line fix in brand dashboard.

---

### Unused: Empty `activation_assets` Flow
**What exists:** Tab in PlanResults labeled "Activation Kit" — content shows placeholder, no generation logic
**Safe simplification:** For MVP, rename this tab "Getting Started Resources" and show static content (links to existing brand assets). Don't show an empty generation UI. The real Activation Kit Generator is Phase 3. An empty tab looks broken; static content looks intentional.

---

## 4. Duplicate Logic

### Duplicate: `serviceMappingEngine.ts` vs `mappingEngine.ts`
**Problem:** Both files appear to handle service → protocol matching. `serviceMappingEngine.ts` uses Jaccard similarity; `mappingEngine.ts` uses keyword + semantic blending.
**Action:** Audit the call graph. If `serviceMappingEngine.ts` is not called by `planOrchestrator.ts` or any active UI flow, it is dead code. Mark it with a `// LEGACY - verify before removing` comment and schedule for removal in Phase 2 cleanup.

---

### Duplicate: Status Enum Strings Defined in Multiple Files
**Problem:** Order statuses and submission statuses are hardcoded strings in multiple admin components.
**Action:** Create `src/lib/constants.ts` with:
```typescript
export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;
export const SUBMISSION_STATUSES = ['pending', 'under_review', 'approved', 'rejected', 'completed'] as const;
```
Replace inline string arrays in AdminOrders, AdminOrderDetail, SubmissionDetail. 30-minute fix.

---

## 5. Feature Creep to Stop Now

| Feature | Where It Appears | Decision |
|---|---|---|
| AI Concierge chat widget | `aiConciergeEngine.ts` is built but no UI | **Do not build UI.** Defer to Phase 3. |
| Brand storefront editing (full CMS) | `Storefront.tsx` has editable UI | **Make it read-only for launch.** Brand edits via admin BrandAdminEditor. |
| Phased rollout planner UI | Engine built, no UI | **Do not build UI.** Include data in Activation Kit (Phase 3). |
| Business analytics page | `/business/analytics` route mentioned but no page | **Do not build.** Expose analytics in existing dashboard. |
| Lead management system | `spa_leads` table + `lead_activities` exists | **Do not build admin leads UI.** Data exists for internal use; no customer-facing feature needed at MVP. |
| Multi-location support | Not scoped but some DB fields hint at it | **Explicitly out of scope.** One business = one location for MVP. |

---

## 6. Safe Simplifications Summary

| Simplification | Effort | Risk | Impact |
|---|---|---|---|
| Hide Phase 3 brand nav items | 15 min | None | Cleaner brand portal |
| Wire Toast to all API errors | 2 hours | None | Better UX |
| Create `constants.ts` for status enums | 30 min | None | Cleaner code |
| Make brand Storefront tab read-only | 30 min | None | Prevents partial-feature confusion |
| Rename "Activation Kit" tab to "Resources" | 5 min | None | Removes empty-state confusion |
| Add `// LEGACY` comment to serviceMappingEngine | 5 min | None | Prevents future confusion |
| Don't save revenue simulator state to DB | N/A (don't build) | None | Simpler MVP |

---

## What NOT to Simplify

| Item | Why Keep As-Is |
|---|---|
| All 46 DB tables | Schema is already built. Don't touch what's not broken. |
| The `pro-*` token system | Consistent, works. |
| ProtectedRoute component | Auth guards are working. Don't simplify security. |
| Error boundaries | These protect against production crashes. Keep both. |
| Admin BrandHub sub-routing | Complex but functional. Admin needs this structure. |

---

*Last updated: 2026-02-22 | Codex Recovery Mode*
