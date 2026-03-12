import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PROD CONSOLE:', msg.text()));
  
  await page.goto('https://socelle.pages.dev/intelligence');
  await page.waitForTimeout(6000); 
  await page.screenshot({ path: 'prod_debug_log.png' });
  
  await browser.close();
  console.log('Done mapping prod logs');
})();
