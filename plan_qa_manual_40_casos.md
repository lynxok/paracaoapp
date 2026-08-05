# 📋 Plan de QA Manual — Óptica Paracao
### Suite Completa de 40 Casos de Prueba (Manual Testing)
**URL del sistema:** https://opticagestionparacao.lnx.com.ar  
**Versión:** 1.0 | **Fecha:** 2026-07-29  
**Preparado por:** Equipo QA

---

## ℹ️ Cómo usar este documento

Para cada caso:
1. **Ejecutar los pasos en orden**
2. **Comparar el resultado obtenido con el resultado esperado**
3. **Marcar el estado**: ✅ APROBADO | ❌ FALLIDO | ⚠️ ADVERTENCIA
4. **Si falla, anotar en Observaciones** qué ocurrió exactamente

---
---

## 🟦 BLOQUE A: AUTENTICACIÓN Y ACCESO

---

### TC-01 — Login con Credenciales Válidas
**Módulo:** Autenticación  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Abrir https://opticagestionparacao.lnx.com.ar | Se muestra la pantalla de login con campos de Email, Contraseña y Sucursal |
| 2 | Ingresar email: `astudillajuansimon@gmail.com` | El campo acepta el texto sin errores |
| 3 | Ingresar contraseña: `juansimon` | La contraseña se muestra oculta con asteriscos |
| 4 | Seleccionar una Sucursal del desplegable | La sucursal se selecciona correctamente |
| 5 | Hacer clic en "Iniciar Sesión" | El sistema redirige al Dashboard sin errores |
| 6 | Verificar que el Dashboard muestre métricas y el menú lateral | El Dashboard carga con todos sus elementos visibles |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-02 — Login con Contraseña Incorrecta
**Módulo:** Autenticación  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Abrir la pantalla de login | Se muestra la pantalla de login |
| 2 | Ingresar email válido: `astudillajuansimon@gmail.com` | Se acepta el email |
| 3 | Ingresar contraseña INCORRECTA: `clavemaluscrita` | El campo acepta el texto |
| 4 | Hacer clic en "Iniciar Sesión" | El sistema muestra un mensaje de error claro ("Credenciales inválidas" o similar) |
| 5 | Verificar que NO se acceda al sistema | El usuario permanece en la pantalla de login |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-03 — Navegación Completa por el Menú Lateral
**Módulo:** Navegación General  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Iniciar sesión correctamente | Se visualiza el Dashboard |
| 2 | Hacer clic en "Clientes" en el menú | Se carga la lista de clientes sin errores ni pantalla en blanco |
| 3 | Hacer clic en "Inventario" | Se carga la tabla de inventario de productos |
| 4 | Hacer clic en "Trabajos / Taller" | Se muestra el listado de trabajos de laboratorio |
| 5 | Hacer clic en "Caja / Ventas" | Se muestra el módulo de caja o punto de venta |
| 6 | Hacer clic en "Métricas" | Se visualizan los gráficos y estadísticas |
| 7 | Hacer clic en "Configuración" | Se abre la pantalla de ajustes del sistema |
| 8 | Hacer clic en el logo o "Dashboard" | Se regresa al panel principal |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE B: GESTIÓN DE CLIENTES

---

