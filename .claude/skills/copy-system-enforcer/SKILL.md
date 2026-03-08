---
name: copy-system-enforcer
description: "Enforces copy system rules: heading hierarchy, CTA copy patterns, error messages, empty states, and loading states. Triggers on: 'copy system', 'heading hierarchy', 'error messages', 'empty states', 'loading states', 'microcopy audit'."
---

# Copy System Enforcer

Validates copy patterns across the platform.

## Heading hierarchy

```bash
echo "=== HEADING HIERARCHY ==="
cd SOCELLE-WEB
for tag in h1 h2 h3 h4 h5 h6; do
  count=$(grep -rn "<$tag\b" src/pages/ 2>/dev/null | grep -v node_modules | wc -l)
  echo "$tag: $count usages"
done
echo "---"
echo "Pages with multiple h1 tags (violation):"
for f in src/pages/*.tsx src/pages/**/*.tsx; do
  [ -f "$f" ] || continue
  h1s=$(grep -c "<h1\b" "$f" 2>/dev/null)
  [ "$h1s" -gt 1 ] && echo "  $(basename $f): $h1s h1 tags"
done 2>/dev/null
```

## Error message patterns

```bash
echo "=== ERROR MESSAGES ==="
cd SOCELLE-WEB
grep -rn "error\|Error\|something went wrong\|oops\|failed" src/components/ src/pages/ 2>/dev/null | grep -v "node_modules\|\.d\.ts\|console\.\|interface\|type " | head -15
```

## Empty state handling

```bash
echo "=== EMPTY STATES ==="
cd SOCELLE-WEB
grep -rn "no results\|no data\|empty\|nothing.*found\|no.*yet" src/components/ src/pages/ 2>/dev/null | grep -v node_modules | head -15
echo "---"
echo "Components with empty state handling:"
grep -rl "EmptyState\|NoResults\|no-data" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Loading states

```bash
echo "=== LOADING STATES ==="
cd SOCELLE-WEB
grep -rn "loading\|Loading\|Skeleton\|spinner\|isLoading" src/components/ src/pages/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | wc -l
echo " loading pattern usages"
echo "---"
echo "Pages WITHOUT loading states:"
for f in src/pages/*.tsx; do
  [ -f "$f" ] || continue
  loads=$(grep -c "loading\|Loading\|isLoading\|Skeleton" "$f" 2>/dev/null)
  hooks=$(grep -c "use[A-Z]" "$f" 2>/dev/null)
  [ "$hooks" -gt 0 ] && [ "$loads" -eq 0 ] && echo "  $(basename $f) (has hooks, no loading state)"
done 2>/dev/null | head -10
```

## Output

Write `docs/qa/copy_system_enforcement.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "<h1\|<h2\|HeadingLevel" SOCELLE-WEB/src/pages/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/copy-system-enforcer-YYYY-MM-DD.json`
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
