# SOURCE OF TRUTH MAP — SOCELLE MONOREPO

**Created:** 2026-03-10
**Purpose:** Single reference that resolves authority conflicts, defines reading order, and classifies every governance/spec/tracker doc in the monorepo.
**Owner:** Architecture sprint. Update this file whenever a new governance doc is added or deprecated.

---

## §1 — AUTHORITY TIERS

### Tier 0 — Law of the Land (1 file)

| File | Size | Description |
|------|------|-------------|
| `/.claude/CLAUDE.md` | 6,500+ words | Root governance prompt. Controls all agent behavior monorepo-wide. §0–§16 cover reading order, skills, tech stack, design system, stop conditions, and launch non-negotiables. |

**Rationale:** This file explicitly declares itself "the root governance prompt" and "controls all agent behavior in this monorepo." Every other doc in the repo references it as the chain anchor. When any other document conflicts with `/.claude/CLAUDE.md`, `/.claude/CLAUDE.md` wins without exception.

---

### Tier 1 — Execution Authority (read every session, lines 1–50 minimum)

These files directly govern which WOs are active, what the current build state is, and what specs must be satisfied before any code ships.

| File | Description | Why Tier 1 |
|------|-------------|------------|
| `SOCELLE-WEB/docs/build_tracker.md` | Live WO execution log. Active phase, freeze directives, debt queue, proof artifact log. | Most volatile governance doc — updated every session. Lines 1–50 show current state. |
| `/SOCELLE_MASTER_BUILD_WO.md` | 36+ WOs across 9 phases. Full acceptance criteria for every work order. | Canonical definition of what "done" means for each WO. Required before starting any WO. |
| `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md` | V3 canonical build plan. WO execution specs, phase gates, delivery milestones. | Declares the V3 execution sequence. Required to understand phase order and WO dependencies. |
| `SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md` | CMS table definitions, admin routes, PageRenderer spec, block registration. | Governs all CMS work. Required before any CMS-WO. |
| `SOCELLE-WEB/docs/command/CMS_CONTENT_MODEL.md` | Block types, content types, space definitions. | Required before any content authoring or CMS-adjacent WO. |
| `SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md` | Per-hub user journey definitions and E2E test requirements. | Required before any hub WO. Defines what each hub must do end-to-end. |
| `ULTRA_DRIVE_PROMPT.md` (repo root, if present) | Active corrective sprint directive. When present, overrides normal WO queue priority. | If this file exists, read it first after Tier 0. It signals an owner-declared emergency sprint. |

---

### Tier 2 — Supporting Specs (read when executing relevant WO)

These files are reference material. Do not read all of them every session — load the relevant ones when a WO touches their domain.

#### docs/command/ (monorepo-level specs)

