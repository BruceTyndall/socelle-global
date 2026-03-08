---
name: intelligence-module-checker
description: "Verifies all 10 Intelligence Cloud modules exist and are wired to live data. Use this skill to: check each module component exists, verify data hooks per module, detect mock/placeholder data, validate tier gating on premium modules, and produce a module readiness matrix. Triggers on: 'intelligence modules', 'Intelligence Cloud check', 'module readiness', 'intelligence audit', 'KPI strip', 'signal table', 'trend stacks'."
---

# Intelligence Module Checker

Verifies readiness of all 10 Intelligence Cloud modules.

## Module component inventory

```bash
echo "=== 10 INTELLIGENCE CLOUD MODULES ==="
cd SOCELLE-WEB
MODULES="KPIStrip SignalTable TrendStack WhatChanged OpportunitySignal ConfidenceProvenance CategoryIntelligence CompetitiveBenchmark BrandHealthMonitor LocalMarketView"
for mod in $MODULES; do
  files=$(find src/ -name "*$mod*" -o -name "*$(echo $mod | sed 's/\([A-Z]\)/_\L\1/g;s/^_//')*" 2>/dev/null | grep -v node_modules | head -3)
  if [ -n "$files" ]; then
    echo "FOUND: $mod"
    echo "$files" | head -2
  else
    echo "MISSING: $mod"
  fi
done
```

## Data hook wiring per module

```bash
echo "=== MODULE DATA HOOKS ==="
cd SOCELLE-WEB
echo "useIntelligence:" && grep -rl "useIntelligence" src/ 2>/dev/null | grep -v node_modules | head -5
echo "useSalonSignals:" && grep -rl "useSalonSignals" src/ 2>/dev/null | grep -v node_modules | head -5
echo "useSignalCategories:" && grep -rl "useSignalCategories" src/ 2>/dev/null | grep -v node_modules | head -5
echo "useBenchmarkData:" && grep -rl "useBenchmarkData" src/ 2>/dev/null | grep -v node_modules | head -5
echo "useBrandIntelligence:" && grep -rl "useBrandIntelligence" src/ 2>/dev/null | grep -v node_modules | head -5
echo "useRssItems:" && grep -rl "useRssItems" src/ 2>/dev/null | grep -v node_modules | head -5
```

## Mock data detection per module

```bash
echo "=== MOCK DATA IN INTELLIGENCE MODULES ==="
cd SOCELLE-WEB
for dir in src/pages/Intelligence* src/pages/portal/Intelligence* src/components/intelligence/; do
  [ -d "$dir" ] || [ -f "$dir" ] && grep -l "mock\|Mock\|DEMO\|hardcoded\|sample\|placeholder" "$dir" 2>/dev/null | head -5
done 2>/dev/null
```

## Output

Write `docs/qa/intelligence_module_check.json`:

```json
{
  "scan_date": "ISO",
  "modules": {
    "KPIStrip": {"exists": false, "hook": "", "live_data": false},
    "SignalTable": {"exists": false, "hook": "", "live_data": false},
    "TrendStacks": {"exists": false, "hook": "", "live_data": false},
    "WhatChanged": {"exists": false, "hook": "", "live_data": false},
    "OpportunitySignals": {"exists": false, "hook": "", "live_data": false},
    "ConfidenceProvenance": {"exists": false, "hook": "", "live_data": false},
    "CategoryIntelligence": {"exists": false, "hook": "", "live_data": false},
    "CompetitiveBenchmarking": {"exists": false, "hook": "", "live_data": false},
    "BrandHealthMonitor": {"exists": false, "hook": "", "live_data": false},
    "LocalMarketView": {"exists": false, "hook": "", "live_data": false}
  },
  "modules_found": 0,
  "modules_with_live_data": 0,
  "readiness_pct": 0
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "KPIStrip\|SignalTable\|TrendStack" SOCELLE-WEB/src/ | wc -l  # expect > 0 per module`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/intelligence-module-checker-YYYY-MM-DD.json`
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
