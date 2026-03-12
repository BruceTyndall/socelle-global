---
name: env-validator
description: "Validates environment variable configuration across all apps and runtimes. Use this skill to: check .env files exist with required vars, verify .env.example parity, detect missing vars between environments, audit env var usage in code vs declaration, and check for hardcoded env values. Triggers on: 'env check', 'environment variables', '.env audit', 'config validation', 'env parity'."
---

# Env Validator

Validates environment variable hygiene across all runtimes.

## Env file inventory

```bash
echo "=== ENV FILE INVENTORY ==="
cd SOCELLE-WEB
for f in .env .env.local .env.example .env.production .env.development .env.test; do
  if [ -f "$f" ]; then
    vars=$(grep -c "=" "$f" 2>/dev/null)
    echo "FOUND: $f ($vars vars)"
  else
    echo "MISSING: $f"
  fi
done
echo "---"
echo "Root-level env files:"
cd ..
for f in .env .env.local .env.example; do
  [ -f "$f" ] && echo "FOUND: $f" || echo "MISSING: $f"
done
```

## Required vars check

```bash
echo "=== REQUIRED VARS ==="
cd SOCELLE-WEB
REQUIRED="VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY"
for var in $REQUIRED; do
  found=$(grep -c "$var" .env 2>/dev/null)
  if [ "$found" -gt 0 ]; then
    echo "OK: $var"
  else
    echo "MISSING: $var"
  fi
done
```

## Code-vs-declaration parity

```bash
echo "=== VARS USED IN CODE BUT NOT IN .ENV ==="
cd SOCELLE-WEB
# Extract all VITE_ vars used in code
CODE_VARS=$(grep -roh "import\.meta\.env\.\w\+\|process\.env\.\w\+" src/ 2>/dev/null | sed 's/import.meta.env.//;s/process.env.//' | sort -u)
for var in $CODE_VARS; do
  found=$(grep -c "$var" .env .env.local 2>/dev/null)
  if [ "$found" -eq 0 ]; then
    echo "UNDECLARED: $var (used in code, not in .env)"
  fi
done
```

## Hardcoded env values

```bash
echo "=== HARDCODED ENV VALUES ==="
cd SOCELLE-WEB
grep -rn "supabase\.co\|supabase\.in\|https://.*\.supabase\." src/ 2>/dev/null | grep -v "node_modules\|\.env\|import\.meta" | head -10
```

## Output

Write `docs/qa/env_validation.json`:

```json
{
  "scan_date": "ISO",
  "env_files": {"found": [], "missing": []},
  "required_vars": {"present": [], "missing": []},
  "undeclared_vars": [],
  "hardcoded_values": [],
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `diff <(grep -oP "^[A-Z_]+" SOCELLE-WEB/.env.example | sort) <(grep -oP "^[A-Z_]+" SOCELLE-WEB/.env | sort)  # expect no diff`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/env-validator-YYYY-MM-DD.json`
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
