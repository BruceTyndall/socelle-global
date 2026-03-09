import { expect, test } from '@playwright/test';
import { routeTable } from './routeTable';

/**
 * SEO tests — validates title tags, meta descriptions, OG tags,
 * and font-serif absence on all public routes.
 */

const publicRoutes = routeTable
  .filter((r) => r.access === 'public' && !r.path.includes('/login') && !r.path.includes('/signup'))
  .map((r) => r.path);

const keyPages = ['/', '/intelligence', '/brands', '/education'];

test.describe('SEO — Title Tags', () => {
  for (const route of publicRoutes) {
    test(`${route} has a non-empty <title>`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);
      const title = await page.title();
      expect(title.length, `Missing <title> on ${route}`).toBeGreaterThan(0);
    });
  }
});

test.describe('SEO — Meta Descriptions', () => {
  for (const route of publicRoutes) {
    test(`${route} has <meta name="description">`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);
      const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDesc, `Missing meta description on ${route}`).toBeTruthy();
      expect(metaDesc!.length, `Empty meta description on ${route}`).toBeGreaterThan(0);
    });
  }
});

test.describe('SEO — Open Graph Tags', () => {
  for (const route of keyPages) {
    test(`${route} has og:title`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);
      const ogTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute('content');
      expect(ogTitle, `Missing og:title on ${route}`).toBeTruthy();
    });

    test(`${route} has og:description`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);
      const ogDesc = await page
        .locator('meta[property="og:description"]')
        .getAttribute('content');
      expect(ogDesc, `Missing og:description on ${route}`).toBeTruthy();
    });

    test(`${route} has og:type`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);
      const ogType = await page
        .locator('meta[property="og:type"]')
        .getAttribute('content');
      expect(ogType, `Missing og:type on ${route}`).toBeTruthy();
    });
  }
});

test.describe('SEO — No font-serif on Public Pages', () => {
  for (const route of publicRoutes) {
    test(`${route} has no font-serif class in rendered HTML`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);

      const serifElements = await page.locator('.font-serif').count();
      expect(serifElements, `font-serif class found on ${route}`).toBe(0);
    });
  }
});
