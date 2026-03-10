# SHELLS AND STATES AUDIT — LANE D

**Audit date:** 2026-03-10
**Auditor:** Agent (read-only, no self-certification)
**Source:** Fresh shell detector run (2026-03-10) + manual code review of all 17 shell pages
**Total pages scanned:** 276 (254 scored + 22 exempt)
**Detector version:** FOUND-WO-04 shell-detector.mjs (fresh run, baseline 18 → current 17)

---

## SUMMARY BY HUB

| Hub | Total | LIVE | DEMO | SHELL | EXEMPT | Shell Rate |
|-----|-------|------|------|-------|--------|-----------|
| admin | 78 | 63 | 10 | 4 | 1 | 5.1% |
| brand | 25 | 21 | 0 | 2 | 2 | 8.0% |
| business | 77 | 46 | 20 | 6 | 5 | 7.8% |
| claim | 2 | 2 | 0 | 0 | 0 | 0% |
| dev | 1 | 0 | 1 | 0 | 0 | 0% |
| education | 12 | 7 | 4 | 1 | 0 | 8.3% |
| marketing | 8 | 7 | 1 | 0 | 0 | 0% |
| public | 64 | 33 | 14 | 3 | 14 | 4.7% |
| sales | 9 | 2 | 6 | 1 | 0 | 11.1% |
| **TOTAL** | **276** | **181** | **56** | **17** | **22** | **6.7%** |

**Shell count fixed this session:** 1 (IntelligenceDashboard — stale report had it wrong; fresh run reclassified it as LIVE)

---

## SHELL CLASSIFICATION TABLE

### TRUE SHELLS (require WOs — 10 of 17)

These pages have no live data, no DEMO label, and are missing critical states. They require dedicated WOs.

| Hub | File | Detector Score | Root Cause | Missing 10-Feature Items | Remediation WO |
|-----|------|---------------|------------|--------------------------|----------------|
| admin | `admin/RegionManagement.tsx` | 0 | All data from `getRegionStats()`/`getAllCompliance()` static lib functions — no Supabase calls | Live data, CRUD, error/empty/loading states, export, observability | ADMIN-WO-04 |
| admin | `admin/ReportsLibrary.tsx` | 0 | `getAdminReports()` is documented `@deprecated` mock-only function (adminIntelligence.ts) | Live data wire, CRUD (create/delete reports), error/loading/empty states, export | ADMIN-WO-05 |
| admin | `admin/brand-hub/HubEducation.tsx` | 0 | `getBrandEducation()` — mock-only, adminIntelligence.ts explicitly marked `@deprecated` | Live data, DB write, all states, permissions, observability | ADMIN-WO brand-hub sub-WO |
| admin | `admin/brand-hub/HubProtocols.tsx` | 0 | `getBrandProtocols()` — mock-only, same deprecated source | Live data, DB write, all states, permissions, observability | ADMIN-WO brand-hub sub-WO |
| brand | `brand/BrandAIAdvisor.tsx` | 1 | `useChatSession` calls `mockAdvisor.generateResponse()` (local mock AI); `RECENT_SIGNALS` is hardcoded array | Live AI calls (edge function), real signal feed, DEMO label, error state | BRAND-WO-04 |
| brand | `brand/IntelligencePricing.tsx` | 0 | `getTierPricing()` / `getTierFeatures()` from `mockTierData.ts` (explicitly "All data is local mock — no Supabase or Stripe") | Stripe price lookup, live tier data, error/loading states | BRAND-WO-05 |
| business | `business/LocationsDashboard.tsx` | 0 | File comment: "All data is mock. No Supabase mutations." Uses `getLocationSummaries()` from `mockLocations.ts` | Live data (business_locations table), all states, CRUD, export | INTEL-WO per BUILD 2 |
| public | `public/ApiDocs.tsx` | 0 | `getApiEndpoints()` from `mockApiData.ts` — static array, no Supabase | Live API registry table, DEMO label, error/loading states | SITE-WO or API-WO |
| public | `public/ApiPricing.tsx` | 1 | `getApiPricing()` from `mockApiData.ts` — static array; no DEMO label despite being mock | Live Stripe price lookup or pricing table, DEMO label | SITE-WO or API-WO |
| education | `education/QuizPlayer.tsx` | 2 | Uses `useQuiz` (TanStack Query, LIVE) but detector scores SHELL because pattern name not in LIVE_PATTERNS list — **DETECTOR FALSE POSITIVE** (see below) | Missing proper error retry button, missing empty state (no questions case) | FOUND-WO-04 (extend detector) |

