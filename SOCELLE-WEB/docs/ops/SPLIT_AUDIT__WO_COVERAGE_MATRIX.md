# SPLIT AUDIT — WO COVERAGE MATRIX

**Project:** SOCELLE GLOBAL — SOCELLE-WEB  
**Date:** 2026-03-13  
**Anchor commit:** d1442d3  
**Authority:** `/.claude/CLAUDE.md` §2–§4; `SOCELLE_MASTER_BUILD_WO.md` §2–§3; `SOCELLE-WEB/docs/build_tracker.md` lines 14–120; `SOCELLE-WEB/MASTER_STATUS.md` §BUILD STATUS, PUBLIC PAGES, PORTAL/BRAND/ADMIN tables; `docs/ops/EXECUTION_STATE_AUDIT.md` §§1–4; `docs/ops/PRODUCT_SURFACE_AUDIT.md` §§1–7; `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` §4–§7.

---

## 0. Legend

- **Status:** `DONE` | `PARTIAL` | `OPEN` | `BLOCKED` | `FROZEN`.
- **Evidence:** Minimal but concrete: WO ID, commit, and at least one file path reference.
- **Blockers:** Either technical (P0/P1/P2 debt), design, or owner decision.

---

## 1. Coverage matrix by area

### 1.1 CMS

| Area | Requirement | WO | Status | Evidence (commit + files) | Blockers |
|------|-------------|----|--------|---------------------------|----------|
| CMS Schema | 8 `cms_*` tables with RLS + indexes (`cms_spaces`, `cms_pages`, `cms_blocks`, `cms_page_blocks`, `cms_posts`, `cms_assets`, `cms_docs`, `cms_templates`) | WO-CMS-01 | DONE | `SOCELLE_MASTER_BUILD_WO.md` lines 137–143; `SOCELLE-WEB/MASTER_STATUS.md` lines 36–41; `SOCELLE-WEB/supabase/migrations/*cms*` | None (FROZEN per CLAUDE §2) |
| CMS Hooks | Typed Supabase client + 8 TanStack hooks (`useCms*`) | WO-CMS-02 | DONE | `SOCELLE_MASTER_BUILD_WO.md` lines 147–153; `SOCELLE-WEB/src/lib/cms/*`; `SOCELLE-WEB/MASTER_STATUS.md` CMS section | None |
| CMS Admin | 7 admin routes `/admin/cms*` with CRUD and media | WO-CMS-03 | DONE | `SOCELLE_MASTER_BUILD_WO.md` lines 157–163; `SOCELLE-WEB/src/pages/admin/Cms*.tsx` | None |
| PageRenderer + public CMS pages | `/pages/:slug`, `/blog`, `/blog/:slug`, `/help/:slug` using `cms_*` | WO-CMS-04 | DONE | `SOCELLE_MASTER_BUILD_WO.md` lines 167–173; `SOCELLE-WEB/src/pages/public/*` (PageRenderer usage) | None |
| Authoring Studio | StudioHome, StudioEditor, CourseBuilder, versioning | WO-CMS-05 | DONE | `SOCELLE_MASTER_BUILD_WO.md` lines 177–191; `SOCELLE-WEB/src/pages/studio/*`; `SOCELLE-WEB/docs/build_tracker.md` lines 65–66 (STUDIO-UI-01..05) | None (core Studio UI is COMPLETE; some Studio‑UI‑06..18 WOs open for advanced features) |
| Hub CMS integration | All hubs pull from `cms_*` instead of hardcoded copy | WO-CMS-06 | MOSTLY DONE (per MASTER_STATUS); some hub journeys still partial | `SOCELLE_MASTER_BUILD_WO.md` lines 195–201; `SOCELLE-WEB/MASTER_STATUS.md` hub upgrade section lines 43–49; `PRODUCT_SURFACE_AUDIT.md` shows some shells that still need full CMS/journey wiring | Remaining shells and hardcoded content per `PRODUCT_SURFACE_AUDIT.md` §1–§3 and DEBT table |
| Editorial rail + story_drafts auto-ingest | story_drafts migration, AdminStoryDrafts page, feeds→drafts function | CMS-WO-07 | OPEN (prep done) | Commit `e0a2c40` (git log -30); `SOCELLE-WEB/MASTER_STATUS.md` admin table lines 75–76; `EXECUTION_STATE_AUDIT.md` line 204 | WO execution + QA still required (P1 gate head) |

