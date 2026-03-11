# SPLIT PLAN — PHASED EXECUTION (NEXT 10 SESSIONS)

**Project:** SOCELLE GLOBAL — SOCELLE-WEB  
**Date:** 2026-03-13  
**Anchor commit:** d1442d3  
**Authority:** `/.claude/CLAUDE.md` §2–§4, §11; `SOCELLE_MASTER_BUILD_WO.md` §0–§3; `SOCELLE-WEB/docs/build_tracker.md` lines 92–115; `SOCELLE-WEB/MASTER_STATUS.md` PUBLIC/PORTAL/ADMIN tables; `docs/ops/EXECUTION_STATE_AUDIT.md` §§1–4; `docs/ops/PRODUCT_SURFACE_AUDIT.md` §§1–7; `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` §4–§7; `docs/command/MODULE_BOUNDARIES.md` §9–§23.

---

## 0. Split definition (mode)

Per `MODULE_BOUNDARIES.md` lines 214–221 and `SOCELLE_MONOREPO_MAP.md` lines 69–121, the **current and intended split model** is:

- **B) Multi-app repo packaging (separate entrypoints/apps, shared packages and schema)**:
  - Web: React + Vite app (`SOCELLE-WEB/`) is the **source implementation** for hubs.
  - Desktop: Tauri wraps the same React+Vite build (no new business logic).
  - Mobile: Flutter app (`SOCELLE-MOBILE-main`) uses **shared Supabase schema and contracts**, not TypeScript FFI.
  - Shared modules: `packages/supabase-config`, `packages/ui`, and root `supabase/` are common across apps.

There is **no Tier‑0/1 evidence** for full deployment isolation per hub (C), and the codebase is already structured as a **multi‑app monorepo with shared core**, matching (B).

---

## 1. Planning constraints

- **No code changes** in this plan — it defines WO ordering and acceptance criteria; code will be written in future sessions under those WOs.
- **One WO per session** (per `/.claude/CLAUDE.md` §11): each session below is scoped to a single WO or debt item.
- **All WOs already exist** in `SOCELLE_MASTER_BUILD_WO.md` and/or `build_tracker.md`, or are added here in `SPLIT_WO_CLUSTER.md` with explicit justification.

---

## 2. Next 10 sessions (WO-level plan)

### Session 1 — CMS-WO-07 (story_drafts + feeds-to-drafts)

- **WO ID:** `CMS-WO-07` (already present in `SOCELLE-WEB/docs/build_tracker.md` lines 151–158 and `WO_MASTER_PLATFORM_UPGRADE.md`).  
- **Goal:** Complete story_drafts ingestion pipeline so CMS can power editorial rails without code changes.
- **Scope (docs + future code):**
  - Confirm `story_drafts` table migration (commit `e0a2c40`) matches `SOCELLE_MASTER_BUILD_WO.md` expectations.
  - Finalize `AdminStoryDrafts` page wiring (list, detail, status changes).
  - Wire feeds‑to‑drafts function to use latest feed/merch rules.
- **Acceptance criteria:**
  - `npx tsc --noEmit` and `npm run build` exit 0.
  - New/updated E2E tests for admin story drafts (per `JOURNEY_STANDARDS.md`).
  - QA artifact: `SOCELLE-WEB/docs/qa/verify_CMS-WO-07_<timestamp>.json` created with:
    - `overall: "PASS"`,
    - Evidence pointing to `AdminStoryDrafts.tsx` and `supabase/migrations/*story_drafts*`.
  - `build_tracker.md` top lines updated to reflect CMS-WO‑07 DONE.

### Session 2 — DEBT-TANSTACK-REAL-6 (remaining useEffect+supabase)

- **WO ID:** `DEBT-TANSTACK-REAL-6` (`SOCELLE-WEB/docs/build_tracker.md` lines 73, 146–147).  
- **Goal:** Eliminate the last 6 raw `useEffect + supabase.from()` violations in:
  - `BusinessRulesView`, `ReportsView`, `MappingView`, `PlanOutputView`, `ServiceIntelligenceView`, `MarketingCalendarView`.
- **Acceptance criteria:**
  - No remaining `useEffect` + `supabase.from(` pairs in `SOCELLE-WEB/src` (grep check).
  - All 6 components use TanStack Query hooks conforming to `dev-best-practice-checker` expectations.
  - `npx tsc --noEmit` and `npm run build` exit 0.
  - QA artifact: `docs/qa/verify_DEBT-TANSTACK-REAL-6_<timestamp>.json` with `overall: "PASS"`.
  - `EXECUTION_STATE_AUDIT.md` Open Debt table updated to mark DEBT‑TANSTACK‑REAL‑6 as resolved in a future session.

