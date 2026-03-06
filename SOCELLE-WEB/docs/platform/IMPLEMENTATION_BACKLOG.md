# IMPLEMENTATION BACKLOG
**The PRO Edit — Brand Discovery & Activation Platform**
*Version 1.0 | February 2026 | Principal Product Design + Architecture Review*
*Informed by: Full codebase audit (4 agents), pre-mortem analysis, IA + journey design*

**Tracker sync:** Aligned with /docs/build_tracker.md as of 2026-02-28. P0-001, P0-003, BUG-M01, reseller apply, order tracking, Admin Brand Hub, pipeline/Flag as Fit, basic product search, brand/business claim flows, returns workflow, order-linked messages, and email transactional (Resend) are complete per build_tracker.

---

## How to Read This Document

**Priority tiers:**
- **P0 — Security / Data Integrity / Active Bugs:** Must fix before any marketing or scaling. Platform unsafe or broken without these.
- **P1 — Core UX + Economics Engine:** Must ship for the product to be compelling and monetizable.
- **P2 — Automation + Scale:** Ships after core is solid. Drives retention and platform efficiency.
- **P3 — Polish:** Quality-of-life improvements. Ships as bandwidth allows.

Each ticket includes:
- **Impact:** What it improves (revenue, trust, conversion, retention, ops)
- **Scope:** Files/modules affected
- **Acceptance Criteria:** Specific, testable
- **Test Requirements:** How to verify
- **Rollout Notes:** Dependencies and sequencing

---

## P0 — Security / Data Integrity / Active Bugs

---

### P0-001 — Fix: AI Analysis Race Condition (navigate-before-save)
**Impact:** Trust (first-session wow moment fails 100% of the time)
**Scope:** `src/pages/business/PlanWizard.tsx`, `src/pages/business/PlanResults.tsx`, `src/lib/menuOrchestrator.ts`

**Problem:** `handleAnalyze()` navigates to PlanResults before `saveOutputs()` completes. First fetch in PlanResults returns empty. User sees "No results" on their first analysis.

**Solution:** Implement Supabase Realtime subscription on `plans.status` in PlanResults. Show animated processing screen until status = `ready` or `failed`. Do not show tab UI until outputs exist.

**Acceptance Criteria:**
- [ ] PlanResults shows "Analyzing your menu..." animated state when plan.status = 'processing'
- [ ] Tabs do not render until plan.status = 'ready'
- [ ] When status changes to 'ready', tabs load automatically (no manual refresh)
- [ ] If status = 'failed' after 3 minutes, show retry state with one-click reanalyze
- [ ] Zero instances of user seeing empty tab UI on first analysis

**Test Requirements:**
- E2E test: create plan → verify PlanResults shows processing state → verify results appear without refresh
- Unit test: Supabase Realtime mock fires status change → component updates

**Rollout Notes:** This is a standalone bug fix. No dependencies. Ship immediately.

---

### P0-002 — Fix: Replace Promise.all() with Promise.allSettled() in Dashboards
**Impact:** Reliability (single query failure breaks entire dashboard)
**Scope:** `src/pages/business/Dashboard.tsx`, `src/pages/brand/Dashboard.tsx`, `src/lib/mappingEngine.ts`

**Problem:** `Promise.all()` throws if ANY query fails, causing entire dashboard to error. Real-world network conditions mean individual query failures are common.

**Solution:** Replace all `Promise.all()` with `Promise.allSettled()`. Render each widget independently with its own loaded/error state. A failed orders count shows "—" not a full-page error.

**Acceptance Criteria:**
- [ ] Dashboard renders available data if any single query fails
- [ ] Failed widgets show "—" or a per-widget retry button
- [ ] Full-page error state only if ALL critical queries fail
- [ ] No regression in happy-path rendering

**Test Requirements:**
- Unit test: mock one query to fail → verify other widgets still render
- Integration test: network throttling → partial failure → graceful degradation

**Rollout Notes:** Low risk change. Ship in same sprint as P0-001.

