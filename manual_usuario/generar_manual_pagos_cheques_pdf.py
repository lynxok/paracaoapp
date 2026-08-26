from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak

OUTPUT = r'output\pdf\Manual_Modulo_Pagos_Mixtos_y_Cheques.pdf'
NAVY = colors.HexColor('#092B25')
GREEN = colors.HexColor('#0D6B47')
ORANGE = colors.HexColor('#F45C22')
MINT = colors.HexColor('#EAF5EF')
INK = colors.HexColor('#1E293B')
MUTED = colors.HexColor('#64748B')
LINE = colors.HexColor('#D8E5DE')

styles = getSampleStyleSheet()
title = ParagraphStyle('TitleCustom', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=25, leading=30, textColor=NAVY, alignment=TA_CENTER, spaceAfter=8)
subtitle = ParagraphStyle('SubtitleCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=11, leading=15, textColor=MUTED, alignment=TA_CENTER, spaceAfter=26)
h1 = ParagraphStyle('H1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=GREEN, spaceBefore=16, spaceAfter=8)
h2 = ParagraphStyle('H2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=NAVY, spaceBefore=10, spaceAfter=5)
body = ParagraphStyle('Body', parent=styles['BodyText'], fontName='Helvetica', fontSize=10, leading=14, textColor=INK, spaceAfter=6)
bullet = ParagraphStyle('BulletCustom', parent=body, leftIndent=15, firstLineIndent=-9, bulletIndent=3, spaceAfter=4)
note = ParagraphStyle('Note', parent=body, fontName='Helvetica-Oblique', textColor=NAVY, backColor=MINT, borderColor=LINE, borderWidth=0.7, borderPadding=9, spaceBefore=6, spaceAfter=10)
small = ParagraphStyle('Small', parent=body, fontSize=8.5, leading=11, textColor=MUTED, spaceAfter=0)

def p(text, style=body):
    return Paragraph(text, style)

def bullets(items):
    return [Paragraph(item, bullet, bulletText='•') for item in items]

def table(rows, widths):
    t = Table(rows, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.8),
        ('LEADING', (0, 0), (-1, -1), 11),
        ('GRID', (0, 0), (-1, -1), 0.35, LINE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7FAF8')]),
    ]))
    return t

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(doc.leftMargin, 0.55*inch, letter[0]-doc.rightMargin, 0.55*inch)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 0.35*inch, 'LYNX Consulting | Optica Paracao')
    canvas.drawRightString(letter[0]-doc.rightMargin, 0.35*inch, f'Pagina {doc.page}')
    canvas.restoreState()

doc = SimpleDocTemplate(OUTPUT, pagesize=letter, rightMargin=0.72*inch, leftMargin=0.72*inch, topMargin=0.72*inch, bottomMargin=0.78*inch)
story = []

story += [Spacer(1, 0.45*inch), p('MANUAL DE USUARIO', small), Spacer(1, 0.08*inch), p('Pagos Mixtos y Gestión de Cheques', title), p('Módulo complementario para proveedores, tesorería y control de vencimientos', subtitle)]
story.append(p('<b>Alcance.</b> Este manual explica cómo registrar pagos con efectivo, transferencia, tarjeta y uno o más cheques; cómo controlar que el total coincida con el comprobante y cómo seguir cada cheque hasta su resolución.', body))
story.append(Spacer(1, 8))
story.append(table([
    [p('Función', small), p('Resultado', small)],
    [p('Pagos mixtos', small), p('Cada medio queda distribuido e impacta en la caja, banco o tarjeta seleccionada.', small)],
    [p('Múltiples cheques', small), p('Cada cheque se registra por separado con importe, banco, vencimiento y observación.', small)],
    [p('Validación de totales', small), p('La confirmación se bloquea hasta que la diferencia sea $0.', small)],
    [p('Alertas', small), p('Se identifican cheques pendientes, a vencer, vencidos, cobrados, rechazados y anulados.', small)],
], [1.55*inch, 5.21*inch]))

story.append(h1 and p('1. Configurar la correlatividad de cheques', h1))
story.append(p('Antes de emitir cheques desde el sistema, configure el próximo número disponible de la chequera. Esta configuración es necesaria para que el sistema sugiera una numeración correlativa al agregar cada cheque.'))
story += bullets([
    '<b>Ingrese a Configuración.</b>',
    '<b>Ubique el campo “Próximo N.º de Cheque a Emitir”.</b>',
    '<b>Indique el próximo número libre</b> de la chequera física, usando solo números. Ejemplo: 1001.',
    '<b>Guarde la configuración.</b>'
])
story.append(p('<b>Cómo funciona:</b> al seleccionar “+ Agregar cheque”, el campo N.º de cheque se completa con el número configurado. Al confirmar la incorporación de ese cheque, el sistema actualiza el próximo número al consecutivo.', note))
story.append(p('<b>Control operativo:</b> si se saltea, anula o reemplaza un cheque, actualice este valor antes de emitir el siguiente. La correlatividad configurada debe coincidir siempre con la chequera física.', body))

story.append(p('2. Cargar un comprobante con pago mixto', h1))
story += bullets([
    'Ingrese a <b>Proveedores</b> y abra el proveedor correspondiente, o trabaje desde la pestaña <b>Compras</b>.',
    'Seleccione <b>Cargar comprobante</b>.',
    'Indique el tipo: <b>Factura / Débito</b> para una obligación, o <b>Pago / Crédito</b> para registrar una cancelación o crédito.',
    'Complete fecha, número de comprobante, monto, condición de pago y vencimiento general cuando corresponda.',
    'En <b>Distribución de pago</b>, ingrese los importes de efectivo, transferencia, tarjeta y/o cheques.',
    'Revise el resumen y confirme solamente cuando la <b>Diferencia</b> sea $0.'
])

