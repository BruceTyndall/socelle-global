---
name: credit-economy-validator
description: "Validates the value-credit economy: credit allocation per tier, cost per AI action, deduction logic, balance tracking, and overage handling. Triggers on: 'credit economy', 'credit system', 'credit balance', 'AI credits', 'credit deduction', 'credit allocation'."
---

# Credit Economy Validator

Validates credit economy implementation per work order specs.

## Credit system code

```bash
echo "=== CREDIT SYSTEM CODE ==="
cd SOCELLE-WEB
grep -rn "credit\|Credit" src/ supabase/ 2>/dev/null | grep -v "node_modules\|\.d\.ts\|// " | grep -i "balance\|deduct\|allocat\|cost\|consume\|remaining\|overage\|limit" | head -20
```

## Credit allocation per tier

```bash
echo "=== TIER CREDIT ALLOCATION ==="
cd SOCELLE-WEB
# Expected: Starter 500, Pro 2500, Enterprise 10000
grep -rn "500\|2500\|10000" src/ supabase/ 2>/dev/null | grep -i "credit\|allocation\|tier\|plan" | grep -v node_modules | head -10
```

## AI action credit costs

```bash
echo "=== AI ACTION COSTS ==="
cd SOCELLE-WEB
# Expected costs: semantic search 0.5, explain signal 1, brief 10, activation 30, synthesizer 40
grep -rn "credit.*cost\|creditCost\|CREDIT_COST\|action.*credit\|cost.*=.*[0-9]" src/ supabase/ 2>/dev/null | grep -v node_modules | head -15
```

## Credit DB tables

```bash
echo "=== CREDIT TABLES ==="
cd SOCELLE-WEB
grep -rn "credit" supabase/migrations/ 2>/dev/null | grep -i "CREATE TABLE\|ALTER TABLE\|ADD COLUMN" | head -10
```

## Output
Write `docs/qa/credit_economy_validation.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "credit\|balance\|deduct" SOCELLE-WEB/src/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/credit-economy-validator-YYYY-MM-DD.json`
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
