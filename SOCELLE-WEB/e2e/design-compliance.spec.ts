import { expect, test } from '@playwright/test';

/**
 * Design Compliance tests — validates Pearl Mineral V2 design system:
 * background color, absence of pro-* classes, and accent color usage.
 */

const PUBLIC_ROUTES = ['/', '/intelligence', '/brands', '/education', '/pricing', '/about'];

test.describe('Pearl Mineral V2 — Background Color', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} uses #F6F3EF background on body or main container`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);

      const bgColor = await page.evaluate(() => {
        const body = document.body;
        const main = document.querySelector('main') || document.querySelector('#root');
        const bodyBg = window.getComputedStyle(body).backgroundColor;
        const mainBg = main ? window.getComputedStyle(main).backgroundColor : '';
        return { bodyBg, mainBg };
      });

      // #F6F3EF = rgb(246, 243, 239)
      const expectedBg = 'rgb(246, 243, 239)';
      const hasCorrectBg =
        bgColor.bodyBg === expectedBg || bgColor.mainBg === expectedBg;

      expect(hasCorrectBg, `Expected background #F6F3EF on ${route}. Got body: ${bgColor.bodyBg}, main: ${bgColor.mainBg}`).toBeTruthy();
    });
  }
});

test.describe('Pearl Mineral V2 — No pro-* Classes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no pro-* class names in rendered HTML`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);

      const proClassCount = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        let count = 0;
        allElements.forEach((el) => {
          const classes = el.className;
          if (typeof classes === 'string' && /\bpro-/.test(classes)) {
            count++;
          }
        });
        return count;
      });

      expect(proClassCount, `Found pro-* class names on ${route}`).toBe(0);
    });
  }
});

test.describe('Pearl Mineral V2 — Accent Color on Interactive Elements', () => {
  test('links and buttons on / use accent color (#6E879B)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Check that at least some interactive elements use the accent color
    const accentUsage = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      const buttons = document.querySelectorAll('button');
      // #6E879B = rgb(110, 135, 155)
      const accentRgb = 'rgb(110, 135, 155)';
      // Also accept close variants due to opacity/blending
      let accentCount = 0;

      const checkElement = (el: Element) => {
        const style = window.getComputedStyle(el);
        if (
          style.color === accentRgb ||
          style.backgroundColor === accentRgb ||
          style.borderColor === accentRgb
        ) {
          accentCount++;
        }
      };

      links.forEach(checkElement);
      buttons.forEach(checkElement);
      return accentCount;
    });

    // At least one interactive element should use the accent color
    expect(accentUsage, 'No interactive elements using accent color #6E879B').toBeGreaterThanOrEqual(1);
  });

  test('graphite (#141418) used as primary text color', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const graphiteUsage = await page.evaluate(() => {
      // #141418 = rgb(20, 20, 24)
      const graphiteRgb = 'rgb(20, 20, 24)';
      const headings = document.querySelectorAll('h1, h2, h3, p');
      let count = 0;
      headings.forEach((el) => {
        const color = window.getComputedStyle(el).color;
        if (color === graphiteRgb) {
          count++;
        }
      });
      return count;
    });

    expect(graphiteUsage, 'No text elements using graphite #141418').toBeGreaterThanOrEqual(1);
  });
});
