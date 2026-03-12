---
name: shared-package-validator
description: "Validates shared packages in the monorepo: cross-app imports, package boundaries, and shared config consistency. Triggers on: 'shared packages', 'monorepo packages', 'cross-app imports', 'package boundaries', 'shared config'."
---

# Shared Package Validator

Validates monorepo shared package boundaries and consistency.

## Package inventory

```bash
echo "=== SHARED PACKAGES ==="
cd ..
if [ -d "packages" ]; then
  ls -la packages/
  echo "---"
  for pkg in packages/*/; do
    [ -d "$pkg" ] && echo "$pkg: $(ls $pkg | head -5 | tr '\n' ', ')"
  done
else
  echo "packages/ directory NOT FOUND"
fi
```

## Cross-app imports

```bash
echo "=== CROSS-APP IMPORTS ==="
cd SOCELLE-WEB
echo "Web importing from mobile (VIOLATION):"
grep -rn "SOCELLE-MOBILE\|socelle-mobile" src/ 2>/dev/null | grep -v node_modules | head -5
echo "---"
echo "Web importing from packages (OK):"
grep -rn "from.*packages/\|@socelle/" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Config consistency

```bash
echo "=== CONFIG CONSISTENCY ==="
echo "TypeScript configs:"
for cfg in SOCELLE-WEB/tsconfig.json apps/marketing-site/tsconfig.json; do
  [ -f "../$cfg" ] && echo "FOUND: $cfg" || echo "MISSING: $cfg"
done
echo "---"
echo "Tailwind configs:"
find .. -name "tailwind.config.*" -not -path "*/node_modules/*" 2>/dev/null | head -5
```

## Output
Write `docs/qa/shared_package_validation.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls packages/ 2>/dev/null | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/shared-package-validator-YYYY-MM-DD.json`
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
