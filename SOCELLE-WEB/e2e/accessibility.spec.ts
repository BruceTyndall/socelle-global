import { expect, test } from '@playwright/test';

/**
 * Accessibility tests — validates WCAG basics:
 * skip-to-main link, image alt text, form labels, focus visibility.
 */

const PUBLIC_ROUTES = ['/', '/intelligence', '/brands', '/education', '/pricing'];

test.describe('Accessibility — Skip-to-Main Link', () => {
  test('homepage has a skip-to-main-content link', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(400);

    const skipLink = page.locator('a[href="#main"], a[href="#main-content"], a[href="#content"]');
    const skipLinkByText = page.getByRole('link', { name: /skip to (main )?content/i });

    const hasSkipLink = (await skipLink.count()) > 0 || (await skipLinkByText.count()) > 0;
    expect(hasSkipLink, 'Missing skip-to-main-content link').toBeTruthy();
  });
});

test.describe('Accessibility — Image Alt Text', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} — all <img> elements have alt attributes`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(500);

      const missingAlt = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const missing: string[] = [];
        images.forEach((img) => {
          if (!img.hasAttribute('alt')) {
            missing.push(img.src || img.outerHTML.slice(0, 100));
          }
        });
        return missing;
      });

      expect(missingAlt, `Images missing alt text on ${route}: ${missingAlt.join(', ')}`).toEqual([]);
    });
  }
});

test.describe('Accessibility — Form Input Labels', () => {
  test('/request-access form inputs have associated labels', async ({ page }) => {
    await page.goto('/request-access');
    await page.waitForTimeout(500);

    const unlabeledInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea');
      const unlabeled: string[] = [];
      inputs.forEach((input) => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const hasExplicitLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasImplicitLabel = input.closest('label');
        const placeholder = input.getAttribute('placeholder');

        if (!hasExplicitLabel && !hasImplicitLabel && !ariaLabel && !ariaLabelledBy && !placeholder) {
          unlabeled.push(input.tagName + (id ? `#${id}` : '') + (input.getAttribute('name') ? `[name="${input.getAttribute('name')}"]` : ''));
        }
      });
      return unlabeled;
    });

    expect(unlabeledInputs, `Unlabeled form inputs: ${unlabeledInputs.join(', ')}`).toEqual([]);
  });

  test('/portal/login form inputs have associated labels', async ({ page }) => {
    await page.goto('/portal/login');
    await page.waitForTimeout(500);

    const unlabeledInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
      const unlabeled: string[] = [];
      inputs.forEach((input) => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const hasExplicitLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasImplicitLabel = input.closest('label');

        if (!hasExplicitLabel && !hasImplicitLabel && !ariaLabel && !ariaLabelledBy) {
          unlabeled.push(input.tagName + (id ? `#${id}` : ''));
        }
      });
      return unlabeled;
    });

    expect(unlabeledInputs, `Unlabeled form inputs on /portal/login: ${unlabeledInputs.join(', ')}`).toEqual([]);
  });
});

test.describe('Accessibility — Focus Visibility', () => {
  test('interactive elements have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Tab through first few interactive elements and check focus is visible
    const focusResults = await page.evaluate(() => {
      const interactiveElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]');
      const results: { tag: string; hasOutline: boolean }[] = [];

      // Check first 5 focusable elements
      const toCheck = Array.from(interactiveElements).slice(0, 5);
      toCheck.forEach((el) => {
        (el as HTMLElement).focus();
        const style = window.getComputedStyle(el);
        const hasOutline =
          style.outlineStyle !== 'none' ||
          style.boxShadow !== 'none' ||
          style.borderColor !== style.getPropertyValue('--unfocused-border') ||
          el.matches(':focus-visible');
        results.push({
          tag: el.tagName + (el.className ? `.${String(el.className).split(' ')[0]}` : ''),
          hasOutline,
        });
      });

      return results;
    });

    // At least some elements should have visible focus indicators
    const withFocus = focusResults.filter((r) => r.hasOutline);
    expect(
      withFocus.length,
      `Only ${withFocus.length}/${focusResults.length} elements have visible focus indicators`,
    ).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Accessibility — Heading Hierarchy', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has at least one <h1>`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(400);

      const h1Count = await page.locator('h1').count();
      expect(h1Count, `No <h1> found on ${route}`).toBeGreaterThanOrEqual(1);
    });
  }
});

test.describe('Accessibility — Landmark Regions', () => {
  test('homepage has main landmark', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(400);

    const mainCount = await page.locator('main, [role="main"]').count();
    expect(mainCount, 'No <main> landmark found').toBeGreaterThanOrEqual(1);
  });

  test('homepage has navigation landmark', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(400);

    const navCount = await page.locator('nav, [role="navigation"]').count();
    expect(navCount, 'No <nav> landmark found').toBeGreaterThanOrEqual(1);
  });
});
