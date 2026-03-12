---
name: cta-validator
description: "Validates all CTAs across the platform: intelligence-first hierarchy, no commerce on intelligence surfaces, persona page CTAs present, and CTA-to-route mapping. Triggers on: 'CTA check', 'CTA audit', 'call to action', 'button audit', 'conversion flow', 'CTA mapping'."
---

# CTA Validator

Validates CTA placement, hierarchy, and intelligence-first compliance.

## CTA inventory

```bash
echo "=== CTA INVENTORY ==="
cd SOCELLE-WEB
grep -rn "button\|Button\|cta\|CTA\|href.*request-access\|href.*signup\|href.*plans" src/pages/ src/components/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | grep -i "get\|start\|try\|join\|sign\|access\|shop\|buy" | head -30
```

## Commerce CTAs on intelligence surfaces

```bash
echo "=== COMMERCE CTAs ON INTELLIGENCE SURFACES ==="
cd SOCELLE-WEB
for f in src/pages/Intelligence*.tsx src/pages/public/Intelligence*.tsx src/pages/portal/Intelligence*.tsx; do
  [ -f "$f" ] && grep -ni "shop\|buy\|cart\|purchase\|order" "$f" 2>/dev/null && echo "  ^^^ in $(basename $f)"
done 2>/dev/null
```

## Persona page CTA check

```bash
echo "=== PERSONA PAGE CTAs ==="
cd SOCELLE-WEB
for page in "ForBrands" "ForMedspas" "ForSalons" "ForProfessionals"; do
  f=$(find src/pages -name "$page*" 2>/dev/null | head -1)
  if [ -n "$f" ]; then
    ctas=$(grep -ci "button\|Button\|cta\|CTA" "$f" 2>/dev/null)
    echo "$page: $ctas CTAs found $([ $ctas -eq 0 ] && echo '⚠ MISSING')"
  else
    echo "$page: PAGE NOT FOUND"
  fi
done
```

## CTA-to-route mapping

```bash
echo "=== CTA DESTINATIONS ==="
cd SOCELLE-WEB
grep -rn "href=\|to=\|navigate(" src/pages/ src/components/ 2>/dev/null | grep -i "request-access\|plans\|signup\|get-started" | grep -v node_modules | head -15
```

## Output

Write `docs/qa/cta_validation.json`:

```json
{
  "scan_date": "ISO",
  "total_ctas": 0,
  "intelligence_ctas": 0,
  "commerce_on_intelligence": [],
  "persona_pages_with_ctas": 0,
  "persona_pages_missing_ctas": [],
  "cta_destinations": {},
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "Shop Now\|Buy Now\|Add to Cart" SOCELLE-WEB/src/pages/ | wc -l  # expect 0 on public pages`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/cta-validator-YYYY-MM-DD.json`
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
