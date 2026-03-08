---
name: hook-consolidator
description: "Identifies duplicate and redundant hooks that should be consolidated. Detects hooks querying the same table, hooks with overlapping functionality, and unused hooks. Triggers on: 'hook consolidation', 'duplicate hooks', 'hook cleanup', 'redundant hooks', 'hook refactor'."
---

# Hook Consolidator

Identifies hooks that should be consolidated or removed.

## Duplicate hook detection

```bash
echo "=== DUPLICATE HOOKS ==="
cd SOCELLE-WEB
# Find hooks querying the same table
echo "Hooks by table:"
for f in src/hooks/use*.ts src/hooks/use*.tsx src/integrations/supabase/hooks/*.ts; do
  [ -f "$f" ] || continue
  tables=$(grep -oP "from\(['\"](\w+)" "$f" 2>/dev/null | grep -oP "'[^']+" | tr -d "'")
  for t in $tables; do
    echo "$t → $(basename $f)"
  done
done 2>/dev/null | sort | head -30

echo "---"
echo "Tables with multiple hooks (candidates for consolidation):"
for f in src/hooks/use*.ts src/integrations/supabase/hooks/*.ts; do
  [ -f "$f" ] || continue
  grep -oP "from\(['\"](\w+)" "$f" 2>/dev/null | grep -oP "'[^']+" | tr -d "'"
done 2>/dev/null | sort | uniq -c | sort -rn | head -10
```

## Unused hook detection

```bash
echo "=== UNUSED HOOKS ==="
cd SOCELLE-WEB
for f in src/hooks/use*.ts src/hooks/use*.tsx; do
  [ -f "$f" ] || continue
  name=$(basename "$f" .ts | sed 's/.tsx$//')
  imports=$(grep -rl "$name" src/components/ src/pages/ 2>/dev/null | wc -l)
  [ "$imports" -eq 0 ] && echo "UNUSED: $name"
done 2>/dev/null
```

## Hook complexity check

```bash
echo "=== HOOK COMPLEXITY ==="
cd SOCELLE-WEB
for f in src/hooks/use*.ts src/hooks/use*.tsx; do
  [ -f "$f" ] || continue
  lines=$(wc -l < "$f")
  [ "$lines" -gt 100 ] && echo "COMPLEX: $(basename $f) ($lines lines — consider splitting)"
done 2>/dev/null
```

## Output
Write `docs/qa/hook_consolidation.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `find SOCELLE-WEB/src/hooks -name "use*.ts" | wc -l  # expect count; flag duplicates`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/hook-consolidator-YYYY-MM-DD.json`
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
