# SOCELLE AUDIT EXECUTION REPORT

Date: 2026-03-09  
Repository: `SOCELLE GLOBAL` (monorepo)  
Primary target: `SOCELLE-WEB`  
Secondary parity pass: `SOCELLE-MOBILE-main/apps/mobile`

## 0) Proof Pack + Skill Verification

### Required skill install verification
- Skill docs present: `.claude/skills/e2e-flow-auditor/SKILL.md`
- Runner present: `tools/e2e-flow-auditor/run.js`
- Command wired: `package.json` root script `"audit:flow": "node tools/e2e-flow-auditor/run.js"`
- Run evidence: `docs/qa/e2e-flow-audit_20260309_131130/logs/run.log`
  - `[start] 2026-03-09T19:11:30.991Z`
  - `[report] docs/qa/e2e-flow-audit_20260309_131130.json`
  - `[done] 2026-03-09T19:20:40.715Z`
- JSON contract check:
  - `docs/qa/e2e-flow-audit_20260309_131130.json` contains `route_inventory`, `click_map`, `error_list`, `dead_ends`, `screenshots_manifest`
  - Counts: `route_inventory=740`, `click_map=114`, `error_list=515`, `dead_ends=28`, `screenshots_manifest=114`

### Governance inputs read
- `docs/operations/OPERATION_BREAKOUT.md` (present)
- `CLAUDE.md` (not found in repo scan)

---

## 1) Verified Inventory (with command-backed counts)

### Command excerpts
```bash
npm --prefix SOCELLE-WEB run routes:manifest
# Route manifest written ... (267 routes)

npm --prefix SOCELLE-WEB run routes:check
# Route manifest check passed (267 routes)

npm --prefix SOCELLE-WEB run shell:check
# Total pages: 271 | LIVE: 152 | DEMO: 68 | SHELL: 51

npm --prefix SOCELLE-WEB run inventory
# Summary: 271 pages | 173 shells (63.8%) | 0 banned terms
```

### Inventory table
| Area | Count | Evidence |
|---|---:|---|
| Web routes (manifest) | 267 | `SOCELLE-WEB/docs/qa/route_manifest.generated.json`, `npm --prefix SOCELLE-WEB run routes:manifest` |
| Web pages | 271 | `rg --files SOCELLE-WEB/src/pages -g '*.tsx' | wc -l` |
| Web components (all files under components/) | 170 | `rg --files SOCELLE-WEB/src/components | wc -l` |
| Hooks (`use*.ts/tsx`) | 113 | `rg --files SOCELLE-WEB/src -g 'use*.ts' -g 'use*.tsx' | wc -l` |
| Edge function dirs | 34 (33 runtime + `_shared`) | `find SOCELLE-WEB/supabase/functions -maxdepth 1 -mindepth 1 -type d` |
| Web migrations | 165 | `find SOCELLE-WEB/supabase/migrations -maxdepth 1 -type f | wc -l` |
| Root migrations | 102 | `find supabase/migrations -maxdepth 1 -type f | wc -l` |
| Mobile Dart files | 180 | `rg --files SOCELLE-MOBILE-main/apps/mobile/lib -g '*.dart' | wc -l` |
| Mobile screen/page files | 56 | `rg --files ... | rg 'screen|page' | wc -l` |

### Tooling discrepancy (must be resolved)
- `shell:check` reports `51` shells (`SOCELLE-WEB/docs/qa/shell_detector_report.json`)
- `inventory` reports `173` shells (`SOCELLE-WEB/docs/qa/inventory_report.json`)
- This is a classification-rules conflict, not a small drift.

---

## 2) Route Map: Reachable vs Orphan vs Dead End

