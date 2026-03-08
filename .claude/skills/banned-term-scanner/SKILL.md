---
name: banned-term-scanner
description: "Deep scan for all 67 banned terms from SOCELLE_CANONICAL_DOCTRINE.md across every surface. Use this skill to: find exact and partial matches of every banned term, report file+line for each occurrence, generate a fix list with suggested replacements, and track remediation progress. Triggers on: 'banned terms', 'doctrine terms', 'term scan', 'forbidden words', 'term remediation'."
---

# Banned Term Scanner

Deep scan for all doctrine-banned terms with replacement suggestions.

## Full banned term list scan

```bash
echo "=== FULL BANNED TERM SCAN ==="
cd SOCELLE-WEB
# Priority banned terms from doctrine
declare -A REPLACEMENTS
REPLACEMENTS[dashboard]="Control Center / Intelligence Hub"
REPLACEMENTS[onboard]="activate / get started"
REPLACEMENTS[empower]="equip / enable"
REPLACEMENTS[leverage]="use / apply"
REPLACEMENTS[synergy]="(remove)"
REPLACEMENTS[disrupt]="(remove)"
REPLACEMENTS[scalable]="(remove or be specific)"
REPLACEMENTS[seamless]="smooth / integrated"
REPLACEMENTS[holistic]="complete / comprehensive"
REPLACEMENTS[robust]="reliable / strong"
REPLACEMENTS[innovative]="(remove — show, don't tell)"
REPLACEMENTS[revolutionary]="(remove)"
REPLACEMENTS[cutting-edge]="(remove)"
REPLACEMENTS[game-changing]="(remove)"
REPLACEMENTS[best-in-class]="(remove)"
REPLACEMENTS[world-class]="(remove)"
REPLACEMENTS[next-generation]="(remove)"
REPLACEMENTS[ecosystem]="platform / network"
REPLACEMENTS[paradigm]="(remove)"
REPLACEMENTS[turnkey]="ready-to-use"

for term in "${!REPLACEMENTS[@]}"; do
  matches=$(grep -rni "$term" src/pages/ src/components/ 2>/dev/null | grep -v node_modules)
  count=$(echo "$matches" | grep -c . 2>/dev/null)
  if [ "$count" -gt 0 ]; then
    echo "BANNED: '$term' → replace with: ${REPLACEMENTS[$term]} ($count occurrences)"
    echo "$matches" | head -3
    echo ""
  fi
done
```

## Public page specific scan

```bash
echo "=== PUBLIC PAGE BANNED TERMS ==="
cd SOCELLE-WEB
PUBLIC_DIRS="src/pages/public src/pages/Home src/pages/Intelligence"
for dir in $PUBLIC_DIRS; do
  if [ -d "$dir" ]; then
    echo "--- $dir ---"
    grep -rni "dashboard\|onboard\|empower\|leverage\|synergy\|disrupt\|scalable\|seamless\|holistic\|robust\|innovative\|revolutionary" "$dir" 2>/dev/null | head -10
  fi
done
```

## Output

Write `docs/qa/banned_term_scan.json`:

```json
{
  "scan_date": "ISO",
  "total_violations": 0,
  "by_term": {},
  "by_file": {},
  "public_page_violations": 0,
  "portal_violations": 0,
  "suggested_replacements": {}
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rnic "one-stop\|ecosystem\|synergy" SOCELLE-WEB/src/ | tail -1  # expect 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/banned-term-scanner-YYYY-MM-DD.json`
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
