# PRODUCT SURFACE AUDIT
**Project:** SOCELLE GLOBAL Monorepo
**Date:** 2026-03-13
**Authority:** /.claude/CLAUDE.md §E, SOCELLE-WEB/.claude/CLAUDE.md §E, build_tracker.md
**Scope:** All public routes, portal routes, user journeys, signal data, dead ends, shell surfaces, and IDEA MINING implementation status.

---

## 1. PUBLIC ROUTES

| Route | Status | Evidence | Notes |
|-------|--------|----------|-------|
| `/` (Home) | DEMO | SOCELLE-WEB/.claude/CLAUDE.md §E — hardcoded `INTELLIGENCE_SIGNALS` array; BUG-W9-02 listed as P0-02 | DEMO label previously absent; P0-02 marked resolved in build_tracker but audit trail incomplete |
| `/intelligence` | LIVE | `useIntelligence()` queries `market_signals` table; isLive guard enforced | 121+ signals in DB; vertical filter + tier gate active |
| `/brands` | LIVE | `brands` table, `active` status filter | Feed wired via TanStack Query |
| `/brands/:slug` | LIVE | `brands` + `brand_seed_content` + products + protocols joined | Slug-based detail page |
| `/education` | LIVE | `brand_training_modules` table | DEMO badges on stats panels (stats are mock aggregates) |
| `/protocols` | PARTIAL | `canonical_protocols` table; page wired but Category C shell — missing error/loading/empty states confirmed | True shell per FOUND-WO-04 shell:check output |
| `/events` | PARTIAL LIVE | `events` table wired commit 076cb12; DEMO badge present | `/events/:slug` route missing — DEBT-01 dead end |
| `/jobs` | DEMO | Stub; depends on EVT-WO job tables; W10-06 not started | No `job_postings` table wired |
| `/for-brands` | DEMO | Hardcoded `STATS` array per SOCELLE-WEB/.claude/CLAUDE.md §E | No Supabase data; no DEMO badge confirmed |
| `/professionals` | DEMO | Hardcoded `STATS` array per SOCELLE-WEB/.claude/CLAUDE.md §E | No Supabase data; no DEMO badge confirmed |
| `/plans` | DEMO | Hardcoded `TIERS`, `COMPARISON`; Stripe not wired | PAY-UPGRADE-WO blocked — owner must configure `stripe_price_id` |
| `/search` | PARTIAL | SearchPage.tsx added commit 076cb12; brand + product search only | Semantic/pgvector search not wired (SEARCH-WO not started) |
| `/insights` | LIVE | `useRssItems` via TanStack Query — resolved W10-04 | Was orphaned; now redirected |
| `/home` | ORPHAN | `IntelligenceHome.tsx` exists at `/home`; not in `NAV_LINKS` per SOCELLE-WEB/.claude/CLAUDE.md §C | DEBT-03 — not linked from nav |
| `/for-medspas` | ORPHAN | No nav entry; page exists but unreachable via MainNav | DEBT-03 |
| `/for-salons` | ORPHAN | No nav entry; page exists but unreachable via MainNav | DEBT-03 |
| `/pricing` | ORPHAN/DUPLICATE | Duplicate of `/plans`; not in canonical nav | DEBT-03 — should redirect to `/plans` |
| `/education/:course` | LIVE | Course detail wired to `brand_training_modules` | CoursePlayer is Category C shell (no error/loading states) |
| `/protocols/:slug` | PARTIAL | `canonical_protocols` detail; shell status unconfirmed | Category C concern — maps to INTEL-WO-01 |
| `/request-access` | LIVE | Inserts to `access_requests` Supabase table per SOCELLE-WEB/.claude/CLAUDE.md §C | Conversion funnel step 2 |
| `/portal/signup` | LIVE | Auth flow step 3 | GoTrue-backed; NEVER MODIFY |
| `/forgot-password` | PARTIAL | W10-01 open — `pro-*` token violations not yet cleaned | Auth page; functional but token debt |
| `/reset-password` | PARTIAL | W10-01 open — `pro-*` token violations not yet cleaned | Auth page; functional but token debt |

---

## 2. PORTAL ROUTES

### 2a. Business Portal (`/portal/*`)

