---
name: route-mapper
description: "Extracts and maps all routes from App.tsx, validates against GLOBAL_SITE_MAP.md, and detects orphan/missing routes. Use this skill to: generate a complete route manifest, find routes not in the site map, find site map entries not in code, check auth requirements per route, and detect duplicate paths. Triggers on: 'route map', 'route manifest', 'missing routes', 'orphan routes', 'site map validation', 'route audit'."
---

# Route Mapper

Extracts all routes from the codebase and cross-references against the canonical site map.

## Extract routes from App.tsx

```bash
echo "=== ROUTES FROM APP.TSX ==="
cd SOCELLE-WEB
grep -n "path=" src/App.tsx 2>/dev/null | sed 's/.*path=["'"'"']\([^"'"'"']*\).*/\1/' | sort -u
echo ""
echo "Total routes in App.tsx:"
grep -c "path=" src/App.tsx 2>/dev/null
```

## Extract routes from site map

```bash
echo "=== ROUTES FROM GLOBAL_SITE_MAP.md ==="
cd SOCELLE-WEB
# Extract route paths from the site map table
grep -oP '`/[^`]*`' ../docs/command/GLOBAL_SITE_MAP.md 2>/dev/null | tr -d '`' | sort -u
echo ""
# Also check SITE_MAP.md
grep -oP '`/[^`]*`' ../docs/command/SITE_MAP.md 2>/dev/null | tr -d '`' | sort -u | wc -l
echo " routes in SITE_MAP.md"
```

## Cross-reference: routes in code but not in site map

```bash
echo "=== ORPHAN ROUTES (in code, not in site map) ==="
cd SOCELLE-WEB
CODE_ROUTES=$(grep "path=" src/App.tsx 2>/dev/null | sed 's/.*path=["'"'"']\([^"'"'"']*\).*/\1/' | sort -u)
MAP_ROUTES=$(grep -oP '`/[^`]*`' ../docs/command/GLOBAL_SITE_MAP.md 2>/dev/null | tr -d '`' | sort -u)
comm -23 <(echo "$CODE_ROUTES") <(echo "$MAP_ROUTES") 2>/dev/null
```

## Auth requirement check

```bash
echo "=== AUTH REQUIREMENTS ==="
cd SOCELLE-WEB
# Find routes wrapped in ProtectedRoute
grep -B5 "ProtectedRoute\|requireAuth\|isProtected" src/App.tsx 2>/dev/null | grep "path=" | head -20
echo "---"
echo "Protected routes count:"
grep -B5 "ProtectedRoute" src/App.tsx 2>/dev/null | grep -c "path="
echo "Public routes count:"
grep "path=" src/App.tsx 2>/dev/null | wc -l
```

## Duplicate path detection

```bash
echo "=== DUPLICATE PATHS ==="
cd SOCELLE-WEB
grep "path=" src/App.tsx 2>/dev/null | sed 's/.*path=["'"'"']\([^"'"'"']*\).*/\1/' | sort | uniq -d
```

## Output

Write `docs/qa/route_map.json`:

```json
{
  "scan_date": "ISO",
  "code_routes": [],
  "sitemap_routes": [],
  "orphan_routes": [],
  "missing_from_code": [],
  "protected_routes": [],
  "public_routes": [],
  "duplicate_paths": [],
  "coverage_pct": 0
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -c "path=" SOCELLE-WEB/src/App.tsx  # expect matches GLOBAL_SITE_MAP count`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/route-mapper-YYYY-MM-DD.json`
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
