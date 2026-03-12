---
name: e2e-test-runner
description: "Runs end-to-end Playwright tests against the running application. Tests critical user flows: auth, navigation, forms, and intelligence surfaces. Triggers on: 'E2E test', 'end to end', 'Playwright test', 'integration test', 'test user flows', 'automated test'."
---

# E2E Test Runner

Executes Playwright-based end-to-end tests.

## Check test infrastructure

```bash
echo "=== TEST INFRASTRUCTURE ==="
cd SOCELLE-WEB
echo "Playwright version:"
npx playwright --version 2>/dev/null || echo "NOT INSTALLED"
echo "---"
echo "Existing test files:"
find . -name "*.spec.ts" -o -name "*.test.ts" -o -name "*.e2e.ts" 2>/dev/null | grep -v node_modules | head -10
echo "---"
echo "Playwright config:"
ls playwright.config.* 2>/dev/null || echo "NO CONFIG"
```

## Run existing tests

```bash
echo "=== RUN TESTS ==="
cd SOCELLE-WEB
if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
  npx playwright test --reporter=list 2>&1 | tail -20
else
  echo "No Playwright config found — tests cannot run"
  echo "To create: npx playwright init"
fi
```

## Generate test scaffolds

```bash
echo "=== CRITICAL FLOW SCAFFOLDS ==="
echo "Tests needed for:"
echo "  1. Homepage renders"
echo "  2. /request-access form submits"
echo "  3. /intelligence page loads with signals"
echo "  4. Auth flow (login/logout)"
echo "  5. Portal navigation (operator, brand, admin)"
echo "  6. Plans page renders tiers"
```

## Output
Write `docs/qa/e2e_test_results.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls SOCELLE-WEB/tests/ 2>/dev/null | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/e2e-test-runner-YYYY-MM-DD.json`
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
