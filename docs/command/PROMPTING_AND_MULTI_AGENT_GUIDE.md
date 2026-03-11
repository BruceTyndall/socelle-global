# PROMPTING RECOMMENDATIONS & MULTI-AGENT USAGE

**Version:** 2026-03-13  
**Authority:** `/.claude/CLAUDE.md` §0 → `docs/command/SESSION_START.md` → this file (reference only)  
**Purpose:** How to prompt agents so they don’t get lost; how multi-agents stay aligned; confirmation of what’s updated with the new plan.

---

## 1. PROMPTING RECOMMENDATIONS (so agents don’t get lost)

### 1.1 Start every prompt with the entrypoint

**Recommendation:** Begin any task or multi-agent brief with:

- “Read first, in order: `docs/command/SESSION_START.md`, then the three-file chain in that file (CLAUDE.md → build_tracker.md lines 1–50 → MASTER_STATUS.md top sections). Then [your task].”

This forces a single, repeatable read order so agents don’t infer authority from the wrong doc.

### 1.2 Always tie work to a WO ID

**Recommendation:** Include in the prompt:

- “Do not start work until you have confirmed the WO ID exists in `SOCELLE-WEB/docs/build_tracker.md`. If the work has no WO, stop and state which WO should be added.”

Prevents agents from inventing scope or building “just in case” without a tracked WO.

### 1.3 Require proof, not self-certification

**Recommendation:** Add:

- “Before marking any WO complete: run the skill(s) listed in CLAUDE.md §1 for this WO group; write a verification JSON to `SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json`; do not write PASS/DONE/COMPLETE/✅ for your own work without that artifact.”

Reduces false “done” claims and keeps completion evidence in one place.

### 1.4 Call out conflicts explicitly

**Recommendation:** When multiple docs might apply, say:

- “If `build_tracker.md`, `MASTER_STATUS.md`, or any command doc disagrees with another, apply the conflict rules in `docs/command/SOURCE_OF_TRUTH_MAP.md` §4 (Tier 0 wins, then build_tracker + verify JSON for DONE).”

So agents resolve conflicts by hierarchy instead of picking a random doc.

### 1.5 One WO per session unless owner approves

**Recommendation:** State:

- “Execute one WO per session unless the owner explicitly approves parallelism. Dependencies and order are in `SOCELLE-WEB/docs/ops/SPLIT_EXECUTION_CONTRACT.md`.”

Keeps sessions bounded and ordered.

---

## 2. HOW MULTI-AGENTS ARE USED (and stay aligned)

### 2.1 Single source of truth for execution

- **WO status and “what’s next”:** `SOCELLE-WEB/docs/build_tracker.md` (lines 1–50 for current state).  
- **What “done” means:** `SOCELLE_MASTER_BUILD_WO.md` + `SPLIT_EXECUTION_CONTRACT.md` for the next 5 WOs.  
- **Acceptance proof:** `SOCELLE-WEB/docs/qa/verify_<WO_ID>_*.json`.  

All agents (web, command, backend, marketing, etc.) must:

1. Confirm the WO they’re doing exists in `build_tracker.md`.  
2. Not invent WO IDs.  
3. Update `build_tracker.md` (append-only, status + verify path) when a WO is completed.  
4. Write verification JSON to `docs/qa/` before claiming DONE.

### 2.2 Shared read order (no agent is “special”)

Every workflow under `.agents/workflows/*` should use the **same** preconditions:

1. `/.claude/CLAUDE.md`  
2. `docs/command/SESSION_START.md` (or the 3-file chain it defines)  
3. `SOCELLE-WEB/docs/build_tracker.md` (at least lines 1–50)  
4. `SOCELLE_MASTER_BUILD_WO.md` (section for the WO being executed)  
5. Domain docs only as needed (per SOURCE_OF_TRUTH_MAP Tier 2).

So no agent starts from a different “truth” than another.

### 2.3 Scoped by allowed/forbidden paths

- Each agent has **allowed paths** and **forbidden paths** in `docs/command/AGENT_SCOPE_REGISTRY.md`.  
- Cross-boundary work (e.g. Web Agent needs a migration) is **handoff only**: create a handoff artifact, do not touch the other agent’s paths.  
- This prevents agents from stepping on each other’s scope and keeps “who updates what” clear.

