---
name: hub-shell-detector
description: "Detects hub shell pages — pages that exist in routing but have no real content or functionality. Use this skill to: find placeholder/stub pages, detect pages with only static text and no data hooks, find pages missing key interactive elements, and classify each hub as LIVE/SHELL/STUB. Triggers on: 'hub shell', 'stub pages', 'placeholder detection', 'empty pages', 'hub status', 'shell audit'."
---

# Hub Shell Detector

Identifies pages that exist in routing but are shells (no real data, no interactivity).

## Page content analysis

```bash
echo "=== PAGE CONTENT ANALYSIS ==="
cd SOCELLE-WEB
for page in src/pages/*.tsx src/pages/**/*.tsx; do
  if [ -f "$page" ]; then
    name=$(basename "$page" .tsx)
    lines=$(wc -l < "$page")
    has_hook=$(grep -c "use[A-Z]" "$page" 2>/dev/null)
    has_supabase=$(grep -c "supabase\|useQuery\|from(" "$page" 2>/dev/null)
    has_form=$(grep -c "form\|input\|button.*onClick\|onSubmit" "$page" 2>/dev/null)
    has_static_only=$([ "$has_hook" -eq 0 ] && [ "$has_supabase" -eq 0 ] && [ "$has_form" -eq 0 ] && echo "YES" || echo "NO")

    if [ "$has_static_only" = "YES" ]; then
      echo "SHELL: $name (lines=$lines, no hooks, no DB, no forms)"
    elif [ "$has_supabase" -eq 0 ] && [ "$lines" -lt 50 ]; then
      echo "STUB: $name (lines=$lines, no DB connection)"
    fi
  fi
done 2>/dev/null
```

## Coming Soon / Under Construction detection

```bash
echo "=== COMING SOON PAGES ==="
cd SOCELLE-WEB
grep -rln "coming soon\|under construction\|placeholder\|TODO.*implement\|stub" src/pages/ 2>/dev/null | head -20
```

## Hub classification

```bash
echo "=== HUB CLASSIFICATION ==="
cd SOCELLE-WEB
# Check Intelligence Hub pages
echo "--- Intelligence Hub ---"
for f in src/pages/Intelligence*.tsx src/pages/portal/Intelligence*.tsx src/pages/brand/Intelligence*.tsx; do
  [ -f "$f" ] && echo "$(basename $f): $(grep -c 'supabase\|useQuery\|use[A-Z].*(' "$f" 2>/dev/null) data hooks"
done 2>/dev/null

echo "--- Education Hub ---"
for f in src/pages/Education*.tsx src/pages/Protocols*.tsx; do
  [ -f "$f" ] && echo "$(basename $f): $(grep -c 'supabase\|useQuery\|use[A-Z].*(' "$f" 2>/dev/null) data hooks"
done 2>/dev/null

echo "--- Brand Hub ---"
for f in src/pages/brand/*.tsx; do
  [ -f "$f" ] && echo "$(basename $f): $(grep -c 'supabase\|useQuery\|use[A-Z].*(' "$f" 2>/dev/null) data hooks"
done 2>/dev/null
```

## Output

Write `docs/qa/hub_shell_report.json`:

```json
{
  "scan_date": "ISO",
  "classifications": {
    "LIVE": [],
    "SHELL": [],
    "STUB": []
  },
  "coming_soon_pages": [],
  "total_pages": 0,
  "live_pct": 0,
  "shell_pct": 0,
  "stub_pct": 0
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "TODO\|PLACEHOLDER\|STUB" SOCELLE-WEB/src/pages/ | wc -l  # expect decreasing`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/hub-shell-detector-YYYY-MM-DD.json`
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
