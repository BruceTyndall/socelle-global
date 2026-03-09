# SOCELLE MASTER AUDIT — 2026-03-09

## Executive Summary
- Flow audit tooling is now installed and verified: `npm run audit:flow` succeeded and produced `114` screenshots + JSON/log artifacts. Evidence: `docs/qa/e2e-flow-audit_20260309_105413.json`.
- Route surface is large and heavily gated: `295` resolved routes, `213` protected, `81` module-gated, `78` prelaunch-guarded. Evidence: `docs/qa/SOCELLE_ROUTE_MAP_20260309.json`.
- Runtime crawl found `797` errors in a single pass (`314` console, `297` request_failed, `186` http_error). Evidence: `docs/qa/e2e-flow-audit_20260309_105413.json`.
- Public pages repeatedly hit failed Supabase queries for `brands`, `stories`, and `data_feeds` (400/404), affecting `/`, `/home`, `/intelligence`, `/brands`, `/jobs`, `/events`. Evidence: `docs/qa/e2e-flow-audit_20260309_105413/logs/public.log:7`, `:9`, `:15`, `:138`, `:209`, `:279`.
- Authenticated role runs were structurally audited but blocked by missing credentials (`E2E_BUSINESS_*`, `E2E_BRAND_*`, `E2E_ADMIN_*`). Evidence: `docs/qa/e2e-flow-audit_20260309_105413.json` (`blocked_by_auth`).
- Dead ends were detected on commerce and education routes (`/account/orders`, `/checkout`, `/courses`, etc.). Evidence: `docs/qa/e2e-flow-audit_20260309_105413.json` (`dead_ends`) + screenshots `public_026`..`public_040`.
- Shell detection shows meaningful progress but still material debt: `52` shell pages (`19.3%`), concentrated in `public`, `admin`, and CMS/authoring surfaces. Evidence: `SOCELLE-WEB/docs/qa/shell_detector_report.json`.
- Strongest ship-readiness hubs today: Marketing (`92`), Notifications (`100`, small scope), Jobs (`88`), Booking (`86`), CRM (`80`). Evidence: `docs/qa/SOCELLE_HUB_MAP_20260309.json`.
- Weakest ship-readiness hubs: CMS/Editorial (`32`), Authoring (`54`), Intelligence (`56`), Commerce (`59`), Sales (`59`). Evidence: `docs/qa/SOCELLE_HUB_MAP_20260309.json`.
- Data dependency footprint is broad (`269` pages touching up to `51` tables in business hub), but conversion-critical paths still include shell implementations. Evidence: `docs/qa/SOCELLE_DATA_DEPENDENCY_MAP_20260309.json`.
- UX state coverage is inconsistent: `152` pages missing empty states, `156` missing error states, `47` missing loading states. Evidence: `SOCELLE-WEB/docs/qa/shell_detector_report.json`.
- Design system exists but implementation entropy is high (`92` table markups, `38` custom modal overlays), increasing maintenance cost and inconsistency. Evidence: `rg` counts over `SOCELLE-WEB/src/pages` + `src/components`.
- Reliability controls include edge kill-switches, but there is no centralized rate-limit/abuse layer in shared edge middleware. Evidence: `SOCELLE-WEB/supabase/functions/_shared/edgeControl.ts`.
- Query retry policy is conservative (`retry: 1`) and lacks explicit backoff/recovery UX for critical failures. Evidence: `SOCELLE-WEB/src/main.tsx`.
- Overall ship posture: strong architecture breadth, medium execution depth, and high ROI from a focused “conversion-path hardening + CMS/authoring completion” sprint.

