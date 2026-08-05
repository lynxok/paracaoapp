/**
 * GENERADOR DE PDF INTERACTIVO -- PLAN QA OPTICA PARACAO
 * 60 casos de prueba con formularios AcroForm (checkboxes + campos de texto editables)
 * Uso: node generate_pdf.cjs
 */
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const C = {
  blueDark:   rgb(0.118, 0.227, 0.541),
  blueMid:    rgb(0.145, 0.388, 0.922),
  blueLight:  rgb(0.859, 0.918, 0.996),
  greenDark:  rgb(0.020, 0.588, 0.416),
  greenLight: rgb(0.820, 0.980, 0.898),
  redDark:    rgb(0.863, 0.149, 0.149),
  redLight:   rgb(0.996, 0.886, 0.886),
  yellowDark: rgb(0.851, 0.467, 0.024),
  yellowLight:rgb(0.996, 0.953, 0.765),
  slate900:   rgb(0.059, 0.090, 0.165),
  slate700:   rgb(0.200, 0.255, 0.341),
  slate500:   rgb(0.392, 0.455, 0.545),
  slate300:   rgb(0.796, 0.835, 0.882),
  slate100:   rgb(0.945, 0.961, 0.976),
  slate50:    rgb(0.973, 0.980, 0.992),
  white:      rgb(1, 1, 1),
};