### DETECTOR FALSE POSITIVES — LIVE pages misclassified as SHELL (7 of 17)

These pages ARE wired to live Supabase data via TanStack Query hooks but the detector's `LIVE_PATTERNS` list does not include their domain-specific hook names. No code changes required — the detector needs pattern updates.

| Hub | File | Detector Score | Actual Status | Hook Used | Why Detector Misses It |
|-----|------|---------------|---------------|-----------|------------------------|
| business | `business/BenchmarkDashboard.tsx` | 1 | LIVE with fallback | `useBenchmarkData()` → `useQuery` + `supabase.from` | Hook name not in LIVE_PATTERNS |
| business | `business/CECredits.tsx` | 4 | LIVE | `useCECredits()` → `useQuery` + `supabase.from` | Hook name not in LIVE_PATTERNS |
| business | `business/AddServiceRecord.tsx` | 2 | LIVE | `useClientTreatmentRecords()` + `useCrmContactDetail()` → `useQuery` + `supabase.from` | Hook names not in LIVE_PATTERNS |
| business | `business/studio/CourseBuilder.tsx` | 3 | LIVE | `useStudioDoc()` / `useStudioDocs()` → `useQuery` + `supabase.from('cms_docs')` | Hook name not in LIVE_PATTERNS |
| business | `business/studio/StudioHome.tsx` | 2 | LIVE | `useStudioDocs()` → `useQuery` + `supabase.from('cms_docs')` | Hook name not in LIVE_PATTERNS |
| public | `public/CoursePlayer.tsx` | 2 | LIVE | `useCourse()`, `useEnrollment()`, `useLessonProgress()`, `useQuiz()` → all use `useQuery` + `supabase` | Hook names not in LIVE_PATTERNS |
| sales | `sales/ProposalBuilder.tsx` | 4 | LIVE | `useProposals()` + `useDeals()` → `useQuery` + `supabase.from('proposals'/'deals')` | Hook names not in LIVE_PATTERNS |

**Action required for false positives:** Extend `scripts/shell-detector.mjs` LIVE_PATTERNS to include:
```
/useBenchmark[A-Z]\w+\s*\(/,
/useCECredits\s*\(/,
/useClientTreatmentRecords\s*\(/,
/useCrmContactDetail\s*\(/,
/useStudioDocs?\s*\(/,
/useCourse[s]?\s*\(/,
/useEnrollment\s*\(/,
/useLessonProgress\s*\(/,
/useProposals\s*\(/,
/useDeals\s*\(/,
```
This is a **FOUND-WO-04** task.

---

## 10 KEY HUB PAGES — FEATURE SCORING

Against the 10-feature hub checklist from CLAUDE.md §7:

### 1. /portal/intelligence — `business/IntelligenceHub.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create action → DB row | Partial | AI tools generate briefs but no direct create |
| 2. Library view with sort/filter/search | Yes | SignalTable with filter |
| 3. Detail view from DB | Yes | SignalDetailPanel |
| 4. Edit + Delete with RLS | No | Read-only signals |
| 5. Permissions (RLS + ModuleRoute + TierGuard) | Yes | TierGate + CreditGate + ModuleRoute |
| 6. Intelligence input | Yes | Core purpose |
| 7. Proof/metrics dashboard | Yes | KPIStrip with real data |
| 8. Export | No | No CSV/PDF export |
| 9. Error/empty/loading states | Yes | HubSkeleton + animate-pulse |
| 10. Observability | Partial | isLive badge, no error logging to Admin Hub |
**Score: 6/10 — Not a shell but missing export + full observability**