### Route inventory + guard map
- Route inventory artifact: `docs/qa/ROUTE_INVENTORY.md`
- Guard evidence in router:
  - Business portal guarded under `/portal`: `SOCELLE-WEB/src/App.tsx:605-780`
  - Brand portal guarded under `/brand` with redirect `/brand/login`: `SOCELLE-WEB/src/App.tsx:969-1012`
  - Admin portal guarded under `/admin` with redirect `/admin/login`: `SOCELLE-WEB/src/App.tsx:1057-1137`
  - Module gates (`ModuleRoute`): `SOCELLE-WEB/src/modules/_core/components/ModuleRoute.tsx:17-37`

### Reachability classification
| Bucket | Count | Evidence |
|---|---:|---|
| Manifest routes | 267 | `SOCELLE-WEB/docs/qa/route_manifest.generated.json` |
| Nav-linked absolute routes | 100 | `docs/qa/ORPHAN_REPORT.md` |
| Candidate orphans | 59 | `docs/qa/ORPHAN_REPORT.md` |
| Dead ends observed in e2e crawl | 28 | `docs/qa/e2e-flow-audit_20260309_131130.json` (`dead_ends`) |
| Candidate broken nav targets | 85 | `docs/qa/NAV_LINK_CHECK.md` |

Notes:
- `ORPHAN_REPORT` and `NAV_LINK_CHECK` are candidate-level scans and over-report some nested/relative route patterns.
- Dead-end evidence is runtime-confirmed (screenshot-backed), not static-only.

---

## 3) Flow Audit (A-G)

## A) Visitor flow: landing -> value proof -> signup CTA
- Expected: clear value proof and transition to auth or request-access completion.
- Actual:
  - Landing/home loads, but high request failure noise (`request_failed`, `console_error`) and CSP violations in logs.
  - `/education` renders with no meaningful action path (dead end).
  - `/jobs` rendered as skeleton-only in run snapshot.
- Breakpoints:
  - `/education` dead end.
  - `/jobs` non-activated content state in run.
- Evidence:
  - Dead end: `public_006_education.png` (`docs/qa/e2e-flow-audit_20260309_131130/screens/public_006_education.png`)
  - Jobs screenshot: `public_009_jobs.png`
  - Logs: `docs/qa/e2e-flow-audit_20260309_131130/logs/public.log` (CSP + aborted requests)

## B) Auth flow: signup -> login -> logout -> session restore
- Expected: full verification across public/pro/brand/admin roles.
- Actual:
  - Public structural auth routes audited.
  - Professional, Brand, Admin full authenticated flows blocked by missing credentials.
- Blocked-by-auth requirements:
  - Professional: `E2E_BUSINESS_EMAIL`, `E2E_BUSINESS_PASSWORD`
  - Brand: `E2E_BRAND_EMAIL`, `E2E_BRAND_PASSWORD`
  - Admin: `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`
- Evidence: `blocked_by_auth` in `docs/qa/e2e-flow-audit_20260309_131130.json`

## C) Intelligence wedge: /home|/intelligence -> wow -> save/export -> paywall
- Expected: visible “wow” action path with persistence/export and gated upgrade path.
- Actual:
  - Teaser/paywall redirection exists (`/education/courses` and `/shop` route to `/pricing` via `View Plans`).
  - Authenticated intelligence paths not functionally validated due missing role creds.
  - AI citations/provenance payload not returned by orchestrator response contract.
- Evidence:
  - Click map `/education/courses` -> `/pricing` (`click_map` entry in e2e JSON)
  - AI response payload: `SOCELLE-WEB/supabase/functions/ai-orchestrator/index.ts:622-632`

## D) Jobs flow: discovery -> detail -> apply/CTA
- Expected: list -> detail -> apply URL.
- Actual:
  - `/jobs` audited; details route was not exercised with slug in this run.
  - Snapshot shows skeleton-only rendering in audited capture.
- Evidence:
  - Screenshot: `public_009_jobs.png`
  - Jobs code path: `SOCELLE-WEB/src/pages/public/Jobs.tsx`

