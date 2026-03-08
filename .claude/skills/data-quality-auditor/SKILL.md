---
name: data-quality-auditor
description: "Audits and validates data feed quality, coverage, and freshness across SOCELLE's intelligence pipeline. Use this skill whenever someone asks about data quality, feed coverage, geographic expansion readiness, data freshness, source reliability, feed health, or pipeline completeness. Also triggers on: 'data audit', 'feed quality', 'source coverage', 'data freshness', 'geographic coverage', 'feed health check', 'pipeline validation', 'data completeness'. This extends feed-source-auditor with deeper quality metrics, tiering, and expansion planning for international markets."
---

# Data Quality Auditor

Audits intelligence data feeds for quality, freshness, coverage gaps, and expansion readiness. SOCELLE's intelligence value depends entirely on the quality and breadth of its data — if feeds go stale, sources dry up, or geographic coverage has blind spots, the intelligence product loses credibility. This skill provides a systematic way to measure and improve data quality.

## Quality Dimensions

| Dimension | What It Measures | Target |
|-----------|-----------------|--------|
| Freshness | Time since last successful feed pull | < 24h for market signals, < 7d for brand profiles |
| Completeness | % of expected fields populated | > 90% for core fields |
| Accuracy | Validated against authoritative sources | Confidence score ≥ 0.7 |
| Coverage | Geographic/category breadth | All target markets represented |
| Uniqueness | Duplicate detection across sources | < 5% duplicate rate |

## Step 1: Inventory All Data Sources

```bash
echo "=== DATA SOURCE INVENTORY ==="
cd SOCELLE-WEB

# Supabase tables with data
echo "Tables with row counts (estimate):"
grep -rn "from.*select\|\.from(" src/hooks/ src/integrations/ 2>/dev/null | grep -v node_modules | sed 's/.*from[("'"'"']\([^"'"'"')]*\).*/\1/' | sort -u | head -20

# External API integrations
echo "External API calls:"
grep -rn "fetch\|axios\|http.*get\|http.*post" src/ supabase/functions/ 2>/dev/null | grep -v node_modules | grep -i "api\|feed\|external" | head -15

# RSS/webhook sources
echo "RSS and webhook endpoints:"
grep -rn "rss\|webhook\|feed.*url\|atom\|xml.*feed" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 2: Freshness Audit

```bash
echo "=== FRESHNESS CHECK ==="
cd SOCELLE-WEB

# Tables with updated_at columns
echo "Tables with freshness tracking:"
grep -rn "updated_at\|last_updated\|fetched_at\|refreshed_at" supabase/migrations/ 2>/dev/null | grep -i "ADD\|CREATE" | head -15

# Hardcoded timestamps (fake freshness)
echo "Hardcoded timestamps (freshness fakes):"
grep -rn "2024-\|2025-\|2026-" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts\|package" | grep -i "date\|time\|update\|fresh" | head -10
```

## Step 3: Coverage Gap Analysis

For each target market, check:
1. **US domestic**: All 50 states represented in feed sources?
2. **Category breadth**: Skincare, haircare, nails, wellness, medspas, devices all covered?
3. **Brand depth**: Top 100 professional beauty brands in the system?
4. **International readiness**: SEA, EU, LATAM source availability?

```bash
echo "=== COVERAGE ANALYSIS ==="
cd SOCELLE-WEB

# Geographic references
echo "Geographic coverage in data:"
grep -rin "state\|region\|country\|market.*area\|zip.*code\|postal" supabase/migrations/ 2>/dev/null | head -10

# Category taxonomy
echo "Category taxonomy:"
grep -rin "category\|vertical\|segment\|classification" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 4: Quality Score Card

Generate a quality score card:

| Source | Freshness | Completeness | Accuracy | Coverage | Overall |
|--------|-----------|-------------|----------|----------|---------|
| [source] | A/B/C/D/F | A/B/C/D/F | A/B/C/D/F | A/B/C/D/F | A/B/C/D/F |

Grading: A = exceeds target, B = meets target, C = approaching target, D = below target, F = failing/missing

## Output

Write to `docs/qa/data_quality_audit.json`:
```json
{
  "skill": "data-quality-auditor",
  "total_sources": 0,
  "sources_fresh": 0,
  "sources_stale": 0,
  "coverage_score": "A-F",
  "completeness_pct": 0,
  "duplicate_rate_pct": 0,
  "expansion_gaps": [],
  "recommendations": [],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "data-quality-auditor*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/data-quality-auditor-YYYY-MM-DD.json`
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
