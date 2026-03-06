# BUILD SEQUENCE
**The PRO Edit — Strict Execution Order**
*February 2026 | Codex Recovery Mode*

**Status (2026-02-28):** P0-A, P0-B complete. Basic product search, brand/business claim flows, returns workflow, order-linked messages, email transactional (Resend) complete (Session 20–23). Full current state: /docs/build_tracker.md.

---

## The Rule

No phase starts until the previous phase is shippable and tested. No exceptions.

---

## Phase 0 — Stabilization
**Goal:** Stop the bleeding. Fix what's currently broken or unsafe.
**Duration estimate:** 2–3 days
**Done means:** App works reliably. No known data integrity or security issues. Every item below passes.

---

### P0-A: Fix Race Condition (handleAnalyze)
**Files:** `src/pages/business/PlanWizard.tsx`, `src/pages/business/PlanResults.tsx`
**What to do:**
1. In `PlanResults.tsx`, on mount: subscribe to `plans` row via Supabase Realtime OR start polling `plans.status` every 3 seconds
2. While `plan.status === 'processing'`: render animated "Analyzing your menu..." screen (not empty tabs)
3. When `plan.status === 'ready'`: fetch outputs, render tabs
4. If `plan.status === 'failed'` OR > 3 minutes with no change: show retry screen
5. Do NOT change PlanWizard navigation logic — keep navigate-on-submit pattern, just fix PlanResults to handle async gracefully

**Done:** First analysis shows results automatically. Zero empty-tab first-loads.

---

### P0-B: Add Admin Role Guard
**File:** `src/layouts/AdminLayout.tsx`
**What to do:**
```typescript
// In AdminLayout component, after useAuth():
if (!user || (!isAdmin && !isPlatformAdmin)) {
  return <Navigate to="/portal/login" replace />;
}
```
**Done:** Non-admin users cannot see admin UI, even if RLS is misconfigured.

---

### P0-C: Fix Slug Uniqueness on Brand Create
**File:** `src/pages/admin/BrandAdminEditor.tsx`
**What to do:** Move slug uniqueness check outside the `if (isEditMode)` condition. Run on both create and edit.
**Done:** Creating two brands with the same slug shows a validation error on the second attempt.

---

### P0-D: Remove Hardcoded Email
**File:** `src/pages/admin/AdminOrderDetail.tsx` line ~435
**What to do:** Replace `brand@example.com` with `brand?.contact_email || import.meta.env.VITE_SUPPORT_EMAIL`
**Done:** `grep -r "@example.com" src/` returns 0 results.

---

### P0-E: Replace Promise.all → Promise.allSettled (Dashboards)
**Files:** `src/pages/business/Dashboard.tsx`, `src/pages/brand/Dashboard.tsx`
**What to do:**
```typescript
// Before:
const [a, b, c, d] = await Promise.all([q1, q2, q3, q4]);

// After:
const results = await Promise.allSettled([q1, q2, q3, q4]);
const [aRes, bRes, cRes, dRes] = results;
const a = aRes.status === 'fulfilled' ? aRes.value : null;
// Render each widget independently with its own error state
```
**Done:** Killing one Supabase query does not crash the entire dashboard.

---

### Phase 0 Verification Checklist
- [ ] New business user: signs up → uploads menu → sees results (no manual refresh)
- [ ] Non-admin user: cannot access `/admin/*`
- [ ] Business dashboard: simulate one query failing → other widgets still render
- [ ] Create two brands with same slug → second fails with validation error
- [ ] `grep "@example.com" src/` → 0 results

---

## Phase 1 — Core Functionality
**Goal:** The platform delivers its stated value. A business can discover a brand, run an analysis, and understand their revenue opportunity.
**Duration estimate:** 1–2 weeks
**Done means:** A real business owner can complete the full journey from signup to "I understand my gaps and I want to buy."

---

### P1-A: Menu Quality Pre-Check
**File:** `src/lib/menuOrchestrator.ts` (new `validateMenuInput()` function), `src/pages/business/PlanWizard.tsx`
**What to do:**
- Before calling `runMenuAnalysis()`, run synchronous validation:
  - `text.trim().length > 100` → else: "Your menu text is too short. Please paste your full menu."
  - Detect service count > 3 → else: "We couldn't detect enough services. Try adding more service names."
- If validation fails: block analysis, show specific error message in wizard
- If low-quality (passes but borderline): run analysis + show yellow banner on results

**Done:** Submitting a 10-word menu shows a specific error. Submitting a real menu shows analysis.

---

### P1-B: Subscription Tier System
**Files:** New `subscriptions` table in Supabase, new `src/lib/subscription.ts`, new `src/pages/business/Billing.tsx`

