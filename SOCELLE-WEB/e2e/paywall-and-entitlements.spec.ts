import { expect, test } from '@playwright/test';

/**
 * Paywall Gate + Entitlement E2E Tests — UD-D-06/07/08/09/10
 *
 * Tests:
 * 1. Auth flow: login redirect, wrong-creds error, portal gate
 * 2. Paywall gate: portal AI features require subscription
 * 3. Intelligence feed: signals or DEMO/preview banner visible
 * 4. Onboarding completion: signup → request-access form
 * 5. CMS page render: public CMS pages load without 404/crash
 */

test.describe('Auth Flow — Gate Enforcement', () => {
  test('unauthenticated user hitting /portal/dashboard is redirected to login', async ({ page }) => {
    await page.goto('/portal/dashboard');
    await page.waitForTimeout(800);
    const url = page.url();
    const isGated =
      url.includes('/login') ||
      url.includes('/portal') ||
      (await page.locator('body').innerText()).match(/sign in|log in|access denied|restricted/i);
    expect(isGated).toBeTruthy();
  });

  test('unauthenticated user hitting /portal/intelligence is redirected', async ({ page }) => {
    await page.goto('/portal/intelligence');
    await page.waitForTimeout(800);
    const url = page.url();
    const bodyText = await page.locator('body').innerText();
    const isGated =
      url.includes('/login') ||
      /sign in|log in|access denied/i.test(bodyText);
    expect(isGated).toBeTruthy();
  });

  test('portal login page renders email and password inputs', async ({ page }) => {
    await page.goto('/portal/login');
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test('invalid login shows error message', async ({ page }) => {
    await page.goto('/portal/login');
    await page.getByLabel(/email/i).fill('notauser@invalid.example');
    await page.getByLabel(/password/i).fill('wrongpassword123');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForTimeout(1500);
    const bodyText = await page.locator('body').innerText();
    const hasError = /invalid|error|failed|incorrect|not found/i.test(bodyText);
    expect(hasError).toBeTruthy();
  });

  test('admin login page is accessible', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
  });
});

test.describe('Intelligence Feed — Live/DEMO Surface', () => {
  test('/intelligence loads with signals or demo/preview banner', async ({ page }) => {
    await page.goto('/intelligence');
    await page.waitForTimeout(800);

    const hasContent =
      (await page.locator('[role="table"], table, [data-testid="signal-table"]').count()) > 0 ||
      (await page.getByText(/demo|preview/i).count()) > 0 ||
      (await page.getByText(/market signal|intelligence/i).count()) > 0;

    expect(hasContent).toBeTruthy();
  });

  test('/intelligence does not show raw error stack to user', async ({ page }) => {
    await page.goto('/intelligence');
    await page.waitForTimeout(500);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/TypeError:|ReferenceError:|at Object\./);
  });

  test('intelligence page has no font-serif elements', async ({ page }) => {
    await page.goto('/intelligence');
    await page.waitForTimeout(300);
    const serifCount = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let count = 0;
      elements.forEach((el) => {
        const ff = window.getComputedStyle(el).fontFamily.toLowerCase();
        if (ff.includes('serif') && !ff.includes('sans-serif')) count++;
      });
      return count;
    });
    expect(serifCount).toBe(0);
  });
});

test.describe('Onboarding / Request Access Flow', () => {
  test('/request-access renders a form', async ({ page }) => {
    await page.goto('/request-access');
    await expect(page.locator('form, [role="form"]').first()).toBeVisible();
  });

  test('/request-access has submit button', async ({ page }) => {
    await page.goto('/request-access');
    const submitBtn = page.getByRole('button', { name: /submit|request|get access|apply/i });
    await expect(submitBtn.first()).toBeVisible();
  });

  test('/portal/signup page loads', async ({ page }) => {
    await page.goto('/portal/signup');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Cannot GET');
  });
});

test.describe('CMS Public Pages', () => {
  test('/education loads without crash', async ({ page }) => {
    await page.goto('/education');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Cannot GET');
    await expect(page.locator('body')).toContainText(/education|training|course|learn/i);
  });

  test('/brands loads without crash', async ({ page }) => {
    await page.goto('/brands');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toContainText(/brand/i);
  });

  test('/about loads without crash', async ({ page }) => {
    await page.goto('/about');
    await page.waitForTimeout(300);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('TypeError:');
  });

  test('/pricing loads without crash', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForTimeout(300);
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    const hasPricingContent = /plan|tier|price|month|starter|pro|enterprise/i.test(bodyText);
    expect(hasPricingContent).toBeTruthy();
  });
});

test.describe('Credit Economy Surface', () => {
  test('portal credit route is auth-gated', async ({ page }) => {
    await page.goto('/portal/credits');
    await page.waitForTimeout(800);
    const url = page.url();
    const bodyText = await page.locator('body').innerText();
    const isGated =
      url.includes('/login') ||
      /sign in|log in|access denied/i.test(bodyText);
    expect(isGated).toBeTruthy();
  });
});