### TC-04 — Alta de Cliente con Todos los Datos
**Módulo:** Clientes  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a la sección "Clientes" | Se visualiza el listado de clientes |
| 2 | Hacer clic en "Nuevo Cliente" o el botón "+" | Se abre el formulario/modal de alta de cliente |
| 3 | Completar Nombre: `María García` | El campo acepta el texto |
| 4 | Completar DNI: `30.555.777` | El campo acepta el DNI |
| 5 | Completar Teléfono: `343-4123456` | El campo acepta el teléfono |
| 6 | Completar Email: `mariagarcia@email.com` | El campo acepta el email |
| 7 | Completar Fecha de Nacimiento: `15/03/1985` | El campo calcula la edad automáticamente |
| 8 | Completar Dirección: `Av. Rivadavia 1234` | El campo acepta la dirección |
| 9 | Hacer clic en "Guardar" | El modal se cierra y el cliente aparece en el listado |
| 10 | Buscar `María García` en el buscador | El cliente recién creado aparece en los resultados |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-05 — Alta de Cliente con DNI Duplicado
**Módulo:** Clientes  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Clientes" → "Nuevo Cliente" | Se abre el formulario |
| 2 | Ingresar el mismo DNI de un cliente ya existente (ej. el de TC-04: `30.555.777`) | El campo acepta el valor |
| 3 | Completar el resto de los datos con nombres distintos | Los demás campos se completan |
| 4 | Hacer clic en "Guardar" | El sistema muestra una advertencia de DNI duplicado o crea igualmente (anotar cuál ocurre) |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-06 — Búsqueda de Cliente por DNI
**Módulo:** Clientes  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a la sección "Clientes" | Se visualiza el buscador |
| 2 | Escribir `30555777` en la barra de búsqueda | La lista se filtra en tiempo real mientras se escribe |
| 3 | Verificar que el cliente "María García" aparece en los resultados | El cliente se muestra en la tabla filtrada |
| 4 | Borrar el texto del buscador | La lista vuelve a mostrar todos los clientes |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-07 — Edición de Datos de un Cliente
**Módulo:** Clientes  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Buscar el cliente "María García" creado en TC-04 | El cliente aparece en la lista |
| 2 | Hacer clic en el botón de editar (lápiz/ícono de edición) de ese cliente | Se abre el formulario precargado con los datos del cliente |
| 3 | Modificar el teléfono a `343-9999888` | El campo se actualiza |
| 4 | Hacer clic en "Guardar" | El modal se cierra y el teléfono se actualiza en el listado |
| 5 | Buscar nuevamente al cliente y verificar el teléfono nuevo | Se muestra el teléfono `343-9999888` |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-08 — Asignación de Obra Social a un Cliente
**Módulo:** Clientes  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Buscar el cliente "María García" y entrar a su edición | Se abre el formulario con sus datos |
| 2 | Localizar el campo "Obra Social / Seguro" | El campo muestra las obras sociales disponibles |
| 3 | Seleccionar una obra social existente (ej. PAMI o OSDE) | La obra social queda asignada al cliente |
| 4 | Guardar los cambios | El cliente queda vinculado a la mutua |
| 5 | Ir a Nueva Orden / Receta y buscar a "María García" | En el listado de clientes del buscador aparece un badge azul con el nombre de la obra social |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-09 — Vista de Historial de Compras de un Cliente
**Módulo:** Clientes  
**Prioridad:** 🟢 MEDIA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Buscar un cliente con historial (o el creado en TC-04) | El cliente aparece en la lista |
| 2 | Hacer clic en el ícono de historial u órdenes del cliente | Se abre un modal o panel con el historial de compras/trabajos |
| 3 | Verificar que las compras previas aparecen listadas con fecha y monto | Se visualizan los movimientos históricos |
| 4 | Cerrar el modal de historial | El modal se cierra sin errores |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-10 — Cobro de Seña / Pago Parcial en Cuenta Corriente
**Módulo:** Clientes / Cuenta Corriente  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Buscar un cliente con saldo deudor en cuenta corriente | El cliente aparece con saldo en deuda |
| 2 | Hacer clic en el botón de "Cobrar" o "Recibo" de ese cliente | Se abre el modal de registro de pago |
| 3 | Ingresar el monto parcial: `5000` | El campo acepta el monto |
| 4 | Seleccionar el medio de pago: "Efectivo" | La opción se selecciona |
| 5 | Seleccionar la caja de destino | La caja se selecciona |
| 6 | Hacer clic en "Emitir Recibo" o "Confirmar Pago" | El pago se registra y el saldo de la cuenta corriente disminuye en $5.000 |
| 7 | Verificar que se genera un recibo imprimible | Se abre la ventana de impresión del recibo |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE C: INVENTARIO Y STOCK

---