**DB migration:**
```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('business', 'brand')),
  tier text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: entity can read own row, admin reads all
```

**`src/lib/subscription.ts`:**
```typescript
export function useSubscription() {
  // fetch subscriptions WHERE entity_id = current business_id
  // return { tier, canAccess }
}

export const FEATURE_GATES = {
  gap_analysis_full:   ['growth', 'pro'],
  revenue_simulator:   ['growth', 'pro'],
  activation_kit:      ['growth', 'pro'],
  export_center:       ['growth', 'pro'],
  benchmarks:          ['pro'],
} as const;

export function canAccess(feature: keyof typeof FEATURE_GATES, tier: string): boolean {
  return FEATURE_GATES[feature].includes(tier as any);
}
```

**Billing page:** Shows current tier. Allows admin to manually upgrade (no Stripe yet). Invoice history placeholder.

**Done:** Admin can set a business to 'growth' tier. `canAccess('gap_analysis_full', tier)` returns correct boolean. All gated features check this before rendering.

---

### P1-C: Gap Analysis Paywall Gate
**File:** `src/pages/business/PlanResults.tsx` (gap tab section)
**What to do:**
- Check `canAccess('gap_analysis_full', tier)`
- Free tier: render first 3 gaps, then paywall banner:
  ```
  🔒 [N] more revenue opportunities — est. $X,XXX – $X,XXX/month additional
  [Unlock All Gaps — Upgrade to Growth]
  ```
  - N = total gaps - 3
  - Dollar range = sum of locked gap revenue estimates (conservative × 0.6 to optimistic × 1.4)
- Growth+ tier: render all gaps, no banner

**Done:** Free user sees 3 gaps + paywall banner. Paid user sees all gaps. Upgrade CTA links to `/portal/billing`.

---

### P1-D: Revenue Simulator
**File:** New `src/pages/business/RevenueSimulator.tsx`, route `/portal/plans/:id/simulate`
**What to do:**
Build the revenue calculator. Inputs:
- `sessions_per_week` (slider 1–20, default 4)
- `avg_service_price` (number input, default from gap data)
- `retail_attach_rate` (slider 0–80%, default 25%)
- `avg_retail_transaction` (number input, default $45)
- `cogs_pct` (slider 10–40%, default 20%)
- `weeks_per_year` (slider 20–52, default 48)

Outputs (calculated client-side, no API call):
```typescript
const serviceRevenue = sessions_per_week * avg_service_price * weeks_per_year;
const retailRevenue = sessions_per_week * (retail_attach_rate/100) * avg_retail_transaction * weeks_per_year;
const totalRevenue = serviceRevenue + retailRevenue;
const grossMargin = totalRevenue * (1 - cogs_pct/100);
// Display conservative (×0.7) to optimistic (×1.3) range
```

- Behind `canAccess('revenue_simulator', tier)` gate
- Free users see read-only preview with locked inputs + upgrade prompt
- "Order products →" CTA at bottom

**Done:** Adjusting any slider updates outputs in real-time. Free users see locked preview. Output always shows a range, never a single number.

---

### Phase 1 Verification Checklist
- [ ] New user signup → onboarding → menu upload → AI analysis appears without manual refresh
- [ ] Free user: exactly 3 gaps visible + paywall banner with dollar range
- [ ] Upgrade prompt links to billing page
- [ ] After manual tier upgrade in admin: all gaps visible, simulator accessible
- [ ] Revenue simulator: adjusting sessions slider updates output
- [ ] Menu too short → specific error message, analysis blocked
- [ ] canAccess() unit tests pass for all features × all tiers

---

## Phase 2 — Revenue Layer
**Goal:** The platform can transact. Businesses can order products. Brands pay subscriptions. Platform earns commission.
**Duration estimate:** 2–3 weeks
**Done means:** One real order placed. One real brand subscription active. Commission ledger records created.

---

