import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  // Provide a fixed user data dir to easily persist/clear state if needed, or just let it be fresh
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  // Go to root to register/unregister the SW
  await page.goto('http://localhost:5173');
  
  // Unregister all service workers
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
      console.log('Unregistered service workers');
    }
  });

  // Now go to the specific pages
  await page.goto('http://localhost:5173/intelligence');
  await page.waitForTimeout(6000); 
  await page.screenshot({ path: 'local_debug_log_main.png' });
  
  await page.goto('http://localhost:5173/debug-feeds');
  await page.waitForTimeout(3000); 
  await page.screenshot({ path: 'local_debug_feeds_clear.png' });
  
  await browser.close();
  console.log('Done mapping logs');
})();
