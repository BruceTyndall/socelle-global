/**
 * Screenshot capture script v2 — IDEA-MINING product proof pack
 */
import { chromium } from 'playwright';
import path from 'path';

const BASE = 'http://localhost:5173';
const OUT = 'docs/ops/screens/2026-03-13';

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${file}`);
}

// Click a vertical tab and capture the full viewport (tabs + feed header visible)
async function captureVertical(page, name, tabText) {
  await page.goto(`${BASE}/intelligence`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // Scroll to bring vertical tab bar into view
  const verticalNav = page.locator('nav[aria-label="Filter signals by vertical"]');
  if (await verticalNav.count() > 0) {
    await verticalNav.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
  if (tabText) {
    const tab = page.locator('[aria-label="Filter signals by vertical"] [role="tab"]').filter({ hasText: tabText });
    if (await tab.count() > 0) { await tab.click(); await page.waitForTimeout(2200); }
  }
  await shot(page, name);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 1. /intelligence — All Signals (full feed visible)
  await page.goto(`${BASE}/intelligence`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.getElementById('signal-feed')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(800);
  await shot(page, '01_intelligence_all');

  // 2. Medspa tab active
  await captureVertical(page, '02_intelligence_medspa', 'Medspa');

  // 3. Salon tab active
  await captureVertical(page, '03_intelligence_salon', 'Salon');

  // 4. Brands tab active
  await captureVertical(page, '04_intelligence_brands', 'Brands');

  // 5. Category filter — click Regulatory and capture feed
  await page.goto(`${BASE}/intelligence`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.getElementById('signal-feed')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  const regTab = page.locator('[aria-label="Signal category filters"] [role="tab"]').filter({ hasText: 'Regulatory' });
  if (await regTab.count() > 0) { await regTab.click(); await page.waitForTimeout(2200); }
  await shot(page, '05_category_filter_regulatory');

  // 6. Signal card grid — scroll past featured to show 2-col grid with images
  await page.goto(`${BASE}/intelligence`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.getElementById('signal-feed')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(800);
  await shot(page, '06_signal_card_grid_images');

  // 7. Signal detail page — navigate to first signal, capture top of page
  await page.goto(`${BASE}/intelligence`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.getElementById('signal-feed')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  const signalLinks = page.locator('a[aria-label^="Read signal:"]');
  if (await signalLinks.count() > 0) {
    await signalLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
  }
  await shot(page, '07_signal_detail_page');

  // 8. Admin feeds hub — log in with credentials
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', 'brucetyndallprofessional@gmail.com');
  await page.fill('input[type="password"]', 'DevAdmin2026!');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.goto(`${BASE}/admin/feeds`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  await shot(page, '08_admin_feeds_hub');

  await browser.close();
  console.log('All screenshots captured.');
})();