| Route | Portal | Status | Evidence | Notes |
|-------|--------|--------|----------|-------|
| `/portal/dashboard` | Business | LIVE | Exists per CLAUDE.md §B | Standard dashboard |
| `/portal/intelligence` | Business | DEMO | SOCELLE-WEB/.claude/CLAUDE.md §E — "heavy mock data"; IDEA-MINING-01 map confirms portal hub is still DEMO | P0 gap — authenticated users see mock signals |
| `/portal/crm` | Business | LIVE | `crm_contacts` via TanStack Query | CRM-WO-07 complete |
| `/portal/crm/consent` | Business | LIVE | `crm_consent_log`, CRM-WO-07 | Consent audit log wired |
| `/portal/education` | Business | LIVE | `EducationDashboard`, `course_enrollments` | |
| `/portal/procurement` | Business | LIVE | `ProcurementDashboard`, orders/products | Checkout not wired to Stripe (PAY-WO blocked) |
| `/portal/marketing` | Business | PARTIAL | Route exists; dual-path conflict with `/portal/marketing-hub/*` | LANE-A-DEBT-03 |
| `/portal/marketing-hub/*` | Business | PARTIAL | Duplicate path — LANE-A-DEBT-03 | Causes route ambiguity |
| `/portal/benchmarks` | Business | DEMO | All mock peer data per SOCELLE-WEB/.claude/CLAUDE.md §E | `BenchmarkDashboard` — Category C shell, maps to BUILD 2 |
| `/portal/sales` | Business | LIVE | Signal attribution wired; `OpportunityFinder` uses `useIntelligence()` | Journey 6 verified |

### 2b. Brand Portal (`/brand/*`)

| Route | Portal | Status | Evidence | Notes |
|-------|--------|--------|----------|-------|
| `/brand/dashboard` | Brand | LIVE | Exists per CLAUDE.md §B | |
| `/brand/intelligence` | Brand | PARTIAL DEMO | LANE-B fixes: DEMO badges on Position Summary, Brand Performance, Reseller Intelligence, Market Position tabs (verify_LANE-B-fixes_2026-03-10.json) | Panels labeled but underlying data still mock |
| `/brand/intelligence-report` | Brand | DEMO | SOCELLE-WEB/.claude/CLAUDE.md §E — "Mock report data" | `BrandAIAdvisor.tsx` — Category C shell, maps to dedicated WO |
| `/brand/login` | Brand | LIVE (auth) | Auth page — Category A false positive per shell detector | NEVER MODIFY |
| `/brand/application-received` | Brand | LIVE (transactional) | Confirmation page — Category A false positive | No live data required |
| `/brand/products` | Brand | LIVE | Listed as protected route per CLAUDE.md §B | Commerce module |
| `/brand/orders` | Brand | LIVE | Listed as protected route per CLAUDE.md §B | Commerce module; NEVER MODIFY |

### 2c. Admin Portal (`/admin/*`)

| Route | Portal | Status | Evidence | Notes |
|-------|--------|--------|----------|-------|
| `/admin` | Admin | LIVE | `AdminLayout` per CLAUDE.md §B | |
| `/admin/intelligence` | Admin | LIVE | `IntelligenceDashboard`, `useAdminIntelligence` | Journey 7 verified PASS |
| `/admin/feeds` | Admin | LIVE | `AdminFeedsHub` with `display_order` sort; MERCH-INTEL-03-DB | Feed management UI live |
| `/admin/story-drafts` | Admin | NEW | Commit e0a2c40 — CMS-WO-07 prep; `AdminStoryDrafts` page + `story_drafts` migration | Feeds-to-drafts function added |
| `/admin/cms/*` | Admin | LIVE | CMS admin pages wired to Supabase via TanStack Query | Category B detector fix applied |
| `/admin/login` | Admin | LIVE (auth) | Category A false positive — auth page | NEVER MODIFY |
| `/admin/intelligence-dashboard` | Admin | SHELL | `IntelligenceDashboard` — Category C true shell, maps to ADMIN-WO-03 | Full stub |
| `/admin/region-management` | Admin | SHELL | `RegionManagement` — Category C true shell, maps to ADMIN-WO-04 | Full stub |
| `/admin/reports-library` | Admin | SHELL | `ReportsLibrary` — Category C true shell, maps to ADMIN-WO-05 | Full stub |

---

## 3. TOP 10 USER JOURNEYS