### TC-11 — Alta de Nuevo Producto con Precio Positivo
**Módulo:** Inventario  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Inventario" | Se visualiza la tabla de productos |
| 2 | Hacer clic en "Añadir Nuevo" | Se abre el modal de producto |
| 3 | Nombre: `Armazón QA Pro` | Campo acepta texto |
| 4 | SKU: `QA-001` | Campo acepta código |
| 5 | Categoría: `Armazones` (del desplegable) | La categoría se selecciona |
| 6 | Stock Casa Central: `10` | Se ingresa el número |
| 7 | Stock Shopping: `5` | Se ingresa el número |
| 8 | Stock Crítico: `3` | Se ingresa el número |
| 9 | Precio de Compra: `8000` | Se ingresa el costo |
| 10 | Precio de Venta: `20000` | Se ingresa el precio de venta |
| 11 | Hacer clic en "Guardar Producto" | El modal se cierra y el artículo aparece en la tabla de inventario |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-12 — Bloqueo de Precio Negativo en Inventario
**Módulo:** Inventario / Validaciones  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Inventario" → "Añadir Nuevo" | Se abre el modal |
| 2 | Completar todos los campos correctamente | Datos cargados |
| 3 | En "Precio de Venta" ingresar: `-1500` | El campo acepta el número |
| 4 | Hacer clic en "Guardar Producto" | El sistema muestra una alerta: *"El precio de venta y el precio de compra no pueden ser valores negativos"* |
| 5 | Verificar que el producto NO se guarda en la tabla | El modal permanece abierto; no se crea el artículo |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-13 — Ingreso de Mercadería (Aumento de Stock)
**Módulo:** Inventario / Stock  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Inventario" → hacer clic en "Ingreso de Mercadería" (botón superior) | Se abre el modal de ingreso de stock |
| 2 | Seleccionar la sucursal destino: `Casa Central` | La sucursal queda seleccionada |
| 3 | Seleccionar el producto: `Armazón QA Pro` (creado en TC-11) | El producto se selecciona |
| 4 | Ingresar cantidad: `20` | Campo acepta el número |
| 5 | Ingresar Precio de Compra (costo): `8500` | Campo acepta el precio |
| 6 | (Opcional) Ingresar Proveedor: `Proveedor QA` | Campo acepta texto |
| 7 | Hacer clic en "Registrar Ingreso" | El stock del producto en Casa Central aumenta en 20 unidades |
| 8 | Verificar el nuevo total de stock en la tabla | El stock refleja la suma de la cantidad anterior + 20 |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-14 — Egreso de Stock por Venta / Rotura
**Módulo:** Inventario / Movimientos  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | En "Inventario", hacer clic derecho sobre el producto `Armazón QA Pro` | Se abre el menú contextual con opciones de acciones |
| 2 | Seleccionar "Registrar Egreso" o "Salida de Stock" | Se abre el modal de egreso |
| 3 | Seleccionar sucursal: `Casa Central` | La sucursal se selecciona |
| 4 | Ingresar cantidad: `3` | Campo acepta el número |
| 5 | Seleccionar motivo: `Rotura` (o el disponible) | El motivo queda asignado |
| 6 | Hacer clic en "Confirmar Egreso" | El stock en Casa Central disminuye en 3 unidades |
| 7 | Ir a la pestaña "Movimientos" del inventario | El movimiento de egreso aparece registrado en el historial |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-15 — Transferencia de Stock entre Sucursales
**Módulo:** Inventario / Multi-Sucursal  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | En "Inventario", hacer clic derecho sobre `Armazón QA Pro` | Se abre el menú contextual |
| 2 | Seleccionar "Mover Stock" o "Transferir" | Se abre el modal de transferencia |
| 3 | Sucursal Origen: `Casa Central` | Se selecciona |
| 4 | Sucursal Destino: `Shopping` | Se selecciona |
| 5 | Cantidad: `5` | Campo acepta el número |
| 6 | Hacer clic en "Confirmar Transferencia" | La transferencia se registra: Casa Central -5, Shopping +5 |
| 7 | Verificar haciendo clic en el stock total del producto (ver popover por sucursal) | Cada sucursal refleja el stock correcto post-transferencia |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-16 — Intento de Transferencia con Stock Insuficiente
**Módulo:** Inventario / Validaciones  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Abrir el modal de "Mover Stock" para cualquier producto | Se abre el modal |
| 2 | Seleccionar una sucursal con stock = 0 como origen | La sucursal queda seleccionada |
| 3 | Ingresar una cantidad mayor a 0 (ej. `10`) | El campo acepta el número |
| 4 | Hacer clic en "Confirmar Transferencia" | El sistema muestra una alerta de stock insuficiente con la cantidad disponible |
| 5 | Verificar que el stock no se modifica | El stock de ambas sucursales permanece igual |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-17 — Búsqueda y Filtrado en Inventario
**Módulo:** Inventario / Filtros  
**Prioridad:** 🟢 MEDIA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Inventario" | Se visualiza la tabla de productos |
| 2 | Escribir `QA` en el buscador de la tabla | La tabla filtra y muestra solo `Armazón QA Pro` |
| 3 | Cambiar el filtro de categoría a `Cristales` | La tabla muestra solo productos de esa categoría |
| 4 | Cambiar el filtro de sucursal a `Shopping` | El stock mostrado en cada fila corresponde al de la sucursal Shopping |
| 5 | Limpiar todos los filtros | La tabla vuelve a mostrar todos los productos |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-18 — Eliminación de un Producto del Inventario
**Módulo:** Inventario  
**Prioridad:** 🟢 MEDIA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a la sección "Productos" (pestaña superior) del módulo de Inventario | Se visualiza la tabla de catálogo de productos |
| 2 | Localizar el producto `Armazón QA Pro` | El producto está visible |
| 3 | Hacer clic en el ícono de eliminar (basura/trash) de ese producto | Aparece una ventana de confirmación |
| 4 | Confirmar la eliminación | El producto desaparece de la tabla |
| 5 | Buscar `QA-001` en el buscador | No se encuentran resultados (el producto fue eliminado) |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE D: NUEVA RECETA / ORDEN DE LABORATORIO

