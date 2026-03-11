# SPLIT EXECUTION CONTRACT — NEXT 5 WOs

**Project:** SOCELLE GLOBAL — SOCELLE-WEB  
**Date:** 2026-03-13  
**Anchor commit:** d1442d3  
**Authority:** `/.claude/CLAUDE.md` §2–§4, §11; `SOCELLE_MASTER_BUILD_WO.md` §0–§3; `SOCELLE-WEB/docs/build_tracker.md` lines 92–115, 151–160; `SOCELLE-WEB/MASTER_STATUS.md` BUILD STATUS + hub tables; `docs/ops/EXECUTION_STATE_AUDIT.md` §§1–4; `SOCELLE-WEB/docs/ops/SPLIT_PLAN__PHASED_EXECUTION.md` §§2–3.

---

## 0. Required command outputs (for this contract)

See `SPLIT_AUDIT__TRUTH_VALIDATION.md` §0 for verbatim outputs of:

- `git status --porcelain=v1`  
- `git log -20 --oneline`  
- `ls -la` (repo root)  
- `find docs -maxdepth 3 -type f | sort`  
- `find .claude -maxdepth 3 -type f | sort`  
- Governance phrase search via `functions.Grep`.

Those outputs anchor this contract to a clean codebase state at HEAD `19e9ec7`.

---

## 1. Contract scope and rules

- This document **locks in** the **next 5 WOs** to be executed, one per session, **before any split‑packaging code**.  
- Each WO section specifies:
  - Dependencies (other WOs / gates that must be complete).  
  - Acceptance criteria.  
  - Proof pack requirements (tsc/build/verify JSON).  
  - Stop conditions (when to halt or escalate).
- **Default rule:** One WO per session, unless the owner explicitly approves parallelism for low‑risk docs‑only work.

Next 5 WOs (in order):

1. `CMS-WO-07` — story_drafts + feeds‑to‑drafts pipeline.  
2. `DEBT-TANSTACK-REAL-6` — remaining `useEffect + supabase` migrations.  
3. `P1-3` — Tailwind token + index.css cleanup.  
4. `P2-1` — unit test upgrade and failures.  
5. `EVT-WO-02` — `/events/:slug` event detail route and journey.

---

## 2. WO #1 — CMS-WO-07 (story_drafts + feeds-to-drafts)

- **WO ID:** `CMS-WO-07`  
- **Source:** `SOCELLE_MASTER_BUILD_WO.md` lines 153–158; `SOCELLE-WEB/docs/build_tracker.md` lines 151–158; `docs/ops/EXECUTION_STATE_AUDIT.md` lines 203–205.

### 2.1 Dependencies

- **MUST be complete:**
  - `WO-CMS-01..06` — CMS schema, hooks, admin UI, PageRenderer, Authoring Studio, hub CMS integration (verified in `SOCELLE_MASTER_BUILD_WO.md` lines 24–29, 36–42; `MASTER_STATUS.md` lines 36–41).
  - `CMS-SEED-01` — editorial rail seed (build_tracker P1 gate, `docs/qa/verify_CMS-SEED-01.json`).
- **MUST be stable:**
  - V2‑TECH freeze (`MASTER_STATUS.md` lines 15–19; `EXECUTION_STATE_AUDIT.md` lines 161–167).

### 2.2 Acceptance criteria

- `story_drafts` table:
  - Exists with schema and RLS matching `SOCELLE_MASTER_BUILD_WO.md` text for CMS‑WO‑07.  
  - Verified in `supabase/migrations/*story_drafts*` and `database.types.ts`.
- `AdminStoryDrafts` admin page:
  - Lists drafts with filters and sort.
  - Supports view detail and status transitions (draft → ready_for_review → approved → discarded).
- Feeds‑to‑drafts function:
  - Uses current merchandising rules (MERCH‑INTEL‑02/03) to select signals and create non‑published `story_drafts` rows.
  - No auto‑publish; drafts require explicit approval per CMS‑WO‑08.

### 2.3 Proof pack requirements

- **Commands:**
  - `npx tsc --noEmit` (zero errors).  
  - `npm run build` (Vite) (non‑zero exit → STOP).  
