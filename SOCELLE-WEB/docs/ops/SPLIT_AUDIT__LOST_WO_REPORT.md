# SPLIT AUDIT — LOST WO / LOST REQUIREMENT REPORT

**Project:** SOCELLE GLOBAL — SOCELLE-WEB  
**Date:** 2026-03-13  
**Anchor commit:** d1442d3 (docs/ops IDEA_MINING_IMPLEMENTATION_MAP)  
**HEAD:** 19e9ec7 (`chore(audit): AUDIT-SPRINT-01 — source-of-truth map, doc inventory, execution state, product surface, session start entrypoint`)  
**Authority:** `/.claude/CLAUDE.md` §0, §2–§4; `SOCELLE-WEB/docs/build_tracker.md` lines 1–120; `SOCELLE-WEB/MASTER_STATUS.md` lines 11–75; `SOCELLE_MASTER_BUILD_WO.md` lines 15–132; `docs/ops/EXECUTION_STATE_AUDIT.md` §1–§4; `docs/ops/PRODUCT_SURFACE_AUDIT.md` §1–§7; `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` §1–§7; `docs/command/SOCELLE_MONOREPO_MAP.md` §1–§3; `docs/command/MODULE_BOUNDARIES.md` §9–§23.

---

## 0. Required command outputs (evidence)

All commands run from repo root: `/Users/brucetyndall/Documents/GitHub/SOCELLE GLOBAL`.

### 0.1 `git status --porcelain=v1`

```text
 M .claude/CLAUDE.md
 M docs/command/SESSION_START.md
 M docs/command/SOURCE_OF_TRUTH_MAP.md
 M docs/ops/AUDIT_SPRINT_SUMMARY.md
 M docs/ops/EXECUTION_STATE_AUDIT.md
```

### 0.2 `git log -30 --oneline`

```text
19e9ec7 chore(audit): AUDIT-SPRINT-01 — source-of-truth map, doc inventory, execution state, product surface, session start entrypoint
d1442d3 docs(idea-mining): IDEA_MINING_IMPLEMENTATION_MAP.md + 8 screenshot proof pack
c152f52 docs(ops): RUN_LOG_2026-03-13 — dirty worktree triage log appended
e0a2c40 CMS-WO-07 prep: AdminStoryDrafts page + feeds-to-drafts fn + story_drafts migration + config.toml
7974e91 docs(audit): site-wide audit outputs — 9 markdown reports from parallel agent session
1a292f9 MERCH-INTEL-03 + docs: final QA verify + command docs
63e0799 COVERAGE-EXPANSION-01: domain column migration + candidate feeds + QA verify
460d347 FOUND-WO-04: shell detector report + LANE-D QA + governance verify artifacts
5d750a1 NEWSAPI-INGEST-01: rss-to-signals v11 + Atom parser + signal_type enum migration
d10388d MERCH-INTEL-IMAGE-CLICKS: signal cards clickable + images wired + detail route
2a7acb3 MERCH-INTEL-02: AdminFeedsHub display_order sort + migrations + QA artifacts
82058cd LANE-A-EDU-01: CoursePlayer completion CTA — View Certificate when overallProgress=100
40d652d LANE-C / TIER-BYPASS-FIX: replace raw supabase.from with useIntelligence()
b9132a8 LANE-B-fixes: DEMO badges on BrandAIAdvisor + BrandIntelligenceHub + IntelligencePricing
01cc55c FOUND-WO-08 + .gitignore: banned-terms sweep committed + worktrees ignored
6f71a72 INTEL-UI-REMEDIATION-01: proof pack + tracker DONE — verify + DELTA + build_tracker
2e8b94a INTEL-UI-REMEDIATION-01: Intelligence.tsx — wire server-side category filter + spotlightTrends 3→5
6b330e4 INTEL-UI-REMEDIATION-01: IntelligenceFeedSection — lift filter state to props + export FEED_FILTERS
09e7161 INTEL-UI-REMEDIATION-01: useIntelligence — add signalTypes server-side DB filter
342f263 INTEL-UI-REMEDIATION-01: useSignalImage — deterministic ID-hash image pool variation
a35d86d docs(ops): create RUN_LOG_2026-03-13 — session log + API key wiring verification
1aa8a03 docs(ops): CHANGE_MANIFEST_2026-03-13 + build_tracker SHA/scope reconciliation
195dca3 docs(planning): document acceptable WARNs in OPERATION_BREAKOUT + harden tomorrow brief
5ce6336 docs(planning): IDEA-MINING-01 tracker update + GUARDRAIL-01 clearance + tomorrow brief
951fd5a docs(research): IDEA-MINING-01 — pattern library from 10 comparable intelligence platforms
1722d1f MERCH-REMEDIATION-01: COMPLETE — verify_INTEL_MERCH.json 7 FAIL → 0 FAIL (PASS)
fc4b6cc MERCH-REMEDIATION-01: Step A pass 2 — extended off-topic archive across all topics
94875a2 MERCH-REMEDIATION-01: Steps B+C+D — provenance ORDER BY, freshness decay, timeline filter
690ea8d MERCH-REMEDIATION-01: Step B — add provenance_tier to IntelligenceSignal type
36e323a MERCH-REMEDIATION-01: Step A+B — archive 39 off-topic signals + add provenance_tier column
```