---

### TC-19 — Alta de Receta Monofocal Completa
**Módulo:** Nueva Orden / Receta  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Desde el menú, ir a "Nueva Orden" o "Nueva Receta" y seleccionar tipo "Monofocal" | Se muestra el formulario de receta monofocal |
| 2 | Asociar el cliente "María García" (buscarlo por DNI o nombre) | El cliente se vincula y sus datos se autocompletan |
| 3 | OD Lejos Esférico: `+1.50` | Campo acepta el valor |
| 4 | OD Lejos Cilíndrico: `-0.50` | Campo acepta el valor |
| 5 | OD Lejos Eje: `90` | Campo acepta el valor |
| 6 | OI Lejos Esférico: `+1.00` | Campo acepta el valor |
| 7 | OI Lejos Cilíndrico: `0.00` | Campo acepta el valor |
| 8 | OI Lejos Eje: `0` | Campo acepta el valor |
| 9 | DNP: `62` | Campo acepta el valor |
| 10 | Seleccionar un tipo de cristal del desplegable | El cristal queda asignado |
| 11 | Seleccionar un armazón (opcional) haciendo clic en "Buscar Marco" | Se elige un marco del inventario |
| 12 | Verificar que el total de la orden se calcula automáticamente | El subtotal muestra la suma correcta |
| 13 | Hacer clic en "Agregar al Carrito" o "Confirmar" | La orden se agrega sin errores |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-20 — Advertencia de Dioptrías Fuera de Rango
**Módulo:** Nueva Orden / Validaciones  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Nueva Orden" → Tipo "Monofocal" | Se muestra el formulario |
| 2 | En OD Lejos Esférico ingresar: `+35.00` | El campo acepta el valor sin error inmediato |
| 3 | Hacer clic en "Agregar al Carrito" o "Confirmar" | El sistema muestra una alerta: *"Una o más dioptrías ingresadas exceden el rango habitual (±30.00). ¿Deseas continuar de todos modos?"* |
| 4 | Hacer clic en "Cancelar" en la alerta | La orden NO se agrega y se permanece en el formulario |
| 5 | Corregir el valor a `+3.50` y hacer clic en "Confirmar" | La orden se agrega sin más alertas de rango |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-21 — Alta de Receta Multifocal
**Módulo:** Nueva Orden / Multifocal  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Nueva Orden" y seleccionar tipo "Multifocal" | Se muestra el formulario multifocal (Lejos, Cerca y Adición) |
| 2 | Cargar gradación para Lejos (OD y OI) | Los campos de la sección Lejos se completan |
| 3 | Cargar gradación para Cerca (OD y OI) | Los campos de la sección Cerca se completan |
| 4 | Ingresar Adición OD: `+2.00` y OI: `+2.25` | Los campos aceptan los valores |
| 5 | Seleccionar un cristal multifocal | El cristal se selecciona y el precio base se muestra |
| 6 | Verificar que el sistema valide las dioptrías contra el rango del cristal | Si algún valor excede el rango, aparece una advertencia visible |
| 7 | Confirmar y agregar al carrito | La orden multifocal se agrega correctamente |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-22 — Receta con Cobertura de Obra Social
**Módulo:** Nueva Orden / Obras Sociales  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Nueva Orden" → Tipo "Monofocal" | Se muestra el formulario |
| 2 | Asociar al cliente "María García" (quien tiene obra social asignada desde TC-08) | El cliente se vincula y se muestra el badge de su Obra Social |
| 3 | Verificar que debajo del campo del cliente aparezca la obra social destacada (ej. "PAMI") | El indicador de cobertura es visible |
| 4 | Seleccionar un cristal y un armazón | El subtotal se calcula |
| 5 | Verificar en el resumen del pedido que la cobertura de la obra social se descuenta automáticamente | El total final = Subtotal - Cobertura de la mutua |
| 6 | Confirmar el pedido | Se agrega al carrito con el precio correcto |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-23 — Envío de Pedido a Laboratorio Externo
**Módulo:** Nueva Orden / Laboratorio  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Crear una nueva receta y completar los datos de graduación | Formulario completo |
| 2 | Buscar el botón "Enviar a Laboratorio" o "Lab" en el formulario | El botón está visible |
| 3 | Hacer clic en él | Se abre el modal de selección de laboratorio |
| 4 | Seleccionar un laboratorio de la lista | El laboratorio se selecciona |
| 5 | Ingresar la fecha de entrega prometida | El campo acepta la fecha |
| 6 | Hacer clic en "Enviar" o "Asignar Lab" | El laboratorio queda asignado y se muestra en el resumen del pedido |
| 7 | (Opcional) Hacer clic en "Imprimir Tarjeta de Laboratorio" | Se abre una ventana con la orden de lab lista para imprimir |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE E: TALLER / TRABAJOS