### 2. /portal/crm — `business/CrmDashboard.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create action → DB row | Yes | crm_tasks.insert |
| 2. Library view with sort/filter/search | Yes | contacts/tasks list |
| 3. Detail view from DB | Yes | ContactDetail |
| 4. Edit + Delete with RLS | Yes | |
| 5. Permissions (RLS + ModuleRoute + TierGuard) | Partial | RLS present, no TierGate |
| 6. Intelligence input | Yes | market_signals cross-ref |
| 7. Proof/metrics dashboard | Yes | KpiSkeleton + real aggregates |
| 8. Export | Partial | Not on dashboard itself |
| 9. Error/empty/loading states | Yes | animate-pulse + error message |
| 10. Observability | Partial | Error displayed, no Admin Hub log |
**Score: 7/10 — Healthy, minor gaps**

### 3. /portal/education — `business/EducationDashboard.tsx` (via education/EducationHub.tsx)
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create action → DB row | No | Consumer-facing — no create |
| 2. Library view | Yes | Course catalog with filters |
| 3. Detail view from DB | Partial | DEMO label present (isLive) |
| 4. Edit + Delete | No | Consumer-facing |
| 5. Permissions | Partial | isLive guard, no TierGate |
| 6. Intelligence input | Partial | Recommendations only |
| 7. Proof/metrics | No | No KPI strip |
| 8. Export | No | |
| 9. Error/empty/loading | Partial | animate-pulse for skeleton but no EmptyState |
| 10. Observability | No | |
**Score: 3/10 — Near-shell for consumer education hub**

### 4. /portal/sales — `sales/SalesDashboard.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create action → DB row | Yes | Deal creation |
| 2. Library view | Yes | Pipeline + list |
| 3. Detail view | Yes | DealDetail |
| 4. Edit + Delete | Yes | |
| 5. Permissions | Yes | isLive guard |
| 6. Intelligence input | Yes | OpportunityFinder |
| 7. Proof/metrics | Yes | KPI strip |
| 8. Export | Yes | CSV |
| 9. Error/empty/loading | Yes | |
| 10. Observability | Partial | isLive badge, no Admin Hub |
**Score: 9/10 — Strong**

### 5. /portal/marketing — `marketing/MarketingDashboard.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create | Yes | Campaign create |
| 2. Library | Yes | Campaign list |
| 3. Detail | Yes | CampaignDetail |
| 4. Edit + Delete | Yes | |
| 5. Permissions | Partial | isLive guard, no TierGate |
| 6. Intelligence | Yes | isLive signal cross-ref |
| 7. Proof/metrics | Partial | Basic stats |
| 8. Export | No | |
| 9. Error/empty/loading | Partial | Loading states present |
| 10. Observability | Partial | |
**Score: 6/10 — Missing export and observability**

### 6. /brand/intelligence — `brand/BrandIntelligenceHub.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create | No | Signals are read-only |
| 2. Library | Partial | Signal list with isLive |
| 3. Detail | No | No detail view |
| 4. Edit + Delete | No | |
| 5. Permissions | Partial | animate-pulse only |
| 6. Intelligence | Yes | Core purpose |
| 7. Proof/metrics | Partial | Basic signal counts |
| 8. Export | No | |
| 9. Error/empty/loading | Partial | animate-pulse present |
| 10. Observability | No | |
**Score: 3/10 — Near-shell; lacks detail, export, observability**

