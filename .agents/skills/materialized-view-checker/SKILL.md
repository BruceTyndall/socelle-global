---
name: materialized-view-checker
description: "Checks for materialized views, their refresh schedules, and performance implications. Triggers on: 'materialized view', 'MV check', 'view refresh', 'query performance', 'database views'."
---

# Materialized View Checker

Audits materialized views and database view usage.

## View inventory

```bash
echo "=== DATABASE VIEWS ==="
cd SOCELLE-WEB
echo "CREATE VIEW statements:"
grep -rn "CREATE.*VIEW" supabase/migrations/ 2>/dev/null | head -15
echo "---"
echo "Materialized views:"
grep -rn "MATERIALIZED VIEW" supabase/migrations/ 2>/dev/null | head -10
echo "---"
echo "View count:"
grep -c "CREATE.*VIEW" supabase/migrations/ 2>/dev/null
```

## Refresh schedules

```bash
echo "=== REFRESH SCHEDULES ==="
cd SOCELLE-WEB
grep -rn "REFRESH MATERIALIZED\|pg_cron\|cron\.schedule" supabase/migrations/ supabase/functions/ 2>/dev/null | head -10
```

## RPC functions (often used instead of views)

```bash
echo "=== RPC FUNCTIONS ==="
cd SOCELLE-WEB
grep -rn "CREATE.*FUNCTION\|CREATE OR REPLACE FUNCTION" supabase/migrations/ 2>/dev/null | grep -v "trigger" | head -20
echo "---"
echo "Frontend RPC calls:"
grep -rn "\.rpc(" src/ 2>/dev/null | grep -v node_modules | head -15
```

## Output
Write `docs/qa/materialized_view_check.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "CREATE MATERIALIZED VIEW\|REFRESH" SOCELLE-WEB/supabase/migrations/ | wc -l  # expect >= 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/materialized-view-checker-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


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
