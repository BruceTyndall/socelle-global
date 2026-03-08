---
name: confidence-scorer
description: "Validates confidence scoring implementation on all intelligence data surfaces. Checks that every signal has a confidence tier, scores are derived from real methodology, and UI displays confidence indicators. Triggers on: 'confidence score', 'confidence tier', 'data confidence', 'signal reliability', 'trust indicator'."
---

# Confidence Scorer

Validates confidence tier implementation across intelligence surfaces.

## Confidence column presence

```bash
echo "=== CONFIDENCE IN SCHEMA ==="
cd SOCELLE-WEB
grep -rn "confidence" supabase/migrations/ 2>/dev/null | head -15
echo "---"
echo "Tables with confidence columns:"
grep -rn "confidence" supabase/migrations/ 2>/dev/null | grep -i "ADD\|CREATE" | wc -l
```

## Confidence in hooks

```bash
echo "=== CONFIDENCE IN HOOKS ==="
cd SOCELLE-WEB
grep -rn "confidence" src/hooks/ src/integrations/ 2>/dev/null | grep -v node_modules | head -15
```

## Confidence UI display

```bash
echo "=== CONFIDENCE UI COMPONENTS ==="
cd SOCELLE-WEB
grep -rn "confidence\|ConfidenceBadge\|ConfidenceTier\|trust.*score" src/components/ src/pages/ 2>/dev/null | grep -v node_modules | head -15
echo "---"
echo "Hardcoded confidence values (should be dynamic):"
grep -rn "confidence.*=.*['\"]high\|confidence.*=.*['\"]medium\|confidence.*=.*['\"]low" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts\|type\|interface" | head -10
```

## Output

Write `docs/qa/confidence_scoring.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "confidence" SOCELLE-WEB/src/hooks/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/confidence-scorer-YYYY-MM-DD.json`
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