### 2.4 Handoff and escalation

- Workflows (e.g. `web_agent.md`, `command_center_agent.md`) define **handoff protocol**: when to hand off to Backend, SEO, Command, etc., and what artifact to pass.  
- **Stop conditions** are explicit (e.g. “No active WO in build_tracker — do not build”).  
- So multi-agent runs stay coordinated: one agent doesn’t build while another is responsible for the same WO, and unknowns are escalated instead of guessed.

### 2.5 Review and “not getting lost”

- **Before review:** Any agent that produced code must have run the required skills and produced `verify_<WO_ID>_*.json`; the reviewer (human or another agent) checks that artifact and `build_tracker.md` update.  
- **During review:** Use `SOURCE_OF_TRUTH_MAP.md` for conflict resolution and `SESSION_START.md` for “did they follow read order and proof rules?”  
- **Split/audit work:** Use `SPLIT_AUDIT__TRUTH_VALIDATION.md`, `SPLIT_EXECUTION_CONTRACT.md`, and `SPLIT_WO_CLUSTER.md` so review is against the same plan (next 5 WOs, then SPLIT-* packaging).

---

## 3. CONFIRMATION: WHAT’S UPDATED VS WHAT’S PENDING

### 3.1 Already updated with the new plan (2026-03-13)

| Document | What was updated |
|----------|-------------------|
| `/.claude/CLAUDE.md` | §0 points to `SESSION_START.md` first; 3-file chain is CLAUDE → build_tracker → MASTER_STATUS. |
| `docs/command/SESSION_START.md` | Mandatory read order is the 3-file chain + WO-specific reads; Tier 0/1 list; no-WO-ID rule; proof requirements; stop conditions. |
| `docs/command/SOURCE_OF_TRUTH_MAP.md` | Tier 0/1/2/Deprecated; single entrypoint reading order; conflict rules (§4); MASTER_STATUS in Tier 1; updated 2026-03-13. |
| `docs/ops/AUDIT_SPRINT_SUMMARY.md` | Phase/gate table uses EXECUTION_STATE_AUDIT + build_tracker + MASTER_STATUS; next 5 WOs; split plan; DOC-GOV-01. |
| `docs/ops/EXECUTION_STATE_AUDIT.md` | Command evidence; full WO truth table; P0/P1/P2 gates; references SOURCE_OF_TRUTH_MAP and SESSION_START. |
| `SOCELLE-WEB/docs/ops/SPLIT_AUDIT__LOST_WO_REPORT.md` | Lost-WO definition; potentially lost vs confirmed not lost; legacy ID mapping; truth statement. |
| `SOCELLE-WEB/docs/ops/SPLIT_AUDIT__WO_COVERAGE_MATRIX.md` | Coverage by area (CMS, Intelligence, Merch, Feeds, Search, Events, SEO, Payments, Admin, Education, CRM, Commerce, Multi-platform). |
| `SOCELLE-WEB/docs/ops/SPLIT_PLAN__PHASED_EXECUTION.md` | Split mode B; next 10 sessions; one WO per session; blocked items; SPLIT-INTEL-01, SPLIT-CRM-01. |
| `SOCELLE-WEB/docs/command/SPLIT_WO_CLUSTER.md` | SPLIT-INTEL/CRM/EDU/COMMERCE/ADMIN + SPLIT-SALES-01 + SPLIT-MKT-01; scope and proof pack per WO. |
| `SOCELLE-WEB/docs/ops/SPLIT_AUDIT__TRUTH_VALIDATION.md` | “No WOs lost” proof; legacy ID → superseding WO mapping; remaining gaps WO-backed. |
| `SOCELLE-WEB/docs/ops/SPLIT_EXECUTION_CONTRACT.md` | Next 5 WOs locked with deps, acceptance criteria, proof pack, stop conditions; one WO per session. |
| `SOCELLE-WEB/docs/ops/DOC_CONFLICT_PATCH_PLAN.md` | MASTER_STATUS, MONOREPO_MAP, MODULE_BOUNDARIES, API_LOGIC_MAP, WORK_ORDER_BACKLOG patches; DOC-GOV-01 proposal. |
| `SOCELLE-WEB/docs/ops/PRODUCT_POWER_AUDIT.md` | Top 10 journeys; power vs shallow; IDEA-MINING code vs docs; proceed-with-plan + SPLIT-SALES/MKT registered. |
| `SOCELLE-WEB/docs/command/DESIGN_AND_GROWTH_GOVERNANCE.md` | Locked vs tunable; instrumentation required; “now is the time” for strategic design within governance. |