const TEST_CASES = [
  { id:'TC-01', block:'A', blockName:'Autenticacion y Navegacion', title:'Login con Credenciales Validas', module:'Autenticacion', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Abrir https://opticagestionparacao.lnx.com.ar', e:'Se muestra la pantalla de login con Email, Contrasena y Sucursal'},
      {n:'2', a:'Email: astudillajuansimon@gmail.com | Contrasena: juansimon', e:'Los campos aceptan el texto'},
      {n:'3', a:'Seleccionar una Sucursal del desplegable y hacer clic en Iniciar Sesion', e:'Redirige al Dashboard sin errores'},
      {n:'4', a:'Verificar que el Dashboard muestre metricas y menu lateral', e:'Todos los elementos son visibles y cargados'},
    ], params: null },
  { id:'TC-02', block:'A', blockName:'Autenticacion y Navegacion', title:'Login con Contrasena Incorrecta', module:'Autenticacion', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Abrir la pantalla de login', e:'Se muestra el formulario de login'},
      {n:'2', a:'Email valido + Contrasena: QA-CLAVE-INCORRECTA | Hacer clic en Iniciar Sesion', e:'Aparece mensaje de error "Credenciales invalidas"'},
      {n:'3', a:'Verificar que NO se accede al sistema', e:'El usuario permanece en la pantalla de login'},
    ], params: null },
  { id:'TC-03', block:'A', blockName:'Autenticacion y Navegacion', title:'Navegacion Completa por el Menu Lateral', module:'Navegacion General', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Clic en "Clientes" en el menu lateral', e:'Se carga la lista de clientes sin pantalla en blanco'},
      {n:'2', a:'Clic en "Inventario"', e:'Se carga la tabla de inventario de productos'},
      {n:'3', a:'Clic en "Trabajos / Taller"', e:'Se muestra el listado de trabajos de laboratorio'},
      {n:'4', a:'Clic en "Caja / Ventas"', e:'Se muestra el modulo de caja'},
      {n:'5', a:'Clic en "Metricas"', e:'Se visualizan graficos y estadisticas'},
      {n:'6', a:'Clic en "Configuracion"', e:'Se abre la pantalla de ajustes del sistema'},
      {n:'7', a:'Clic en el logo para volver al Dashboard', e:'Regresa al panel principal sin errores'},
    ], params: null },
  { id:'TC-04', block:'B', blockName:'Gestion de Clientes', title:'Alta de Cliente con Todos los Datos', module:'Clientes', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Ir a "Clientes" -> clic en "Nuevo Cliente"', e:'Se abre el formulario de alta'},
      {n:'2', a:'Nombre: QA Garcia Maria | DNI: QA-30555777', e:'Los campos aceptan los datos'},
      {n:'3', a:'Telefono: QA-343-4123456 | Email: qa.garcia@testoptica.com', e:'Los campos aceptan los datos'},
      {n:'4', a:'Fecha Nac: 15/03/1985 | Direccion: QA Av. Rivadavia 1234', e:'Los campos aceptan los datos'},
      {n:'5', a:'Hacer clic en "Guardar"', e:'El modal se cierra y el cliente aparece en el listado'},
      {n:'6', a:'Buscar "QA Garcia" en el buscador', e:'El cliente aparece en los resultados de busqueda'},
    ], params:'CONVENCION QA: Todos los datos deben incluir prefijo "QA" para limpieza posterior.\nQuery de limpieza: DELETE FROM clients WHERE name LIKE \'QA%\';' },
  { id:'TC-05', block:'B', blockName:'Gestion de Clientes', title:'Alta de Cliente con DNI Duplicado', module:'Clientes', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Nuevo Cliente" e ingresar el mismo DNI del TC-04: QA-30555777', e:'El campo acepta el valor'},
      {n:'2', a:'Completar el resto de los datos y hacer clic en "Guardar"', e:'Sistema muestra advertencia de DNI duplicado (o anotar si permite duplicados)'},
    ], params: null },
  { id:'TC-06', block:'B', blockName:'Gestion de Clientes', title:'Busqueda de Cliente por Nombre y DNI', module:'Clientes', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'En "Clientes" escribir "QA Garcia" en el buscador', e:'La lista filtra en tiempo real mostrando al cliente'},
      {n:'2', a:'Borrar el texto del buscador', e:'La lista vuelve a mostrar todos los clientes'},
      {n:'3', a:'Buscar por nombre parcial: "QA Gar"', e:'Aparecen los clientes cuyo nombre contiene el texto'},
    ], params: null },
  { id:'TC-07', block:'B', blockName:'Gestion de Clientes', title:'Edicion de Datos de un Cliente', module:'Clientes', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Buscar "QA Garcia" y hacer clic en el icono de editar (lapiz)', e:'Se abre el formulario con los datos precargados'},
      {n:'2', a:'Modificar el telefono a "QA-343-9999888" y hacer clic en "Guardar"', e:'El telefono se actualiza en el listado'},
      {n:'3', a:'Volver a buscar al cliente y verificar el nuevo telefono', e:'Se muestra "QA-343-9999888"'},
    ], params: null },
  { id:'TC-08', block:'B', blockName:'Gestion de Clientes', title:'Asignacion de Obra Social a un Cliente', module:'Clientes', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Abrir edicion de "QA Garcia Maria"', e:'Se abre el formulario con sus datos'},
      {n:'2', a:'Seleccionar una Obra Social (ej. PAMI o OSDE) del desplegable', e:'La obra social queda asignada'},
      {n:'3', a:'Guardar los cambios', e:'La mutua queda vinculada al cliente'},
      {n:'4', a:'Ir a "Nueva Orden" y buscar "QA Garcia"', e:'Aparece un badge con el nombre de la obra social junto al cliente'},
    ], params: null },
  { id:'TC-09', block:'B', blockName:'Gestion de Clientes', title:'Vista del Historial de Compras de un Cliente', module:'Clientes', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Buscar "QA Garcia" y hacer clic en su icono de historial', e:'Se abre un modal con el historial de compras y trabajos'},
      {n:'2', a:'Verificar que cada entrada muestra fecha, tipo y monto', e:'Los datos historicos son legibles y completos'},
      {n:'3', a:'Cerrar el modal', e:'El modal se cierra sin errores'},
    ], params: null },
  { id:'TC-10', block:'B', blockName:'Gestion de Clientes', title:'Cobro de Sena / Pago Parcial en Cuenta Corriente', module:'Cuenta Corriente', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Buscar cliente con saldo deudor y hacer clic en "Cobrar"', e:'Se abre el modal de registro de pago'},
      {n:'2', a:'Monto: $5.000 | Medio: Efectivo | Caja: Caja Efectivo | Confirmar pago', e:'El saldo de cuenta corriente disminuye en $5.000'},
      {n:'3', a:'Verificar que se genera un recibo imprimible', e:'Se abre la ventana de impresion del recibo'},
    ], params: null },
  { id:'TC-11', block:'C', blockName:'Inventario y Stock', title:'Alta de Nuevo Producto en Inventario', module:'Inventario', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Ir a "Inventario" -> "Anadir Nuevo"', e:'Se abre el modal de producto'},
      {n:'2', a:'Nombre: QA Armazon Pro | SKU: QA-ARMAZ-001 | Categoria: Armazones', e:'Los campos aceptan los datos'},
      {n:'3', a:'Stock Casa Central: 10 | Stock Shopping: 5 | Stock Critico: 3', e:'Los valores numericos se ingresan correctamente'},
      {n:'4', a:'Precio Compra: $8.000 | Precio Venta: $20.000 | Guardar Producto', e:'El articulo aparece en la tabla de inventario'},
    ], params:'CONVENCION QA: SKU debe empezar con "QA-" para limpieza.\nQuery: DELETE FROM inventory WHERE sku LIKE \'QA-%\';' },
  { id:'TC-12', block:'C', blockName:'Inventario y Stock', title:'Bloqueo de Precio Negativo en Inventario', module:'Inventario - Validaciones', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Ir a "Inventario" -> "Anadir Nuevo" | Completar todos los campos correctamente', e:'Formulario con datos validos'},
      {n:'2', a:'En "Precio de Venta" ingresar el valor: -1500 | Hacer clic en "Guardar Producto"', e:'El sistema muestra alerta: "El precio no puede ser negativo"'},
      {n:'3', a:'Verificar que el producto NO se crea en la tabla', e:'El modal permanece abierto; no se registra el articulo'},
    ], params: null },
  { id:'TC-13', block:'C', blockName:'Inventario y Stock', title:'Ingreso de Mercaderia (Aumento de Stock)', module:'Inventario - Stock', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Inventario" -> boton "Ingreso de Mercaderia"', e:'Se abre el modal de ingreso de stock'},
      {n:'2', a:'Sucursal: Casa Central | Producto: QA Armazon Pro | Cantidad: 20', e:'Los campos aceptan los datos'},
      {n:'3', a:'Proveedor: QA Proveedor Test | Precio Compra: $8.500 | Registrar Ingreso', e:'El stock en Casa Central aumenta en 20 unidades'},
    ], params: null },
  { id:'TC-14', block:'C', blockName:'Inventario y Stock', title:'Egreso de Stock por Rotura / Perdida', module:'Inventario - Movimientos', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Clic derecho en "QA Armazon Pro" -> "Registrar Egreso"', e:'Se abre el modal de egreso'},
      {n:'2', a:'Sucursal: Casa Central | Cantidad: 3 | Motivo: Rotura | Confirmar Egreso', e:'El stock en Casa Central disminuye en 3 unidades'},
      {n:'3', a:'Ir a la pestana "Movimientos" del inventario', e:'El movimiento aparece registrado en el historial'},
    ], params: null },
  { id:'TC-15', block:'C', blockName:'Inventario y Stock', title:'Transferencia de Stock entre Sucursales', module:'Inventario - Multi-Sucursal', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Clic derecho en "QA Armazon Pro" -> "Mover Stock"', e:'Se abre el modal de transferencia'},
      {n:'2', a:'Origen: Casa Central | Destino: Shopping | Cantidad: 5', e:'Los campos aceptan los datos'},
      {n:'3', a:'Confirmar Transferencia', e:'Casa Central -5, Shopping +5 unidades'},
      {n:'4', a:'Verificar el stock por sucursal (clic en el total del producto)', e:'El popover muestra el stock correcto por sucursal'},
    ], params: null },
  { id:'TC-16', block:'C', blockName:'Inventario y Stock', title:'Transferencia con Stock Insuficiente', module:'Inventario - Validaciones', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Abrir "Mover Stock" | Sucursal origen con stock = 0 | Cantidad: 10 | Confirmar', e:'Sistema muestra alerta de stock insuficiente con la cantidad disponible'},
      {n:'2', a:'Verificar que el stock no se modifica en ninguna sucursal', e:'Los stocks permanecen iguales en ambas sucursales'},
    ], params: null },
  { id:'TC-17', block:'C', blockName:'Inventario y Stock', title:'Busqueda y Filtrado en Inventario', module:'Inventario - Filtros', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'En el buscador de Inventario escribir "QA"', e:'La tabla filtra y muestra solo los productos QA'},
      {n:'2', a:'Cambiar el filtro de categoria a "Cristales"', e:'La tabla muestra solo productos de esa categoria'},
      {n:'3', a:'Cambiar el filtro de sucursal a "Shopping"', e:'El stock mostrado corresponde al de Shopping'},
      {n:'4', a:'Limpiar todos los filtros', e:'La tabla vuelve a mostrar todos los productos'},
    ], params: null },
  { id:'TC-18', block:'C', blockName:'Inventario y Stock', title:'Eliminacion de un Producto del Inventario', module:'Inventario', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Ir a pestana "Productos" y localizar "QA Armazon Pro" | Clic en eliminar', e:'Aparece una ventana de confirmacion'},
      {n:'2', a:'Confirmar la eliminacion', e:'El producto desaparece de la tabla'},
      {n:'3', a:'Buscar "QA-ARMAZ-001" en el buscador', e:'No se encuentran resultados'},
    ], params: null },
  { id:'TC-19', block:'D', blockName:'Recetas y Ordenes de Laboratorio', title:'Alta de Receta Monofocal Completa', module:'Recetas - Monofocal', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Ir a "Nueva Orden" -> tipo "Monofocal" | Asociar cliente: QA Garcia Maria', e:'Se muestra el formulario de receta monofocal'},
      {n:'2', a:'OD Lejos: Esf +1.50 | Cil -0.50 | Eje 90 grados', e:'Los campos aceptan los valores opticos'},
      {n:'3', a:'OI Lejos: Esf +1.00 | Cil 0.00 | Eje 0 grados', e:'Los campos aceptan los valores'},
      {n:'4', a:'DNP: 62 | Altura de montaje: 18', e:'Los campos aceptan los valores de centrado'},
      {n:'5', a:'Cristal: QA Monofocal Organico 1.50 | Marco: QA Armazon Pro', e:'Ambos se asignan y el total se calcula automaticamente'},
      {n:'6', a:'Hacer clic en "Agregar al Carrito"', e:'La orden se agrega al carrito sin errores'},
    ], params:'PARAMETROS A VERIFICAR:\n- OD Esf +1.50 -> debe aceptarse (rango normal, dentro de +-30)\n- OD Cil -0.50 -> debe aceptarse (cilindrico negativo valido)\n- DNP 62 -> dentro del rango esperado (55-72 mm)\n- Total = precio cristal x 2 + precio marco\n- El nombre del trabajo debe contener prefijo "QA"' },
  { id:'TC-20', block:'D', blockName:'Recetas y Ordenes de Laboratorio', title:'Advertencia de Dioptrias Fuera de Rango (+-30.00)', module:'Recetas - Validaciones', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Nueva Orden" -> "Monofocal" | Asociar cliente QA Garcia', e:'Se muestra el formulario'},
      {n:'2', a:'OD Lejos Esferico: +35.00 (VALOR FUERA DE RANGO)', e:'El campo acepta el valor sin error inmediato'},
      {n:'3', a:'Hacer clic en "Agregar al Carrito"', e:'Sistema muestra alerta: "Dioptrias fuera del rango habitual (+-30.00). Deseas continuar?"'},
      {n:'4', a:'Hacer clic en "Cancelar" en la alerta', e:'La orden NO se agrega; se permanece en el formulario'},
      {n:'5', a:'Corregir el valor a +3.50 y confirmar', e:'La orden se agrega sin mas alertas de rango'},
    ], params:'PARAMETROS A VERIFICAR:\n- Valor +35.00 -> debe disparar advertencia (supera +-30.00)\n- Valor -31.00 -> debe disparar advertencia\n- Valor +30.00 -> NO debe disparar advertencia (es el limite exacto)\n- Valor +3.50 -> NO debe disparar advertencia (rango normal)' },
  { id:'TC-21', block:'D', blockName:'Recetas y Ordenes de Laboratorio', title:'Alta de Receta Multifocal con Adicion', module:'Recetas - Multifocal', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Nueva Orden" -> tipo "Multifocal" | Asociar cliente: QA Garcia Maria', e:'Se muestra el formulario con secciones: Lejos, Cerca y Adicion'},
      {n:'2', a:'OD Lejos: Esf +2.00 | Cil -0.25 | Eje 75 grados', e:'Los campos aceptan los valores'},
      {n:'3', a:'OI Lejos: Esf +1.75 | Cil -0.50 | Eje 105 grados', e:'Los campos aceptan los valores'},
      {n:'4', a:'Adicion OD: +2.00 | Adicion OI: +2.25', e:'Los campos aceptan los valores de adicion'},
      {n:'5', a:'DNP lejos: 64 | DNP cerca: 60 | Altura: 20', e:'Los campos aceptan los valores de centrado'},
      {n:'6', a:'Cristal: QA Multifocal Progressive 1.60 | Confirmar y Agregar al Carrito', e:'La orden multifocal se agrega correctamente'},
    ], params:'PARAMETROS A VERIFICAR:\n- Adicion +2.00 -> valida (rango tipico +0.75 a +3.50)\n- Adicion +4.00 -> debe generar advertencia (atipica)\n- DNP Cerca debe ser menor o igual al DNP Lejos\n- El precio del cristal multifocal es distinto al monofocal\n- El campo "Tipo de trabajo" debe quedar como "Multifocal"' },
  { id:'TC-22', block:'D', blockName:'Recetas y Ordenes de Laboratorio', title:'Receta con Descuento de Obra Social', module:'Recetas - Obras Sociales', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Crear nueva receta y asociar a "QA Garcia Maria" (con obra social del TC-08)', e:'Se muestra el badge de la Obra Social del cliente'},
      {n:'2', a:'Seleccionar cristal y armazon | Verificar total en resumen del pedido', e:'Total final = Subtotal menos Cobertura de la obra social'},
      {n:'3', a:'Confirmar el pedido', e:'Se agrega al carrito con el precio descontado correcto'},
    ], params:'PARAMETROS A VERIFICAR:\n- Cobertura cristales = valor configurado en la obra social\n- Cobertura armazones = valor configurado en la obra social\n- El total nunca puede ser negativo\n- El comprobante debe indicar el nombre de la OS y el monto cubierto' },
  { id:'TC-23', block:'D', blockName:'Recetas y Ordenes de Laboratorio', title:'Envio de Pedido a Laboratorio Externo', module:'Recetas - Laboratorio', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Crear receta completa con nombre del trabajo: "QA Test Lab" | Clic en "Enviar a Laboratorio"', e:'Se abre el modal de seleccion de laboratorio'},
      {n:'2', a:'Seleccionar: QA Laboratorio Test | Fecha entrega: proxima semana', e:'El laboratorio y la fecha quedan asignados'},
      {n:'3', a:'Clic en "Enviar" o "Asignar Lab"', e:'El lab queda vinculado y se muestra en el resumen del pedido'},
      {n:'4', a:'(Opcional) Clic en "Imprimir Tarjeta de Laboratorio"', e:'Se abre el preview de impresion con la orden del laboratorio'},
    ], params: null },
  { id:'TC-24', block:'E', blockName:'Taller / Trabajos', title:'Listado y Filtrado de Trabajos en Taller', module:'Taller', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Ir a "Trabajos / Taller" desde el menu', e:'Se muestra el listado de ordenes con cliente, tipo, estado y fecha'},
      {n:'2', a:'Filtrar por estado "Pendientes"', e:'La lista muestra solo los trabajos con ese estado'},
      {n:'3', a:'Buscar "QA" en el buscador', e:'La lista filtra los trabajos QA en tiempo real'},
    ], params: null },
  { id:'TC-25', block:'E', blockName:'Taller / Trabajos', title:'Flujo Completo de Estados de un Trabajo', module:'Taller - Estados', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Localizar un trabajo "QA" en estado "Pendiente" y cambiarlo a "En Taller"', e:'El badge cambia de color al nuevo estado'},
      {n:'2', a:'Cambiar el estado a "Listo"', e:'El badge se actualiza a "Listo"'},
      {n:'3', a:'Cambiar el estado a "Entregado"', e:'El trabajo se marca como entregado y puede pasar al historial'},
      {n:'4', a:'Verificar que cada cambio registra la fecha y hora de modificacion', e:'Las marcas de tiempo son correctas'},
    ], params: null },
  { id:'TC-26', block:'E', blockName:'Taller / Trabajos', title:'Impresion de Tarjeta de Laboratorio', module:'Taller - Impresion', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Localizar el trabajo "QA Test Lab" y hacer clic en el icono de impresora', e:'Se abre una ventana de preview de impresion'},
      {n:'2', a:'Verificar que el documento contiene: cliente, graduacion, laboratorio y fecha de entrega', e:'Todos los datos estan correctamente impresos'},
      {n:'3', a:'Cerrar la ventana de impresion', e:'Se cierra sin errores'},
    ], params: null },
  { id:'TC-27', block:'F', blockName:'Caja, Ventas y Tesoreria', title:'Registro de Venta Completa en Efectivo', module:'Caja - Ventas', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Tener una orden "QA" en el carrito y abrir la pantalla de venta', e:'Se muestra el resumen del pedido con total'},
      {n:'2', a:'Medio de Pago: Efectivo | Caja: Caja Efectivo | Monto recibido: total del pedido', e:'Los campos aceptan los datos; el vuelto se calcula si hay diferencia'},
      {n:'3', a:'Hacer clic en "Confirmar Venta"', e:'La venta se registra, el carrito se vacia y aparece comprobante'},
      {n:'4', a:'Verificar el movimiento en el historial de Caja', e:'La transaccion es visible con el monto correcto'},
    ], params: null },
  { id:'TC-28', block:'F', blockName:'Caja, Ventas y Tesoreria', title:'Venta por Transferencia Bancaria', module:'Caja - Ventas', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Tener una orden "QA" en el carrito | Medio de Pago: Transferencia | Banco: el disponible', e:'Los campos se seleccionan correctamente'},
      {n:'2', a:'Confirmar la venta', e:'La venta se registra en la caja bancaria, NO en la caja de efectivo'},
      {n:'3', a:'Verificar en el historial que el movimiento esta en la caja bancaria', e:'La transaccion aparece en la caja bancaria/digital'},
    ], params: null },
  { id:'TC-29', block:'F', blockName:'Caja, Ventas y Tesoreria', title:'Registro de Gasto Operativo en Caja', module:'Caja - Egresos', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Caja" -> "Registrar Gasto" o "Nuevo Egreso"', e:'Se abre el formulario de egreso'},
      {n:'2', a:'Concepto: QA Gasto Test | Monto: $8.500 | Descripcion: QA Factura test Julio | Caja: Efectivo', e:'Los campos aceptan los datos'},
      {n:'3', a:'Confirmar el gasto', e:'El saldo de la caja disminuye en $8.500 y el movimiento queda registrado'},
    ], params: null },
  { id:'TC-30', block:'F', blockName:'Caja, Ventas y Tesoreria', title:'Verificacion del Saldo de Caja en Tiempo Real', module:'Caja - Saldo', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Anotar el saldo actual de Caja Efectivo ANTES de realizar movimientos', e:'Saldo inicial anotado correctamente'},
      {n:'2', a:'Registrar una venta de $10.000 en efectivo (TC-27)', e:'La venta se registra y el saldo aumenta'},
      {n:'3', a:'Registrar un gasto de $2.000 en efectivo (TC-29)', e:'El gasto se registra y el saldo disminuye'},
      {n:'4', a:'Verificar que Saldo Final = Saldo Inicial + $10.000 - $2.000', e:'El sistema es matematicamente consistente'},
    ], params: null },
  { id:'TC-31', block:'G', blockName:'Metricas y Reportes', title:'Dashboard de Metricas y KPIs', module:'Metricas', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Ir a "Metricas" | Verificar los KPIs: Ventas del mes, Trabajos activos, Clientes nuevos', e:'Los indicadores tienen valores numericos visibles'},
      {n:'2', a:'Cambiar el rango de fechas (ej. ultimo trimestre)', e:'Los graficos se actualizan con los datos del periodo'},
      {n:'3', a:'Verificar que los totales coinciden con las ventas QA registradas', e:'Los datos de Caja se reflejan correctamente en las metricas'},
    ], params: null },
  { id:'TC-32', block:'G', blockName:'Metricas y Reportes', title:'Ranking de Productos Mas Vendidos', module:'Metricas - Reportes', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Ir a "Metricas" -> informe de "Productos mas vendidos"', e:'El reporte muestra nombre, cantidad vendida y monto total'},
      {n:'2', a:'Aplicar filtro por la semana actual', e:'Los resultados se actualizan con datos del periodo'},
    ], params: null },
  { id:'TC-33', block:'H', blockName:'Configuracion del Sistema', title:'Edicion de Datos Generales de la Optica', module:'Configuracion - General', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Configuracion" -> pestana "General"', e:'Se muestran los datos de la optica'},
      {n:'2', a:'Modificar el Telefono y la Direccion | Guardar', e:'Los cambios se guardan correctamente'},
      {n:'3', a:'Recargar la pagina (F5) y volver a Configuracion', e:'Los datos modificados persisten; no se perdieron'},
    ], params: null },
  { id:'TC-34', block:'H', blockName:'Configuracion del Sistema', title:'Alta de Obra Social con Cobertura', module:'Configuracion - Obras Sociales', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "Obras Sociales" -> "Nueva Obra Social"', e:'Se abre el formulario de alta'},
      {n:'2', a:'Nombre: QA IOMA Test | Cobertura Cristales: $3.000 | Cobertura Armazones: $1.500', e:'Los campos aceptan los datos'},
      {n:'3', a:'Guardar y verificar que aparece en el listado', e:'La obra social es visible en la lista'},
      {n:'4', a:'Editar la cobertura de "Cristales" a $4.000 y guardar', e:'La cobertura se actualiza correctamente'},
    ], params:'CONVENCION QA: Nombre debe incluir "QA" para limpieza.\nQuery: DELETE FROM insurance WHERE name LIKE \'QA%\';' },
  { id:'TC-35', block:'H', blockName:'Configuracion del Sistema', title:'Gestion de Usuarios y Roles del Sistema', module:'Configuracion - Usuarios', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "Usuarios" -> "Nuevo Usuario"', e:'Se abre el formulario de alta de usuario'},
      {n:'2', a:'Nombre: QA Tester | Email: qa.tester@testoptica.com | Rol: Vendedor', e:'Los campos aceptan los datos'},
      {n:'3', a:'Guardar y verificar que aparece en el listado', e:'El usuario figura en la tabla con su rol'},
      {n:'4', a:'Ir a "Permisos" y verificar los accesos del rol "Vendedor"', e:'Se visualizan los modulos habilitados y restringidos por rol'},
    ], params:'CONVENCION QA: Email debe ser qa.xxx@testoptica.com para identificacion.' },
  { id:'TC-36', block:'H', blockName:'Configuracion del Sistema', title:'Alta de Cristal en la Tabla de Cristales', module:'Configuracion - Cristales', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "Tabla de Cristales" -> "Nuevo Cristal"', e:'Se abre el modal de alta'},
      {n:'2', a:'Marca: QA Brand | Tipo: Monofocal | Material: Organico | Indice: 1.50 | Precio: $8.000', e:'Los campos aceptan los datos'},
      {n:'3', a:'Rango Esferico: Min -8.00 / Max +8.00 | Guardar', e:'El cristal aparece en la tabla de cristales'},
      {n:'4', a:'Ir a "Nueva Orden" y verificar que "QA Brand" aparece en el desplegable de cristales', e:'El cristal esta disponible para seleccionar en recetas'},
    ], params:'PARAMETROS A VERIFICAR:\n- Rango -8.00 a +8.00: si la receta tiene Esf +9.00 debe dar advertencia\n- Si la receta tiene Esf +3.00: no debe dar advertencia\n- El precio $8.000 debe aparecer correctamente en el total de la receta' },
  { id:'TC-37', block:'I', blockName:'Seguridad', title:'Sanitizacion de Entradas Maliciosas (XSS)', module:'Seguridad', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Ir a "Nuevo Cliente" | Nombre: QA <script>alert(XSS)</script>', e:'El campo acepta el texto visualmente'},
      {n:'2', a:'Guardar el cliente', e:'El sistema guarda como texto plano SIN ejecutar el script'},
      {n:'3', a:'Buscar "QA" en el listado y localizar el cliente', e:'El nombre se muestra como texto literal; no hay ningun popup ejecutado'},
    ], params: null },
  { id:'TC-38', block:'I', blockName:'Seguridad', title:'Acceso a Rutas Protegidas Sin Autenticacion', module:'Seguridad - Rutas', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Cerrar sesion completamente en el sistema', e:'Se muestra la pantalla de login'},
      {n:'2', a:'Escribir en la URL: .../clients y presionar Enter', e:'El sistema redirige automaticamente al login'},
      {n:'3', a:'Intentar .../inventory y .../settings sin sesion', e:'Ambas rutas redirigen al login sin mostrar datos'},
    ], params: null },
  { id:'TC-39', block:'J', blockName:'Casos de Borde y Rendimiento', title:'Validaciones con Campos Obligatorios Vacios', module:'Validaciones Generales', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Nuevo Cliente" | Dejar todos los campos vacios | Clic en "Guardar"', e:'El sistema muestra validacion de campos requeridos; el modal no se cierra'},
      {n:'2', a:'Verificar que los campos obligatorios se destacan visualmente (borde rojo o mensaje)', e:'Los errores de validacion son claros y legibles'},
      {n:'3', a:'Repetir en "Anadir Nuevo Producto" del inventario con campos vacios', e:'El mismo comportamiento de validacion'},
    ], params: null },
  { id:'TC-40', block:'J', blockName:'Casos de Borde y Rendimiento', title:'Responsive Design en Pantalla Reducida', module:'UX - Responsive', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Abrir el sistema en escritorio (ventana completa)', e:'Se visualiza correctamente en ancho completo'},
      {n:'2', a:'Reducir la ventana al 50% del ancho', e:'El layout se adapta sin desbordamientos horizontales'},
      {n:'3', a:'DevTools -> Toggle Device -> simular tablet (768px)', e:'Los menus y tablas son utilizables'},
      {n:'4', a:'Simular celular (375px)', e:'Los formularios y botones son accesibles sin scroll horizontal innecesario'},
    ], params: null },
  { id:'TC-41', block:'K', blockName:'Integracion Avanzada y Borde', title:'Anulacion de una Venta Registrada', module:'Caja - Anulaciones', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Ir a "Caja" y localizar una venta "QA" en el historial del dia', e:'La transaccion es visible con su monto'},
      {n:'2', a:'Clic en el boton de anular de esa transaccion | Confirmar la anulacion', e:'El monto se revierte en la caja y la transaccion se marca como anulada'},
      {n:'3', a:'Verificar que el saldo de la caja refleja la resta del monto anulado', e:'El balance es matematicamente correcto post-anulacion'},
    ], params: null },
  { id:'TC-42', block:'K', blockName:'Integracion Avanzada y Borde', title:'Aplicacion de Descuento Porcentual en una Venta', module:'POS - Descuentos', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Tener pedido "QA" en el carrito con total = $30.000', e:'El total se muestra correctamente'},
      {n:'2', a:'Aplicar descuento del 10%', e:'El sistema calcula el nuevo total: $27.000'},
      {n:'3', a:'Confirmar la venta con el descuento aplicado', e:'La venta se registra con el monto descontado'},
      {n:'4', a:'Verificar en el historial de caja que el monto registrado es $27.000', e:'El movimiento muestra $27.000, no el original $30.000'},
    ], params:'PARAMETROS A VERIFICAR:\n- 10% de $30.000 = $27.000 (verificar calculo)\n- 100% de descuento -> debe o no permitirse (anotar resultado)\n- Descuento mayor al 100% -> debe bloquearse por el sistema' },
  { id:'TC-43', block:'K', blockName:'Integracion Avanzada y Borde', title:'Persistencia de Datos al Recargar la Pagina', module:'Persistencia - UX', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Crear cliente "QA Test Persistencia", un producto y una venta en la sesion activa', e:'Los tres registros son visibles en sus modulos'},
      {n:'2', a:'Presionar F5 para recargar la pagina del navegador', e:'La sesion se mantiene activa (no cierra sesion)'},
      {n:'3', a:'Verificar que los tres registros persisten despues de recargar', e:'Los datos no se pierden al recargar la pagina'},
    ], params: null },
  { id:'TC-44', block:'K', blockName:'Integracion Avanzada y Borde', title:'Impresion de Ticket / Comprobante de Venta', module:'Caja - Impresion', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Despues de confirmar una venta | Buscar el boton "Imprimir Comprobante"', e:'El boton esta visible en la pantalla de confirmacion'},
      {n:'2', a:'Hacer clic en el boton', e:'Se abre una ventana de impresion con el comprobante'},
      {n:'3', a:'Verificar que el ticket contiene: cliente, detalle, monto, fecha y N de operacion', e:'Todos los datos son legibles y correctos en el documento'},
    ], params: null },
  { id:'TC-45', block:'K', blockName:'Integracion Avanzada y Borde', title:'Alta de Laboratorio Proveedor', module:'Configuracion - Laboratorios', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "Laboratorios" -> "Nuevo Laboratorio"', e:'Se abre el formulario de alta'},
      {n:'2', a:'Nombre: QA Lab Test | Telefono: QA-343-0000111 | Email: qa.lab@testoptica.com', e:'Los campos aceptan los datos'},
      {n:'3', a:'Guardar el laboratorio', e:'Aparece en el listado de laboratorios disponibles'},
      {n:'4', a:'Ir a una nueva receta y verificar que "QA Lab Test" aparece en el selector', e:'El laboratorio esta disponible para ser asignado a pedidos'},
    ], params:'CONVENCION QA: Nombre debe incluir "QA" para limpieza.\nQuery: DELETE FROM labs WHERE name LIKE \'QA%\';' },
  { id:'TC-46', block:'K', blockName:'Integracion Avanzada y Borde', title:'Alta de Banco / Caja Digital', module:'Configuracion - Bancos', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "Bancos" -> "Nuevo Banco"', e:'Se abre el formulario de alta'},
      {n:'2', a:'Nombre: QA Mercado Pago Test | Tipo: Digital Wallet | Guardar', e:'La caja digital figura en la lista de cajas disponibles'},
      {n:'3', a:'Ir a Caja y verificar que "QA Mercado Pago Test" aparece como medio de pago', e:'La nueva caja esta disponible para registrar transacciones'},
    ], params: null },
  { id:'TC-47', block:'K', blockName:'Integracion Avanzada y Borde', title:'Carga de Logo de la Optica', module:'Configuracion - Apariencia', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "General" o "Apariencia" -> campo de logo', e:'El campo de carga de imagen es visible'},
      {n:'2', a:'Subir un archivo PNG o JPG de tamano razonable (menos de 2MB)', e:'La imagen se carga y se muestra como preview'},
      {n:'3', a:'Guardar los cambios', e:'El logo se guarda correctamente'},
      {n:'4', a:'Verificar que el logo aparece en documentos de impresion (tarjeta de lab, ticket)', e:'El logo de la optica se muestra en los documentos'},
    ], params: null },
  { id:'TC-48', block:'K', blockName:'Integracion Avanzada y Borde', title:'Modo Oscuro y Cambio de Tema', module:'Configuracion - Apariencia', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "Apariencia" -> selector Claro/Oscuro', e:'El selector de tema es visible'},
      {n:'2', a:'Cambiar al modo "Oscuro" y guardar', e:'La interfaz cambia a tonos oscuros de forma inmediata'},
      {n:'3', a:'Navegar por varios modulos en modo oscuro (Clientes, Inventario, Caja)', e:'No hay textos ilegibles ni contraste insuficiente'},
      {n:'4', a:'Volver a modo "Claro" y verificar que la interfaz regresa a los colores originales', e:'El cambio de tema funciona en ambas direcciones sin errores'},
    ], params: null },
  { id:'TC-49', block:'K', blockName:'Integracion Avanzada y Borde', title:'Busqueda Global del Sistema', module:'UX - Busqueda', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Verificar si existe un campo de busqueda global (Ctrl+K o lupa en el header)', e:'El campo de busqueda global existe (o anotar que no existe)'},
      {n:'2', a:'Buscar: QA Garcia', e:'Se sugieren resultados del cliente desde distintos modulos'},
      {n:'3', a:'Hacer clic en el resultado del cliente', e:'Navega directamente a la ficha de ese cliente'},
    ], params: null },
  { id:'TC-50', block:'K', blockName:'Integracion Avanzada y Borde', title:'Paginacion en Listados Extensos', module:'UX - Rendimiento', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Ir al modulo de Clientes | Verificar si existen controles de paginacion', e:'Los controles (Siguiente/Anterior o scroll infinito) son visibles y funcionales'},
      {n:'2', a:'Hacer clic en "Siguiente pagina" si aplica', e:'Se carga la siguiente pagina sin errores ni pantalla en blanco'},
      {n:'3', a:'Repetir en Inventario con muchos productos', e:'La lista no colapsa ni presenta lag notable'},
    ], params: null },
  { id:'TC-51', block:'K', blockName:'Integracion Avanzada y Borde', title:'Venta de Producto de Mostrador (Sin Receta)', module:'Caja - Venta Directa', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Ir a "Nueva Venta" o "Venta Directa" desde el modulo de Caja', e:'Se abre el formulario de venta de mostrador'},
      {n:'2', a:'Agregar producto: QA Estuche Test (sin receta) | Cliente: QA Mostrador', e:'El producto se agrega al carrito con su precio sin pedir graduacion'},
      {n:'3', a:'Confirmar venta en efectivo | Verificar el movimiento en caja', e:'La venta se procesa y el movimiento queda registrado con el monto correcto'},
    ], params: null },
  { id:'TC-52', block:'K', blockName:'Integracion Avanzada y Borde', title:'Alta de Receta para Lentes de Contacto', module:'Recetas - Lentes de Contacto', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Nueva Orden" -> tipo "Lentes de Contacto"', e:'Se muestra el formulario de L.C. (potencia, curva base, diametro)'},
      {n:'2', a:'Asociar: QA Garcia Maria | OD: -2.50 | OI: -2.75', e:'Los campos aceptan los valores con signo negativo'},
      {n:'3', a:'Curva Base: 8.60 | Diametro: 14.20 | Tipo: Mensual | Marca: QA Contact Pro', e:'Los campos aceptan los parametros de L.C.'},
      {n:'4', a:'Confirmar y agregar al carrito', e:'La orden de L.C. se agrega correctamente'},
    ], params:'PARAMETROS A VERIFICAR:\n- OD -2.50 -> valor negativo valido para L.C.\n- Curva Base 8.60 -> rango tipico (8.4 - 9.0 mm)\n- Diametro 14.20 -> rango tipico (13.8 - 14.5 mm)\n- El tipo de trabajo debe quedar como "Lentes de Contacto"' },
  { id:'TC-53', block:'K', blockName:'Integracion Avanzada y Borde', title:'Historial Comparativo de Recetas de un Cliente', module:'Clientes - Ficha Optica', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Buscar "QA Garcia" (con al menos 2 recetas del QA) y abrir su historial', e:'Se listan las ordenes historicas del cliente'},
      {n:'2', a:'Verificar que cada orden muestra fecha, tipo y valores de graduacion', e:'Los datos son completos y ordenados cronologicamente'},
      {n:'3', a:'Comparar la graduacion de la receta mas antigua con la mas nueva', e:'Es posible visualizar la evolucion de la graduacion del cliente'},
    ], params: null },
  { id:'TC-54', block:'K', blockName:'Integracion Avanzada y Borde', title:'Cristal Fuera de Rango de la Receta', module:'Recetas - Cristales', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Crear receta con OD Esferico: +6.00 y seleccionar "QA Brand" (rango max +8.00)', e:'Sin advertencia (6.00 es menor o igual a 8.00) -- CORRECTO'},
      {n:'2', a:'Cambiar OD Esferico a +9.00 (supera el rango del cristal +8.00)', e:'El sistema muestra advertencia: la graduacion supera el rango del cristal'},
      {n:'3', a:'Seleccionar un cristal con rango compatible y verificar que la advertencia desaparece', e:'La advertencia se elimina al elegir un cristal adecuado'},
    ], params:'PARAMETROS A VERIFICAR (cristal QA Brand: rango -8.00 a +8.00):\n- Esf +8.00 -> sin advertencia (limite exacto)\n- Esf +8.25 -> CON advertencia (supera el limite)\n- Esf -8.00 -> sin advertencia\n- Esf -8.50 -> CON advertencia' },
  { id:'TC-55', block:'K', blockName:'Integracion Avanzada y Borde', title:'Alta de Categoria de Inventario Personalizada', module:'Configuracion - Categorias', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "Categorias" -> agregar nueva: "QA Accesorios Test"', e:'La categoria se crea y aparece en el listado'},
      {n:'2', a:'Ir a "Inventario" -> "Anadir Nuevo" | Verificar que "QA Accesorios Test" aparece en el desplegable', e:'La nueva categoria esta disponible para nuevos productos'},
    ], params: null },
  { id:'TC-56', block:'K', blockName:'Integracion Avanzada y Borde', title:'Visualizacion del Audit Log de Acciones', module:'Configuracion - Audit', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'Ir a Configuracion -> "Audit Log" o similar', e:'Se muestra un historial de acciones del sistema'},
      {n:'2', a:'Verificar que las acciones del QA estan registradas (alta de QA Garcia, ventas QA, etc.)', e:'Las acciones son trazables con usuario, fecha, hora y descripcion'},
      {n:'3', a:'Verificar que el log es solo de lectura (no se puede editar ni eliminar)', e:'No hay botones de edicion en el log de auditoria'},
    ], params: null },
  { id:'TC-57', block:'K', blockName:'Integracion Avanzada y Borde', title:'Eliminacion de Cliente con Historial Asociado', module:'Clientes - Integridad', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Buscar "QA Garcia" (que ya tiene compras y trabajos asociados)', e:'El cliente aparece en la lista'},
      {n:'2', a:'Intentar eliminar el cliente (si el boton existe)', e:'El sistema muestra advertencia de que el cliente tiene historial asociado'},
      {n:'3', a:'Verificar que se requiere confirmacion explicita o que el sistema lo impide', e:'No se elimina accidentalmente; el sistema protege la integridad de datos'},
    ], params: null },
  { id:'TC-58', block:'K', blockName:'Integracion Avanzada y Borde', title:'Receta para un Solo Ojo (Monoculo)', module:'Recetas - Casos Especiales', priority:'ALTA', pc:'yellow',
    steps:[
      {n:'1', a:'Ir a "Nueva Orden" -> "Monofocal" | Asociar: QA Garcia | Selector de ojos: solo "OD"', e:'El formulario habilita solo los campos del ojo derecho'},
      {n:'2', a:'OD Esf +2.00 | Cil 0.00 | Eje 0 grados | Confirmar pedido', e:'El sistema pregunta si es intencional cargar solo un ojo (o lo acepta directamente)'},
      {n:'3', a:'Confirmar que es intencional (si pregunta)', e:'La orden se agrega con solo el cristal del OD y el precio correspondiente'},
    ], params:'PARAMETROS A VERIFICAR:\n- Precio = precio cristal x 1 (solo un ojo, no x 2)\n- La tarjeta de lab debe indicar claramente "Solo OD"\n- El campo OI debe quedar en blanco o cero' },
  { id:'TC-59', block:'K', blockName:'Integracion Avanzada y Borde', title:'Caracteres Especiales, Acentos y Simbolos', module:'Seguridad - Robustez', priority:'MEDIA', pc:'green',
    steps:[
      {n:'1', a:'En "Nuevo Cliente" -> Nombre: "QA Angel Munoz & Cia."', e:'El campo acepta caracteres especiales y simbolos'},
      {n:'2', a:'Guardar el cliente', e:'El nombre se guarda exactamente con todos los caracteres'},
      {n:'3', a:'Buscar "QA Angel" en el buscador', e:'El cliente se encuentra correctamente con el nombre completo'},
      {n:'4', a:'Verificar que no hay caracteres corruptos ni errores de encoding', e:'Los datos se muestran sin alteraciones ni corrupcion'},
    ], params: null },
  { id:'TC-60', block:'K', blockName:'Integracion Avanzada y Borde', title:'Cierre de Sesion y Limpieza de Datos de Sesion', module:'Autenticacion - Seguridad', priority:'CRITICA', pc:'red',
    steps:[
      {n:'1', a:'Hacer clic en el menu de usuario -> "Cerrar Sesion"', e:'El sistema redirige a la pantalla de login'},
      {n:'2', a:'Presionar el boton Atras del navegador', e:'No se permite volver; redirige al login'},
      {n:'3', a:'Intentar acceder a cualquier ruta protegida por URL', e:'El sistema redirige al login sin mostrar datos de la sesion anterior'},
      {n:'4', a:'Iniciar sesion con otro usuario y verificar que no se ven datos de sesiones previas', e:'Cada sesion esta aislada correctamente (sin cache contaminado)'},
    ], params: null },
];

