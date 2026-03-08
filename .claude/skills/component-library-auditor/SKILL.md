---
name: component-library-auditor
description: "Audits the shared component library for consistency, reuse patterns, duplicate components, and documentation. Triggers on: 'component audit', 'component library', 'shared components', 'duplicate components', 'component reuse', 'UI library check'."
---

# Component Library Auditor

Audits shared component consistency and reuse.

## Component inventory

```bash
echo "=== COMPONENT INVENTORY ==="
cd SOCELLE-WEB
echo "Total components:"
find src/components -name "*.tsx" 2>/dev/null | wc -l
echo "---"
echo "By directory:"
for dir in src/components/*/; do
  [ -d "$dir" ] && echo "  $(basename $dir): $(find $dir -name '*.tsx' | wc -l) files"
done
```

## Duplicate component detection

```bash
echo "=== DUPLICATE COMPONENTS ==="
cd SOCELLE-WEB
# Find similarly named components
find src/components src/pages -name "*.tsx" 2>/dev/null | xargs -I{} basename {} .tsx | sort | uniq -di | head -20
echo "---"
echo "Potential duplicates (similar names):"
find src/ -name "*Card*.tsx" 2>/dev/null | grep -v node_modules | head -10
echo "---"
find src/ -name "*Modal*.tsx" 2>/dev/null | grep -v node_modules | head -10
echo "---"
find src/ -name "*Button*.tsx" 2>/dev/null | grep -v node_modules | head -10
```

## Component reuse analysis

```bash
echo "=== COMPONENT REUSE ==="
cd SOCELLE-WEB
# Check which components are imported most/least
for comp in $(find src/components -name "*.tsx" -maxdepth 2 2>/dev/null | head -20); do
  name=$(basename "$comp" .tsx)
  imports=$(grep -rl "from.*$name\|import.*$name" src/pages/ 2>/dev/null | wc -l)
  [ "$imports" -eq 0 ] && echo "UNUSED: $name (0 page imports)"
done
```

## Output

Write `docs/qa/component_library_audit.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `find SOCELLE-WEB/src/components -name "*.tsx" | wc -l  # expect > 50`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/component-library-auditor-YYYY-MM-DD.json`
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
