---
name: schema-drift-detector
description: "Detects schema drift between database.types.ts and actual Supabase migrations. Finds tables in types not in migrations and vice versa. Triggers on: 'schema drift', 'type drift', 'database.types.ts', 'type generation', 'schema mismatch'."
---

# Schema Drift Detector

Detects drift between generated types and actual schema.

## Types file analysis

```bash
echo "=== DATABASE.TYPES.TS ==="
cd SOCELLE-WEB
if [ -f "src/integrations/supabase/types.ts" ]; then
  lines=$(wc -l < src/integrations/supabase/types.ts)
  tables=$(grep -c "Row:" src/integrations/supabase/types.ts 2>/dev/null)
  echo "File: src/integrations/supabase/types.ts ($lines lines, $tables table types)"
else
  echo "types.ts NOT FOUND at expected path"
  find src/ -name "types.ts" -path "*/supabase/*" 2>/dev/null
fi
```

## Tables in types vs migrations

```bash
echo "=== TABLES IN TYPES ==="
cd SOCELLE-WEB
grep -oP '\w+:\s*\{' src/integrations/supabase/types.ts 2>/dev/null | grep "Row\|Insert\|Update" -B1 | head -40
echo "=== TABLES IN MIGRATIONS ==="
grep -roh "CREATE TABLE\s\+\(IF NOT EXISTS\s\+\)\?\(public\.\)\?\w\+" supabase/migrations/ 2>/dev/null | sed 's/CREATE TABLE\s*\(IF NOT EXISTS\s*\)\?\(public\.\)\?//' | sort -u | head -40
```

## Drift detection

```bash
echo "=== DRIFT DETECTION ==="
cd SOCELLE-WEB
echo "Types file last modified:"
stat -c '%Y %y' src/integrations/supabase/types.ts 2>/dev/null || echo "NOT FOUND"
echo "Latest migration:"
ls -t supabase/migrations/*.sql 2>/dev/null | head -1
echo "---"
echo "To regenerate: npx supabase gen types typescript --local"
```

## Output
Write `docs/qa/schema_drift.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls SOCELLE-WEB/src/types/database.types.ts 2>/dev/null && echo "EXISTS" || echo "MISSING"  # expect EXISTS`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/schema-drift-detector-YYYY-MM-DD.json`
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
