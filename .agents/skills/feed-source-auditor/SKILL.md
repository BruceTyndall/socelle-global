---
name: feed-source-auditor
description: "Audits all data feed sources against the allowed/disallowed list in DATA_PROVENANCE_POLICY.md. Checks RSS feeds, API endpoints, scraping targets, and third-party data integrations. Triggers on: 'feed sources', 'data sources', 'RSS audit', 'provenance sources', 'allowed sources', 'feed compliance'."
---

# Feed Source Auditor

Validates data feed sources against provenance policy.

## RSS feed inventory

```bash
echo "=== RSS FEED SOURCES ==="
cd SOCELLE-WEB
grep -rn "rss\|RSS\|feed_url\|feedUrl\|xml" src/ supabase/ 2>/dev/null | grep -v node_modules | head -20
echo "---"
echo "RSS-related edge functions:"
find supabase/functions -name "*rss*" -o -name "*feed*" 2>/dev/null
```

## External API endpoints

```bash
echo "=== EXTERNAL API ENDPOINTS ==="
cd SOCELLE-WEB
grep -rn "https://\|http://" src/ supabase/ 2>/dev/null | grep -v "node_modules\|supabase\.co\|localhost\|127\.0\.\|\.svg\|\.png\|\.jpg\|cdn\." | head -20
```

## Scraping/crawling targets

```bash
echo "=== SCRAPING TARGETS ==="
cd SOCELLE-WEB
grep -rn "scrape\|crawl\|cheerio\|puppeteer\|playwright.*http" supabase/ 2>/dev/null | head -10
```

## Data pipeline edge functions

```bash
echo "=== DATA PIPELINE FUNCTIONS ==="
cd SOCELLE-WEB
for fn in supabase/functions/*/; do
  name=$(basename "$fn")
  if echo "$name" | grep -qi "feed\|ingest\|sync\|import\|fetch\|scrape\|rss"; then
    echo "PIPELINE FN: $name"
    head -10 "$fn/index.ts" 2>/dev/null
    echo "---"
  fi
done
```

## Output

Write `docs/qa/feed_source_audit.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "RSS\|feed_url\|api_endpoint" SOCELLE-WEB/src/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/feed-source-auditor-YYYY-MM-DD.json`
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
