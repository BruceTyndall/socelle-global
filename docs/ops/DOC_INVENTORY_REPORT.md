# SOCELLE MONOREPO — DOCUMENTATION INVENTORY REPORT

**Generated:** 2026-03-13
**Scope:** Full monorepo documentation audit — root, docs/, SOCELLE-WEB/docs/, .claude/, COMMAND_CENTER/
**Authority:** Audit sprint deliverable — documentation only, no code changes

---

## 1. REPO FILE CLUSTERING SUMMARY

The monorepo documentation is distributed across five distinct zones. Each zone has a different governance role and age profile. Overlap and duplication are concentrated at the boundary between `docs/` (root-level) and `SOCELLE-WEB/docs/` (web package-level).

| Zone | Path | Doc Count | Primary Role | Governance Weight |
|------|------|-----------|--------------|-------------------|
| Root governance | `/` | 4 key files | Master WOs, AI-for-brands/pros HTML, README | HIGH |
| Root docs — command | `docs/command/` | 21 files | Canonical doctrine, design, entitlements, agents | HIGH |
| Root docs — operations | `docs/operations/` | 5 files | Breakout WOs, API maps, studio | HIGH |
| Root docs — qa | `docs/qa/` | ~65 files | Verification artifacts, proof JSONs | HIGH |
| Root docs — archive | `docs/archive/` | 20 files | Deprecated docs from pre-Mar-6 sessions | LOW |
| Root docs — misc | `docs/` (root level) | 3 files | API compliance, skills spec, supplement | MED |
| Web docs — command | `SOCELLE-WEB/docs/command/` | 8 files | V3 build plan, CMS architecture, journey standards | HIGH |
| Web docs — audit | `SOCELLE-WEB/docs/audit/` | 11 files | 2026-03-13 parallel agent audit outputs | MED |
| Web docs — operations | `SOCELLE-WEB/docs/operations/` | 4 files | Platform upgrade WO, breakout, session prompts | MED |
| Web docs — ops | `SOCELLE-WEB/docs/ops/` | 6 files | Recent ops logs, run logs, change manifests | MED |
| Web docs — inventory | `SOCELLE-WEB/docs/inventory/` | 1 file | Global inventory report | MED |
| Web docs — qa | `SOCELLE-WEB/docs/qa/` | ~70 files | Verification artifacts, proof JSONs | HIGH |
| Claude governance | `.claude/` | 130+ skill files + 4 commands | Agent skills, commands, settings | HIGH |
| Abandoned worktrees | `.claude/worktrees/` | 6 directories | Abandoned agent worktrees | DEAD |
| Unknown | `COMMAND_CENTER/` | Not fully inventoried | Unknown — 4 subdirs | UNKNOWN |

**Total named doc files (excluding qa/ artifacts and node_modules):** ~180+

---

## 2. COMPLETE DOCUMENT INVENTORY

### 2a. Repo Root

| Path | Purpose | Last Modified | Status |
|------|---------|---------------|--------|
| `README.md` | Project overview, basic setup | Mar 6 | ACTIVE — update needed |
| `SOCELLE_MASTER_BUILD_WO.md` | Master work order document (36 WOs × 9 phases) | Mar 9 | ACTIVE — execution authority |
| `ULTRA_DRIVE_PROMPT.md` | Active corrective sprint directive | Mar 8 | ACTIVE — read each session |
| `SOCELLE_AI_FOR_BRANDS.html` | Marketing HTML for brands | Mar 6 | ACTIVE — public-facing asset |
| `SOCELLE_AI_FOR_PROS.html` | Marketing HTML for professionals | Mar 6 | ACTIVE — public-facing asset |
| `.gitignore` | Git ignore rules | — | ACTIVE |
| `.npmrc` | npm registry configuration | — | ACTIVE |
| `package.json` | Monorepo root package | — | ACTIVE |
| `turbo.json` | Turborepo pipeline config | — | ACTIVE |
| `wrangler.toml` | Cloudflare Workers config | — | ACTIVE |

### 2b. docs/command/ (Canonical Doctrine)