---

### P0-003 — Fix: Admin Pages Lack Role Validation Guard
**Impact:** Security (unauthorized access if RLS misconfigured)
**Scope:** `src/layouts/AdminLayout.tsx`, `src/components/ProtectedRoute.tsx`, all `src/pages/admin/` pages

**Problem:** Admin pages rely solely on Supabase RLS for access control. No client-side role check. If RLS is misconfigured or bypassed, unauthorized users can view admin UI. Current code does not check `user.role === 'admin' || user.role === 'platform_admin'` in the admin layout.

**Solution:** Add explicit role check in `AdminLayout.tsx` (redirect to `/portal/login` if role is not admin/platform_admin). Defense-in-depth.

**Acceptance Criteria:**
- [ ] `AdminLayout` redirects non-admin users to `/portal/login` regardless of RLS
- [ ] `brand_admin` users navigating to `/admin/*` are redirected to `/brand/dashboard`
- [ ] `business_user` navigating to `/admin/*` redirected to `/portal/dashboard`
- [ ] No console errors or flashes of admin content before redirect

**Test Requirements:**
- E2E test: business_user attempts to navigate to `/admin/brands` → redirected
- E2E test: unauthenticated user attempts to navigate to `/admin/dashboard` → redirected

**Rollout Notes:** No dependencies. Ship this week.

---

### P0-004 — Fix: Brand Slug Uniqueness on CREATE (not just EDIT)
**Impact:** Data integrity (duplicate slugs cause routing collisions)
**Scope:** `src/pages/admin/BrandAdminEditor.tsx`

**Problem:** Slug uniqueness validation only runs in edit mode (skips the check on create). Duplicate slugs will cause `/brands/:slug` routing to return the wrong brand.

**Acceptance Criteria:**
- [ ] Slug uniqueness check runs on BOTH create and edit flows
- [ ] Validation fires on blur (not on submit only)
- [ ] Error message is specific: "This URL slug is already taken. Try: [suggested-slug-2]"

**Test Requirements:**
- Unit test: create two brands with the same slug → second creation fails with validation error
- Manual test: attempt to create brand with slug matching an existing brand

**Rollout Notes:** Simple validation fix. No dependencies.

---

### P0-005 — Fix: Remove Hardcoded Email from AdminOrderDetail
**Impact:** Security / Data integrity
**Scope:** `src/pages/admin/AdminOrderDetail.tsx` line 435

**Problem:** Hardcoded email address `brand@example.com` in production admin page. Must be replaced with dynamic config or environment variable.

**Acceptance Criteria:**
- [ ] No hardcoded email addresses anywhere in admin pages
- [ ] Contact email sourced from brand record or `VITE_SUPPORT_EMAIL` env var
- [ ] Confirmed by grep: `grep -r "@example.com" src/` returns zero results

**Test Requirements:**
- Static analysis (grep) as part of CI check

**Rollout Notes:** One-line fix. Ship immediately.

---

### P0-006 — Implement Audit Log Writes for All Admin Mutations
**Impact:** Security / Compliance / Trust (brands need assurance their data is protected)
**Scope:** All `src/pages/admin/` write operations, `src/lib/supabase.ts`, `audit_log` table

**Problem:** `audit_log` table exists but is never written to. Admin mutations (protocol edits, brand updates, order status changes) leave no trace.

**Solution:** Create `logAuditEvent(action, table, rowId, before, after)` utility. Call in every admin try/catch block on successful write.

**Acceptance Criteria:**
- [ ] Every admin INSERT, UPDATE, DELETE writes to audit_log
- [ ] Audit log entry includes: actor_id, action_type, table_name, row_id, before_state (JSON), after_state (JSON), timestamp
- [ ] audit_log is INSERT-only (no UPDATE/DELETE via RLS — even for platform_admin)
- [ ] Admin audit log viewer at `/admin/audit` shows entries with search and date filter

