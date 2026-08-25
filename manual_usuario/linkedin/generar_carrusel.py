from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

ROOT = Path(__file__).parent
CAPTURES = ROOT.parent / 'capturas'
W, H = 1200, 1200
DISPLAY = r'C:\Windows\Fonts\bahnschrift.ttf'
BODY = r'C:\Windows\Fonts\segoeui.ttf'

SLIDES = [
    ('01_gestion_integral.png', CAPTURES / '02-inicio.png', 'UNA ÓPTICA.', 'TODA LA OPERACIÓN.', 'Clientes · pedidos · stock · finanzas'),
    ('02_pedidos.png', CAPTURES / '06-pedido-monofocal.png', 'PEDIDOS ÓPTICOS', 'CON TRAZABILIDAD.', 'De la receta al taller, sin perder información'),
    ('03_obras_sociales.png', CAPTURES / '24-ajustes-obras-sociales.png', 'OBRAS SOCIALES', 'SIN PLANILLAS.', 'Coberturas y reintegros en un mismo lugar'),
    ('04_conciliacion.png', CAPTURES / '22-conciliacion.png', 'CAJA Y BANCOS', 'BAJO CONTROL.', 'Movimientos, cierres y conciliación'),
    ('05_facturacion.png', ROOT / 'linkedin_sistema_factura_personalizada.png', 'FACTURACIÓN', 'A TU MEDIDA.', 'Diseño, datos fiscales y vista previa en vivo'),
]

def font(path, size):
    return ImageFont.truetype(path, size)

def rounded_mask(size, radius):
    mask = Image.new('L', size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *size), radius=radius, fill=255)
    return mask

def draw_slide(filename, source_path, kicker, headline, caption):
    source = Image.open(source_path).convert('RGB')
    bg = ImageOps.fit(source, (W, H), method=Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(20))
    overlay = Image.new('RGBA', (W, H), (6, 31, 25, 232))
    canvas = Image.alpha_composite(bg.convert('RGBA'), overlay)
    draw = ImageDraw.Draw(canvas)
    # Deterministic editorial geometry: a thin orange edge and a large product screenshot.
    draw.rectangle((0, 0, 14, H), fill=(246, 92, 34, 255))
    draw.ellipse((860, -180, 1380, 340), fill=(14, 108, 72, 95))
    draw.ellipse((-180, 830, 360, 1370), fill=(246, 92, 34, 30))

    draw.text((76, 72), 'LYNX CONSULTING  /  ÓPTICA PARACAO', font=font(BODY, 25), fill=(179, 221, 198, 255))
    draw.text((76, 140), kicker, font=font(DISPLAY, 43), fill=(246, 155, 74, 255))
    draw.text((76, 198), headline, font=font(DISPLAY, 68), fill=(250, 253, 250, 255))
    draw.text((76, 285), caption, font=font(BODY, 28), fill=(205, 229, 216, 255))

    frame = (76, 380, 1124, 1056)
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((frame[0] + 10, frame[1] + 16, frame[2] + 10, frame[3] + 16), radius=28, fill=(0, 0, 0, 120))
    canvas = Image.alpha_composite(canvas, shadow)
    panel = Image.new('RGBA', (frame[2]-frame[0], frame[3]-frame[1]), (18, 33, 29, 255))
    ImageDraw.Draw(panel).rounded_rectangle((0, 0, panel.width - 1, panel.height - 1), radius=28, outline=(102, 180, 139, 160), width=2)
    draw_panel = ImageDraw.Draw(panel)
    draw_panel.ellipse((26, 20, 38, 32), fill=(246, 92, 34, 255))
    draw_panel.ellipse((46, 20, 58, 32), fill=(246, 173, 74, 255))
    draw_panel.ellipse((66, 20, 78, 32), fill=(81, 174, 124, 255))
    screenshot = ImageOps.contain(source, (panel.width - 34, panel.height - 72), method=Image.Resampling.LANCZOS)
    sx = (panel.width - screenshot.width) // 2
    sy = 52 + (panel.height - 60 - screenshot.height) // 2
    panel.alpha_composite(screenshot.convert('RGBA'), (sx, sy))
    canvas.alpha_composite(panel, (frame[0], frame[1]))

    draw = ImageDraw.Draw(canvas)
    draw.text((76, 1114), 'IMPLEMENTACIÓN DE SOFTWARE PARA ÓPTICAS', font=font(BODY, 22), fill=(169, 207, 184, 255))
    draw.text((1072, 1112), '0' + filename[:2] + ' / 05', font=font(BODY, 22), fill=(169, 207, 184, 255))
    canvas.convert('RGB').save(ROOT / filename, quality=94)

for slide in SLIDES:
    draw_slide(*slide)

preview = Image.new('RGB', (1200, 1800), (6, 31, 25))
for index, (filename, *_rest) in enumerate(SLIDES):
    item = Image.open(ROOT / filename).convert('RGB')
    item.thumbnail((560, 560), Image.Resampling.LANCZOS)
    x = 26 + (index % 2) * 588
    y = 26 + (index // 2) * 588
    preview.paste(item, (x, y))
preview.save(ROOT / 'preview_carrusel.png', quality=92)

print('\n'.join(name for name, *_ in SLIDES))