## E) Admin flow: feeds toggle -> refresh -> health -> logs
- Expected: actionable admin console.
- Actual:
  - `/admin/dashboard` and `/admin/feeds` captured in perpetual loading state in this run.
  - Many admin routes flagged as dead ends (no meaningful outbound actions).
- Evidence:
  - `admin_001_admin__dashboard.png`, `admin_009_admin__feeds.png`
  - Dead ends list includes `/admin/feeds`, `/admin/market-signals`, `/admin/intelligence`, `/admin/shop`, `/admin/subscriptions`.

## F) Tier gating: free -> teaser -> upgrade -> checkout -> unlock
- Expected: complete revenue path.
- Actual:
  - Teaser to pricing exists (`View Plans` CTA).
  - Commerce endpoints `/cart` and `/checkout` are dead-end in run snapshot.
  - Credit purchase path is explicitly DEMO + disabled buy button.
- Evidence:
  - Dead ends: `/cart`, `/checkout` with screenshots `public_033_cart.png`, `public_036_checkout.png`
  - Credit purchase DEMO/disabled: `SOCELLE-WEB/src/pages/business/credits/CreditPurchase.tsx:11-12,45-48,79-85`

## G) AI: request -> response -> provenance -> credit deduction -> rate limit
- Expected: fully server-enforced credits/rate-limit + provenance/citations.
- Actual:
  - Server-side credit deduction exists (`deduct_credits` RPC) and returns `402` on insufficient credits.
  - Server-side rate-limit check exists (`check_rate_limit`) and returns `429` on limit breach.
  - Potential deploy ordering gap: rate-limit and entitlements migrations are dated 2026-03-10, while this audit is 2026-03-09.
  - Response payload omits citations/provenance fields.
- Evidence:
  - AI orchestrator checks: `SOCELLE-WEB/supabase/functions/ai-orchestrator/index.ts:440-470,487-523`
  - Rate-limit migration: `SOCELLE-WEB/supabase/migrations/20260310000001_create_ai_rate_limits.sql`
  - Response contract lacks citations: `.../ai-orchestrator/index.ts:622-632`

---

## 4) Top Broken Flows (20)