### Session 3 — P1-3 (design token cleanup: tailwind config + index.css)

- **WO ID:** `P1-3` (`SOCELLE-WEB/docs/build_tracker.md` lines 102–109, `EXECUTION_STATE_AUDIT.md` line 247).  
- **Goal:** Remove remaining `brand-*` and `intel-*` Tailwind tokens from `tailwind.config.js` and any lingering non‑Pearl tokens in `index.css`.
- **Acceptance criteria:**
  - `SOCELLE-WEB/tailwind.config.js` contains **no** `brand-*` / `intel-*` token definitions (search).
  - No “Warm Cocoa” / non‑Pearl color tokens per `design_parity_conflict_report.md` (line 69).
  - `token-drift-scanner`, `design-audit-suite`, and `design-lock-enforcer` skills all **PASS** with QA artifact `docs/qa/verify_P1-3_<timestamp>.json`.
  - `npx tsc --noEmit` and `npm run build` exit 0.

### Session 4 — P2-1 (unit test upgrade and failures)

- **WO ID:** `P2-1` (`SOCELLE-WEB/docs/build_tracker.md` lines 110–114; `EXECUTION_STATE_AUDIT.md` lines 217, 247).  
- **Goal:** Upgrade `@testing-library/react` to `^17.x` and resolve remaining 29 failing unit tests.
- **Acceptance criteria:**
  - `package.json` in `SOCELLE-WEB` updated to `@testing-library/react@^17`.
  - `npm run test` in SOCELLE‑WEB shows **≥192 tests, 0 failures** (or updated agreed baseline with explicit note).
  - QA artifact: `docs/qa/verify_P2-1_<timestamp>.json` with test command output embedded.
  - `npx tsc --noEmit` and `npm run build` still PASS.

### Session 5 — EVT-WO-02 (events detail route, journey fix)

- **WO ID:** `EVT-WO-02` (Phase 7 events WOs in `SOCELLE_MASTER_BUILD_WO.md` Phase 7 table; referenced in `EXECUTION_STATE_AUDIT.md` lines 203–207 and `PRODUCT_SURFACE_AUDIT.md` DEBT‑01).  
- **Goal:** Add `/events/:slug` route and page with full event detail, eliminating DEBT‑01.
- **Acceptance criteria:**
  - `/events/:slug` route defined and rendered from live `events` table (per `MASTER_STATUS` events row, lines 96–98).
  - Journey 3 in `PRODUCT_SURFACE_AUDIT.md` updated to COMPLETE for events.
  - E2E test covers `/events` → `/events/:slug` path.
  - `hub-shell-detector` and `live-demo-detector` skills PASS (QA JSON).
  - `npx tsc --noEmit` and `npm run build` exit 0.

### Session 6 — ROUTE-CLEANUP-WO (orphan/duplicate routes)

- **WO ID:** `ROUTE-CLEANUP-WO` (P1 queue in `EXECUTION_STATE_AUDIT.md` lines 207, 233–235; referenced in `PRODUCT_SURFACE_AUDIT.md` DEBT‑03/03b).  
- **Goal:** Resolve route orphans and duplicates:
  - `/home`, `/for-medspas`, `/for-salons`, `/pricing` vs `/plans`, `/portal/marketing` vs `/portal/marketing-hub/*`.
- **Acceptance criteria:**
  - No orphan routes (every user‑facing path is reachable from canonical nav or has a redirect).
  - No duplicate marketing routes; a single canonical marketing hub path.
  - `route-mapper` skill PASS with updated `SOCELLE-WEB/docs/qa/route_map.json`.
  - `PRODUCT_SURFACE_AUDIT.md` DEBT‑03/03b updated to RESOLVED in a future session.
  - `npx tsc --noEmit`, `npm run build` exit 0.

### Session 7 — BRAND-SIGNAL-WO (Brand→Signal→Campaign arc)

- **WO ID:** `BRAND-SIGNAL-WO` (referenced in `EXECUTION_STATE_AUDIT.md` lines 208, 241 and `PRODUCT_SURFACE_AUDIT.md` Journey 8 + DEBT‑04).  
- **Goal:** Implement the Brand→Signal→Campaign journey:
  - From `/brand/intelligence` and signal cards → marketing hub → campaign creation.
- **Acceptance criteria:**
  - At least one “Create campaign from signal” CTA wired from Brand Intelligence surfaces to Marketing hub.
  - E2E test for Journey 8 in `PRODUCT_SURFACE_AUDIT.md` updated to COMPLETE.
  - `hub-shell-detector`, `live-demo-detector`, and `entitlement-validator` PASS for involved pages.
  - `npx tsc --noEmit`, `npm run build` exit 0.