---

### TC-24 — Visualización del Listado de Trabajos en Taller
**Módulo:** Taller / Trabajos  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a la sección "Trabajos" o "Taller" desde el menú | Se muestra el listado de órdenes de trabajo |
| 2 | Verificar que cada trabajo muestra: cliente, tipo, estado y fecha de entrega | Los datos de cada fila son legibles y completos |
| 3 | Probar el filtro por estado (ej. filtrar solo "Pendientes") | La lista se filtra y muestra solo los trabajos pendientes |
| 4 | Probar búsqueda por nombre de cliente | La lista filtra en tiempo real |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-25 — Cambio de Estado de un Trabajo (Flujo Completo)
**Módulo:** Taller / Estados  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Localizar un trabajo en estado `Pendiente` | Se visualiza el trabajo |
| 2 | Cambiar su estado a `En Taller` (botón o desplegable de estado) | El estado se actualiza a "En Taller" y el badge cambia de color |
| 3 | Cambiar su estado a `Listo` | El estado se actualiza a "Listo" |
| 4 | Cambiar su estado a `Entregado` | El estado se actualiza a "Entregado" y el trabajo puede pasar al historial |
| 5 | Verificar que en cada cambio se registra la fecha de modificación | Las marcas de tiempo son correctas |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-26 — Impresión de Orden de Taller / Tarjeta de Laboratorio
**Módulo:** Taller / Impresión  
**Prioridad:** 🟢 MEDIA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Localizar un trabajo con laboratorio asignado | El trabajo es visible en la lista |
| 2 | Hacer clic en el ícono de impresora o "Imprimir Tarjeta" | Se abre una ventana de preview de impresión |
| 3 | Verificar que el documento muestra: nombre del cliente, graduación, laboratorio y fecha de entrega | Todos los datos están correctamente impresionados en el PDF |
| 4 | Cerrar la ventana de impresión | Se cierra sin errores |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE F: CAJA, VENTAS Y TESORERÍA

---