## Severity Table (P0/P1/P2)
| Severity | Finding | User Impact | Evidence |
|---|---|---|---|
| P0 | Core public intelligence/brand/story feeds return 400/404 repeatedly | First-session trust break; homepage/intelligence appear unstable | `docs/qa/e2e-flow-audit_20260309_105413/logs/public.log:7`, `:9`, `:15`, `:138`, `:209` |
| P0 | High-frequency API error surface (`186` HTTP errors) | Data modules degrade into partial/empty states | `docs/qa/e2e-flow-audit_20260309_105413.json` (`error_list`) |
| P1 | Auth role audits blocked by missing test creds | Cannot verify post-login functional parity for Pro/Brand/Admin | `docs/qa/e2e-flow-audit_20260309_105413.json` (`blocked_by_auth`) |
| P1 | Permission traps across protected flows (redirect-to-login loops in authenticated test buckets) | Users lose context on gated routes without remediation path | `docs/qa/e2e-flow-audit_20260309_105413.json` (`top_broken_flows`, `gate_counts.redirect_to_login=53`) |
| P1 | Dead-end routes in commerce and courses | Activation drop-off; no clear next action | `docs/qa/e2e-flow-audit_20260309_105413.json` (`dead_ends`) |
| P1 | CMS/Editorial and Authoring shell concentration | Admin cannot reliably publish/edit premium content surfaces | `SOCELLE-WEB/docs/qa/shell_detector_report.json` (`CmsDashboard.tsx`, `StudioHome.tsx`) |
| P2 | Repeated CSP/font request failures (`api.fontshare.com`, `fonts.gstatic.com`) | Noisy console/network, visual jitter risk | `docs/qa/e2e-flow-audit_20260309_105413/logs/public.log:1`, `:2`, `:4` |
| P2 | Component implementation drift (tables/modals/buttons) | Slower QA velocity, inconsistent UX polish | `rg` counts in `SOCELLE-WEB/src` (`<table className` = 92, `fixed inset-0` = 38) |

## 0) Baseline Inventory (Repo + Runtime)
### Route Map (All Routes + Gates)
- Canonical resolved route map artifact: `docs/qa/SOCELLE_ROUTE_MAP_20260309.json`.
- Totals: `295` routes (`82` public, `213` protected), `81` module-gated, `78` prelaunch-guarded.
- Group distribution: `admin 88`, `portal 72`, `brand 32`, `marketing 8`, `sales 10`, `legacy 9`, `public 76`.
- Primary gate implementations:
  - Role gate: `SOCELLE-WEB/src/components/ProtectedRoute.tsx`.
  - Module gate: `SOCELLE-WEB/src/modules/_core/components/ModuleRoute.tsx`.
  - Route tree and wrappers: `SOCELLE-WEB/src/App.tsx`.

### Hub Map
- Hub scoring artifact: `docs/qa/SOCELLE_HUB_MAP_20260309.json`.

| Hub | Routes | Pages | Live | Demo | Shell | Ship Readiness |
|---|---:|---:|---:|---:|---:|---:|
| Intelligence | 15 | 16 | 8 | 2 | 6 | 56 |
| Jobs | 4 | 4 | 3 | 1 | 0 | 88 |
| CRM | 20 | 15 | 12 | 3 | 0 | 80 |
| CMS/Editorial | 14 | 17 | 4 | 5 | 8 | 32 |
| Education | 21 | 26 | 14 | 6 | 6 | 60 |
| Sales | 17 | 16 | 7 | 8 | 1 | 59 |
| Marketing | 20 | 24 | 21 | 2 | 1 | 92 |
| Booking | 6 | 7 | 5 | 1 | 1 | 86 |
| Commerce | 22 | 29 | 13 | 8 | 12 | 59 |
| Admin | 88 | 77 | 55 | 9 | 13 | 77 |
| Search | 6 | 0 | 0 | 0 | 0 | 0 |
| Notifications | 6 | 5 | 5 | 0 | 0 | 100 |
| Authoring | 10 | 13 | 5 | 3 | 5 | 54 |

### Data Dependency Map (Page -> Hooks -> Tables/Edge)
- Artifact: `docs/qa/SOCELLE_DATA_DEPENDENCY_MAP_20260309.json`.
- Highest data coupling hubs:
  - `business`: `74` pages touching `51` tables.
  - `public`: `61` pages touching `50` tables and `3` edge functions.
  - `admin`: `77` pages touching `31` tables.
- Edge-function-dependent pages include pricing/subscription and certificate verification surfaces. Evidence: `docs/qa/SOCELLE_DATA_DEPENDENCY_MAP_20260309.json` (pages using `create-checkout`, `verify-certificate`, `scorm-runtime`).