### 3.2 Not yet updated (pending DOC-GOV-01 or owner pass)

| Document | Current state | Required change |
|----------|----------------|-----------------|
| `SOCELLE-WEB/MASTER_STATUS.md` | Lines 5–6 say authority is `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`. | Patch in `DOC_CONFLICT_PATCH_PLAN.md` §1: point authority to CLAUDE + SOURCE_OF_TRUTH_MAP; clarify “status snapshot.” |
| `docs/command/SOCELLE_MONOREPO_MAP.md` | Header says V1 wins. | Patch in DOC_CONFLICT_PATCH_PLAN §2.1: authority = CLAUDE + SOURCE_OF_TRUTH_MAP. |
| `docs/command/MODULE_BOUNDARIES.md` | Header says V1 master. | Patch in DOC_CONFLICT_PATCH_PLAN §2.2: same authority chain. |
| `docs/operations/API_LOGIC_MAP.md` | No “superseded” note for API-WO-* IDs. | Patch in DOC_CONFLICT_PATCH_PLAN §3.1: add banner and authority note. |
| `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md` | PROPOSED backlog; no “not execution authority” banner. | Patch in DOC_CONFLICT_PATCH_PLAN §3.2: add banner. |
| `docs/command/AGENT_SCOPE_REGISTRY.md` | Lines 1–2, 23: “V1 … single source of truth” and “Read V1 before any work.” | Update to: authority = `/.claude/CLAUDE.md` → `docs/command/SOURCE_OF_TRUTH_MAP.md`; read `SESSION_START.md` and the 3-file chain before any work. |
| `.agents/workflows/*.md` (e.g. web_agent, command_center_agent) | Preconditions list `/docs/command/SITE_MAP.md` and others; some say “build_tracker” but not “SESSION_START first.” | Add SESSION_START.md (or 3-file chain) as step 1 in “Required reads”; keep build_tracker as WO source. Optionally point to SOURCE_OF_TRUTH_MAP for conflict resolution. |

### 3.3 Summary

- **Updated with the new plan:** CLAUDE §0, SESSION_START, SOURCE_OF_TRUTH_MAP, all new split/audit/execution contract and product power/design governance docs; AUDIT_SPRINT_SUMMARY and EXECUTION_STATE_AUDIT.  
- **Not yet updated:** MASTER_STATUS, SOCELLE_MONOREPO_MAP, MODULE_BOUNDARIES, API_LOGIC_MAP, WORK_ORDER_BACKLOG, AGENT_SCOPE_REGISTRY, and `.agents/workflows` preconditions. The exact patch text for the first five is in `DOC_CONFLICT_PATCH_PLAN.md`; executing **DOC-GOV-01** (and optionally a short pass on AGENT_SCOPE_REGISTRY + workflows) will align them all with the new plan.

---

## 4. QUICK REFERENCE FOR PROMPTING

Use this when you kick off a session or multi-agent run:

1. **“Read `docs/command/SESSION_START.md` and the three-file chain (CLAUDE.md → build_tracker.md lines 1–50 → MASTER_STATUS.md top). Then [task].”**  
2. **“Only work that has a WO ID in `SOCELLE-WEB/docs/build_tracker.md`. If none, stop and say which WO to add.”**  
3. **“On completion, run the skills in CLAUDE.md §1 for this WO; write `SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json`; do not mark DONE without it.”**  
4. **“If docs conflict, apply `docs/command/SOURCE_OF_TRUTH_MAP.md` §4 (Tier 0 wins; then build_tracker + verify JSON for DONE).”**  
5. **“One WO per session unless I approve otherwise. Order and deps: `SOCELLE-WEB/docs/ops/SPLIT_EXECUTION_CONTRACT.md`.”**

That keeps agents on the same truth, same WO source, same proof standard, and same execution order so they don’t get lost during review or when multiple agents are used together.
