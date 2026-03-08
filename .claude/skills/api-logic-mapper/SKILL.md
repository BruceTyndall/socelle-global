---
name: api-logic-mapper
description: "Maps all API/edge function logic including request/response shapes, auth requirements, and frontend call sites. Use this skill to: inventory all edge functions with their HTTP methods and endpoints, trace which frontend components call each function, detect functions with no callers, find inline business logic that should be in edge functions, and map the full API surface. Triggers on: 'API map', 'edge function map', 'endpoint inventory', 'API surface audit', 'backend logic check', 'function caller map'."
---

# API Logic Mapper

Maps the complete API surface: edge functions, their logic, and frontend integration.

## Edge function inventory with detail

```bash
echo "=== EDGE FUNCTION DETAIL ==="
cd SOCELLE-WEB
for fn in supabase/functions/*/index.ts; do
  if [ -f "$fn" ]; then
    name=$(dirname "$fn" | xargs basename)
    lines=$(wc -l < "$fn")
    methods=$(grep -oP "req\.method\s*===?\s*['\"](\w+)" "$fn" 2>/dev/null | grep -oP "'[^']+'" | tr -d "'" | sort -u | tr '\n' ',')
    has_cors=$(grep -c "cors\|CORS\|Access-Control" "$fn" 2>/dev/null)
    has_auth=$(grep -c "authorization\|Authorization\|Bearer" "$fn" 2>/dev/null)
    has_stripe=$(grep -c "stripe\|Stripe" "$fn" 2>/dev/null)
    echo "$name: lines=$lines methods=$methods cors=$has_cors auth=$has_auth stripe=$has_stripe"
  fi
done
```

## Frontend call sites

```bash
echo "=== FRONTEND → EDGE FUNCTION CALLS ==="
cd SOCELLE-WEB
grep -rn "functions.invoke\|supabase.*functions" src/ 2>/dev/null | grep -v node_modules | while read line; do
  file=$(echo "$line" | cut -d: -f1)
  fn_name=$(echo "$line" | grep -oP "invoke\(['\"]([^'\"]+)" | grep -oP "'[^']+'" | tr -d "'")
  echo "$(basename $file) → $fn_name"
done | sort -u
```

## Orphan functions (no frontend callers)

```bash
echo "=== ORPHAN FUNCTIONS ==="
cd SOCELLE-WEB
for fn in supabase/functions/*/; do
  name=$(basename "$fn")
  callers=$(grep -rl "$name" src/ 2>/dev/null | grep -v node_modules | wc -l)
  if [ "$callers" -eq 0 ]; then
    echo "ORPHAN: $name (0 frontend callers)"
  fi
done
```

## Inline business logic detection

```bash
echo "=== INLINE BUSINESS LOGIC ==="
cd SOCELLE-WEB
# Find complex data transformations in frontend that should be server-side
grep -rn "\.reduce(\|\.map(.*\.filter(\|aggregate\|calculate.*total\|price.*calc" src/hooks/ src/pages/ 2>/dev/null | grep -v node_modules | head -15
echo "---"
# Find direct DB mutations in components (should be in edge functions)
grep -rn "\.insert(\|\.update(\|\.delete(" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | head -15
```

## Output

Write `docs/qa/api_logic_map.json`:

```json
{
  "scan_date": "ISO",
  "edge_functions": [{"name": "", "lines": 0, "methods": [], "has_auth": false, "has_cors": false}],
  "frontend_calls": [{"caller": "", "function": ""}],
  "orphan_functions": [],
  "inline_logic_warnings": [],
  "direct_mutations_in_ui": [],
  "total_api_surface": 0
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls SOCELLE-WEB/supabase/functions/*/index.ts | wc -l  # expect > 20`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/api-logic-mapper-YYYY-MM-DD.json`
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
