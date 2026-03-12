---
name: e2e-flow-auditor
description: Crawl SOCELLE-WEB routes with Playwright, click interactive UI elements, detect dead ends and runtime errors, and write a structured JSON audit plus screenshot/log artifacts.
---

# E2E Flow Auditor

Use this skill when the goal is to audit real user flows in `SOCELLE-WEB`, including:
- route crawl coverage
- click-path mapping
- dead-end detection
- console/network/runtime error capture
- auth-gate visibility by user type

## Command

Run from repo root:

```bash
npm run audit:flow
```

## Output Contract

The runner writes:
- JSON report: `docs/qa/e2e-flow-audit_<timestamp>.json`
- Screenshots: `docs/qa/e2e-flow-audit_<timestamp>/screens/`
- Logs: `docs/qa/e2e-flow-audit_<timestamp>/logs/`

Minimum JSON sections required:
- `route_inventory`
- `click_map`
- `error_list`
- `dead_ends`
- `screenshots_manifest`

## Audit Behavior

- Starts from `SOCELLE-WEB` route definitions (`src/App.tsx` + `e2e/routeTable.ts`).
- Launches Playwright Chromium and crawls public + gated routes.
- Attempts auth sessions for Professional, Brand, Admin if env credentials exist:
  - `E2E_BUSINESS_EMAIL` / `E2E_BUSINESS_PASSWORD`
  - `E2E_BRAND_EMAIL` / `E2E_BRAND_PASSWORD`
  - `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`
- If credentials are missing, records blocked requirements under `blocked_by_auth` and continues structural route audit.

## PASS / FAIL Rubric

PASS when all are true:
- command exits `0`
- JSON report is created in `docs/qa/`
- artifacts folder is created with `screens/` and `logs/`
- JSON includes the five required sections above

FAIL when any are true:
- runner crashes or exits non-zero
- JSON report is missing
- artifacts folders are missing
- required JSON sections are absent
