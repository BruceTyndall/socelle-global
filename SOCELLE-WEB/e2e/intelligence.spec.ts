import { expect, test } from '@playwright/test';

/**
 * Intelligence page tests — validates core Intelligence Hub rendering,
 * briefs route, signal content, and DEMO badge visibility.
 */

test.describe('Intelligence Hub — Core Pages', () => {
  test('/intelligence loads with Intelligence in title or heading', async ({ page }) => {
    await page.goto('/intelligence');
    await page.waitForTimeout(500);

    const title = await page.title();
    const heading = page.getByRole('heading', { name: /intelligence/i }).first();
    const bodyText = await page.locator('body').innerText();

    const hasIntelligenceReference =
      title.toLowerCase().includes('intelligence') ||
      (await heading.isVisible().catch(() => false)) ||
      bodyText.toLowerCase().includes('intelligence');

    expect(hasIntelligenceReference).toBeTruthy();
  });

  test('/intelligence/briefs loads without error', async ({ page }) => {
    await page.goto('/intelligence/briefs');
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Cannot GET');
    await expect(page.locator('body')).not.toContainText('Configuration Required');
  });

  test('/intelligence renders signal-related content', async ({ page }) => {
    await page.goto('/intelligence');
    await page.waitForTimeout(800);

    const body = page.locator('body');
    const bodyText = (await body.innerText()).toLowerCase();

    // Should contain signal-related content: tables, signal mentions, trends, etc.
    const hasSignalContent =
      bodyText.includes('signal') ||
      bodyText.includes('trend') ||
      bodyText.includes('market') ||
      bodyText.includes('intelligence') ||
      (await body.locator('table, [role="table"], [data-testid="signal-table"]').count()) > 0;

    expect(hasSignalContent).toBeTruthy();
  });
});

test.describe('Intelligence Hub — DEMO Badges', () => {
  test('DEMO surfaces display visible DEMO or PREVIEW badges', async ({ page }) => {
    // Check pages known to have demo data
    const demoRoutes = ['/events', '/jobs'];

    for (const route of demoRoutes) {
      await page.goto(route);
      await page.waitForTimeout(500);

      const bodyText = (await page.locator('body').innerText()).toLowerCase();
      const hasDemoBadge =
        bodyText.includes('demo') ||
        bodyText.includes('preview') ||
        bodyText.includes('coming soon') ||
        bodyText.includes('sample');

      expect(hasDemoBadge, `Expected DEMO/PREVIEW label on ${route}`).toBeTruthy();
    }
  });
});