| ID | Sev | Where | Why it fails | Repro (minimal) | Fix approach | Acceptance test | Evidence |
|---|---|---|---|---|---|---|---|
| BF-01 | P0 | `/cart` | Revenue flow dead-end (no next action) | Open `/cart` logged-out | Ensure cart content or upgrade CTA with checkout progression | Playwright: add-to-cart -> `/cart` has line items + checkout CTA | `dead_ends` + `public_033_cart.png` |
| BF-02 | P0 | `/checkout` | Revenue flow dead-end | Open `/checkout` logged-out | Render recoverable checkout state or redirect to cart with reason | Playwright: `/checkout` either renders form or redirects to `/cart` with banner | `dead_ends` + `public_036_checkout.png` |
| BF-03 | P0 | Module entitlements | `account_module_access` 404 in runtime | Hit admin/dashboard with current env | Apply missing entitlements migration; verify table exists before app boot | SQL smoke + e2e: no 404 to `/rest/v1/account_module_access` | `http_error` in e2e JSON + `ModuleAccessContext.tsx:57` + migration dated `20260310100001` |
| BF-04 | P0 | Feed orchestrator security | Function says admin-only but no caller role verification | Invoke `feed-orchestrator` with non-admin JWT | Add `verifyAdmin` gate (similar to `test-api-connection`) | Integration: non-admin returns 401, admin succeeds | `feed-orchestrator/index.ts:408-427` vs `test-api-connection/index.ts:53-97` |
| BF-05 | P0 | Credit purchase | Credits upsell path is non-functional DEMO | Open `/portal/credits/purchase` | Wire Stripe checkout/top-up path and re-enable purchase buttons | E2E: purchase flow reaches webhook and updates balance | `CreditPurchase.tsx:11-12,79-85` |
| BF-06 | P1 | `/admin/dashboard` | Loading-only shell in audited run | Open `/admin/dashboard` in current env | Add loading timeout and fallback error state | E2E: route resolves to content or explicit error card < 8s | `admin_001_admin__dashboard.png` |
| BF-07 | P1 | `/admin/feeds` | Loading-only shell in audited run | Open `/admin/feeds` in current env | Add timeout + “retry/query error” fallback and no-action guard | E2E: no spinner-only state >8s | `admin_009_admin__feeds.png` |
| BF-08 | P1 | `/education` | No meaningful outbound action (dead end) | Open `/education` public | Add CTA rails to `/education/courses` and `/pricing` | E2E: `clickable_count > 0` and at least one route transition | `dead_ends` + `public_006_education.png` |
| BF-09 | P1 | `/account/orders` | Spinner/dead-end state | Open `/account/orders` with current env | Add auth gate messaging + recovery CTA | E2E: state includes retry/login CTA and no indefinite spinner | `public_026_account__orders.png` |
| BF-10 | P1 | `/account/wishlist` | Dead-end state | Open `/account/wishlist` | Add empty state with “Browse products” CTA | E2E: empty-state CTA present and route navigates | `public_028_account__wishlist.png` |
| BF-11 | P1 | `/jobs` | Skeleton-only snapshot in audited run | Open `/jobs` public | Ensure skeleton resolves to data or explicit empty/error state | E2E: no skeleton-only view after timeout | `public_009_jobs.png`; `Jobs.tsx` |
| BF-12 | P1 | Professional portal auditability | Could not validate logged-in pro flows | Run audit without `E2E_BUSINESS_*` vars | Seed test pro user and wire env in CI | E2E auth suite green for pro routes | `blocked_by_auth` list in e2e JSON |
| BF-13 | P1 | Brand portal auditability | Could not validate logged-in brand flows | Run audit without `E2E_BRAND_*` vars | Seed brand test user and CI env | E2E auth suite green for brand routes | `blocked_by_auth`; `brand_001_brand__dashboard.png` |
| BF-14 | P1 | Admin portal auditability | Could not validate true admin session | Run audit without `E2E_ADMIN_*` vars | Seed admin user and CI env | E2E auth suite green for admin routes | `blocked_by_auth`; `public_025_admin__login.png` |
| BF-15 | P1 | Feed reliability | No retry/backoff around upstream fetches | Force transient feed endpoint failure | Add bounded retry (e.g. 3 tries with jittered backoff) | Integration: transient 5xx eventually succeeds; logs attempts | `feed-orchestrator/index.ts:226-233,311-318,594-603` |
| BF-16 | P1 | Feed dedupe fidelity | `is_duplicate` always set `false` | Ingest duplicate payload twice | Implement duplicate detection and set flag/merge policy | Unit/integration: duplicate input marks `is_duplicate=true` | `feed-orchestrator/index.ts:268,375`; migration supports field |
| BF-17 | P1 | Credit ledger consistency | Frontend reads `credit_ledger` while migration creates `ai_credit_ledger` | Open credit dashboard on fresh DB | Align table contract or view alias + migrate hook | Integration: dashboard `isLive=true` with real ledger rows | `useCreditBalance.ts:55-57`; migration `20260228000001...:43` |
| BF-18 | P1 | AI provenance UX | AI response omits citations/provenance metadata | Call ai-orchestrator and inspect JSON | Add `citations`/`sources` fields and render in UI | API contract test validates citations array | `ai-orchestrator/index.ts:622-632` |
| BF-19 | P2 | Shell detector consistency | Conflicting shell totals between tools | Run `shell:check` and `inventory` | Unify shell classifier source and CI gate | CI: both scripts return same shell count | `shell_detector_report.json` vs `inventory_report.json` |
| BF-20 | P2 | Nav quality noise | Nav link checker reports many candidate misses (false positives mixed in) | Run nav scan | Normalize nested/relative route resolution in checker | Tool test: false positives reduced against known fixtures | `docs/qa/NAV_LINK_CHECK.md` |

