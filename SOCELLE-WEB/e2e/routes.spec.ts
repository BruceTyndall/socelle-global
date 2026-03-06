import { expect, test, type Page } from '@playwright/test';
import { routeTable } from './routeTable';

const LOADER_SELECTORS = [
  '.animate-spin',
  'text=Loading...',
  'text=Loading brands...',
  'text=Analyzing...',
  'text=Checking publish readiness...',
];

function attachErrorCollectors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const ignoredConsolePatterns = [
    /Failed to load resource: the server responded with a status of 404/i,
    // 401s and invalid API key errors are expected in CI — portal routes require auth; no user is logged in during crawl
    /Failed to load resource: the server responded with a status of 401/i,
    /Invalid API key/i,
    // CSP violations are infrastructure-level; fix at source in public/_headers, not here
    /Content Security Policy/i,
    /Refused to load the stylesheet/i,
  ];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const ignored = ignoredConsolePatterns.some((pattern) => pattern.test(text));
      if (!ignored) {
        consoleErrors.push(text);
      }
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(String(err));
  });
  return { consoleErrors, pageErrors };
}

async function assertRouteHealthy(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(350);

  await expect(page.locator('body')).not.toContainText('Configuration Required');
  await expect(page.locator('body')).not.toContainText('Cannot GET');

  const mainContent = page.locator('main, #root, body');
  await expect(mainContent.first()).toBeVisible();

  for (const selector of LOADER_SELECTORS) {
    const loader = page.locator(selector).first();
    if (await loader.isVisible().catch(() => false)) {
      await expect(loader).not.toBeVisible({ timeout: 8_000 });
    }
  }
}

test.describe('Route Crawl', () => {
  for (const route of routeTable) {
    test(`route renders safely: ${route.path}`, async ({ page }, testInfo) => {
      const { consoleErrors, pageErrors } = attachErrorCollectors(page);

      await assertRouteHealthy(page, route.path);

      const hasAuthGate =
        (await page.getByText('Access Denied', { exact: false }).count()) > 0 ||
        (await page.getByText('Access Restricted', { exact: false }).count()) > 0 ||
        (await page.getByText('Role Missing', { exact: false }).count()) > 0;

      if (route.access === 'public' || route.access === 'legacy_redirect') {
        expect(hasAuthGate).toBeFalsy();
      }

      if (consoleErrors.length || pageErrors.length) {
        await testInfo.attach('console-errors.json', {
          body: JSON.stringify(consoleErrors, null, 2),
          contentType: 'application/json',
        });
        await testInfo.attach('page-errors.json', {
          body: JSON.stringify(pageErrors, null, 2),
          contentType: 'application/json',
        });
      }

      expect(consoleErrors, `Console errors on ${route.path}`).toEqual([]);
      expect(pageErrors, `Page errors on ${route.path}`).toEqual([]);
    });
  }
});
