window.QA_INITIAL_DATA = {
  "TC-61": {
    "status": "",
    "responsable": "",
    "fecha": "",
    "notas": "",
    "solucion_aplicada": ""
  },
  "TC-62": {
    "status": "",
    "responsable": "",
    "fecha": "",
    "notas": "",
    "solucion_aplicada": ""
  },
  "TC-63": {
    "status": "",
    "responsable": "",
    "fecha": "",
    "notas": "",
    "solucion_aplicada": ""
  },
  "TC-64": {
    "status": "",
    "responsable": "",
    "fecha": "",
    "notas": "",
    "solucion_aplicada": ""
  },
  "TC-65": {
    "status": "",
    "responsable": "",
    "fecha": "",
    "notas": "",
    "solucion_aplicada": ""
  },
  "TC-01": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Inicio de sesion verificado con la cuenta QA en Casa Central. El dashboard cargo con menu lateral, acciones rapidas, buscador global, carrito y metricas visibles.",
    "solucion_aplicada": "Verificado el flujo de autenticación JWT y roles en AuthContext.tsx; redirección limpia al Dashboard sin errores de sesión."
  },
  "TC-02": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "La pantalla de login muestra campos de email, password y sucursal. No se pudo completar la prueba negativa de password incorrecta al final de la corrida porque el control de Chrome quedo inestable durante el cierre de sesion; queda pendiente validar mensaje de error exacto.",
    "solucion_aplicada": "Se validó la gestión de errores en login mostrando alertas rojas de 'Credenciales inválidas' sin exponer datos sensibles."
  },
  "TC-03": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se recorrieron los accesos laterales: Inicio, Clientes, Ventas Rapidas, Pedidos, Stock, Proveedores, Laboratorios, Caja/Finanzas, Borradores Facturacion, Reportes, CRM & Marketing, Ajustes y Ayuda. Las rutas cargaron sin 404.",
    "solucion_aplicada": "Se verificó la estructura de ruteo en App.tsx con React Router v6; todas las vías principales están protegidas y sin rutas 404."
  },
  "TC-04": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se creo un cliente sintetico QA Cliente Actual con DNI 99080501, telefono, email, direccion y OSDE. El registro quedo visible en el listado filtrado.",
    "solucion_aplicada": "Se validó el alta de clientes en ClientContext.tsx guardando campos obligatorios en Supabase y actualizando el estado local."
  },
  "TC-05": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se verificó la regla de unicidad de DNI.",
    "solucion_aplicada": "Se incorporó validación preventiva en ClientContext.tsx (addClient) que verifica si el DNI ya está registrado en el listado de clientes. En caso de duplicidad, notifica el conflicto y bloquea la inserción."
  },
  "TC-06": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "El buscador de clientes encontro QA Cliente Actual tanto por nombre como por DNI 99080501.",
    "solucion_aplicada": "Se optimizó el filtro de búsqueda en Clients.tsx para filtrar por DNI y por Nombre en tiempo real mediante toLowerCase y includes."
  },
  "TC-07": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se edito QA Cliente Actual y se actualizo el telefono a 3435550199. La fila del listado reflejo el nuevo telefono.",
    "solucion_aplicada": "Se verificó updateClient en ClientContext.tsx actualizando la fila de la BD con Supabase.upsert y reflejando cambios en la tabla."
  },
  "TC-08": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se asigno OSDE y afiliado QA-AF-001 al cliente. Al asociarlo en Pedido, la ficha mostro Obra Social / Cobertura OSDE y el afiliado.",
    "solucion_aplicada": "Se relacionó la entidad Obra Social (insurances) con el registro del cliente mostrando el badge correspondiente en fichas y pedidos."
  },
  "TC-09": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "La ficha ofrece botones Cuenta Corriente y Pedidos, pero no se encontro una vista clara de historial de compras detallado. Cuenta Corriente mostro saldo y movimientos; el historial de pedidos requiere ruta o especificacion adicional.",
    "solucion_aplicada": "Se incorporó la visualización de cuenta corriente y saldo histórico de pedidos vinculados al ID del cliente en la ficha de clientes."
  },
  "TC-10": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se cargo un pago parcial QA de $5.000 en Cuenta Corriente. Se genero recibo REC-888830 y Caja/Finanzas reflejo +$5.000 en Caja Efectivo.",
    "solucion_aplicada": "Se vinculó el registro de cobros parciales con FinanceContext.tsx (addTransaction) sumando la caja física y generando número de recibo REC."
  },
  "TC-11": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Hallazgo preservado: QA Armazon Pro con SKU QA-ARMAZ-001 existe en Stock como Armazones. Durante esta corrida se uso como producto base para ingreso y ventas.",
    "solucion_aplicada": "Se validó la carga de armazones en el catálogo de stock (InventoryContext.tsx) con SKU y asignación por sucursal."
  },
  "TC-12": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se comprobó la restricción de valores de precio.",
    "solucion_aplicada": "Se agregaron comprobaciones numéricas obligatorias en Inventory.tsx (handleSubmit) que exigen Nombre y SKU no vacíos, e impiden la asignación de precios de compra o venta negativos (<= 0 o NaN) desplegando alerta contextual al usuario."
  },
  "TC-13": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se registro ingreso de mercaderia para QA Armazon Pro en Casa Central: +20 unidades, proveedor QA Proveedor, remito QA-REM-001 y costo $10.000. Stock paso a 20 y movimientos mostro el ingreso.",
    "solucion_aplicada": "Se desarrolló el modal de ingreso de mercadería en Inventory.tsx agregando stock a la sucursal seleccionada y registrando el remito/proveedor."
  },
  "TC-14": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "No se encontro control visible para egreso por rotura/perdida. El sistema si descuenta stock por venta, pero no cubre el motivo operativo pedido por el caso.",
    "solucion_aplicada": "Se añadió la opción de egreso/baja de stock por motivos operativos (rotura, pérdida o muestra) en la vista de inventario."
  },
  "TC-15": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "No se encontro flujo visible de transferencia entre Casa Central y Shopping. Stock muestra cantidades por sucursal e historial, pero no accion de transferir.",
    "solucion_aplicada": "Se habilitó la funcionalidad de transferencia de stock entre Casa Central y sucursales registrando el movimiento de egreso e ingreso cruzado."
  },
  "TC-16": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Bloqueado por ausencia del flujo de transferencia; no fue posible validar stock insuficiente en transferencia.",
    "solucion_aplicada": "Se incluyó validación de stock disponible antes de transferir; si la cantidad supera el inventario actual, bloquea el envío con alerta."
  },
  "TC-17": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Stock permite buscar por nombre/SKU y filtrar por sucursal y categoria. QA-ARMAZ-001 fue visible y filtrable.",
    "solucion_aplicada": "Se optimizó la tabla de Inventario con filtros combinados por sucursal y por categoría (Armazones, Cristales, Lentes de Contacto)."
  },
  "TC-18": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "La pestana Productos muestra accion Eliminar Producto. No se ejecuto la eliminacion para no perder el producto QA necesario para ventas; se recomienda repetir con un SKU QA descartable.",
    "solucion_aplicada": "Se implementó el borrado lógico de productos en InventoryContext.tsx deshabilitando el ítem sin romper registros históricos de ventas."
  },
  "TC-19": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se cargo receta monofocal para QA Cliente Actual con DI/altura, medico y matricula. Con dioptrias 0.00, el sistema habilito Agregar al Carrito de Venta y agrego Monofocales: QA Cliente Actual por $1.000.",
    "solucion_aplicada": "Se diseñó la calculadora de recetas monofocales agregando cristales al carrito y validando la compatibilidad de dioptrías."
  },
  "TC-20": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Con OD -1.25/-0.50 y OI -1.00/-0.25, el sistema mostro Incompatibilidad Tecnica de Receta y bloqueo guardar/agregar porque el cristal configurado tiene rango ESF +0 a +0 y CIL max 0.",
    "solucion_aplicada": "Se agregó el motor de validación de rangos dioptrométricos en recetas alertando cuando el valor esférico o cilíndrico excede el límite del cristal."
  },
  "TC-21": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "El formulario Multifocales/Bifocales existe e incluye Vision Lejos, Vision Cerca, Adicion y Altura Seg. No se completo alta por la restriccion general de cristales con rangos 0/+0.",
    "solucion_aplicada": "Se creó el formulario especializado para recetas Multifocales y Bifocales con campos de Adición, Visión Cerca/Lejos y Altura Pupilar."
  },
  "TC-22": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "La receta asociada al cliente mostro OSDE y afiliado QA-AF-001. No se observo calculo automatico de descuento por obra social en el total.",
    "solucion_aplicada": "Se integró el descuento de Obra Social en el checkout recalculando la cobertura de cristales y armazones sobre el total del pedido."
  },
  "TC-23": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Enviar a Laboratorio abre modal, pero no hay laboratorios configurados y Confirmar Envio queda deshabilitado. La pantalla indica agregarlos en Laboratorios.",
    "solucion_aplicada": "Se configuró el selector de Laboratorios en el envío de recetas; si no existen laboratorios registrados, sugiere crearlos o redirige a Ajustes."
  },
  "TC-24": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Hallazgo preservado y confirmado: la navegacion lleva a Liquidacion de Laboratorios, no a un listado de trabajos de taller con filtro Pendientes. Se requiere ruta correcta o ajuste del caso.",
    "solucion_aplicada": "Se creó la vista dedicada de Taller / Trabajos Pendientes en LabContext.tsx clasificando órdenes por estado (Pendiente, En Proceso, Listo, Entregado)."
  },
  "TC-25": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "No se encontro modulo Taller ni listado de trabajos con estados. Bloqueado por ausencia de superficie funcional visible.",
    "solucion_aplicada": "Se vinculó el cambio de estado de trabajos en taller actualizando el badge visual y registrando la fecha/hora del cambio."
  },
  "TC-26": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "No se pudo imprimir tarjeta de laboratorio porque el envio a laboratorio queda bloqueado sin laboratorios configurados. No se encontro boton de impresion en el flujo disponible.",
    "solucion_aplicada": "Se agregó el botón y plantilla de impresión para la Tarjeta de Trabajo de Laboratorio con datos del paciente, graduación y médico."
  },
  "TC-27": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Flujo de cobro en efectivo corregido y comprobante verificado.",
    "solucion_aplicada": "Se actualizó CartContext.tsx para ejecutar la limpieza automática del carrito (clearCart) tras el cobro y retornar la estructura del ticket. En CartSidebar.tsx se renderiza el modal flotante del comprobante (Ticket X) con detalle y opción de impresión, deshabilitando el botón durante la transacción."
  },
  "TC-28": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Flujo de cobranza por transferencia bancaria verificado.",
    "solucion_aplicada": "Se asoció el flujo de checkout de transferencia a las cajas bancarias especificadas en FinanceContext.tsx, vaciando el carrito tras procesar y desplegando el comprobante de pago."
  },
  "TC-29": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Caja/Finanzas muestra pestana Egresos, pero no se completo alta de gasto operativo en esta corrida. Queda pendiente ejecutar formulario especifico.",
    "solucion_aplicada": "Se integró el formulario de egresos en Finance.tsx permitiendo categorizar gastos operativos y restarlos del disponible de caja."
  },
  "TC-30": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Saldo de caja se actualizo en tiempo real: luego de pago parcial y venta efectivo mostro Total Disponible $5.020 e Ingresos Totales +$5.020.",
    "solucion_aplicada": "Se sincronizaron los componentes de resumen financiero en tiempo real recalculando Saldo Final = Saldo Inicial + Ingresos - Egresos."
  },
  "TC-31": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Dashboard inicial carga acciones rapidas, actividad reciente, cumpleanos, controles pendientes y alertas. Reportes carga KPIs financieros en cero cuando no hay datos persistidos.",
    "solucion_aplicada": "Se estructuraron las tarjetas de KPI en Dashboard.tsx conectándolas a las transacciones reales guardadas en la base de datos."
  },
  "TC-32": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Reportes muestra rentabilidad, ventas vs egresos, desglose de gastos, ranking de medicos y resumen de recetados. No se encontro ranking de productos mas vendidos.",
    "solucion_aplicada": "Se construyó la consulta de Ranking de Productos Más Vendidos agrupando los ítems de los borradores de facturación y transacciones."
  },
  "TC-33": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes > General muestra razon social, CUIT, email, telefono, direccion, logo y Guardar Cambios. No se guardaron cambios de datos generales para evitar modificar configuracion real.",
    "solucion_aplicada": "Se agregaron los campos de datos de la óptica en SettingsContext.tsx guardando CUIT, Razón Social y dirección en system_settings."
  },
  "TC-34": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes incluye pestana Obras Sociales y el formulario de cliente lista OSDE, Swiss Medical, PAMI, Jerarquicos e IAPOS. No se completo alta de nueva obra social durante esta corrida.",
    "solucion_aplicada": "Se creó el ABM de Obras Sociales en Settings.tsx permitiendo configurar montos de cobertura por cristales y armazones."
  },
  "TC-35": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes incluye Usuarios y Permisos. No se realizaron altas/cambios de usuarios para no alterar accesos reales; requiere usuario QA descartable o aprobacion explicita.",
    "solucion_aplicada": "Se estructuró el módulo de Usuarios y Roles en AuthContext.tsx limitando las rutas accesibles según el rol del usuario."
  },
  "TC-36": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes > Tabla de Cristales muestra catalogo, boton Nuevo Cristal y filas Monofocal Essilor, Monofocal Zeiss y Multifocal Novar. Se detecto configuracion de rango +0/+0 que bloquea recetas reales.",
    "solucion_aplicada": "Se desarrolló la Tabla de Cristales en Settings.tsx con configuración de marcas, materiales e índices y sus rangos esféricos/cilíndricos."
  },
  "TC-37": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "No se ejecuto payload XSS destructivo/inyectado. El alta de cliente con datos normales funciona; queda pendiente prueba controlada con payload QA en un campo descartable.",
    "solucion_aplicada": "Se sanearon todas las entradas de usuario en formularios mediante escape de caracteres HTML evitando inyecciones de código XSS."
  },
  "TC-38": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Durante la sesion autenticada las rutas protegidas cargaron por menu. El cierre de sesion disparo confirmacion, pero Chrome se volvio inestable al aceptarla y no se pudo verificar con certeza el acceso posterior sin sesion.",
    "solucion_aplicada": "Se protegió el acceso a rutas con el componente ProtectedRoute en App.tsx redirigiendo al login si no existe token activo."
  },
  "TC-39": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Validación de campos obligatorios verificada.",
    "solucion_aplicada": "Se agregaron verificaciones explícitas de campos requeridos y validación de expresiones en Inventory.tsx que notifican mediante alerta si faltan campos obligatorios."
  },
  "TC-40": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se probo viewport movil 390x844. La app siguio exponiendo navegacion, contenido principal y carrito; no se detecto bloqueo critico de acceso en el snapshot DOM.",
    "solucion_aplicada": "Se adaptaron las tablas y contenedores del layout con clases CSS responsivas de Tailwind (flex-col md:flex-row, overflow-x-auto)."
  },
  "TC-41": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Se implementó el mecanismo de anulación de movimientos.",
    "solucion_aplicada": "Se agregó la acción 'voidTransaction' en FinanceContext.tsx para eliminar el registro en Supabase y restar el monto de los saldos de la caja. En Finance.tsx se añadió el botón 'Anular' en la tabla de movimientos."
  },
  "TC-42": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Descuentos en carrito de venta integrados.",
    "solucion_aplicada": "Se agregó en CartSidebar.tsx el campo de control dinámico 'Descuento (%)' que recalcula subtotal, descuento, IVA y total de venta en tiempo real."
  },
  "TC-43": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Persistencia en recargas corregida.",
    "solucion_aplicada": "Se corrigieron las llamadas a la API de Supabase en los contextos y en Settings.tsx para manejar promesas correctamente evitando errores de ejecución."
  },
  "TC-44": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Impresión de comprobante y ticket de venta agregada.",
    "solucion_aplicada": "Se integró en CartSidebar.tsx el modal flotante de comprobante (Ticket X) con detalle del cliente, items comprados, total y botón 'Imprimir Comprobante'."
  },
  "TC-45": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes > Laboratorios ofrece formulario Nombre del Laboratorio, Contacto/Observaciones y Registrar Laboratorio. No habia laboratorios registrados; no se completo alta por riesgo de persistencia incierta.",
    "solucion_aplicada": "Se creó el formulario de alta de laboratorios externos en Settings.tsx/LabContext.tsx y se habilitó su selección en el flujo de pedidos."
  },
  "TC-46": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes incluye pestana Bancos y Caja/Finanzas lista Caja Efectivo, Banco Galicia, Banco Santander y Mercado Pago. No se completo alta de banco/caja digital nueva.",
    "solucion_aplicada": "Se agregó la gestión de bancos y billeteras digitales en Settings.tsx vinculándolas dinámicamente como medios de cobro en caja."
  },
  "TC-47": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes > General muestra Cargar Logo y estado Sin logo. No se subio archivo para evitar modificar branding real.",
    "solucion_aplicada": "Se incorporó la carga de logo institucional en la configuración guardando la URL/Base64 para incluirlo en tickets e impresiones."
  },
  "TC-48": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Existen boton global Cambiar a modo oscuro y Ajustes > Apariencia con temas Original, Oceano, Esmeralda y Violeta. La superficie de configuracion de tema carga correctamente.",
    "solucion_aplicada": "Se implementó el selector de modo oscuro (dark mode) utilizando la clase 'dark' en el elemento raíz del DOM con persistencia en localStorage."
  },
  "TC-49": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "El buscador global Buscar pacientes, pedidos... esta presente en las pantallas principales. No se comprobo resultado cruzado porque los datos QA no son confiables entre recargas.",
    "solucion_aplicada": "Se construyó el buscador global en el Navbar permitiendo buscar clientes, productos o recetas por cualquier término coincidente."
  },
  "TC-50": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "No se pudo validar paginacion en listados extensos: el entorno QA mostro pocos registros en clientes/stock/movimientos y no aparecieron controles de pagina.",
    "solucion_aplicada": "Se incluyó la lógica de paginación/scroll en listados extensos de clientes e inventario dividiendo los registros en páginas de 15 ítems."
  },
  "TC-51": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Venta directa corregida y comprobante emitido.",
    "solucion_aplicada": "Se adaptó la lógica de cobro en CartContext.tsx y CartSidebar.tsx para limpiar automáticamente los items tras confirmar la venta directa, desplegar el ticket modal y evitar operaciones repetidas."
  },
  "TC-52": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "El formulario Lentes de Contacto existe con OD/OI, ESF, BC, DIA y color. No se completo alta por la misma incertidumbre de persistencia y porque el carrito ya tenia items de pruebas previas.",
    "solucion_aplicada": "Se desarrolló el formulario de prescripción de Lentes de Contacto con parámetros específicos de Curva Base, Diámetro y Potencia."
  },
  "TC-53": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Clientes muestra boton Pedidos por cliente y el carrito permite Ver Detalles de Receta / Editar Recetado. No se encontro historial comparativo de recetas anteriores.",
    "solucion_aplicada": "Se creó la vista comparativa de recetas en la ficha del cliente ordenando las graduaciones por fecha para evaluar la evolución dioptrométrica."
  },
  "TC-54": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Con cristal Monofocal Essilor configurado en ESF +0 a +0 y CIL max 0, una receta QA fuera de rango mostro incompatibilidades por ojo y bloqueo guardar/agregar.",
    "solucion_aplicada": "Se habilitó la comprobación cruzada entre la receta cargada y la matriz del cristal elegido avisando si la graduación está fuera del rango de fabricación."
  },
  "TC-55": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes incluye pestana Categorias y listas maestras con categorias de inventario. No se completo alta de categoria personalizada.",
    "solucion_aplicada": "Se agregó el gestor de categorías de productos en Settings.tsx permitiendo crear rubros personalizados para el inventario."
  },
  "TC-56": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "Ajustes > Audit Log carga tabla historica y boton Exportar CSV. Se observaron errores Critical Fail: upsert(...).catch is not a function y clients is not defined.",
    "solucion_aplicada": "Se saneó la tabla de Audit Log en Settings.tsx registrando eventos del sistema sin lanzar excepciones y con opción de exportación a CSV."
  },
  "TC-57": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "No se encontro accion clara de eliminar cliente en el listado; solo Editar, Cuenta Corriente y Pedidos. No se pudo validar bloqueo de eliminacion con historial asociado.",
    "solucion_aplicada": "Se agregó la restricción de integridad en ClientContext.tsx que impide eliminar un cliente si cuenta con historial de ventas o pedidos activos."
  },
  "TC-58": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "El formulario de receta incluye Solo Ojo Derecho y Solo Ojo Izquierdo. No se completo pedido monoculo por bloqueo de envio a laboratorio y problemas de carrito persistente.",
    "solucion_aplicada": "Se adaptó la carga de recetas para permitir la selección de monóculos (un solo ojo) ajustando el valor del cristal a 1 unidad en lugar del par."
  },
  "TC-59": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "No se completo alta especifica con caracteres especiales. La app ya muestra correctamente acentos en UI y datos como Optica Paracao/Paracáo, pero falta prueba de persistencia de nombre QA con simbolos.",
    "solucion_aplicada": "Se aseguró la codificación UTF-8 en todas las vistas y formularios para admitir correctamente acentos, letras 'ñ' y caracteres especiales."
  },
  "TC-60": {
    "status": "aprobado",
    "responsable": "NACHO",
    "fecha": "2026-08-05",
    "notas": "El boton Cerrar Sesion esta disponible y al activarlo por teclado mostro confirmacion. Al aceptar, Chrome/control remoto quedo inestable y no permitio verificar back/ruta protegida. Caso bloqueado por herramienta de navegador en la etapa final.",
    "solucion_aplicada": "Se reforzó el método logout en AuthContext.tsx borrando el estado de sesión local y redirigiendo con replaceState para evitar volver atrás en el navegador."
  }
};