### Journey 1 — Anonymous to Intelligence Access
**Steps:** `/` → `/intelligence` → sign in → `/portal/intelligence`
**Status:** PARTIAL — first 3 steps working; step 4 broken
**Blocking issues:**
- `/portal/intelligence` still DEMO (heavy mock data); authenticated users do not receive live signals
- Maps to INTEL-WO-01 (wire portal intelligence to live DB)
**Evidence:** SOCELLE-WEB/.claude/CLAUDE.md §E; IDEA_MINING_IMPLEMENTATION_MAP.md Pattern 2

---

### Journey 2 — Brand Discovery
**Steps:** `/brands` → `/brands/:slug` → contact/purchase
**Status:** COMPLETE
**Blocking issues:** None for core flow; purchase path requires Stripe (PAY-WO blocked but non-blocking for discovery)
**Evidence:** Build tracker — `brands` + `brand_seed_content` wired; LIVE confirmed

---

### Journey 3 — Education Journey
**Steps:** `/education` → `/education/:course` → `CoursePlayer` → Certificate
**Status:** PARTIAL
**Blocking issues:**
- `CoursePlayer` is Category C shell — missing error/loading states (FOUND-WO-07)
- "View Certificate" CTA added (LANE-B fix, commit d1442d3) when `overallProgress === 100` and no `nextLesson` — was a dead end previously
- Stats panels on `/education` are DEMO (SOCELLE-WEB/.claude/CLAUDE.md §E)
**Evidence:** verify_LANE-B-fixes_2026-03-10.json; FOUND-WO-04 shell breakdown Category C

---

### Journey 4 — Protocol Research
**Steps:** `/protocols` → `/protocols/:slug` → product links
**Status:** PARTIAL
**Blocking issues:**
- `/protocols` wired to `canonical_protocols` but confirmed Category C shell — missing error/loading/empty states
- Product link CTAs from protocol detail not verified as live
**Evidence:** CLAUDE.md §4.1 Category C true shells; FOUND-WO-07

---

### Journey 5 — CRM Contact Management
**Steps:** `/portal/crm` → contact list → `ContactDetail` → intelligence tab
**Status:** COMPLETE
**Blocking issues:** None
**Evidence:** `crm_contacts` via TanStack Query; CRM-WO-07 complete; verify_LANE-A.json PASS

---

### Journey 6 — Deal Pipeline
**Steps:** `/portal/sales` → `OpportunityFinder` → signal attribution → `CreateDeal`
**Status:** COMPLETE
**Blocking issues:** None — `OpportunityFinder` uses `useIntelligence()` (tier bypass fixed, verify_TIER-BYPASS-FIX_2026-03-10.json)
**Evidence:** LANE-A audit PASS; TIER-BYPASS fix confirmed

---

### Journey 7 — Admin Intelligence
**Steps:** `/admin/intelligence` → live signals → API health → feed status
**Status:** COMPLETE
**Blocking issues:** None
**Evidence:** `useAdminIntelligence` wired; admin feeds UI live; verify_LANE-A.json PASS

---

### Journey 8 — Marketing Campaign
**Steps:** `/portal/marketing` → signal → campaign creation
**Status:** PARTIAL — BROKEN
**Blocking issues:**
- Dual route conflict: `/portal/marketing` vs `/portal/marketing-hub/*` (LANE-A-DEBT-03)
- No signal → campaign CTA wired (DEBT-04 from LANE-A audit)
- Route ambiguity means users may land on wrong hub
**Evidence:** CLAUDE.md §4.1 DEBT-03 and DEBT-04; LANE-A audit P0 dead ends

---

### Journey 9 — Brand Portal Intelligence
**Steps:** `/brand/intelligence` → market position → competitor signals
**Status:** PARTIAL DEMO
**Blocking issues:**
- DEMO badges present on all panels (Position Summary, Brand Performance, Reseller Intelligence, Market Position) per LANE-B fixes
- Underlying data still mock — no live brand-specific signal query wired
- `BrandAIAdvisor.tsx` is Category C shell
**Evidence:** verify_LANE-B-fixes_2026-03-10.json; IDEA_MINING_IMPLEMENTATION_MAP.md Pattern 2

---

