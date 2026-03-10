# SOCELLE GLOBAL — MASTER ACTION PLAN
# Generated: 2026-03-10 | Source: 6-Lane Site Audit (Lanes A–F)
# Authority: Every item increases DATA density, PRESS credibility, or VALUE per session.
# Rule: NO changes unless they increase DATA / PRESS / VALUE.

---

## AUDIT VERDICT SUMMARY

| Lane | Mission | Verdict |
|------|---------|---------|
| A — Site Map + Journeys | 289 routes, 10 journeys mapped | **FAIL** |
| B — Intelligence Hub Deep Audit | 10 modules scored | **FAIL** |
| C — API / Edge / Data Flow | 35 edge functions, 11 external APIs | **FAIL** |
| D — Shell Detection + States | 17 flagged, 10 true shells | **FAIL** |
| E — Copy + Launch Comms | 5 public pages audited | **FAIL** |
| F — Intelligence Merchandising | 12 FEED-MERCH rules scored | **FAIL** |

**All 6 lanes FAIL.** Platform is not launch-ready. Work below is the minimum required path to launch gate.

---

## P0 — STOP CONDITIONS (fix before any new WO begins)

These are §9 stop conditions. They block ALL other work until resolved.

### P0-1: "unlock" banned term — 8 violations (§9.4 STOP CONDITION)
- **Impact:** Copy compliance, brand voice, legal risk
- **Files:** `UpgradeGate.tsx` (5×), `Education.tsx`, `BrandStorefront.tsx`, `HelpCenter.tsx`
- **Fix:** Replace all 8 with intelligence-vocabulary equivalents
  - "Unlock Pro" → "Access Pro Intelligence"
  - "Unlock full access" → "Get full signal access"
  - "Unlock this feature" → "Activate with Pro"
- **WO:** `COPY-WO-01` (proposed)
- **Skill:** `banned-term-scanner` must return 0 violations

### P0-2: Education.tsx serving mock data without DEMO label (§8 VIOLATION)
- **Impact:** Fake-live surface — users see mock content as real
- **File:** `src/pages/public/Education.tsx` — `useEducation()` wraps `mockContent`, no isLive guard, no DEMO label
- **Fix:** Add DEMO label OR wire to live `brand_training_modules` table (preferred)
- **WO:** `SHELL-WO-01` (proposed)
- **Skill:** `live-demo-detector` must return 0 violations on this file

### P0-3: BrandAIAdvisor.tsx serving mock data without DEMO label (§8 VIOLATION)
- **Impact:** `RECENT_SIGNALS` hardcoded, AI uses `mockAdvisor` — user sees fabricated intelligence
- **File:** `src/pages/brand/BrandAIAdvisor.tsx`
- **Fix:** Add DEMO label immediately; full wire is BRAND-WO scope
- **WO:** `SHELL-WO-01` (covers both Education + BrandAIAdvisor)
- **Skill:** `live-demo-detector`

### P0-4: IntelligenceCommerce.tsx missing isLive guard
- **Impact:** `useIntelligence()` called but no LIVE/DEMO badge — violates §8
- **File:** `src/pages/business/IntelligenceCommerce.tsx`
- **Fix:** Add isLive guard pattern (same as other intelligence pages)
- **WO:** `SHELL-WO-01`
- **Skill:** `live-demo-detector`

### P0-5: Cart.tsx `'Shop Now'` CTA (§9 STOP CONDITION)
- **Impact:** Commerce CTA in primary position violates intelligence-first IA
- **File:** `src/pages/public/Cart.tsx:84`
- **Fix:** Replace with `'View Order'` or remove from intelligence-facing surfaces
- **WO:** `COPY-WO-01`

### P0-6: Brief Generator credit deduction is display-only
- **Impact:** Users are charged credits but no real AI call is made — fraudulent billing
- **File:** Brief generation component — uses `DEMO_SIGNALS` + `DEMO_BRIEF` constant; ai-orchestrator never invoked
- **Fix:** Wire to `ai-orchestrator` edge function with real signal input OR add DEMO label + disable credit deduction
- **WO:** `INTEL-WO-12` (proposed — AI toolbar wire)
- **Skill:** `credit-deduction-integration-tester`

---

## P1 — DATA DENSITY (core intelligence value, ≤7 days)

These items directly increase signal volume, quality, and correctness. Each maps to DATA.

### P1-1: RSS pipeline activation (0 RSS signals in production)
- **Impact:** 100% of feed-sourced signals are FDA safety-only. Topic diversity = 0. FEED-MERCH-09 FAIL.
- **Root cause:** feed-orchestrator pg_cron schedule may not be registered OR `data_source` FK not set on insert
- **Fix:** Confirm pg_cron job active → manually trigger → verify RSS signals appear with varied topics
- **WO:** `FEED-WO-06` (proposed — RSS activation)
- **Skills:** `pg-cron-scheduler-validator`, `feed-pipeline-checker`

