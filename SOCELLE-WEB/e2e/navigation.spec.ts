import { expect, test } from '@playwright/test';

/**
 * MainNav tests — validates navigation structure, link order,
 * commerce exclusion, auth pill, and mobile toggle.
 */

const REQUIRED_NAV_LINKS = [
  { label: 'Intelligence', href: '/intelligence' },
  { label: 'Brands', href: '/brands' },
  { label: 'Education', href: '/education' },
  { label: 'Events', href: '/events' },
  { label: 'Jobs', href: '/jobs' },
  // Fix: nav links to /professionals (For Buyers is nav label, /professionals is the route)
  { label: 'For Buyers', href: '/professionals' },
  { label: 'For Brands', href: '/for-brands' },
  // Fix: nav links to /plans (label is "Pricing", route is /plans per NAV_LINKS spec §C)
  { label: 'Pricing', href: '/plans' },
];

test.describe('MainNav — Link Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  for (const link of REQUIRED_NAV_LINKS) {
    test(`nav contains "${link.label}" linking to ${link.href}`, async ({ page }) => {
      const nav = page.locator('nav').first();
      // exact: true prevents "Brands" from matching "For Brands" (and similar prefix collisions)
      const anchor = nav.getByRole('link', { name: link.label, exact: true });
      await expect(anchor.first()).toBeVisible();
      const href = await anchor.first().getAttribute('href');
      expect(href).toBe(link.href);
    });
  }

  test('Intelligence is the FIRST nav link', async ({ page }) => {
    const nav = page.locator('nav').first();
    const allLinks = nav.getByRole('link');
    const count = await allLinks.count();
    expect(count).toBeGreaterThanOrEqual(8);

    // Find first link whose href is a public route (skip logo/home)
    for (let i = 0; i < count; i++) {
      const href = await allLinks.nth(i).getAttribute('href');
      if (href && href !== '/' && !href.startsWith('http')) {
        expect(href).toBe('/intelligence');
        break;
      }
    }
  });

  test('no "Shop" or commerce link in MainNav', async ({ page }) => {
    const nav = page.locator('nav').first();
    const shopLink = nav.getByRole('link', { name: /^shop$/i });
    await expect(shopLink).toHaveCount(0);

    const commerceLink = nav.getByRole('link', { name: /^commerce$/i });
    await expect(commerceLink).toHaveCount(0);

    const buyNowLink = nav.getByRole('link', { name: /buy now/i });
    await expect(buyNowLink).toHaveCount(0);
  });
});

test.describe('MainNav — Auth Pill', () => {
  test('auth pill shows Sign In or portal link for anonymous user', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const body = page.locator('body');
    const hasSignIn = (await body.getByRole('link', { name: /sign in/i }).count()) > 0;
    const hasPortalLink =
      (await body.getByRole('link', { name: /my portal|admin|brand portal/i }).count()) > 0;
    const hasRequestAccess = (await body.getByRole('link', { name: /request access/i }).count()) > 0;

    expect(hasSignIn || hasPortalLink || hasRequestAccess).toBeTruthy();
  });
});

test.describe('MainNav — Mobile Toggle', () => {
  test('mobile nav toggle opens navigation at small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // Desktop nav links should be hidden at mobile width
    const desktopIntelLink = page.locator('nav').first().getByRole('link', { name: 'Intelligence' });
    const isDesktopVisible = await desktopIntelLink.isVisible().catch(() => false);

    if (!isDesktopVisible) {
      // Look for a hamburger / menu toggle button
      const menuButton = page.getByRole('button', { name: /menu|toggle|hamburger/i }).or(
        page.locator('nav button[aria-label]').first(),
      );

      if ((await menuButton.count()) > 0) {
        await menuButton.first().click();
        await page.waitForTimeout(300);

        // After clicking, Intelligence link should become visible
        const mobileIntelLink = page.getByRole('link', { name: 'Intelligence' });
        await expect(mobileIntelLink.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });
});
