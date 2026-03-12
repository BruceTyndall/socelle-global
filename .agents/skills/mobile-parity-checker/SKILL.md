---
name: mobile-parity-checker
description: "Checks feature parity between web and mobile (Flutter) apps: shared routes, theme consistency, Supabase integration, and feature coverage. Triggers on: 'mobile parity', 'Flutter check', 'web mobile comparison', 'cross-platform', 'mobile audit', 'PWA check'."
---

# Mobile Parity Checker

Validates web-mobile feature parity.

## Mobile app structure

```bash
echo "=== MOBILE APP STRUCTURE ==="
cd ..
if [ -d "SOCELLE-MOBILE-main" ]; then
  echo "Dart files:"
  find SOCELLE-MOBILE-main -name "*.dart" 2>/dev/null | wc -l
  echo "---"
  echo "Key directories:"
  ls SOCELLE-MOBILE-main/apps/mobile/lib/ 2>/dev/null | head -15
else
  echo "SOCELLE-MOBILE-main NOT FOUND"
fi
```

## Theme parity

```bash
echo "=== THEME PARITY ==="
cd ..
echo "Web theme (Tailwind):"
grep -A5 "colors" SOCELLE-WEB/tailwind.config.* 2>/dev/null | head -10
echo "---"
echo "Mobile theme (Flutter):"
find SOCELLE-MOBILE-main -name "*theme*" -o -name "*color*" 2>/dev/null | head -5
for f in $(find SOCELLE-MOBILE-main -name "socelle_theme.dart" -o -name "*theme*.dart" 2>/dev/null | head -3); do
  echo "--- $(basename $f) ---"
  grep -n "Color\|color\|#" "$f" 2>/dev/null | head -10
done
```

## Supabase integration parity

```bash
echo "=== SUPABASE PARITY ==="
cd ..
echo "Web Supabase hooks:"
find SOCELLE-WEB/src/hooks -name "use*.ts" 2>/dev/null | wc -l
echo "Mobile Supabase services:"
find SOCELLE-MOBILE-main -name "*supabase*" -o -name "*repository*" 2>/dev/null | wc -l
```

## Feature coverage comparison

```bash
echo "=== FEATURE COVERAGE ==="
cd ..
echo "Web pages: $(find SOCELLE-WEB/src/pages -name '*.tsx' | wc -l)"
echo "Mobile screens: $(find SOCELLE-MOBILE-main -name '*screen*.dart' -o -name '*page*.dart' 2>/dev/null | wc -l)"
echo "---"
echo "PWA manifest:"
find SOCELLE-WEB -name "manifest.json" -o -name "manifest.webmanifest" 2>/dev/null | head -3
```

## Output
Write `docs/qa/mobile_parity_check.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `find SOCELLE-MOBILE-main -name "*.dart" 2>/dev/null | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/mobile-parity-checker-YYYY-MM-DD.json`
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