### 7. /admin/intelligence — `admin/IntelligenceDashboard.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create action → DB row | Yes | `supabase.from('market_signals').insert` |
| 2. Library view | Yes | Signals table with filters |
| 3. Detail view | Partial | Inline expand |
| 4. Edit + Delete | Yes | status update + delete in modal |
| 5. Permissions | Yes | Admin-only, RLS |
| 6. Intelligence input | Yes | Full signal management |
| 7. Proof/metrics | Yes | DashboardSkeleton + real KPIs |
| 8. Export | No | |
| 9. Error/empty/loading | Yes | DashboardSkeleton + animate-pulse |
| 10. Observability | Yes | feed health visible |
**Score: 9/10 — Strong; missing only CSV export**

### 8. /intelligence (public) — `public/Intelligence.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create | No | Public read-only |
| 2. Library | Yes | Signal feed with vertical filter |
| 3. Detail | Partial | IntelligenceFeedSection links |
| 4. Edit + Delete | No | Public page |
| 5. Permissions | Partial | Auth-gated content sections |
| 6. Intelligence | Yes | Core purpose, useIntelligence() |
| 7. Proof/metrics | Yes | KPIStrip from useDataFeedStats |
| 8. Export | No | Public page |
| 9. Error/empty/loading | Partial | Loading present, no EmptyState |
| 10. Observability | Yes | ApiStatusRibbon isLive guard |
**Score: 5/10 — Adequate for public page type**

### 9. /education (public) — `public/Education.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create | No | Public |
| 2. Library | Yes | Category filter + EducationCard grid |
| 3. Detail | Partial | Links to CourseDetail |
| 4. Edit + Delete | No | Public |
| 5. Permissions | No | No TierGate or auth gate |
| 6. Intelligence | No | No signal cross-ref |
| 7. Proof/metrics | No | No KPI strip |
| 8. Export | No | Public |
| 9. Error/empty/loading | No | useEducation uses mockContent; no loading/error states visible |
| 10. Observability | No | |
**Score: 2/10 — Near-shell. useEducation wraps mockContent — no live DB data. DEMO label missing.**

### 10. /brands (public) — `public/Brands.tsx`
| Feature | Present | Notes |
|---------|---------|-------|
| 1. Create | No | Public |
| 2. Library | Yes | Brand list with search |
| 3. Detail | Partial | Links to BrandStorefront |
| 4. Edit + Delete | No | Public |
| 5. Permissions | No | Public page |
| 6. Intelligence | Yes | useIntelligence() cross-ref |
| 7. Proof/metrics | Partial | Signal counts |
| 8. Export | No | Public |
| 9. Error/empty/loading | Yes | animate-pulse + error message + refetch |
| 10. Observability | Yes | isLive guard |
**Score: 5/10 — Acceptable for public page type**

---

## LIVE RENDERS DEMO CHILD — isLive PATTERN AUDIT

**Checked all files using `isLive` pattern. Key findings:**

| Page | isLive Source | Guard Present | DEMO Badge Shown | Verdict |
|------|--------------|---------------|-----------------|---------|
| `public/IntelligenceCommerce.tsx` | `useIntelligence()` | Yes — explicit `{!isLive && DEMO}` at line 94 | Yes | PASS |
| `public/Intelligence.tsx` | `useIntelligence()` | Implicit via ApiStatusRibbon | Partial — ribbon not same as DEMO badge | MINOR RISK |
| `public/Education.tsx` | `useEducation()` | **None** | **None** | FAIL — mock data served with no label |
| `business/BenchmarkDashboard.tsx` | `useBenchmarkData()` | Yes — `{!isLive && <div>DEMO</div>}` at line 173 | Yes | PASS |
| `business/CECredits.tsx` | `useCECredits()` | Yes — `{isLive ? ... : DEMO}` at line 179 | Yes | PASS |
| `brand/BrandAIAdvisor.tsx` | **None** | **None** | **None** | FAIL — `RECENT_SIGNALS` mock array, no DEMO label |

**live_renders_demo_child violations found: 2**
1. `public/Education.tsx` — serves `mockContent` from `useEducation()` with zero DEMO labeling
2. `brand/BrandAIAdvisor.tsx` — renders hardcoded `RECENT_SIGNALS` as if real, no DEMO label

