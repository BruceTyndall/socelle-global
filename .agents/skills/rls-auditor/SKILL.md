---
name: rls-auditor
description: "Audits Row Level Security (RLS) policies on all Supabase tables. Use this skill to: verify RLS is enabled on every table, check policy completeness (SELECT/INSERT/UPDATE/DELETE), detect tables with no policies, find overly permissive policies, and audit service-role bypass usage. Triggers on: 'RLS audit', 'row level security', 'policy check', 'table security', 'Supabase security'."
---

# RLS Auditor

Validates Row Level Security policies across all Supabase tables.

## Check RLS enabled status

```bash
echo "=== RLS ENABLED STATUS ==="
cd SOCELLE-WEB
# Find all CREATE TABLE statements
echo "Tables in migrations:"
grep -rn "CREATE TABLE" supabase/migrations/ 2>/dev/null | grep -oP "CREATE TABLE\s+(IF NOT EXISTS\s+)?(\w+\.)?(\w+)" | sed 's/CREATE TABLE\s*\(IF NOT EXISTS\s*\)\?//' | sort -u
echo "---"
echo "ALTER TABLE ENABLE RLS statements:"
grep -rn "ENABLE ROW LEVEL SECURITY\|enable_rls" supabase/migrations/ 2>/dev/null | wc -l
```

## Policy completeness

```bash
echo "=== RLS POLICIES ==="
cd SOCELLE-WEB
grep -rn "CREATE POLICY" supabase/migrations/ 2>/dev/null | head -30
echo "---"
echo "Total policies defined:"
grep -c "CREATE POLICY" supabase/migrations/ 2>/dev/null
echo "---"
echo "Policy operations coverage:"
for op in SELECT INSERT UPDATE DELETE; do
  count=$(grep -c "FOR $op" supabase/migrations/ 2>/dev/null)
  echo "$op: $count policies"
done
```

## Tables without policies

```bash
echo "=== TABLES WITHOUT POLICIES ==="
cd SOCELLE-WEB
# Get all table names
TABLES=$(grep -roh "CREATE TABLE\s\+\(IF NOT EXISTS\s\+\)\?\(public\.\)\?\w\+" supabase/migrations/ 2>/dev/null | sed 's/CREATE TABLE\s*\(IF NOT EXISTS\s*\)\?\(public\.\)\?//' | sort -u)
for t in $TABLES; do
  has_policy=$(grep -c "ON\s\+\(public\.\)\?$t" supabase/migrations/ 2>/dev/null)
  if [ "$has_policy" -eq 0 ]; then
    echo "NO POLICY: $t"
  fi
done
```

## Service role bypass detection

```bash
echo "=== SERVICE ROLE USAGE ==="
cd SOCELLE-WEB
grep -rn "service_role\|supabaseAdmin\|SUPABASE_SERVICE_ROLE" src/ supabase/functions/ 2>/dev/null | grep -v node_modules | head -15
```

## Output

Write `docs/qa/rls_audit.json`:

```json
{
  "scan_date": "ISO",
  "tables_total": 0,
  "tables_with_rls": 0,
  "tables_without_rls": [],
  "policies_total": 0,
  "policies_by_op": {"SELECT": 0, "INSERT": 0, "UPDATE": 0, "DELETE": 0},
  "service_role_usages": [],
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "ENABLE ROW LEVEL SECURITY" SOCELLE-WEB/supabase/migrations/ | wc -l  # expect > 10`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/rls-auditor-YYYY-MM-DD.json`
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