### P1-2: ingest-openfda pg_cron (FDA signals will stop refreshing)
- **Impact:** OpenFDA is the only active signal source. Without cron it will not auto-refresh.
- **Fix:** Register pg_cron job for `ingest-openfda` similar to `feed-orchestrator`
- **WO:** `FEED-WO-06` (same WO)
- **Skill:** `pg-cron-scheduler-validator`

### P1-3: `normalizeSignalTitle()` missing from both edge functions
- **Impact:** ALL CAPS titles ("RADIOFREQUENCY PROBE"), sensationalist openers in production signals
- **Files:** `feed-orchestrator/index.ts`, `rss-to-signals/index.ts`
- **Fix:** Inline `normalizeSignalTitle()` per INTEL-MERCH-01 P5 spec
- **WO:** `MERCH-INTEL-02-FIX` (in progress)
- **Skill:** `intelligence-merchandiser` FEED-MERCH-08 must flip to PASS

### P1-4: `tier_visibility` hardcoded `'free'` in `rowToSignal()`
- **Impact:** Tier filter always bypassed — paid signals visible to free users
- **File:** `src/lib/intelligence/useIntelligence.ts`
- **Fix:** Map `row.tier_visibility` from DB instead of hardcoded value
- **WO:** `MERCH-INTEL-02-FIX`

### P1-5: AdminFeedsHub.tsx ignores `display_order`
- **Impact:** Admin curation of signal order has zero effect on what users see
- **File:** `src/pages/admin/AdminFeedsHub.tsx` — orders by `category+name`, never reads `display_order`
- **Fix:** Add `display_order` sort control to admin feed table
- **WO:** `MERCH-INTEL-02-FIX`
- **Skill:** `intelligence-merchandiser` FEED-MERCH-11 must flip to PASS

