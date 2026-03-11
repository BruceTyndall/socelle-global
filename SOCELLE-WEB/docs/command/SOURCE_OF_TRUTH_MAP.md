# SOURCE OF TRUTH MAP — SOCELLE MONOREPO

**Created:** 2026-03-10  
**Updated:** 2026-03-13 (AUDIT + IDEA MINING + AGENT UPSKILL — commit anchor d1442d3)  
**Purpose:** Single reference that resolves authority conflicts, defines reading order, and classifies every governance/spec/tracker doc in the monorepo.  
**Authority:** DOC GOVERNANCE AGENT deliverable. Update whenever a new governance doc is added, superseded, or deprecated.

---

## §1 — AUTHORITY TIERS

### Tier 0 — Law of the Land (1 file)

| File | Description |
|------|-------------|
| `/.claude/CLAUDE.md` | Root governance prompt. Controls all agent behavior monorepo-wide. §0–§16: reading order, skills, tech stack, design system, stop conditions, launch non-negotiables. |

**Rationale:** Declares itself "the root governance prompt." Every other doc references it. Tier 0 wins on any conflict.

---

### Tier 1 — Execution Authority (read every session, top-of-file slices)

| File | Description | Why Tier 1 |
|------|-------------|------------|
| `SOCELLE-WEB/docs/build_tracker.md` | Live WO execution log. Active phase, freeze directives, debt queue, proof artifact log. | Lines 1–50 = current state. Updated every session. **Execution status (DONE/OPEN/PARTIAL) lives here + verify_*.json only.** |
| `SOCELLE-WEB/MASTER_STATUS.md` | Status board: build health, hub readiness, LIVE/DEMO mix, data/API state. | Single-page "what users experience" snapshot. |
| `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md` | **Single plan document.** Phase order (1–9), WO registry (scope one-liner), non-negotiables, stop conditions. | **One place for "what we're building" and "in what order."** Supersedes V3_BUILD_PLAN and SOCELLE_MASTER_BUILD_WO for phase/WO list. |
| `/SOCELLE_MASTER_BUILD_WO.md` | Full acceptance criteria per WO (sections 2–9). | Use for **detail** only; phase order = CONSOLIDATED_BUILD_PLAN. |
| `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md` | WO-CMS-01..06 **substep** specs (§8). | Use for **CMS WO detail** only; phase order = CONSOLIDATED_BUILD_PLAN. |
| `SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md` | CMS tables, admin routes, PageRenderer, block registration. | Required before any CMS-WO. |
| `SOCELLE-WEB/docs/command/CMS_CONTENT_MODEL.md` | Block types, content types, space definitions. | Required before content/CMS-adjacent WO. |
| `SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md` | Per-hub journey definitions and E2E test requirements. | Required before any hub WO. |
| `docs/command/SESSION_START.md` | Single entrypoint: mandatory read order, standup template, proof rules, Tier 0/1 list. | Every session starts here per CLAUDE §0. |
| `ULTRA_DRIVE_PROMPT.md` (repo root, if present) | Active corrective sprint. When present, overrides normal WO priority. | Read first after Tier 0 when it exists. |

---

### Tier 2 — Supporting Specs (read when executing relevant WO)

Do not read all every session. Load only when WO touches domain.