| File | Domain | When to Read |
|------|--------|-------------|
| `docs/command/AGENT_SCOPE_REGISTRY.md` | Agent definitions, skill mappings, 17 registered agents | Before assigning work to a specific agent or extending the skill library |
| `docs/command/AGENT_WORKFLOW_INDEX.md` | Workflow index for agent execution patterns | When orchestrating multi-agent sessions |
| `docs/command/AGENT_WORKING_FOLDERS.md` | Working folder assignments per agent | When an agent needs to know its sandbox boundaries |
| `docs/command/ASSET_MANIFEST.md` | Asset inventory (images, icons, fonts) | During design/asset work |
| `docs/command/BRAND_SURFACE_INDEX.md` | Brand surface specs, token-to-surface mapping | During design token work or brand hub WOs |
| `docs/command/GLOBAL_SITE_MAP.md` | Canonical route map (supersedes SITE_MAP.md — see §4) | During routing work, SEO audits, shell detection |
| `docs/command/HARD_CODED_SURFACES.md` | Inventory of surfaces with hardcoded content | During CMS migration or banned-term sweeps |
| `docs/command/MIGRATION_INTEGRITY_REPORT.md` | Migration audit — applied vs schema drift | During DB work, before running `schema-db-suite` |
| `docs/command/MODULE_BOUNDARIES.md` | Module boundary specs, import rules | During refactoring or new feature placement decisions |
| `docs/command/MONOREPO_PORT_VERIFICATION.md` | Port assignments per service | When spinning up local dev or CI environments |
| `docs/command/MONOREPO_TOOLING.md` | Tooling specs (linters, formatters, CI) | When modifying build config or CI pipelines |
| `docs/command/PORT_BASELINE_MANIFEST.md` | Port baseline (complements MONOREPO_PORT_VERIFICATION) | Same as above |
| `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` | Banned terms, design locks, copy rules, §9 stop conditions detail | Before shipping any user-facing copy. Run `banned-term-scanner` after. |
| `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` | Data provenance rules — source attribution, LIVE/DEMO labeling | During any data pipeline WO or signal ingestion work |
| `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` | Tier definitions (free/pro/enterprise), feature gates | During payment, credit, or entitlement WOs |
| `docs/command/SOCELLE_FIGMA_DESIGN_BRIEF.md` | Design brief — Pearl Mineral V2 visual language | During UI/design work |
| `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | Figma-to-code mapping, component correspondence | During component implementation from design files |
| `docs/command/SOCELLE_MONOREPO_MAP.md` | Monorepo structure, package boundaries, directory layout | When navigating unfamiliar parts of the repo |
| `docs/command/SOCELLE_RELEASE_GATES.md` | Launch gates (overlaps with CLAUDE.md §16) | Pre-launch verification. Cross-reference with CLAUDE.md §16. |
| `docs/command/SITE_MAP.md` | Older site map — **superseded by GLOBAL_SITE_MAP.md** (see §4) | Do not use as primary; reference only for historical context |

#### SOCELLE-WEB/docs/command/ (web-app-level specs)

| File | Domain | When to Read |
|------|--------|-------------|
| `SOCELLE-WEB/docs/command/INTEL-MERCH-01.md` | Intelligence merchandising spec — feed ordering, curation rules | Before any FEED-WO or INTEL-WO |
| `SOCELLE-WEB/docs/command/SOCELLE_API_UPDATE_PACK.md` | API contract updates | When implementing or modifying API integrations |
| `SOCELLE-WEB/docs/command/V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | V3 authority doc (see conflict note in §4) | Do not use as Tier 0 — see §4 for resolution |

#### docs/operations/ (execution plans)

| File | Domain | When to Read |
|------|--------|-------------|
| `docs/operations/OPERATION_BREAKOUT.md` | Operation breakout — WO sub-task decomposition | When a WO has sub-tasks that need drill-down. Use SOCELLE-WEB version if conflict — see §4. |
| `docs/operations/API_LOGIC_MAP.md` | API logic, edge function routing | During edge function or API WOs |
| `docs/operations/STUDIO_IDEA_MINING_2026.md` | Idea mining results, feature backlog | Context only — not execution authority |

#### SOCELLE-WEB/docs/operations/ (execution plans — web-specific)

| File | Domain | When to Read |
|------|--------|-------------|
| `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` | Web-specific breakout (see §4 for duplicate resolution) | Prefer this over docs/operations version for web WOs |
| `SOCELLE-WEB/docs/operations/WO_MASTER_PLATFORM_UPGRADE.md` | 21-WO platform upgrade plan with patch log | During platform upgrade WOs |
| `SOCELLE-WEB/docs/operations/SESSION_PROMPTS.md` | Session prompt templates | Reference when initializing agent sessions |
| `SOCELLE-WEB/docs/operations/APP_FEATURE_FUNCTIONALITY_GUIDE.md` | Feature functionality guide | Reference during hub implementation |

#### docs/ root level

| File | Domain | When to Read |
|------|--------|-------------|
| `docs/SKILLS_DEFINITION_SPEC.md` | Spec for all 99 skills — inputs, outputs, pass/fail criteria | Before writing or modifying any skill in `/.claude/skills/` |
| `docs/API_COMPLIANCE_RESEARCH.md` | API compliance and regulatory research | During API integration or data provenance WOs |

#### SOCELLE-WEB/docs/build_tracker.md companion files

| File | Domain | When to Read |
|------|--------|-------------|
| `SOCELLE-WEB/docs/qa/` (directory) | Verification JSON artifacts (`verify_<WO_ID>_<timestamp>.json`) | After completing any WO — proof artifacts required here |