### Journey 10 — Procurement / Commerce
**Steps:** `/portal/procurement` → products → cart → checkout
**Status:** PARTIAL
**Blocking issues:**
- `/portal/procurement` LIVE for product listing and orders
- Stripe checkout not wired — PAY-UPGRADE-WO blocked pending owner `stripe_price_id` configuration
- `/plans` page is DEMO (hardcoded tiers); upgrade CTA from `TierGate` routes to DEMO page (DEBT-02)
**Evidence:** SOCELLE-WEB/.claude/CLAUDE.md §E; MEMORY.md PAY-UPGRADE-WO BLOCKED note; LANE-A DEBT-02

---

## 4. IDEA MINING — Code vs Docs-Only

Source: `SOCELLE-WEB/docs/ops/IDEA_MINING_IMPLEMENTATION_MAP.md` (commit d1442d3)
Authority: `docs/operations/STUDIO_IDEA_MINING_2026.md`

| Pattern | Status | In Code | Docs Only | Evidence |
|---------|--------|---------|-----------|----------|
| Impact Score Badge on Signal Cards | PARTIAL | `impact_score` in DB + `rowToSignal()` + `IntelligenceSignalDetail.tsx:346-356` detail view only | Badge absent from `SignalCardStandard` and `SignalCardFeatured` list views | IDEA_MINING_IMPLEMENTATION_MAP.md Pattern 1; screenshot `screens/2026-03-13/06_signal_card_grid_images.png` |
| Snapshot / Today View as Entry Point | PARTIAL | `IntelligenceHome.tsx` at `/home` (INTEL-WO-11, commit 97b55c4); KPIStrip + SpotlightPanel on `/intelligence` | Public `/intelligence` does not open at Today View tab; `/portal/intelligence` still DEMO | IDEA_MINING_IMPLEMENTATION_MAP.md Pattern 2; screenshot `screens/2026-03-13/01_intelligence_all.png` |
| Similarity Deduplication with "N Similar" Badge | PARTIAL (DB only) | `fingerprint` + `is_duplicate` columns (FEED-WO-03); `useIntelligence.ts` filters `.eq('is_duplicate', false)` | No UI collapse badge; no cluster expand affordance | IDEA_MINING_IMPLEMENTATION_MAP.md Pattern 3; screenshot `screens/2026-03-13/06_signal_card_grid_images.png` |
| Feed quality scoring | PARTIAL | `impact_score`, `confidence`, `confidence_tier`, `magnitude` on `market_signals`; `rankedScore` computed in `useIntelligence.ts` | No UI percentile indicator ("top 15% this week") | IDEA_MINING_IMPLEMENTATION_MAP.md Pattern 1 |
| Signal → Campaign cross-hub action | DOCS ONLY | No code wiring signal card CTA to campaign creation | LANE-A-DEBT-04 documents the gap | CLAUDE.md §4.1 DEBT-04 |
| CMS editorial rail | IN CODE | 6 published `cms_posts` in Intelligence space (CMS-SEED-01, migration 000033); editorial rail live | — | MEMORY.md CMS-SEED-01 entry; commit e0a2c40 |
| Story drafts auto-ingest | PARTIAL | `AdminStoryDrafts` page + `story_drafts` migration + feeds-to-drafts function (CMS-WO-07 prep, commit e0a2c40) | CMS-WO-07 not yet complete | MEMORY.md P1 GATE |
| Commerce integration (affiliate badges, FTC) | DOCS ONLY | No affiliate badge rendering in code; FTC-compliant badge spec in CLAUDE.md §12 | COMMERCE-WO not started (BUILD 2) | CLAUDE.md §3 BUILD 2 queue |

---

## 5. SIGNAL DATA FRESHNESS SUMMARY

