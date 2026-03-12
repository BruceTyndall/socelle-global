---
name: voice-enforcer
description: "Enforces SOCELLE brand voice rules across all user-facing copy. Use this skill to: check tone consistency (authoritative, not salesy), verify intelligence-first framing, detect consumer-tone language on B2B surfaces, ensure professional beauty industry terminology, and validate heading/subheading voice. Triggers on: 'voice check', 'brand voice', 'tone audit', 'copy tone', 'B2B voice', 'professional voice'."
---

# Voice Enforcer

Checks brand voice compliance across all user-facing text.

## Consumer vs B2B tone detection

```bash
echo "=== CONSUMER TONE ON B2B SURFACES ==="
cd SOCELLE-WEB
# Consumer-tone phrases that don't belong on a B2B intelligence platform
grep -rni "love it\|amazing\|awesome\|you'll love\|super easy\|no brainer\|game changer\|life changing\|must have\|don't miss" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | head -15
```

## Sales pressure language

```bash
echo "=== SALES PRESSURE LANGUAGE ==="
cd SOCELLE-WEB
grep -rni "limited time\|act now\|hurry\|don't wait\|last chance\|exclusive offer\|special deal\|only.*left\|expires\|countdown" src/ 2>/dev/null | grep -v node_modules | head -15
```

## Intelligence-first framing check

```bash
echo "=== INTELLIGENCE-FIRST FRAMING ==="
cd SOCELLE-WEB
echo "Pages with 'intelligence' in h1/hero:"
grep -rni "intelligence\|insights\|signals\|data-driven" src/pages/ 2>/dev/null | grep -i "hero\|h1\|heading\|title" | grep -v node_modules | head -10
echo "---"
echo "Pages with commerce-first framing:"
grep -rni "shop\|buy\|purchase\|order now\|add to cart" src/pages/ 2>/dev/null | grep -i "hero\|h1\|heading\|title" | grep -v node_modules | head -10
```

## Professional terminology check

```bash
echo "=== INDUSTRY TERMINOLOGY ==="
cd SOCELLE-WEB
echo "Correct terms used:"
for term in "professional beauty" "salon" "medspa" "esthetician" "cosmetologist" "provider" "operator"; do
  count=$(grep -ri "$term" src/pages/ 2>/dev/null | grep -v node_modules | wc -l)
  echo "  $term: $count"
done
echo "---"
echo "Incorrect/generic terms:"
for term in "customer" "user" "consumer" "buyer" "shopper"; do
  count=$(grep -ri "$term" src/pages/ src/components/ 2>/dev/null | grep -v "node_modules\|\.d\.ts\|types\|interface" | wc -l)
  [ "$count" -gt 0 ] && echo "  WARN: '$term' found $count times (should be operator/provider/brand)"
done
```

## Output

Write `docs/qa/voice_enforcement.json`:

```json
{
  "scan_date": "ISO",
  "consumer_tone_violations": [],
  "sales_pressure_language": [],
  "intelligence_first_pages": 0,
  "commerce_first_pages": 0,
  "industry_terms_usage": {},
  "generic_terms_usage": {},
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rnic "buy now\|limited time\|act fast" SOCELLE-WEB/src/ | tail -1  # expect 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/voice-enforcer-YYYY-MM-DD.json`
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