---

## MISSING STATES AUDIT

### Missing EmptyState (shared component — only 12 pages use it)
The `EmptyState` component exists at `src/components/ui/EmptyState.tsx` but is massively underused. Most pages use inline `<div>` empty messages instead. Pages with no live data path have no empty state at all.

Key pages missing proper EmptyState:
- `public/Education.tsx` — no empty state for 0 courses case
- `brand/BrandAIAdvisor.tsx` — no empty chat state
- `admin/RegionManagement.tsx` — no empty state
- `admin/ReportsLibrary.tsx` — no empty state
- `brand/BrandIntelligenceHub.tsx` — animate-pulse only, no EmptyState

### Missing Error States
74 pages have error-related patterns but many use basic inline text. Shared `ErrorState` component exists at `src/components/ErrorState.tsx` but is rarely imported in pages.

Key pages with no retry/error state:
- `public/Education.tsx` — useEducation is mock; would never error
- `admin/RegionManagement.tsx` — static data, no error path
- `admin/brand-hub/HubEducation.tsx` — no error path
- `admin/brand-hub/HubProtocols.tsx` — no error path

### Missing Loading Skeletons (animate-pulse pattern)
136 pages use animate-pulse. **Pages missing loading skeletons entirely:**
- `admin/RegionManagement.tsx` — static data, no skeleton
- `admin/ReportsLibrary.tsx` — static data, no skeleton
- `admin/brand-hub/HubEducation.tsx` — sync mock call, no skeleton
- `admin/brand-hub/HubProtocols.tsx` — sync mock call, no skeleton
- `brand/IntelligencePricing.tsx` — sync mock call, no skeleton
- `public/ApiDocs.tsx` — sync mock call, no skeleton
- `public/ApiPricing.tsx` — sync mock call, no skeleton
- `public/Education.tsx` — mock hook returns synchronously; loading state never activates

### TierGate Coverage
Only **1 page** uses the `TierGate` component directly in pages (via `business/IntelligenceHub.tsx`). 26 other pages import `EmptyState`, `Skeleton`, or `ErrorState` components.

TierGate is applied at **route level** in `App.tsx` via `ModuleRoute`, which is the intended pattern for this codebase. Per-page TierGate wrapping is used selectively for fine-grained feature gating.

---

## TRUE SHELLS REQUIRING WOs — REMEDIATION ORDER

### P0 — Launch blockers (mock data served without DEMO label)

1. **`public/Education.tsx`** — `useEducation()` wraps `mockContent` with no isLive guard, no DEMO label. Violates §8 (MOCK unlabeled = FORBIDDEN). Either wire to `courses` + `education_content` tables OR add DEMO label immediately.
   - Maps to: **INTEL-WO-01** / **EDU-WO-01**
   - Risk: Users see mock education content as if real

2. **`brand/BrandAIAdvisor.tsx`** — Hardcoded `RECENT_SIGNALS` array, `mockAdvisor.generateResponse()` for AI. No DEMO label. Violates §8.
   - Maps to: **BRAND-WO-04**
   - Risk: Brand users receive fake AI intelligence with no disclaimer

### P1 — WO-blocked true shells (full feature builds required)

3. **`admin/RegionManagement.tsx`** (score 0) — Pure static data from i18n lib. No DB, no mutations. Needs real region/compliance table.
   - Maps to: **ADMIN-WO-04**

4. **`admin/ReportsLibrary.tsx`** (score 0) — Deprecated mock `getAdminReports()`. Needs reports table + CRUD.
   - Maps to: **ADMIN-WO-05**

5. **`admin/brand-hub/HubEducation.tsx`** (score 0) — Deprecated mock. Needs wire to `courses` table scoped to brand.
   - Maps to: **ADMIN-WO (brand-hub sub-task)**

6. **`admin/brand-hub/HubProtocols.tsx`** (score 0) — Deprecated mock. Needs wire to `canonical_protocols` table scoped to brand.
   - Maps to: **ADMIN-WO (brand-hub sub-task)**

