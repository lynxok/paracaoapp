const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const out = path.resolve('manual_usuario', 'capturas');
  fs.mkdirSync(out, { recursive: true });

  const sanitize = async () => {
    await page.addStyleTag({ content: `
      table tbody, [data-sensitive], img[alt*="avatar" i], img[class*="avatar"], header img,
      [class*="notification"] [class*="text"], [class*="profile"] { filter: blur(8px) !important; }
    `});
    const signedInName = page.getByText('Juan Simon', { exact: true });
    if (await signedInName.count()) {
      await signedInName.first().evaluate((el) => {
        if (el.parentElement) el.parentElement.style.filter = 'blur(9px)';
      });
    }
  };

  const shot = async (name) => {
    await sanitize();
    await page.screenshot({ path: path.join(out, name), fullPage: true });
  };

  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.locator('input').nth(0).fill(process.env.OPTICA_MANUAL_USER);
  await page.locator('input[type="password"]').fill(process.env.OPTICA_MANUAL_PASSWORD);
  await page.locator('select').last().selectOption({ label: 'Casa Central' });
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2500);
  if (await page.locator('button[type="submit"]').count()) throw new Error('LOGIN_FAILED');

  await page.goto('http://localhost:3005/clients', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Nuevo Cliente/i }).click();
  await shot('16-alta-cliente.png');

  await page.goto('http://localhost:3005/inventory', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Añadir Nuevo/i }).first().click();
  await shot('17-alta-producto.png');

  await page.goto('http://localhost:3005/inventory', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Ingreso de Mercadería/i }).click();
  await shot('18-ingreso-mercaderia.png');

  await page.goto('http://localhost:3005/orders/new/multifocal', { waitUntil: 'networkidle' });
  await shot('19-pedido-multifocal.png');

  await page.goto('http://localhost:3005/orders/new/contact', { waitUntil: 'networkidle' });
  await shot('20-lentes-contacto.png');

  await page.goto('http://localhost:3005/finance', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Egresos/i }).first().click();
  await shot('21-egreso-caja.png');

  await page.goto('http://localhost:3005/finance', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Conciliación/i }).first().click();
  await shot('22-conciliacion.png');

  const settingsShots = [
    ['Usuarios', '23-ajustes-usuarios.png'],
    ['Obras Sociales', '24-ajustes-obras-sociales.png'],
    ['Bancos', '25-ajustes-bancos.png'],
    ['Tabla de Cristales', '26-ajustes-cristales.png'],
    ['Audit Log', '27-audit-log.png']
  ];
  for (const [label, name] of settingsShots) {
    await page.goto('http://localhost:3005/settings', { waitUntil: 'networkidle' });
    await page.getByText(label, { exact: true }).first().click();
    await page.waitForTimeout(300);
    await shot(name);
  }

  console.log('QA_CAPTURE_OK 12');
  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
