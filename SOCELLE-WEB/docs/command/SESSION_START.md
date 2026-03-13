# SESSION START — SOCELLE AGENT REFERENCE (SINGLE ENTRYPOINT)

**Version:** 2026-03-13 (AUDIT + IDEA MINING + AGENT UPSKILL)  
**Authority:** `/.claude/CLAUDE.md` §0 — mandatory first read every session.

---

## 1. MANDATORY READ CHAIN (every session, no exceptions)

**Three-file chain (always first):**

| Step | File | What to read |
|------|------|--------------|
| 1 | `/.claude/CLAUDE.md` | Full file — governance, stop conditions, launch gates |
| 2 | `SOCELLE-WEB/docs/build_tracker_v2.md` | Lines 1–50 — current phase, active WOs, last commit |
| 3 | `SOCELLE-WEB/MASTER_STATUS.md` | Top sections — build health, LIVE/DEMO mix, data/API state |

**Then, for the WO you are executing:**

| Step | File | What to read |
|------|------|--------------|
| 4 | `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md` | Single plan — phase order, WO registry, non-negotiables. Status = build_tracker + verify_*.json only. |
| 5 | `SOCELLE_MASTER_BUILD_WO.md` or `V3_BUILD_PLAN.md` | Full acceptance criteria for your WO (Master WO sections 2–9; V3 §8 for CMS substeps) |
| 6 | `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` | Banned terms, IA rules, commerce boundary |
| 7 | `/.claude/skills/<relevant-skill>/SKILL.md` | Skill for your WO group (see §7 below) |

Read in order **before writing any code, running any command, or making any decision.**

---

## 2. DAILY STANDUP TEMPLATE

```
WO_ID:         [e.g. CMS-WO-07]
LAST_COMMIT:   [e.g. d1442d3]
BLOCKER:       [NONE | describe clearly]
NEXT_ACTION:   [first concrete action — file path + what changes]
TIME_ESTIMATE: [e.g. 45 min]
```

---

## 3. NO WO ID = NO WORK

- Every code change, migration, and deployment must map to a **WO ID in `build_tracker_v2.md`**.
- WO IDs not in `build_tracker_v2.md` are invalid. Do not invent IDs.
- If work is not in `build_tracker_v2.md`, stop and add a WO entry before proceeding.
- Debt fixes use DEBT-style IDs (e.g. `DEBT-TANSTACK-REAL-6`) — they must also appear in `build_tracker_v2.md`.

---

## 4. PROOF REQUIREMENTS (no DONE without these)

| Requirement | Rule |
|-------------|------|
| TypeScript | `npx tsc --noEmit` → exit 0 before marking any WO complete |
| Build | `npm run build` → exit 0 before marking any WO complete |
| Verification JSON | Must exist at `SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json` with `overall: "PASS"` |
| Required skill outputs | Run all skills listed in §7 for the work type; evidence in verify_*.json `skills_run` / `results` |
| Who certifies | The BUILD agent **cannot** write PASS/DONE/COMPLETE/✅ for their own work |
| JSON format | `{ wo_id, timestamp, skills_run, results: { skill: { status, failures, evidence } }, overall }` |
| Location | All QA artifacts → `SOCELLE-WEB/docs/qa/` |
| Execution truth | build_tracker + verify_*.json (not older plans or specs) |

**STOP CONDITION:** Writing "PASS" without a corresponding `docs/qa/verify_*.json` = §9 violation 11. Halt immediately.

---

## 5. TIER 0 AND TIER 1 DOCUMENTS

**Tier 0 — Single law:** `/.claude/CLAUDE.md`

**Tier 1 — Read every session (slices):**
- `SOCELLE-WEB/docs/build_tracker_v2.md` (lines 1–50)
- `SOCELLE-WEB/MASTER_STATUS.md` (top sections)
- `SOCELLE_MASTER_BUILD_WO.md` (WO section you are executing)
- `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md`
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`

---

## 6. AGENT EXECUTION RULES

- **One WO per session** unless the owner explicitly authorizes parallelism.
- Stay within the WO scope and allowed paths per `docs/command/AGENT_SCOPE_REGISTRY.md`.
- If blocked, note in build_tracker and stop — do not invent work.
- **Multi-agent shared ledger:** All agents read and update the same `build_tracker_v2.md`. No agent-specific trackers. No WO marked DONE without proof pack (tsc + build + verify_*.json + required skills). Conflicts: Tier 0 wins; then execution truth = build_tracker_v2 + verify_*.json (not older plans).

---

## 7. QUICK SKILL REFERENCE

| Work type | Skills to run |
|-----------|---------------|
| Any page edit | `hub-shell-detector` → `live-demo-detector` |
| Token / design | `token-drift-scanner` → `design-audit-suite` → `design-lock-enforcer` |
| Data / hook | `dev-best-practice-checker` → `hook-consolidator` |
| DB migration | `rls-auditor` → `schema-db-suite` → `migration-validator` |
| Pre-completion | `build-gate` → `banned-term-scanner` → `proof-pack` |
| Intelligence / feed | `intelligence-hub-api-contract` → `feed-pipeline-checker` → `intelligence-merchandiser` |

All skills at `/.claude/skills/`. Run ALL required skills — do not skip.

---

## 8. STOP CONDITIONS (top 5 — halt immediately)

1. Shell page about to ship (no live data, no states, no CRUD)
2. Banned term in user-facing copy
3. Raw `useEffect` + `supabase.from()` in new code (use TanStack Query)
4. Self-certification without `docs/qa/verify_*.json`
5. `font-serif` on public pages OR hardcoded hex outside Pearl Mineral V2

Full list: `/.claude/CLAUDE.md` §9.

---

## 9. PROMPTING & MULTI-AGENT

See **`docs/command/PROMPTING_AND_MULTI_AGENT_GUIDE.md`** for how to prompt agents and how multi-agents stay aligned.

---

*End of SESSION_START. Canonical copy may also live at `docs/command/SESSION_START.md` (same content).*