| Path | Purpose | Last Modified | Status |
|------|---------|---------------|--------|
| `docs/command/AGENT_SCOPE_REGISTRY.md` | Agent #1–17 scope definitions | Recent | ACTIVE |
| `docs/command/AGENT_WORKFLOW_INDEX.md` | Agent workflow coordination index | Recent | ACTIVE |
| `docs/command/AGENT_WORKING_FOLDERS.md` | Per-agent folder assignments | Recent | ACTIVE |
| `docs/command/ASSET_MANIFEST.md` | Asset manifest (root-level copy) | — | POTENTIAL DUPLICATE — see §3 |
| `docs/command/BRAND_SURFACE_INDEX.md` | Brand surface definitions | — | ACTIVE |
| `docs/command/GLOBAL_SITE_MAP.md` | Site map (global version) | — | POTENTIAL DUPLICATE — see §3 |
| `docs/command/HARD_CODED_SURFACES.md` | Inventory of hardcoded content surfaces | — | ACTIVE |
| `docs/command/MIGRATION_INTEGRITY_REPORT.md` | DB migration integrity audit | — | ACTIVE |
| `docs/command/MODULE_BOUNDARIES.md` | Cross-module boundary definitions | — | ACTIVE |
| `docs/command/MONOREPO_PORT_VERIFICATION.md` | Port allocation verification | — | ACTIVE |
| `docs/command/MONOREPO_TOOLING.md` | Tooling reference (Turborepo, pnpm) | — | ACTIVE |
| `docs/command/PORT_BASELINE_MANIFEST.md` | Port baseline (may overlap MONOREPO_PORT_VERIFICATION) | — | REVIEW |
| `docs/command/SITE_MAP.md` | Site map (secondary copy) | — | POTENTIAL DUPLICATE — see §3 |
| `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` | Canonical doctrine (§9 banned terms etc.) | — | ACTIVE — HIGH AUTHORITY |
| `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` | Data provenance and sourcing policy | — | ACTIVE |
| `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` | Tier entitlement definitions | — | ACTIVE |
| `docs/command/SOCELLE_FIGMA_DESIGN_BRIEF.md` | Figma design brief | — | ACTIVE |
| `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | Figma-to-code handoff spec | — | ACTIVE |
| `docs/command/SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md` | Likely a copy/backup of CLAUDE.md | — | DEMOTE — see §7 |
| `docs/command/SOCELLE_MONOREPO_MAP.md` | Monorepo structure map | — | ACTIVE |
| `docs/command/SOCELLE_RELEASE_GATES.md` | Release gate checklist | — | ACTIVE |
| `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | V1 master prompt | — | VERSION CONFLICT — see §3 |
| `docs/command/V2_TECH_01_AGENT_PROMPT.md` | V2-TECH-01 agent prompt | — | COMPLETE — consider archiving |

### 2c. docs/operations/

| Path | Purpose | Last Modified | Status |
|------|---------|---------------|--------|
| `docs/operations/API_LOGIC_MAP.csv` | API logic map (CSV format) | — | ACTIVE |
| `docs/operations/API_LOGIC_MAP.md` | API logic map (Markdown format) | — | POTENTIAL DUPLICATE — see §3 |
| `docs/operations/OPERATION_BREAKOUT.md` | WO breakout specs (root copy) | — | POTENTIAL DUPLICATE — see §3 |
| `docs/operations/STUDIO_IDEA_MINING_2026.md` | Studio idea mining reference | — | ACTIVE |

### 2d. docs/qa/ (~65 files)

All files follow naming convention `verify_<WO_ID>_<timestamp>.json` or `audit_<topic>.json`. These are verification artifacts — not listed individually. All are ACTIVE as evidence records. Do not delete or demote.

Notable recent entries:
- `verify_MERCH-INTEL-03-DB.json` — PASS
- `verify_FREE-DATA-01.json` — PASS
- `verify_EMBED-01.json` — PASS
- `verify_LANE-B-fixes_2026-03-10.json` — PASS
- `verify_site_wide_audit_2026-03-09T22-00-00-000Z.json` — PASS

### 2e. docs/archive/ (20 files — all DEPRECATED)

All files prefixed `DEPRECATED__2026-03-05__` or `DEPRECATED__2026-03-06__`. These are superseded pre-V3 docs. Status: ARCHIVED — do not use, do not delete (historical record).

