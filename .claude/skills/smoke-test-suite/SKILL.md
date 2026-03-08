---
name: smoke-test-suite
description: "Runs a quick smoke test across critical paths: homepage loads, auth works, key pages render, API responds. Triggers on: 'smoke test', 'quick test', 'sanity check', 'critical paths', 'health check', 'basic test'."
---

# Smoke Test Suite

Quick validation of critical application paths.

## Build check

```bash
echo "=== BUILD SMOKE ==="
cd SOCELLE-WEB
npm run build 2>&1 | tail -5
echo "BUILD EXIT: $?"
```

## TypeScript check

```bash
echo "=== TYPECHECK SMOKE ==="
cd SOCELLE-WEB
npx tsc --noEmit 2>&1 | tail -5
echo "TSC EXIT: $?"
```

## Critical file existence

```bash
echo "=== CRITICAL FILES ==="
cd SOCELLE-WEB
CRITICAL="src/App.tsx src/main.tsx index.html package.json tsconfig.json tailwind.config.ts vite.config.ts supabase/config.toml"
for f in $CRITICAL; do
  echo "$f: $([ -f $f ] && echo 'OK' || echo 'MISSING')"
done
```

## Route count sanity

```bash
echo "=== ROUTE SANITY ==="
cd SOCELLE-WEB
routes=$(grep -c "path=" src/App.tsx 2>/dev/null)
echo "Routes: $routes"
[ "$routes" -gt 100 ] && echo "OK (>100 routes)" || echo "WARN (<100 routes)"
```

## Edge function count

```bash
echo "=== EDGE FN SANITY ==="
cd SOCELLE-WEB
fns=$(find supabase/functions -name "index.ts" 2>/dev/null | wc -l)
echo "Edge functions: $fns"
[ "$fns" -gt 20 ] && echo "OK (>20 functions)" || echo "WARN (<20 functions)"
```

## Output
Write `docs/qa/smoke_test_results.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `cd SOCELLE-WEB && npx tsc --noEmit 2>&1 | tail -1  # expect clean`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/smoke-test-suite-YYYY-MM-DD.json`
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
