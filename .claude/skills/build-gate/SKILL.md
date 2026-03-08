---
name: build-gate
description: "Automated build, typecheck, and lint verification gate. Use this skill whenever you need to verify the codebase compiles and builds cleanly. Triggers on: 'check build', 'run tsc', 'typecheck', 'build gate', 'does it compile', 'pre-merge check', 'CI check', 'build verification'. MANDATORY before any PR or deploy."
---

# Build Gate

Runs the full build verification pipeline for SOCELLE-WEB and reports pass/fail with evidence.

## Execution sequence

All commands run from `SOCELLE-WEB/` directory.

### Step 1: TypeScript typecheck

```bash
cd SOCELLE-WEB && npx tsc --noEmit 2>&1 | tail -20
echo "EXIT: $?"
```

**PASS criteria:** Exit code 0, zero errors.

### Step 2: Production build

```bash
cd SOCELLE-WEB && npm run build 2>&1 | tail -20
echo "EXIT: $?"
```

**PASS criteria:** Exit code 0, build completes.

### Step 3: QA scripts (if they exist)

```bash
cd SOCELLE-WEB
for script in scripts/route-manifest.mjs scripts/fake-live-guard.mjs scripts/e2e-route-coverage.mjs; do
  if [ -f "$script" ]; then
    echo "--- Running $script ---"
    node "$script" 2>&1 | tail -10
    echo "EXIT: $?"
  else
    echo "--- $script: NOT FOUND ---"
  fi
done
```

### Step 4: Lint check (if configured)

```bash
cd SOCELLE-WEB && npx eslint src/ --max-warnings=0 2>&1 | tail -20 || echo "ESLint not configured or has warnings"
```

## Output format

Produce a summary block:

```
BUILD GATE RESULTS
==================
TypeScript:  PASS/FAIL (N errors)
Build:       PASS/FAIL (time: Xs)
QA Scripts:  PASS/FAIL/NOT FOUND
Lint:        PASS/FAIL/NOT CONFIGURED
==================
OVERALL: PASS/FAIL
```

Write to `docs/qa/build_gate_results.json` with timestamps and raw output.

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