- **QA JSON:**
  - `SOCELLE-WEB/docs/qa/verify_CMS-WO-07_<timestamp>.json` with:
    - `"wo_id": "CMS-WO-07"`.  
    - Skills run: `schema-db-suite`, `authoring-core-schema-validator`, `hub-shell-detector`, `loading-skeleton-enforcer`.  
    - Per‑skill results: `PASS` with evidence (migrations, component paths, routes).

### 2.4 Stop conditions

- Any RLS or schema drift detected by `schema-db-suite` → STOP and escalate (Data Architect decision required).  
- If `build-gate` or `dev-best-practice-checker` fails due to new CMS code, **do not** mark CMS‑WO‑07 DONE; fix or roll back within the same WO.

---

## 3. WO #2 — DEBT-TANSTACK-REAL-6

- **WO ID:** `DEBT-TANSTACK-REAL-6`  
- **Source:** `SOCELLE-WEB/docs/build_tracker.md` lines 73, 146–147; `docs/ops/EXECUTION_STATE_AUDIT.md` lines 146–147, 243–244.

### 3.1 Dependencies

- TanStack Query v5 baseline complete (confirmed in `MASTER_STATUS.md` lines 20–21).  
- No active refactors in the 6 target views:
  - `BusinessRulesView`, `ReportsView`, `MappingView`, `PlanOutputView`, `ServiceIntelligenceView`, `MarketingCalendarView`.

### 3.2 Acceptance criteria

- **Code-level:**
  - Zero occurrences of `useEffect(` directly wrapping `supabase.from(` in `SOCELLE-WEB/src` (grep enforced).
  - All 6 views use TanStack Query hooks with:
    - `isLoading` → skeleton.  
    - `isError` → error + retry.  
    - `data` → typed results.
- **Behavioural:**
  - Existing user journeys through those views remain functional (no new shells).

### 3.3 Proof pack requirements

- **Commands:**
  - `npx tsc --noEmit`.  
  - `npm run build`.  
  - `npm run test` (regression sanity).
- **QA JSON:**
  - `SOCELLE-WEB/docs/qa/verify_DEBT-TANSTACK-REAL-6_<timestamp>.json`:
    - Lists the 6 files/paths refactored.
    - Includes results from `dev-best-practice-checker`, `hub-shell-detector`, `test-runner-suite`.

### 3.4 Stop conditions

- If any of the 6 pages regress from LIVE/PARTIAL to SHELL status (per shell detector) → STOP and back out within this WO.  
- If test failures are unrelated but blocking, they must be triaged and either fixed in‑scope or documented as P2 debt before marking WO DONE.

---

## 4. WO #3 — P1-3 (design token cleanup)

- **WO ID:** `P1-3`  
- **Source:** `SOCELLE-WEB/docs/build_tracker.md` lines 102–109; `docs/ops/EXECUTION_STATE_AUDIT.md` lines 247–250; `COMMAND_CENTER/strategy/design_parity_conflict_report.md` line 69.

### 4.1 Dependencies

- Ultra Drive token purge for `brand-*` and `intel-*` in components/layouts finished (confirmed in `build_tracker.md` lines 106–107 and `verify_UD-A-ALL_20260309T210000Z.json`).

### 4.2 Acceptance criteria

- `SOCELLE-WEB/tailwind.config.js`:
  - No `brand-*` or `intel-*` keys remain in token definitions.  
- `SOCELLE-WEB/src/index.css` (and any other global CSS):
  - No “Warm Cocoa / Premium Glass / Editorial Typography” or other non‑Pearl tokens flagged in `design_parity_conflict_report.md`.
- `token-drift-scanner`, `design-audit-suite`, and `design-lock-enforcer`:
  - All PASS with **zero** remaining violations across public and portal surfaces.

### 4.3 Proof pack requirements

- **Commands:**
  - `npx tsc --noEmit`.  
  - `npm run build`.  
- **QA JSON:**
  - `docs/qa/verify_P1-3_<timestamp>.json`:
    - Includes `token-drift-scanner` and `design-audit-suite` results.
    - Explicitly cites removal of the “Warm Cocoa” block (file + line ranges before/after).

### 4.4 Stop conditions

