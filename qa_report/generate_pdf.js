/**
 * GENERADOR DE PDF INTERACTIVO — PLAN QA ÓPTICA PARACÁO
 * 60 casos de prueba con formularios AcroForm (checkboxes + campos de texto editables)
 * 
 * CONVENCIÓN QA: Todos los datos de ejemplo usan el prefijo "QA" 
 * para facilitar su eliminación de la base de datos con una query simple.
 *
 * Uso: node generate_pdf.js
 */

const { PDFDocument, rgb, StandardFonts, PDFName, PDFBool } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// ─── PALETA DE COLORES ────────────────────────────────────────────────────────
const C = {
  blueDark:    rgb(0.118, 0.227, 0.541),  // #1e3a8a
  blueMid:     rgb(0.145, 0.388, 0.922),  // #2563eb
  blueLight:   rgb(0.859, 0.918, 0.996),  // #dbeafe
  greenDark:   rgb(0.020, 0.588, 0.416),  // #059669
  greenLight:  rgb(0.820, 0.980, 0.898),  // #d1fae5
  redDark:     rgb(0.863, 0.149, 0.149),  // #dc2626
  redLight:    rgb(0.996, 0.886, 0.886),  // #fee2e2
  yellowDark:  rgb(0.851, 0.467, 0.024),  // #d97706
  yellowLight: rgb(0.996, 0.953, 0.765),  // #fef3c7
  slate900:    rgb(0.059, 0.090, 0.165),  // #0f172a
  slate700:    rgb(0.200, 0.255, 0.341),  // #334155
  slate500:    rgb(0.392, 0.455, 0.545),  // #64748b
  slate300:    rgb(0.796, 0.835, 0.882),  // #cbd5e1
  slate100:    rgb(0.945, 0.961, 0.976),  // #f1f5f9
  slate50:     rgb(0.973, 0.980, 0.992),  // #f8fafc
  white:       rgb(1, 1, 1),
};

// ─── DATOS DE LOS 60 CASOS DE PRUEBA ─────────────────────────────────────────
// NOTA: Todos los valores de ejemplo llevan el prefijo "QA" para facilitar 
// la limpieza posterior de la base de datos con una query tipo:
// DELETE FROM clients WHERE name LIKE 'QA%';

