import { expect, test, type Page } from '@playwright/test';

const BUSINESS_EMAIL = process.env.E2E_BUSINESS_EMAIL;
const BUSINESS_PASSWORD = process.env.E2E_BUSINESS_PASSWORD;
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const BRAND_EMAIL = process.env.E2E_BRAND_EMAIL;
const BRAND_PASSWORD = process.env.E2E_BRAND_PASSWORD;

async function login(page: Page, path: string, email: string, password: string, submitLabel: RegExp) {
  await page.goto(path);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: submitLabel }).click();
}

test('wrong password shows inline error', async ({ page }) => {
  await page.goto('/portal/login');
  await page.getByLabel(/email/i).fill('nobody@example.com');
  await page.getByLabel(/password/i).fill('wrong-password');
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page.locator('body')).toContainText(/invalid|error|failed/i);
});

test('forgot password flow shows user-facing result', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.getByLabel(/email/i).fill(BUSINESS_EMAIL || 'nobody@example.com');
  await page.getByRole('button', { name: /submit|send|reset/i }).click();
  await expect(page.locator('body')).toContainText(/email|reset|rate limit|check/i);
});

test('business login/logout/session restore', async ({ page }) => {
  test.skip(!BUSINESS_EMAIL || !BUSINESS_PASSWORD, 'E2E business credentials are not configured');
  await login(page, '/portal/login', BUSINESS_EMAIL!, BUSINESS_PASSWORD!, /log in/i);
  await page.waitForURL(/\/portal\/dashboard|\/portal\/plans|\/portal$/);
  await page.reload();
  await expect(page.locator('body')).not.toContainText('Log In');
  await page.getByRole('button', { name: /sign out|logout/i }).first().click();
  await expect(page).toHaveURL(/\/portal|\/portal\/login/);
});

test('admin route is blocked for anonymous users', async ({ page }) => {
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('admin login can access admin routes', async ({ page }) => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'E2E admin credentials are not configured');
  await login(page, '/admin/login', ADMIN_EMAIL!, ADMIN_PASSWORD!, /access admin portal/i);
  await page.waitForURL(/\/admin\/(dashboard|brands|inbox)/);
  await page.goto('/admin/brands');
  await expect(page.locator('body')).toContainText(/brand/i);
});

test('brand login can access brand routes', async ({ page }) => {
  test.skip(!BRAND_EMAIL || !BRAND_PASSWORD, 'E2E brand credentials are not configured');
  await login(page, '/brand/login', BRAND_EMAIL!, BRAND_PASSWORD!, /access brand portal/i);
  await page.waitForURL(/\/brand\/dashboard/);
  await page.goto('/brand/leads');
  await expect(page.locator('body')).toContainText(/leads|brand/i);
});