### Session 8 — MERCH-INTEL-03-FINAL (remaining merch rules)

- **WO ID:** `MERCH-INTEL-03-FINAL` (Open in `EXECUTION_STATE_AUDIT.md` lines 151, 254).  
- **Goal:** Complete MERCH‑01/06/10: openfda permalink, RSS run for paid tier signals, 30‑day archive cron.
- **Acceptance criteria:**
  - All three rules implemented and verified in DB + pipeline:
    - Source URL field populated and stable.
    - RSS pipeline run for paid‑tier signals confirmed (≥N paid signals).
    - Archive cron ensures 30‑day retention policy.
  - Updated QA artifact: `docs/qa/verify_MERCH-INTEL-03_final_<timestamp>.json` with `overall: "PASS"`.
  - `npx tsc --noEmit`, `npm run build` exit 0.

### Session 9 — SPLIT-INTEL-01 (logical + packaging prep for Intelligence app)

- **WO ID:** `SPLIT-INTEL-01` (defined in `SOCELLE-WEB/docs/command/SPLIT_WO_CLUSTER.md`).  
- **Goal:** Prepare Intelligence Hub for multi‑app packaging, without changing deployment topology yet:
  - Consolidate Intelligence surfaces (public + portal + brand + admin) behind a clear module boundary.
  - Ensure all intelligence access consistently uses entitlement and credit checks.
- **Acceptance criteria:**
  - Boundary review (docs‑only in this session): updated `SPLIT_WO_CLUSTER.md` and `MODULE_BOUNDARIES.md` cross‑check:
    - All Intelligence routes and components are listed under the `SPLIT-INTEL-01` scope section.
  - `route-mapper` report updated to show a clean Intelligence route grouping.
  - No change to runtime yet; this session is **planning + documentation only**.

### Session 10 — SPLIT-CRM-01 (logical + packaging prep for CRM app)

- **WO ID:** `SPLIT-CRM-01` (defined in `SOCELLE-WEB/docs/command/SPLIT_WO_CLUSTER.md`).  
- **Goal:** Same pattern as `SPLIT-INTEL-01`, but for CRM:
  - Define precise CRM module boundary (pages/hook paths/tables).
  - Document how CRM will remain entitlement‑gated and shared across platforms.
- **Acceptance criteria:**
  - CRM routes (`/portal/crm*`, related shared components) and tables (`crm_*`) enumerated under `SPLIT-CRM-01` in `SPLIT_WO_CLUSTER.md`.
  - `SOCELLE_MONOREPO_MAP.md` and `MODULE_BOUNDARIES.md` cross‑checked to ensure CRM is clearly in scope under SOCELLE‑WEB and future mobile/desktop clients.
  - No code changes; documentation‑complete boundary and plan ready for later implementation sessions.

---

## 3. Blocked items and owner actions

- **P2-STRIPE (Stripe price IDs)**  
  - **WO ID:** `P2-STRIPE` (`EXECUTION_STATE_AUDIT.md` lines 217–218).  
  - **Blocker:** Owner must configure `stripe_price_id` values in Stripe dashboard for plans/products.  
  - **Impact:** Blocks PAY‑UPGRADE flows (`/plans`, TierGate CTAs) from becoming fully LIVE; tracked as P2, not lost.

- **Higher‑phase WOs (BUILD 4/5)**  
  - INGR‑WO, JOBS‑WO, RESELL‑WO, SITE‑WO, STUDIO‑UI‑06..18, MOBILE‑WO‑01..08 remain OPEN per `EXECUTION_STATE_AUDIT.md` lines 81–99.  
  - These are **not immediately blocking split prep**, but must follow the same acceptance pattern:
    - `tsc`/`build` PASS, QA JSON, route + entitlement checks.

---

## 4. Summary

- The **next 10 sessions** above:
  - Clear the last high‑leverage correctness and journey debts (CMS‑WO‑07, DEBT‑TANSTACK‑REAL‑6, P1‑3, P2‑1, EVT‑WO‑02, ROUTE‑CLEANUP‑WO, BRAND‑SIGNAL‑WO, MERCH‑INTEL‑03‑FINAL).
  - Begin **doc‑first split prep** via `SPLIT-INTEL-01` and `SPLIT-CRM-01` without prematurely changing deployment topology.
- All sessions are **WO‑backed**, with explicit acceptance criteria, proof requirements, and dependencies, and align with the chosen split definition **B) multi‑app repo packaging with shared core**.