### TC-27 — Registro de una Venta Completa (Pago en Efectivo)
**Módulo:** Caja / Ventas  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Tener una receta o producto en el carrito (agregar desde Nueva Orden si no hay) | El carrito muestra la orden |
| 2 | Abrir el carrito o ir a la pantalla de cierre/venta | Se muestra el resumen del pedido con total |
| 3 | Seleccionar medio de pago: `Efectivo` | La opción se selecciona |
| 4 | Seleccionar la caja de destino: `Caja Efectivo` | La caja se selecciona |
| 5 | Ingresar el monto recibido del cliente (ej. `25000`) | El campo acepta el valor |
| 6 | Verificar que el sistema calcule el cambio/vuelto | El vuelto se muestra correctamente |
| 7 | Hacer clic en "Confirmar Venta" | La venta se registra y el carrito se vacía |
| 8 | Verificar que el movimiento aparece en el historial de la caja | La transacción es visible en Caja |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-28 — Registro de Venta con Pago por Transferencia
**Módulo:** Caja / Ventas  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Tener un pedido en el carrito | Carrito no vacío |
| 2 | Seleccionar medio de pago: `Transferencia Bancaria` | La opción se selecciona |
| 3 | Seleccionar banco de destino correspondiente | El banco se selecciona |
| 4 | Confirmar la venta | La venta se registra en la caja bancaria/digital, no en la caja de efectivo |
| 5 | Ir al historial de caja y verificar que el movimiento está en la caja correcta | La transacción aparece en la caja bancaria |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-29 — Registro de Gasto Operativo en Caja
**Módulo:** Caja / Egresos  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a la sección "Caja" | Se muestra el balance y los movimientos |
| 2 | Buscar el botón "Registrar Gasto" o "Nuevo Egreso" | El botón es visible y clickeable |
| 3 | Seleccionar concepto: `Servicios (Luz, Gas, etc.)` | El concepto se selecciona |
| 4 | Ingresar monto: `8500` | El campo acepta el valor |
| 5 | Ingresar descripción: `Factura de luz - Julio` | El campo acepta el texto |
| 6 | Seleccionar la caja de egreso: `Caja Efectivo` | La caja se selecciona |
| 7 | Confirmar el gasto | El egreso se registra y el saldo de la caja disminuye en $8.500 |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-30 — Verificación del Saldo de Caja en Tiempo Real
**Módulo:** Caja / Saldo  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Anotar el saldo actual de la caja efectivo ANTES de realizar movimientos | Saldo inicial anotado |
| 2 | Registrar una venta de `$10.000` en efectivo | La venta se registra |
| 3 | Registrar un gasto de `$2.000` en efectivo | El gasto se registra |
| 4 | Verificar el saldo final de la caja | Saldo final = Saldo inicial + $10.000 - $2.000 |
| 5 | El saldo en pantalla coincide con el cálculo esperado | ✅ El sistema es consistente |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE G: MÉTRICAS Y REPORTES

---

### TC-31 — Visualización del Dashboard de Métricas
**Módulo:** Métricas  
**Prioridad:** 🟢 MEDIA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a la sección "Métricas" | Se carga la página con gráficos |
| 2 | Verificar que se muestran indicadores: Ventas del mes, Trabajos activos, Clientes nuevos | Los KPIs son visibles y tienen valores numéricos |
| 3 | Cambiar el rango de fechas del filtro (ej. último trimestre) | Los gráficos se actualizan con los datos del período seleccionado |
| 4 | Verificar que los números coinciden con las ventas y gastos registrados en la sesión | Los datos de Caja/Ventas se reflejan en las métricas |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-32 — Ranking de Productos Más Vendidos
**Módulo:** Métricas / Reportes  
**Prioridad:** 🟢 MEDIA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Métricas" | Se visualizan los reportes disponibles |
| 2 | Localizar el informe de "Productos más vendidos" o similar | El reporte es accesible |
| 3 | Verificar que los productos tienen nombre, cantidad vendida y monto total | Los datos son completos |
| 4 | Aplicar filtro por rango de fechas de la semana actual | Los resultados se actualizan correctamente |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE H: CONFIGURACIÓN DEL SISTEMA

---

