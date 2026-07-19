const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.setDefaultTimeout(8000);
  page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => logs.push(`pageerror: ${err.message}`));
  page.on('requestfailed', req => logs.push(`failed: ${req.method()} ${req.url()} ${req.failure()?.errorText}`));
  await page.goto('http://localhost:4202/auth/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[formcontrolname="email"]', 'superadmin@tabeebi.com');
  await page.fill('input[formcontrolname="password"]', 'Dev@Local2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  const state = await page.evaluate(() => ({ url: location.href, body: document.body.innerText.slice(0, 300), token: !!localStorage.getItem('tb_access_token') }));
  console.log(JSON.stringify({ state, logs: logs.slice(-20) }, null, 2));
  await browser.close();
})();
