---
name: test-runner-suite
description: Unified test execution suite — runs smoke-test-suite, e2e-test-runner, and playwright-crawler in sequence. Single pass for smoke tests, critical flow E2E, and full-site crawl with consolidated output.
---

# test-runner-suite

Coordinated execution of 3 test automation skills in escalating scope. Produces a single unified report covering smoke checks, E2E flows, and full-site crawl results.

## Member Skills (Execution Order)

1. `smoke-test-suite` — Homepage, auth, key pages, API health check
2. `e2e-test-runner` — Critical user flows via Playwright
3. `playwright-crawler` — Full-site crawl, dead-end detection, screenshot capture

## Inputs

| Input | Source | Required |
|---|---|---|
| SOCELLE-WEB/ | Codebase (running dev server) | Yes |
| Playwright config | SOCELLE-WEB/playwright.config.ts | Yes |
| docs/command/GLOBAL_SITE_MAP.md | Route reference | Yes |

## Procedure

### Step 1 — Run smoke-test-suite

```bash
cd SOCELLE-WEB && curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null || echo "Server not running"
```

Quick health check:
- Homepage returns 200
- Auth endpoints respond
- Key public pages load (intelligence, brands, education, protocols)
- API/edge function endpoints return valid JSON

If smoke tests fail, STOP — do not proceed to E2E (server is unhealthy).

### Step 2 — Run e2e-test-runner

```bash
cd SOCELLE-WEB && npx playwright test --list 2>&1 | tail -1
```

Execute critical user flow tests:
- Signup / login flow
- Intelligence hub navigation
- Brand profile viewing
- Protocol browsing
- Request access form submission
- Portal navigation (authenticated)

### Step 3 — Run playwright-crawler

```bash
cd SOCELLE-WEB && npx playwright test --grep crawl 2>&1 | tail -5
```

Full-site crawl:
- Visit every route from GLOBAL_SITE_MAP.md
- Detect dead-end pages (no outbound links)
- Capture screenshots for visual regression baseline
- Check for 404s, broken links, and redirect loops
- Verify no hub-shell pages (empty content)

### Step 4 — Consolidate Results

```json
{
  "suite": "test-runner-suite",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "members_run": ["smoke-test-suite", "e2e-test-runner", "playwright-crawler"],
  "smoke_pass": true,
  "e2e_total": 0,
  "e2e_passed": 0,
  "e2e_failed": 0,
  "crawl_pages_visited": 0,
  "crawl_dead_ends": 0,
  "crawl_404s": 0,
  "overall": "PASS",
  "findings": []
}
```

Save to: `docs/qa/test-runner-suite-YYYY-MM-DD.json`

## Outputs

| Output | Format | Location |
|---|---|---|
| Consolidated test report | JSON | `docs/qa/test-runner-suite-YYYY-MM-DD.json` |
| E2E test results | Object in consolidated JSON | Same file |
| Crawl report with screenshots | Array + image files | `docs/qa/screenshots/` |

## Verification

**Command:**
```bash
npx playwright test --list 2>&1 | tail -1
```
**Pass criteria:** Test count > 0 AND `docs/qa/test-runner-suite-*.json` exists with `"overall": "PASS"`.

## Stop Conditions

- STOP if dev server is not running — cannot test without a running app.
- STOP if Playwright is not installed — `npx playwright install` required first.
- STOP if smoke tests fail — server is unhealthy, E2E results would be misleading.
- STOP if > 10 E2E failures — systemic issue, triage before crawl.

## Failure Modes

| Mode | Symptom | Resolution |
|---|---|---|
| Server not running | Smoke tests fail immediately | Start dev server: `cd SOCELLE-WEB && npm run dev` |
| Playwright not installed | Command not found | Run `npx playwright install` |
| Auth flow broken | E2E login tests fail | Check AuthProvider, Supabase auth config |
| Route mismatch | Crawl finds pages not in GLOBAL_SITE_MAP.md | Update site map or add missing routes |

## Fade Protocol

**Quarterly re-certification required.** Test coverage must evolve with new features. Re-run after any route addition, auth flow change, or major UI update. If GLOBAL_SITE_MAP.md is updated with new routes, add corresponding E2E tests and re-certify.