### 0.3 `ls -la` (repo root)

```text
total 904
drwxr-xr-x@  29 brucetyndall  staff     928 Mar 10 13:19 .
drwxr-xr-x@  12 brucetyndall  staff     384 Mar  9 19:51 ..
-rw-r--r--@   1 brucetyndall  staff   20484 Mar  9 16:54 .DS_Store
drwxr-xr-x@   4 brucetyndall  staff     128 Mar  6 13:18 .agents
drwxr-xr-x    8 brucetyndall  staff     256 Mar  8 21:02 .archive
drwxr-xr-x@   8 brucetyndall  staff     256 Mar 10 13:58 .claude
drwxr-xr-x@  16 brucetyndall  staff     512 Mar 10 14:14 .git
drwxr-xr-x@   3 brucetyndall  staff      96 Mar  6 00:45 .github
-rw-r--r--@   1 brucetyndall  staff     219 Mar 10 13:19 .gitignore
-rw-r--r--@   1 brucetyndall  staff      22 Mar  6 16:20 .npmrc
drwxr-xr-x    7 brucetyndall  staff     224 Mar  9 16:51 COMMAND_CENTER
-rw-r--r--@   1 brucetyndall  staff    2617 Mar  6 00:45 README.md
drwxrwxr-x@  23 brucetyndall  staff     736 Mar  7 02:22 SOCELLE-MOBILE-main
drwxr-xr-x@  42 brucetyndall  staff    1344 Mar  9 16:50 SOCELLE-WEB
-rw-r--r--    1 brucetyndall  staff   29356 Mar  8 00:48 SOCELLE_AI_FOR_BRANDS.html
-rw-r--r--@   1 brucetyndall  staff   20154 Mar  8 00:44 SOCELLE_AI_FOR_PROS.html
-rw-------@   1 brucetyndall  staff   40824 Mar  9 15:33 SOCELLE_MASTER_BUILD_WO.md
-rw-r--r--    1 brucetyndall  staff   16279 Mar  8 18:37 ULTRA_DRIVE_PROMPT.md
drwxr-xr-x@   6 brucetyndall  staff     192 Mar  6 00:45 apps
drwxr-xr-x@  12 brucetyndall  staff     384 Mar 10 13:53 docs
drwxr-xr-x@  10 brucetyndall  staff     320 Mar  7 17:17 figma-make-source
drwxr-xr-x@ 364 brucetyndall  staff   11648 Mar  8 23:10 node_modules
-rw-r--r--@   1 brucetyndall  staff  301160 Mar  8 22:46 package-lock.json
-rw-r--r--@   1 brucetyndall  staff     848 Mar  9 10:54 package.json
drwxr-xr-x@   4 brucetyndall  staff     128 Mar  5 20:23 packages
drwxr-xr-x@  11 brucetyndall  staff     352 Mar  6 11:04 supabase
drwxr-xr-x@   4 brucetyndall  staff     128 Mar  9 13:29 tools
-rw-r--r--@   1 brucetyndall  staff     866 Mar  5 20:22 turbo.json
-rw-r--r--@   1 brucetyndall  staff     313 Mar  7 17:33 wrangler.toml
```

### 0.4 `find SOCELLE-WEB/docs -maxdepth 3 -type f | sort`

