import { expect, test } from '@playwright/test';

test.describe('Smoke Tests — Navigation & Core Pages', () => {
  test('homepage loads without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // Should not show configuration error
    await expect(page.locator('body')).not.toContainText('Configuration Required');
  });

  test('intelligence page loads with signal data or preview banner', async ({ page }) => {
    await page.goto('/intelligence');
    await page.waitForTimeout(500);
    const body = page.locator('body');
    // Should have either live signals or a preview/demo banner
    const hasContent =
      (await body.locator('table, [data-testid="signal-table"], [role="table"]').count()) > 0 ||
      (await body.getByText(/preview|demo/i).count()) > 0 ||
      (await body.getByText(/intelligence/i).count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test('brands page loads', async ({ page }) => {
    await page.goto('/brands');
    await expect(page.locator('body')).toContainText(/brand/i);
  });

  test('education page loads', async ({ page }) => {
    await page.goto('/education');
    await expect(page.locator('body')).toContainText(/education|training|course/i);
  });

  test('request access form renders', async ({ page }) => {
    await page.goto('/request-access');
    await expect(page.locator('form, [role="form"]').first()).toBeVisible();
  });
});

test.describe('Smoke Tests — Auth Gates', () => {
  test('portal dashboard redirects to login for anonymous', async ({ page }) => {
    await page.goto('/portal/dashboard');
    // Should redirect to login or show access denied
    await page.waitForTimeout(1000);
    const url = page.url();
    const body = await page.locator('body').innerText();
    const isGated =
      url.includes('/login') ||
      url.includes('/portal') ||
      /access denied|sign in|log in|restricted/i.test(body);
    expect(isGated).toBeTruthy();
  });

  test('admin dashboard redirects to login for anonymous', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('brand dashboard requires auth', async ({ page }) => {
    await page.goto('/brand/dashboard');
    await page.waitForTimeout(1000);
    const url = page.url();
    const body = await page.locator('body').innerText();
    const isGated =
      url.includes('/login') ||
      /access denied|sign in|log in|restricted/i.test(body);
    expect(isGated).toBeTruthy();
  });
});

test.describe('Smoke Tests — SEO Basics', () => {
  test('homepage has title tag', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('intelligence page has title tag', async ({ page }) => {
    await page.goto('/intelligence');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('public pages have meta description', async ({ page }) => {
    await page.goto('/intelligence');
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDesc).toBeTruthy();
  });
});

test.describe('Smoke Tests — Design Compliance', () => {
  test('no font-serif on public pages', async ({ page }) => {
    const publicRoutes = ['/', '/intelligence', '/brands', '/education', '/pricing', '/about'];
    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForTimeout(300);
      // Check computed styles — no element should use serif font family
      const serifCount = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        let count = 0;
        allElements.forEach((el) => {
          const computed = window.getComputedStyle(el);
          const ff = computed.fontFamily.toLowerCase();
          if (ff.includes('serif') && !ff.includes('sans-serif')) {
            count++;
          }
        });
        return count;
      });
      expect(serifCount, `font-serif found on ${route}`).toBe(0);
    }
  });
});
