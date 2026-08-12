const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const target = `file:///${path.resolve(__dirname, 'Manual_de_Usuario_Optica_Paracao.html').replace(/\\/g, '/')}`;
  await page.goto(target, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(__dirname, 'capturas', 'verificacion-html.png') });
  console.log(`TITLE=${await page.title()}`);
  console.log(`VISIBLE_IMAGES=${await page.locator('img').count()}`);
  await browser.close();
})();
