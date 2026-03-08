---
name: language-linter
description: "Scans all user-facing text for banned terms, weak language, and non-compliant copy per SOCELLE_CANONICAL_DOCTRINE.md. Use this skill to: find all 67 banned terms, detect passive voice on CTAs, find generic marketing language, check heading hierarchy, and enforce the SOCELLE voice. Triggers on: 'language lint', 'banned terms', 'copy check', 'voice compliance', 'weak language', 'text audit'."
---

# Language Linter

Scans all user-facing text for banned terms and voice compliance.

## Banned term scan

```bash
echo "=== BANNED TERM SCAN ==="
cd SOCELLE-WEB
BANNED="dashboard onboard empower leverage synergy disrupt scalable best-in-class cutting-edge world-class game-changing revolutionary innovative seamless holistic robust state-of-the-art next-generation paradigm ecosystem turnkey enterprise-grade mission-critical"
for term in $BANNED; do
  count=$(grep -ri "$term" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | wc -l)
  [ "$count" -gt 0 ] && echo "BANNED: '$term' found $count times"
done
echo "---"
echo "Specific high-priority bans from doctrine:"
echo "'dashboard':"
grep -rn "dashboard" src/pages/ src/components/ 2>/dev/null | grep -vi "node_modules\|Admin" | wc -l
echo "'onboard':"
grep -rn "onboard" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | wc -l
echo "'empower':"
grep -rn "empower" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | wc -l
```

## Generic marketing language detection

```bash
echo "=== GENERIC MARKETING LANGUAGE ==="
cd SOCELLE-WEB
grep -rni "take your.*to the next level\|transform your\|unlock your\|elevate your\|supercharge\|turbocharge\|reimagine\|disruptive" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | head -15
```

## CTA quality check

```bash
echo "=== CTA QUALITY ==="
cd SOCELLE-WEB
# Find CTA buttons
grep -rn "Get Started\|Sign Up\|Learn More\|Try Free\|Start Now\|Join Now\|Subscribe" src/ 2>/dev/null | grep -v node_modules | head -20
echo "---"
echo "Primary CTA (should be intelligence-focused):"
grep -rn "Get Intelligence\|Access Intelligence\|Get.*Access" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Output

Write `docs/qa/language_lint.json`:

```json
{
  "scan_date": "ISO",
  "banned_terms_found": {},
  "generic_marketing": [],
  "cta_inventory": [],
  "intelligence_ctas": 0,
  "generic_ctas": 0,
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rnic "game.changer\|revolutionary\|disrupt" SOCELLE-WEB/src/ | tail -1  # expect 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/language-linter-YYYY-MM-DD.json`
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
