---
name: signal-data-validator
description: "Validates signal data integrity: freshness, confidence scoring, source attribution, and updated_at compliance. Triggers on: 'signal validation', 'data freshness', 'confidence score', 'source attribution', 'signal integrity', 'updated_at check'."
---

# Signal Data Validator

Validates intelligence signal data integrity per DATA_PROVENANCE_POLICY.md.

## Signal table structure

```bash
echo "=== SIGNAL TABLE SCHEMA ==="
cd SOCELLE-WEB
grep -rn "market_signals\|salon_signals\|brand_signals" supabase/migrations/ 2>/dev/null | grep "CREATE\|ALTER\|updated_at\|confidence\|source\|provenance" | head -20
```

## Freshness check (updated_at usage)

```bash
echo "=== FRESHNESS / UPDATED_AT ==="
cd SOCELLE-WEB
echo "Tables with updated_at column:"
grep -rn "updated_at" supabase/migrations/ 2>/dev/null | grep -i "ADD\|CREATE\|column" | wc -l
echo "---"
echo "Hooks referencing updated_at:"
grep -rl "updated_at" src/hooks/ 2>/dev/null | wc -l
echo "---"
echo "Components displaying time-ago without updated_at:"
grep -rn "ago\|timeAgo\|formatDistance\|fromNow" src/components/ src/pages/ 2>/dev/null | grep -v "updated_at\|node_modules" | head -10
```

## Confidence scoring

```bash
echo "=== CONFIDENCE SCORING ==="
cd SOCELLE-WEB
grep -rn "confidence\|confidence_tier\|confidence_score" src/ supabase/ 2>/dev/null | grep -v node_modules | head -15
```

## Source attribution

```bash
echo "=== SOURCE ATTRIBUTION ==="
cd SOCELLE-WEB
grep -rn "source_url\|source_name\|attribution\|provenance" src/ supabase/ 2>/dev/null | grep -v node_modules | head -15
```

## Output

Write `docs/qa/signal_data_validation.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "market_signals\|updated_at" SOCELLE-WEB/src/hooks/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/signal-data-validator-YYYY-MM-DD.json`
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