7. **`brand/IntelligencePricing.tsx`** (score 0) — `mockTierData.ts` explicitly documented as no Stripe/Supabase. Needs Stripe price lookup.
   - Maps to: **BRAND-WO-05**

8. **`business/LocationsDashboard.tsx`** (score 0) — Comment in file: "All data is mock. No Supabase mutations." Needs `business_locations` table wire.
   - Maps to: BUILD 2 business hub WO

9. **`public/ApiDocs.tsx`** (score 0) — `mockApiData.ts` static array. Needs `api_registry` table wire or DEMO label.
   - Maps to: **SITE-WO or API-WO**

10. **`public/ApiPricing.tsx`** (score 1) — `mockApiData.ts` pricing tiers. Needs Stripe price data or DEMO label.
    - Maps to: **SITE-WO or API-WO**

### P2 — Detector false positives (fix detector, not code)

These 7 pages are architecturally correct (TanStack Query + Supabase) but the detector fails to recognize their domain hooks. Fix `FOUND-WO-04` detector patterns.

- `business/BenchmarkDashboard.tsx` → add `useBenchmarkData`
- `business/CECredits.tsx` → add `useCECredits`
- `business/AddServiceRecord.tsx` → add `useClientTreatmentRecords`, `useCrmContactDetail`
- `business/studio/CourseBuilder.tsx` → add `useStudioDocs?`
- `business/studio/StudioHome.tsx` → add `useStudioDocs`
- `public/CoursePlayer.tsx` → add `useCourse`, `useEnrollment`, `useLessonProgress`
- `sales/ProposalBuilder.tsx` → add `useProposals`, `useDeals`

---

## MISSING SHARED COMPONENTS

| Component | Exists | Usage Count | Problem |
|-----------|--------|-------------|---------|
| `EmptyState` | Yes (`components/ui/EmptyState.tsx`) | 12 pages | Massively underused — most pages use inline div |
| `ErrorState` | Yes (`components/ErrorState.tsx`) | Rarely in pages | Most error rendering is ad hoc |
| `Skeleton` | Yes (`components/ui/Skeleton.tsx`) | Rarely imported — inline `animate-pulse` used instead | Inconsistent shimmer patterns |

---

## PATTERN RECOMMENDATIONS

1. **Extend LIVE_PATTERNS in shell-detector.mjs** — add 10+ domain hook names to eliminate false positives. This alone would drop detected shells from 17 to 10.

2. **Mandate EmptyState component** — ban inline `<div className="text-center">No results</div>` patterns. All empty states must use the shared Pearl Mineral illustration component.

3. **Add isLive guard to useEducation** — wire `useEducation()` to real `courses` table and expose `isLive` flag. Public/Education currently serves mock silently.

4. **Add DEMO labels to `BrandAIAdvisor`** — until `brand-ai-advisor` edge function is built, all AI responses must be explicitly labeled DEMO.

5. **Kill `adminIntelligence.ts` deprecated exports** — `getBrandEducation`, `getBrandProtocols`, `getAdminReports` are all documented `@deprecated` and all still imported. Remove file after wiring.

6. **Kill `mockLocations.ts`** — `getLocationSummaries()` is the only export and only used by `LocationsDashboard.tsx`. Create `business_locations` table or add DEMO label.

7. **Kill `mockApiData.ts`** — wire `api_registry` table to `ApiDocs.tsx` and `ApiPricing.tsx` or label them DEMO.

8. **Kill `mockTierData.ts`** — `IntelligencePricing.tsx` and `useBrandTier.ts` depend on this. Stripe integration needed.

---

## VERDICT

**True shells requiring WOs: 10**
**Detector false positives (code is fine, fix detector): 7**
**P0 live-renders-demo-child violations: 2** (Education, BrandAIAdvisor)
**Overall: FAIL** — 2 P0 violations (unlabeled mock data served to users) must be resolved before launch
