# SOCELLE GLOBAL — WORK ORDER BACKLOG
# Generated: 2026-03-10 | Source: 6-Lane Site Audit
# Status: PROPOSED — All WO IDs must be added to build_tracker.md before execution begins
# Authority: build_tracker.md is the sole execution authority for WO IDs

> **NON-EXECUTION DOCUMENT**
> This is historical/context only. Execution authority is docs/build_tracker.md. Governance is /.claude/CLAUDE.md.

---

## WO: COPY-WO-01
**Title:** Banned Terms Sweep + Stop Condition Fixes
**Priority:** P0
**Objective:** Remove all §9 stop-condition copy violations from user-facing surfaces
**Scope boundaries:** Copy only — do NOT modify logic, DB queries, or layout
**Target files:**
- `src/components/UpgradeGate.tsx` — 5× "unlock" (paywall titles + button CTA)
- `src/pages/public/Education.tsx` — 1× "unlock"
- `src/pages/public/BrandStorefront.tsx` — 1× "unlock"
- `src/pages/public/HelpCenter.tsx` — 1× "unlock"
- `src/pages/public/Cart.tsx:84` — "Shop Now" CTA

**Replacements:**
- "Unlock Pro" → "Access Pro Intelligence"
- "Unlock full access" → "Get full signal access"
- "Unlock [feature]" → "Activate with Pro"
- "Shop Now" → "View Order" (or appropriate context-aware label)

**Acceptance tests:**
```bash
npx tsc --noEmit  # 0 errors
grep -rn "unlock\|Shop Now" src/pages/public/ src/components/UpgradeGate.tsx  # 0 results
```
**Required proof pack:** `docs/qa/verify_COPY-WO-01_<timestamp>.json`
**Required skills:** `banned-term-scanner` (0 violations), `build-gate` (PASS)

---

## WO: SHELL-WO-01
**Title:** P0 Mock-Data DEMO Labels + isLive Guards
**Priority:** P0
**Objective:** Add DEMO labels to all surfaces serving mock data without a label — §8 compliance
**Scope boundaries:** Labels and isLive guard pattern only — do NOT wire to live data (separate WO per hub)
**Target files:**
- `src/pages/public/Education.tsx` — add DEMO banner, isLive guard
- `src/pages/brand/BrandAIAdvisor.tsx` — add DEMO banner
- `src/pages/business/IntelligenceCommerce.tsx` — add isLive guard + LIVE/DEMO badge
- `src/pages/public/ApiDocs.tsx` — add DEMO label
- `src/pages/public/ApiPricing.tsx` — add DEMO label

**DEMO label pattern:**
```tsx
<div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
  DEMO — Sample data shown. Sign in to see live intelligence.
</div>
```

**Acceptance tests:**
```bash
npx tsc --noEmit  # 0 errors
# run live-demo-detector skill — 0 fake-live violations
```
**Required proof pack:** `docs/qa/verify_SHELL-WO-01_<timestamp>.json`
**Required skills:** `live-demo-detector` (0 violations), `build-gate` (PASS)

---

## WO: MERCH-INTEL-02-FIX
**Title:** Intelligence Feed Merchandising — P3/P4/P5 Code Fixes
**Priority:** P1
**Objective:** Close remaining INTEL-MERCH-01 open items + fix FEED-MERCH-08/09/11 FAILs
**Dependency:** SHELL-WO-01 must be complete first
**Scope boundaries:** Only the 4 allowed paths defined in intelligence-merchandiser skill
**Target files:**
- `supabase/functions/feed-orchestrator/index.ts` — add `normalizeSignalTitle()`, fix `data_source` FK, check/register pg_cron
- `supabase/functions/rss-to-signals/index.ts` — add `normalizeSignalTitle()`, set `data_source` FK on insert
- `supabase/functions/ingest-openfda/index.ts` — add same-device dedup (P4), compute fingerprint for all inserts
- `src/lib/intelligence/useIntelligence.ts` — fix `tier_visibility` hardcoded 'free' (map from DB)
- `src/pages/admin/AdminFeedsHub.tsx` — add `display_order` sort control

