import { chromium } from 'playwright';

(async () => {
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    page.on('console', msg => console.log('PROD CONSOLE:', msg.text()));
    
    console.log('Navigating to sw-reset...');
    await page.goto('https://socelle.pages.dev/sw-reset.html');
    await page.waitForTimeout(6000); 
    
    console.log('Navigating to /intelligence...');
    await page.goto('https://socelle.pages.dev/intelligence');
    await page.waitForTimeout(8000);
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'prod_sw_post_reset.png' });
    
    await browser.close();
    console.log('Done mapping prod logs');
  } catch(e) {
    console.error("Playwright Error:", e);
  }
})();
