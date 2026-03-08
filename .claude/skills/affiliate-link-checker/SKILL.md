---
name: affiliate-link-checker
description: "Validates affiliate link infrastructure: link wrapper edge function, distributor mapping, FTC compliance badges, and commission tracking. Triggers on: 'affiliate check', 'affiliate links', 'FTC compliance', 'commission tracking', 'distributor mapping', 'affiliate engine'."
---

# Affiliate Link Checker

Validates affiliate revenue infrastructure readiness.

## Affiliate edge functions

```bash
echo "=== AFFILIATE FUNCTIONS ==="
cd SOCELLE-WEB
find supabase/functions -name "*affiliate*" -o -name "*distributor*" -o -name "*commission*" -o -name "*link-wrap*" 2>/dev/null
echo "---"
grep -rn "affiliate\|distributor\|commission\|link.*wrap" supabase/functions/ 2>/dev/null | head -15
```

## FTC compliance badges

```bash
echo "=== FTC COMPLIANCE ==="
cd SOCELLE-WEB
grep -rn "FTC\|commission.*linked\|affiliate.*disclosure\|sponsored\|paid.*partnership" src/ 2>/dev/null | grep -v node_modules | head -10
echo "---"
echo "Disclosure components:"
find src/ -name "*Disclosure*" -o -name "*FTC*" -o -name "*AffiliateDisclosure*" 2>/dev/null | grep -v node_modules
```

## Distributor mapping

```bash
echo "=== DISTRIBUTOR MAPPING ==="
cd SOCELLE-WEB
grep -rn "distributor" supabase/migrations/ src/ 2>/dev/null | grep -v node_modules | head -15
```

## Commission tracking

```bash
echo "=== COMMISSION TRACKING ==="
cd SOCELLE-WEB
grep -rn "commission\|payout\|revenue.*share\|affiliate.*track" src/ supabase/ 2>/dev/null | grep -v node_modules | head -15
```

## Output
Write `docs/qa/affiliate_link_check.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "affiliate\|distributor\|commission" SOCELLE-WEB/src/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/affiliate-link-checker-YYYY-MM-DD.json`
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