| File | Domain | When to Read |
|------|--------|--------------|
| `docs/command/AGENT_SCOPE_REGISTRY.md` | Agent definitions, skills, 17 agents | Before assigning work or extending skills |
| `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` | Banned terms, design locks, §9 stop conditions | Before any user-facing copy |
| `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` | Tier definitions, feature gates | Payment/credit/entitlement WOs |
| `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | Figma-to-code mapping | Component implementation from design |
| `docs/command/GLOBAL_SITE_MAP.md` | Canonical route map | Routing, SEO, shell detection |
| `docs/command/MODULE_BOUNDARIES.md` | Module boundaries, import rules | Refactoring, new feature placement |
| `docs/command/SOCELLE_MONOREPO_MAP.md` | Monorepo structure, package boundaries | Navigating repo, split packaging |
| `SOCELLE-WEB/docs/command/INTEL-MERCH-01.md` | Intelligence merchandising, feed ordering | FEED-WO, INTEL-WO |
| `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` | WO sub-task decomposition | When WO has sub-tasks |
| `docs/operations/API_LOGIC_MAP.md` | API logic, edge function routing | Edge function or API WOs |
| `SOCELLE-WEB/docs/qa/` | Verification JSON artifacts | After completing any WO — proof required here |
| `SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md` | Product Power per-app scope, acceptance, proof pack, deps, effort | Product Power WOs; competitive upgrade layer |
| `SOCELLE-WEB/docs/ops/PRODUCT_POWER_AUDIT.md` | Competitive research, table-stakes vs moat, "not the easy way" | Cited by APP_BY_APP; idea mining |
| `SOCELLE-WEB/docs/ops/AUDIT_SPRINT_SUMMARY.md` | Next 3 WOs, pre-coding deliverables, split gate, ROI-first | Sprint context; next-WO picks |
| `SOCELLE-WEB/docs/ops/EXECUTION_STATE_AUDIT.md` | DONE/OPEN/BLOCKED evidence (audit snapshot) | Supplements build_tracker |
| `SOCELLE-WEB/docs/ops/DOC_CONFLICT_PATCH_PLAN.md` | Exact patch text for MASTER_STATUS, MONOREPO_MAP, etc. | DOC-GOV-01 execution |
| `SOCELLE-WEB/docs/ops/DOC_INVENTORY_REPORT.md` | Duplicates, demotion plan, reduced read set, WO-scoped read | Doc governance |

(Full Tier 2 list exists in root `docs/command/SOURCE_OF_TRUTH_MAP.md`; this is the reduced set for daily use.)

---

### Tier 3 — Potentially Redundant (cross-check with Tier 0/1)

| File | Issue | Action |
|------|-------|--------|
| `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | V1; superseded by V3 and root CLAUDE | Do not use for execution. |
| `SOCELLE-WEB/docs/command/V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | Overlaps root CLAUDE | Root CLAUDE wins. Use for SOCELLE-WEB-only additions. |
| `docs/command/SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md` | Likely snapshot of CLAUDE | Compare to CLAUDE; archive if duplicate. |

---

### Deprecated — Do Not Use

| File/Directory | Status |
|----------------|--------|
| `docs/archive/DEPRECATED__*.md` | Explicitly archived. Do not reference for execution. |

---

## §2 — SINGLE ENTRYPOINT READING ORDER

Every session MUST follow this order before writing code or making decisions.

```
1. docs/command/SESSION_START.md                    (single entrypoint — read first)
2. /.claude/CLAUDE.md                               (full file)
3. SOCELLE-WEB/docs/build_tracker.md                (lines 1–50 — execution status lives here only)
4. SOCELLE-WEB/MASTER_STATUS.md                     (top section — build health snapshot)
5. SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md (phase order, WO registry, non-negotiables)
6. SOCELLE_MASTER_BUILD_WO.md or V3_BUILD_PLAN.md   (full acceptance criteria for your WO — see §4)
7. /.claude/skills/<relevant-skill>/SKILL.md       (per CLAUDE §1)
8. Domain spec from Tier 2 (only if WO touches that domain)
```

---

## §3 — CONFLICT RESOLUTION RULES

Apply in order; stop at first match.

1. **Tier 0 wins.** `/.claude/CLAUDE.md` overrides all others. If build_tracker says start a WO that CLAUDE §9 forbids, halt.
2. **Root over local.** `/.claude/CLAUDE.md` overrides `SOCELLE-WEB/.claude/CLAUDE.md`.
3. **V3 over V1.** V3 doc supersedes V1 for conflicts; both are below Tier 0.
4. **Execution truth = build_tracker + verify_*.json (not older plans).** WO status "DONE" only if build_tracker row exists and `SOCELLE-WEB/docs/qa/verify_<WO_ID>_*.json` exists with overall PASS. Older plans/specs do not override build_tracker or verify artifacts. No self-certification.
5. **SITE_MAP.md superseded by GLOBAL_SITE_MAP.md.** Use GLOBAL_SITE_MAP for routing/SEO.
6. **OPERATION_BREAKOUT duplicate.** Prefer `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` for web WOs.

---

## §4 — WHERE EVERY IMPORTANT DETAIL LIVES (NOTHING LOST)

**Nothing is deleted.** The consolidated plan and this map only route you to the right doc. Every important detail below must remain findable and is explicitly referenced here.

| What you need | Where it lives | Path / section |
|---------------|----------------|-----------------|
| **Phase order and WO list** | CONSOLIDATED_BUILD_PLAN | §2, §3 |
| **Execution status (DONE/OPEN/PARTIAL)** | build_tracker + verify_*.json | build_tracker lines 1–50 + OPERATION BREAKOUT V2 table + Product Power table + P0/P1/P2 queues; `docs/qa/verify_<WO_ID>_*.json` |
| **Full acceptance criteria per WO** | SOCELLE_MASTER_BUILD_WO | Sections 2–9 (CMS, Intelligence, Hubs, Platform, Multi-Platform, Launch); per-WO scope, owner, depends on, acceptance |
| **CMS WO substeps (WO-CMS-01..06)** | V3_BUILD_PLAN | §8 (exact steps, skills to run) |
| **V2-TECH frozen / scope clarification** | V3_BUILD_PLAN | §0 (do not touch V2-INTEL/HUBS/MULTI/LAUNCH until WO-CMS complete) |
| **CMS vision, table set, RLS model** | V3_BUILD_PLAN | §1–§2 (vision; 8 cms_* tables + purposes; RLS per table) |
| **All-hubs CMS requirements (per hub)** | V3_BUILD_PLAN | §3 (Intelligence, Jobs, CRM, Education, Marketing, Sales, Commerce, Admin, Studio, CMS Hub — what each reads from CMS) |
| **Persona success criteria, V3 vs Previous** | V3_BUILD_PLAN | §4 (operator/provider/brand/student outcomes; execution expectations; content management comparison) |
| **CMS non-negotiables and CMS stop conditions** | V3_BUILD_PLAN | §6, §7 |
| **Required skill runs before CMS launch / HALT** | V3_BUILD_PLAN | §10 (design-audit-suite, copy-quality-suite, schema-db-suite, etc.; full HALT list) |
| **Completion state snapshot (COMPLETE/PARTIAL/TODO)** | SOCELLE_MASTER_BUILD_WO | §0.1 (audit snapshot; build_tracker is live truth) |
| **Frozen milestones, codebase metrics** | SOCELLE_MASTER_BUILD_WO | §0 (V2-TECH, V2-COMMAND, V3 Phase 0; pages/components/hooks/routes/tables counts) |
| **OPEN DEBT (pro-*, Sentry, useEffect+supabase, tests, shells)** | SOCELLE_MASTER_BUILD_WO | §0.1 OPEN DEBT table; also build_tracker P0/P1/P2 queues |
| **WO sub-task decomposition** | OPERATION_BREAKOUT | When a WO has sub-tasks; sub-WO definitions |
| **Product Power per-app (scope, acceptance, proof pack, deps, effort)** | APP_BY_APP_IDEA_MINING_UPGRADES | Per-app sections; Product Power WOs table in build_tracker |
| **Competitive research, table-stakes vs moat, "not the easy way"** | PRODUCT_POWER_AUDIT | §1–§4; cited by APP_BY_APP |
| **Next 3 WOs, pre-coding deliverables, split gate, ROI-first** | AUDIT_SPRINT_SUMMARY | §7–§10 |
| **DONE/OPEN/BLOCKED evidence (audit)** | EXECUTION_STATE_AUDIT | Supplements build_tracker with phase evidence |
| **CMS tables, admin routes, PageRenderer, block registration** | CMS_ARCHITECTURE | Tier 1 — before any CMS-WO |
| **Block types, content types, space definitions** | CMS_CONTENT_MODEL | Tier 1 — before content/CMS-adjacent WO |
| **Per-hub journey definitions, E2E test requirements** | JOURNEY_STANDARDS | Tier 1 — before any hub WO |
| **Banned terms, design locks, §9 stop conditions** | SOCELLE_CANONICAL_DOCTRINE | Tier 2 — before user-facing copy |
| **Tier definitions, feature gates** | SOCELLE_ENTITLEMENTS_PACKAGING | Tier 2 — payment/entitlement WOs |
| **Canonical route map** | GLOBAL_SITE_MAP | Tier 2 — routing, SEO, shell |
| **Intelligence merchandising, feed ordering** | INTEL-MERCH-01 | Tier 2 — FEED-WO, INTEL-WO |
| **Doc conflict patch text** | DOC_CONFLICT_PATCH_PLAN | Exact patches for MASTER_STATUS, MONOREPO_MAP, etc. |
| **Doc duplicates, demotion plan, reduced read set** | DOC_INVENTORY_REPORT | §3–§5 |

**Rule:** If a detail is important for execution, it must appear in this table or in CONSOLIDATED_BUILD_PLAN §1 / §4 / §7. When in doubt, check this section (§4) first.

---

## §5 — DOCUMENTS REQUIRING PATCH (do not patch in this task)

The following have authority conflicts that must be patched in a separate DOC-GOV-01 (or owner) pass:

| Document | Conflict | Required patch (identify only) |
|----------|----------|---------------------------------|
| `SOCELLE-WEB/MASTER_STATUS.md` | Lines 5–6: "Authority: V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH" | Point authority to `/.claude/CLAUDE.md` and SOURCE_OF_TRUTH_MAP; clarify file is status snapshot, not execution law. |
| `docs/command/SOCELLE_MONOREPO_MAP.md` | Header claims V1 master | Set authority to CLAUDE + SOURCE_OF_TRUTH_MAP. |
| `docs/command/MODULE_BOUNDARIES.md` | Header claims V1 master | Same authority chain. |
| `docs/operations/API_LOGIC_MAP.md` | No "superseded" note for API-WO-* | Add banner: API-WO-* IDs superseded by CTRL/FEED/PAY/INTEL/API-DEPLOY as in build_tracker. |
| `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md` | Second WO backlog | Add banner: "Not execution authority. Use build_tracker.md." |
| `docs/command/AGENT_SCOPE_REGISTRY.md` | "Read V1 before any work" | Update to: read SESSION_START + 3-file chain; authority = CLAUDE + SOURCE_OF_TRUTH_MAP. |

*§4 above = "Where every important detail lives." Update §4 when adding or moving critical content.*

---

*End of SOURCE_OF_TRUTH_MAP. Evidence: commit anchor d1442d3; mandatory reads CLAUDE.md, build_tracker.md lines 1–120, MASTER_STATUS.md top + Source of Truth section.*