**Acceptance tests:**
```sql
-- At least 1 RSS-sourced signal with topic != 'safety' within 24h
SELECT COUNT(*) FROM market_signals WHERE topic != 'safety' AND created_at > NOW() - INTERVAL '24h';
-- No single topic > 40% of feed
SELECT topic, COUNT(*)*100.0/SUM(COUNT(*)) OVER() AS pct FROM market_signals GROUP BY topic;
-- pg_cron job active
SELECT jobname, active FROM cron.job WHERE jobname ILIKE '%feed%';
```
```bash
grep -r "normalizeSignalTitle" supabase/functions/  # ≥2 matches
npx tsc --noEmit  # 0 errors
```
**Required proof pack:** `docs/qa/verify_MERCH-INTEL-02-FIX_<timestamp>.json`
**Required skills:** `intelligence-merchandiser` (FEED-MERCH-08/09/11 must PASS), `pg-cron-scheduler-validator`, `feed-pipeline-checker`, `deduplication-logic-checker`

---

## WO: MERCH-INTEL-02 (coverage completion)
**Title:** Feed Quality + Coverage Expansion — medspa ≥30 gate
**Priority:** P1
**Objective:** Close the 2-feed gap (medspa currently 28, need ≥30)
**Current state:** 28 medspa enabled feeds. Gap = 2.
**Dependency:** Owner to provide 2+ additional medspa source URLs
**Target:** Add 2 medspa-vertical RSS feeds with valid endpoints
**Acceptance tests:**
```sql
SELECT COUNT(*) FROM data_feeds WHERE vertical = 'medspa' AND is_enabled = true;
-- must return ≥30
```
**Required proof pack:** `docs/qa/verify_MERCH-INTEL-02_v3.json`
**Required skills:** `intelligence-merchandiser` (FEED-MERCH-05 and FEED-MERCH-06 must show WARN or better once RSS pipeline runs)

---

## WO: INTEL-UI-01
**Title:** Intelligence Hub UI — Saved Searches, Provenance Badges, Cross-Hub Context
**Priority:** P1
**Objective:** Mount built components, fix no-op CTAs, surface provenance tier
**Dependency:** MERCH-INTEL-02-FIX (tier_visibility fix must be in place)
**Scope boundaries:** Intelligence hub pages and shared signal components only — do NOT touch portal routes without explicit per-portal approval
**Target files:**
- `src/pages/public/Intelligence.tsx` — mount `<SavedSearches />` component
- `src/pages/business/Intelligence.tsx` — mount `<SavedSearches />`, wire Opportunity Finder CTAs
- `src/components/intelligence/OpportunitySignals.tsx` — wire Create Deal / Add to Plan callbacks
- `src/components/intelligence/SignalCard.tsx` (or similar) — add provenance tier badge
- `src/pages/*/` (CRM, Sales, Marketing) — verify `location.state.fromSignal` pre-populates forms on receive-side

**Acceptance tests:**
```bash
npx tsc --noEmit  # 0 errors
# Manual: Click "Create Deal from Signal" → arrives on /portal/sales/deals with signal data pre-populated
# Manual: Saved searches panel visible on /intelligence
# Manual: Signal cards show Tier 1/2/3 badge
```
**Required proof pack:** `docs/qa/verify_INTEL-UI-01_<timestamp>.json`
**Required skills:** `intelligence-hub-api-contract`, `live-demo-detector`

---

## WO: INTEL-WO-12
**Title:** Brief Generator — Real AI Wire
**Priority:** P0/P1
**Objective:** Wire Brief Generator to `ai-orchestrator` with real signal input; remove DEMO_SIGNALS constant
**Scope boundaries:** Brief generation component and edge function wiring only — do NOT touch ai-orchestrator auth or rate-limit logic
**Target files:**
- `src/components/intelligence/` (brief generation component — identify exact file)
- Wire to `ai-orchestrator` edge function with actual signal IDs as input
- Credit deduction must be real (already implemented in ai-orchestrator — just needs correct invocation)

**Acceptance tests:**
```bash
npx tsc --noEmit  # 0 errors
# Manual: Generate a brief → credits deducted → real AI response returned (not DEMO_BRIEF constant)
grep -n "DEMO_SIGNALS\|DEMO_BRIEF" src/  # 0 results in brief generator
```
**Required proof pack:** `docs/qa/verify_INTEL-WO-12_<timestamp>.json`
**Required skills:** `credit-deduction-integration-tester`, `ai-service-menu-validator`