```text
SOCELLE-WEB/docs/.DS_Store
SOCELLE-WEB/docs/ASSET_MANIFEST.md
SOCELLE-WEB/docs/audit/API_GAPS_AND_WIRING_PLAN.md
SOCELLE-WEB/docs/audit/API_LOGIC_MAP.md
SOCELLE-WEB/docs/audit/API_RUNTIME_INVENTORY.md
SOCELLE-WEB/docs/audit/COPY_AND_LAUNCH_COMMS.md
SOCELLE-WEB/docs/audit/INTELLIGENCE_HUB_AUDIT.md
SOCELLE-WEB/docs/audit/INTELLIGENCE_MERCHANDISING_REPORT.md
SOCELLE-WEB/docs/audit/SHELLS_AND_STATES.md
SOCELLE-WEB/docs/audit/SITEMAP_AND_JOURNEYS.md
SOCELLE-WEB/docs/audit/SOCELLE_MASTER_ACTION_PLAN.md
SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md
SOCELLE-WEB/docs/audit/SYSTEM_OVERVIEW.md
SOCELLE-WEB/docs/build_tracker.md
SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md
SOCELLE-WEB/docs/command/CMS_CONTENT_MODEL.md
SOCELLE-WEB/docs/command/INTEL-MERCH-01.md
SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md
SOCELLE-WEB/docs/command/SOCELLE_API_UPDATE_PACK.md
SOCELLE-WEB/docs/command/V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md
SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md
SOCELLE-WEB/docs/inventory/SOCELLE_GLOBAL_INVENTORY_REPORT.md
SOCELLE-WEB/docs/operations/APP_FEATURE_FUNCTIONALITY_GUIDE.md
SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md
SOCELLE-WEB/docs/operations/SESSION_PROMPTS.md
SOCELLE-WEB/docs/operations/WO_MASTER_PLATFORM_UPGRADE.md
SOCELLE-WEB/docs/ops/CHANGE_MANIFEST_2026-03-13.md
SOCELLE-WEB/docs/ops/DELTA_INTEL-UI-REMEDIATION-01.md
SOCELLE-WEB/docs/ops/IDEA_MINING_IMPLEMENTATION_MAP.md
SOCELLE-WEB/docs/ops/RUN_LOG_2026-03-13.md
SOCELLE-WEB/docs/ops/TOMORROW_EXECUTION_BRIEF.md
SOCELLE-WEB/docs/ops/capture_screens.mjs
SOCELLE-WEB/docs/qa/DOC_GATE_QA_WO-OVERHAUL-09.md
SOCELLE-WEB/docs/qa/MASTER_COMPLETION_REPORT_WAVE_OVERHAUL.md
SOCELLE-WEB/docs/qa/api_runtime_inventory.json
… (see full listing in command output above)
```

### 0.5 `find .claude -maxdepth 3 -type f | sort`

```text
.claude/CLAUDE.md
.claude/commands/audit-all.md
.claude/commands/check.md
.claude/commands/cms-status.md
.claude/commands/shell-check.md
.claude/launch.json
.claude/settings.local.json
.claude/skills/accessibility-checker/SKILL.md
.claude/skills/affiliate-link-checker/SKILL.md
… (see full listing in command output above)
```

### 0.6 Governance phrase search (rg equivalent)

Search term:  
`"WO-|WORK ORDER|Authority|Source of Truth|MASTER_STATUS|build_tracker|SPLIT-|MODULE_BOUNDARIES|MONOREPO_MAP|ENTITLEMENTS"`  
Scope: `SOCELLE-WEB/docs`, `.claude`, `*.md`.

Tool: `functions.Grep` wrapper (rg-equivalent).  
Key hits:

- `docs/command/SOURCE_OF_TRUTH_MAP.md` lines 21–29, 175–201 — Tier 1 authorities (build_tracker, MASTER_STATUS, SOCELLE_MONOREPO_MAP, MODULE_BOUNDARIES, SOCELLE_ENTITLEMENTS_PACKAGING) and conflict-resolution rules.
- `SOCELLE-WEB/docs/command/CMS_CONTENT_MODEL.md` lines 4–5 — Authority chain referencing `MODULE_BOUNDARIES.md`.
- `SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md` lines 4–5 — Authority chain including `MODULE_BOUNDARIES.md`.
- `.agents/workflows/*` and `AGENT_SCOPE_REGISTRY.md` — repeated enforcement that **WO IDs must exist in `SOCELLE-WEB/docs/build_tracker.md`**.
- `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md` lines 1–4 — marks listed WOs as **PROPOSED** and states `build_tracker.md` is sole authority.
- `docs/operations/API_LOGIC_MAP.md` §6 — defines many `API-WO-*` work orders and proof pack expectations, some of which have since been executed under different, more recent WO IDs (FEED‑WO‑0x, PAY‑WO‑0x, MERCH‑INTEL‑0x, etc.).

