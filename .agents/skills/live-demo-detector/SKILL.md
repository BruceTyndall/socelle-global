---
name: live-demo-detector
description: "Detects LIVE vs DEMO data surfaces across the SOCELLE codebase. Use this skill to: find hardcoded arrays presented as live data, verify isLive flags exist on data hooks, check for PREVIEW/DEMO badges, find fake timestamps or counts, and produce a compliance report. Triggers on: 'live demo check', 'fake data audit', 'isLive check', 'DEMO badge audit', 'truth detection', 'hardcoded data scan'."
---

# Live/Demo Detector

Scans all data hooks and pages for LIVE vs DEMO compliance per SOCELLE_CANONICAL_DOCTRINE.md §F.

## Hardcoded array detection

```bash
echo "=== HARDCODED ARRAYS IN HOOKS ==="
cd SOCELLE-WEB
# Find hooks with static arrays that look like data
for f in src/hooks/use*.ts src/hooks/use*.tsx src/integrations/supabase/hooks/*.ts; do
  if [ -f "$f" ]; then
    has_static=$(grep -c "const.*=.*\[" "$f" 2>/dev/null)
    has_supabase=$(grep -c "useQuery\|supabase\|from(" "$f" 2>/dev/null)
    if [ "$has_static" -gt 0 ] && [ "$has_supabase" -eq 0 ]; then
      echo "DEMO: $(basename $f) — static array, no Supabase query"
    fi
  fi
done 2>/dev/null
```

## isLive flag check

```bash
echo "=== isLive FLAG USAGE ==="
cd SOCELLE-WEB
grep -rn "isLive" src/ 2>/dev/null | grep -v node_modules | head -20
echo "---"
echo "Hooks WITH isLive:"
grep -rl "isLive" src/hooks/ 2>/dev/null | wc -l
echo "Hooks WITHOUT isLive:"
find src/hooks -name 'use*.ts' -o -name 'use*.tsx' | wc -l
```

## PREVIEW/DEMO badge check

```bash
echo "=== DEMO BADGE USAGE ==="
cd SOCELLE-WEB
grep -rn "DEMO\|PREVIEW\|preview-badge\|demo-badge\|PreviewBanner" src/ 2>/dev/null | grep -v node_modules | head -20
echo "---"
echo "Pages with DEMO/PREVIEW labels:"
grep -rl "DEMO\|PREVIEW\|PreviewBanner" src/pages/ 2>/dev/null | wc -l
```

## Fake timestamp detection

```bash
echo "=== FAKE TIMESTAMPS ==="
cd SOCELLE-WEB
# Find hardcoded "Updated X ago" or "X minutes ago" without DB reference
grep -rn "ago\"\|minutes ago\|hours ago\|Updated.*ago" src/ 2>/dev/null | grep -v "node_modules\|updated_at\|formatDistance" | head -15
echo "---"
# Find hardcoded counts
grep -rn "count.*=.*[0-9][0-9]" src/pages/ 2>/dev/null | grep -v "node_modules\|\.length\|COUNT" | head -15
```

## Output

Write `docs/qa/live_demo_compliance.json`:

```json
{
  "scan_date": "ISO",
  "demo_hooks": [{"hook": "name", "reason": "static array, no DB query"}],
  "hooks_with_isLive": 0,
  "hooks_without_isLive": 0,
  "pages_with_demo_badge": 0,
  "fake_timestamps": [],
  "hardcoded_counts": [],
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "isLive" SOCELLE-WEB/src/hooks/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/live-demo-detector-YYYY-MM-DD.json`
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