---

## 5) Shell Detection + No-Shell Compliance

### Shell scan summary (runtime/static)
- Source: `SOCELLE-WEB/docs/qa/shell_detector_report.json`
- Totals: `271 pages`, `LIVE 152`, `DEMO 68`, `SHELL 51` (`18.8%`)

### Shell concentration by hub
| Hub | LIVE | DEMO | SHELL | Evidence |
|---|---:|---:|---:|---|
| Admin | 55 | 10 | 13 | `shell_detector_report.json` `by_hub.admin` |
| Public | 15 | 26 | 21 | `by_hub.public` |
| Business | 43 | 20 | 11 | `by_hub.business` |
| Brand | 21 | 0 | 4 | `by_hub.brand` |
| Sales | 2 | 6 | 1 | `by_hub.sales` |
| Education | 7 | 4 | 1 | `by_hub.education` |

### Shell list (high-value)
- Public commerce/account shells: `src/pages/public/Cart.tsx`, `Checkout.tsx`, `OrderHistory.tsx`, `WishlistPage.tsx`
- Intelligence shells: `src/pages/brand/BrandAIAdvisor.tsx`, `src/pages/business/BenchmarkDashboard.tsx`, `src/pages/public/Insights.tsx`
- CMS shells: `src/pages/admin/cms/CmsDashboard.tsx`, `CmsPagesList.tsx`, `CmsPostsList.tsx`
- Evidence: `docs/qa/SOCELLE_HUB_MAP_20260309.json` (`sample_shell_files`)

### Quick-win shell -> functional conversions (revenue-first)
| Priority | Route/Page | Conversion | Why |
|---|---|---|---|
| 1 | `/cart`, `/checkout` | Wire live cart state + explicit empty/error/checkout guards | Direct revenue recovery |
| 2 | `/portal/credits/purchase` | Replace DEMO button with live checkout | AI monetization path |
| 3 | `/admin/subscriptions` | Remove DEMO badge, enforce real plan/account metrics | Reduces support + billing ambiguity |
| 4 | `/intelligence/briefs` | Replace mock briefs with live query + saved exports | Activation + retention |
| 5 | `/education` | Add explicit CTA flows + loading/empty/error states | Early-funnel drop reduction |

---

## 6) Data + API + Provenance Audit

### Feed pipeline verification
| Check | Status | Evidence |
|---|---|---|
| `data_feeds (is_enabled)` read path | Verified | `feed-orchestrator/index.ts:440-444` |
| Orchestrator writes to `market_signals` | Verified | `feed-orchestrator/index.ts:272-279`, `380-387` |
| `source_feed_id` persisted | Verified | `feed-orchestrator/index.ts:264,371` |
| Run logging (`feed_run_log`) | Verified | `feed-orchestrator/index.ts:531-539`, `610-621` |
| Freshness timestamps (`last_fetched_at`) | Verified | `feed-orchestrator/index.ts:576-585` |
| Retries/backoff | Missing | no retry loop around `fetch` in `processRssFeed/processApiFeed` |
| DLQ/failure queue | Missing | only `last_error` + `feed_run_log`; no DLQ table usage |
| Dedupe policy quality | Partial | upsert key exists but `is_duplicate` hardcoded false |

### AI economics + server enforcement
| Check | Status | Evidence |
|---|---|---|
| Server-side credit deduction | Verified | `ai-orchestrator/index.ts:487-523`; `deduct_credits` migration |
| Server-side rate limiting | Implemented in code | `ai-orchestrator/index.ts:440-470` |
| Rate-limit infra deployment risk | High | migration `20260310000001_create_ai_rate_limits.sql` dated 2026-03-10 (audit date is 2026-03-09) |
| Credit ledger table consistency | Mismatch risk | `useCreditBalance.ts` queries `credit_ledger`; migration defines `ai_credit_ledger` |
| AI provenance/citations in response | Missing | `ai-orchestrator/index.ts:622-632` has no citations fields |