**Test Requirements:**
- Integration test: admin updates brand → verify audit_log entry created
- Unit test: logAuditEvent() formats entry correctly

**Rollout Notes:** Implement utility function first, then add calls to admin pages. Can ship incrementally.

---

### P0-007 — Add Multi-Tenant Isolation Automated Tests
**Impact:** Security / Compliance (contractual obligation to brands)
**Scope:** `tests/e2e/`, Playwright test suite

**Problem:** Zero automated tests for cross-tenant data isolation. One RLS misconfiguration could expose brand or business data to the wrong tenant.

**Solution:** E2E test suite that creates 2 businesses (A and B) and 2 brands (X and Y), then verifies zero cross-visibility at every data access point.

**Acceptance Criteria:**
- [ ] Test: business_A cannot read business_B's plans via API
- [ ] Test: brand_X analytics are not visible to brand_Y admin
- [ ] Test: business user cannot read any brand's private analytics
- [ ] Test: system (AI) actor cannot read across plan boundaries
- [ ] Tests run on every PR before merge (CI gate)

**Test Requirements:**
- Playwright E2E test suite with dedicated tenant isolation spec
- Tests must use actual Supabase test environment (not mocks)

**Rollout Notes:** Requires test Supabase project configuration. Blocks brand partner launch.

---

## P1 — Core UX + Economics Engine

---

### P1-001 — Build: Revenue Simulator
**Impact:** Conversion (highest-leverage upgrade trigger) / Revenue
**Scope:** New `src/pages/business/RevenueSimulator.tsx`, route `/portal/plans/:id/simulate`

**What to build:**
A dynamic, editable revenue projection tool linked to a business's plan analysis.

**Inputs (editable):**
- Sessions per week per protocol (slider, 1–20, default from gap analysis estimate)
- Average service price ($, default from industry benchmark)
- Retail attach rate (%, slider 0–80%, default 25%)
- Average retail transaction value ($, default from retail_products avg MSRP)
- COGS % (slider 10–40%, default by category)
- Weeks per year operating (slider 20–52, default 48)

**Outputs:**
- Annual service revenue uplift ($X,XXX – $X,XXX range)
- Annual retail revenue uplift
- Combined annual uplift
- Monthly run rate (conservative / optimistic)
- Payback period on opening order (in months)
- Gross margin estimate

**Rules:**
- All numbers shown as ranges, never single values
- "Methodology" expandable disclaimer on every output panel
- "Reset to defaults" button
- Save simulator state per plan (new table: `revenue_simulations`)
- "Order products to capture this opportunity →" CTA pre-populates cart
- Behind Growth tier paywall (free users see read-only preview with locked inputs)

**Acceptance Criteria:**
- [ ] Simulator inputs update outputs in real-time (< 100ms)
- [ ] All number fields validate range (no negative numbers, no >$10,000/session)
- [ ] Range outputs (conservative/optimistic) visible at all times
- [ ] Methodology disclosure visible without clicking (collapsed accordion, not hidden)
- [ ] CTA links to `/portal/shop/pro` with pre-filtered brand + protocol SKUs
- [ ] State saved on navigation away, restored on return
- [ ] Mobile: single-column stack, all sliders accessible via touch

**Test Requirements:**
- Unit tests for revenue calculation functions
- Snapshot tests for output formatting (range display, payback period)
- E2E: adjust sliders → verify outputs update

**Rollout Notes:** Requires gap analysis to be functional (plan outputs exist). Ship after P0-001 is fixed.

---

### P1-002 — Build: Gap Detail Page (Opportunity Detail)
**Impact:** Revenue (direct link from gap to order) / Conversion
**Scope:** New `src/pages/business/GapDetail.tsx`, route `/portal/plans/:id/gaps/:gapId`

**What to build:**
Single gap detail page. This is the "narrative page" that turns an abstract gap into a concrete business opportunity.