---

### Tier 3 — Potentially Redundant (review before using)

These files may overlap with Tier 0/1 docs. Do not treat them as authoritative without cross-checking against the ruling tier.

| File | Issue | Recommended Action |
|------|-------|-------------------|
| `docs/command/SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md` | Title suggests it may be a copy or earlier draft of `/.claude/CLAUDE.md`. Content relationship unclear. | Read and compare against `/.claude/CLAUDE.md`. If identical or subset: archive to `docs/archive/`. If it adds rules not in Tier 0: merge into `/.claude/CLAUDE.md` and archive. |
| `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | V1 version of the authority doc. Superseded by V3. | See §4 conflict resolution. Do not use for execution decisions. |
| `SOCELLE-WEB/docs/command/V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | V3 authority doc scoped to SOCELLE-WEB. Authority claims overlap with root `/.claude/CLAUDE.md`. | See §4. Root `/.claude/CLAUDE.md` wins monorepo-wide. Use V3 doc for SOCELLE-WEB-specific additions only. |
| `docs/command/V2_TECH_01_AGENT_PROMPT.md` | V2 tech agent prompt — likely deprecated now that V2-TECH is frozen. | Confirm no live references, then archive to `docs/archive/`. |
| `SOCELLE-WEB/.claude/CLAUDE.md` | Web-app-local governance. Declares authority chain: `/.claude/CLAUDE.md → docs/command/* → this file`. | Valid for SOCELLE-WEB-specific rules only. Defer to root `/.claude/CLAUDE.md` on any conflict. |

---

### Deprecated — Do Not Use

| File/Directory | Status |
|----------------|--------|
| `docs/archive/DEPRECATED__*.md` (13 files) | Explicitly archived. Do not reference for execution decisions. |

---

## §2 — MISSING FILE: MASTER_STATUS.md

### Status: DOES NOT EXIST

**Referenced in:** `SOCELLE-WEB/docs/build_tracker.md` line 249 and line 1403:
> "Source of Truth: `/.claude/CLAUDE.md` + `/docs/command/*` + `MASTER_STATUS.md` (repo root)"

**Current state:** No file named `MASTER_STATUS.md` exists anywhere in the repo root or any subdirectory.

### Impact

`build_tracker.md` references this file as a co-equal authority alongside `/.claude/CLAUDE.md` and `docs/command/*`. Agents following the authority chain literally cannot find it, creating a broken reference that could cause confusion about what constitutes ground truth.

### Resolution

Two options — owner must decide:

**Option A (recommended):** Declare `MASTER_STATUS.md` as deprecated/never-created. Remove or correct the reference in `build_tracker.md` (lines 249 and 1403). The current state is fully captured by `/.claude/CLAUDE.md` (§2, §3) and `build_tracker.md` itself. No new file is needed.

**Option B:** Create `MASTER_STATUS.md` at repo root as a one-page living status board (current phase, last 5 commits, P0 debt list, next WO). If created, it becomes Tier 1 and must be maintained every session alongside `build_tracker.md`.

**Until owner decides:** Agents must treat `MASTER_STATUS.md` as non-existent. Do not block on it. Read `build_tracker.md` lines 1–50 as the proxy for current state.

---

## §3 — SINGLE ENTRYPOINT READING ORDER

Every agent session MUST execute this reading sequence before writing any code or making any decision.

```
1. /.claude/CLAUDE.md                                     (lines 1–end, every session)
2. SOCELLE-WEB/docs/build_tracker.md                      (lines 1–50 only — current phase + active WOs)
3. ULTRA_DRIVE_PROMPT.md                                  (IF it exists at repo root — read fully, pick lane)
4. /SOCELLE_MASTER_BUILD_WO.md                            (WO being executed — find its section only)
5. SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md              (WO phase context — scan relevant phase section)
6. /.claude/skills/<relevant-skill>/SKILL.md              (skill(s) mapped to this WO per CLAUDE.md §1)
7. Domain spec (from Tier 2 table above, matching WO domain)
```