---

## 1. Definition of “lost” and method

**Definition (per prompt):**

- A requirement, spec, or dependency is **“lost”** if:
  - It exists in docs or code, **and**
  - It is **not represented** as a WO in `SOCELLE-WEB/docs/build_tracker.md` or `SOCELLE_MASTER_BUILD_WO.md`, **or**
  - It has a WO entry but **no traceable evidence** (no commits / no QA artifacts / no file-level link).

**Method:**

1. **Authority chain confirmed**
   - Tier 0/1 confirmed from `/.claude/CLAUDE.md` (§0), `docs/ops/SOURCE_OF_TRUTH_MAP.md` (§1–§5):
     - `/.claude/CLAUDE.md` (Tier 0)
     - `SOCELLE-WEB/docs/build_tracker.md`, `SOCELLE-WEB/MASTER_STATUS.md`, `SOCELLE_MASTER_BUILD_WO.md`, `V3_BUILD_PLAN.md`, `SOCELLE_ENTITLEMENTS_PACKAGING.md` (Tier 1)
2. **Catalogue requirements**
   - Master requirements from:
     - `SOCELLE_MASTER_BUILD_WO.md` (phases, hubs, platform features, multi-platform).
     - `SOCELLE_ENTITLEMENTS_PACKAGING.md` (hub unlock map and entitlement rules).
     - `SOCELLE_MONOREPO_MAP.md` + `MODULE_BOUNDARIES.md` (hub/app/module placement).
     - `JOURNEY_STANDARDS.md` + `PRODUCT_SURFACE_AUDIT.md` (journeys, LIVE/DEMO/shells).
     - `IDEA_MINING_IMPLEMENTATION_MAP.md` (top 10 patterns).
3. **Trace to WOs**
   - For each requirement, check:
     - WO presence in `SOCELLE_MASTER_BUILD_WO.md` and `SOCELLE-WEB/docs/build_tracker.md`.
     - Execution + proof links in `docs/ops/EXECUTION_STATE_AUDIT.md` and `SOCELLE-WEB/docs/qa/verify_*.json`.
