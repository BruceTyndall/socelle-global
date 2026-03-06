import { expect, test } from '@playwright/test';

const BUSINESS_EMAIL = process.env.E2E_BUSINESS_EMAIL;
const BUSINESS_PASSWORD = process.env.E2E_BUSINESS_PASSWORD;

test('AI flow: wizard accepts minimal input and surfaces result or useful failure', async ({ page }) => {
  test.skip(!BUSINESS_EMAIL || !BUSINESS_PASSWORD, 'E2E business credentials are not configured');

  await page.goto('/portal/login');
  await page.getByLabel(/email/i).fill(BUSINESS_EMAIL!);
  await page.getByLabel(/password/i).fill(BUSINESS_PASSWORD!);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL(/\/portal\/dashboard|\/portal$/);

  await page.goto('/portal/plans/new');
  await expect(page.locator('body')).toContainText(/Upload Menu & See Brand Fit/i);
  await page.getByRole('button', { name: /^Next$/i }).click();
  await page.getByLabel(/Paste Your Menu Text/i).fill('Signature Facial - 60 min - $120');
  await page.getByRole('button', { name: /^Next$/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();
  await page.getByRole('button', { name: /Analyze Menu/i }).click();

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const bodyText = (await page.locator('body').innerText()).toLowerCase();
  const hasSuccessSignal =
    bodyText.includes('analysis overview') ||
    bodyText.includes('brand fit score') ||
    bodyText.includes('protocol matches');
  const hasFailureSignal =
    bodyText.includes('error loading plan') ||
    bodyText.includes('failed to') ||
    bodyText.includes('try again') ||
    bodyText.includes('reanalyze');

  expect(hasSuccessSignal || hasFailureSignal).toBeTruthy();
});
