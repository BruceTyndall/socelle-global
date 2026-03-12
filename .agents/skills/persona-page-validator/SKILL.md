---
name: persona-page-validator
description: "Validates persona landing pages (for-brands, for-medspas, for-salons, for-professionals) have proper CTAs, intelligence-first framing, and complete content. Triggers on: 'persona pages', 'for-brands', 'for-medspas', 'for-salons', 'landing pages', 'persona validation'."
---

# Persona Page Validator

Validates all persona landing pages are complete and compliant.

## Persona page inventory

```bash
echo "=== PERSONA PAGES ==="
cd SOCELLE-WEB
PERSONAS="ForBrands ForMedspas ForSalons ForProfessionals ForEducators"
for p in $PERSONAS; do
  file=$(find src/pages -name "$p*" 2>/dev/null | head -1)
  if [ -n "$file" ]; then
    lines=$(wc -l < "$file")
    ctas=$(grep -ci "button\|Button\|cta\|CTA\|href\|to=" "$file" 2>/dev/null)
    intel=$(grep -ci "intelligence\|insight\|signal\|data" "$file" 2>/dev/null)
    echo "FOUND: $p ($lines lines, $ctas CTAs, $intel intelligence refs)"
  else
    echo "MISSING: $p"
  fi
done
```

## CTA presence and quality

```bash
echo "=== PERSONA CTA QUALITY ==="
cd SOCELLE-WEB
for p in ForBrands ForMedspas ForSalons ForProfessionals; do
  file=$(find src/pages -name "$p*" 2>/dev/null | head -1)
  if [ -n "$file" ]; then
    echo "--- $p ---"
    grep -n "Button\|button\|CTA\|cta\|href=\|to=" "$file" 2>/dev/null | head -5
  fi
done
```

## Route registration check

```bash
echo "=== PERSONA ROUTES ==="
cd SOCELLE-WEB
for route in "/for-brands" "/for-medspas" "/for-salons" "/for-professionals" "/professionals"; do
  found=$(grep -c "path=.*$route" src/App.tsx 2>/dev/null)
  echo "$route: $([ $found -gt 0 ] && echo 'REGISTERED' || echo 'NOT REGISTERED')"
done
```

## Output

Write `docs/qa/persona_page_validation.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -l "for-brands\|ForBrands\|for-professionals" SOCELLE-WEB/src/pages/*.tsx 2>/dev/null | wc -l  # expect >= 2`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/persona-page-validator-YYYY-MM-DD.json`
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