### P1-6: medspa feed coverage: 28 of ≥30 needed
- **Impact:** MERCH-INTEL-02 coverage gate FAIL
- **Fix:** Add 2 more medspa-vertical enabled feeds (Phase 1.2+ of owner's feed expansion directive)
- **WO:** `MERCH-INTEL-02` (current)

### P1-7: Brand Intelligence Hub — all static JS, zero DB queries
- **Impact:** Brand portal intelligence KPIs, SKU tables, operator data are all fabricated
- **File:** `src/lib/brandPortalIntelligence.ts` + brand portal intelligence pages
- **Fix:** Wire to `market_signals` + `brands` + product tables via TanStack Query
- **WO:** `BRAND-WO-06` (proposed)
- **Skill:** `live-demo-detector`, `intelligence-hub-api-contract`

### P1-8: Near-duplicate FDA MDR device records (54% of medspa signals)
- **Impact:** Feed is dominated by near-identical device safety records — editorial quality low
- **Fix:** Add same-device dedup logic in `ingest-openfda` per INTEL-MERCH-01 P4 spec
- **WO:** `MERCH-INTEL-02-FIX`
- **Skill:** `deduplication-logic-checker`

---

## P1 — PRESS CREDIBILITY

These items increase source attribution, provenance display, and trust signals.

### P1-9: Provenance Tier never displayed to users
- **Impact:** Source authority (Tier 1/2/3) is computed but hidden — users cannot assess signal quality
- **File:** SignalCard / SignalDetailPanel components
- **Fix:** Display provenance tier badge (Tier 1 = peer-reviewed, Tier 2 = trade pub, Tier 3 = social)
- **WO:** `INTEL-UI-01` (proposed)
- **Skill:** `intelligence-hub-api-contract`

### P1-10: 12 signals with null fingerprint (OpenFDA batch)
- **Impact:** Deduplication by fingerprint cannot protect these records — FEED-MERCH-07 WARN
- **File:** `ingest-openfda/index.ts`
- **Fix:** Compute and write fingerprint on all OpenFDA inserts
- **WO:** `MERCH-INTEL-02-FIX`

---

## P1 — VALUE PER SESSION

### P1-11: Saved Searches component never mounted (dead code)
- **Impact:** Hook + component fully built but zero users can access saved searches or alerts
- **Fix:** Mount `<SavedSearches />` on `/intelligence` and `/portal/intelligence` pages
- **WO:** `INTEL-UI-01`
- **Skill:** `intelligence-hub-api-contract`

### P1-12: Opportunity Finder Create Deal / Add to Plan are silent no-ops
- **Impact:** Cross-hub value chain broken — the primary "signal → revenue action" path is dead
- **Fix:** Wire callbacks from OverviewTab → OpportunitySignals → CrossHubActionDispatcher
- **WO:** `INTEL-UI-01`

### P1-13: RequestAccess success state dead-ends (no CTA to /portal/signup)
- **Impact:** Conversion funnel drops every visitor who submits an access request
- **File:** `src/pages/public/RequestAccess.tsx` — success state has no next-step CTA
- **Fix:** Add "Check your email + Sign up now" CTA pointing to `/portal/signup`
- **WO:** `FUNNEL-WO-01` (proposed)

### P1-14: /for-brands CTA routes to /request-access not /brand/apply
- **Impact:** Brand acquisition funnel broken in 2 places
- **File:** `src/pages/public/ForBrands.tsx`
- **Fix:** Primary CTA → `/brand/apply`, secondary → `/request-access`
- **WO:** `FUNNEL-WO-01`

---

## P2 — SYSTEMIC IMPROVEMENTS (≤30 days)

### P2-1: No exports anywhere in Intelligence Hub (CSV/PDF/social)
- **Impact:** Zero ability to take signals outside platform — VALUE = 0 for power users
- **Fix:** Add CSV export to signal list; PDF brief export for Pro+
- **WO:** `INTEL-EXPORT-01` (proposed)

### P2-2: Stripe checkout missing from upgrade path
- **Impact:** Users cannot upgrade — the entire monetization funnel is broken
- **File:** `/portal/subscription` has `// TODO: Wire to Stripe` comment
- **Fix:** Wire `create-checkout` edge function to subscription page
- **WO:** `PAY-WO-06` (proposed — Stripe upgrade path)
- **Skill:** `stripe-integration-tester`

### P2-3: Price mismatch: $29/mo (UpgradeGate) vs $149/mo (Plans.tsx)
- **Impact:** Users see different prices depending on entry point — legal/billing risk
- **Fix:** Single source of truth for pricing (read from Stripe price IDs or constants file)
- **WO:** `PAY-WO-06`

### P2-4: database.types.ts drift (116 tables vs 165 migrations)
- **Impact:** All new hooks using newer tables lack TypeScript types — tsc drift will accumulate
- **Fix:** `supabase gen types typescript` and commit
- **WO:** `SCHEMA-WO-01` (proposed)
- **Skill:** `database-types-generator`

### P2-5: CrossHubDispatcher lands on hub page without signal context
- **Impact:** User arriving from "Create Deal from Signal" lands on sales dashboard — signal context lost
- **Fix:** Pre-populate `location.state.fromSignal` on receive-side (Sales, CRM, Marketing)
- **WO:** `INTEL-UI-01`

### P2-6: 7 duplicate hook pairs in src/lib/
- **Fix:** Consolidate per `hook-consolidator` skill findings
- **WO:** `DEBT-HOOKS-01` (proposed)
- **Skill:** `hook-consolidator`

### P2-7: useEnrichment.ts raw useEffect violation (P0-3)
- **Fix:** Migrate to TanStack Query
- **WO:** `DEBT-TANSTACK-7` (proposed)
- **Skill:** `dev-best-practice-checker`

### P2-8: 20 routes unreachable from MainNav
- **Includes:** `/protocols`, `/ingredients`, `/search`, `/api/docs`, `/api/pricing`, `/for-medspas`, `/for-salons`
- **Fix:** Add to nav or add internal links from relevant hub pages; deprecate `/courses/*` duplicate tree
- **WO:** `NAV-WO-01` (proposed)

### P2-9: Shell detector false positives (7 pages)
- **Fix:** Extend `shell-detector.mjs` LIVE_PATTERNS list with domain hook names
- **WO:** `FOUND-WO-04-EXT` (proposed — extends existing FOUND-WO-04)

### P2-10: EmptyState used on only 12 of 254 pages
- **Fix:** Audit and add EmptyState to all list/table surfaces during hub WO execution
- **WO:** Woven into each hub WO (not standalone)
- **Skill:** `empty-state-enforcer`

---

## DEPENDENCY GATES

```
P0-1..6 must ALL pass → before any P1/P2 starts
P1-1 (RSS activation) → before P1-3 (normalizeSignalTitle can be tested)
P1-4 (tier_visibility) → before P2-2 (Stripe upgrade meaningful)
P1-6 (medspa feed ≥30) → MERCH-INTEL-02 coverage gate clears
P2-4 (types regen) → before P2-6 (hook consolidation safe)
P2-2 (Stripe upgrade path) → before P2-3 (price mismatch resolution)
```

---

## FROZEN PATHS (NEVER TOUCH)
- `src/lib/auth.tsx` — NEVER MODIFY
- `src/lib/useCart.ts` — NEVER MODIFY
- `supabase/functions/create-checkout/` — FROZEN
- `supabase/functions/stripe-webhook/` — FROZEN
- All portal routes without explicit WO in build_tracker.md

---

*Rule: If a change does not increase DATA density, PRESS credibility, or VALUE per session — do not make it.*