4. **Flag candidates**
   - Anything in specs (esp. legacy V1 docs / SOCELLE-WEB/docs/platform/* / WORK_ORDER_BACKLOG) with:
     - No corresponding WO in `build_tracker` or master WO doc, **and**
     - No more recent doc showing it as superseded or intentionally deferred,
   - is marked **“potentially lost”** below.

---

## 2. “Potentially lost” list

> These are **not proven lost**, but require owner confirmation before being archived or explicitly deferred. Each item includes: requirement → source path → current WO mapping (if any) → why it might be lost.

### 2.1 API-WO-* series (legacy API_LOGIC_MAP plan)

- **Requirement:** API work orders `API-WO-01`..`API-WO-15` for ai‑orchestrator, feed pipeline, checkout, platform health, etc.  
- **Source:** `docs/operations/API_LOGIC_MAP.md` lines 681–795.  
- **Current WO mapping:**
  - Many of these requirements have been realized under **different WO IDs**, e.g.:
    - `API-WO-01` (OPENAI + service role keys) → covered by `API-DEPLOY-01` (`SOCELLE-WEB/docs/build_tracker.md` lines 24, 104; `docs/qa/verify_API-DEPLOY-01_2026-03-09T23-00-00-000Z.json`).
    - `API-WO-05/06/07` (feed pipeline + dedup + DLQ) → `FEED-WO-01..05` (`build_tracker.md` lines 28–32).
    - `API-WO-08/09/10` (checkout, Stripe, credit balance) → `PAY-WO-01..05` (`build_tracker.md` lines 34–35).
  - The **API-WO-* IDs themselves** do **not** appear in `SOCELLE-WEB/docs/build_tracker.md`.
- **Why potentially lost:**  
  - The **IDs** `API-WO-*` are effectively deprecated in favour of current BUILD‑0/1 WOs, but there is no explicit note in `API_LOGIC_MAP.md` saying “superseded by FEED‑WO‑0x / PAY‑WO‑0x / API-DEPLOY-01”.
- **Proposed WO mapping / resolution:**
  - Treat the `API-WO-*` series as **legacy planning IDs**, not active WOs.
  - Add a short note to `docs/operations/API_LOGIC_MAP.md` stating:
    - “API-WO-* series has been executed and superseded by CTRL-WO-0x, FEED-WO-0x, PAY-WO-0x, INTEL-MEDSPA-01, API-DEPLOY-01; see `SOCELLE_MASTER_BUILD_WO.md` and `build_tracker.md` for current IDs.”
  - No new WOs required — this is a documentation‑alignment task (can be folded into a future `DOC-GOV-01` WO).

### 2.2 WORK_ORDER_BACKLOG items (COPY-WO-01, SHELL-WO-01, INTEL-WO-12, etc.)

- **Requirement:** A list of proposed WOs (COPY-WO-01, SHELL-WO-01, INTEL-WO-12, FUNNEL-WO-01, FEED-WO-06, PAY-WO-06, BRAND-WO-06, SCHEMA-WO-01, FOUND-WO-04-EXT).  
- **Source:** `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md` lines 1–4, 8–334.  
- **Current WO mapping:**
  - Header explicitly states (lines 1–4) that:
    - “Status: PROPOSED — All WO IDs must be added to build_tracker.md before execution begins”
    - “Authority: build_tracker.md is the sole execution authority for WO IDs”.
  - Many of the underlying *requirements* are now implemented via other WOs:
    - Shell remediation → `FOUND-WO-04`, `LANE-*` debts and `FOUND-WO-04-EXT` equivalents.
    - Copy and SEO items → `FOUND-WO-08`, `SITE-WO-*`, banned‑terms WOs.
  - The *IDs* `COPY-WO-01`, `SHELL-WO-01`, etc., never entered `build_tracker.md`.
- **Why potentially lost:**  
  - It is possible that **some edge requirements in these backlog entries** are not fully covered by newer WOs. Without item‑by‑item reconciliation, they remain “maybe covered, maybe not”.
- **Proposed WO mapping / resolution:**
  - Create a **single documentation WO** (e.g. `DOC-GOV-01`) to:
    - Reconcile each backlog requirement against `build_tracker.md` and `EXECUTION_STATE_AUDIT.md`.
    - Explicitly mark any remaining gaps as:
      - New WOs in `build_tracker.md`, **or**
      - “Deferred / Won’t do in V3” with citation to owner decision.
    - Then demote `SOCELLE_WORK_ORDER_BACKLOG.md` to “historical planning” with a header banner.

### 2.3 Design parity conflict: Warm Cocoa / Editorial Typography tokens

- **Requirement:** Clean up a legacy “Warm Cocoa / Premium Glass / Editorial Typography” token block (non‑Pearl Mineral) in `index.css` with no WO in `build_tracker.md`.  
- **Source:** `COMMAND_CENTER/strategy/design_parity_conflict_report.md` line 69.  
- **Current WO mapping:**
  - Token and font debt is now generally covered by:
    - `FOUND-WO-08` (banned terms & design cleanup) — `SOCELLE-WEB/docs/build_tracker.md` lines 61–62.
    - Design‑system enforcement via `Design Guardian` and `token-drift-scanner` + `design-audit-suite` (see `AGENT_SCOPE_REGISTRY.md` §4 and `.claude/skills/*`).
  - There is no specific **“COCOA-TOKENS-WO”** entry in `build_tracker`.
- **Why potentially lost:**  
  - This **specific** non‑Pearl‑Mineral token block may or may not have been removed. The design parity report calls out “requires new WO in build_tracker.md” but no such dedicated WO exists today.
- **Proposed WO mapping / resolution:**
  - Treat this as part of **P1‑3** (design token migration) in `build_tracker.md` lines 102–109 and ensure:
    - Future P1‑3 execution explicitly mentions resolving any remaining non‑Pearl tokens from the parity report.
  - No separate WO ID is strictly required if P1‑3 acceptance criteria are expanded to “0 non‑Pearl tokens across `tailwind.config.js` and `index.css` (including ‘Warm Cocoa’ block)”.

### 2.4 IDEA-MINING patterns without explicit WO linkage

- **Requirement:** Remaining IDEA MINING Phase 1/2 patterns (sentiment aggregate banner, in‑card action arc, entity chips, vertical KPIs, “More filters” expansion, AI brief builder).  
- **Source:** `SOCELLE-WEB/docs/ops/IDEA_MINING_IMPLEMENTATION_MAP.md` lines 105–221, 227–238.  
- **Current WO mapping:**
  - Many patterns are implicitly tied to existing WOs:
    - Intelligence UI remediation → `INTEL-UI-REMEDIATION-01` (already executed; `build_tracker.md` lines 63–66).
    - AI Brief Builder → `INTEL-WO-07` and AI‑orchestrator work.
  - Some **UI uplift items** remain described only as “Phase 1 / Phase 2” work in the idea‑mining doc and not as distinct WOs.
- **Why potentially lost:**  
  - Without explicit WO IDs, it is possible for these patterns to be quietly skipped during split work.
- **Proposed WO mapping / resolution:**
  - In `SPLIT_PLAN__PHASED_EXECUTION.md` and `SPLIT_WO_CLUSTER.md`, tie these patterns directly to:
    - `INTEL-WO-0x` extensions, or
    - A small “INTEL-UI-POLISH-*” cluster, referenced explicitly in `build_tracker.md`.
  - This does **not** invent business scope; it simply attaches existing, documented patterns to WOs.

---

## 3. “Confirmed not lost” list

> Representative (not exhaustive) examples showing that **major requirements are traced → WOs → commits → files**.

### 3.1 CMS / Authoring Studio

- **Requirement:** Full CMS stack (schema, hooks, admin UI, public rendering, hub integrations) + Authoring Studio.  
- **Sources:**
  - `SOCELLE_MASTER_BUILD_WO.md`:
    - WO‑CMS‑01..06 (lines 137–201).
  - `SOCELLE-WEB/MASTER_STATUS.md`:
    - CMS pipeline and Authoring Studio completion summary (lines 36–41).
  - `SOCELLE-WEB/docs/build_tracker.md`:
    - CMS‑WO entries and CMS‑SEED‑01 (`build_tracker.md` lines 3, 6, 139–159).
- **WO mapping & evidence:**
  - **WO‑CMS‑01..05** — Complete:
    - Evidence table: `SOCELLE_MASTER_BUILD_WO.md` lines 24–29.
    - MASTER_STATUS “CMS Pipeline” section: lines 36–41.
    - Routes and components under `SOCELLE-WEB/src/pages/admin/cms*` and `SOCELLE-WEB/src/lib/cms/*`.
  - **WO‑CMS‑06** — Marked complete in MASTER_STATUS (integrations), but hub‑level journey enforcement continues via `JOURNEY_STANDARDS.md` and `PRODUCT_SURFACE_AUDIT.md`.
  - **CMS-WO-07** — OPEN:
    - `EXECUTION_STATE_AUDIT.md` lines 203–205 (P1 gate).
    - Prep commit `e0a2c40` (AdminStoryDrafts + story_drafts migration) in `git log -30`.

**Conclusion:** CMS + Authoring Studio requirements are fully WO‑backed; remaining work is explicitly captured in CMS-WO‑07 and related hub‑integration WOs. **Not lost.**

### 3.2 Intelligence Cloud + Merchandising + Feeds

- **Requirement:** 10 Intelligence modules, AI tools, feed pipeline (RSS, NewsAPI, OpenFDA), merchandising rules.  
- **Sources:**
  - `SOCELLE_MASTER_BUILD_WO.md` — V2‑INTEL‑01..06, FEED‑WO‑01..05, MERCH‑INTEL‑0x (lines 205–246, FEED section).
  - `SOCELLE-WEB/docs/build_tracker.md` — INTEL‑WO‑01..11, FEED‑WO‑0x, MERCH‑INTEL‑0x rows (lines 28–35, 33, 60–63, 79–81).
  - `docs/ops/EXECUTION_STATE_AUDIT.md` — Build 1 table, Master Platform Upgrade table (§2).
  - `SOCELLE-WEB/docs/qa/verify_INTEL-WO-01-11_2026-03-10T00-00-00-000Z.json`, `verify_FEED-WO-01_...`, `verify_MERCH-INTEL-*`.
- **WO mapping & evidence (examples):**
  - `INTEL-WO-01..11` → DONE with SHA `97b55c4` and QA artifact (`EXECUTION_STATE_AUDIT.md` lines 44–47).
  - `FEED-WO-01..05` → DONE with SHA `cf32089` and QA artifacts (`EXECUTION_STATE_AUDIT.md` line 45; `build_tracker.md` lines 28–32).
  - `MERCH-INTEL-02` / `MERCH-INTEL-03-DB` → DONE with SHAs `2a7acb3`, `2f005fe` and corresponding `verify_MERCH-INTEL-02*` / `verify_MERCH-INTEL-03-DB.json`.
  - `MERCH-INTEL-03-FINAL` → OPEN (clearly marked in `EXECUTION_STATE_AUDIT.md` lines 151, 254).

**Conclusion:** Intelligence + feed + merchandising requirements are WO‑complete and evidence‑linked; remaining work is clearly marked partial/open rather than lost. **Not lost.**

### 3.3 Entitlements / Payments / Turn‑on‑Turn‑off Hubs

- **Requirement:** Subscription‑based access to hubs/mini‑apps; consistent entitlement enforcement; credit system; Stripe integration.  
- **Sources:**
  - `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` §1–§7.
  - `SOCELLE_MASTER_BUILD_WO.md` — PAY‑WO‑0x, Credit Economy, V2‑PLAT‑05 (plan/paywall).
  - `SOCELLE-WEB/docs/build_tracker.md` — PAY‑WO‑01..05, Credit Economy Hub, P2‑STRIPE, ROUTE‑CLEANUP‑WO, BRAND‑SIGNAL‑WO.
  - `EXECUTION_STATE_AUDIT.md` — PAY‑WO status and P2‑STRIPE (lines 184–219).
- **WO mapping & evidence (examples):**
  - PAY‑WO‑01..05 → DONE with SHA `de9ebef` and `verify_BUILD1-COMPLETE_2026-03-09T23-13-05-000Z.json` (`build_tracker.md` lines 34–35; `EXECUTION_STATE_AUDIT.md` line 46).
  - Entitlement chain → CTRL‑WO‑04 (`build_tracker.md` lines 36–39; QA artifacts).
  - P2‑STRIPE → BLOCKED (owner action) but explicitly listed in `EXECUTION_STATE_AUDIT.md` lines 217–218.

**Conclusion:** Entitlement and payment requirements are clearly WO‑backed and surfaced (including blocked items); none are “floating” only in docs. **Not lost.**

### 3.4 Multi‑platform (Mobile, Tauri, PWA)

- **Requirement:** Web app as source; Tauri desktop wrapper; Flutter mobile with shared API contracts; PWA.  
- **Sources:**
  - `MODULE_BOUNDARIES.md` — multi‑platform strategy (lines 214–221).
  - `SOCELLE_MASTER_BUILD_WO.md` — V2‑MULTI‑01..03 and MOBILE‑WO‑*, TAURI‑WO‑*, PWA‑WO‑* (lines 44–46, 94–100).
  - `SOCELLE-WEB/docs/build_tracker.md` — MOBILE‑WO partial, TAURI‑WO‑01, PWA‑WO‑0x rows (lines 69–71).
  - `EXECUTION_STATE_AUDIT.md` — Build 5 status (lines 93–100).
- **WO mapping & evidence:**
  - Tauri shell + PWA basics → DONE (`ae03c98` with `verify_BUILD5_MULTI_PLATFORM_20260309T200000Z.json`).
  - MOBILE‑WO and remaining multi‑platform tasks → explicitly marked PARTIAL/OPEN, not missing (`EXECUTION_STATE_AUDIT.md` lines 97–100).

**Conclusion:** Multi‑platform work is fully enumerated with WOs and status; some is incomplete but nothing is untracked. **Not lost.**

---

## 4. Contradictions between build_tracker, MASTER_STATUS, and master WO docs

### 4.1 MASTER_STATUS vs build_tracker / execution audit timelines

- **Path:** `SOCELLE-WEB/MASTER_STATUS.md` line 6 vs `docs/ops/SOURCE_OF_TRUTH_MAP.md` lines 6–7 and `/.claude/CLAUDE.md` §0.
- **Issue:** MASTER_STATUS still claims `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` as authority, while Tier‑0/1 chain now sets:
  - `/.claude/CLAUDE.md` + `SESSION_START.md` + `build_tracker.md` + `MASTER_STATUS.md` as the active governance chain.
- **Impact:** Governance **authority wording** is slightly stale in MASTER_STATUS; execution data is still valid.
- **Resolution:** No new WO needed; update MASTER_STATUS header language under a documentation WO (e.g. `DOC-GOV-01`) to align authority references with CLAUDE §0 and SOURCE_OF_TRUTH_MAP.

### 4.2 V2 hub claims vs later audits

- **Path:** `SOCELLE-WEB/MASTER_STATUS.md` lines 51–58 vs `docs/ops/PRODUCT_SURFACE_AUDIT.md` §1–§3.
- **Issue:** MASTER_STATUS says “All 14 V2‑HUBS complete ✅”, while later audits show:
  - Remaining shells (23 true shells) and DEMO surfaces (`PRODUCT_SURFACE_AUDIT.md` lines 18–32, 252–260).
- **Impact:** This is a **historical snapshot**, not a live truth; the discrepancy is already corrected in `EXECUTION_STATE_AUDIT.md` and `build_tracker.md`.
- **Resolution:** SOURCE_OF_TRUTH_MAP and EXECUTION_STATE_AUDIT already declare build_tracker + EXECUTION_STATE_AUDIT as current truth; MASTER_STATUS should be treated as **dated context** unless refreshed under a future WO. No WOs lost; just temporal conflicts.

### 4.3 Legacy V1 docs vs current V3 plan

- **Path:** `SOCELLE_MONOREPO_MAP.md` and `MODULE_BOUNDARIES.md` headers (lines 5–7) referencing V1 as ultimate authority vs `/.claude/CLAUDE.md` §0 and `V3_BUILD_PLAN.md`.  
- **Issue:** Some older command docs still say “V1 wins” in case of conflict; CLAUDE now asserts itself as Tier 0 and uses V3 plan as execution source.  
- **Impact:** This is a **doc‑level contradiction**, not a missing WO:
  - Execution has already been following V3 + CLAUDE + build_tracker.
- **Resolution:** To be handled in `AGENT-DOC-REFRESH-01` / `DOC-GOV-01` — update header notes to reflect the Tier‑0/1 authority chain.

---

## 5. Truth statement — Lost WOs / requirements

Based on:

- `SOCELLE_MASTER_BUILD_WO.md` (phases 1–9, WOs V2‑CMS, V2‑INTEL, V2‑HUBS, V2‑PLAT, V2‑MULTI, launch WOs).  
- `SOCELLE-WEB/docs/build_tracker.md` lines 1–200 (WO registry, P0/P1/P2 queues).  
- `SOCELLE-WEB/MASTER_STATUS.md` lines 11–75, 77–147 (public + portal + admin pages and state).  
- `docs/ops/EXECUTION_STATE_AUDIT.md` §§1–4.  
- `docs/ops/PRODUCT_SURFACE_AUDIT.md` §§1–7.  
- `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` §§1–7.  
- `docs/command/SOCELLE_MONOREPO_MAP.md` §§1–3.  
- `docs/command/MODULE_BOUNDARIES.md` §§9–23.  
- `SOCELLE-WEB/docs/ops/IDEA_MINING_IMPLEMENTATION_MAP.md` §§1–8.

**Statement:**

- **No critical WOs or platform‑level requirements are lost.**
  - All core areas (CMS, Intelligence, Merch/Feeds, Search, Events, SEO, Payments/Entitlements, Admin, Education, CRM, Commerce, Multi‑platform) have:
    - Named WOs in `SOCELLE_MASTER_BUILD_WO.md` and/or `build_tracker.md`, and
    - Status + evidence in `EXECUTION_STATE_AUDIT.md` and `SOCELLE-WEB/docs/qa/verify_*.json`.
- There **are** a handful of **potentially confusing legacy IDs / planning artefacts**:
  - `API-WO-*` in `docs/operations/API_LOGIC_MAP.md`,
  - `COPY-WO-01` / `SHELL-WO-01` / `INTEL-WO-12` / `FEED-WO-06` / `PAY-WO-06` / `BRAND-WO-06` / `SCHEMA-WO-01` / `FOUND-WO-04-EXT` in `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md`,
  - A specific design token conflict (“Warm Cocoa / Editorial Typography”) in `COMMAND_CENTER/strategy/design_parity_conflict_report.md`,
  - And several IDEA‑MINING patterns that are **documented and partially implemented** but not always mapped 1‑to‑1 to WO IDs.

These are **not lost** in the sense of being forgotten; they are:

- Either **superseded by newer WOs** (API‑WO series, backlog IDs), or  
- Already captured as **P1/P2 debts and existing WOs** (design tokens, IDEA‑MINING gaps, MERCH‑INTEL‑03‑FINAL, DEBT‑TANSTACK‑REAL‑6, P1‑3, P2‑1, etc.).

The main action needed is **governance cleanup and explicit linkage**, not recovery of missing work.

