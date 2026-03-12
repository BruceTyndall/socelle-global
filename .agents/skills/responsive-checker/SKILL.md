---
name: responsive-checker
description: "Checks responsive design implementation: breakpoint usage, mobile-first patterns, viewport meta tags, and touch-friendly targets. Triggers on: 'responsive check', 'mobile responsive', 'breakpoint audit', 'mobile-first', 'viewport check', 'touch targets'."
---

# Responsive Checker

Validates responsive design patterns across the codebase.

## Breakpoint usage

```bash
echo "=== BREAKPOINT USAGE ==="
cd SOCELLE-WEB
echo "Tailwind breakpoint classes:"
for bp in sm: md: lg: xl: 2xl:; do
  count=$(grep -ro "$bp" src/ 2>/dev/null | wc -l)
  echo "  $bp $count usages"
done
echo "---"
echo "Custom media queries:"
grep -rn "@media" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Viewport meta tag

```bash
echo "=== VIEWPORT META ==="
cd SOCELLE-WEB
grep -rn "viewport" index.html public/ 2>/dev/null | head -5
```

## Mobile-first check

```bash
echo "=== MOBILE-FIRST PATTERNS ==="
cd SOCELLE-WEB
echo "Hidden on mobile (potentially important content):"
grep -rn "hidden.*md:block\|hidden.*lg:block\|hidden.*sm:block" src/ 2>/dev/null | grep -v node_modules | wc -l
echo "---"
echo "Fixed width containers (anti-responsive):"
grep -rn "w-\[.*px\]\|width:.*px" src/components/ src/pages/ 2>/dev/null | grep -v node_modules | head -10
```

## Touch target size

```bash
echo "=== TOUCH TARGETS ==="
cd SOCELLE-WEB
echo "Small buttons/links (potentially too small for touch):"
grep -rn "p-1\b\|px-1\b\|py-1\b\|h-4\b\|h-5\b\|w-4\b\|w-5\b" src/components/ 2>/dev/null | grep -i "button\|btn\|link\|click\|tap" | grep -v node_modules | head -10
```

## Output

Write `docs/qa/responsive_check.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "sm:\|md:\|lg:" SOCELLE-WEB/src/components/ | wc -l  # expect > 50`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/responsive-checker-YYYY-MM-DD.json`
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