**Content sections:**
1. **Service Concept** — plain English description of the opportunity
2. **Recommended Protocol** — canonical protocol details (steps, duration, skin types)
3. **Required Products** — table: SKU, wholesale price, MSRP, usage per service, cost per service, margin per service
4. **Revenue Model** — simplified version of simulator for this one gap
5. **Training Requirements** — estimated hours, certification, prerequisites
6. **Implementation Timeline** — "Week 1: order products, Week 2–3: staff training, Week 4: launch"
7. **Brand Assets** — links to education PDFs, training videos
8. **Order CTA** — "Start Order" button pre-populated with required SKUs

**Acceptance Criteria:**
- [ ] Page loads from gap list in < 1 second (data already in plan outputs JSON)
- [ ] Revenue model shows range (not single number)
- [ ] "Start Order" CTA pre-populates cart with required SKUs and correct quantities
- [ ] Training requirements show training_complexity from `implementation_readiness`
- [ ] Mobile: all sections stacked, CTA always visible (sticky bottom)

**Test Requirements:**
- Unit test: gap data renders correctly
- E2E: click gap → verify CTA pre-populates cart

**Rollout Notes:** Depends on gap analysis data structure in plan outputs. Coordinate with P1-001.

---

### P1-003 — Build: Commerce Layer (PRO + Retail Shop + Ordering)
**Impact:** Revenue (transaction commission) / P0 for brand monetization
**Scope:** New `src/pages/business/ProShop.tsx`, `src/pages/business/RetailShop.tsx`, `src/pages/business/OrderHistory.tsx`, new `order_items` table, checkout flow

**What to build:**
Complete ordering workflow for PRO (backbar) and retail products.

**Shop features:**
- Product catalog with brand/protocol/category filters
- Product card: image, name, SKU, wholesale price, MSRP, estimated margin, min order qty
- "Protocols that use this product" link on each product
- Add to cart with qty selector
- Cart: line items, subtotal, estimated shipping (TBD), order total
- Checkout: shipping address, payment method (handled externally for now — order confirmation only)
- Order confirmation + tracking number field (admin-managed)

**Missing DB tables to create:**
- `order_items` (order_id, product_id, product_type, qty, unit_price, line_total)
- `shipping_addresses` (business_id, address fields, is_default)
- `commission_ledger` (order_id, brand_id, commission_rate, commission_amount, payout_amount, status)

**Acceptance Criteria:**
- [ ] Products filterable by brand, category, protocol
- [ ] Cart persists across sessions (localStorage or DB)
- [ ] Order creates records in `orders` + `order_items`
- [ ] Admin receives notification of new order
- [ ] Brand admin sees new order in `/brand/orders`
- [ ] Commission record created on order confirmation
- [ ] Order history shows all past orders with reorder button
- [ ] Mobile: full checkout flow usable

**Test Requirements:**
- E2E: add products to cart → checkout → verify order + order_items created
- E2E: verify commission_ledger record created
- Unit: cart total calculation

**Rollout Notes:** Requires brand catalog to be complete (products with pricing). Coordinate with brand onboarding.

---

### P1-004 — Build: Activation Kit Generator
**Impact:** Retention (tangible output increases stickiness) / Conversion (paid tier value)
**Scope:** New `src/pages/business/ActivationKit.tsx`, new Supabase Edge Function `generate-activation-kit`

**What to build:**
AI-generated activation kit for implementing a brand. Output package includes:
1. **Menu redesign suggestion** — services added/renamed/repriced
2. **New service pricing guidance** — with margin targets
3. **Retail product scripts** — per service, client-facing language
4. **Staff training plan** — by role + timeline
5. **Client communication template** — email/text announcing new service
6. **Retail bundle suggestions** — product + service bundles with pricing

**Generation flow:**
- User clicks "Generate Activation Kit" on Plan Results
- Edge Function called with plan_id → reads plan outputs + brand protocols + business context
- Claude generates kit content
- Results saved to `activation_assets` table (new)
- User sees generated kit with per-asset download buttons

**Export formats:**
- Per-asset: Download as PDF
- Full kit: Download as ZIP
- Share link: Read-only URL (expires after 30 days)