### Shell Detection (LIVE / DEMO / SHELL)
- Source report: `SOCELLE-WEB/docs/qa/shell_detector_report.json`.
- Platform status: `151 LIVE`, `66 DEMO`, `52 SHELL`.
- Critical shell examples:
  - CMS: `src/pages/admin/cms/CmsDashboard.tsx`, `CmsPagesList.tsx`, `CmsPostsList.tsx`.
  - Authoring: `src/pages/business/studio/StudioHome.tsx`, `StudioEditor.tsx`, `CourseBuilder.tsx`.
  - Commerce conversion: `src/pages/public/ShopCheckout.tsx`, `Checkout.tsx`, `OrderHistory.tsx`, `WishlistPage.tsx`.
  - Intelligence: `src/pages/admin/IntelligenceDashboard.tsx`, `src/pages/business/BenchmarkDashboard.tsx`.

## 1) UX Flow Audit (Behavioral)
### Top 20 Broken Flows (Severity-ranked)
| # | Severity | Flow | Failure | Evidence |
|---:|---|---|---|---|
| 1 | P0 | Public landing (`/`) | `data_feeds` 404 + `stories` 404 + `brands` 400 | `.../public.log:7`, `:9`, `:15` |
| 2 | P0 | Home (`/home`) | repeated `data_feeds`/`stories`/`brands` failures | `.../public.log:35`, `:70`, `:92` |
| 3 | P0 | Intelligence (`/intelligence`) | failed intelligence feed dependencies | `.../public.log:138`, `:140`, `:158` |
| 4 | P0 | Brands (`/brands`) | brand directory query returns 400 | `.../public.log:209`, `:211`, `:229` |
| 5 | P0 | Blog list/detail (`/blog`, `/blog/:slug`) | story feed 404 path | `.../public.log` entries on `/blog` and `/blog/sample-slug` |
| 6 | P1 | Pro dashboard (`/portal/dashboard`) | redirect-to-login permission trap in audit run | `docs/qa/e2e-flow-audit_20260309_105413.json` (`top_broken_flows[0]`) |
| 7 | P1 | Pro intelligence (`/portal/intelligence`) | redirect-to-login | same JSON (`top_broken_flows`) |
| 8 | P1 | Pro plans (`/portal/plans`) | redirect-to-login | same JSON |
| 9 | P1 | Pro CRM (`/portal/crm`) | redirect-to-login | same JSON |
| 10 | P1 | Pro booking (`/portal/booking`) | redirect-to-login | same JSON |
| 11 | P1 | Pro sales (`/portal/sales`) | redirect-to-login | same JSON |
| 12 | P1 | Pro marketing (`/portal/marketing`) | redirect-to-login | same JSON |
| 13 | P1 | Pro studio (`/portal/studio`) | redirect-to-login | same JSON |
| 14 | P1 | Pro affiliates/reseller (`/portal/affiliates`, `/portal/reseller`) | redirect-to-login | same JSON |
| 15 | P1 | Role coverage audit | missing role creds prevent functional verification | `blocked_by_auth` in JSON |
| 16 | P2 | Education list (`/education`) | dead-end (no actionable next step detected) | screenshot `public_006_education.png` |
| 17 | P2 | Account orders (`/account/orders`) | dead-end | screenshot `public_026_account__orders.png` |
| 18 | P2 | Checkout (`/checkout`) | dead-end | screenshot `public_036_checkout.png` |
| 19 | P2 | Courses (`/courses`) | dead-end | screenshot `public_039_courses.png` |
| 20 | P2 | Course detail (`/courses/:slug`) | dead-end | screenshot `public_040_courses__sample-slug.png` |

### Dead Ends
- Total dead ends detected: `9`.
- Routes: `/education`, `/account/orders`, `/account/orders/:id`, `/account/wishlist`, `/book/:slug`, `/cart`, `/checkout`, `/courses`, `/courses/:slug`.
- Evidence: `docs/qa/e2e-flow-audit_20260309_105413.json` (`dead_ends`) and corresponding screenshot IDs in `docs/qa/e2e-flow-audit_20260309_105413/screens/`.

### Permission Traps
- Structural trap pattern: protected route -> login redirect without preserving a clear “why blocked” state in run context.
- Verified gate count: `redirect_to_login: 53`.
- Evidence: `docs/qa/e2e-flow-audit_20260309_105413.json` (`gate_counts`).

### Missing States
- Missing empty states: `152` pages.
- Missing error states: `156` pages.
- Missing loading states: `47` pages.
- Evidence: `SOCELLE-WEB/docs/qa/shell_detector_report.json` (feature flags by page).

## 2) Feature Enhancement Opportunity Audit (Per Hub)