### P2-A: Commerce DB Schema
**New tables (DB migration):**
```sql
-- Line items per order
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('pro', 'retail')),
  qty integer NOT NULL CHECK (qty > 0),
  unit_price numeric(10,2) NOT NULL,
  line_total numeric(10,2) GENERATED ALWAYS AS (qty * unit_price) STORED,
  created_at timestamptz DEFAULT now()
);

-- Commission tracking
CREATE TABLE commission_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  brand_id uuid REFERENCES brands(id),
  gross_amount numeric(10,2) NOT NULL,
  commission_rate numeric(5,4) NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  payout_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

**Done:** Tables exist with correct RLS. Admin can query commission_ledger.

---

### P2-B: PRO Shop + Cart + Checkout
**Files:** New `src/pages/business/ProShop.tsx`, new `src/pages/business/Cart.tsx`, route `/portal/shop/pro`
**What to do:**
- Product catalog: query `pro_products` filtered by brand_id (from user's plan)
- Product card: name, SKU, wholesale price, MSRP, min_order_qty
- Add to cart: stored in localStorage (simple) until checkout
- Checkout form: shipping address, order notes
- On submit: INSERT into `orders` + `order_items` + `commission_ledger`
- Order confirmation: show order ID, estimated shipping (TBD)

**Not in scope:** Stripe, real shipping quotes, payment processing. Orders are confirmed manually by admin.

**Done:** Business user adds 3 products to cart, submits order, order appears in admin orders list with commission record.

---

### P2-C: Real Brand Analytics
**Files:** `src/pages/brand/Dashboard.tsx`, `src/pages/brand/Analytics.tsx`
**What to do:**
Replace hardcoded mock values with real DB queries:
```typescript
// Plans where brand_id matches:
const plansCount = await supabase
  .from('plans')
  .select('id', { count: 'exact', head: true })
  .eq('brand_id', profile.brand_id);

// Orders for this brand's products:
const ordersRevenue = await supabase
  .from('order_items')
  .select('line_total, orders!inner(status)')
  .in('product_id', brandProductIds)
  .eq('orders.status', 'confirmed');

// Map match rate from business_plan_outputs
```

**Strict rule:** Zero business-identifying info returned. All queries are aggregated counts and sums only.

**Done:** Brand admin sees real numbers. Disconnecting from DB shows loading error (not fake data).

---

### P2-D: Brand Catalog Completeness Gate
**Files:** `src/pages/admin/BrandAdminEditor.tsx`, `src/pages/brand/Dashboard.tsx`
**What to do:**
- Add `completeness_score` computed field: (protocols_with_steps + products_linked + assets_uploaded) / total_required
- Brand is only surfaced in business recommendations if `completeness_score >= 0.70`
- Admin approval button before brand goes live (even if 100% complete)
- Brand dashboard shows completeness progress bar

**Done:** Incomplete brand not discoverable by businesses. Admin must approve before discovery.

---

### P2-E: Multi-Tenant Isolation Tests
**File:** `tests/e2e/tenant-isolation.spec.ts`
**What to do:**
Playwright test suite:
1. Create business_A + business_B with separate credentials
2. Create brand_X + brand_Y with separate credentials
3. Assert: business_A cannot read business_B's plans via API (expect 403 or empty result)
4. Assert: brand_X admin cannot read brand_Y analytics via API
5. Run on every PR (CI gate)

**Done:** All isolation tests green. Tests fail if RLS is removed.

---

### Phase 2 Verification Checklist
- [ ] Business user places a PRO order → order in DB + commission ledger entry created
- [ ] Brand admin sees real plan count and order revenue (not hardcoded)
- [ ] Incomplete brand (< 70% complete) not visible in business plan wizard step 3
- [ ] Multi-tenant isolation tests all pass
- [ ] Admin can view commission ledger

---

## Phase 3 — Expansion Layer
**Start only after Phase 2 is live and generating revenue.**

| Module | What It Is |
|---|---|
| Activation Kit Generator | AI-generated menu redesign, training plan, scripts via Edge Function |
| Stripe Payment Integration | Self-serve billing for business + brand subscriptions |
| Monthly Insights Emails | Automated monthly optimization digest |
| Reorder Triggers | Estimated depletion alerts based on order history |
| Brand Placement Products | Paid placement in directory + onboarding suggestions |
| Retail Shop | Consumer retail product ordering (separate catalog from PRO) |
| Practitioner Portal | Mobile protocol viewer for staff (new role, new portal) |
| Plan Comparison Tool | Side-by-side brand comparison (2–4 brands) |
| Business Manager Role | Separate manager role under business owner |

---

## Dependency Map

```
Phase 0 (stabilization)
  └─→ Phase 1 (core functionality)
        ├── P1-A (menu quality)     — no dependencies
        ├── P1-B (subscriptions)    — no dependencies
        ├── P1-C (paywall)          — depends on P1-B
        └── P1-D (simulator)        — depends on P0-A + P1-B

Phase 1
  └─→ Phase 2 (revenue)
        ├── P2-A (commerce schema)  — no dependencies
        ├── P2-B (PRO shop)         — depends on P2-A
        ├── P2-C (brand analytics)  — depends on P2-B (need orders to show revenue)
        ├── P2-D (catalog gate)     — no dependencies
        └── P2-E (isolation tests)  — no dependencies (run in parallel with all phases)

Phase 2
  └─→ Phase 3 (expansion)
        All items depend on Phase 2 being live
```

---

*Last updated: 2026-02-22 | Codex Recovery Mode*