### TC-33 — Edición de Datos Generales de la Óptica
**Módulo:** Configuración / General  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Configuración" → pestaña "General" | Se muestran los datos de la óptica |
| 2 | Modificar el campo "Nombre Comercial" | El campo acepta el cambio |
| 3 | Modificar el campo "Teléfono" | El campo acepta el cambio |
| 4 | Modificar el campo "Dirección" | El campo acepta el cambio |
| 5 | Hacer clic en "Guardar" | Los cambios se guardan y la pantalla confirma el éxito |
| 6 | Actualizar la página (F5) y volver a Configuración | Los datos modificados persisten correctamente |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-34 — Gestión de Obras Sociales (Alta, Edición, Cobertura)
**Módulo:** Configuración / Obras Sociales  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Configuración" → pestaña "Obras Sociales" | Se muestra la lista de mutuas configuradas |
| 2 | Hacer clic en "Nueva Obra Social" o "+" | Se abre el modal de alta |
| 3 | Nombre: `IOMA Test QA` | Campo acepta el texto |
| 4 | Cobertura para "Cristales": `3000` (pesos) | El campo acepta el monto |
| 5 | Cobertura para "Armazones": `1500` | El campo acepta el monto |
| 6 | Guardar la obra social | Aparece en el listado de obras sociales |
| 7 | Editar la cobertura de "Cristales" a `4000` | El campo se actualiza |
| 8 | Verificar que la cobertura actualizada se aplica en una nueva orden de un cliente con esa mutua | El descuento es de $4.000 en cristales |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-35 — Gestión de Usuarios y Permisos
**Módulo:** Configuración / Usuarios  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Configuración" → pestaña "Usuarios" | Se muestra el listado de usuarios del sistema |
| 2 | Verificar que se muestra el nombre, email y rol de cada usuario | Los datos son visibles |
| 3 | Hacer clic en "Nuevo Usuario" o "+" | Se abre el formulario de alta |
| 4 | Completar Nombre: `Tester QA`, Email: `testerqa@optica.com`, Rol: `Vendedor` | Los campos aceptan los datos |
| 5 | Guardar el usuario | El usuario aparece en la lista |
| 6 | Ir a "Permisos" y verificar qué accesos tiene el rol "Vendedor" | Se visualizan los módulos habilitados y restringidos por rol |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-36 — Alta de Cristal en la Tabla de Cristales
**Módulo:** Configuración / Cristales  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Configuración" → pestaña "Tabla de Cristales" | Se muestra el catálogo de cristales |
| 2 | Hacer clic en "Nuevo Cristal" | Se abre el modal de alta |
| 3 | Completar: Marca `QA Brand`, Tipo `Monofocal`, Material `Orgánico`, Índice `1.50` | Los campos aceptan los valores |
| 4 | Precio base: `8000`, Rango Esférico Mín: `-8.00`, Máx: `+8.00` | Los rangos se configuran |
| 5 | Guardar el cristal | Aparece en la tabla de cristales |
| 6 | Ir a "Nueva Orden" y verificar que el cristal `QA Brand` aparece disponible en el desplegable | El cristal se puede seleccionar |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE I: SEGURIDAD Y BORDE

---

### TC-37 — Sanitización de Entradas Maliciosas (XSS)
**Módulo:** Seguridad  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Clientes" → "Nuevo Cliente" | Se abre el formulario |
| 2 | En el campo "Nombre" escribir: `<script>alert('XSS')</script>` | El campo acepta el texto visualmente |
| 3 | Guardar el cliente | El sistema guarda el nombre como texto plano sin ejecutar el script |
| 4 | Buscar al cliente en el listado | El nombre se muestra como texto literal: `<script>alert...` sin ejecutar código |
| 5 | Verificar que no hay ningún popup de alerta en ningún momento | No se ejecuta ningún código JavaScript externo |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-38 — Intento de Acceso a Rutas Sin Autenticación
**Módulo:** Seguridad / Rutas  
**Prioridad:** 🔴 CRÍTICA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Cerrar sesión completamente en el sistema | La sesión se cierra y se muestra la pantalla de login |
| 2 | Intentar acceder directamente a `/clients` escribiendo la URL | El sistema redirige automáticamente al login |
| 3 | Intentar acceder a `/inventory` sin sesión | El sistema redirige al login |
| 4 | Intentar acceder a `/settings` sin sesión | El sistema redirige al login |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 🟦 BLOQUE J: CASOS DE BORDE Y RENDIMIENTO

---

### TC-39 — Comportamiento con Campos Vacíos / Validaciones de Formulario
**Módulo:** Validaciones Generales  
**Prioridad:** 🟡 ALTA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Ir a "Clientes" → "Nuevo Cliente" | Se abre el formulario |
| 2 | Dejar todos los campos vacíos | Sin datos ingresados |
| 3 | Hacer clic en "Guardar" | El sistema muestra validación de campos requeridos sin cerrar el modal |
| 4 | Verificar que se indica cuáles campos son obligatorios | Los campos requeridos se destacan (borde rojo, mensaje, etc.) |
| 5 | Repetir en el formulario de Inventario → "Añadir Nuevo" con campos vacíos | El mismo comportamiento de validación |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---