### Intelligence
- What works today: live public and business intelligence surfaces with signal-oriented hooks. Evidence: `docs/qa/SOCELLE_HUB_MAP_20260309.json` (Intelligence `live=8`).
- What is a shell: `AdminIntelligenceDashboard`, `ReportsLibrary`, `BenchmarkDashboard`, `BrandAIAdvisor`. Evidence: `SOCELLE-WEB/docs/qa/shell_detector_report.json`.
- Missing to be fully built: stable data contracts, exports, benchmark CRUD, cross-hub dispatch into CRM/Marketing. Evidence: `docs/qa/SOCELLE_DATA_DEPENDENCY_MAP_20260309.json` + `public.log` failures.

| Tier | Upgrades (5 each, where/what/why/effort) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/intelligence` + `src/lib/intelligence/*`: fix failing `brands/stories/data_feeds` queries to restore trust in first session (M). 2) `src/pages/business/BenchmarkDashboard.tsx`: wire live benchmark datasets + trend deltas (M). 3) `src/components/intelligence/SignalDetailPanel.tsx`: add CTAs to create CRM task/marketing campaign from a signal (S). 4) `/intelligence/briefs`: add sortable/filterable brief index + clear empty/error/loading states (S). 5) `src/pages/admin/ReportsLibrary.tsx`: implement export queue (CSV/PDF) for signals and benchmarks (M). | Supabase schema alignment, query fixes, export endpoint | `public.log`, `shell_detector_report.json`, route `/intelligence` |
| Premium | 1) AI anomaly detection over signal velocity with alert subscriptions (L). 2) Executive weekly brief generator with confidence narratives (M). 3) Competitor watchlists with threshold alerts (M). 4) Region-specific intelligence packs (M). 5) Forecast simulation panel with scenario toggles (L). | background jobs, notification pipeline, analytics storage | routes `/intelligence`, `/admin/reports` |

### Jobs
- What works today: live jobs surfaces are mostly non-shell. Evidence: `docs/qa/SOCELLE_HUB_MAP_20260309.json` (`shell=0`).
- What is a shell: none currently flagged. Evidence: same file.
- Missing to be fully built: save/apply lifecycle, employer analytics, funnel metrics, export. Evidence: route scope `/jobs`, `/jobs/:slug`.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/jobs`: add saved-job and applied-job states (S). 2) `/jobs/:slug`: add in-flow apply form with validation + success/error states (M). 3) Admin `/admin/jobs`: add CRUD moderation with publish/archive (M). 4) Add job feed quality metrics panel in admin hub (S). 5) Add CSV export for applicants and posting performance (S). | jobs tables + admin policies | routes `/jobs`, `/admin/jobs` |
| Premium | 1) Candidate/role fit scoring (L). 2) Talent alerts and smart matching notifications (M). 3) ATS webhook integration (L). 4) Compensation benchmarking widget (M). 5) Branded hiring microsites per brand (L). | ML ranking + partner APIs | jobs + notification routes |

### CRM
- What works today: high live coverage across contacts/companies/tasks/segments/prospects. Evidence: `docs/qa/SOCELLE_HUB_MAP_20260309.json` (`shell=0`, score `80`).
- What is a shell: none in primary CRM pages. Evidence: same file.
- Missing to be fully built: dedupe automation, audit trail UX, exports at list and detail levels, SLA metrics. Evidence: `SOCELLE_DATA_DEPENDENCY_MAP_20260309.json` (CRM table breadth).

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/portal/crm/contacts`: add bulk import + dedupe suggestions (M). 2) `/portal/crm/companies`: add merge workflow and conflict review (M). 3) `/portal/crm/tasks`: add overdue SLA panel + retry notifications (S). 4) `/portal/prospects`: add source attribution and conversion funnel metrics (M). 5) Add CSV export for contacts/companies/tasks lists (S). | dedupe rules, export utility | routes `/portal/crm*` |
| Premium | 1) Predictive churn and win-likelihood scoring (L). 2) AI-assisted follow-up drafting (M). 3) Cross-hub “next best action” panel from intelligence signals (M). 4) Revenue forecast by segment (M). 5) Voice notes + transcript summaries on records (L). | AI services, analytics warehouse | CRM + Intelligence linking |

### CMS/Editorial
- What works today: public blog/story shells exist and rendering primitives are present. Evidence: `src/components/cms/PageRenderer.tsx`, `/blog` routes.
- What is a shell: CMS admin core (`CmsDashboard`, `CmsPagesList`, `CmsPostsList`, `CmsTemplatesList`, etc.). Evidence: `SOCELLE-WEB/docs/qa/shell_detector_report.json`.
- Missing to be fully built: true CRUD + status workflow + scheduling + revisioning + exports + author roles. Evidence: shell files + route `/admin/cms/*`.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/admin/cms/pages` + `/admin/cms/posts`: complete list/create/edit/delete flow (M). 2) `CmsDashboard.tsx`: add content health KPIs and queue widgets (S). 3) `CmsMediaLibrary.tsx`: connect metadata edits to published references and usage map (M). 4) Add publish schedule + status transitions (draft/review/published) in CMS tables (M). 5) Add editorial export (CSV + markdown package) for compliance/review (S). | CMS schema + RLS + publish workflow | shell CMS files in report |
| Premium | 1) Real-time collaborative editor with section comments (L). 2) AI-assisted SEO rewrite with policy guardrails (M). 3) Multilingual content variants + fallback (L). 4) Content experimentation (A/B blocks) with outcome tracking (L). 5) Editorial performance cockpit (traffic, conversion, retention) (M). | collaboration backend, experimentation infra | `/admin/cms/*`, `/blog/*` |

### Education
- What works today: catalog/certificates and training tables are wired; certificates call edge verification. Evidence: `SOCELLE_DATA_DEPENDENCY_MAP_20260309.json`.
- What is a shell: `QuizPlayer`, `public/CoursePlayer`, `business/CECredits`, studio course builder surfaces. Evidence: `shell_detector_report.json`.
- Missing to be fully built: progress persistence quality, quiz authoring lifecycle, CE export and compliance reporting. Evidence: shell files + route `/education/*`.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/education/learn/:slug` + `/courses/:slug/learn`: harden completion and resume state (M). 2) `/education/ce-credits`: add downloadable transcript + filter by period (S). 3) `QuizPlayer.tsx`: complete scoring + retries + remediation guidance (M). 4) `/admin/courses/:id/edit`: add publish validation checklist before go-live (S). 5) Add explicit empty/error/loading states on public education routes (S). | SCORM runtime, quiz schema, transcript export | routes `/education/*`, shell list |
| Premium | 1) Adaptive learning paths by user segment (L). 2) CE compliance alerts with calendar reminders (M). 3) Proctored assessments + integrity checks (L). 4) Team leaderboards and credential ladders (M). 5) Branded partner academies with white-label themes (L). | analytics + notifications + role model | education + notification routes |

### Sales
- What works today: dashboards/pipeline/deal data hooks exist and core tables are present. Evidence: `SOCELLE_DATA_DEPENDENCY_MAP_20260309.json` (`deals`, `proposals`, `commission_*`).
- What is a shell: `src/pages/sales/ProposalBuilder.tsx`. Evidence: `shell_detector_report.json`.
- Missing to be fully built: quote lifecycle, approval workflow, exports, forecast confidence metrics. Evidence: shell file + routes `/sales/*`.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/sales/proposals/new`: complete proposal CRUD and versioning (M). 2) `/sales/deals/:id`: add stage exit criteria and loss-reason taxonomy (S). 3) `/sales/commissions`: add payout status drilldown + audit links (M). 4) `/sales/analytics`: add cohort and stage-conversion charts (M). 5) Add CSV export for pipeline, deal activity, commissions (S). | proposal schema + analytics queries | routes `/sales/*` |
| Premium | 1) AI win-probability scoring and coaching suggestions (L). 2) CPQ-like guided pricing engine (L). 3) E-sign integration for proposals/contracts (L). 4) Territory optimization map for field teams (M). 5) Multi-brand revenue attribution model (L). | AI + third-party APIs | sales + brand/admin |

### Marketing
- What works today: strongest operational hub with broad live coverage and route depth. Evidence: `SOCELLE_HUB_MAP_20260309.json` (`score=92`).
- What is a shell: minimal shell (one template-linked surface). Evidence: same file.
- Missing to be fully built: attribution unification, campaign ROI forecasting, cross-channel orchestration. Evidence: routes `/marketing/*`, `/portal/marketing*`.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/marketing/campaigns/:id`: add end-to-end attribution card (S). 2) `/marketing/segments`: add rule simulator before save (M). 3) `/marketing/templates`: connect templates to real CMS blocks for reuse (M). 4) `/marketing/landing-pages`: add publish QA checks and broken-link scan (S). 5) Add campaign export packet (creative + performance + audience) (S). | CMS integration + metrics model | routes `/marketing/*` |
| Premium | 1) Multi-channel journey orchestration (email/social/web) (L). 2) Budget optimizer by CAC/LTV targets (L). 3) AI creative variant generation with brand guardrails (M). 4) Incrementality experiments dashboard (L). 5) Partner co-marketing marketplace (L). | orchestration service + experimentation infra | marketing + cms + analytics |

### Booking
- What works today: booking/calendar/appointment surfaces mostly live. Evidence: `SOCELLE_HUB_MAP_20260309.json` (`score=86`).
- What is a shell: `src/pages/business/AddServiceRecord.tsx`. Evidence: `shell_detector_report.json`.
- Missing to be fully built: waitlist logic, conflict detection UX, provider utilization metrics, exports. Evidence: routes `/portal/booking/*`.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/portal/booking/calendar`: add conflict resolution and overbook warnings (M). 2) `/portal/booking/services`: add margin and duration analytics per service (S). 3) `/portal/booking/staff`: add utilization and no-show metrics (M). 4) `AddServiceRecord.tsx`: complete record persistence and validation (M). 5) Add CSV exports for appointments and service logs (S). | scheduling rules + analytics queries | booking routes + shell file |
| Premium | 1) Smart slot recommendations by conversion history (M). 2) SMS/email reminder optimization engine (M). 3) Marketplace booking widget with dynamic pricing (L). 4) Capacity planning simulator (M). 5) Loyalty-linked booking incentives (M). | messaging infra + pricing rules | booking + notifications |

### Commerce
- What works today: broad route coverage, product and orders models exist, admin shop controls exist. Evidence: `SOCELLE_DATA_DEPENDENCY_MAP_20260309.json` + `/admin/shop/*` routes.
- What is a shell: key conversion pages (`Cart`, `Checkout`, `OrderHistory`, `ShopCheckout`, `ShopOrderDetail`, `Wishlist`). Evidence: `shell_detector_report.json`.
- Missing to be fully built: reliable checkout lifecycle, order visibility, post-purchase UX, exports, funnel metrics. Evidence: dead ends + shell list.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/checkout` + `/shop/checkout`: complete payment, shipping, error recovery states (L). 2) `/account/orders` + `/shop/orders`: live order timeline with status updates (M). 3) `/account/wishlist`: make wishlist actionable with stock/price alerts (S). 4) `/shop/product/:slug`: add variant-level inventory and recommendation rail (M). 5) Add commerce funnel metrics (view->cart->checkout->purchase) in admin shop hub (M). | payment/webhook hardening + inventory model | shell files + dead-end screenshots |
| Premium | 1) Subscription bundles and replenishment orders (L). 2) Dynamic pricing/promotions by segment (L). 3) One-click reorder with personalized kits (M). 4) Returns/exchanges self-service portal (M). 5) Loyalty and rewards ledger integrated with CRM (L). | billing, promotions, loyalty schema | commerce + crm |

### Admin
- What works today: largest operational surface with many live controls, audit and shell/inventory dashboards present. Evidence: `SOCELLE_ROUTE_MAP_20260309.json` (`admin=88`).
- What is a shell: `AdminLogin`, `IntelligenceDashboard`, `RegionManagement`, `ReportsLibrary`, multiple CMS/brand-hub pages. Evidence: `shell_detector_report.json`.
- Missing to be fully built: unified system health, policy automation, role simulation, abuse controls, incident workflow. Evidence: shell and error inventory.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `/admin/dashboard`: convert into real-time health board (edge status, feed lag, auth failures) (M). 2) `/admin/feature-flags`: add staged rollout controls and blast-radius estimates (M). 3) `/admin/audit-log`: enrich with actor-resource diffs and export (S). 4) `/admin/shell-detection`: add owner assignment + SLA dates per shell page (S). 5) `/admin/inventory-report`: show drift alerts against previous baseline (S). | telemetry ingestion + ownership metadata | admin routes + existing admin tools |
| Premium | 1) Policy-as-code UI for guardrails and approvals (L). 2) Incident response workspace with runbooks and paging hooks (L). 3) Role simulation sandbox (what each user sees) (M). 4) Automated regression watch from nightly crawl diff (M). 5) Cost governance cockpit (AI/API spend forecasting) (M). | ops integrations + scheduled jobs | `/admin/*` |

### Search
- What works today: ingredient search route exists and ingredient data paths are present. Evidence: route `/ingredients/search`, `SOCELLE-MOBILE` has `ingredient_search_screen.dart`.
- What is a shell: no dedicated global cross-hub search surface detected. Evidence: `docs/qa/SOCELLE_HUB_MAP_20260309.json` (`pages=0`).
- Missing to be fully built: universal search index, cross-entity relevance, saved searches, search analytics. Evidence: route map + hub map.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) Add global `/search` route and top-nav entry (S). 2) Build unified search API for brands/jobs/courses/protocols (M). 3) Add scoped filters and recent search history (S). 4) Add “no results” guidance and related suggestions (S). 5) Add admin search telemetry dashboard (S). | search index + API composition | missing global route in `SOCELLE_ROUTE_MAP_20260309.json` |
| Premium | 1) Semantic/vector search across editorial + intelligence content (L). 2) Personalized ranking by role/tier (M). 3) Natural-language query assistant (M). 4) Saved searches with alerting (M). 5) Cross-hub command palette for power users (M). | embeddings + personalization infra | search gap evidence above |

### Notifications
- What works today: notification preferences and ledger components are live. Evidence: `src/lib/notifications/useNotifications.ts`, `NotificationLedgerPanel.tsx`, hub score `100` in current scope.
- What is a shell: none flagged in current pages. Evidence: `docs/qa/SOCELLE_HUB_MAP_20260309.json`.
- Missing to be fully built: cross-hub routing for actionable notifications, digest quality metrics, escalation chains. Evidence: route `/portal/notifications`, `/brand/notifications`, `/admin/inbox`.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) Unify inbox model across Pro/Brand/Admin (M). 2) Add notification deep-links to owning entity state (S). 3) Add retry/failure state for delivery channels (S). 4) Add digest scheduling controls by persona (S). 5) Add unread SLA metrics dashboard (S). | shared notification schema | routes `/portal/notifications`, `/admin/inbox` |
| Premium | 1) AI-prioritized inbox ranking (M). 2) Revenue-impact digest (“what needs action today”) (M). 3) Multi-channel escalation policies (email/SMS/push) (L). 4) Contextual nudge engine from behavior signals (L). 5) Notification fatigue scoring + suppression recommendations (M). | messaging + analytics + AI | notification components + routes |

### Authoring
- What works today: route scaffolding exists for studio and CMS authoring. Evidence: `/portal/studio*`, `/admin/cms/*` in `App.tsx`.
- What is a shell: `StudioHome`, `StudioEditor`, `CourseBuilder`, CMS block/template pages. Evidence: `shell_detector_report.json`.
- Missing to be fully built: durable editor state, block library lifecycle, preview-publish pipeline, revision history. Evidence: shell files.

| Tier | Upgrades (5 each) | Dependencies | Evidence |
|---|---|---|---|
| High-leverage | 1) `StudioEditor.tsx`: implement autosave + conflict handling (M). 2) `StudioHome.tsx`: add real document list with status and owner filters (S). 3) `CourseBuilder.tsx`: connect module/lesson CRUD to education tables (M). 4) `/admin/cms/blocks`: complete block CRUD and dependency checks (M). 5) Add preview links and publish validation across studio and CMS (S). | editor persistence + CMS schema | shell files in report |
| Premium | 1) Real-time multi-author editing (L). 2) Reusable content fragments with dependency graph (M). 3) Version timeline with rollback and compare views (M). 4) Brand-safe AI authoring assistant (M). 5) Approval workflow engine (author->reviewer->publisher) (L). | collaboration + workflow engine | authoring routes and shell evidence |

## 3) Design Upgrade Audit (Summary)
- Detailed design recommendations are in `docs/qa/SOCELLE_DESIGN_UPGRADES_2026-03-09.md`.
- Key debt multipliers identified in codebase:
  - Table implementation sprawl (`92` table markups) -> inconsistent density/sorting/filtering affordances.
  - Modal implementation sprawl (`38` `fixed inset-0` overlays) despite shared `src/components/ui/Modal.tsx`.
  - Mixed button systems (`btn-mineral-*` plus ad-hoc rounded-full class stacks) causing CTA inconsistency.
- Evidence: `rg` scans over `SOCELLE-WEB/src/pages` and `SOCELLE-WEB/src/components`.

## 4) Error + Reliability Audit
### Console Error Inventory
- Error totals: `314` console, `297` request failures, `186` HTTP failures. Evidence: `docs/qa/e2e-flow-audit_20260309_105413.json`.
- Dominant client errors:
  - CSP block for Fontshare stylesheet.
  - Aborted font/media requests (`fonts.gstatic.com`, `videos/brand/dropper.mp4`).
  - Repeated failed resource loads tied to failed API responses.
- Evidence: `docs/qa/e2e-flow-audit_20260309_105413/logs/public.log:1`, `:2`, `:4`, `:21`.

### Network Error Inventory
- Highest failing targets (count):
  - `api.fontshare.com` (`114`), `fonts.gstatic.com` (`101`), `market_signals` (`43`), `stories` (`41`), `brands` (`40`), `data_feeds` (`39`).
- Evidence: `docs/qa/SOCELLE_AUDIT_FACTS_20260309.json` (`top_error_targets`).

### Edge Function Failure Paths
- Frontend pages invoking edge functions: `create-checkout`, `verify-certificate`, `scorm-runtime`. Evidence: `docs/qa/SOCELLE_DATA_DEPENDENCY_MAP_20260309.json`.
- Shared edge guard is a kill-switch only (enable/disable), not a rate-limiter. Evidence: `SOCELLE-WEB/supabase/functions/_shared/edgeControl.ts`.
- UI fallback exists for missing control table in admin (`isDemo` mode) but no equivalent user-facing incident guidance on public checkout/certificate flows. Evidence: `SOCELLE-WEB/src/lib/useEdgeFunctionControls.ts`.

### Retry/Backoff and Error Boundary Gaps
- React Query retry is set to `1` globally; no explicit progressive backoff strategy documented for mission-critical flows. Evidence: `SOCELLE-WEB/src/main.tsx`.
- Global error boundary exists, but domain-level boundaries/recovery affordances remain inconsistent by route. Evidence: `SOCELLE-WEB/src/components/ErrorBoundary.tsx`, route-level shell report state gaps.

### Rate Limiting / Abuse Protection Gaps
- `create-checkout` and `send-email` edge functions authenticate and validate input but do not apply centralized request throttling in shared middleware. Evidence: `SOCELLE-WEB/supabase/functions/create-checkout/index.ts`, `SOCELLE-WEB/supabase/functions/send-email/index.ts`, `_shared/edgeControl.ts`.

## Recommended Upgrades (Ranked)
| Rank | Upgrade | Why now | Effort |
|---:|---|---|---|
| 1 | Fix failing public query contracts (`brands`, `stories`, `data_feeds`, `market_signals`) | Immediate trust + conversion impact | M |
| 2 | Complete checkout/order history/wishlist conversion path | Direct revenue lift | L |
| 3 | Unblock role E2E credentials and run authenticated flow pass | Removes blind spots for Pro/Brand/Admin | S |
| 4 | Complete CMS admin CRUD + publish workflow | Enables content velocity and SEO control | M |
| 5 | Complete authoring studio persistence + publish pipeline | Unlocks premium content workflows | M |
| 6 | Normalize empty/error/loading states on top-traffic routes | Reduces support load and churn | S |
| 7 | Implement export layer for Intelligence/CRM/Sales/Commerce | Operator value + enterprise readiness | M |
| 8 | Add global search surface and unified indexing | Reduces navigation friction | M |
| 9 | Consolidate modal/table primitives | Lowers design debt and QA cost | M |
| 10 | Add edge-function rate limit middleware | Abuse prevention + stability | M |
| 11 | Build admin runtime health cockpit | Faster incident detection | M |
| 12 | Improve booking conflict + utilization tooling | Throughput and scheduling efficiency | M |
| 13 | Add notification deep-link and SLA instrumentation | Better action completion | S |
| 14 | Add marketing attribution + segment simulator | Better campaign ROI decisions | M |
| 15 | Launch intelligence action dispatch into CRM/Marketing | Drives cross-hub retention | S |
