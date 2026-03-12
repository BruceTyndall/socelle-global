---
name: visual-regression-checker
description: "Captures screenshots of key pages and compares against baseline for visual regression detection. Triggers on: 'visual regression', 'screenshot comparison', 'visual diff', 'UI regression', 'screenshot baseline', 'visual test'."
---

# Visual Regression Checker

Captures and compares page screenshots for visual regression.

## Capture baseline screenshots

```bash
echo "=== SCREENSHOT CAPTURE ==="
cd SOCELLE-WEB
mkdir -p docs/qa/screenshots
echo "Key pages to capture:"
PAGES="/ /home /intelligence /brands /education /protocols /plans /request-access /for-brands /for-medspas /privacy /terms"
for page in $PAGES; do
  echo "  $page"
done
echo "---"
echo "Use playwright-crawler skill to capture actual screenshots"
echo "Command: npx playwright screenshot --viewport-size=1280,720"
```

## Compare against baseline

```bash
echo "=== BASELINE COMPARISON ==="
cd SOCELLE-WEB
if [ -d "docs/qa/screenshots/baseline" ]; then
  echo "Baseline exists with $(ls docs/qa/screenshots/baseline/ | wc -l) screenshots"
else
  echo "NO BASELINE — first run will establish baseline"
  echo "Create baseline: mkdir -p docs/qa/screenshots/baseline"
fi
```

## Diff detection

```bash
echo "=== VISUAL DIFF ==="
cd SOCELLE-WEB
echo "To run visual diff, compare current/ vs baseline/ screenshots"
echo "Tools: pixelmatch (npm), playwright visual comparisons, or manual review"
echo "---"
echo "Current screenshots:"
ls docs/qa/screenshots/*.png 2>/dev/null | wc -l
echo " screenshots available"
```

## Output
Write `docs/qa/visual_regression_results.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls docs/qa/screenshots/ 2>/dev/null | wc -l  # expect > 0 after baseline capture`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/visual-regression-checker-YYYY-MM-DD.json`
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