story.append(p('3. Agregar uno o más cheques', h1))
story.append(p('En la sección <b>Cheques emitidos</b>, seleccione <b>+ Agregar cheque</b>. Complete los datos de cada cheque y confirme su incorporación. Repita el procedimiento para agregar todos los cheques necesarios.'))
story.append(table([
    [p('Campo', small), p('Uso', small)],
    [p('N.º de cheque', small), p('Se propone según la correlatividad configurada. Verifique que coincida con el documento físico.', small)],
    [p('Banco', small), p('Entidad bancaria asociada al cheque.', small)],
    [p('Importe', small), p('Valor individual del cheque. Debe ser mayor a cero.', small)],
    [p('Plazo', small), p('Seleccione 30, 60, 90 o 120 días.', small)],
    [p('Vencimiento', small), p('Fecha individual en la que vence el cheque.', small)],
    [p('Observación', small), p('Dato opcional para aclaraciones o referencias.', small)],
], [1.55*inch, 5.21*inch]))
story.append(p('<b>Importante:</b> no agrupe varios cheques en un mismo registro. Cada cheque debe tener su propio número, banco, importe y vencimiento.', note))

story.append(p('4. Validación de importes', h1))
story.append(p('El resumen del comprobante calcula en tiempo real el <b>Total de la factura</b>, los importes por medio de pago, el <b>Total imputado</b> y la <b>Diferencia</b>.'))
story += bullets([
    'La operación se confirma únicamente cuando la diferencia es exactamente <b>$0</b>.',
    'No se permite confirmar si el total imputado es menor o mayor que el total del comprobante.',
    'Si se abona solo con cheques, la suma de todos los cheques debe coincidir exactamente con el total.',
    'En una Factura / Débito puede indicar el importe que quedará pendiente en <b>Cuenta corriente / deuda</b>.'
])
story.append(p('<b>Ejemplo:</b> factura de $1.000.000. Efectivo: $300.000; cheque a 30 días: $400.000; cheque a 60 días: $300.000. Total imputado: $1.000.000. Diferencia: $0. La operación puede confirmarse.', note))

story.append(PageBreak())
story.append(p('5. Impacto de la operación', h1))
story += bullets([
    'El importe en efectivo genera un egreso en la caja seleccionada.',
    'La transferencia genera un egreso en el banco o billetera seleccionada.',
    'La tarjeta genera un egreso en la caja de tarjeta seleccionada.',
    'Cada cheque queda registrado en <b>Finanzas > Cheques</b> como <b>Emitido</b> y <b>Pendiente</b>.',
    'El comprobante queda asociado al proveedor y a su cuenta corriente.'
])

story.append(p('6. Consultar y gestionar cheques', h1))
story += bullets([
    'Ingrese a <b>Finanzas</b> y seleccione la pestaña <b>Cheques</b>.',
    'Utilice el buscador para localizar por número, banco, proveedor o cliente.',
    'Aplique filtros por estado: Pendiente, Cobrado, Rechazado o Anulado.',
    'Revise número, banco, importe, vencimiento, plazo, tipo, contraparte, estado y observaciones.'
])
story.append(p('Para un cheque pendiente, podrá seleccionar <b>Acreditar</b>, elegir la caja o banco de destino y confirmar el cobro/acreditación. También puede marcarlo como <b>Rechazado</b> o <b>Anulado</b> cuando corresponda.'))

story.append(p('7. Alertas de vencimiento', h1))
story.append(table([
    [p('Estado', small), p('Criterio', small)],
    [p('Pendiente', small), p('Vence dentro de más de 7 días.', small)],
    [p('A vencer', small), p('Vence dentro de los próximos 7 días.', small)],
    [p('Vencido', small), p('La fecha de vencimiento ya pasó.', small)],
    [p('Cobrado', small), p('El cheque fue acreditado o cobrado.', small)],
    [p('Rechazado / Anulado', small), p('El cheque fue marcado con ese estado.', small)],
], [1.55*inch, 5.21*inch]))
story.append(p('Cuando existan cheques vencidos o a vencer, el <b>Panel de control</b> y la pantalla de <b>Finanzas</b> mostrarán una alerta con la cantidad de cheques que requieren atención. El botón <b>Gestionar cheques</b> abre la pestaña correspondiente.', body))

story.append(p('8. Buenas prácticas', h1))
story += bullets([
    'Configure y verifique la correlatividad antes de usar una nueva chequera.',
    'Controle número, banco, importe y vencimiento antes de confirmar cada cheque.',
    'Use la observación para registrar condiciones especiales o referencias del proveedor.',
    'Revise los cheques pendientes al inicio de cada jornada.',
    'Antes de modificar el total de una factura, revise todos los medios de pago cuando la diferencia no sea $0.'
])

story.append(p('Preguntas frecuentes', h1))
story.append(p('<b>¿Puedo pagar una factura con efectivo y varios cheques?</b><br/>Sí. Cargue el efectivo y agregue cada cheque por separado. La suma debe coincidir con el total de la factura.'))
story.append(p('<b>¿Puedo cargar cheques con vencimientos distintos?</b><br/>Sí. Cada cheque tiene su propio plazo y fecha de vencimiento.'))
story.append(p('<b>¿Por qué no puedo confirmar el comprobante?</b><br/>Porque la diferencia no es $0. Revise el total imputado y los importes de cada medio de pago.'))
story.append(p('<b>¿Cómo se controla la correlatividad?</b><br/>Defina el próximo número libre en Configuración. El sistema lo propone al agregar un cheque y avanza el valor al confirmar la incorporación.'))

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