const A4W = 595.28;
const A4H = 841.89;
const M   = 40;
const CW  = A4W - M * 2;

function wrapText(text, font, size, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function border(page, x, y, w, h, color, width = 1) {
  page.drawRectangle({ x, y, width: w, height: h, color, borderWidth: 0 });
  // draw 4 lines as border
  page.drawLine({ start:{x,y}, end:{x:x+w,y}, thickness:width, color });
  page.drawLine({ start:{x,y:y+h}, end:{x:x+w,y:y+h}, thickness:width, color });
  page.drawLine({ start:{x,y}, end:{x,y:y+h}, thickness:width, color });
  page.drawLine({ start:{x:x+w,y}, end:{x:x+w,y:y+h}, thickness:width, color });
}

async function gen() {
  console.log('Generando PDF interactivo de QA...');
  const doc  = await PDFDocument.create();
  doc.setTitle('Plan QA Manual - Optica Paracao - 60 Casos');
  doc.setAuthor('Equipo QA Optica Paracao');
  const form = doc.getForm();
  const fB   = await doc.embedFont(StandardFonts.HelveticaBold);
  const fR   = await doc.embedFont(StandardFonts.Helvetica);
  const fI   = await doc.embedFont(StandardFonts.HelveticaOblique);

  // ── PORTADA ──────────────────────────────────────────────────────────────
  let pg = doc.addPage([A4W, A4H]);
  pg.drawRectangle({ x:0, y:0, width:A4W, height:A4H, color:C.blueDark });
  pg.drawRectangle({ x:0, y:0, width:A4W, height:250, color:rgb(0.1,0.18,0.48) });
  pg.drawEllipse({ x:500, y:750, xScale:110, yScale:110, color:rgb(1,1,1), opacity:0.04 });
  pg.drawEllipse({ x:80,  y:130, xScale:70,  yScale:70,  color:rgb(1,1,1), opacity:0.03 });

  pg.drawText('PLAN DE QA MANUAL',    {x:M, y:680, size:30, font:fB, color:C.white});
  pg.drawText('Optica Gestion Paracao', {x:M, y:645, size:18, font:fR, color:rgb(0.8,0.85,1)});
  pg.drawRectangle({x:M, y:628, width:60, height:3, color:rgb(1,1,1), opacity:0.4});
  
  pg.drawText('60 CASOS DE PRUEBA  |  11 MODULOS  |  FORMULARIO INTERACTIVO EDITABLE',
    {x:M, y:605, size:9, font:fB, color:rgb(0.7,0.8,1)});

  // Cuadro de convencion QA
  pg.drawRectangle({x:M, y:460, width:CW, height:90, color:C.yellowLight});
  pg.drawRectangle({x:M, y:460, width:4,  height:90, color:C.yellowDark});
  pg.drawText('[WARN] CONVENCION DE DATOS QA', {x:M+12, y:535, size:10, font:fB, color:C.yellowDark});
  pg.drawText('Todos los registros de prueba deben llevar el prefijo "QA" en el nombre/SKU/email.',{x:M+12,y:518,size:9,font:fR,color:C.slate900});
  pg.drawText('Esto permite limpiar la base de datos despues del testing con queries simples:',{x:M+12,y:504,size:9,font:fR,color:C.slate900});
  pg.drawText("DELETE FROM clients WHERE name LIKE 'QA%';",{x:M+12,y:489,size:9,font:fI,color:C.blueDark});
  pg.drawText("DELETE FROM inventory WHERE sku LIKE 'QA-%';  |  DELETE FROM labs WHERE name LIKE 'QA%';",{x:M+12,y:474,size:9,font:fI,color:C.blueDark});

  // Leyenda prioridades
  pg.drawRectangle({x:M, y:340, width:CW, height:100, color:C.slate50});
  pg.drawText('LEYENDA DE PRIORIDADES', {x:M+10, y:425, size:9, font:fB, color:C.slate500});
  [{bg:C.redLight,   color:C.redDark,    t:'[CRITICA]  -- Funcionalidad core. El sistema no puede salir a produccion si falla.'},
   {bg:C.yellowLight,color:C.yellowDark, t:'[ALTA]     -- Funcionalidad importante. Debe resolverse antes del lanzamiento.'},
   {bg:C.greenLight, color:C.greenDark,  t:'[MEDIA]    -- Mejora de UX. Puede lanzarse con advertencia si falla.'},
  ].forEach(({bg, color, t}, i) => {
    const ly = 408 - i * 22;
    pg.drawRectangle({x:M+10, y:ly-5, width:CW-20, height:18, color:bg});
    pg.drawText(t, {x:M+14, y:ly, size:8.5, font:fR, color:C.slate900});
  });

  pg.drawRectangle({x:0, y:0, width:A4W, height:80, color:rgb(0,0,0), opacity:0.2});
  pg.drawText('Version 2.0  |  Julio 2026  |  opticagestionparacao.lnx.com.ar  |  Equipo QA Optica Paracao',
    {x:M, y:35, size:9, font:fR, color:rgb(0.7,0.75,0.9)});
  pg.drawText('INSTRUCCIONES: Abrir con Adobe Acrobat Reader o el visor de PDF de Edge/Chrome para poder tildar los checkboxes y escribir en los campos.',
    {x:M, y:20, size:7.5, font:fI, color:rgb(0.6,0.65,0.85)});

  // ── CASOS DE PRUEBA ───────────────────────────────────────────────────────
  let curBlock = '';
  for (let ti = 0; ti < TEST_CASES.length; ti++) {
    const tc = TEST_CASES[ti];
    pg = doc.addPage([A4W, A4H]);
    let y = A4H - M;

    // Encabezado de bloque (cuando cambia)
    if (tc.block !== curBlock) {
      curBlock = tc.block;
      pg.drawRectangle({x:0, y:y-46, width:A4W, height:46, color:C.blueDark});
      pg.drawText(`Bloque ${tc.block}  --  ${tc.blockName}`, {x:M, y:y-30, size:13, font:fB, color:C.white});
      y -= 55;
    }

    // --- Card Header ---
    const pc = tc.pc;
    const pBg = pc==='red' ? C.redLight : pc==='yellow' ? C.yellowLight : C.greenLight;
    const pFg = pc==='red' ? C.redDark  : pc==='yellow' ? C.yellowDark  : C.greenDark;
    const pTag = pc==='red' ? '[CRITICA]' : pc==='yellow' ? '[ALTA]' : '[MEDIA]';

    pg.drawRectangle({x:M, y:y-42, width:CW, height:42, color:C.slate50});
    pg.drawLine({start:{x:M,y:y},       end:{x:M+CW,y:y},       thickness:1, color:C.slate300});
    pg.drawLine({start:{x:M,y:y-42},    end:{x:M+CW,y:y-42},    thickness:1, color:C.slate300});
    pg.drawLine({start:{x:M,y:y-42},    end:{x:M,y:y},           thickness:1, color:C.slate300});
    pg.drawLine({start:{x:M+CW,y:y-42}, end:{x:M+CW,y:y},        thickness:1, color:C.slate300});

    pg.drawRectangle({x:M+8, y:y-34, width:40, height:20, color:C.blueDark});
    pg.drawText(tc.id, {x:M+10, y:y-28, size:8, font:fB, color:C.white});
    pg.drawText(tc.title, {x:M+56, y:y-18, size:11, font:fB, color:C.slate900});
    
    const mW = fB.widthOfTextAtSize(tc.module, 7.5) + 10;
    pg.drawRectangle({x:M+56, y:y-36, width:mW, height:14, color:C.blueLight});
    pg.drawText(tc.module, {x:M+60, y:y-32, size:7.5, font:fB, color:C.blueDark});
    pg.drawRectangle({x:M+56+mW+4, y:y-36, width:fB.widthOfTextAtSize(pTag,7.5)+10, height:14, color:pBg});
    pg.drawText(pTag, {x:M+60+mW+4, y:y-32, size:7.5, font:fB, color:pFg});
    y -= 46;

    // --- Tabla de pasos ---
    const cW = [22, 228, 264];
    const tW = cW.reduce((a,b)=>a+b,0);
    const hdrs = ['#', 'PASO A EJECUTAR', 'RESULTADO ESPERADO'];

    pg.drawRectangle({x:M, y:y-17, width:tW, height:17, color:C.blueDark});
    let hx = M;
    hdrs.forEach((h,i)=>{ pg.drawText(h,{x:hx+3,y:y-12,size:7.5,font:fB,color:C.white}); hx+=cW[i]; });
    y -= 19;

    for (let si = 0; si < tc.steps.length; si++) {
      const s = tc.steps[si];
      const aL = wrapText(s.a, fR, 8, cW[1]-8);
      const eL = wrapText(s.e, fR, 8, cW[2]-8);
      const rH = Math.max(aL.length, eL.length) * 11 + 7;
      const rBg = si%2===0 ? C.white : C.slate50;

      pg.drawRectangle({x:M, y:y-rH, width:tW, height:rH, color:rBg});
      pg.drawText(s.n, {x:M+8, y:y-10, size:8, font:fB, color:C.blueMid});
      aL.forEach((l,li) => pg.drawText(l, {x:M+cW[0]+3, y:y-10-li*11, size:8, font:fR, color:C.slate700}));
      eL.forEach((l,li) => pg.drawText(l, {x:M+cW[0]+cW[1]+3, y:y-10-li*11, size:8, font:fI, color:C.greenDark}));

      // Bordes de celdas
      [0, cW[0], cW[0]+cW[1], cW[0]+cW[1]+cW[2]].forEach(ox => {
        pg.drawLine({start:{x:M+ox,y:y-rH}, end:{x:M+ox,y}, thickness:0.5, color:C.slate300});
      });
      pg.drawLine({start:{x:M,y:y-rH}, end:{x:M+tW,y:y-rH}, thickness:0.5, color:C.slate300});
      y -= rH;
    }
    pg.drawLine({start:{x:M,y}, end:{x:M+tW,y}, thickness:0.5, color:C.slate300});
    y -= 8;

    // --- Params box (si existe) ---
    if (tc.params) {
      const pLines = tc.params.split('\n');
      const pH = pLines.length * 12 + 14;
      pg.drawRectangle({x:M, y:y-pH, width:CW, height:pH, color:C.yellowLight});
      pg.drawRectangle({x:M, y:y-pH, width:3,  height:pH, color:C.yellowDark});
      pLines.forEach((line, li) => {
        pg.drawText(line, {x:M+8, y:y-12-li*12, size:7.5, font:li===0?fB:fI, color:C.slate900});
      });
      y -= pH + 8;
    }

    y -= 6;

    // --- Formulario de estado (AcroForm) ---
    const fH = 90;
    pg.drawRectangle({x:M, y:y-fH, width:CW, height:fH, color:C.slate50});
    pg.drawLine({start:{x:M,    y}, end:{x:M+CW, y}, thickness:1, color:C.slate300});
    pg.drawLine({start:{x:M,y:y-fH}, end:{x:M+CW,y:y-fH}, thickness:1, color:C.slate300});
    pg.drawLine({start:{x:M,y:y-fH}, end:{x:M,y}, thickness:1, color:C.slate300});
    pg.drawLine({start:{x:M+CW,y:y-fH}, end:{x:M+CW,y}, thickness:1, color:C.slate300});

    pg.drawText('ESTADO DE LA PRUEBA:', {x:M+8, y:y-13, size:8, font:fB, color:C.slate700});

    // Checkboxes de estado
    const statuses = [
      {label:'APROBADO', field:`${tc.id}_aprobado`, x:M+8},
      {label:'FALLIDO',  field:`${tc.id}_fallido`,  x:M+100},
      {label:'ADVERTENCIA', field:`${tc.id}_advert`, x:M+185},
    ];
    for (const {label, field, x} of statuses) {
      try {
        const cb = form.createCheckBox(field);
        cb.addToPage(pg, {x, y:y-32, width:14, height:14,
          borderColor:C.slate500, backgroundColor:C.white});
      } catch(e) {}
      pg.drawText(label, {x:x+18, y:y-28, size:8.5, font:fB, color:C.slate700});
    }

    // Responsable
    pg.drawText('Responsable:', {x:M+8, y:y-50, size:8, font:fB, color:C.slate700});
    try {
      const tf = form.createTextField(`${tc.id}_resp`);
      tf.addToPage(pg, {x:M+72, y:y-58, width:120, height:14, borderColor:C.slate300, backgroundColor:C.white});
    } catch(e) {}

    // Fecha
    pg.drawText('Fecha:', {x:M+205, y:y-50, size:8, font:fB, color:C.slate700});
    try {
      const tf = form.createTextField(`${tc.id}_fecha`);
      tf.addToPage(pg, {x:M+233, y:y-58, width:80, height:14, borderColor:C.slate300, backgroundColor:C.white});
    } catch(e) {}

    // Notas / Observaciones
    pg.drawText('Observaciones:', {x:M+8, y:y-70, size:8, font:fB, color:C.slate700});
    try {
      const tf = form.createTextField(`${tc.id}_notas`);
      tf.enableMultiline();
      tf.addToPage(pg, {x:M+80, y:y-fH+4, width:CW-88, height:26, borderColor:C.slate300, backgroundColor:C.white});
    } catch(e) {}

    // Pie de pagina
    pg.drawText(`${tc.id} de 60  |  Plan QA Optica Paracao v2.0  |  Pagina ${ti+2} de ${TEST_CASES.length+2}`,
      {x:M, y:18, size:7, font:fR, color:C.slate500});
  }

  // ── RESUMEN FINAL ─────────────────────────────────────────────────────────
  pg = doc.addPage([A4W, A4H]);
  let y = A4H - M;
  pg.drawRectangle({x:0, y:y-46, width:A4W, height:46, color:C.blueDark});
  pg.drawText('HOJA DE RESULTADOS -- Resumen de 60 Casos de Prueba', {x:M, y:y-30, size:13, font:fB, color:C.white});
  y -= 55;
  pg.drawText('Sistema: opticagestionparacao.lnx.com.ar  |  Completar por cada tester  |  Marcar OK en la columna Estado',
    {x:M, y, size:8, font:fR, color:C.slate500});
  y -= 16;

  const sCols = [42, 175, 92, 48, 58, 100];
  const sW = sCols.reduce((a,b)=>a+b,0);
  const sHdrs = ['ID', 'Caso de Prueba', 'Responsable', 'Estado', 'Fecha', 'Observaciones'];
  pg.drawRectangle({x:M, y:y-16, width:sW, height:16, color:C.blueDark});
  let hx2 = M;
  sHdrs.forEach((h,i)=>{ pg.drawText(h,{x:hx2+3,y:y-12,size:7.5,font:fB,color:C.white}); hx2+=sCols[i]; });
  y -= 18;

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    const rH = 17;
    if (y - rH < M + 20) {
      pg = doc.addPage([A4W, A4H]);
      y = A4H - M;
      pg.drawRectangle({x:M, y:y-16, width:sW, height:16, color:C.blueDark});
      let hx3 = M;
      sHdrs.forEach((h,i2)=>{ pg.drawText(h,{x:hx3+3,y:y-12,size:7.5,font:fB,color:C.white}); hx3+=sCols[i2]; });
      y -= 18;
    }
    const rBg = i%2===0 ? C.white : C.slate50;
    pg.drawRectangle({x:M, y:y-rH, width:sW, height:rH, color:rBg});
    pg.drawText(tc.id, {x:M+3, y:y-12, size:8, font:fB, color:C.blueMid});
    const tit = tc.title.length > 35 ? tc.title.substring(0,33)+'...' : tc.title;
    pg.drawText(tit, {x:M+sCols[0]+3, y:y-12, size:7.5, font:fR, color:C.slate900});
    try {
      const tf = form.createTextField(`sum_${tc.id}_r`);
      tf.addToPage(pg, {x:M+sCols[0]+sCols[1]+1, y:y-rH+2, width:sCols[2]-4, height:rH-4, borderColor:C.slate300, backgroundColor:C.white});
    } catch(e) {}
    try {
      const cb = form.createCheckBox(`sum_${tc.id}_ok`);
      cb.addToPage(pg, {x:M+sCols[0]+sCols[1]+sCols[2]+4, y:y-rH+4, width:11, height:11, borderColor:C.slate300, backgroundColor:C.white});
    } catch(e) {}
    try {
      const tf = form.createTextField(`sum_${tc.id}_f`);
      tf.addToPage(pg, {x:M+sCols[0]+sCols[1]+sCols[2]+sCols[3]+1, y:y-rH+2, width:sCols[4]-4, height:rH-4, borderColor:C.slate300, backgroundColor:C.white});
    } catch(e) {}
    try {
      const tf = form.createTextField(`sum_${tc.id}_o`);
      tf.addToPage(pg, {x:M+sCols[0]+sCols[1]+sCols[2]+sCols[3]+sCols[4]+1, y:y-rH+2, width:sCols[5]-4, height:rH-4, borderColor:C.slate300, backgroundColor:C.white});
    } catch(e) {}
    // lineas de borde
    let bx = M;
    sCols.forEach(c => { pg.drawLine({start:{x:bx,y:y-rH}, end:{x:bx,y}, thickness:0.5, color:C.slate300}); bx+=c; });
    pg.drawLine({start:{x:bx,y:y-rH}, end:{x:bx,y}, thickness:0.5, color:C.slate300});
    pg.drawLine({start:{x:M,y:y-rH}, end:{x:M+sW,y:y-rH}, thickness:0.5, color:C.slate300});
    pg.drawLine({start:{x:M,y}, end:{x:M+sW,y}, thickness:0.5, color:C.slate300});
    y -= rH;
  }

  pg.drawText('Plan de QA Manual v2.0  |  Optica Paracao  |  60 Casos de Prueba  |  Antigravity AI  |  Julio 2026',
    {x:M, y:18, size:7, font:fR, color:C.slate500});

  // Guardar
  const bytes = await doc.save();
  const out = path.join(__dirname, 'Plan_QA_Optica_Paracao_60casos.pdf');
  fs.writeFileSync(out, bytes);
  console.log('PDF generado: ' + out);
  console.log('Paginas: ' + doc.getPageCount());
  console.log('Campos de formulario: ' + form.getFields().length);
}

gen().catch(e => { console.error('Error:', e.message); process.exit(1); });