| File | Superseded By |
|------|---------------|
| `DEPRECATED__2026-03-06__CLAUDE_CODE_HANDOFF.md` | `.claude/CLAUDE.md` |
| `DEPRECATED__2026-03-06__CLAUDE_PROJECTS_MASTER_PROMPT.md` | `.claude/CLAUDE.md` |
| `DEPRECATED__2026-03-06__NESTED_build_tracker.md` | `SOCELLE-WEB/docs/build_tracker.md` |
| `DEPRECATED__2026-03-05__DRIFT_PATCHLIST.md` | `docs/qa/` artifacts |
| `DEPRECATED__2026-03-05__MODULE_MAP.md` | `docs/command/SOCELLE_MONOREPO_MAP.md` |
| `DEPRECATED__2026-03-06__SEO_GUIDELINES.md` | `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` |
| `DEPRECATED__2026-03-06__SITEMAP_PLAN.md` | `docs/command/GLOBAL_SITE_MAP.md` |
| Others (13) | Various command/ and operations/ files |

### 2f. SOCELLE-WEB/docs/command/ (V3 Authority)

| Path | Purpose | Last Modified | Status |
|------|---------|---------------|--------|
| `SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md` | CMS table definitions, hooks, PageRenderer spec | Recent | ACTIVE — HIGH AUTHORITY |
| `SOCELLE-WEB/docs/command/CMS_CONTENT_MODEL.md` | Block types, content types, space definitions | Recent | ACTIVE — HIGH AUTHORITY |
| `SOCELLE-WEB/docs/command/INTEL-MERCH-01.md` | Intelligence merchandiser spec | Recent | ACTIVE |
| `SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md` | Per-hub user journey definitions, E2E test reqs | Recent | ACTIVE — HIGH AUTHORITY |
| `SOCELLE-WEB/docs/command/SOCELLE_API_UPDATE_PACK.md` | API update notes | Recent | ACTIVE |
| `SOCELLE-WEB/docs/command/V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | V3 master prompt | Recent | ACTIVE — SUPERSEDES V1 |
| `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md` | V3 canonical build plan with WO execution specs | Recent | ACTIVE — HIGH AUTHORITY |

### 2g. SOCELLE-WEB/docs/audit/ (2026-03-13 parallel agent outputs)

| Path | Purpose | Status |
|------|---------|--------|
| `SOCELLE-WEB/docs/audit/API_GAPS_AND_WIRING_PLAN.md` | API gap analysis and wiring plan | ACTIVE |
| `SOCELLE-WEB/docs/audit/API_LOGIC_MAP.md` | API logic map (web audit copy) | POTENTIAL DUPLICATE — see §3 |
| `SOCELLE-WEB/docs/audit/API_RUNTIME_INVENTORY.md` | Runtime API inventory | ACTIVE |
| `SOCELLE-WEB/docs/audit/COPY_AND_LAUNCH_COMMS.md` | Copy and launch communications | ACTIVE |
| `SOCELLE-WEB/docs/audit/INTELLIGENCE_HUB_AUDIT.md` | Intelligence hub audit results | ACTIVE |
| `SOCELLE-WEB/docs/audit/INTELLIGENCE_MERCHANDISING_REPORT.md` | Merchandising audit report | ACTIVE |
| `SOCELLE-WEB/docs/audit/SHELLS_AND_STATES.md` | Shell and state audit | ACTIVE |
| `SOCELLE-WEB/docs/audit/SITEMAP_AND_JOURNEYS.md` | Sitemap and journey audit | ACTIVE |
| `SOCELLE-WEB/docs/audit/SOCELLE_MASTER_ACTION_PLAN.md` | Action plan from audit session | REVIEW — may overlap SOCELLE_MASTER_BUILD_WO.md |
| `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md` | Work order backlog from audit | REVIEW — may conflict with build_tracker.md |
| `SOCELLE-WEB/docs/audit/SYSTEM_OVERVIEW.md` | System overview snapshot | ACTIVE |

### 2h. SOCELLE-WEB/docs/operations/

| Path | Purpose | Status |
|------|---------|--------|
| `SOCELLE-WEB/docs/operations/APP_FEATURE_FUNCTIONALITY_GUIDE.md` | Feature/functionality reference | ACTIVE |
| `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` | WO breakout (web package copy) | DUPLICATE — see §3 |
| `SOCELLE-WEB/docs/operations/SESSION_PROMPTS.md` | Session prompt templates | ACTIVE |
| `SOCELLE-WEB/docs/operations/WO_MASTER_PLATFORM_UPGRADE.md` | Master platform upgrade WO (21 WOs) | ACTIVE — P1 GATE reference |

### 2i. SOCELLE-WEB/docs/ops/ (Recent ops logs)

| Path | Purpose | Last Modified | Status |
|------|---------|---------------|--------|
| `SOCELLE-WEB/docs/ops/CHANGE_MANIFEST_2026-03-13.md` | Change manifest from 2026-03-13 session | Mar 13 | ACTIVE |
| `SOCELLE-WEB/docs/ops/DELTA_INTEL-UI-REMEDIATION-01.md` | Intelligence UI remediation delta | Mar 13 | ACTIVE |
| `SOCELLE-WEB/docs/ops/IDEA_MINING_IMPLEMENTATION_MAP.md` | Idea mining implementation map | Mar 13 | ACTIVE |
| `SOCELLE-WEB/docs/ops/RUN_LOG_2026-03-13.md` | Session run log | Mar 13 | ACTIVE |
| `SOCELLE-WEB/docs/ops/TOMORROW_EXECUTION_BRIEF.md` | Next-session execution brief | Mar 13 | ACTIVE — read before next session |
| `SOCELLE-WEB/docs/ops/capture_screens.mjs` | Screenshot capture script | Mar 13 | NOTE: script file in docs/ dir — belongs in scripts/ |

### 2j. SOCELLE-WEB/docs/ (other)

| Path | Purpose | Status |
|------|---------|--------|
| `SOCELLE-WEB/docs/ASSET_MANIFEST.md` | Asset manifest (web-level copy) | POTENTIAL DUPLICATE — see §3 |
| `SOCELLE-WEB/docs/build_tracker.md` | EXECUTION AUTHORITY — WO status, phase, active items | ACTIVE — PRIMARY |
| `SOCELLE-WEB/docs/inventory/SOCELLE_GLOBAL_INVENTORY_REPORT.md` | Prior inventory report | ACTIVE — may be superseded by this report |

### 2k. .claude/ (Agent Governance)

| Path | Purpose | Status |
|------|---------|--------|
| `.claude/CLAUDE.md` | ROOT GOVERNANCE — agent operating directive | ACTIVE — read every session |
| `.claude/launch.json` | Launch configuration | ACTIVE |
| `.claude/settings.local.json` | Local agent settings | ACTIVE |
| `.claude/commands/audit-all.md` | Slash command: audit-all | ACTIVE |
| `.claude/commands/check.md` | Slash command: check | ACTIVE |
| `.claude/commands/cms-status.md` | Slash command: cms-status | ACTIVE |
| `.claude/commands/shell-check.md` | Slash command: shell-check | ACTIVE |
| `.claude/skills/` (130+ files) | 99 skills × SKILL.md — validators, auditors, generators | ACTIVE |
| `.claude/worktrees/` (6 dirs) | Abandoned agent worktrees | DEAD — see §4 |

---

## 3. DUPLICATES AND OVERLAP DETECTION

### Conflict 1: OPERATION_BREAKOUT.md — Exact Duplicate

| Copy A | `docs/operations/OPERATION_BREAKOUT.md` |
|--------|------------------------------------------|
| Copy B | `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` |

**Conflict:** Same filename, same topic, different tree locations. Agents reading Copy B (web-package scope) may diverge from Copy A (root scope) if they are ever edited independently.

**Recommendation:** Designate Copy A (`docs/operations/`) as canonical. Add a one-line redirect header to Copy B stating "See docs/operations/OPERATION_BREAKOUT.md — this copy may be stale." Do NOT delete Copy B until a session confirms both are byte-identical.

---

### Conflict 2: API_LOGIC_MAP.md — Three-Way Overlap

| Copy A | `docs/operations/API_LOGIC_MAP.md` |
|--------|-------------------------------------|
| Copy B | `docs/operations/API_LOGIC_MAP.csv` |
| Copy C | `SOCELLE-WEB/docs/audit/API_LOGIC_MAP.md` |

**Conflict:** Copy A (root ops) and Copy C (web audit) are both Markdown. Copy B is the raw CSV source. Copy C was generated by the 2026-03-13 parallel audit session and may reflect a more current API state.

**Recommendation:** Copy C is newer — treat it as the live snapshot. Copy A should be demoted to `docs/operations/DEPRECATED__API_LOGIC_MAP.md`. Keep Copy B (CSV) as the machine-readable source of truth.

---

### Conflict 3: ASSET_MANIFEST.md — Dual Location

| Copy A | `docs/command/ASSET_MANIFEST.md` |
|--------|----------------------------------|
| Copy B | `SOCELLE-WEB/docs/ASSET_MANIFEST.md` |

**Conflict:** Same name, different directories. No clear indication which is canonical or more current.

**Recommendation:** Root-level `docs/command/` copy should be canonical (command/ is governance authority). Demote `SOCELLE-WEB/docs/ASSET_MANIFEST.md` by adding a stale header.

---

### Conflict 4: SITE_MAP.md vs GLOBAL_SITE_MAP.md

| File A | `docs/command/SITE_MAP.md` |
|--------|----------------------------|
| File B | `docs/command/GLOBAL_SITE_MAP.md` |

**Conflict:** Both files exist in the same directory with overlapping subject matter. `GLOBAL_SITE_MAP.md` is the preferred name based on governance priority naming. `SITE_MAP.md` may be an earlier draft.

**Recommendation:** Verify contents. If substantially identical, demote `SITE_MAP.md` (add deprecated header). If SITE_MAP.md contains unique content, merge into GLOBAL_SITE_MAP.md and then demote.

---

### Conflict 5: V1 vs V3 Master Prompt — Version Conflict

| V1 | `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` |
|----|-----------------------------------------------------------|
| V3 | `SOCELLE-WEB/docs/command/V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` |

**Conflict:** V1 lives in the root `docs/command/` tree. V3 (the current authority per MEMORY.md and CLAUDE.md) lives in the web package tree. Any agent that reads V1 without finding V3 will operate on outdated doctrine.

**Recommendation:** Add a prominent "SUPERSEDED BY V3" header to V1. Move or symlink V3 to `docs/command/` so it sits adjacent to V1 and is discoverable without entering the web package tree. Do not delete V1 (historical record).

---

### Conflict 6: SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md

| File | `docs/command/SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md` |
|------|------------------------------------------------------|
| Authority | `.claude/CLAUDE.md` |

**Conflict:** This file's name implies it is a complete copy of CLAUDE.md. If it is a snapshot/backup, it will drift from `.claude/CLAUDE.md` over time and mislead agents.

**Recommendation:** Demote immediately. Add header: "SNAPSHOT — NOT LIVE. Authoritative copy is /.claude/CLAUDE.md." Move to `docs/archive/` on next tidy session.

---

### Conflict 7: SOCELLE_MASTER_ACTION_PLAN.md vs SOCELLE_MASTER_BUILD_WO.md

| Audit output | `SOCELLE-WEB/docs/audit/SOCELLE_MASTER_ACTION_PLAN.md` |
|--------------|--------------------------------------------------------|
| Root authority | `SOCELLE_MASTER_BUILD_WO.md` (repo root) |

**Conflict:** The audit output was generated by a parallel agent session on 2026-03-13 and may contain action items that duplicate, contradict, or extend the master WO document.

**Recommendation:** Review for new action items. Integrate any net-new items into `SOCELLE-WEB/docs/build_tracker.md` under the appropriate WO. Add header to audit copy: "AUDIT SNAPSHOT 2026-03-13 — items integrated into build_tracker.md." Do not treat it as an independent execution authority.

---

### Conflict 8: SOCELLE_WORK_ORDER_BACKLOG.md

| File | `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md` |
|------|--------------------------------------------------------|
| Authority | `SOCELLE-WEB/docs/build_tracker.md` |

**Conflict:** A second WO backlog generated by the audit session. `build_tracker.md` is the sole execution authority per CLAUDE.md §11. A parallel backlog risks agents picking up stale or invalidated WOs.

**Recommendation:** Demote. Add header: "GENERATED SNAPSHOT 2026-03-13 — not an execution authority. Use build_tracker.md." Do not add WOs from this file without owner review.

---

## 4. ABANDONED WORKTREES

The following six directories exist under `.claude/worktrees/` and appear to be abandoned agent working environments. They contribute to tree pollution and may contain stale or conflicting file states.

| Worktree Name | Path | Risk |
|---------------|------|------|
| `agent-a43a92cd` | `.claude/worktrees/agent-a43a92cd/` | Stale agent state, unknown file modifications |
| `agent-aeab7bc2` | `.claude/worktrees/agent-aeab7bc2/` | Stale agent state, unknown file modifications |
| `agent-aef6b8cd` | `.claude/worktrees/agent-aef6b8cd/` | Stale agent state, unknown file modifications |
| `agent-af367b62` | `.claude/worktrees/agent-af367b62/` | Stale agent state, unknown file modifications |
| `gifted-saha` | `.claude/worktrees/gifted-saha/` | Non-standard name — likely named worktree from agent session |
| `silly-feynman` | `.claude/worktrees/silly-feynman/` | Non-standard name — likely named worktree from agent session |

**Why they exist:** Agent sessions that used the `EnterWorktree` tool without a corresponding `ExitWorktree` or cleanup leave these directories behind. They are isolated branches that may have partial changes not committed to main.

**Risk:** If any of these worktrees contain uncommitted file edits, those edits are silently not in the git history. The repo appears clean on main while potentially having divergent states in worktrees.

**Recommendation:**
1. Run `git worktree list` to enumerate registered worktrees vs orphan directories.
2. For each worktree: check `git status` and `git log --oneline -5`. If empty or clean, prune with `git worktree remove`.
3. If any worktree has uncommitted changes: cherry-pick or diff against main, then remove.
4. After cleanup, run `git worktree prune` to remove stale references.
5. Add a governance note to `.claude/CLAUDE.md` requiring `ExitWorktree` after every agent session.

**Do not delete these directories without first running `git worktree list` — some may be registered git worktrees, and removing the directory without `git worktree remove` can corrupt the git index.**

---

## 5. COMMAND_CENTER/ STATUS

**Path:** `/COMMAND_CENTER/` (repo root level)

**Inventory status:** NOT FULLY INVENTORIED. The `ls` output confirmed this directory exists and contains 4 subdirectories, but their contents were not enumerated in the audit data provided.

**What is known:**
- 4 subdirectories exist (names not captured in the data)
- The directory is not referenced in `CLAUDE.md`, `build_tracker.md`, or any of the 8 mandatory reads
- It is not part of the `docs/` or `SOCELLE-WEB/docs/` governance tree
- No WO references `COMMAND_CENTER/` as an output or input path

**Risk:** Unknown content not subject to agent governance. Could contain:
- Stale planning documents that conflict with current doctrine
- Assets or templates not accounted for in ASSET_MANIFEST.md
- Sensitive materials (API keys, credentials) in non-gitignored location

**Recommendation:**
1. Run `find COMMAND_CENTER/ -type f | head -50` to enumerate contents.
2. Classify each file as: active-used, active-unknown, stale, or sensitive.
3. If stale: move to `docs/archive/` with DEPRECATED prefix.
4. If active: move to the appropriate `docs/command/` or `docs/operations/` location and update AGENT_WORKING_FOLDERS.md.
5. If sensitive: remove immediately and verify not in git history.

---

## 6. MASTER_STATUS.md GAP

**Referenced in:** `SOCELLE-WEB/docs/build_tracker.md` (confirmed by the audit data noting this as a known gap)

**Actual state:** `MASTER_STATUS.md` does NOT exist at repo root.

**Impact:** Any agent or human reading build_tracker.md and attempting to open MASTER_STATUS.md for current status will fail silently. This is a broken internal reference.

**How the gap likely occurred:** A planning session referenced MASTER_STATUS.md as a future deliverable or as a file that once existed under a different name, but the file was never created or was renamed without updating the reference.

**Current substitute:** `SOCELLE-WEB/docs/build_tracker.md` serves the role that MASTER_STATUS.md was presumably intended to fill (phase, WO status, active items). The MEMORY.md also contains current-state summaries.

**Recommendation:**
- Either create `MASTER_STATUS.md` at repo root as a thin redirect: "See SOCELLE-WEB/docs/build_tracker.md for current execution status."
- Or update the stale reference in `build_tracker.md` to remove the broken link.
- Do NOT create a duplicate status document — single execution authority is a hard rule (CLAUDE.md §11).

---

## 7. RECOMMENDATIONS FOR DEMOTION/DEPRECATION

The following files should be marked as deprecated or demoted. None should be deleted — all serve as historical record. Demotion means adding a prominent header block and optionally moving to `docs/archive/`.

| File | Action | Justification |
|------|--------|---------------|
| `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | Add SUPERSEDED header pointing to V3 in SOCELLE-WEB/docs/command/ | V3 is active authority; V1 will mislead agents |
| `docs/command/SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md` | Move to docs/archive/ + add SNAPSHOT header | Stale copy of CLAUDE.md; will drift and mislead |
| `docs/command/SITE_MAP.md` | Verify vs GLOBAL_SITE_MAP.md; if duplicate, add DEPRECATED header | Redundant file in same directory |
| `docs/command/PORT_BASELINE_MANIFEST.md` | Verify vs MONOREPO_PORT_VERIFICATION.md; demote the older one | Overlapping port documentation |
| `docs/command/V2_TECH_01_AGENT_PROMPT.md` | Move to docs/archive/ | V2-TECH-01 is COMPLETE and FROZEN; prompt is stale |
| `docs/operations/OPERATION_BREAKOUT.md` | Add CANONICAL COPY IS SOCELLE-WEB/docs/operations/ header | Dual copies risk drift |
| `docs/operations/API_LOGIC_MAP.md` | Add OLDER SNAPSHOT header; treat SOCELLE-WEB/docs/audit/ copy as current | Audit copy is newer |
| `SOCELLE-WEB/docs/ASSET_MANIFEST.md` | Add header: "Canonical copy is docs/command/ASSET_MANIFEST.md" | Root docs/command/ is governance location |
| `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` | Evaluate which copy is canonical; demote the other | Exact duplicate in two locations |
| `SOCELLE-WEB/docs/audit/SOCELLE_MASTER_ACTION_PLAN.md` | Add AUDIT SNAPSHOT header; integrate to build_tracker.md | Must not be treated as execution authority |
| `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md` | Add GENERATED SNAPSHOT header | Conflicts with build_tracker.md as sole WO authority |
| `SOCELLE-WEB/docs/ops/capture_screens.mjs` | Move to scripts/ or tools/ | Script file stored in docs/ violates docs-only convention |
| `SOCELLE-WEB/docs/inventory/SOCELLE_GLOBAL_INVENTORY_REPORT.md` | Add SUPERSEDED header pointing to this report | This report is the current inventory |

---

## 8. QUICK-REFERENCE: AUTHORITY HIERARCHY

When two documents conflict, use this hierarchy to determine which is canonical:

```
1. .claude/CLAUDE.md                                    ← ROOT GOVERNANCE (highest)
2. SOCELLE-WEB/docs/build_tracker.md                   ← EXECUTION AUTHORITY (WO status)
3. SOCELLE_MASTER_BUILD_WO.md                          ← MASTER WO SCOPE
4. SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md           ← BUILD PLAN
5. SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md        ← CMS DOCTRINE
6. SOCELLE-WEB/docs/command/CMS_CONTENT_MODEL.md       ← CONTENT MODEL
7. SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md       ← JOURNEY SPEC
8. docs/command/SOCELLE_CANONICAL_DOCTRINE.md          ← PRODUCT DOCTRINE
9. docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md      ← TIER RULES
10. Everything else                                     ← REFERENCE/HISTORICAL
```

Audit outputs (`SOCELLE-WEB/docs/audit/`) are snapshots. They inform the execution authority — they do not replace it.

---

*End of DOC_INVENTORY_REPORT.md — 2026-03-13*