### Fake-live / demo enforcement findings
| Surface | Finding | Evidence |
|---|---|---|
| AI advisor session | Mock generator in runtime hook | `src/lib/ai/useChatSession.ts:3,48`; `src/lib/ai/mockAdvisor.ts` |
| Credit purchase | Explicit DEMO + disabled buy CTA | `CreditPurchase.tsx:45-48,79-85` |
| Admin API control | “Phase 6 will wire live test” placeholder | `AdminApiControlHub.tsx:139-153` |
| Admin subscriptions | Page labeled DEMO while writing live tables | `AdminSubscriptionPlans.tsx:195-197` |

---

## 7) Admin Coverage Audit

| Admin area | Current state | Risk | Evidence |
|---|---|---|---|
| Feeds (`/admin/feeds`) | Code supports live `data_feeds` + `feed_run_log`; run snapshot showed loading-only dead end | Operational blind spots | `AdminFeedsHub.tsx:160-198`; screenshot `admin_009_admin__feeds.png` |
| API registry (`/admin/api-control` via hub) | CRUD on `api_registry` works; live connection test still placeholder | False confidence on API health | `AdminApiControlHub.tsx:138-153` |
| Feature flags (`/admin/feature-flags`) | Live reads/writes + audit logging | Depends on subscription data freshness | `AdminFeatureFlags.tsx:64-106,153-169,188-199` |
| Audit logs (`/admin/audit-log`) | Hook exists; DEMO fallback when table missing/empty | Can mask missing audit pipeline | `useAuditLogs.ts:49-77`; `AdminAuditLog.tsx:235-257` |
| User management (`/admin/users`) | Live CRUD against `user_profiles`; fallback empty on missing table | Role/status ops need hard auth tests | `AdminUsers.tsx:89-119,130-153` |

---

## 8) UX + Design Enhancement Spec (implementable, no redesign)

## Navigation IA (max 6 top-level)
1. Intelligence
2. Commerce
3. Education
4. CRM & Sales
5. Marketing
6. Admin

Evidence basis:
- Current top nav and module spread in screenshots/routes: `/`, `/intelligence`, `/education`, `/shop`, `/portal/*`, `/admin/*`.

## Intelligence layout upgrades (table-first)
- Add table-first signal workspace at `/intelligence` and `/portal/intelligence`:
  - Columns: signal, confidence, source, freshness, impacted modules.
  - Row actions: explain, save brief, assign to CRM/marketing.
  - Side panel drill-down with provenance strip.
- Why: shortens time-to-value and gives deterministic “next action”.
- Evidence: dead-end/shell signals in intelligence hubs (`SOCELLE_HUB_MAP_20260309.json` + portal auth-block screenshots).

## Consistent state pattern rules
- For all list/detail pages:
  - Loading timeout: show retry + diagnostics after 8s.
  - Empty state: include at least one contextual CTA.
  - Error state: include retry and fallback route link.
- Evidence: spinner-only captures on `/admin/dashboard`, `/admin/feeds`, `/account/orders`.

## First 5-minute onboarding sequence
1. Land on `/home` with “Run your first intelligence brief” CTA.
2. Route to `/intelligence` pre-filtered feed and one-click “Explain signal”.
3. Save result to `/portal/crm` or `/portal/marketing` (cross-hub action).
4. Show upgrade delta only after one successful action completion.
- Evidence: existing teaser to pricing works, but activation moments are missing/blocked (`/education` dead-end, multiple shell states).

## Component standardization list
- Reuse and enforce:
  - `PageLoadingSkeleton`, `ErrorState`, table empty/error patterns.
- Delete/merge:
  - duplicate loading spinners without timeout fallback.
  - DEMO-only badges on revenue-critical paths once live wiring exists.

