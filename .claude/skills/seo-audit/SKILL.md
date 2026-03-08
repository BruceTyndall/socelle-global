---
name: seo-audit
description: "Audits SOCELLE pages for SEO readiness including meta tags, structured data, Open Graph, canonical URLs, heading hierarchy, image alt text, and page speed indicators. Use this skill whenever someone asks about SEO, search rankings, meta tags, structured data, Open Graph, sitemap, robots.txt, page speed, or search visibility. Also triggers on: 'SEO check', 'meta tags', 'structured data', 'Open Graph', 'search optimization', 'Google ranking', 'sitemap', 'robots.txt', 'page speed', 'crawlability', 'search visibility'. Critical because SOCELLE's organic discovery depends on professional beauty search terms."
---

# SEO Audit

Audits every public-facing page for search engine optimization readiness. SOCELLE's acquisition model relies on on-site flows (CLAUDE.md §G prohibits cold outreach), so organic search is a primary growth channel. Poor SEO means invisible intelligence — users who need SOCELLE can't find it.

## Step 1: Meta Tag Coverage

```bash
echo "=== META TAG AUDIT ==="
cd SOCELLE-WEB

# Pages with Helmet/meta
echo "Pages with meta tags:"
grep -rn "Helmet\|<meta\|useHead\|useMeta" src/pages/ 2>/dev/null | grep -v node_modules | wc -l

# Pages WITHOUT meta tags
echo "Pages missing meta tags:"
for page in src/pages/*.tsx src/pages/**/*.tsx; do
  [ -f "$page" ] || continue
  has_meta=$(grep -c "Helmet\|<meta\|title.*=\|description.*=" "$page" 2>/dev/null)
  [ "$has_meta" -eq 0 ] && echo "  MISSING: $page"
done 2>/dev/null | head -20

# Open Graph tags
echo "Open Graph coverage:"
grep -rn "og:title\|og:description\|og:image\|og:type" src/ 2>/dev/null | grep -v node_modules | wc -l

# Canonical URLs
echo "Canonical URLs:"
grep -rn "canonical\|rel.*canonical" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Step 2: Structured Data

```bash
echo "=== STRUCTURED DATA ==="
cd SOCELLE-WEB

# JSON-LD / Schema.org
echo "Structured data markup:"
grep -rn "application/ld+json\|schema.org\|itemtype\|itemscope" src/ 2>/dev/null | grep -v node_modules | head -10

# Recommended schema types for SOCELLE:
# - Organization (homepage)
# - Product (brand pages)
# - Article (education/protocols)
# - FAQPage (FAQ sections)
# - BreadcrumbList (navigation)
```

## Step 3: Content Quality Signals

```bash
echo "=== CONTENT SIGNALS ==="
cd SOCELLE-WEB

# Heading hierarchy (H1 → H2 → H3, no skips)
echo "H1 tags per page (should be exactly 1):"
grep -rn "<h1\|<H1\|HeadingLevel.*1" src/pages/ 2>/dev/null | grep -v node_modules | head -10

# Image alt text
echo "Images missing alt text:"
grep -rn "<img\|<Image\|ImageRun" src/ 2>/dev/null | grep -v node_modules | grep -v "alt=" | head -10

# Internal linking
echo "Internal links:"
grep -rn "href.*=.*['\"]/" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | wc -l
```

## Step 4: Technical SEO

```bash
echo "=== TECHNICAL SEO ==="
cd SOCELLE-WEB

# Sitemap
echo "Sitemap:"
find . -name "sitemap*" -not -path "*/node_modules/*" 2>/dev/null

# Robots.txt
echo "Robots.txt:"
find . -name "robots.txt" -not -path "*/node_modules/*" 2>/dev/null

# 404 handling
echo "404 page:"
grep -rn "404\|NotFound\|not.*found" src/pages/ 2>/dev/null | grep -v node_modules | head -5

# Page load performance hints
echo "Lazy loading:"
grep -rn "lazy\|Suspense\|React.lazy\|dynamic.*import" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Output

Write to `docs/qa/seo_audit.json`:
```json
{
  "skill": "seo-audit",
  "pages_audited": 0,
  "pages_with_meta": 0,
  "pages_missing_meta": 0,
  "open_graph_coverage": 0,
  "structured_data_types": [],
  "images_missing_alt": 0,
  "sitemap_exists": false,
  "robots_txt_exists": false,
  "recommendations": [],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `echo "Manual: verify all public routes scanned and meta tag report generated"  # check output file`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/seo-audit-YYYY-MM-DD.json`
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
