---
name: db-inspector
description: "Database schema inspection, RLS audit, migration safety check, and type drift detection for Supabase. Use this skill whenever you need to: list all tables and their columns, verify RLS policies exist on every table, check migration integrity (ADD-ONLY policy), detect schema drift between database.types.ts and actual schema, or inspect specific table structures. Triggers on: 'database audit', 'schema check', 'RLS audit', 'migration safety', 'type drift', 'table inspection', 'Supabase schema'."
---

# DB Inspector

Inspects the Supabase database schema, RLS policies, and migration integrity for SOCELLE.

## Migration integrity check

Verify ADD-ONLY policy — no ALTER or DROP in migrations:

```bash
echo "=== MIGRATION INTEGRITY ==="
cd SOCELLE-WEB
echo "Web migrations: $(ls supabase/migrations/ | wc -l)"
echo "Checking for ALTER TABLE..."
grep -rl "ALTER TABLE" supabase/migrations/ 2>/dev/null | head -10
echo "Checking for DROP TABLE..."
grep -rl "DROP TABLE" supabase/migrations/ 2>/dev/null | head -10
echo "Checking for DROP COLUMN..."
grep -rl "DROP COLUMN" supabase/migrations/ 2>/dev/null | head -10
```

## Schema drift detection

Compare database.types.ts against migration-defined tables:

```bash
echo "=== SCHEMA DRIFT CHECK ==="
cd SOCELLE-WEB
# Count tables in types file
TYPES_TABLES=$(grep -c "Row:" src/integrations/supabase/database.types.ts 2>/dev/null || echo 0)
echo "Tables in database.types.ts: $TYPES_TABLES"
# Count CREATE TABLE in migrations
MIGRATION_TABLES=$(grep -rl "CREATE TABLE" supabase/migrations/ 2>/dev/null | wc -l)
echo "CREATE TABLE migrations: $MIGRATION_TABLES"
echo "Potential drift: $(( MIGRATION_TABLES - TYPES_TABLES )) tables"
```

## RLS policy audit

Check every table has RLS enabled:

```bash
echo "=== RLS POLICY CHECK ==="
cd SOCELLE-WEB
echo "Tables with ENABLE ROW LEVEL SECURITY:"
grep -rl "ENABLE ROW LEVEL SECURITY" supabase/migrations/ 2>/dev/null | wc -l
echo "Tables with RLS policies (CREATE POLICY):"
grep -rl "CREATE POLICY" supabase/migrations/ 2>/dev/null | wc -l
```

## Hook-to-table mapping

Map each hook to its Supabase table:

```bash
echo "=== HOOK → TABLE MAPPING ==="
cd SOCELLE-WEB
find src -name 'use*.ts' -o -name 'use*.tsx' | while read f; do
  tables=$(grep -oP "from\(['\"](\w+)['\"]\)" "$f" 2>/dev/null | grep -oP "'\w+'" | tr -d "'")
  if [ -n "$tables" ]; then
    echo "$(basename $f): $tables"
  fi
done
```

## Duplicate hook detection

```bash
echo "=== DUPLICATE HOOKS ==="
cd SOCELLE-WEB
find src -name 'use*.ts' -o -name 'use*.tsx' | xargs -I{} basename {} | sort | uniq -d
```

## Output

Write `docs/qa/db_inspection.json`:

```json
{
  "scan_date": "ISO",
  "migrations": { "web_count": N, "root_count": N, "alter_violations": [], "drop_violations": [] },
  "schema_drift": { "types_tables": N, "migration_tables": N, "drift_count": N },
  "rls": { "tables_with_rls": N, "tables_with_policies": N },
  "hook_table_map": { "hookName": ["table1", "table2"] },
  "duplicate_hooks": []
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls SOCELLE-WEB/supabase/migrations/*.sql | wc -l  # expect > 200`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/db-inspector-YYYY-MM-DD.json`
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