---

## 9) Mobile Parity Gaps

| Gap | Evidence | Impact |
|---|---|---|
| No explicit mobile routes for brand/admin portals | `apps/mobile/lib/core/router/app_router.dart` (no `/brand/*`, `/admin/*`) | Operational parity gap |
| No explicit jobs/events route coverage in mobile router | same file lacks `/jobs`, `/events` paths | Discovery parity gap |
| Module keys include features not routed | `module_access.dart` includes `MODULE_BRANDS`, `MODULE_JOBS`, `MODULE_EVENTS`, `MODULE_STUDIO` | Entitlement mismatch risk |

---

## 10) WO Backlog (Prioritized)

### P0 Work Orders

| WO | Scope | Files/Routes affected | Acceptance tests | Proof required | Dependencies |
|---|---|---|---|---|---|
| WO-AUDIT-P0-01 | Close entitlements deployment gap so module gates stop failing on missing `account_module_access`. | `SOCELLE-WEB/supabase/migrations/20260310100001_entitlements_chain_fix.sql`, `src/modules/_core/context/ModuleAccessContext.tsx`, routes `/cart`, `/checkout`, `/shop/*`, `/portal/*` | 1) DB contains `account_module_access`. 2) No e2e `http_error` 404 to this table. 3) Module-gated routes resolve deterministically. | SQL migration log + e2e JSON diff + screenshot set | DB migration deployment pipeline |
| WO-AUDIT-P0-02 | Repair commerce conversion path (`/cart` and `/checkout`) with non-shell states and checkout continuity. | `src/pages/public/Cart.tsx`, `src/pages/public/Checkout.tsx`, route wiring in `App.tsx` | 1) Add-to-cart -> `/cart` shows line items. 2) `/checkout` has actionable form or redirect reason. 3) No dead-end flags. | Playwright trace + screenshots + e2e dead_end count drop | Entitlements + cart data hooks |
| WO-AUDIT-P0-03 | Replace DEMO credit purchase with live Stripe top-up path. | `src/pages/business/credits/CreditPurchase.tsx`, `src/pages/business/credits/CreditDashboard.tsx`, `supabase/functions/create-checkout`, `stripe-webhook` | 1) Buy credits button enabled for eligible users. 2) Checkout success updates balance. 3) Failed purchase shows recoverable error. | Payment webhook logs + UI screenshots + balance before/after | Stripe keys + webhook secret |
| WO-AUDIT-P0-04 | Enforce admin authorization in `feed-orchestrator` to prevent unauthorized feed runs. | `supabase/functions/feed-orchestrator/index.ts`, shared auth helper under `supabase/functions/_shared` | 1) Non-admin JWT returns 401. 2) Admin JWT succeeds. 3) Service-role internal path still works. | Function invocation logs + test output | Reuse `verifyAdmin` pattern from `test-api-connection` |
| WO-AUDIT-P0-05 | Fix spinner-lock on core admin surfaces with timeout + fail-safe states. | `src/pages/admin/AdminDashboard.tsx`, `AdminFeedsHub.tsx`, shared loading/error components | 1) Any load >8s transitions to explicit error/retry state. 2) No spinner-only screenshots in e2e run. | Updated e2e screenshots + route assertions | Stable API responses for admin queries |
| WO-AUDIT-P0-06 | Establish authenticated e2e role fixtures so core pro/brand/admin flows are verified, not assumed. | CI secrets, e2e config, `tools/e2e-flow-auditor/run.js` | 1) Auth env vars set in CI. 2) Auditor reports `blocked=false` for pro/brand/admin sessions. 3) Core route pass/fail matrix produced. | CI run logs + updated e2e JSON | Test users seeded in environment |

### P1 Work Orders