### 1.2 Intelligence

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| 10 Intelligence modules | KPI strip, signal table, trend stacks, timeline, opportunities, provenance, category intel, benchmarking, brand health, local market | V2-INTEL-01 | DONE | `SOCELLE_MASTER_BUILD_WO.md` lines 207–223; `SOCELLE-WEB/docs/build_tracker.md` line 33; `docs/qa/verify_INTEL-WO-01-11_2026-03-10T00-00-00-000Z.json` | None |
| 6 AI tools (user-facing) | AI brief, explain signal, activation plan, etc. | V2-INTEL-03 | DONE | `SOCELLE_MASTER_BUILD_WO.md` lines 249–258; `docs/qa/verify_INTEL-WO-01-11_*.json`; AI toolbar usage in `SOCELLE-WEB/src/components/intelligence/*` | Further UX polish captured in IDEA MINING patterns (INTEL-UI-REMEDIATION; not lost) |
| AI engines service menu | menuOrchestrator, planOrchestrator, gapAnalysis, etc. wired with credit + safety | V2-INTEL-02 | PARTIAL | `SOCELLE_MASTER_BUILD_WO.md` lines 230–242; `EXECUTION_STATE_AUDIT.md` Master Platform Upgrade table | Remaining engine upgrades across engines; no “lost” WOs — explicitly partial |
| Portal Intelligence Hub | `/portal/intelligence` LIVE, non‑DEMO | INTEL-WO-01 + DEBT-05 | PARTIAL / DEMO | `PRODUCT_SURFACE_AUDIT.md` lines 45–47; LANE‑A debts; `SOCELLE-WEB/docs/build_tracker.md` lines 75–78 | INTEL‑WO scope exists; need future sessions to execute routing + wiring clean‑up |

### 1.3 Merchandising

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| MERCH rules 1–12 | Topic cap, safety pin sort, source tiers, etc. | MERCH-INTEL-02 / MERCH-INTEL-03-DB | DONE / PARTIAL | `SOCELLE-WEB/docs/build_tracker.md` lines 60–61, 79–81; `docs/qa/verify_MERCH-INTEL-02_v3.json`; `verify_MERCH-INTEL-03-DB.json`; IDEA MINING implementation map lines 19–21 | `MERCH-INTEL-03-FINAL` OPEN (remaining MERCH‑01/06/10; explicitly tracked in `EXECUTION_STATE_AUDIT.md` line 151) |
| Idea-mining merch patterns | Impact badge, dedup clusters, sentiment, action arc | INTEL-UI-REMEDIATION-01 (+ future INTEL-WO extensions) | PARTIAL | `SOCELLE-WEB/docs/ops/IDEA_MINING_IMPLEMENTATION_MAP.md` lines 10–244; `SOCELLE-WEB/docs/build_tracker.md` lines 63–66 (INTEL-UI-REMEDIATION-01 rows) | Remaining UI patterns require new/extended WOs but are **documented and not lost** |

### 1.4 Feeds

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| Feed tables + schedule | `data_feeds`, `feed_run_log`, pg_cron hourly | FEED-WO-01 | DONE | `SOCELLE-WEB/docs/build_tracker.md` lines 28–32; `verify_FEED-WO-01_2026-03-09T23-10-00-000Z.json` | None |
| Ingestion pipeline | rss-to-signals, dedup, DLQ | FEED-WO-02..05 | DONE | `verify_FEED-WO-02..05_*.json`; `EXECUTION_STATE_AUDIT.md` lines 44–46 | None (COVERAGE‑EXPANSION‑01 + NEWSAPI‑INGEST‑01 close remaining gaps) |
| Coverage expansion | 175 feeds, 15/15 domains, NEWSAPI + GNews + OpenFDA | FREE-DATA-01, NEWSAPI-INGEST-01, COVERAGE-EXPANSION-01 | DONE | `SOCELLE-WEB/docs/build_tracker.md` lines 7–8, 60–63; `docs/qa/verify_FREE-DATA-01.json`, `verify_NEWSAPI-INGEST-01.json`, `verify_COVERAGE_EXPANSION.json` | Remaining MERCH‑INTEL‑03-FINAL tidy up; not “lost” |