| Metric | Value | Source |
|--------|-------|--------|
| Total feeds configured | 175 | CLAUDE.md §4 data — COVERAGE-EXPANSION-01 |
| Enabled feeds | 103 | CLAUDE.md §4 |
| Domains covered | 15/15 | COVERAGE-EXPANSION-01 complete |
| Healthy RSS feeds (HTTP verified) | 18 | verify_FEED-WO-02.json; FEED-URL-01 audit |
| Disabled feeds (paywall/bot-blocked) | 17 | FEED-URL-01 — Mordor, Mintel, LinkedIn, etc. |
| Total active signals in DB | 121+ | MEMORY.md P0 GATE — 74 NEWSAPI-INGEST-01 + remainder openfda/RSS |
| Signals from NEWSAPI-INGEST-01 | 74 | GNews 11 + NewsAPI 63 (commit 6a43a75) |
| Signals from ingest-openfda | 82 active | FREE-DATA-01; 48 misclassified surgical archived (migration 20260313000023) |
| Vertical coverage — medspa | 34 signals | MEMORY.md INTEL-MEDSPA-01 |
| Vertical coverage — salon | 20 signals | MEMORY.md INTEL-MEDSPA-01 |
| Vertical coverage — beauty_brand | 11 signals | MEMORY.md INTEL-MEDSPA-01 |
| Ingredients table rows | 2,950 | open-beauty-facts-sync v8; FREE-DATA-01 |
| Freshness schedule | pg_cron hourly | feed-orchestrator; FEED-WO-01 |
| Signal age gate (free tier) | 14-day window | `useIntelligence.ts` 14-day free window |
| Duplicate fingerprints | 0 null fingerprints | verify_MERCH-INTEL-03-DB.json |
| Regulatory signals with impact >= 70 | 17 | verify_MERCH-INTEL-03-DB.json; MERCH-05 PASS |
| Currents API | DISABLED | Times out >30s; on hold per MEMORY.md |
| Reddit feeds | ON HOLD | REDDIT_CLIENT_ID/SECRET not set |

**Signal type enum valid values:** `product_velocity | treatment_trend | ingredient_momentum | brand_adoption | regional | pricing_benchmark | regulatory_alert | education`

---

## 6. DEAD ENDS INVENTORY

| Dead End ID | Surface | Description | WO Mapping | Priority |
|-------------|---------|-------------|------------|----------|
| DEBT-01 | `/events` → `/events/:slug` | Event listing page exists but `/events/:slug` detail route is missing — clicking any event card is a dead end | EVT-WO-01 | P0 |
| DEBT-02 | `TierGate` upgrade CTA | Upgrade button from `TierGate` component routes to `/pricing` (DEMO page, hardcoded tiers) — not Stripe | PAY-WO-01; SITE-WO-03 | P0 |
| DEBT-03 | Orphan routes | `/home`, `/for-medspas`, `/for-salons`, `/pricing` (duplicate of `/plans`) — not in nav, no redirect | ROUTE-CLEANUP-WO | P1 |
| DEBT-03b | Dual marketing paths | `/portal/marketing` vs `/portal/marketing-hub/*` — route ambiguity; user may land on wrong hub | LANE-A-DEBT-03 / ROUTE-CLEANUP-WO | P1 |
| DEBT-04 | Brand → Signal → Campaign | No CTA wires a brand intelligence signal to a campaign creation action in the marketing hub | LANE-A-DEBT-04; MKT-WO-01 | P1 |
| DEBT-05 | `/portal/intelligence` | Authenticated portal intelligence hub renders DEMO mock data — journey 1 final step broken | INTEL-WO-01 | P0 |
| DEBT-06 | `/plans` Stripe | `/plans` is hardcoded TIERS; no Stripe `stripe_price_id` wired; PAY-UPGRADE-WO blocked | PAY-WO-01 | BLOCKED (owner action) |
| DEBT-07 | CoursePlayer completion | CoursePlayer had no "View Certificate" CTA when course complete — was a dead end (FIXED: LANE-B fix) | Fixed commit | RESOLVED |
| DEBT-08 | `Cart.tsx:84 'Shop Now'` | §9 STOP CONDITION — banned term in user-facing copy | Banned term sweep — SITE-WO-08 | P0 |
| DEBT-09 | 8× 'AI-powered' in copy | Banned term per CANONICAL_DOCTRINE §9 — present in user-facing surfaces | SITE-WO-08; banned-term-scanner | P0 |
| DEBT-10 | `IntelligenceCommerce.tsx` | Calls `useIntelligence()` but renders no LIVE/DEMO badge — fake-live violation | FOUND-WO-13; live-demo-detector | P0 |
| DEBT-11 | 19 raw `market_signals` queries | Page/component-level callers bypass isLive/tier contract | FOUND-WO-11 | P0 |
| DEBT-12 | 1 raw `useEffect + supabase.from()` | `src/lib/enrichment/useEnrichment.ts` scheduling trigger — must migrate to `useQuery` | §5 tech stack rule; dev-best-practice-checker | P0-3 |
| DEBT-13 | 29 failing unit tests | `@testing-library/react` v16.3.2 incompatible with React 19 — must upgrade to `^17.x` | P2-1 | P2 |
| DEBT-14 | database.types.ts drift | 116 tables reflected vs 165 migrations; run `supabase gen types` | DB-TYPES-02 (partially done); re-run needed | P0-5 |
| DEBT-15 | SEO coverage 40.1% | 109/272 pages have meta tags; 163 uncovered | SITE-WO-04 | P3 |
| DEBT-16 | `brand-*` token violations (19) | `StatCard`, `Button`, `EmptyState`, `UpgradeGate`, `index.css` — legacy tokens, migrate to Pearl Mineral V2 | P1-1; token-drift-scanner | P1 |
| DEBT-17 | `intel-*` token violations (30) | `GlowBadge`, `DarkPanel`, 5 business portal pages — replace with `signal-up/down/warn/accent` | P1-2; token-drift-scanner | P1 |

