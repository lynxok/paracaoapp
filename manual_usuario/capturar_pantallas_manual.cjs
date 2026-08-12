const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const out = path.resolve('manual_usuario', 'capturas');

  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(out, '01-acceso.png'), fullPage: true });

  await page.locator('input').nth(0).fill(process.env.OPTICA_MANUAL_USER);
  await page.locator('input[type="password"]').fill(process.env.OPTICA_MANUAL_PASSWORD);
  const branch = page.locator('select').last();
  await branch.selectOption({ label: 'Casa Central' });
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2500);

  const error = page.locator('[class*="red"]');
  if (page.url().includes('login') || (await page.locator('button[type="submit"]').count())) {
    const text = await error.allTextContents().catch(() => []);
    throw new Error(`LOGIN_FAILED: ${text.join(' ').trim() || 'la pantalla de acceso continuó visible'}`);
  }

  const sanitize = async () => {
    await page.addStyleTag({ content: `
      table tbody, [data-sensitive], img[alt*="avatar" i], img[class*="avatar"], header img,
      [class*="notification"] [class*="text"], [class*="profile"] { filter: blur(7px) !important; }
    `});
    const signedInName = page.getByText('Juan Simon', { exact: true });
    if (await signedInName.count()) {
      await signedInName.first().evaluate((el) => {
        const block = el.parentElement;
        if (block) block.style.filter = 'blur(9px)';
      });
    }
  };
  await sanitize();
  await page.screenshot({ path: path.join(out, '02-inicio.png'), fullPage: true });

  const routes = [
    ['03-clientes.png', '/clients'],
    ['04-ventas-rapidas.png', '/sales'],
    ['05-pedidos.png', '/orders'],
    ['06-pedido-monofocal.png', '/orders/new/monofocal'],
    ['07-stock.png', '/inventory'],
    ['08-proveedores.png', '/suppliers'],
    ['09-laboratorios.png', '/lab-management'],
    ['10-caja-finanzas.png', '/finance'],
    ['11-borradores-facturacion.png', '/billing-drafts'],
    ['12-reportes.png', '/reports'],
    ['13-crm-marketing.png', '/marketing'],
    ['14-ajustes.png', '/settings'],
    ['15-ayuda.png', '/help']
  ];
  for (const [name, route] of routes) {
    await page.goto(`http://localhost:3005${route}`, { waitUntil: 'networkidle' });
    await sanitize();
    await page.screenshot({ path: path.join(out, name), fullPage: true });
  }

  console.log(`CAPTURE_OK ${routes.length + 2}`);
  await browser.close();
})().catch(async (error) => {
  console.error(error.message);
  process.exit(2);
});