### 1.5 Search

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| Basic search page | `/search` with brand + product search | SEARCH-WO-02/03 | PARTIAL | `SOCELLE-WEB/docs/build_tracker.md` lines 67–68; `SOCELLE_MASTER_BUILD_WO.md` lines 61–62; `PRODUCT_SURFACE_AUDIT.md` line 24 | Needs pgvector/semantic search and cross‑hub facets; SEARCH‑WO‑01/04/05 OPEN (tracked in EXECUTION_STATE_AUDIT.md lines 81–86) |
| Semantic / pgvector search | Embeddings + vector search across hubs | SEARCH-WO-01/04/05 | OPEN | `SOCELLE_MASTER_BUILD_WO.md` Phase 7 platform features; `EXECUTION_STATE_AUDIT.md` lines 81–90 | Requires pgvector + embeddings; captured, not lost |

### 1.6 Events

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| Events index page | `/events` with live events table | EVT-WO-01 | PARTIAL LIVE | `SOCELLE-WEB/MASTER_STATUS.md` lines 96; `PRODUCT_SURFACE_AUDIT.md` line 19; commit `076cb12` | `/events/:slug` still missing — DEBT‑01 / EVT‑WO‑02 OPEN (`EXECUTION_STATE_AUDIT.md` lines 203–207) |
| Event details | `/events/:slug` with full detail + journey | EVT-WO-02 | OPEN | `PRODUCT_SURFACE_AUDIT.md` lines 231–233; `SOCELLE-WEB/docs/build_tracker.md` P1 section | Must be implemented; tracked as P1, not lost |

### 1.7 SEO

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| Baseline SEO sweep | Meta tags on core public pages | V2-PLAT-03 / SITE-WO-04 | PARTIAL | `SOCELLE-WEB/MASTER_STATUS.md` lines 77–80; `EXECUTION_STATE_AUDIT.md` Open Debt table lines 245–250 | SITE‑WO‑04 still OPEN for long tail; tracked, not lost |

### 1.8 Payments / Entitlements

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| Credit economy wiring | `tenant_balances`, deduct_credits, credit ledger, nav balance | PAY-WO-01..05, Credit Economy Hub WOs | DONE | `SOCELLE-WEB/docs/build_tracker.md` lines 34–35, 41–42; `docs/qa/verify_BUILD1-COMPLETE_*.json`; `SOCELLE_MASTER_BUILD_WO.md` V2‑INTEL‑05 / Credit Economy | P2‑STRIPE for Stripe price IDs (owner action) explicitly marked BLOCKED (`EXECUTION_STATE_AUDIT.md` lines 217–218) |
| Entitlement chain | Feature gating per tier and role | CTRL-WO-04, entitlements docs | DONE | `SOCELLE-WEB/docs/build_tracker.md` lines 36–39; `docs/qa/verify_CTRL-WO-04_2026-03-09T04-17-09Z.json`; `SOCELLE_ENTITLEMENTS_PACKAGING.md` §4–§7 | None (future SPLIT‑* WOs must respect this chain) |

### 1.9 Admin

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| Admin core hub (users, audit log, feature flags, platform settings) | ADMIN-WO-01..05 | DONE (per V2-HUBS-05) but UNVERIFIED in Build 2 table | `SOCELLE_MASTER_BUILD_WO.md` V2‑HUBS‑05; `SOCELLE-WEB/MASTER_STATUS.md` lines 48–49; `EXECUTION_STATE_AUDIT.md` lines 64–65 (ADMIN-WO-01..05 UNVERIFIED) | Needs explicit verification JSON; work tracked, not lost |
| Admin Intelligence Dashboard, Region Management, Reports Library | ADMIN-WO-03..05 | OPEN SHELLS | `PRODUCT_SURFACE_AUDIT.md` lines 78–80; `docs/ops/PRODUCT_SURFACE_AUDIT.md` §2c shell table | Mapped to ADMIN‑WO‑03/04/05; no missing WOs |