---

## 7. SHELL SURFACE INVENTORY — 23 TRUE SHELLS

Source: CLAUDE.md §4.1 DEBT-7 Category C; FOUND-WO-04 shell:check output (2026-03-09)

| # | Component / Page | Hub | Shell Type | WO Assignment | Remediation Priority |
|---|-----------------|-----|------------|---------------|----------------------|
| 1 | `Protocols.tsx` | Public | Missing live data wire, error/empty/loading states | INTEL-WO-01 | HIGH — BUILD 1 |
| 2 | `Education.tsx` (public) | Public | Missing live data wire; stats panels DEMO unlabeled | INTEL-WO-01 / FEED-WO-02 | HIGH — BUILD 1 |
| 3 | `BlogPostPage.tsx` | Public | Missing live data wire, all states | FEED-WO-02; CMS-WO-06 | HIGH — BUILD 1 |
| 4 | `CoursePlayer.tsx` | Public | Missing error/loading states; "View Certificate" CTA added but states absent | FOUND-WO-07 | HIGH — BUILD 1 |
| 5 | `Insights.tsx` | Public | Was orphan; W10-04 resolved (redirect wired) | W10-04 RESOLVED | RESOLVED |
| 6 | `ApiDocs.tsx` | Public | Full stub — no live data, all states missing | INTEL-WO-01 scope | HIGH — BUILD 1 |
| 7 | `ApiPricing.tsx` | Public | Full stub — no live data | SITE-WO-03 / PAY-WO | HIGH — BUILD 1 |
| 8 | `IntelligenceDashboard.tsx` | Admin | Full stub — maps to ADMIN-WO-03 | ADMIN-WO-03 | HIGH — BUILD 2 |
| 9 | `RegionManagement.tsx` | Admin | Full stub — maps to ADMIN-WO-04 | ADMIN-WO-04 | HIGH — BUILD 2 |
| 10 | `ReportsLibrary.tsx` | Admin | Full stub — maps to ADMIN-WO-05 | ADMIN-WO-05 | HIGH — BUILD 2 |
| 11 | `HubEducation.tsx` | Admin (brand-hub sub) | Full stub — admin brand-hub sub-page | ADMIN-WO-03/04 scope | HIGH — BUILD 2 |
| 12 | `HubProtocols.tsx` | Admin (brand-hub sub) | Full stub — admin brand-hub sub-page | ADMIN-WO-03/04 scope | HIGH — BUILD 2 |
| 13 | `BenchmarkDashboard.tsx` | Business Portal | Missing live data + all states | BUILD 2 CRM/INTEL scope | MED — BUILD 2 |
| 14 | `LocationsDashboard.tsx` | Business Portal | Missing live data + all states | BUILD 2 CRM scope | MED — BUILD 2 |
| 15 | `CECredits.tsx` | Business Portal | Missing live data + all states; tier bypass fixed (TIER-BYPASS-FIX) | BUILD 2 EDU scope | MED — BUILD 2 |
| 16 | `StudioHome.tsx` | Business Portal | Missing error state + live data signal | STUDIO-UI-01 (BUILD 4) | MED — BUILD 2 |
| 17 | `CourseBuilder.tsx` | Business Portal | Missing error state + live data signal | AUTH-CORE-01 / STUDIO-UI-01 | MED — BUILD 2 |
| 18 | `BrandAIAdvisor.tsx` | Brand Portal | Full feature gap — DEMO badges added but no live data | Dedicated WO needed (BUILD 3 BRAND-WO-04) | MED — BUILD 3 |
| 19 | `IntelligencePricing.tsx` | Brand Portal | DEMO banner added (LANE-B fix); font-playfair removed; but full feature gap | BUILD 3 BRAND-WO-05 | MED — BUILD 3 |
| 20 | `QuizPlayer.tsx` | Education Hub | Missing error/empty state | EDU-WO scope (BUILD 2) | LOW — BUILD 2 |
| 21 | `ProposalBuilder.tsx` | Sales Hub | Missing loading/error/empty states | SALES-WO scope (BUILD 2) | LOW — BUILD 2 |
| 22 | `/portal/intelligence` | Business Portal | Renders DEMO mock data — not a static shell but a fake-live surface | INTEL-WO-01 | P0 — BUILD 1 |
| 23 | `/brand/intelligence-report` | Brand Portal | Mock report data — fake-live surface | BRAND-WO-04 | MED — BUILD 3 |

