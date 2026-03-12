---
name: figma-parity-checker
description: "Checks parity between figma-make-source modules and their code implementations. Verifies that Figma design modules have corresponding components and are wired to real data. Triggers on: 'Figma parity', 'figma-make-source', 'design implementation', 'Figma modules', 'design code match'."
---

# Figma Parity Checker

Validates figma-make-source modules match code implementations.

## figma-make-source inventory

```bash
echo "=== FIGMA-MAKE-SOURCE MODULES ==="
cd ..
if [ -d "figma-make-source" ]; then
  echo "Module count:"
  find figma-make-source -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l
  echo "---"
  echo "Modules:"
  find figma-make-source -name "*.tsx" -o -name "*.jsx" 2>/dev/null | head -20
else
  echo "figma-make-source directory NOT FOUND at expected path"
  find . -name "figma-make-source" -type d 2>/dev/null | head -3
fi
```

## Code implementation mapping

```bash
echo "=== FIGMA → CODE MAPPING ==="
cd SOCELLE-WEB
# Key figma-make-source module names
FIGMA_MODULES="KPIStrip SignalTable BigStatBanner TrendChart IntelligenceCard ProvenanceBadge ConfidenceTier"
for mod in $FIGMA_MODULES; do
  code=$(find src/ -name "*$mod*" 2>/dev/null | grep -v node_modules | head -1)
  if [ -n "$code" ]; then
    echo "MAPPED: $mod → $code"
  else
    echo "UNMAPPED: $mod (no code implementation)"
  fi
done
```

## Data wiring check

```bash
echo "=== FIGMA MODULE DATA WIRING ==="
cd SOCELLE-WEB
for mod in KPIStrip SignalTable BigStatBanner; do
  file=$(find src/ -name "*$mod*" 2>/dev/null | grep -v node_modules | head -1)
  if [ -n "$file" ]; then
    has_data=$(grep -c "use[A-Z]\|supabase\|useQuery" "$file" 2>/dev/null)
    echo "$mod: data_hooks=$has_data $([ $has_data -eq 0 ] && echo 'STATIC' || echo 'WIRED')"
  fi
done
```

## Output

Write `docs/qa/figma_parity_check.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls figma-make-source/ 2>/dev/null | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/figma-parity-checker-YYYY-MM-DD.json`
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