Do not read all Tier 2 docs every session. Load only the one(s) relevant to the active WO.

---

## §4 — CONFLICT RESOLUTION RULES

When two documents contradict each other, apply these rules in order. Stop at the first rule that resolves the conflict.

### Rule 1: Tier 0 always wins

`/.claude/CLAUDE.md` overrides every other document in the monorepo, including all Tier 1 and Tier 2 docs. If `build_tracker.md` says to start a WO that `/.claude/CLAUDE.md` §9 says is a STOP CONDITION, halt and resolve with the owner.

### Rule 2: Root governance over local governance

`/.claude/CLAUDE.md` (repo root) overrides `SOCELLE-WEB/.claude/CLAUDE.md` (web-app local).

The local CLAUDE.md explicitly acknowledges this in its own header: "Authority chain: `/.claude/CLAUDE.md` → `docs/command/*` → this file."

### Rule 3: V3 over V1 (version wins)

`SOCELLE-WEB/docs/command/V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` supersedes `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` for any rule where they conflict.

However, both are subordinate to `/.claude/CLAUDE.md` per Rule 1.

### Rule 4: SOCELLE-WEB-local over monorepo-root for web-only decisions

For decisions that are strictly web-app-specific (Vite config, SOCELLE-WEB routes, SOCELLE-WEB migrations), `SOCELLE-WEB/docs/command/*` and `SOCELLE-WEB/.claude/CLAUDE.md` take precedence over `docs/command/*` at the monorepo root, provided they do not conflict with `/.claude/CLAUDE.md`.

### Rule 5: Newer operation doc over older (OPERATION_BREAKOUT.md duplicate)

`SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` is the active version for web WOs. The root `docs/operations/OPERATION_BREAKOUT.md` is the earlier copy. If content conflicts, use the SOCELLE-WEB version for any work inside SOCELLE-WEB. Owner should reconcile or archive the root copy.

### Rule 6: build_tracker.md is the execution ledger, not a policy doc

`build_tracker.md` records what has been done and what is next. It does not override acceptance criteria in `SOCELLE_MASTER_BUILD_WO.md` or tech rules in `/.claude/CLAUDE.md`. If `build_tracker.md` marks a WO DONE but no `docs/qa/verify_<WO_ID>_*.json` exists, the WO is NOT done.

### Rule 7: SITE_MAP.md is superseded by GLOBAL_SITE_MAP.md

`docs/command/GLOBAL_SITE_MAP.md` is the canonical route inventory. `docs/command/SITE_MAP.md` is an earlier version. Use `GLOBAL_SITE_MAP.md` for all routing decisions. Do not delete `SITE_MAP.md` without owner approval — it may contain historical context not yet merged.

---

## §5 — COMPLETE GOVERNANCE DOC INVENTORY

### Tier 0

| Path | Tier | Notes |
|------|------|-------|
| `/.claude/CLAUDE.md` | 0 | Root law |

### Tier 1

| Path | Tier | Notes |
|------|------|-------|
| `SOCELLE-WEB/docs/build_tracker.md` | 1 | Read lines 1–50 every session |
| `/SOCELLE_MASTER_BUILD_WO.md` | 1 | 36+ WOs, acceptance criteria |
| `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md` | 1 | V3 execution sequence |
| `SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md` | 1 | CMS spec |
| `SOCELLE-WEB/docs/command/CMS_CONTENT_MODEL.md` | 1 | Content model |
| `SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md` | 1 | Per-hub journey requirements |
| `/ULTRA_DRIVE_PROMPT.md` | 1 (conditional) | Read when present; signals active corrective sprint |

### Tier 2 — docs/command/ (monorepo)

