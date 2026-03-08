---
name: dependency-scanner
description: "Scans project dependencies for outdated packages, security vulnerabilities, unused deps, and version conflicts. Use this skill to: run npm audit, find outdated packages, detect unused dependencies, check for duplicate packages, and verify locked technology decisions match installed versions. Triggers on: 'dependency audit', 'npm audit', 'outdated packages', 'unused deps', 'version check', 'package security'."
---

# Dependency Scanner

Audits all npm dependencies across the monorepo.

## Security audit

```bash
echo "=== SECURITY AUDIT ==="
cd SOCELLE-WEB
npm audit --json 2>/dev/null | head -30 || echo "npm audit failed"
echo "---"
echo "Vulnerability summary:"
npm audit 2>/dev/null | tail -5
```

## Outdated packages

```bash
echo "=== OUTDATED PACKAGES ==="
cd SOCELLE-WEB
npm outdated 2>/dev/null | head -30
echo "---"
echo "Key framework versions (current → latest):"
for pkg in react react-dom vite typescript @vitejs/plugin-react tailwindcss; do
  current=$(grep "\"$pkg\"" package.json 2>/dev/null | grep -oP '"\^?[\d.]+"' | tr -d '"^')
  echo "$pkg: $current"
done
```

## Unused dependency detection

```bash
echo "=== POTENTIALLY UNUSED DEPENDENCIES ==="
cd SOCELLE-WEB
# Check each dependency for import usage
DEPS=$(cat package.json | grep -oP '"(@?[^"]+)":\s*"[\^~]' | grep -oP '"[^"]+' | tr -d '"' | head -30)
for dep in $DEPS; do
  # Skip @types packages
  echo "$dep" | grep -q "@types/" && continue
  uses=$(grep -rl "from ['\"]$dep\|require(['\"]$dep" src/ 2>/dev/null | wc -l)
  if [ "$uses" -eq 0 ]; then
    echo "UNUSED?: $dep (0 imports found)"
  fi
done
```

## Locked technology verification

```bash
echo "=== LOCKED TECH DECISIONS ==="
cd SOCELLE-WEB
echo "React: $(grep '"react"' package.json | grep -oP '[\d.]+')"
echo "Vite: $(grep '"vite"' package.json | grep -oP '[\d.]+')"
echo "TypeScript: $(grep '"typescript"' package.json | grep -oP '[\d.]+')"
echo "Tailwind: $(grep '"tailwindcss"' package.json | grep -oP '[\d.]+')"
echo "Supabase JS: $(grep '"@supabase/supabase-js"' package.json | grep -oP '[\d.]+')"
echo "React Router: $(grep '"react-router' package.json | grep -oP '[\d.]+')"
echo "---"
echo "NOT YET INSTALLED (per work order):"
for pkg in "@tanstack/react-query" "@sentry/react" "bullmq" "zod" "posthog-js"; do
  found=$(grep -c "\"$pkg\"" package.json 2>/dev/null)
  [ "$found" -eq 0 ] && echo "MISSING: $pkg" || echo "INSTALLED: $pkg"
done
```

## Output

Write `docs/qa/dependency_scan.json`:

```json
{
  "scan_date": "ISO",
  "total_deps": 0,
  "vulnerabilities": {"critical": 0, "high": 0, "moderate": 0, "low": 0},
  "outdated": [],
  "unused": [],
  "locked_tech_status": {},
  "missing_required": []
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `cd SOCELLE-WEB && npm audit --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('vulnerabilities',{}).get('critical',0))"  # expect 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/dependency-scanner-YYYY-MM-DD.json`
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