const TEST_CASES = [
  // ── BLOQUE A: AUTENTICACIÓN ──────────────────────────────────────────────
  {
    id: 'TC-01', block: 'A', blockName: 'Autenticación y Navegación',
    title: 'Login con Credenciales Válidas',
    module: 'Autenticación', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Abrir https://opticagestionparacao.lnx.com.ar', expected: 'Se muestra la pantalla de login con Email, Contraseña y Sucursal' },
      { step: '2', action: 'Email: astudillajuansimon@gmail.com', expected: 'El campo acepta el texto' },
      { step: '3', action: 'Contraseña: juansimon', expected: 'Se muestra oculta con asteriscos' },
      { step: '4', action: 'Seleccionar una Sucursal del desplegable', expected: 'La sucursal se selecciona correctamente' },
      { step: '5', action: 'Hacer clic en "Iniciar Sesión"', expected: 'Redirige al Dashboard sin errores' },
      { step: '6', action: 'Verificar que el Dashboard cargue métricas y menú lateral', expected: 'Todos los elementos son visibles' },
    ],
    params: null
  },
  {
    id: 'TC-02', block: 'A', blockName: 'Autenticación y Navegación',
    title: 'Login con Contraseña Incorrecta',
    module: 'Autenticación', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Abrir la pantalla de login', expected: 'Se muestra el formulario de login' },
      { step: '2', action: 'Email: astudillajuansimon@gmail.com | Contraseña: QA-CLAVE-INCORRECTA', expected: 'El campo acepta el texto' },
      { step: '3', action: 'Hacer clic en "Iniciar Sesión"', expected: 'Aparece mensaje de error "Credenciales inválidas"' },
      { step: '4', action: 'Verificar que NO se accede al sistema', expected: 'El usuario permanece en la pantalla de login' },
    ],
    params: null
  },
  {
    id: 'TC-03', block: 'A', blockName: 'Autenticación y Navegación',
    title: 'Navegación Completa por el Menú Lateral',
    module: 'Navegación General', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Hacer clic en "Clientes" en el menú lateral', expected: 'Se carga la lista de clientes sin pantalla en blanco' },
      { step: '2', action: 'Hacer clic en "Inventario"', expected: 'Se carga la tabla de inventario de productos' },
      { step: '3', action: 'Hacer clic en "Trabajos / Taller"', expected: 'Se muestra el listado de trabajos de laboratorio' },
      { step: '4', action: 'Hacer clic en "Caja / Ventas"', expected: 'Se muestra el módulo de caja' },
      { step: '5', action: 'Hacer clic en "Métricas"', expected: 'Se visualizan gráficos y estadísticas' },
      { step: '6', action: 'Hacer clic en "Configuración"', expected: 'Se abre la pantalla de ajustes' },
      { step: '7', action: 'Hacer clic en el logo o "Dashboard"', expected: 'Regresa al panel principal sin errores' },
    ],
    params: null
  },

  // ── BLOQUE B: CLIENTES ───────────────────────────────────────────────────
  {
    id: 'TC-04', block: 'B', blockName: 'Gestión de Clientes',
    title: 'Alta de Cliente con Todos los Datos',
    module: 'Clientes', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Ir a "Clientes" → clic en "Nuevo Cliente"', expected: 'Se abre el formulario/modal de alta' },
      { step: '2', action: 'Nombre: QA García María | DNI: QA-30555777', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Teléfono: QA-343-4123456 | Email: qa.garcia@testoptica.com', expected: 'Los campos aceptan los datos' },
      { step: '4', action: 'Fecha Nacimiento: 15/03/1985 | Dirección: QA Av. Rivadavia 1234', expected: 'Los campos aceptan los datos' },
      { step: '5', action: 'Hacer clic en "Guardar"', expected: 'El modal se cierra y el cliente aparece en el listado' },
      { step: '6', action: 'Buscar "QA García" en el buscador', expected: 'El cliente recién creado aparece en los resultados' },
    ],
    params: '⚠️ CONVENCIÓN QA: Todos los datos de prueba deben incluir el prefijo "QA" para permitir su limpieza posterior con: DELETE FROM clients WHERE name LIKE \'QA%\';'
  },
  {
    id: 'TC-05', block: 'B', blockName: 'Gestión de Clientes',
    title: 'Alta de Cliente con DNI Duplicado',
    module: 'Clientes', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Clientes" → "Nuevo Cliente"', expected: 'Se abre el formulario' },
      { step: '2', action: 'Ingresar el mismo DNI del TC-04: QA-30555777', expected: 'El campo acepta el valor' },
      { step: '3', action: 'Completar el resto de los datos y hacer clic en "Guardar"', expected: 'El sistema muestra advertencia de DNI duplicado O crea igualmente (anotar cuál ocurre)' },
    ],
    params: null
  },
  {
    id: 'TC-06', block: 'B', blockName: 'Gestión de Clientes',
    title: 'Búsqueda de Cliente por Nombre y DNI',
    module: 'Clientes', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'En "Clientes" escribir "QA García" en el buscador', expected: 'La lista filtra en tiempo real mostrando al cliente' },
      { step: '2', action: 'Borrar el texto del buscador', expected: 'La lista vuelve a mostrar todos los clientes' },
      { step: '3', action: 'Buscar por nombre parcial: "QA Gar"', expected: 'Aparecen los clientes cuyo nombre contiene el texto' },
    ],
    params: null
  },
  {
    id: 'TC-07', block: 'B', blockName: 'Gestión de Clientes',
    title: 'Edición de Datos de un Cliente',
    module: 'Clientes', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Buscar "QA García" y hacer clic en el ícono de editar (lápiz)', expected: 'Se abre el formulario precargado con los datos del cliente' },
      { step: '2', action: 'Modificar el teléfono a "QA-343-9999888" y hacer clic en "Guardar"', expected: 'El teléfono se actualiza en el listado' },
      { step: '3', action: 'Volver a buscar al cliente y verificar el nuevo teléfono', expected: 'Se muestra "QA-343-9999888"' },
    ],
    params: null
  },
  {
    id: 'TC-08', block: 'B', blockName: 'Gestión de Clientes',
    title: 'Asignación de Obra Social a un Cliente',
    module: 'Clientes', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Abrir edición de "QA García María"', expected: 'Se abre el formulario con sus datos' },
      { step: '2', action: 'Seleccionar una Obra Social (ej. PAMI o OSDE) del desplegable', expected: 'La obra social queda asignada' },
      { step: '3', action: 'Guardar los cambios', expected: 'La mutua queda vinculada al cliente' },
      { step: '4', action: 'Ir a "Nueva Orden" y buscar "QA García"', expected: 'Aparece un badge azul con el nombre de la obra social junto al cliente' },
    ],
    params: null
  },
  {
    id: 'TC-09', block: 'B', blockName: 'Gestión de Clientes',
    title: 'Vista del Historial de Compras de un Cliente',
    module: 'Clientes', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Buscar "QA García" y hacer clic en su ícono de historial', expected: 'Se abre un modal con el historial de compras/trabajos' },
      { step: '2', action: 'Verificar que cada entrada muestra fecha, tipo y monto', expected: 'Los datos históricos son legibles y completos' },
      { step: '3', action: 'Cerrar el modal', expected: 'El modal se cierra sin errores' },
    ],
    params: null
  },
  {
    id: 'TC-10', block: 'B', blockName: 'Gestión de Clientes',
    title: 'Cobro de Seña / Pago Parcial en Cuenta Corriente',
    module: 'Cuenta Corriente', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Buscar un cliente con saldo deudor y hacer clic en "Cobrar"', expected: 'Se abre el modal de registro de pago' },
      { step: '2', action: 'Monto: $5.000 | Medio: Efectivo | Caja: Caja Efectivo', expected: 'Los campos aceptan los datos correctamente' },
      { step: '3', action: 'Hacer clic en "Emitir Recibo" o "Confirmar Pago"', expected: 'El saldo de cuenta corriente disminuye en $5.000' },
      { step: '4', action: 'Verificar que se genera un recibo imprimible', expected: 'Se abre la ventana de impresión del recibo' },
    ],
    params: null
  },

  // ── BLOQUE C: INVENTARIO ──────────────────────────────────────────────────
  {
    id: 'TC-11', block: 'C', blockName: 'Inventario y Stock',
    title: 'Alta de Nuevo Producto en Inventario',
    module: 'Inventario', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Ir a "Inventario" → "Añadir Nuevo"', expected: 'Se abre el modal de producto' },
      { step: '2', action: 'Nombre: QA Armazón Pro | SKU: QA-ARMAZ-001 | Categoría: Armazones', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Stock Casa Central: 10 | Stock Shopping: 5 | Stock Crítico: 3', expected: 'Los valores numéricos se ingresan correctamente' },
      { step: '4', action: 'Precio Compra: $8.000 | Precio Venta: $20.000', expected: 'Los precios se aceptan (ambos positivos)' },
      { step: '5', action: 'Hacer clic en "Guardar Producto"', expected: 'El artículo aparece en la tabla de inventario' },
    ],
    params: '⚠️ CONVENCIÓN QA: SKU debe empezar con "QA-" para facilitar la limpieza: DELETE FROM inventory WHERE sku LIKE \'QA-%\';'
  },
  {
    id: 'TC-12', block: 'C', blockName: 'Inventario y Stock',
    title: 'Bloqueo de Precio Negativo en Inventario',
    module: 'Inventario / Validaciones', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Ir a "Inventario" → "Añadir Nuevo" y completar todos los campos', expected: 'Formulario con datos' },
      { step: '2', action: 'En "Precio de Venta" ingresar el valor: -1500', expected: 'El campo acepta el valor temporalmente' },
      { step: '3', action: 'Hacer clic en "Guardar Producto"', expected: 'El sistema muestra alerta: "El precio no puede ser negativo"' },
      { step: '4', action: 'Verificar que el producto NO se crea en la tabla', expected: 'El modal permanece abierto; no se registra el artículo' },
    ],
    params: null
  },
  {
    id: 'TC-13', block: 'C', blockName: 'Inventario y Stock',
    title: 'Ingreso de Mercadería (Aumento de Stock)',
    module: 'Inventario / Stock', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Inventario" → botón "Ingreso de Mercadería"', expected: 'Se abre el modal de ingreso de stock' },
      { step: '2', action: 'Sucursal: Casa Central | Producto: QA Armazón Pro | Cantidad: 20', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Proveedor: QA Proveedor Test | Precio Compra: $8.500', expected: 'Los campos aceptan los datos' },
      { step: '4', action: 'Hacer clic en "Registrar Ingreso"', expected: 'El stock en Casa Central aumenta en 20 unidades' },
    ],
    params: null
  },
  {
    id: 'TC-14', block: 'C', blockName: 'Inventario y Stock',
    title: 'Egreso de Stock por Rotura / Pérdida',
    module: 'Inventario / Movimientos', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Hacer clic derecho en "QA Armazón Pro" → "Registrar Egreso"', expected: 'Se abre el modal de egreso' },
      { step: '2', action: 'Sucursal: Casa Central | Cantidad: 3 | Motivo: Rotura', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Hacer clic en "Confirmar Egreso"', expected: 'El stock en Casa Central disminuye en 3 unidades' },
      { step: '4', action: 'Ir a la pestaña "Movimientos" del inventario', expected: 'El movimiento aparece registrado en el historial' },
    ],
    params: null
  },
  {
    id: 'TC-15', block: 'C', blockName: 'Inventario y Stock',
    title: 'Transferencia de Stock entre Sucursales',
    module: 'Inventario / Multi-Sucursal', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Hacer clic derecho en "QA Armazón Pro" → "Mover Stock"', expected: 'Se abre el modal de transferencia' },
      { step: '2', action: 'Origen: Casa Central | Destino: Shopping | Cantidad: 5', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Hacer clic en "Confirmar Transferencia"', expected: 'Casa Central -5, Shopping +5 unidades' },
      { step: '4', action: 'Verificar el stock por sucursal (hacer clic en el total del producto)', expected: 'El popover muestra el stock correcto por sucursal' },
    ],
    params: null
  },
  {
    id: 'TC-16', block: 'C', blockName: 'Inventario y Stock',
    title: 'Transferencia con Stock Insuficiente',
    module: 'Inventario / Validaciones', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Abrir "Mover Stock" para cualquier producto. Seleccionar sucursal con stock = 0 como origen', expected: 'Se abre el modal' },
      { step: '2', action: 'Ingresar cantidad: 10 y hacer clic en "Confirmar"', expected: 'El sistema muestra alerta de stock insuficiente con la cantidad disponible' },
      { step: '3', action: 'Verificar que el stock no se modifica en ninguna sucursal', expected: 'Los stocks permanecen igual' },
    ],
    params: null
  },
  {
    id: 'TC-17', block: 'C', blockName: 'Inventario y Stock',
    title: 'Búsqueda y Filtrado en Inventario',
    module: 'Inventario / Filtros', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'En el buscador de Inventario escribir "QA"', expected: 'La tabla filtra y muestra solo los productos del QA' },
      { step: '2', action: 'Cambiar el filtro de categoría a "Cristales"', expected: 'La tabla muestra solo productos de esa categoría' },
      { step: '3', action: 'Cambiar el filtro de sucursal a "Shopping"', expected: 'El stock mostrado corresponde al de Shopping' },
      { step: '4', action: 'Limpiar todos los filtros', expected: 'La tabla vuelve a mostrar todos los productos' },
    ],
    params: null
  },
  {
    id: 'TC-18', block: 'C', blockName: 'Inventario y Stock',
    title: 'Eliminación de un Producto del Inventario',
    module: 'Inventario', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Ir a la pestaña "Productos" y localizar "QA Armazón Pro"', expected: 'El producto está visible en la tabla' },
      { step: '2', action: 'Hacer clic en el ícono de eliminar (basura)', expected: 'Aparece una ventana de confirmación' },
      { step: '3', action: 'Confirmar la eliminación', expected: 'El producto desaparece de la tabla' },
      { step: '4', action: 'Buscar "QA-ARMAZ-001" en el buscador', expected: 'No se encuentran resultados' },
    ],
    params: null
  },

  // ── BLOQUE D: RECETAS ─────────────────────────────────────────────────────
  {
    id: 'TC-19', block: 'D', blockName: 'Recetas y Órdenes de Laboratorio',
    title: 'Alta de Receta Monofocal Completa',
    module: 'Recetas / Monofocal', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Ir a "Nueva Orden" → seleccionar tipo "Monofocal"', expected: 'Se muestra el formulario de receta monofocal' },
      { step: '2', action: 'Asociar cliente: QA García María (buscar por nombre)', expected: 'El cliente se vincula y sus datos se autocompletan' },
      { step: '3', action: 'OD Lejos: Esf +1.50 | Cil -0.50 | Eje 90°', expected: 'Los campos aceptan los valores ópticos' },
      { step: '4', action: 'OI Lejos: Esf +1.00 | Cil  0.00 | Eje  0°', expected: 'Los campos aceptan los valores' },
      { step: '5', action: 'DNP: 62 | Altura de montaje: 18', expected: 'Los campos aceptan los valores' },
      { step: '6', action: 'Cristal: QA Monofocal Orgánico 1.50 | Marco: QA Armazón Pro (del inventario)', expected: 'Ambos se asignan y el total se calcula automáticamente' },
      { step: '7', action: 'Hacer clic en "Agregar al Carrito"', expected: 'La orden se agrega sin errores' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR:\n• OD Esférico +1.50 → debe aceptarse (rango normal)\n• OD Cilíndrico -0.50 → debe aceptarse (negativo válido)\n• DNP 62 → dentro del rango esperado (55-72 mm)\n• Total = precio cristal × 2 + precio marco\n• El nombre del trabajo debe aparecer con prefijo "QA"'
  },
  {
    id: 'TC-20', block: 'D', blockName: 'Recetas y Órdenes de Laboratorio',
    title: 'Advertencia de Dioptrías Fuera de Rango (±30.00)',
    module: 'Recetas / Validaciones', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Nueva Orden" → "Monofocal" y asociar cliente', expected: 'Se muestra el formulario' },
      { step: '2', action: 'OD Lejos Esférico: +35.00 (VALOR FUERA DE RANGO)', expected: 'El campo acepta el valor sin error inmediato' },
      { step: '3', action: 'Hacer clic en "Agregar al Carrito"', expected: 'El sistema muestra alerta: "Dioptrías fuera del rango habitual (±30.00). ¿Continuar?"' },
      { step: '4', action: 'Hacer clic en "Cancelar" en la alerta', expected: 'La orden NO se agrega; se permanece en el formulario' },
      { step: '5', action: 'Corregir el valor a +3.50 y confirmar', expected: 'La orden se agrega sin más alertas de rango' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR:\n• Valor +35.00 → debe disparar advertencia (supera ±30.00)\n• Valor -31.00 → debe disparar advertencia\n• Valor +30.00 → NO debe disparar advertencia (es el límite)\n• Valor +3.50 → NO debe disparar advertencia (rango normal)'
  },
  {
    id: 'TC-21', block: 'D', blockName: 'Recetas y Órdenes de Laboratorio',
    title: 'Alta de Receta Multifocal con Adición',
    module: 'Recetas / Multifocal', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Nueva Orden" → tipo "Multifocal"', expected: 'Se muestra el formulario con secciones: Lejos, Cerca y Adición' },
      { step: '2', action: 'Asociar cliente: QA García María', expected: 'El cliente se vincula' },
      { step: '3', action: 'OD Lejos: Esf +2.00 | Cil -0.25 | Eje 75°', expected: 'Los campos aceptan los valores' },
      { step: '4', action: 'OI Lejos: Esf +1.75 | Cil -0.50 | Eje 105°', expected: 'Los campos aceptan los valores' },
      { step: '5', action: 'Adición OD: +2.00 | Adición OI: +2.25', expected: 'Los campos aceptan los valores (entre +0.75 y +3.50)' },
      { step: '6', action: 'DNP lejos: 64 | DNP cerca: 60 | Altura: 20', expected: 'Los campos aceptan los valores' },
      { step: '7', action: 'Cristal: QA Multifocal Progressive 1.60 | Confirmar', expected: 'La orden multifocal se agrega correctamente' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR:\n• Adición +2.00 → válida (rango típico +0.75 a +3.50)\n• Adición +4.00 → debe generar advertencia (atípica)\n• DNP Cerca debe ser ≤ DNP Lejos\n• El precio del cristal multifocal es distinto al monofocal\n• El campo "Tipo de trabajo" debe quedar como "Multifocal"'
  },
  {
    id: 'TC-22', block: 'D', blockName: 'Recetas y Órdenes de Laboratorio',
    title: 'Receta con Descuento de Obra Social',
    module: 'Recetas / Obras Sociales', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Crear nueva receta y asociar a "QA García María" (con obra social asignada en TC-08)', expected: 'Se muestra el badge de la Obra Social del cliente' },
      { step: '2', action: 'Seleccionar un cristal y un armazón', expected: 'El subtotal se calcula correctamente' },
      { step: '3', action: 'Verificar en el resumen del pedido que se aplica el descuento de la mutua', expected: 'Total final = Subtotal - Cobertura de la obra social' },
      { step: '4', action: 'Confirmar el pedido', expected: 'Se agrega al carrito con el precio descontado correcto' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR:\n• Cobertura cristales = valor configurado en la obra social\n• Cobertura armazones = valor configurado en la obra social\n• El total nunca puede ser negativo\n• El comprobante debe indicar el nombre de la obra social y el monto cubierto'
  },
  {
    id: 'TC-23', block: 'D', blockName: 'Recetas y Órdenes de Laboratorio',
    title: 'Envío de Pedido a Laboratorio Externo',
    module: 'Recetas / Laboratorio', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Crear una nueva receta completa con nombre del trabajo: "QA Test Lab"', expected: 'El formulario se completa' },
      { step: '2', action: 'Hacer clic en "Enviar a Laboratorio"', expected: 'Se abre el modal de selección de laboratorio' },
      { step: '3', action: 'Seleccionar laboratorio: QA Laboratorio Test | Fecha entrega: próxima semana', expected: 'El laboratorio y la fecha quedan asignados' },
      { step: '4', action: 'Hacer clic en "Enviar" o "Asignar Lab"', expected: 'El lab queda vinculado y se muestra en el resumen del pedido' },
      { step: '5', action: '(Opcional) Hacer clic en "Imprimir Tarjeta de Laboratorio"', expected: 'Se abre el preview de impresión con la orden del laboratorio' },
    ],
    params: null
  },

  // ── BLOQUE E: TALLER ──────────────────────────────────────────────────────
  {
    id: 'TC-24', block: 'E', blockName: 'Taller / Trabajos',
    title: 'Listado y Filtrado de Trabajos en Taller',
    module: 'Taller', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Ir a "Trabajos / Taller" desde el menú', expected: 'Se muestra el listado de órdenes con cliente, tipo, estado y fecha' },
      { step: '2', action: 'Filtrar por estado "Pendientes"', expected: 'La lista muestra solo los trabajos con ese estado' },
      { step: '3', action: 'Buscar "QA" en el buscador de nombre de cliente', expected: 'La lista filtra los trabajos del QA en tiempo real' },
    ],
    params: null
  },
  {
    id: 'TC-25', block: 'E', blockName: 'Taller / Trabajos',
    title: 'Flujo Completo de Estados de un Trabajo',
    module: 'Taller / Estados', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Localizar un trabajo "QA" en estado "Pendiente" y cambiarlo a "En Taller"', expected: 'El badge cambia de color al nuevo estado' },
      { step: '2', action: 'Cambiar el estado a "Listo"', expected: 'El badge se actualiza a "Listo"' },
      { step: '3', action: 'Cambiar el estado a "Entregado"', expected: 'El trabajo se marca como entregado y puede pasar al historial' },
      { step: '4', action: 'Verificar que cada cambio registra la fecha y hora de modificación', expected: 'Las marcas de tiempo son correctas' },
    ],
    params: null
  },
  {
    id: 'TC-26', block: 'E', blockName: 'Taller / Trabajos',
    title: 'Impresión de Tarjeta de Laboratorio',
    module: 'Taller / Impresión', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Localizar el trabajo "QA Test Lab" con laboratorio asignado', expected: 'El trabajo es visible en el listado del taller' },
      { step: '2', action: 'Hacer clic en el ícono de impresora o "Imprimir Tarjeta"', expected: 'Se abre una ventana de preview de impresión' },
      { step: '3', action: 'Verificar que el documento contiene: cliente, graduación, laboratorio y fecha de entrega', expected: 'Todos los datos están correctamente impresos' },
      { step: '4', action: 'Cerrar la ventana de impresión', expected: 'Se cierra sin errores' },
    ],
    params: null
  },

  // ── BLOQUE F: CAJA ────────────────────────────────────────────────────────
  {
    id: 'TC-27', block: 'F', blockName: 'Caja, Ventas y Tesorería',
    title: 'Registro de Venta Completa en Efectivo',
    module: 'Caja / Ventas', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Tener una orden "QA" en el carrito y abrir la pantalla de venta/cierre', expected: 'Se muestra el resumen del pedido con total' },
      { step: '2', action: 'Medio de Pago: Efectivo | Caja: Caja Efectivo | Monto recibido: total del pedido', expected: 'Los campos aceptan los datos; el vuelto se calcula si hay diferencia' },
      { step: '3', action: 'Hacer clic en "Confirmar Venta"', expected: 'La venta se registra, el carrito se vacía y aparece comprobante' },
      { step: '4', action: 'Verificar el movimiento en el historial de Caja', expected: 'La transacción es visible con el monto correcto' },
    ],
    params: null
  },
  {
    id: 'TC-28', block: 'F', blockName: 'Caja, Ventas y Tesorería',
    title: 'Venta por Transferencia Bancaria',
    module: 'Caja / Ventas', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Tener una orden "QA" en el carrito', expected: 'Carrito no vacío con el pedido QA' },
      { step: '2', action: 'Seleccionar Medio de Pago: Transferencia | Banco: el disponible', expected: 'Los campos se seleccionan correctamente' },
      { step: '3', action: 'Confirmar la venta', expected: 'La venta se registra en la caja bancaria, NO en la caja de efectivo' },
      { step: '4', action: 'Verificar en el historial que el movimiento está en la caja bancaria', expected: 'La transacción aparece en la caja bancaria/digital' },
    ],
    params: null
  },
  {
    id: 'TC-29', block: 'F', blockName: 'Caja, Ventas y Tesorería',
    title: 'Registro de Gasto Operativo en Caja',
    module: 'Caja / Egresos', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Caja" y hacer clic en "Registrar Gasto" o "Nuevo Egreso"', expected: 'Se abre el formulario de egreso' },
      { step: '2', action: 'Concepto: QA Gasto Test | Monto: $8.500 | Descripción: QA Factura test Julio', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Seleccionar Caja: Efectivo y confirmar', expected: 'El saldo de la caja disminuye en $8.500 y el movimiento queda registrado' },
    ],
    params: null
  },
  {
    id: 'TC-30', block: 'F', blockName: 'Caja, Ventas y Tesorería',
    title: 'Verificación del Saldo de Caja en Tiempo Real',
    module: 'Caja / Saldo', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Anotar el saldo actual de Caja Efectivo ANTES de realizar movimientos', expected: 'Saldo inicial anotado correctamente' },
      { step: '2', action: 'Registrar una venta de $10.000 en efectivo (TC-27)', expected: 'La venta se registra' },
      { step: '3', action: 'Registrar un gasto de $2.000 en efectivo (TC-29)', expected: 'El gasto se registra' },
      { step: '4', action: 'Verificar que Saldo Final = Saldo Inicial + $10.000 - $2.000', expected: 'El sistema es matemáticamente consistente' },
    ],
    params: null
  },

  // ── BLOQUE G: MÉTRICAS ────────────────────────────────────────────────────
  {
    id: 'TC-31', block: 'G', blockName: 'Métricas y Reportes',
    title: 'Dashboard de Métricas y KPIs',
    module: 'Métricas', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Ir a "Métricas" y verificar los KPIs: Ventas del mes, Trabajos activos, Clientes nuevos', expected: 'Los indicadores tienen valores numéricos visibles' },
      { step: '2', action: 'Cambiar el rango de fechas (ej. último trimestre)', expected: 'Los gráficos se actualizan con los datos del período' },
      { step: '3', action: 'Verificar que los totales coinciden con las ventas QA registradas en la sesión', expected: 'Los datos de Caja se reflejan en las métricas' },
    ],
    params: null
  },
  {
    id: 'TC-32', block: 'G', blockName: 'Métricas y Reportes',
    title: 'Ranking de Productos Más Vendidos',
    module: 'Métricas / Reportes', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Ir a "Métricas" y localizar el informe de "Productos más vendidos"', expected: 'El reporte muestra nombre, cantidad vendida y monto total' },
      { step: '2', action: 'Aplicar filtro por la semana actual', expected: 'Los resultados se actualizan con datos del período' },
    ],
    params: null
  },

  // ── BLOQUE H: CONFIGURACIÓN ───────────────────────────────────────────────
  {
    id: 'TC-33', block: 'H', blockName: 'Configuración del Sistema',
    title: 'Edición de Datos Generales de la Óptica',
    module: 'Configuración / General', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Configuración" → pestaña "General"', expected: 'Se muestran los datos de la óptica' },
      { step: '2', action: 'Modificar el Teléfono y la Dirección | Guardar', expected: 'Los cambios se guardan correctamente' },
      { step: '3', action: 'Recargar la página (F5) y volver a Configuración', expected: 'Los datos modificados persisten; no se perdieron' },
    ],
    params: null
  },
  {
    id: 'TC-34', block: 'H', blockName: 'Configuración del Sistema',
    title: 'Alta de Obra Social con Cobertura',
    module: 'Configuración / Obras Sociales', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a Configuración → "Obras Sociales" → "Nueva Obra Social"', expected: 'Se abre el formulario de alta' },
      { step: '2', action: 'Nombre: QA IOMA Test | Cobertura Cristales: $3.000 | Cobertura Armazones: $1.500', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Guardar y verificar que aparece en el listado', expected: 'La obra social es visible en la lista' },
      { step: '4', action: 'Editar la cobertura de "Cristales" a $4.000 y guardar', expected: 'La cobertura se actualiza correctamente' },
    ],
    params: '⚠️ CONVENCIÓN QA: Nombre debe incluir "QA" para limpieza: DELETE FROM insurance WHERE name LIKE \'QA%\';'
  },
  {
    id: 'TC-35', block: 'H', blockName: 'Configuración del Sistema',
    title: 'Gestión de Usuarios y Roles del Sistema',
    module: 'Configuración / Usuarios', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a Configuración → "Usuarios" → "Nuevo Usuario"', expected: 'Se abre el formulario de alta de usuario' },
      { step: '2', action: 'Nombre: QA Tester | Email: qa.tester@testoptica.com | Rol: Vendedor', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Guardar y verificar que aparece en el listado', expected: 'El usuario figura en la tabla con su rol' },
      { step: '4', action: 'Ir a "Permisos" y verificar los accesos del rol "Vendedor"', expected: 'Se visualizan los módulos habilitados y restringidos' },
    ],
    params: '⚠️ CONVENCIÓN QA: Email debe ser qa.xxx@testoptica.com para identificación'
  },
  {
    id: 'TC-36', block: 'H', blockName: 'Configuración del Sistema',
    title: 'Alta de Cristal en la Tabla de Cristales',
    module: 'Configuración / Cristales', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a Configuración → "Tabla de Cristales" → "Nuevo Cristal"', expected: 'Se abre el modal de alta' },
      { step: '2', action: 'Marca: QA Brand | Tipo: Monofocal | Material: Orgánico | Índice: 1.50 | Precio: $8.000', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Rango Esférico: Mín -8.00 / Máx +8.00 | Guardar', expected: 'El cristal aparece en la tabla' },
      { step: '4', action: 'Ir a "Nueva Orden" y verificar que "QA Brand" aparece en el desplegable de cristales', expected: 'El cristal está disponible para seleccionar' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR:\n• Rango Esférico -8.00 a +8.00: si la receta tiene Esf +9.00 debe dar advertencia\n• Si la receta tiene Esf +3.00: no debe dar advertencia\n• El precio $8.000 debe aparecer en el total de la receta'
  },

  // ── BLOQUE I: SEGURIDAD ───────────────────────────────────────────────────
  {
    id: 'TC-37', block: 'I', blockName: 'Seguridad',
    title: 'Sanitización de Entradas Maliciosas (XSS)',
    module: 'Seguridad', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Ir a "Nuevo Cliente" | Nombre: QA <script>alert(\'XSS\')</script>', expected: 'El campo acepta el texto visualmente' },
      { step: '2', action: 'Guardar el cliente', expected: 'El sistema guarda como texto plano SIN ejecutar el script' },
      { step: '3', action: 'Buscar "QA" en el listado y localizar el cliente', expected: 'El nombre se muestra como texto literal; no hay ningún popup ejecutado' },
    ],
    params: null
  },
  {
    id: 'TC-38', block: 'I', blockName: 'Seguridad',
    title: 'Acceso a Rutas Protegidas Sin Autenticación',
    module: 'Seguridad / Rutas', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Cerrar sesión completamente en el sistema', expected: 'Se muestra la pantalla de login' },
      { step: '2', action: 'Escribir en la URL: .../clients y presionar Enter', expected: 'El sistema redirige automáticamente al login' },
      { step: '3', action: 'Intentar .../inventory y .../settings sin sesión', expected: 'Ambas rutas redirigen al login sin mostrar datos' },
    ],
    params: null
  },

  // ── BLOQUE J: BORDE Y RENDIMIENTO ─────────────────────────────────────────
  {
    id: 'TC-39', block: 'J', blockName: 'Casos de Borde y Rendimiento',
    title: 'Validaciones con Campos Obligatorios Vacíos',
    module: 'Validaciones Generales', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Nuevo Cliente", dejar todos los campos vacíos, hacer clic en "Guardar"', expected: 'El sistema muestra validación de campos requeridos; el modal no se cierra' },
      { step: '2', action: 'Verificar que los campos obligatorios se destacan visualmente (borde rojo o mensaje)', expected: 'Los errores de validación son claros y legibles' },
      { step: '3', action: 'Repetir en "Añadir Nuevo Producto" del inventario con campos vacíos', expected: 'El mismo comportamiento de validación' },
    ],
    params: null
  },
  {
    id: 'TC-40', block: 'J', blockName: 'Casos de Borde y Rendimiento',
    title: 'Responsive Design en Pantalla Reducida',
    module: 'UX / Responsive', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Abrir el sistema en escritorio (ventana completa)', expected: 'Se visualiza correctamente en ancho completo' },
      { step: '2', action: 'Reducir la ventana al 50% del ancho', expected: 'El layout se adapta sin desbordamientos horizontales' },
      { step: '3', action: 'DevTools → Toggle Device → simular tablet (768px)', expected: 'Los menús y tablas son utilizables' },
      { step: '4', action: 'Simular celular (375px)', expected: 'Los formularios y botones son accesibles sin scroll horizontal innecesario' },
    ],
    params: null
  },

  // ── BLOQUE K: NUEVOS 20 CASOS ─────────────────────────────────────────────
  {
    id: 'TC-41', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Anulación de una Venta Registrada',
    module: 'Caja / Anulaciones', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Ir a "Caja" y localizar una venta "QA" en el historial del día', expected: 'La transacción es visible con su monto' },
      { step: '2', action: 'Hacer clic en el botón de anular de esa transacción', expected: 'Aparece un diálogo de confirmación de anulación' },
      { step: '3', action: 'Confirmar la anulación', expected: 'El monto se revierte en la caja y la transacción se marca como anulada' },
      { step: '4', action: 'Verificar que el saldo de la caja refleja la resta del monto anulado', expected: 'El balance es matemáticamente correcto post-anulación' },
    ],
    params: null
  },
  {
    id: 'TC-42', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Aplicación de Descuento Porcentual en una Venta',
    module: 'POS / Descuentos', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Tener un pedido "QA" en el carrito con total = $30.000', expected: 'El total se muestra correctamente' },
      { step: '2', action: 'Aplicar un descuento del 10%', expected: 'El sistema calcula el nuevo total: $27.000' },
      { step: '3', action: 'Confirmar la venta con el descuento aplicado', expected: 'La venta se registra con el monto descontado' },
      { step: '4', action: 'Verificar en el historial de caja que el monto registrado es $27.000', expected: 'El movimiento muestra $27.000 (no el original $30.000)' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR:\n• 10% de $30.000 = $27.000 ✓\n• 100% de descuento → debe o no permitirse (anotar)\n• Descuento mayor al 100% → debe bloquearse'
  },
  {
    id: 'TC-43', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Persistencia de Datos al Recargar la Página',
    module: 'Persistencia / UX', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Crear cliente "QA Test Persistencia", un producto y una venta en la sesión activa', expected: 'Los tres registros son visibles en sus módulos' },
      { step: '2', action: 'Presionar F5 para recargar la página del navegador', expected: 'La sesión se mantiene activa (no cierra sesión)' },
      { step: '3', action: 'Verificar que los tres registros persisten después de recargar', expected: 'Los datos no se pierden al recargar' },
    ],
    params: null
  },
  {
    id: 'TC-44', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Impresión de Ticket / Comprobante de Venta',
    module: 'Caja / Impresión', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Después de confirmar una venta, buscar el botón "Imprimir Comprobante"', expected: 'El botón está visible en la pantalla de confirmación' },
      { step: '2', action: 'Hacer clic en el botón', expected: 'Se abre una ventana de impresión con el comprobante' },
      { step: '3', action: 'Verificar que el ticket contiene: cliente, detalle, monto total, fecha y N° de operación', expected: 'Todos los datos son legibles y correctos' },
    ],
    params: null
  },
  {
    id: 'TC-45', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Alta de Laboratorio Proveedor',
    module: 'Configuración / Laboratorios', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a Configuración → "Laboratorios" → "Nuevo Laboratorio"', expected: 'Se abre el formulario de alta' },
      { step: '2', action: 'Nombre: QA Lab Test | Teléfono: QA-343-0000111 | Email: qa.lab@testoptica.com', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Guardar el laboratorio', expected: 'Aparece en el listado de laboratorios disponibles' },
      { step: '4', action: 'Ir a una nueva receta y verificar que "QA Lab Test" aparece en el selector', expected: 'El laboratorio está disponible para ser asignado' },
    ],
    params: '⚠️ CONVENCIÓN QA: Nombre debe incluir "QA" para limpieza: DELETE FROM labs WHERE name LIKE \'QA%\';'
  },
  {
    id: 'TC-46', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Alta de Banco / Caja Digital',
    module: 'Configuración / Bancos', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a Configuración → "Bancos" → "Nuevo Banco"', expected: 'Se abre el formulario de alta' },
      { step: '2', action: 'Nombre: QA Mercado Pago Test | Tipo: Digital Wallet', expected: 'Los campos aceptan los datos' },
      { step: '3', action: 'Guardar y verificar que aparece en el listado de cajas', expected: 'La caja digital figura en la lista' },
      { step: '4', action: 'Ir a Caja y verificar que "QA Mercado Pago Test" aparece como medio de pago', expected: 'La nueva caja está disponible para registrar transacciones' },
    ],
    params: null
  },
  {
    id: 'TC-47', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Carga de Logo de la Óptica',
    module: 'Configuración / Apariencia', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Ir a Configuración → "General" o "Apariencia" → localizar el campo de logo', expected: 'El campo de carga de imagen es visible' },
      { step: '2', action: 'Subir un archivo PNG o JPG de tamaño razonable (< 2MB)', expected: 'La imagen se carga y se muestra como preview' },
      { step: '3', action: 'Guardar los cambios', expected: 'El logo se guarda correctamente' },
      { step: '4', action: 'Verificar que el logo aparece en documentos de impresión (tarjeta de lab, ticket)', expected: 'El logo de la óptica se muestra en los documentos' },
    ],
    params: null
  },
  {
    id: 'TC-48', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Modo Oscuro y Cambio de Tema',
    module: 'Configuración / Apariencia', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Ir a Configuración → "Apariencia" → selector Claro/Oscuro', expected: 'El selector de tema es visible' },
      { step: '2', action: 'Cambiar al modo "Oscuro" y guardar', expected: 'La interfaz cambia a tonos oscuros de forma inmediata' },
      { step: '3', action: 'Navegar por varios módulos en modo oscuro (Clientes, Inventario, Caja)', expected: 'No hay textos ilegibles ni contraste insuficiente' },
      { step: '4', action: 'Volver a modo "Claro" y verificar que la interfaz regresa a los colores originales', expected: 'El cambio de tema funciona en ambas direcciones sin errores' },
    ],
    params: null
  },
  {
    id: 'TC-49', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Búsqueda Global del Sistema',
    module: 'UX / Búsqueda', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Verificar si existe un campo de búsqueda global (Ctrl+K o lupa en el header)', expected: 'El campo de búsqueda global existe (o anotar que no existe)' },
      { step: '2', action: 'Buscar: QA García', expected: 'Se sugieren resultados del cliente desde distintos módulos' },
      { step: '3', action: 'Hacer clic en el resultado del cliente', expected: 'Navega directamente a la ficha de ese cliente' },
    ],
    params: null
  },
  {
    id: 'TC-50', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Paginación en Listados Extensos',
    module: 'UX / Rendimiento', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Ir al módulo de Clientes y verificar si existen controles de paginación', expected: 'Los controles (Siguiente/Anterior o scroll infinito) son visibles y funcionales' },
      { step: '2', action: 'Hacer clic en "Siguiente página" si aplica', expected: 'Se carga la siguiente página sin errores ni pantalla en blanco' },
      { step: '3', action: 'Repetir en Inventario con muchos productos', expected: 'La lista no colapsa ni presenta lag notable' },
    ],
    params: null
  },
  {
    id: 'TC-51', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Venta de Producto de Mostrador (Sin Receta)',
    module: 'Caja / Venta Directa', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Ir a "Nueva Venta" o desde el módulo de Caja seleccionar "Venta Directa"', expected: 'Se abre el formulario de venta de mostrador' },
      { step: '2', action: 'Agregar producto: QA Estuche Test (sin receta)', expected: 'El producto se agrega al carrito con su precio' },
      { step: '3', action: 'Seleccionar cliente "QA Mostrador" o sin cliente | Confirmar venta en efectivo', expected: 'La venta se procesa correctamente sin requerir graduación' },
      { step: '4', action: 'Verificar el movimiento en caja', expected: 'El movimiento queda registrado con el monto correcto' },
    ],
    params: null
  },
  {
    id: 'TC-52', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Alta de Receta para Lentes de Contacto',
    module: 'Recetas / Lentes de Contacto', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Nueva Orden" → tipo "Lentes de Contacto"', expected: 'Se muestra el formulario de L.C. (potencia, curva base, diámetro)' },
      { step: '2', action: 'Asociar: QA García María | OD: -2.50 | OI: -2.75', expected: 'Los campos aceptan los valores con signo negativo' },
      { step: '3', action: 'Curva Base: 8.60 | Diámetro: 14.20 | Tipo: Mensual | Marca: QA Contact Pro', expected: 'Los campos aceptan los parámetros de L.C.' },
      { step: '4', action: 'Confirmar y agregar al carrito', expected: 'La orden de L.C. se agrega correctamente' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR:\n• OD -2.50 → valor negativo válido para L.C.\n• Curva Base 8.60 → rango típico (8.4 - 9.0 mm)\n• Diámetro 14.20 → rango típico (13.8 - 14.5 mm)\n• El tipo de trabajo debe quedar como "Lentes de Contacto"'
  },
  {
    id: 'TC-53', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Historial Comparativo de Recetas de un Cliente',
    module: 'Clientes / Ficha Óptica', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Buscar "QA García" (que ya tiene al menos 2 recetas del QA) y abrir su historial', expected: 'Se listan las órdenes históricas del cliente' },
      { step: '2', action: 'Verificar que cada orden muestra fecha, tipo y valores de graduación', expected: 'Los datos son completos y ordenados cronológicamente' },
      { step: '3', action: 'Comparar la graduación de la receta más antigua con la más nueva', expected: 'Es posible visualizar la evolución de la graduación del cliente' },
    ],
    params: null
  },
  {
    id: 'TC-54', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Cristal Fuera de Rango de la Receta',
    module: 'Recetas / Cristales', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Crear una receta con OD Esférico: +6.00 y seleccionar "QA Brand" (rango máx +8.00)', expected: 'Sin advertencia (6.00 ≤ 8.00)' },
      { step: '2', action: 'Cambiar OD Esférico a +9.00 (supera el rango del cristal +8.00)', expected: 'El sistema muestra advertencia: la graduación supera el rango del cristal' },
      { step: '3', action: 'Seleccionar un cristal con rango compatible y verificar que la advertencia desaparece', expected: 'La advertencia se elimina al elegir un cristal adecuado' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR (para el cristal QA Brand rango -8.00 a +8.00):\n• Esf +8.00 → sin advertencia (límite exacto)\n• Esf +8.25 → con advertencia (supera el límite)\n• Esf -8.00 → sin advertencia\n• Esf -8.50 → con advertencia'
  },
  {
    id: 'TC-55', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Alta de Categoría de Inventario Personalizada',
    module: 'Configuración / Categorías', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Ir a Configuración → "Categorías" → agregar nueva categoría: "QA Accesorios Test"', expected: 'La categoría se crea y aparece en el listado' },
      { step: '2', action: 'Ir a "Inventario" → "Añadir Nuevo" y verificar que "QA Accesorios Test" aparece en el desplegable', expected: 'La nueva categoría está disponible para nuevos productos' },
    ],
    params: null
  },
  {
    id: 'TC-56', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Visualización del Audit Log de Acciones',
    module: 'Configuración / Audit', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'Ir a Configuración → "Audit Log" o similar', expected: 'Se muestra un historial de acciones del sistema' },
      { step: '2', action: 'Verificar que las acciones del QA están registradas (alta de QA García, ventas QA, etc.)', expected: 'Las acciones son trazables con usuario, fecha, hora y descripción' },
      { step: '3', action: 'Verificar que el log es solo de lectura (no se puede editar ni eliminar)', expected: 'No hay botones de edición en el log de auditoría' },
    ],
    params: null
  },
  {
    id: 'TC-57', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Eliminación de Cliente con Historial Asociado',
    module: 'Clientes / Integridad', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Buscar "QA García" (que ya tiene compras y trabajos asociados)', expected: 'El cliente aparece en la lista' },
      { step: '2', action: 'Intentar eliminar el cliente (si el botón existe)', expected: 'El sistema muestra advertencia de que el cliente tiene historial asociado' },
      { step: '3', action: 'Verificar que se requiere confirmación explícita o que el sistema lo impide', expected: 'No se elimina accidentalmente; el sistema protege la integridad de datos' },
    ],
    params: null
  },
  {
    id: 'TC-58', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Receta para un Solo Ojo (Monóculo)',
    module: 'Recetas / Casos Especiales', priority: 'ALTA', priorityColor: 'yellow',
    steps: [
      { step: '1', action: 'Ir a "Nueva Orden" → "Monofocal" | Asociar: QA García | En selector de ojos elegir solo "OD"', expected: 'El formulario habilita solo los campos del ojo derecho' },
      { step: '2', action: 'OD Esf +2.00 | Cil 0.00 | Eje 0° | Confirmar pedido', expected: 'El sistema pregunta si es intencional cargar solo un ojo (o lo acepta directamente)' },
      { step: '3', action: 'Confirmar que es intencional (si pregunta)', expected: 'La orden se agrega con solo el cristal del OD y el precio correspondiente' },
    ],
    params: '📋 PARÁMETROS A VERIFICAR:\n• Precio = precio cristal × 1 (solo un ojo, no × 2)\n• La tarjeta de lab debe indicar claramente "Solo OD"\n• El campo OI debe quedar en blanco o cero'
  },
  {
    id: 'TC-59', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Caracteres Especiales, Acentos y Símbolos',
    module: 'Seguridad / Robustez', priority: 'MEDIA', priorityColor: 'green',
    steps: [
      { step: '1', action: 'En "Nuevo Cliente" → Nombre: "QA Ángel Müñöz & Cía. 😊"', expected: 'El campo acepta caracteres especiales, acentuados y emojis' },
      { step: '2', action: 'Guardar el cliente', expected: 'El nombre se guarda exactamente con todos los caracteres' },
      { step: '3', action: 'Buscar "QA Müñöz" en el buscador', expected: 'El cliente se encuentra correctamente con el nombre completo' },
      { step: '4', action: 'Verificar que no hay caracteres corruptos ni errores de encoding', expected: 'Los datos se muestran sin alteraciones' },
    ],
    params: null
  },
  {
    id: 'TC-60', block: 'K', blockName: 'Integración Avanzada y Borde',
    title: 'Cierre de Sesión y Limpieza de Datos de Sesión',
    module: 'Autenticación / Seguridad', priority: 'CRÍTICA', priorityColor: 'red',
    steps: [
      { step: '1', action: 'Hacer clic en el menú de usuario → "Cerrar Sesión"', expected: 'El sistema redirige a la pantalla de login' },
      { step: '2', action: 'Presionar el botón Atrás del navegador', expected: 'No se permite volver; redirige al login' },
      { step: '3', action: 'Intentar acceder a cualquier ruta protegida por URL', expected: 'El sistema redirige al login sin mostrar datos de la sesión anterior' },
      { step: '4', action: 'Iniciar sesión con otro usuario (si existe) y verificar que no se ven datos de sesiones previas en caché', expected: 'Cada sesión está aislada correctamente' },
    ],
    params: null
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 40;
const CONTENT_W = A4_W - MARGIN * 2;

function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawRoundedRect(page, x, y, w, h, r, color, borderColor, borderWidth = 0) {
  if (borderColor && borderWidth > 0) {
    page.drawRectangle({ x, y, width: w, height: h, color: borderColor });
    page.drawRectangle({ x: x + borderWidth, y: y + borderWidth, width: w - borderWidth * 2, height: h - borderWidth * 2, color });
  } else {
    page.drawRectangle({ x, y, width: w, height: h, color });
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function generateQAPDF() {
  console.log('🔨 Generando PDF interactivo de QA...');
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Plan QA Manual — Óptica Paracáo — 60 Casos de Prueba');
  pdfDoc.setAuthor('Antigravity AI / Óptica Paracáo QA Team');
  pdfDoc.setSubject('Plan de pruebas manuales v2.0');
  pdfDoc.setKeywords(['QA', 'testing', 'optica', 'manual']);
  pdfDoc.setCreator('generate_pdf.js — pdf-lib');

  const form = pdfDoc.getForm();
  const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg    = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontObliq  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // ── PORTADA ──────────────────────────────────────────────────────────────
  let page = pdfDoc.addPage([A4_W, A4_H]);
  
  // Fondo gradiente simulado con rectángulos
  page.drawRectangle({ x: 0, y: 0, width: A4_W, height: A4_H, color: C.blueDark });
  page.drawRectangle({ x: 0, y: 200, width: A4_W, height: 200, color: rgb(0.118, 0.250, 0.600) });
  page.drawRectangle({ x: 0, y: 0, width: A4_W, height: 200, color: rgb(0.145, 0.300, 0.700) });

  // Círculo decorativo top-right
  page.drawEllipse({ x: 520, y: 760, xScale: 120, yScale: 120, color: rgb(1,1,1), opacity: 0.04 });
  page.drawEllipse({ x: 70,  y: 120, xScale: 80,  yScale: 80,  color: rgb(1,1,1), opacity: 0.03 });

  // Ícono/Emoji área
  page.drawText('🔬', { x: A4_W/2 - 20, y: 670, size: 40, color: C.white });
  
  // Badge
  page.drawRectangle({ x: A4_W/2 - 100, y: 630, width: 200, height: 22, color: rgb(1,1,1), opacity: 0.15 });
  page.drawText('CONTROL DE CALIDAD DEL SOFTWARE', { x: A4_W/2 - 96, y: 636, size: 8, font: fontBold, color: C.white });

  // Título principal
  page.drawText('Plan de QA Manual', { x: MARGIN, y: 590, size: 32, font: fontBold, color: C.white });
  page.drawText('Óptica Gestión Paracáo', { x: MARGIN, y: 555, size: 18, font: fontReg, color: rgb(0.8,0.85,1) });

  // Línea divisoria
  page.drawRectangle({ x: MARGIN, y: 535, width: 60, height: 3, color: rgb(1,1,1), opacity: 0.4 });

  // Stats
  const stats = [['60', 'Casos de Prueba'], ['11', 'Módulos'], ['4', 'Prioridades'], ['🗑️ QA', 'Limpieza DB']];
  stats.forEach(([num, label], i) => {
    const x = MARGIN + i * 120;
    page.drawText(num, { x, y: 490, size: 28, font: fontBold, color: C.white });
    page.drawText(label, { x, y: 475, size: 9, font: fontReg, color: rgb(0.7,0.75,0.9) });
  });

  // Info meta
  page.drawRectangle({ x: 0, y: 0, width: A4_W, height: 80, color: rgb(0,0,0), opacity: 0.2 });
  page.drawText('📅 Versión 2.0 — Julio 2026', { x: MARGIN, y: 50, size: 10, font: fontReg, color: rgb(0.7,0.75,0.9) });
  page.drawText('🌐 opticagestionparacao.lnx.com.ar', { x: MARGIN, y: 34, size: 10, font: fontReg, color: rgb(0.7,0.75,0.9) });
  page.drawText('👥 Equipo QA Óptica Paracáo', { x: MARGIN + 220, y: 34, size: 10, font: fontReg, color: rgb(0.7,0.75,0.9) });

  // Nota convención QA
  page.drawRectangle({ x: MARGIN, y: 380, width: CONTENT_W, height: 80, color: C.yellowLight });
  page.drawRectangle({ x: MARGIN, y: 380, width: 4, height: 80, color: C.yellowDark });
  page.drawText('⚠️  CONVENCIÓN DE DATOS QA', { x: MARGIN + 12, y: 445, size: 10, font: fontBold, color: C.yellowDark });
  page.drawText('Todos los registros de prueba deben llevar el prefijo "QA" en el nombre/SKU/email.', { x: MARGIN + 12, y: 428, size: 9, font: fontReg, color: C.slate900 });
  page.drawText('Esto permite limpiar la base de datos después del testing con queries simples:', { x: MARGIN + 12, y: 414, size: 9, font: fontReg, color: C.slate900 });
  page.drawText("DELETE FROM clients WHERE name LIKE 'QA%';", { x: MARGIN + 12, y: 398, size: 9, font: fontObliq, color: C.blueDark });

  // Leyenda de prioridades
  page.drawRectangle({ x: MARGIN, y: 270, width: CONTENT_W, height: 100, color: C.slate50 });
  page.drawText('LEYENDA DE PRIORIDADES', { x: MARGIN + 10, y: 355, size: 9, font: fontBold, color: C.slate500 });
  const legends = [
    { color: C.redDark, bg: C.redLight, label: '🔴 CRÍTICA — Funcionalidad core. El sistema no puede salir a producción si falla.' },
    { color: C.yellowDark, bg: C.yellowLight, label: '🟡 ALTA — Funcionalidad importante. Debe resolverse antes del lanzamiento.' },
    { color: C.greenDark, bg: C.greenLight, label: '🟢 MEDIA — Mejora de UX. Puede lanzarse con advertencia si falla.' },
  ];
  legends.forEach(({ color, bg, label }, i) => {
    const ly = 335 - i * 22;
    page.drawRectangle({ x: MARGIN + 10, y: ly - 4, width: CONTENT_W - 20, height: 18, color: bg });
    page.drawText(label, { x: MARGIN + 14, y: ly, size: 8.5, font: fontReg, color: C.slate900 });
  });

  // ── CASOS DE PRUEBA ───────────────────────────────────────────────────────
  let currentBlock = '';
  for (let tcIdx = 0; tcIdx < TEST_CASES.length; tcIdx++) {
    const tc = TEST_CASES[tcIdx];
    
    // Añadir página nueva
    page = pdfDoc.addPage([A4_W, A4_H]);
    let y = A4_H - MARGIN;

    // ── ENCABEZADO DE BLOQUE (si cambió) ──
    if (tc.block !== currentBlock) {
      currentBlock = tc.block;
      page.drawRectangle({ x: 0, y: y - 50, width: A4_W, height: 50, color: C.blueDark });
      page.drawText(`Bloque ${tc.block} — ${tc.blockName}`, {
        x: MARGIN, y: y - 34, size: 14, font: fontBold, color: C.white
      });
      y -= 60;
    }

    // ── CARD HEADER ──
    const priorityBg    = tc.priorityColor === 'red' ? C.redLight : tc.priorityColor === 'yellow' ? C.yellowLight : C.greenLight;
    const priorityColor = tc.priorityColor === 'red' ? C.redDark  : tc.priorityColor === 'yellow' ? C.yellowDark  : C.greenDark;
    const priorityEmoji = tc.priorityColor === 'red' ? '🔴'       : tc.priorityColor === 'yellow' ? '🟡'          : '🟢';

    page.drawRectangle({ x: MARGIN, y: y - 44, width: CONTENT_W, height: 44, color: C.slate50 });
    page.drawRectangle({ x: MARGIN, y: y - 44, width: CONTENT_W, height: 1, color: C.slate300 });
    page.drawRectangle({ x: MARGIN, y: y, width: CONTENT_W, height: 1, color: C.slate300 });
    page.drawRectangle({ x: MARGIN, y: y - 44, width: 1, height: 44, color: C.slate300 });
    page.drawRectangle({ x: MARGIN + CONTENT_W, y: y - 44, width: 1, height: 44, color: C.slate300 });

    // ID badge
    page.drawRectangle({ x: MARGIN + 8, y: y - 36, width: 38, height: 20, color: C.blueDark });
    page.drawText(tc.id, { x: MARGIN + 10, y: y - 30, size: 8, font: fontBold, color: C.white });

    // Título
    page.drawText(tc.title, { x: MARGIN + 54, y: y - 22, size: 11, font: fontBold, color: C.slate900 });
    
    // Módulo y prioridad badges
    page.drawRectangle({ x: MARGIN + 54, y: y - 40, width: tc.module.length * 5 + 8, height: 14, color: C.blueLight });
    page.drawText(tc.module, { x: MARGIN + 58, y: y - 36, size: 7.5, font: fontBold, color: C.blueDark });
    const modW = tc.module.length * 5 + 14;
    page.drawRectangle({ x: MARGIN + 54 + modW, y: y - 40, width: 70, height: 14, color: priorityBg });
    page.drawText(`${priorityEmoji} ${tc.priority}`, { x: MARGIN + 58 + modW, y: y - 36, size: 7.5, font: fontBold, color: priorityColor });

    y -= 48;

    // ── TABLA DE PASOS ──
    const colWidths = [20, 220, 270];
    const headers = ['#', 'PASO A EJECUTAR', 'RESULTADO ESPERADO'];
    const tableW = colWidths.reduce((a, b) => a + b, 0) + 4;

    // Header de tabla
    page.drawRectangle({ x: MARGIN, y: y - 18, width: tableW, height: 18, color: C.blueDark });
    let hx = MARGIN;
    headers.forEach((h, i) => {
      page.drawText(h, { x: hx + 4, y: y - 13, size: 7.5, font: fontBold, color: C.white });
      hx += colWidths[i];
    });
    y -= 20;

    // Filas de pasos
    for (let si = 0; si < tc.steps.length; si++) {
      const s = tc.steps[si];
      const rowBg = si % 2 === 0 ? C.white : C.slate50;

      // Calcular altura dinámica
      const actionLines = wrapText(s.action, fontReg, 8, colWidths[1] - 8);
      const expectedLines = wrapText(s.expected, fontReg, 8, colWidths[2] - 8);
      const rowH = Math.max(actionLines.length, expectedLines.length) * 11 + 6;

      page.drawRectangle({ x: MARGIN, y: y - rowH, width: tableW, height: rowH, color: rowBg });
      
      // Número paso
      page.drawText(s.step, { x: MARGIN + 7, y: y - 9, size: 8, font: fontBold, color: C.blueMid });
      
      // Acción
      actionLines.forEach((line, li) => {
        page.drawText(line, { x: MARGIN + colWidths[0] + 4, y: y - 9 - li * 11, size: 8, font: fontReg, color: C.slate700 });
      });
      
      // Resultado esperado
      expectedLines.forEach((line, li) => {
        page.drawText(line, { x: MARGIN + colWidths[0] + colWidths[1] + 4, y: y - 9 - li * 11, size: 8, font: fontObliq, color: C.greenDark });
      });

      // Bordes de fila
      page.drawRectangle({ x: MARGIN, y: y - rowH, width: 1, height: rowH, color: C.slate300 });
      page.drawRectangle({ x: MARGIN + colWidths[0], y: y - rowH, width: 1, height: rowH, color: C.slate300 });
      page.drawRectangle({ x: MARGIN + colWidths[0] + colWidths[1], y: y - rowH, width: 1, height: rowH, color: C.slate300 });
      page.drawRectangle({ x: MARGIN + tableW, y: y - rowH, width: 1, height: rowH, color: C.slate300 });
      page.drawRectangle({ x: MARGIN, y: y - rowH, width: tableW, height: 1, color: C.slate300 });

      y -= rowH;
    }
    // Borde inferior tabla
    page.drawRectangle({ x: MARGIN, y: y, width: tableW, height: 1, color: C.slate300 });
    y -= 10;

    // ── PARÁMETROS ESPECÍFICOS (si existen) ──
    if (tc.params) {
      const paramLines = tc.params.split('\n');
      const paramH = paramLines.length * 11 + 14;
      page.drawRectangle({ x: MARGIN, y: y - paramH, width: CONTENT_W, height: paramH, color: C.yellowLight });
      page.drawRectangle({ x: MARGIN, y: y - paramH, width: 3, height: paramH, color: C.yellowDark });
      paramLines.forEach((line, li) => {
        page.drawText(line, { x: MARGIN + 8, y: y - 11 - li * 11, size: 7.5, font: li === 0 ? fontBold : fontObliq, color: C.slate900 });
      });
      y -= paramH + 8;
    }

    y -= 8;

    // ── SECCIÓN DE ESTADO Y FORMULARIO ──────────────────────────────────────
    const formBg = C.slate50;
    const formH = 80;
    page.drawRectangle({ x: MARGIN, y: y - formH, width: CONTENT_W, height: formH, color: formBg });
    page.drawRectangle({ x: MARGIN, y: y - formH, width: CONTENT_W, height: 1, color: C.slate300 });
    page.drawRectangle({ x: MARGIN, y: y, width: CONTENT_W, height: 1, color: C.slate300 });
    page.drawRectangle({ x: MARGIN, y: y - formH, width: 1, height: formH, color: C.slate300 });
    page.drawRectangle({ x: MARGIN + CONTENT_W, y: y - formH, width: 1, height: formH, color: C.slate300 });

    // Etiqueta ESTADO
    page.drawText('ESTADO DE LA PRUEBA:', { x: MARGIN + 8, y: y - 14, size: 8, font: fontBold, color: C.slate700 });

    // Checkboxes de estado — ACROFORM INTERACTIVOS
    const statuses = [
      { label: 'APROBADO ✅', fieldName: `${tc.id}_aprobado`, x: MARGIN + 8 },
      { label: 'FALLIDO ❌',  fieldName: `${tc.id}_fallido`,  x: MARGIN + 105 },
      { label: 'ADVERTENCIA ⚠️', fieldName: `${tc.id}_advert`, x: MARGIN + 193 },
    ];
    
    statuses.forEach(({ label, fieldName, x }) => {
      try {
        const cb = form.createCheckBox(fieldName);
        cb.addToPage(page, { x, y: y - 33, width: 14, height: 14, borderColor: C.slate500, backgroundColor: C.white });
      } catch(e) { /* field name collision guard */ }
      page.drawText(label, { x: x + 17, y: y - 30, size: 8.5, font: fontBold, color: C.slate700 });
    });

    // Responsable y fecha
    page.drawText('Responsable:', { x: MARGIN + 8, y: y - 50, size: 8, font: fontBold, color: C.slate700 });
    try {
      const tfResp = form.createTextField(`${tc.id}_responsable`);
      tfResp.addToPage(page, { x: MARGIN + 68, y: y - 58, width: 130, height: 14, borderColor: C.slate300, backgroundColor: C.white });
    } catch(e) {}

    page.drawText('Fecha:', { x: MARGIN + 210, y: y - 50, size: 8, font: fontBold, color: C.slate700 });
    try {
      const tfFecha = form.createTextField(`${tc.id}_fecha`);
      tfFecha.addToPage(page, { x: MARGIN + 238, y: y - 58, width: 80, height: 14, borderColor: C.slate300, backgroundColor: C.white });
    } catch(e) {}

    // Notas
    page.drawText('Observaciones / Notas:', { x: MARGIN + 8, y: y - 68, size: 8, font: fontBold, color: C.slate700 });
    try {
      const tfNotes = form.createTextField(`${tc.id}_notas`);
      tfNotes.enableMultiline();
      tfNotes.addToPage(page, { x: MARGIN + 105, y: y - formH + 2, width: CONTENT_W - 113, height: 26, borderColor: C.slate300, backgroundColor: C.white });
    } catch(e) {}

    y -= formH + 8;

    // Número de página (pie)
    page.drawText(`${tc.id} — Plan QA Óptica Paracáo v2.0 — Página ${tcIdx + 2} de ${TEST_CASES.length + 2}`,
      { x: MARGIN, y: 18, size: 7, font: fontReg, color: C.slate500 });
  }

  // ── TABLA RESUMEN FINAL ────────────────────────────────────────────────────
  page = pdfDoc.addPage([A4_W, A4_H]);
  let y = A4_H - MARGIN;

  page.drawRectangle({ x: 0, y: y - 50, width: A4_W, height: 50, color: C.blueDark });
  page.drawText('📊  Hoja de Resultados del Equipo QA — Resumen de 60 Casos', {
    x: MARGIN, y: y - 34, size: 13, font: fontBold, color: C.white
  });
  y -= 60;
  page.drawText('Sistema: opticagestionparacao.lnx.com.ar · Completar por cada tester · Usar ✅ APROBADO / ❌ FALLIDO / ⚠️ ADVERTENCIA',
    { x: MARGIN, y, size: 8, font: fontReg, color: C.slate500 });
  y -= 16;

  // Encabezado de tabla resumen
  const sumCols = [40, 175, 90, 50, 55, 90];
  const sumHeaders = ['ID', 'Caso de Prueba', 'Responsable', 'Estado', 'Fecha', 'Observaciones'];
  const sumW = sumCols.reduce((a, b) => a + b, 0);
  page.drawRectangle({ x: MARGIN, y: y - 16, width: sumW, height: 16, color: C.blueDark });
  let hx = MARGIN;
  sumHeaders.forEach((h, i) => {
    page.drawText(h, { x: hx + 3, y: y - 12, size: 7.5, font: fontBold, color: C.white });
    hx += sumCols[i];
  });
  y -= 18;

  // Filas resumen con campos de formulario
  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    const rowH = 16;
    const rowBg = i % 2 === 0 ? C.white : C.slate50;
    
    if (y - rowH < MARGIN + 20) {
      // Nueva página si es necesario
      page = pdfDoc.addPage([A4_W, A4_H]);
      y = A4_H - MARGIN;
      page.drawRectangle({ x: MARGIN, y: y - 16, width: sumW, height: 16, color: C.blueDark });
      let hx2 = MARGIN;
      sumHeaders.forEach((h, i2) => {
        page.drawText(h, { x: hx2 + 3, y: y - 12, size: 7.5, font: fontBold, color: C.white });
        hx2 += sumCols[i2];
      });
      y -= 18;
    }

    page.drawRectangle({ x: MARGIN, y: y - rowH, width: sumW, height: rowH, color: rowBg });
    
    // ID
    page.drawText(tc.id, { x: MARGIN + 3, y: y - 12, size: 8, font: fontBold, color: C.blueMid });
    // Título (truncado)
    const titleTrunc = tc.title.length > 32 ? tc.title.substring(0, 30) + '…' : tc.title;
    page.drawText(titleTrunc, { x: MARGIN + sumCols[0] + 3, y: y - 12, size: 7.5, font: fontReg, color: C.slate900 });
    
    // Campo Responsable (texto)
    try {
      const tfR = form.createTextField(`sum_${tc.id}_resp`);
      tfR.addToPage(page, { x: MARGIN + sumCols[0] + sumCols[1] + 1, y: y - rowH + 2, width: sumCols[2] - 4, height: rowH - 4, borderColor: C.slate300, backgroundColor: C.white });
    } catch(e) {}

    // Checkbox estado (dropdown simulado)
    try {
      const cbSum = form.createCheckBox(`sum_${tc.id}_ok`);
      cbSum.addToPage(page, { x: MARGIN + sumCols[0] + sumCols[1] + sumCols[2] + 3, y: y - rowH + 3, width: 10, height: 10, borderColor: C.slate300, backgroundColor: C.white });
    } catch(e) {}
    page.drawText('✓', { x: MARGIN + sumCols[0] + sumCols[1] + sumCols[2] + 18, y: y - 12, size: 7, font: fontBold, color: C.slate500 });

    // Campo Fecha
    try {
      const tfF = form.createTextField(`sum_${tc.id}_fecha`);
      tfF.addToPage(page, { x: MARGIN + sumCols[0] + sumCols[1] + sumCols[2] + sumCols[3] + 1, y: y - rowH + 2, width: sumCols[4] - 4, height: rowH - 4, borderColor: C.slate300, backgroundColor: C.white });
    } catch(e) {}

    // Campo Observaciones
    try {
      const tfO = form.createTextField(`sum_${tc.id}_obs`);
      tfO.addToPage(page, { x: MARGIN + sumCols[0] + sumCols[1] + sumCols[2] + sumCols[3] + sumCols[4] + 1, y: y - rowH + 2, width: sumCols[5] - 4, height: rowH - 4, borderColor: C.slate300, backgroundColor: C.white });
    } catch(e) {}

    // Bordes
    let bx = MARGIN;
    sumCols.forEach(cw => {
      page.drawRectangle({ x: bx, y: y - rowH, width: 1, height: rowH, color: C.slate300 });
      bx += cw;
    });
    page.drawRectangle({ x: bx, y: y - rowH, width: 1, height: rowH, color: C.slate300 });
    page.drawRectangle({ x: MARGIN, y: y - rowH, width: sumW, height: 1, color: C.slate300 });
    page.drawRectangle({ x: MARGIN, y: y, width: sumW, height: 1, color: C.slate300 });

    y -= rowH;
  }

  // Pie de página
  page.drawText('Plan de QA Manual v2.0 · Óptica Paracáo · 60 Casos de Prueba · Generado por Antigravity AI · Julio 2026',
    { x: MARGIN, y: 18, size: 7, font: fontReg, color: C.slate500 });

  // ── GUARDAR PDF ───────────────────────────────────────────────────────────
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'Plan_QA_Optica_Paracao_60casos.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`✅ PDF generado exitosamente: ${outputPath}`);
  console.log(`📄 Páginas: ${pdfDoc.getPageCount()}`);
  console.log(`📋 Casos: ${TEST_CASES.length}`);
  console.log(`🔘 Campos de formulario: ${form.getFields().length} (checkboxes + text fields)`);
}

generateQAPDF().catch(err => {
  console.error('❌ Error generando el PDF:', err);
  process.exit(1);
});
