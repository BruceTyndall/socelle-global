---
name: operations-optimizer
description: "Audits team capacity, generates prioritized task roadmaps, and creates operational runbooks for SOCELLE platform development. Use this skill whenever someone asks to plan a sprint, prioritize a backlog, create a development roadmap, assess team capacity, write a runbook, plan disaster recovery, or organize work items. Also triggers on: 'prioritize tasks', 'sprint plan', 'capacity planning', 'development roadmap', 'runbook', 'task priority', 'what should we build next', 'work order planning'. This skill ensures all work planning references build_tracker.md as the sole execution authority."
---

# Operations Optimizer

Generates prioritized development roadmaps and operational runbooks grounded in SOCELLE's governance docs. All task planning flows through `build_tracker.md` as the sole execution authority — this skill never invents WO IDs or creates parallel plans (AGENTS.md §D, §H).

## Why This Matters

SOCELLE has 241 routes, 31 edge functions, 250+ migrations, and multiple portals. Without disciplined prioritization, work scatters across low-impact tasks while critical-path items stall. This skill enforces a structured approach: assess what exists, identify gaps against the canonical plan, and output an actionable sequence.

## Step 1: Assess Current State

```bash
echo "=== CURRENT EXECUTION STATE ==="
cd SOCELLE-WEB

# Wave status from build_tracker
echo "Build tracker summary:"
grep -c "COMPLETE\|IN_PROGRESS\|PENDING\|BLOCKED" docs/build_tracker.md 2>/dev/null
echo "---"
grep "BLOCKED\|IN_PROGRESS" docs/build_tracker.md 2>/dev/null | head -20

# Open WO items
echo "Active work orders:"
grep -E "^W[0-9]+-[0-9]+" docs/build_tracker.md 2>/dev/null | grep -v "COMPLETE" | head -20

# Master status snapshot
echo "Last MASTER_STATUS update:"
head -5 MASTER_STATUS.md 2>/dev/null
```

## Step 2: Identify Priority Gaps

Cross-reference against governance requirements:

```bash
echo "=== GAP ANALYSIS ==="
cd SOCELLE-WEB

# Routes without components (shell pages)
echo "Shell/stub pages:"
grep -rn "Coming Soon\|placeholder\|stub\|TODO\|SHELL" src/pages/ 2>/dev/null | grep -v node_modules | wc -l

# Edge functions without callers
echo "Potentially orphaned edge functions:"
ls supabase/functions/ 2>/dev/null | while read fn; do
  callers=$(grep -rn "$fn" src/ 2>/dev/null | grep -v node_modules | wc -l)
  [ "$callers" -eq 0 ] && echo "  orphan: $fn"
done

# DEMO surfaces still not LIVE
echo "DEMO surfaces needing LIVE wiring:"
grep -rn "isLive.*false\|DEMO\|PREVIEW.*badge" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Step 3: Generate Prioritized Roadmap

Apply this priority framework:
1. **P0 — Blockers**: Anything that prevents deploy (typecheck fails, broken routes, security gaps)
2. **P1 — Revenue path**: Entitlement enforcement, payment flows, intelligence modules that drive conversion
3. **P2 — Quality**: LIVE/DEMO cleanup, design compliance, copy fixes
4. **P3 — Growth**: New features, internationalization, mobile parity

Output format:
```markdown
## Sprint Roadmap — [Date Range]

### P0 Blockers (must fix before deploy)
| WO ID | Task | Owner | Est Hours | Dependency |
|-------|------|-------|-----------|------------|

### P1 Revenue Path
| WO ID | Task | Owner | Est Hours | Dependency |
|-------|------|-------|-----------|------------|

### P2 Quality
| WO ID | Task | Owner | Est Hours | Dependency |
|-------|------|-------|-----------|------------|
```

**Rule**: Every WO ID in this output must already exist in `build_tracker.md`. If a new task is needed, add it to `build_tracker.md` first, then reference it here.

## Step 4: Generate Runbook (if requested)

For operational procedures (deploy, rollback, disaster recovery):

```markdown
## Runbook: [Procedure Name]

### Prerequisites
- [ ] Required access/permissions
- [ ] Required tools

### Steps
1. [Action] — [Expected result] — [Rollback if fails]
2. ...

### Verification
- [ ] Health check passed
- [ ] No error spike in logs

### Rollback procedure
1. ...
```

## Output

Write to `docs/qa/operations_roadmap.json`:
```json
{
  "skill": "operations-optimizer",
  "p0_blockers": 0,
  "p1_revenue_items": 0,
  "p2_quality_items": 0,
  "p3_growth_items": 0,
  "total_estimated_hours": 0,
  "all_wo_ids_valid": true,
  "timestamp": "ISO-8601"
}
```

## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance


## Fade Protocol
- **Retest trigger:** Run quarterly or after any major refactor, migration, or dependency upgrade
- **Deprecation trigger:** Skill references files/patterns that no longer exist in codebase for 2+ consecutive quarters
- **Replacement path:** If deprecated, merge functionality into the relevant suite or rebuild via `skill-creator`
- **Last recertified:** 2026-03-08
