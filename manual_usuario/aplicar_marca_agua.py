from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from lxml import etree
from PIL import Image

ROOT = Path(__file__).parent
DOCX = ROOT / 'Manual_de_Usuario_Optica_Paracao.docx'
SOURCE_LOGO = Path(r'C:\Users\astud\OneDrive\LYNX\Diseño de Marca\03_LOGOTIPO\RGB\PNG\Principal_VyN_fondoblanco.png')
WATERMARK = ROOT / 'assets' / 'lynx_marca_agua.png'

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
V = 'urn:schemas-microsoft-com:vml'
O = 'urn:schemas-microsoft-com:office:office'
PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships'

def q(ns, tag):
    return f'{{{ns}}}{tag}'

def make_transparent_logo():
    WATERMARK.parent.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE_LOGO).convert('RGBA')
    pixels = source.load()
    for y in range(source.height):
        for x in range(source.width):
            red, green, blue, alpha = pixels[x, y]
            whiteness = min(red, green, blue)
            # Los píxeles casi blancos son el fondo. El resto queda muy tenue.
            if whiteness > 242:
                pixels[x, y] = (red, green, blue, 0)
            else:
                pixels[x, y] = (red, green, blue, 24)
    source.save(WATERMARK)

def patch_docx():
    with ZipFile(DOCX, 'r') as zin:
        names = zin.namelist()
        headers = sorted(n for n in names if n.startswith('word/header') and n.endswith('.xml'))
        if not headers:
            raise RuntimeError('No se encontró un encabezado para alojar la marca de agua.')
        header = headers[0]
        rels_name = header.rsplit('/', 1)[0] + '/_rels/' + header.rsplit('/', 1)[1] + '.rels'
        rels_root = etree.fromstring(zin.read(rels_name)) if rels_name in names else etree.Element(q(PKG_REL, 'Relationships'))
        rel_ids = [rel.get('Id') for rel in rels_root.findall(q(PKG_REL, 'Relationship'))]
        rel_id = next((f'rId{i}' for i in range(1, 1000) if f'rId{i}' not in rel_ids), None)
        etree.SubElement(rels_root, q(PKG_REL, 'Relationship'), {
            'Id': rel_id,
            'Type': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
            'Target': 'media/lynx_marca_agua.png'
        })
        header_root = etree.fromstring(zin.read(header))
        paragraph = etree.Element(q(W, 'p'))
        run = etree.SubElement(paragraph, q(W, 'r'))
        pict = etree.SubElement(run, q(W, 'pict'))
        shape = etree.SubElement(pict, q(V, 'shape'), {
            'id': 'LynxConsultingWatermark',
            q(O, 'spid'): '_x0000_s2048',
            'type': '#_x0000_t75',
            'style': ('position:absolute;margin-left:0;margin-top:0;width:440pt;height:220pt;'
                      'z-index:-251654144;mso-position-horizontal:center;'
                      'mso-position-vertical:center;mso-wrap-edited:f;'),
            'stroked': 'f'
        })
        etree.SubElement(shape, q(V, 'imagedata'), {q(R, 'id'): rel_id, q(O, 'title'): 'LYNX Consulting'})
        header_root.append(paragraph)
        overrides = {
            header: etree.tostring(header_root, xml_declaration=True, encoding='UTF-8', standalone=True),
            rels_name: etree.tostring(rels_root, xml_declaration=True, encoding='UTF-8', standalone=True),
            'word/media/lynx_marca_agua.png': WATERMARK.read_bytes(),
        }
        temp = DOCX.with_suffix('.watermark.tmp.docx')
        with ZipFile(temp, 'w', ZIP_DEFLATED) as zout:
            for info in zin.infolist():
                if info.filename not in overrides:
                    zout.writestr(info, zin.read(info.filename))
            for name, content in overrides.items():
                zout.writestr(name, content)
    temp.replace(DOCX)

make_transparent_logo()
patch_docx()
print(DOCX)
