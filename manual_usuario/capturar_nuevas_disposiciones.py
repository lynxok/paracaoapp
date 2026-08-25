import os
from pathlib import Path
from playwright.sync_api import sync_playwright

base = 'http://127.0.0.1:3005'
out = Path('manual_usuario/capturas')
out.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    page.goto(base, wait_until='networkidle')
    page.get_by_label('Usuario / Email').fill(os.environ['MANUAL_EMAIL'])
    page.get_by_label('Contraseña').fill(os.environ['MANUAL_PASSWORD'])
    page.get_by_role('button', name='Ingresar').click()
    page.wait_for_timeout(1500)
    if 'Panel de Control' not in page.locator('body').inner_text():
        raise RuntimeError('No se pudo iniciar sesión: ' + page.locator('body').inner_text()[:500])

    page.goto(base + '/settings', wait_until='networkidle')
    page.get_by_text('Obras Sociales', exact=True).first.click()
    page.wait_for_timeout(300)
    page.screenshot(path=str(out / '01_obras_sociales.png'), full_page=True)
    page.get_by_role('button', name='Nueva Obra Social').click()
    page.wait_for_timeout(300)
    page.screenshot(path=str(out / '02_nueva_obra_social.png'), full_page=True)
    page.get_by_role('button', name='Cancelar').click()

    page.goto(base + '/finance', wait_until='networkidle')
    page.get_by_text('Conciliación', exact=True).click()
    page.wait_for_timeout(400)
    page.screenshot(path=str(out / '03_conciliacion.png'), full_page=True)
    browser.close()