---

## WO: FUNNEL-WO-01
**Title:** Conversion Funnel Fixes — RequestAccess + ForBrands CTAs
**Priority:** P1
**Objective:** Repair the 2 broken acquisition funnel paths
**Scope boundaries:** CTA routing and success-state copy only — do NOT modify auth flow
**Target files:**
- `src/pages/public/RequestAccess.tsx` — success state: add "Check your email" + CTA to `/portal/signup`
- `src/pages/public/ForBrands.tsx` — primary CTA → `/brand/apply`, secondary → `/request-access`

**Acceptance tests:**
```bash
npx tsc --noEmit  # 0 errors
# Manual: Submit RequestAccess form → see success state with CTA to /portal/signup
# Manual: ForBrands primary CTA navigates to /brand/apply
```
**Required proof pack:** `docs/qa/verify_FUNNEL-WO-01_<timestamp>.json`
**Required skills:** `build-gate`, `live-demo-detector`

---

## WO: FEED-WO-06
**Title:** RSS Pipeline Activation + OpenFDA pg_cron
**Priority:** P1
**Objective:** Activate RSS pipeline so non-safety signals flow into market_signals; register ingest-openfda cron
**Dependency:** MERCH-INTEL-02-FIX (normalizeSignalTitle must be deployed first)
**Target files:**
- `supabase/migrations/` — ADD ONLY: pg_cron registration for feed-orchestrator (if missing) + ingest-openfda hourly schedule
- `supabase/functions/feed-orchestrator/index.ts` — diagnose and fix `data_source` FK gap if present
- `supabase/functions/rss-to-signals/index.ts` — confirm `data_source = feed_id` on every insert

**Acceptance tests:**
```sql
-- pg_cron jobs registered
SELECT jobname, schedule, active FROM cron.job;
-- RSS-sourced signals with variety
SELECT topic, source_name, COUNT(*) FROM market_signals
WHERE created_at > NOW() - INTERVAL '24h' AND source_name NOT ILIKE '%fda%'
GROUP BY topic, source_name;
```
**Required proof pack:** `docs/qa/verify_FEED-WO-06_<timestamp>.json`
**Required skills:** `pg-cron-scheduler-validator`, `feed-pipeline-checker`, `intelligence-merchandiser` (FEED-MERCH-09 must flip to PASS)

---

## WO: PAY-WO-06
**Title:** Stripe Upgrade Path + Price Consistency
**Priority:** P2
**Objective:** Wire `/portal/subscription` upgrade flow to `create-checkout`; resolve $29/$149 price mismatch
**Scope boundaries:** Subscription upgrade UX only — do NOT modify `create-checkout` edge function or `stripe-webhook`
**Target files:**
- `src/pages/business/Subscription.tsx` (or similar) — remove `// TODO: Wire to Stripe`, call `create-checkout`
- `src/components/UpgradeGate.tsx` — read price from Stripe constants, not hardcoded $29/mo
- `src/pages/public/Plans.tsx` — confirm $149/mo comes from same source

**Acceptance tests:**
```bash
npx tsc --noEmit  # 0 errors
grep -n "TODO.*Stripe\|\$29\|\$149" src/  # 0 hardcoded prices
# Manual: Click "Upgrade" → Stripe checkout opens with correct price
```
**Required proof pack:** `docs/qa/verify_PAY-WO-06_<timestamp>.json`
**Required skills:** `stripe-integration-tester`, `credit-economy-validator`

---

## WO: BRAND-WO-06
**Title:** Brand Intelligence Hub — Live DB Wire
**Priority:** P1
**Objective:** Replace `brandPortalIntelligence.ts` static JS with live Supabase queries
**Scope boundaries:** Brand intelligence data layer only — do NOT modify brand portal layout/nav
**Target files:**
- `src/lib/brandPortalIntelligence.ts` — replace static functions with TanStack Query hooks querying `market_signals`, `brands`, product tables
- `src/pages/brand/Intelligence.tsx` (or similar) — wire to new hooks

**Acceptance tests:**
```bash
npx tsc --noEmit  # 0 errors
grep -n "brandPortalIntelligence\|MOCK\|mock" src/lib/brandPortalIntelligence.ts  # 0 mock references
# Manual: Brand portal intelligence KPIs show real data with LIVE badge
```
**Required proof pack:** `docs/qa/verify_BRAND-WO-06_<timestamp>.json`
**Required skills:** `live-demo-detector`, `intelligence-hub-api-contract`