### TC-40 — Responsive Design y Usabilidad en Pantalla Reducida
**Módulo:** UX / Responsive  
**Prioridad:** 🟢 MEDIA

| # | Paso | Resultado Esperado |
|---|---|---|
| 1 | Abrir el sistema en un navegador de escritorio | Se visualiza correctamente en ancho completo |
| 2 | Reducir la ventana del navegador al 50% del ancho (o usar DevTools → Toggle Device) | El layout se adapta sin desbordamientos |
| 3 | Simular pantalla de tablet (768px) | Los menús y tablas son utilizables; aparece menú hamburguesa si aplica |
| 4 | Simular pantalla de celular (375px) | Los formularios y botones son accesibles sin scroll horizontal innecesario |
| 5 | Probar la pantalla de login en vista móvil | El formulario de login es completamente usable en mobile |

**Estado:** ☐ APROBADO | ☐ FALLIDO | ☐ ADVERTENCIA  
**Observaciones:** ___________________________________________

---
---

## 📊 Hoja de Resultados — Resumen del Equipo QA

| ID | Caso de Prueba | Responsable | Estado | Fecha | Observaciones |
|---|---|---|---|---|---|
| TC-01 | Login con Credenciales Válidas | | ☐ | | |
| TC-02 | Login con Contraseña Incorrecta | | ☐ | | |
| TC-03 | Navegación Completa | | ☐ | | |
| TC-04 | Alta de Cliente Completo | | ☐ | | |
| TC-05 | DNI Duplicado | | ☐ | | |
| TC-06 | Búsqueda por DNI | | ☐ | | |
| TC-07 | Edición de Cliente | | ☐ | | |
| TC-08 | Asignación de Obra Social | | ☐ | | |
| TC-09 | Historial de Compras | | ☐ | | |
| TC-10 | Pago Parcial / Seña | | ☐ | | |
| TC-11 | Alta Producto Inventario | | ☐ | | |
| TC-12 | Bloqueo Precio Negativo | | ☐ | | |
| TC-13 | Ingreso de Mercadería | | ☐ | | |
| TC-14 | Egreso de Stock | | ☐ | | |
| TC-15 | Transferencia entre Sucursales | | ☐ | | |
| TC-16 | Stock Insuficiente | | ☐ | | |
| TC-17 | Búsqueda y Filtros Inventario | | ☐ | | |
| TC-18 | Eliminación de Producto | | ☐ | | |
| TC-19 | Receta Monofocal Completa | | ☐ | | |
| TC-20 | Advertencia Dioptrías Fuera de Rango | | ☐ | | |
| TC-21 | Receta Multifocal | | ☐ | | |
| TC-22 | Receta con Cobertura Obra Social | | ☐ | | |
| TC-23 | Envío a Laboratorio Externo | | ☐ | | |
| TC-24 | Visualización Trabajos en Taller | | ☐ | | |
| TC-25 | Cambio de Estado de Trabajo | | ☐ | | |
| TC-26 | Impresión Tarjeta de Laboratorio | | ☐ | | |
| TC-27 | Venta en Efectivo | | ☐ | | |
| TC-28 | Venta por Transferencia | | ☐ | | |
| TC-29 | Registro de Gasto Operativo | | ☐ | | |
| TC-30 | Verificación Saldo en Tiempo Real | | ☐ | | |
| TC-31 | Dashboard de Métricas | | ☐ | | |
| TC-32 | Ranking Productos Más Vendidos | | ☐ | | |
| TC-33 | Edición Datos de la Óptica | | ☐ | | |
| TC-34 | Gestión de Obras Sociales | | ☐ | | |
| TC-35 | Gestión de Usuarios y Permisos | | ☐ | | |
| TC-36 | Alta de Cristal en Tabla | | ☐ | | |
| TC-37 | Sanitización XSS | | ☐ | | |
| TC-38 | Acceso Sin Autenticación | | ☐ | | |
| TC-39 | Validaciones con Campos Vacíos | | ☐ | | |
| TC-40 | Responsive y UX Móvil | | ☐ | | |

---
*Documento generado automáticamente por Antigravity AI · Sesión QA 2026-07-29*
