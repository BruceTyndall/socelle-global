---
name: provenance-checker
description: "Verifies data provenance implementation: source citation on every signal, freshness SLA compliance, and attribution display. Triggers on: 'provenance check', 'source citation', 'data attribution', 'freshness SLA', 'provenance display'."
---

# Provenance Checker

Validates data provenance and attribution per DATA_PROVENANCE_POLICY.md.

## Provenance columns in schema

```bash
echo "=== PROVENANCE SCHEMA ==="
cd SOCELLE-WEB
grep -rn "source\|provenance\|attribution\|cited_from\|data_origin" supabase/migrations/ 2>/dev/null | grep -i "ADD\|CREATE\|column" | head -15
```

## Provenance display in components

```bash
echo "=== PROVENANCE UI ==="
cd SOCELLE-WEB
grep -rn "source\|Source\|provenance\|Provenance\|attribution\|cited" src/components/ src/pages/ 2>/dev/null | grep -v "node_modules\|\.d\.ts\|import\|dataSource\|EventSource" | head -20
```

## Freshness SLA check

```bash
echo "=== FRESHNESS SLA ==="
cd SOCELLE-WEB
# Check for stale data detection logic
grep -rn "stale\|isStale\|freshness\|maxAge\|ttl\|cache.*time\|refresh.*interval" src/ 2>/dev/null | grep -v node_modules | head -15
```

## Missing attribution (signals without source)

```bash
echo "=== SIGNALS WITHOUT SOURCE ==="
cd SOCELLE-WEB
# Find signal-rendering components that don't reference a source field
for f in src/components/intelligence/*.tsx src/components/signals/*.tsx; do
  [ -f "$f" ] || continue
  has_signal=$(grep -c "signal\|Signal" "$f" 2>/dev/null)
  has_source=$(grep -c "source\|provenance\|attribution" "$f" 2>/dev/null)
  if [ "$has_signal" -gt 0 ] && [ "$has_source" -eq 0 ]; then
    echo "NO SOURCE: $(basename $f) (renders signals but no attribution)"
  fi
done 2>/dev/null
```

## Output

Write `docs/qa/provenance_check.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "source\|attribution\|provenance" SOCELLE-WEB/src/hooks/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/provenance-checker-YYYY-MM-DD.json`
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