- Any new design‑system regression (e.g. fonts, core colors) reported by `design-audit-suite` → STOP and fix before marking P1‑3 DONE.  
- If portals regress to using non‑Pearl tokens, this WO must NOT be closed until parity is restored.

---

## 5. WO #4 — P2-1 (unit test upgrade + failures)

- **WO ID:** `P2-1`  
- **Source:** `SOCELLE-WEB/docs/build_tracker.md` lines 110–114; `docs/ops/EXECUTION_STATE_AUDIT.md` lines 217–218.

### 5.1 Dependencies

- Build and typecheck currently pass (`MASTER_STATUS.md` lines 15–20).  
- No ongoing test suite rewrites.

### 5.2 Acceptance criteria

- `SOCELLE-WEB/package.json`:
  - `@testing-library/react` updated to `^17.x`.  
- Test suite:
  - `npm run test` in SOCELLE‑WEB:
    - All previously tracked 29 failing tests are fixed or explicitly reclassified with rationale.
    - Target: **0 failing tests**; any exceptions must be documented and approved.

### 5.3 Proof pack requirements

- **Commands:**
  - `npx tsc --noEmit`.  
  - `npm run build`.  
  - `npm run test` (captured output).
- **QA JSON:**
  - `docs/qa/verify_P2-1_<timestamp>.json`:
    - Includes full `npm run test` summary (passes/failures).  
    - Lists any remaining skipped tests with reasons and linked WOs (if any).

### 5.4 Stop conditions

- If test fixes uncover real product bugs, those must:
  - Either be fixed in‑scope, or  
  - Be logged as new WOs in `build_tracker.md` before P2‑1 is marked DONE.

---

## 6. WO #5 — EVT-WO-02 (events detail route and journey)

- **WO ID:** `EVT-WO-02`  
- **Source:** `SOCELLE_MASTER_BUILD_WO.md` (Phase 7 events section); `docs/ops/EXECUTION_STATE_AUDIT.md` lines 83–88, 231–233; `docs/ops/PRODUCT_SURFACE_AUDIT.md` lines 19, 231–233.

### 6.1 Dependencies

- `EVT-WO-01` partial implementation in place:
  - `/events` index wired to `events` table with LIVE/DEMO badges and states (`MASTER_STATUS.md` line 96; `PRODUCT_SURFACE_AUDIT.md` line 19; commit `076cb12`).

### 6.2 Acceptance criteria

- New `/events/:slug` route:
  - Exists and is linked from every event card on `/events`.  
  - Loads data from `events` table by slug/id with:
    - Loading skeleton.  
    - Error + retry.  
    - Not‑found handling.
- Journey:
  - `PRODUCT_SURFACE_AUDIT.md` updates Journey for Events to **COMPLETE** (no dead end).  
  - DEBT‑01 removed or marked RESOLVED with evidence.

### 6.3 Proof pack requirements

- **Commands:**
  - `npx tsc --noEmit`.  
  - `npm run build`.  
- **QA JSON:**
  - `docs/qa/verify_EVT-WO-02_<timestamp>.json`:
    - `hub-shell-detector` report (no new shells on events surfaces).  
    - `seo-audit` output for `/events` + `/events/:slug`.  
    - Playwright E2E snippet showing `/events` → `/events/:slug` path passes.

### 6.4 Stop conditions

- If any existing events behaviour regresses (e.g. calendar listing breaks) → STOP and fix before closing the WO.  
- If SEO audit reveals new critical regressions, they must either be fixed in‑scope or logged as SITE‑WO‑* before EVT‑WO‑02 is marked DONE.

---

## 7. Parallelism rules

- **Default:** Only one of these WOs may be considered “IN‑SESSION ACTIVE” at a time.  
- **Exception:** The owner may explicitly approve **parallel docs‑only work** (e.g., governance patches) that:
  - Do not touch `src/`, `supabase/`, or config files, and  
  - Do not risk conflicting edits to `build_tracker.md`.

Any deviation from this contract must:

- Be recorded as a new entry at the top of `SOCELLE-WEB/docs/build_tracker.md` with rationale, and  
- Be reflected in an updated version of this `SPLIT_EXECUTION_CONTRACT.md`.

