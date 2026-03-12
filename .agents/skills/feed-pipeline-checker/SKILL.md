---
name: feed-pipeline-checker
description: "Maps and validates the data feed pipeline from Supabase tables through hooks to page components. Use this skill to: trace data flow from DB to UI, find broken feed chains (hook exists but no table, or table exists but no hook), detect unused hooks, and verify API integration points. Triggers on: 'feed pipeline', 'data flow check', 'hook wiring', 'API integration audit', 'broken feed', 'data pipeline map'."
---

# Feed Pipeline Checker

Traces the full data pipeline: Supabase table → hook → component → page.

## Table-to-hook mapping

```bash
echo "=== TABLE → HOOK MAPPING ==="
cd SOCELLE-WEB
# Extract table names from hooks
for f in src/hooks/use*.ts src/hooks/use*.tsx src/integrations/supabase/hooks/*.ts src/integrations/supabase/hooks/*.tsx; do
  if [ -f "$f" ]; then
    tables=$(grep -oP "from\(['\"](\w+)['\"]\)" "$f" 2>/dev/null | grep -oP "'[^']+'" | tr -d "'")
    if [ -n "$tables" ]; then
      echo "$(basename $f) → $tables"
    fi
  fi
done 2>/dev/null
```

## Hook-to-component mapping

```bash
echo "=== HOOK → COMPONENT MAPPING ==="
cd SOCELLE-WEB
for hook in $(find src/hooks src/integrations/supabase/hooks -name 'use*.ts' -o -name 'use*.tsx' 2>/dev/null | xargs -I{} basename {} .ts | sed 's/.tsx$//' | sort -u); do
  callers=$(grep -rl "$hook" src/components/ src/pages/ 2>/dev/null | wc -l)
  if [ "$callers" -eq 0 ]; then
    echo "UNUSED: $hook (0 component callers)"
  else
    echo "$hook → $callers components"
  fi
done
```

## External API integration points

```bash
echo "=== EXTERNAL API CALLS ==="
cd SOCELLE-WEB
# Find fetch/axios/supabase.functions.invoke calls
grep -rn "fetch(\|axios\.\|functions.invoke" src/ 2>/dev/null | grep -v node_modules | head -20
echo "---"
echo "Edge function invocations from frontend:"
grep -rn "functions.invoke" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Broken feed detection

```bash
echo "=== BROKEN FEEDS ==="
cd SOCELLE-WEB
# Hooks that reference tables not in migrations
for f in src/hooks/use*.ts src/integrations/supabase/hooks/*.ts; do
  if [ -f "$f" ]; then
    tables=$(grep -oP "from\(['\"](\w+)['\"]\)" "$f" 2>/dev/null | grep -oP "'[^']+'" | tr -d "'")
    for t in $tables; do
      exists=$(grep -rl "CREATE TABLE.*$t\|create table.*$t" supabase/migrations/ 2>/dev/null | wc -l)
      if [ "$exists" -eq 0 ]; then
        echo "BROKEN: $(basename $f) references table '$t' — no CREATE TABLE found"
      fi
    done
  fi
done 2>/dev/null
```

## Output

Write `docs/qa/feed_pipeline.json`:

```json
{
  "scan_date": "ISO",
  "table_hook_map": {"table": ["hook1"]},
  "unused_hooks": [],
  "external_api_calls": 0,
  "edge_fn_invocations": 0,
  "broken_feeds": [],
  "pipeline_health": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "useQuery\|from(" SOCELLE-WEB/src/hooks/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/feed-pipeline-checker-YYYY-MM-DD.json`
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
