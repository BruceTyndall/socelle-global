---
name: type-generation-validator
description: "Validates TypeScript type generation: database.types.ts coverage, manual type overrides, any-type usage, and strict mode compliance. Triggers on: 'type generation', 'TypeScript types', 'any type usage', 'strict mode', 'type coverage', 'type safety'."
---

# Type Generation Validator

Validates TypeScript type safety and generation.

## Strict mode check

```bash
echo "=== STRICT MODE ==="
cd SOCELLE-WEB
grep -n "strict" tsconfig.json tsconfig.app.json 2>/dev/null
echo "---"
echo "noImplicitAny:"
grep "noImplicitAny" tsconfig*.json 2>/dev/null
```

## Any type usage

```bash
echo "=== ANY TYPE USAGE ==="
cd SOCELLE-WEB
echo "Files with 'any' type:"
grep -rn ": any\b\|as any\b\|<any>" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | wc -l
echo "---"
echo "Top offenders:"
grep -rl ": any\b\|as any\b" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | xargs -I{} sh -c 'echo "$(grep -c ": any\|as any" {} 2>/dev/null) {}"' | sort -rn | head -10
```

## Type imports from database.types.ts

```bash
echo "=== TYPE IMPORTS ==="
cd SOCELLE-WEB
echo "Files importing from types.ts:"
grep -rl "from.*supabase.*types\|from.*database.*types" src/ 2>/dev/null | grep -v node_modules | wc -l
echo "---"
echo "Files with manual type definitions (potential drift):"
grep -rl "interface.*Row\|type.*Row\s*=" src/ 2>/dev/null | grep -v "node_modules\|types\.ts\|\.d\.ts" | head -10
```

## ts-ignore / ts-expect-error

```bash
echo "=== TYPE SUPPRESSIONS ==="
cd SOCELLE-WEB
echo "@ts-ignore:"
grep -rn "@ts-ignore" src/ 2>/dev/null | grep -v node_modules | wc -l
echo "@ts-expect-error:"
grep -rn "@ts-expect-error" src/ 2>/dev/null | grep -v node_modules | wc -l
echo "---"
echo "Top files with suppressions:"
grep -rl "@ts-ignore\|@ts-expect-error" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Output
Write `docs/qa/type_generation_validation.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -c "any" SOCELLE-WEB/src/types/database.types.ts 2>/dev/null  # expect 0 or low`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/type-generation-validator-YYYY-MM-DD.json`
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
