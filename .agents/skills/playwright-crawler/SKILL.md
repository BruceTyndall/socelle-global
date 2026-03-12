---
name: playwright-crawler
description: "Headless browser automation for full-site crawl, screenshot capture, dead-end detection, and interactive flow testing. Use this skill whenever you need to: crawl all routes and verify they render, take screenshots for visual audit, find dead ends (pages with no outbound navigation), test interactive flows (forms, modals, navigation), or verify responsive behavior. Triggers on: 'crawl the site', 'screenshot all pages', 'find dead ends', 'test the UI', 'visual audit', 'browser test', 'E2E check'."
---

# Playwright Crawler

Automates headless browser testing for SOCELLE-WEB using Playwright.

## Prerequisites

```bash
npx playwright install chromium 2>/dev/null
```

## Route crawl script

Create and run this script to crawl all routes:

```javascript
// scripts/crawl-routes.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Extract routes from App.tsx or use route-manifest if available
const routes = [
  '/', '/home', '/intelligence', '/brands', '/education', '/events',
  '/jobs', '/pricing', '/about', '/faq', '/how-it-works', '/privacy',
  '/terms', '/request-access', '/for-brands', '/for-medspas', '/for-salons',
  '/professionals', '/protocols', '/api/docs', '/api/pricing',
  '/forgot-password', '/reset-password',
  // Add portal/brand/admin routes as needed (require auth)
];

const results = [];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const route of routes) {
    try {
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      const status = response?.status() || 0;
      const title = await page.title();
      const links = await page.$$eval('a[href]', els => els.map(e => e.getAttribute('href')));
      const hasNav = await page.$('nav') !== null;
      const hasCTA = await page.$('a[href*="request-access"], button') !== null;

      // Screenshot
      await page.screenshot({ path: `docs/qa/screenshots/${route.replace(/\//g, '_') || 'root'}.png`, fullPage: true });

      results.push({
        route, status, title,
        outbound_links: links.length,
        has_navigation: hasNav,
        has_cta: hasCTA,
        is_dead_end: links.length < 2 && !hasNav,
        error: null,
      });
    } catch (err) {
      results.push({ route, status: 0, error: err.message, is_dead_end: true });
    }
  }

  await browser.close();
  fs.mkdirSync('docs/qa', { recursive: true });
  fs.writeFileSync('docs/qa/crawl_results.json', JSON.stringify(results, null, 2));
  console.log(`Crawled ${results.length} routes. Dead ends: ${results.filter(r => r.is_dead_end).length}`);
})();
```

## Usage

```bash
# Start dev server in background, then crawl
cd SOCELLE-WEB && npm run dev &
sleep 5
node scripts/crawl-routes.mjs
kill %1
```

## Dead-end detection

A page is a dead end if it has fewer than 2 outbound links AND no navigation element. Report all dead ends in the crawl results.

## Output

- `docs/qa/crawl_results.json` — structured crawl data per route
- `docs/qa/screenshots/` — full-page screenshots
- `docs/qa/dead_ends.json` — filtered list of dead-end routes

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls SOCELLE-WEB/tests/e2e/*.spec.ts 2>/dev/null | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/playwright-crawler-YYYY-MM-DD.json`
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
