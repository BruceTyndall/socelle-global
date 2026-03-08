---
name: edge-fn-health
description: "Edge function inventory, health check, and wiring verification for Supabase. Use this skill to: list all edge functions, check if each has an index.ts, verify JWT requirements, check error handling patterns, and map which functions are called from the frontend. Triggers on: 'edge function audit', 'function health', 'serverless check', 'which functions exist', 'edge function wiring'."
---

# Edge Function Health

Audits all Supabase Edge Functions for completeness and health.

## Inventory

```bash
echo "=== EDGE FUNCTION INVENTORY ==="
echo "--- Root (supabase/functions/) ---"
ls supabase/functions/ 2>/dev/null
echo ""
echo "--- Web (SOCELLE-WEB/supabase/functions/) ---"
for fn in SOCELLE-WEB/supabase/functions/*/; do
  name=$(basename "$fn")
  has_index=$(test -f "$fn/index.ts" && echo "YES" || echo "NO")
  lines=$(wc -l < "$fn/index.ts" 2>/dev/null || echo 0)
  echo "$name: index.ts=$has_index, lines=$lines"
done
```

## JWT requirement check

```bash
echo "=== JWT REQUIREMENTS ==="
cd SOCELLE-WEB
for fn in supabase/functions/*/index.ts; do
  name=$(dirname "$fn" | xargs basename)
  jwt=$(grep -q "authorization" "$fn" 2>/dev/null && echo "YES" || echo "NO")
  echo "$name: requires_auth=$jwt"
done
```

## Error handling check

```bash
echo "=== ERROR HANDLING ==="
cd SOCELLE-WEB
for fn in supabase/functions/*/index.ts; do
  name=$(dirname "$fn" | xargs basename)
  has_try=$(grep -q "try" "$fn" 2>/dev/null && echo "YES" || echo "NO")
  has_catch=$(grep -q "catch" "$fn" 2>/dev/null && echo "YES" || echo "NO")
  echo "$name: try=$has_try, catch=$has_catch"
done
```

## Frontend wiring check

```bash
echo "=== FRONTEND WIRING ==="
cd SOCELLE-WEB
for fn in supabase/functions/*/; do
  name=$(basename "$fn")
  callers=$(grep -rl "functions/invoke.*$name\|$name" src/ 2>/dev/null | wc -l)
  echo "$name: called_from=$callers files"
done
```

## Output

Write `docs/qa/edge_fn_health.json` with function name, has_index, lines, requires_auth, has_error_handling, frontend_callers.

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls SOCELLE-WEB/supabase/functions/*/index.ts | wc -l  # expect > 20`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/edge-fn-health-YYYY-MM-DD.json`
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
