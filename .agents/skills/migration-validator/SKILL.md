---
name: migration-validator
description: "Validates Supabase migration integrity: ordering, ADD-ONLY compliance, naming conventions, and cross-migration conflicts. Use this skill to: verify migration file ordering is sequential, check for destructive operations (DROP TABLE, DROP COLUMN), detect duplicate migration timestamps, find conflicting schema changes, and verify migration count matches expectations. Triggers on: 'migration check', 'migration audit', 'schema migration', 'migration ordering', 'destructive migration', 'migration integrity'."
---

# Migration Validator

Validates Supabase migration file integrity and ADD-ONLY compliance.

## Migration file inventory

```bash
echo "=== MIGRATION INVENTORY ==="
cd SOCELLE-WEB
echo "Web migrations:"
ls supabase/migrations/*.sql 2>/dev/null | wc -l
echo "Root migrations:"
ls ../supabase/migrations/*.sql 2>/dev/null | wc -l
echo "---"
echo "First 5 migrations:"
ls supabase/migrations/*.sql 2>/dev/null | head -5
echo "Last 5 migrations:"
ls supabase/migrations/*.sql 2>/dev/null | tail -5
```

## Sequential ordering check

```bash
echo "=== ORDERING CHECK ==="
cd SOCELLE-WEB
# Extract timestamps and check they're sequential
ls supabase/migrations/*.sql 2>/dev/null | xargs -I{} basename {} | sort > /tmp/sorted_mig.txt
ls supabase/migrations/*.sql 2>/dev/null | xargs -I{} basename {} > /tmp/actual_mig.txt
diff /tmp/sorted_mig.txt /tmp/actual_mig.txt && echo "ORDER: OK (all sequential)" || echo "ORDER: MISMATCH (out of order detected)"
echo "---"
echo "Duplicate timestamps:"
ls supabase/migrations/*.sql 2>/dev/null | xargs -I{} basename {} | cut -c1-14 | sort | uniq -d
```

## ADD-ONLY compliance (no destructive operations)

```bash
echo "=== DESTRUCTIVE OPERATIONS ==="
cd SOCELLE-WEB
echo "DROP TABLE statements:"
grep -rn "DROP TABLE" supabase/migrations/ 2>/dev/null | head -10
echo "---"
echo "DROP COLUMN statements:"
grep -rn "DROP COLUMN" supabase/migrations/ 2>/dev/null | head -10
echo "---"
echo "TRUNCATE statements:"
grep -rn "TRUNCATE" supabase/migrations/ 2>/dev/null | head -5
echo "---"
echo "DELETE FROM (data destruction):"
grep -rn "DELETE FROM" supabase/migrations/ 2>/dev/null | head -5
```

## Naming convention check

```bash
echo "=== NAMING CONVENTIONS ==="
cd SOCELLE-WEB
echo "Migrations not matching YYYYMMDDHHMMSS pattern:"
for f in supabase/migrations/*.sql; do
  name=$(basename "$f")
  if ! echo "$name" | grep -qP "^\d{14}"; then
    echo "BAD NAME: $name"
  fi
done
```

## Cross-migration conflict detection

```bash
echo "=== POTENTIAL CONFLICTS ==="
cd SOCELLE-WEB
# Tables modified in multiple migrations
grep -roh "ALTER TABLE\s\+\(public\.\)\?\w\+" supabase/migrations/ 2>/dev/null | sed 's/ALTER TABLE\s*\(public\.\)\?//' | sort | uniq -c | sort -rn | head -10
echo "---"
echo "Most-modified tables:"
grep -roh "ALTER TABLE\s\+\(public\.\)\?\w\+" supabase/migrations/ 2>/dev/null | sed 's/ALTER TABLE\s*\(public\.\)\?//' | sort | uniq -c | sort -rn | head -5
```

## Output

Write `docs/qa/migration_validation.json`:

```json
{
  "scan_date": "ISO",
  "web_migrations": 0,
  "root_migrations": 0,
  "ordering": "OK/MISMATCH",
  "duplicate_timestamps": [],
  "destructive_ops": {"drop_table": 0, "drop_column": 0, "truncate": 0, "delete_from": 0},
  "naming_violations": [],
  "most_modified_tables": [],
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls SOCELLE-WEB/supabase/migrations/ | head -5  # expect sequential timestamps`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/migration-validator-YYYY-MM-DD.json`
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