**Acceptance Criteria:**
- [ ] Generation completes in < 45 seconds
- [ ] All 6 asset types generated per plan
- [ ] Business name + brand name appear in generated content (not generic)
- [ ] PDF exports are print-ready (legible, branded)
- [ ] Share link accessible without login
- [ ] Regeneration possible (overrides existing assets)
- [ ] Behind Growth tier paywall

**Test Requirements:**
- E2E: trigger generation → verify 6 assets created in activation_assets
- Integration: Edge Function returns valid kit JSON
- Manual: review kit quality for 3 test plans

**Rollout Notes:** Requires Claude API access via Edge Function. Coordinate with existing ai-concierge edge function pattern.

---

### P1-005 — Build: Revenue Opportunity Paywall (Gap Analysis Gate)
**Impact:** Conversion (primary paid tier trigger)
**Scope:** `src/pages/business/PlanResults.tsx`, gap tab component

**What to build:**
Free users see 2–3 gap results. Remaining gaps are locked behind a "Upgrade to Growth" gate. The gate shows an aggregate dollar range for the locked gaps (not a list of what's behind it).

**Gate design:**
```
[3 gap cards visible]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒  5 more revenue opportunities identified
    Estimated additional uplift: $4,200 – $6,800/month
    [Unlock All Gaps — Growth Plan $79/mo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Rules:**
- Never show blurred/greyed gap titles — show aggregate value instead
- Gate appears after the 2nd or 3rd gap (A/B test which converts better — ASSUMPTION: 3rd)
- Gate copy is specific to this user's plan (uses their actual gap count and dollar range)
- Clicking "Unlock" opens upgrade modal (or navigates to `/portal/billing`)
- After upgrade, page refreshes and shows all gaps

**Acceptance Criteria:**
- [ ] Free tier users see exactly 3 gaps + gate
- [ ] Gate shows correct count and correct dollar range for their specific plan
- [ ] Upgrade flow is < 3 clicks from gate to paid access
- [ ] After upgrade, all gaps visible immediately
- [ ] Paid users never see the gate

**Test Requirements:**
- E2E: free user views plan → gap gate appears after 3rd gap
- E2E: user upgrades → gate disappears → all gaps visible
- Unit: tier check logic

**Rollout Notes:** Requires subscription tier field on user_profiles or subscriptions table. Coordinate with billing integration.

---

### P1-006 — Build: Business Subscription Tier System
**Impact:** Revenue (SaaS recurring) / unlocks all paywall mechanics
**Scope:** New `subscriptions` table, `src/pages/business/Billing.tsx`, tier-checking utility

**What to build:**
Subscription management for business users. Three tiers: Starter (free), Growth, Pro.

**New table: `subscriptions`**
```sql
subscriptions (
  id uuid,
  entity_id uuid,          -- business_id or brand_id
  entity_type text,        -- 'business' | 'brand'
  tier text,               -- 'starter' | 'growth' | 'pro' | 'partner' | 'featured'
  status text,             -- 'active' | 'trialing' | 'past_due' | 'cancelled'
  current_period_start timestamptz,
  current_period_end timestamptz,
  payment_provider text,   -- 'stripe' (future)
  provider_subscription_id text,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Tier checking utility:**
```typescript
// src/lib/subscription.ts
useSubscription() → { tier, canAccess(feature) }
canAccess('gap_analysis_full') // boolean
canAccess('revenue_simulator')
canAccess('activation_kit')
```

**Billing page:**
- Current plan display
- Upgrade/downgrade options
- Invoice history
- Cancel subscription flow (with retention modal)

**Acceptance Criteria:**
- [ ] `subscriptions` table created with RLS (business can read own, admin reads all)
- [ ] `canAccess(feature)` utility used consistently across all gated features
- [ ] Billing page shows current tier + upgrade paths
- [ ] Downgrade preserves data (plans, outputs retained, just gated)
- [ ] Admin can manually override tier for any business (support use case)

**Test Requirements:**
- Unit: canAccess() returns correct boolean for each tier × feature
- E2E: free user attempts to access simulator → blocked
- E2E: admin upgrades user → simulator accessible

**Rollout Notes:** Payment processing (Stripe) is out of scope for initial build. Admin manually manages subscriptions. Payment integration is P2.

---

### P1-007 — Build: Menu Quality Pre-Check Before Analysis
**Impact:** Trust / recommendation quality
**Scope:** `src/lib/menuOrchestrator.ts`, `src/pages/business/PlanWizard.tsx`

**What to build:**
Before running full analysis, validate the uploaded/pasted menu meets minimum quality thresholds.

**Checks:**
1. Minimum text length: > 100 characters
2. Minimum services detected: > 3 (use service name heuristics)
3. At least 1 service has a price or duration
4. Not a lorem ipsum / test upload (check for common test strings)

**If checks fail:**
- Don't run analysis
- Show specific, actionable feedback: "We detected only 1 service. For best results, paste your full menu with all services and prices."
- Allow user to edit and retry
- Never silently run a low-quality analysis

**If checks pass but quality is low:**
- Run analysis
- Show yellow banner: "Your menu had limited information. Add pricing and service descriptions to improve recommendation quality."

**Acceptance Criteria:**
- [ ] Analysis blocked if < 3 services detected
- [ ] Specific error messages per failure type
- [ ] Low-quality warning banner visible but not blocking
- [ ] Quality check completes in < 200ms (synchronous, not async)

**Test Requirements:**
- Unit tests for each quality check function
- E2E: upload minimal menu → see quality error
- E2E: upload good menu → no error, analysis runs

**Rollout Notes:** No dependencies. Can ship before P0-001.

---

### P1-008 — Build: Brand Analytics Dashboard (Real Data)
**Impact:** Brand retention / brand tier upsell / brand trust
**Scope:** `src/pages/brand/Dashboard.tsx`, `src/pages/brand/Analytics.tsx` (new), `brand_analytics` table

**What to build:**
Brand analytics dashboard showing actual performance data (not hardcoded mock values).

**KPIs:**
- Total businesses that have analyzed this brand's protocols (this month / all time)
- Total services mapped to their protocols (match rate %)
- Pipeline value = sum of estimated service revenue for all mapped protocols
- Revenue in orders (actual orders placed for their products)
- Adoption rate trend (week-over-week)

**Strict data boundary rules:**
- Business names NEVER shown
- Individual plan data NEVER shown
- All metrics are aggregated counts and values
- "Sponsored" label must appear on any placement analytics

**Acceptance Criteria:**
- [ ] All KPIs sourced from real DB queries (no hardcoded values)
- [ ] Zero business-identifying information surfaced to brand
- [ ] Analytics refresh daily (not real-time — real-time is P2)
- [ ] Loading skeleton while data loads
- [ ] Error state if query fails
- [ ] Brand admin cannot query competitor brand data (RLS enforced + tested)

**Test Requirements:**
- E2E: verify brand_A cannot see brand_B analytics via API
- Integration: analytics queries return correct aggregated values
- Unit: anonymization function removes identifying fields

**Rollout Notes:** Requires `brand_analytics` table to be populated by plan analysis jobs.

---

### P1-009 — Build: Onboarding Wizard (Business)
**Impact:** Activation rate / first-session wow moment
**Scope:** New `src/pages/business/Onboarding.tsx`, route `/portal/onboarding`

**What to build:**
4-step onboarding wizard for new business users. Replaces cold dashboard entry.

**Steps:**
1. **Business profile** — business name, type (spa/salon/medspa/barbershop), location, size (1–5/6–15/15+ staff)
2. **Service focus** — select primary service categories (facial, massage, body, nails, medspa, hair) — multi-select, max 4
3. **Menu upload** — upload PDF/DOCX or paste (same as PlanWizard step 2, but simpler UI with explicit "drag and drop" zone)
4. **Brand interest** — "What are you looking for?" (discover new brands / evaluate a specific brand / optimize existing brand / all of the above)

**After completion:**
- Navigate directly to Plan Wizard (step 3 — brand selection — pre-filtered by their service focus)
- OR if they have an existing plan already: navigate to that plan

**Progress persistence:**
- Save progress step-by-step (don't lose input if user closes tab)
- If user closes and returns: "Welcome back! Continue where you left off →"

**Acceptance Criteria:**
- [ ] 4 steps, max 2 minutes to complete
- [ ] Each step has clear "why we're asking this" subtitle
- [ ] Skip allowed on step 4 (brand interest is optional)
- [ ] Progress saved after each step (localStorage or Supabase)
- [ ] Completion triggers first plan creation automatically
- [ ] Mobile: full wizard works on mobile

**Test Requirements:**
- E2E: complete wizard → verify plan created, user on plan results
- E2E: partial completion → return → verify progress restored

**Rollout Notes:** Must coordinate with PlanWizard. Onboarding wizard essentially replaces the first two steps of PlanWizard for new users.

---

### P1-010 — Fix: Plain Language Audit of All UI Strings
**Impact:** Conversion / Abandonment reduction
**Scope:** All UI components, primarily `src/pages/business/PlanResults.tsx` and gap/analysis components

**What to do:**
Audit every user-facing string in the business portal for technical jargon and replace with plain language.

**Known offenders:**
| Current | Replace With |
|---|---|
| "Canonical protocol" | "Service protocol" or just "Protocol" |
| "Retail attach recommendation" | "Products to recommend after this service" |
| "pgvector confidence" | (never surface this) |
| "spa_service_mapping" | (never surface this) |
| "Match type: partial" | "Partial match — review recommended" |
| "Confidence: 0.73" | "Good match (73%)" |
| "Source type: pdf" | "Uploaded as PDF" |
| "submission_status: under_review" | "Being reviewed by our team" |

**Acceptance Criteria:**
- [ ] Zero technical database/system terminology visible in business portal
- [ ] All confidence scores display as plain English + percentage ("Strong match", "Good match", "Partial match", "No match")
- [ ] All status fields display human-readable labels

**Test Requirements:**
- Manual review pass by a non-technical tester (actual spa owner if possible)

**Rollout Notes:** Low-risk text changes. Ship as quick wins alongside other P1 work.

---

## P2 — Automation + Scale

---

### P2-001 — Build: Monthly Optimization Loop (Automated Insights)
**Impact:** Retention / repeat usage
**Scope:** New scheduled Edge Function `generate-monthly-insights`, email template, in-app notification

**What to build:**
Monthly automated email + in-app notification for business users with:
- "Your plan is X days old"
- Seasonal service recommendations matching their service categories
- Reorder alert if applicable
- New brands added that match their profile
- One clear CTA

**Rollout Notes:** Requires email service integration (Supabase email or SendGrid). P2 after core product stable.

---

### P2-002 — Build: Reorder Trigger System
**Impact:** Repeat transaction revenue
**Scope:** `orders` table, new scheduled job, notification system

**Logic:** Calculate estimated depletion date per order based on usage. Alert 7 days before estimated depletion.

---

### P2-003 — Build: Brand Catalog Change Management
**Impact:** Data integrity / trust
**Scope:** `pro_products`, `retail_products`, new `brand_catalog_changelog` table

**What to build:** SKU lifecycle fields (status, discontinued_at, replaces_product_id). Alert system for plans affected by discontinued products. Plan staleness indicator (>90 days old).

---

### P2-004 — Build: Brand Completeness Score + Gating
**Impact:** Recommendation quality / brand trust
**Scope:** `src/pages/admin/BrandAdminEditor.tsx`, `src/pages/brand/Dashboard.tsx`

**Logic:** Brand not discoverable until catalog completeness > 70%. Score shown in brand dashboard and admin view.

---

### P2-005 — Build: Supabase Realtime Adoption for Brand Analytics
**Impact:** Brand engagement
**Scope:** `src/pages/brand/Analytics.tsx`

Replace daily refresh with Supabase Realtime for near-live analytics updates.

---

### P2-006 — Build: Practitioner Portal (Protocol Viewer)
**Impact:** Retention / daily active users / staff adoption
**Scope:** New `src/pages/staff/` portal, `practitioner` role in auth

Mobile-first, protocol step viewer for staff. No financial data. Training module completion tracking.

---

### P2-007 — Build: Payment Integration (Stripe)
**Impact:** Revenue (removes manual billing)
**Scope:** New Supabase Edge Function `stripe-webhook`, `subscriptions` table, billing UI

Integrate Stripe for business subscription billing and brand subscription billing. Commission collection via Stripe Connect (brands receive payouts directly).

---

### P2-008 — Build: Plan Comparison Tool
**Impact:** Decision support / brand selection conversion
**Scope:** New `src/pages/business/PlanComparison.tsx`

Side-by-side comparison of 2–4 brands across fit score, revenue uplift, complexity, min opening order, training requirements.

---

### P2-009 — Build: CSV/PDF Export for Admin
**Impact:** Ops efficiency
**Scope:** Admin pages that already have client-side CSV

Currently CSV export includes all data with no PII filtering. Build proper export with field-level controls and audit logging.

---

### P2-010 — Build: Business Manager Role
**Impact:** Expansion (seat-based revenue) / multi-user teams
**Scope:** `user_profiles` table, role system, invitation flow

Add `business_manager` as a distinct role from `business_owner`. Managers can execute but not subscribe/unsubscribe/delete.

---

## P3 — Polish

### P3-001 — Skeleton Loading for Business Dashboard Stat Cards
**Scope:** `src/pages/business/Dashboard.tsx`
Currently has no loading skeleton. Add `StatCardSkeleton` components during initial load.

### P3-002 — Error States for Brand Dashboard
**Scope:** `src/pages/brand/Dashboard.tsx`
Has no error state for failed fetches. Add `ErrorState` component with retry.

### P3-003 — Password Confirmation on Signup
**Scope:** `src/pages/business/Signup.tsx`
No confirm password field. Add standard UX.

### P3-004 — Email Format Validation on Forgot Password
**Scope:** `src/pages/public/ForgotPassword.tsx`
Add regex validation on email field before submit.

### P3-005 — Remove Debug console.log from Signup
**Scope:** `src/pages/business/Signup.tsx` lines 27–29
Production code should not contain debug logs.

### P3-006 — Toast Notifications for API Errors (Business Portal)
**Scope:** All business portal pages
API errors currently use state-based alert components. Switch to `Toast` component (already built) for consistency.

### P3-007 — Pagination for Brand Directory
**Scope:** `src/pages/public/Brands.tsx`, `src/pages/business/PortalHome.tsx`
Currently loads all brands. Add pagination or infinite scroll for scale.

### P3-008 — File Size Validation in Plan Wizard
**Scope:** `src/pages/business/PlanWizard.tsx`
No file size limit check on upload. Add: max 10MB, specific error message if exceeded.

---

## Priority Summary

| Priority | Ticket Count | Key Theme | Required Before |
|---|---|---|---|
| P0 | 7 tickets | Security, bugs, data integrity | Any user-facing launch |
| P1 | 10 tickets | Core UX, economics engine, commerce | Paid tier launch |
| P2 | 10 tickets | Automation, scale, new roles | Growth phase |
| P3 | 8 tickets | Polish, edge cases | Ongoing |

**Minimum viable launch sequence:**
P0-001 → P0-002 → P0-003 → P0-004 → P0-005 → P0-006 → P0-007 (all P0s in parallel)
Then: P1-007 → P1-009 → P1-001 → P1-002 → P1-005 → P1-006 → P1-003 → P1-004 → P1-008 → P1-010

---

*Last updated: 2026-02-22 | Owner: Platform Architecture + Product Design*
