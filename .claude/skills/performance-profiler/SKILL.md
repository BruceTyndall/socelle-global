---
name: performance-profiler
description: "Profiles SOCELLE's web application performance including bundle size analysis, code splitting effectiveness, render performance, database query efficiency, and Core Web Vitals readiness. Use this skill whenever someone asks about performance, page speed, bundle size, code splitting, lazy loading, render time, database optimization, or Core Web Vitals. Also triggers on: 'performance', 'speed', 'bundle size', 'code splitting', 'lazy load', 'render time', 'slow page', 'optimize', 'Core Web Vitals', 'LCP', 'FID', 'CLS', 'query performance'. Performance directly impacts conversion — every 100ms of load time costs ~1% of revenue."
---

# Performance Profiler

Profiles application performance across bundle size, rendering, and database dimensions. SOCELLE's intelligence surfaces are data-heavy — dashboards with real-time signals, trend charts, and benchmark tables. Without optimization, these pages bloat and slow, undermining the "real-time intelligence" value proposition.

## Step 1: Bundle Analysis

```bash
echo "=== BUNDLE ANALYSIS ==="
cd SOCELLE-WEB

# Build and analyze
echo "Running production build..."
npx vite build --mode production 2>&1 | tail -20

# Check for large chunks
echo "Largest chunks:"
ls -lhS dist/assets/*.js 2>/dev/null | head -10

# Dynamic imports (code splitting)
echo "Dynamic imports (code splitting):"
grep -rn "React.lazy\|lazy(\|import(" src/ 2>/dev/null | grep -v node_modules | wc -l

# Tree-shaking indicators
echo "Barrel exports (tree-shaking blockers):"
grep -rn "export \* from" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Step 2: Render Performance

```bash
echo "=== RENDER ANALYSIS ==="
cd SOCELLE-WEB

# Unnecessary re-renders (missing memo/useMemo/useCallback)
echo "Components without memoization:"
grep -rL "React.memo\|useMemo\|useCallback" src/components/ 2>/dev/null | grep -v node_modules | wc -l

# Heavy computations in render path
echo "Potential render-path computations:"
grep -rn "\.filter(\|\.map(\|\.reduce(\|\.sort(" src/components/ src/pages/ 2>/dev/null | grep -v node_modules | grep -v "useMemo" | wc -l

# Image optimization
echo "Unoptimized images:"
grep -rn "<img.*src=\|<Image.*src=" src/ 2>/dev/null | grep -v node_modules | grep -v "lazy\|loading=" | wc -l
```

## Step 3: Database Query Efficiency

```bash
echo "=== QUERY EFFICIENCY ==="
cd SOCELLE-WEB

# N+1 query patterns
echo "Potential N+1 patterns (select in loops):"
grep -rn "\.from(\|\.select(" src/hooks/ 2>/dev/null | grep -v node_modules | head -10

# Missing indexes (check migrations for frequently queried columns)
echo "Index creation count:"
grep -c "CREATE INDEX\|CREATE UNIQUE INDEX" supabase/migrations/*.sql 2>/dev/null | tail -1

# Realtime subscriptions (each one is a persistent connection)
echo "Realtime subscriptions:"
grep -rn "\.on(\|subscribe()\|channel(" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Step 4: Performance Budget

| Metric | Target | Check |
|--------|--------|-------|
| Initial JS bundle | < 200KB gzipped | Build output |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| First Input Delay | < 100ms | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Supabase queries per page | < 5 | Hook analysis |

## Output

Write to `docs/qa/performance_profile.json`:
```json
{
  "skill": "performance-profiler",
  "bundle_size_kb": 0,
  "largest_chunk_kb": 0,
  "code_split_imports": 0,
  "barrel_exports": 0,
  "unmemoized_components": 0,
  "unoptimized_images": 0,
  "realtime_subscriptions": 0,
  "index_count": 0,
  "recommendations": [],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "performance-profiler*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/performance-profiler-YYYY-MM-DD.json`
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