| Path | Tier |
|------|------|
| `docs/command/AGENT_SCOPE_REGISTRY.md` | 2 |
| `docs/command/AGENT_WORKFLOW_INDEX.md` | 2 |
| `docs/command/AGENT_WORKING_FOLDERS.md` | 2 |
| `docs/command/ASSET_MANIFEST.md` | 2 |
| `docs/command/BRAND_SURFACE_INDEX.md` | 2 |
| `docs/command/GLOBAL_SITE_MAP.md` | 2 |
| `docs/command/HARD_CODED_SURFACES.md` | 2 |
| `docs/command/MIGRATION_INTEGRITY_REPORT.md` | 2 |
| `docs/command/MODULE_BOUNDARIES.md` | 2 |
| `docs/command/MONOREPO_PORT_VERIFICATION.md` | 2 |
| `docs/command/MONOREPO_TOOLING.md` | 2 |
| `docs/command/PORT_BASELINE_MANIFEST.md` | 2 |
| `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` | 2 |
| `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` | 2 |
| `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` | 2 |
| `docs/command/SOCELLE_FIGMA_DESIGN_BRIEF.md` | 2 |
| `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | 2 |
| `docs/command/SOCELLE_MONOREPO_MAP.md` | 2 |
| `docs/command/SOCELLE_RELEASE_GATES.md` | 2 |

### Tier 2 — SOCELLE-WEB/docs/command/

| Path | Tier |
|------|------|
| `SOCELLE-WEB/docs/command/INTEL-MERCH-01.md` | 2 |
| `SOCELLE-WEB/docs/command/SOCELLE_API_UPDATE_PACK.md` | 2 |

### Tier 2 — docs/operations/ and SOCELLE-WEB/docs/operations/

| Path | Tier | Notes |
|------|------|-------|
| `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` | 2 | Prefer over root copy for web WOs |
| `docs/operations/OPERATION_BREAKOUT.md` | 2 | Root copy — reconcile or archive |
| `SOCELLE-WEB/docs/operations/WO_MASTER_PLATFORM_UPGRADE.md` | 2 | |
| `SOCELLE-WEB/docs/operations/SESSION_PROMPTS.md` | 2 | |
| `SOCELLE-WEB/docs/operations/APP_FEATURE_FUNCTIONALITY_GUIDE.md` | 2 | |
| `docs/operations/API_LOGIC_MAP.md` | 2 | |
| `docs/operations/STUDIO_IDEA_MINING_2026.md` | 2 | Context only |

### Tier 2 — docs/ root

| Path | Tier |
|------|------|
| `docs/SKILLS_DEFINITION_SPEC.md` | 2 |
| `docs/API_COMPLIANCE_RESEARCH.md` | 2 |

### Tier 2 — SOCELLE-WEB local governance

| Path | Tier | Notes |
|------|------|-------|
| `SOCELLE-WEB/.claude/CLAUDE.md` | 2 | Web-app-local rules; subordinate to root `/.claude/CLAUDE.md` |

### Tier 3 — Potentially Redundant (review before using)

| Path | Tier | Recommended Action |
|------|------|--------------------|
| `docs/command/SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md` | 3 | Compare to `/.claude/CLAUDE.md`; merge or archive |
| `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | 3 | Superseded by V3; archive candidate |
| `SOCELLE-WEB/docs/command/V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | 3 | Web-scoped V3; subordinate to root CLAUDE.md |
| `docs/command/V2_TECH_01_AGENT_PROMPT.md` | 3 | V2-TECH frozen; archive candidate |
| `docs/command/SITE_MAP.md` | 3 | Superseded by GLOBAL_SITE_MAP.md |

### Deprecated

| Path | Status |
|------|--------|
| `docs/archive/DEPRECATED__*.md` (13 files) | Do not use |

### Missing (broken reference)

| File | Referenced By | Status |
|------|--------------|--------|
| `/MASTER_STATUS.md` | `build_tracker.md` lines 249, 1403 | DOES NOT EXIST — see §2 |

---

## §6 — MAINTENANCE RULES

1. When a new governance doc is created, the author MUST add it to this file before the session ends. Choose the correct tier and add a rationale.
2. When a doc is deprecated or archived, update its row here to Deprecated. Do not delete the row.
3. This file does not replace any of the docs it maps. It is a navigation index, not a policy source.
4. Do not add rules to this file that belong in `/.claude/CLAUDE.md`. Governance additions go in Tier 0. This file only classifies what already exists.
5. When `MASTER_STATUS.md` conflict is resolved (Option A or B per §2), update §2 and the Missing table in §5 accordingly.