---

## WO: INTEL-EXPORT-01
**Title:** Intelligence Hub Export (CSV + PDF Brief)
**Priority:** P2
**Objective:** Add minimum export capability to Intelligence Hub
**Scope boundaries:** Export buttons only — CSV for all users, PDF for Pro+
**Target files:**
- `src/pages/public/Intelligence.tsx` — add CSV export button
- `src/pages/business/Intelligence.tsx` — add CSV export button
- Brief component — add PDF export for Pro+ (CreditGate wrapped)

**Acceptance tests:**
```bash
npx tsc --noEmit  # 0 errors
# Manual: Click "Export CSV" → downloads signal list as CSV with source, title, topic, date columns
```
**Required proof pack:** `docs/qa/verify_INTEL-EXPORT-01_<timestamp>.json`
**Required skills:** `intelligence-hub-api-contract`, `entitlement-validator`

---

## WO: SCHEMA-WO-01
**Title:** database.types.ts Regeneration
**Priority:** P2
**Objective:** Sync TypeScript types with current Supabase schema
**Scope boundaries:** Type file only — `supabase gen types` then commit
**Target files:**
- `src/database.types.ts` (or wherever types live)

**Command:**
```bash
supabase gen types typescript --project-id rumdmulxzmjtsplsjngi > src/database.types.ts
npx tsc --noEmit
```
**Acceptance tests:** tsc=0 errors after regeneration
**Required proof pack:** `docs/qa/verify_SCHEMA-WO-01_<timestamp>.json`
**Required skills:** `database-types-generator`, `build-gate`

---

## WO: DEBT-TANSTACK-7
**Title:** Migrate useEnrichment.ts raw useEffect to TanStack Query
**Priority:** P2
**Objective:** Remove last known raw useEffect+supabase.from() violation (launch gate §16.23)
**Target files:** `src/lib/enrichment/useEnrichment.ts`
**Acceptance tests:**
```bash
grep -n "useEffect.*supabase\|supabase.*useEffect" src/lib/enrichment/useEnrichment.ts  # 0 results
npx tsc --noEmit  # 0 errors
```
**Required skills:** `dev-best-practice-checker`, `build-gate`

---

## WO: DEBT-HOOKS-01
**Title:** Hook Deduplication
**Priority:** P2
**Objective:** Consolidate 7 duplicate hook pairs identified by Lane C
**Dependency:** SCHEMA-WO-01 (types regen) should be complete first
**Target:** Run `hook-consolidator` skill to get exact file list
**Required skills:** `hook-consolidator`, `build-gate`

---

## WO: FOUND-WO-04-EXT
**Title:** Shell Detector False Positive Fix
**Priority:** P2
**Objective:** Extend LIVE_PATTERNS list to include domain hook names (`useBenchmarkData`, `useCECredits`, `useStudioDocs`, `useCourse`, `useProposals`, `useDeals`, etc.) — reduces false positive count from 7 to 0
**Target files:** `scripts/shell-detector.mjs`
**Acceptance tests:**
```bash
npm run shell:check  # false positive count ≤0 for hooks listed above
```
**Required skills:** `hub-shell-detector`, `shell-detector-ci`

---

## EXECUTION ORDER

```
IMMEDIATE (P0 — this week):
  COPY-WO-01 → SHELL-WO-01 → INTEL-WO-12

P1 (next sprint):
  MERCH-INTEL-02-FIX → FEED-WO-06 → MERCH-INTEL-02 (coverage)
  FUNNEL-WO-01
  INTEL-UI-01 (after MERCH-INTEL-02-FIX)
  BRAND-WO-06

P2 (following sprint):
  PAY-WO-06
  SCHEMA-WO-01 → DEBT-HOOKS-01
  INTEL-EXPORT-01
  DEBT-TANSTACK-7
  FOUND-WO-04-EXT
```

---

*Note: All WO IDs above are PROPOSED. They must be added to `SOCELLE-WEB/docs/build_tracker.md` before execution begins. Executing a WO without a build_tracker.md entry = Doc Gate FAIL 2.*
