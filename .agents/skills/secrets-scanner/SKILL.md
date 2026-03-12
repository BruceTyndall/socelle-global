---
name: secrets-scanner
description: "Secrets and environment variable security scanner. Use this skill to: detect leaked API keys, passwords, or tokens in source code, verify .env files are gitignored, check that environment variables are properly referenced (not hardcoded), and audit PAYMENT_BYPASS status. Triggers on: 'secrets scan', 'security check', 'env audit', 'leaked keys', 'payment bypass check', 'API key audit'."
---

# Secrets Scanner

Scans the SOCELLE GLOBAL codebase for exposed secrets and environment variable hygiene.

## Leaked secrets scan

```bash
echo "=== SECRET PATTERNS IN SOURCE ==="
cd SOCELLE-WEB
# Check for common secret patterns
grep -rn "sk_live_\|sk_test_\|AKIA\|AIza\|ghp_\|glpat-\|xoxb-\|xoxp-" src/ 2>/dev/null | head -20
echo "---"
grep -rn "password\s*=\s*['\"]" src/ 2>/dev/null | grep -v "type\|placeholder\|label\|name" | head -20
echo "---"
grep -rn "secret\s*=\s*['\"]" src/ 2>/dev/null | head -20
```

## Environment variable hygiene

```bash
echo "=== ENV FILE STATUS ==="
for f in .env .env.local .env.production .env.development; do
  echo "$f: $(test -f $f && echo 'EXISTS' || echo 'NOT FOUND')"
done
echo ""
echo "=== GITIGNORE CHECK ==="
grep -n "\.env" .gitignore 2>/dev/null
echo ""
echo "=== HARDCODED SUPABASE URLS ==="
grep -rn "supabase.co" src/ 2>/dev/null | grep -v "import\|node_modules" | head -10
```

## PAYMENT_BYPASS audit

```bash
echo "=== PAYMENT_BYPASS STATUS ==="
cd SOCELLE-WEB
grep -rn "PAYMENT_BYPASS\|paymentBypass\|payment_bypass" src/ 2>/dev/null
echo "---"
cat src/lib/paymentBypass.ts 2>/dev/null || echo "paymentBypass.ts NOT FOUND"
```

## Output

Write `docs/qa/secrets_scan.json`:

```json
{
  "scan_date": "ISO",
  "leaked_secrets": [],
  "env_files": { ".env": "EXISTS/MISSING", ".env.local": "EXISTS/MISSING" },
  "gitignore_covers_env": true,
  "hardcoded_urls": [],
  "payment_bypass": { "file": "path", "status": "ON/OFF", "env_var": "value" }
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "sk_live_\|SUPABASE_SERVICE_ROLE" SOCELLE-WEB/src/ | wc -l  # expect 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/secrets-scanner-YYYY-MM-DD.json`
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