| WO | Scope | Files/Routes affected | Acceptance tests | Proof required | Dependencies |
|---|---|---|---|---|---|
| WO-AUDIT-P1-01 | Unify credit ledger data contract (`credit_ledger` vs `ai_credit_ledger`). | `src/lib/credits/useCreditBalance.ts`, migration/view layer | 1) Hook reads real ledger rows with `isLive=true`. 2) No fallback DEMO in production env. | Hook test + query logs + dashboard screenshot | Migration/view strategy decision |
| WO-AUDIT-P1-02 | Add citations/provenance fields to AI responses and UI rendering. | `supabase/functions/ai-orchestrator/index.ts`, advisor/intelligence UI components | 1) API response includes `citations[]`/`sources[]`. 2) UI shows source strip per answer. | API schema test + UI screenshot | Source extraction policy |
| WO-AUDIT-P1-03 | Add retry/backoff + jitter to feed ingestion; track retry count in logs. | `supabase/functions/feed-orchestrator/index.ts`, `feed_run_log` schema (if needed) | 1) transient 5xx succeeds within retry policy. 2) retries logged. | Integration test logs + feed_run_log rows | Timeout policy |
| WO-AUDIT-P1-04 | Implement real dedupe scoring and persist `is_duplicate` truthfully. | `feed-orchestrator/index.ts`, `market_signals` dedupe utilities | 1) duplicate sources mark `is_duplicate=true`. 2) unique items remain false. | Unit tests + sample ingest records | Similarity rule thresholds |
| WO-AUDIT-P1-05 | Remove runtime mock advisor path from production role flows. | `src/lib/ai/useChatSession.ts`, `src/lib/ai/mockAdvisor.ts`, advisor pages | 1) production mode calls live orchestrator. 2) mock only in explicit dev mode. | Runtime config logs + UI proof | Feature flag for dev mock |
| WO-AUDIT-P1-06 | Normalize shell scoring between `shell:check` and `inventory` scripts. | `scripts/shell-detector.mjs`, `scripts/generate-inventory.mjs` | 1) both scripts output identical shell totals. 2) CI gate validates consistency. | Script outputs + CI check | shared scoring module |
| WO-AUDIT-P1-07 | Improve `/education` and `/jobs` activation states with clear CTA next-step paths. | `src/pages/public/Education.tsx`, `src/pages/public/Jobs.tsx` | 1) no dead-end classification for `/education`. 2) `/jobs` resolves from skeleton to content/empty/error. | e2e dead-end diff + screenshots | content/data availability |
| WO-AUDIT-P1-08 | Mobile parity pass for Brand/Admin/Jobs/Events routing and module gates. | `SOCELLE-MOBILE-main/apps/mobile/lib/core/router/app_router.dart`, module access providers | 1) mobile route map includes brand/admin/jobs/events where intended. 2) module gates aligned with web entitlements. | route diff report + mobile smoke tests | product scope confirmation |

---

## 11) Sheet Update Mode

Direct spreadsheet write access was not available from this environment during this run.  
A sheet-ready patch is provided in:

- `docs/qa/SOCELLE_SHEET_PATCH_2026-03-09.md`


---

## 12) Next 10 Actions (Ranked by ROI)

1. Deploy entitlements migration chain now (`account_module_access`, `account_subscriptions`) and re-run `audit:flow`.
2. Fix `/cart` and `/checkout` dead ends to restore conversion path.
3. Replace credit purchase DEMO with live Stripe top-up.
4. Add admin authorization guard to `feed-orchestrator`.
5. Add loading timeout + retry/error states to `/admin/dashboard` and `/admin/feeds`.
6. Seed CI auth users (`professional`, `brand`, `admin`) and remove `blocked_by_auth` from audit runs.
7. Resolve credit ledger contract mismatch (`credit_ledger` vs `ai_credit_ledger`).
8. Add citations/provenance fields to AI response payload and UI.
9. Implement feed retries/backoff + dedupe (`is_duplicate`) correctness.
10. Unify shell scoring logic between `shell:check` and `inventory` to one source of truth.