### 1.10 Education

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| Education Hub dashboard + CE Credits | EDU-WO-02/05 | DONE | `SOCELLE-WEB/docs/build_tracker.md` lines 4, 56–57; `docs/qa/verify_EDU-WO-02-05_2026-03-10T01-00-00-000Z.json` | None (CoursePlayer states now wired; further UX polish defined but not lost) |
| Education journeys + studio tie-in | EDU-WO-01/03/04/06..10 | UNVERIFIED/OPEN | `EXECUTION_STATE_AUDIT.md` lines 63–64; `PRODUCT_SURFACE_AUDIT.md` Journey 3 | Remaining WOs explicitly tracked; nothing orphaned |

### 1.11 CRM

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| CRM consent log + churn risk + intelligence tab | CRM-WO-07/08/09 | DONE | `SOCELLE-WEB/docs/build_tracker.md` lines 49–51; `docs/qa/verify_CRM-WO-07-09_2026-03-10T00-00-00-000Z.json` | None |
| Remaining CRM features (rebooking engine, etc.) | CRM-WO-01..06/10..12 | UNVERIFIED / OPEN | `EXECUTION_STATE_AUDIT.md` lines 59–64 | Tracked, not lost |

### 1.12 Commerce

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| Affiliate badges + procurement dashboard | COMMERCE-WO-03/07 | DONE | `SOCELLE-WEB/docs/build_tracker.md` lines 54–55; `docs/qa/verify_COMMERCE-WO-03-07_2026-03-10T01-00-00-000Z.json` | None |
| Remaining commerce flows / marketplace | COMMERCE-WO-01/02/04/05/06 | UNVERIFIED / OPEN | `EXECUTION_STATE_AUDIT.md` lines 62–63 | Tracked; plus DEBT‑02 & DEBT‑06 for `/plans` and TierGate → `/pricing` wiring |

### 1.13 Multi‑platform

| Area | Requirement | WO | Status | Evidence | Blockers |
|------|-------------|----|--------|----------|----------|
| PWA base | PWA-WO-01..03 | DONE | `SOCELLE-WEB/docs/build_tracker.md` lines 70–71; `docs/qa/verify_BUILD5_MULTI_PLATFORM_20260309T200000Z.json` | None |
| Tauri shell | TAURI-WO-01 | DONE | Same as above | Additional TAURI‑WO‑02/03 tasks for deeper integration remain but are explicitly tracked |
| Mobile parity | MOBILE-WO-01..08 | PARTIAL / OPEN | `SOCELLE-WEB/docs/build_tracker.md` line 69; `EXECUTION_STATE_AUDIT.md` lines 95–99; `SOCELLE_MONOREPO_MAP.md` lines 121–158 (mobile app tree) | Tracked via MOBILE‑WO; not lost |

---

## 2. Summary

Across CMS, Intelligence, Merchandising, Feeds, Search, Events, SEO, Payments/Entitlements, Admin, Education, CRM, Commerce, and Multi‑platform:

- **Every major requirement has a corresponding WO ID** in `SOCELLE_MASTER_BUILD_WO.md` and/or `SOCELLE-WEB/docs/build_tracker.md`.
- **Execution state is captured** in `docs/ops/EXECUTION_STATE_AUDIT.md` and per‑WO verification JSONs under `SOCELLE-WEB/docs/qa/`.
- Any gaps (PARTIAL / OPEN / BLOCKED) are **explicitly tracked** with IDs like `EVT-WO-02`, `DEBT-TANSTACK-REAL-6`, `P1-3`, `P2-1`, `MERCH-INTEL-03-FINAL`, `ROUTE-CLEANUP-WO`, `BRAND-SIGNAL-WO`, `P2-STRIPE`, etc.

There is **no evidence of truly “lost” WOs** (requirements present only in docs or code with no WO representation). The remaining work is about **executing the open WOs and aligning legacy planning docs**, not discovering missing ones.

