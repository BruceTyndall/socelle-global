# SESSION START — SOCELLE AGENT REFERENCE
**Version:** 2026-03-13 | **Authority:** `/.claude/CLAUDE.md` §0

---

## 1. MANDATORY READ ORDER (every session, no exceptions)

| Step | File | What to read |
|------|------|-------------|
| 1 | `SOCELLE-WEB/docs/build_tracker.md` | Lines 1–50 only — current phase, active WOs, last commit |
| 2 | `SOCELLE_MASTER_BUILD_WO.md` | Current build phase + acceptance criteria for your WO |
| 3 | `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md` | WO execution spec for the phase you are in |
| 4 | `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` | Banned terms, IA rules, commerce boundary |
| 5 | `/.claude/skills/<relevant-skill>/SKILL.md` | Skill for your WO group (see §7 below) |

Read these files **before writing any code, running any command, or making any decision.**

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

## 3. NO WORK WITHOUT WO ID

- **Every code change, migration, and deployment must map to a WO ID in `build_tracker.md`.**
- WO IDs not present in `build_tracker.md` are invalid. Do not invent IDs.
- If work is not in `build_tracker.md`, stop and add a WO entry before proceeding.
- Debt fixes use DEBT-style IDs (e.g. `DEBT-TANSTACK-REAL-6`) — these must also appear in `build_tracker.md`.

---

## 4. PROOF REQUIREMENTS

| Requirement | Rule |
|-------------|------|
| TypeScript | `npx tsc --noEmit` → exit 0 before marking any WO complete |
| Build | `npm run build` → exit 0 before marking any WO complete |
| Verification JSON | Must exist at `SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json` |
| Who certifies | The BUILD agent **cannot** write PASS/DONE/COMPLETE/✅ for their own work |
| JSON format | `{ wo_id, timestamp, skills_run, results: { skill: { status, failures, evidence } }, overall }` |
| Location | All QA artifacts → `SOCELLE-WEB/docs/qa/` (never root, never `docs/command/`) |

**STOP CONDITION:** Writing "PASS" without a corresponding `docs/qa/verify_*.json` = §9 violation 11. Halt immediately.

---

## 5. TIER 0 + TIER 1 DOCUMENTS

**Tier 0 — Single Law (governs all agent behavior):**
- `/.claude/CLAUDE.md`

**Tier 1 — Read every session (lines 1–50 for build_tracker):**
- `SOCELLE-WEB/docs/build_tracker.md`
- `SOCELLE_MASTER_BUILD_WO.md`
- `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md`
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`

---

## 6. STOP CONDITIONS (top 5 — halt immediately)

| # | Condition |
|---|-----------|
| 1 | Shell page about to ship (no live data, no states, no CRUD) |
| 2 | Banned term in user-facing copy (`unlock`, `AI-powered`, `seamless`, etc.) |
| 3 | Raw `useEffect` + `supabase.from()` in new code (use TanStack Query) |
| 4 | Self-certification without `docs/qa/verify_*.json` artifact |
| 5 | `font-serif` on public pages OR hardcoded hex outside Pearl Mineral V2 tokens |

Full list: `/.claude/CLAUDE.md §9` (13 conditions total).

---

## 7. QUICK SKILL REFERENCE

| Work type | Skills to run |
|-----------|--------------|
| Any page edit | `hub-shell-detector` → `live-demo-detector` |
| Token / design change | `token-drift-scanner` → `design-audit-suite` → `design-lock-enforcer` |
| Data fetching / hook change | `dev-best-practice-checker` → `hook-consolidator` |
| DB migration | `rls-auditor` → `schema-db-suite` → `migration-validator` |
| Dependency change | `dependency-scanner` → `build-gate` |
| Banned term sweep | `banned-term-scanner` |
| LIVE/DEMO compliance | `live-demo-detector` |
| Test writing | `test-runner-suite` → `e2e-test-runner` |
| Pre-completion of any WO | `build-gate` → `banned-term-scanner` → `proof-pack` |
| Intelligence / feed WO | `intelligence-hub-api-contract` → `feed-pipeline-checker` → `intelligence-merchandiser` |

All skills live at `/.claude/skills/`. Run ALL required skills — do not skip based on assumed scope.
