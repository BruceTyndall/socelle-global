import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:5173/debug-feeds');
  await page.waitForTimeout(5000); 
  await page.screenshot({ path: 'local_debug_log.png' });
  await browser.close();
  console.log('Done mapping logs');
})();