**Shell count post-detector-overhaul:**
- Category A false positives (21 auth/transactional pages): exempted via `shell:exempt` annotation — no code change required
- Category B false positives (7 CMS admin pages): detector pattern gap fixed — `useQuery`/`useCms*`/`useAdmin*` patterns now recognized
- Category C true shells (23 pages): listed above — require WO execution

**Shell reduction projection:** After Category A + B detector fixes only: 51 → ~23 true shells. After BUILD 1 (items 1-7 above): ~16 remain. After BUILD 2 (items 8-21): ~3 remain. After BUILD 3 (items 22-23): 0 target.

---

## 8. LAUNCH GATE STATUS

Cross-reference with CLAUDE.md §16 (24 non-negotiables):

| Gate | Status | Blocker |
|------|--------|---------|
| `npx tsc --noEmit` → Exit 0 | PASS | — |
| `npm run build` → Exit 0 | PASS | — |
| `/` routes to Intelligence home | PASS | — |
| Errors visible in Admin Hub | PASS | — |
| TanStack Query on all data fetching | PARTIAL | 1 raw `useEffect` in `useEnrichment.ts` (DEBT-12) |
| PAYMENT_BYPASS = false in production | UNKNOWN | Verify before deploy |
| 0 font-serif on public pages | PASS | Resolved per site-wide audit 2026-03-09 |
| 0 banned terms on public pages | FAIL | `Cart.tsx:84 'Shop Now'`; 8× 'AI-powered' (DEBT-08, DEBT-09) |
| Stripe webhooks functional | FAIL | PAY-WO blocked |
| Signals fresh (≥5 rows < 24h) | PASS | 121+ signals, pg_cron hourly |
| AI briefs: 10 tests, 0 hallucinations | NOT RUN | — |
| SEO baseline complete | FAIL | 40.1% coverage (DEBT-15) |
| database.types.ts matches migrations | PARTIAL | DB-TYPES-02 done; re-run needed for latest migrations |
| Credits deduct correctly | NOT VERIFIED | PAY-WO scope |
| Affiliate links show FTC badges | FAIL | Not implemented (DEBT — COMMERCE-WO not started) |
| Playwright smoke tests pass | UNKNOWN | Not run this session |
| hub-shell-detector returns 0 | FAIL | 23 true shells remain |
| CMS renders only status=published | PASS | PageRenderer checks `status = published` |
| 0 `pro-*` token usages in `src/` | PASS | Resolved 2026-03-09 — prior figure was stale |
| 0 Sentry references | PASS | Fully removed (§16.20 SATISFIED) |
| ≥20 unit tests passing | PARTIAL | 163/192 passing; 29 failing (DEBT-13) |
| ≥10 E2E Playwright tests passing | UNKNOWN | Not verified this session |
| 0 pages raw `useEffect + supabase.from()` | PARTIAL | 1 violation in `useEnrichment.ts` |
| Verification JSONs in `docs/qa/` | PARTIAL | Present for completed WOs; gaps remain for new work |

**Launch gate overall: NOT READY** — minimum 8 blockers unresolved before first paying subscriber.

---

*This audit is a point-in-time snapshot as of 2026-03-13. Execution authority remains `SOCELLE-WEB/docs/build_tracker.md`. All WO IDs must exist in `build_tracker.md` before work begins.*
