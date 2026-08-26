# Manual de Procedimiento - Óptica Paracao (ERP/CRM)

Este manual detalla los procedimientos operativos y el funcionamiento técnico de los distintos módulos integrados en el sistema **Óptica Paracao / Lynx Contable**. 

---

## 1. Módulos y Funciones del Sistema

El sistema es una plataforma integral de tipo ERP/CRM diseñada específicamente para la administración de ópticas, integrando la parte clínica (recetas y pedidos) con la administrativa (proveedores, stock) y la financiera (cajas, bancos y cuentas corrientes).

### 1.1. Panel de Control (Dashboard)
* **Indicadores Clave (KPIs):** Visualización en tiempo real de ventas diarias, pedidos activos en taller, saldos pendientes y nivel de facturación.
* **Accesos Rápidos:** Botones de acceso directo para iniciar ventas rápidas (productos no recetados), cargar recetas clínicas o realizar arqueos rápidos de caja.

### 1.2. Gestión de Clientes y Cuenta Corriente
* **Ficha Integral:** Registro de datos personales, DNI, teléfono, obra social y edad calculada automáticamente.
* **Cuenta Corriente (C.C.):** Panel individual por cliente que consolida el saldo histórico (saldos a favor o deudas). Permite registrar cobros y emitir recibos de pago.
* **Historial Clínico/Pedidos:** Listado cronológico de trabajos realizados (Monofocales, Multifocales, Contacto, etc.), con su graduación técnica, estado en taller y estado de pago.

### 1.3. Directorio de Proveedores y Módulo de Compras
* **Ficha de Proveedor:** Registro de CUIT, CBU, rubro y condiciones de pago predeterminadas (Contado, 30 días, etc.).
* **Carga de Compras:** Registro de facturas o notas de crédito que incrementan la deuda en la Cuenta Corriente de Proveedores.
* **Facturas Pendientes:** Tablero central que agrupa las obligaciones próximas a vencer para organizar el cronograma de pagos.

### 1.4. Gestión de Pedidos y Recetas
* **Monofocales y Multifocales:** Carga técnica de esferas, cilindros, ejes, adiciones, distancias pupilares, altura y tipo de pasillo.
* **Lentes de Contacto:** Registro de curva base, diámetro y tipo de lente (blanda, gas permeable, etc.).
* **Seguimiento (Taller):** Flujo de estados: `En Taller` ──> `Para Retirar` ──> `Completado`.

### 1.5. Control de Stock e Inventario
* **Existencias:** Control detallado de SKUs categorizados en armazones, cristales base, lentes de sol, lentes de contacto, líquidos y accesorios.
* **Recepción de Mercadería:** Actualización rápida de stock al recibir pedidos de distribuidores.

### 1.6. Finanzas, Caja y Conciliación Bancaria
* **Cajas Físicas:** Registro de ingresos y egresos de efectivo ("Caja Chica" y "Caja Principal") con arqueo al cierre de jornada.
* **Conciliación Bancaria:** Módulo interactivo de tildado manual de transacciones del homebanking contra los registros del sistema, controlando diferencias de cierres e imputando gastos bancarios/comisiones.

### 1.7. Gestión y Control de Cheques (NUEVO MÓDULO)
* **Trazabilidad Integral:** Panel interactivo bajo Finanzas > pestaña "Cheques" que consolida todos los cheques emitidos (pagos a proveedores) y recibidos (cobros a clientes).
* **Estados y KPIs:** Agrupación visual en cuatro estados clave:
  * **Pendientes:** Cheques activos esperando fecha de vencimiento para ser cobrados/debitados.
  * **Próximos a vencer:** Cheques con vencimiento dentro de los próximos 7 días (alerta amarilla).
  * **Vencidos:** Cheques que han superado su fecha de cobro sin ser acreditados (alerta roja).
  * **Cobrados:** Cheques que ya han sido liquidados e impactados en la caja bancaria.
* **Acreditación Manual:** Permite seleccionar el cheque y definir en qué Caja o Banco ingresa (o de cuál se debita) el importe correspondiente, registrando la transacción financiera en caja de forma automática.
* **Banners de Alerta Temprana:** Alertas dinámicas visibles tanto en la parte superior del Dashboard de Inicio como en el módulo de Finanzas en caso de existir cheques que requieran atención inmediata (vencidos o a vencer).

---

## 2. Configuración y Parámetros del Sistema (Ajustes)

El panel de **Ajustes (Settings)** permite parametrizar las variables del negocio para todas las sucursales.

### 2.1. Obras Sociales (Insurances)
* **Gestión:** Permite dar de alta y editar obras sociales (ej. OSDE, Swiss Medical, PAMI, IAPOS).
* **Reglas de Cobertura por Categoría:** Permite establecer montos fijos de cobertura según la categoría del producto (ej: cobertura de $5,000 en cristales monofocales).
* *Nota Técnica:* Al actualizar o crear una obra social, se invoca la función `updateInsurance` o `addInsurance` respectivamente, las cuales sincronizan el estado local con la base de datos a través de `SettingsContext`.

### 2.2. Datos de Facturación AFIP / ARCA
* Configuración del CUIT emisor, punto de venta por defecto de la sucursal, y subida del certificado digital (`.crt`) y clave privada (`.key`) necesarios para la firma electrónica del CAE.

### 2.3. Parámetros de Cheques Emitidos
* **Próximo Nº de Cheque a Emitir:** Control numérico editable en Ajustes > General que define el número sugerido por defecto al crear un nuevo cheque en el módulo de compras. El sistema autoincrementará este número secuencialmente de forma automática cada vez que se agregue un cheque, permitiendo modificarlo si se cambia de chequera.

### 2.4. Parámetros Generales de Diseño
* **Apariencia:** Elección del tema visual de la aplicación.
* **PDF Constructor:** Ajuste de posición de logos, márgenes y paletas de colores en los presupuestos y facturas impresas.

---

## 3. Procedimientos Operativos Clave (Guía Paso a Paso)

### 3.1. Carga de Comprobante de Proveedor con Pagos Mixtos y Cheques
1. Diríjase a **Ajustes > Proveedores** o al panel de compras. Abra el modal **"Cargar Comprobante"**.
2. Complete los datos de la factura: Tipo (Factura o Pago), Fecha, Nº de Comprobante, Monto de la factura, Condición de pago y Vencimiento.
3. En la sección **"Distribución de Pago"**, impute el monto en los medios deseados:
   * **Efectivo:** Escriba el monto y elija la Caja de Efectivo de salida.
   * **Transferencia:** Escriba el monto y elija el Banco de salida.
   * **Tarjeta:** Escriba el monto y elija la Caja Tarjeta de salida.
   * **Cuenta Corriente (Deuda):** Monto remanente que se registrará como saldo deudor con el proveedor.
   * **Agregar Cheque:** Haga clic en "+ Agregar Cheque". El sistema autocompletará el campo con el próximo número correlativo configurado. Complete el Banco, Importe, Plazo (30, 60, 90, 120 días), Fecha de vencimiento y nota opcional. Presione "Confirmar Agregar Cheque". Puede añadir múltiples cheques.
4. **Validación:** El sistema mostrará un cuadro resumen en color negro con el total de la factura, los montos imputados y la **Diferencia**.
5. **Impacto:** Si la diferencia no es exactamente `$0.00`, el botón "Confirmar Impacto en C.C." se bloqueará para prevenir errores de imputación. Al confirmar, el sistema restará automáticamente de las cajas correspondientes las salidas en efectivo/transferencia/tarjeta, y dará de alta los cheques emitidos en estado `Pendiente`.

### 3.2. Venta con Señas (Pago Parcial)
1. Agregue productos al carrito y abra el **Sidebar del Carrito**.
2. Seleccione el cliente. Active la casilla **"Registrar Seña / Pago Parcial"**.
3. Ingrese el monto de la seña (el sistema indicará inmediatamente el saldo que quedará deudor).
4. Indique en la sección inferior la Caja donde ingresará la seña (Método de Pago) y seleccione en la lista la **Caja prevista para cobrar el saldo restante**.
5. Presione "Confirmar Venta". El sistema registrará el pedido con el pago parcial imputado de forma proporcional entre los productos del carrito, y guardará las referencias de las cajas asociadas.

### 3.3. Cobro de Saldo Deudor de Pedidos
1. Vaya al módulo de **Clientes**. Busque al paciente y abra el modal **"Historial de Compras"**.
2. Identifique el pedido impago. Se mostrará una tarjeta detallada con el total, la seña abonada, y el **Saldo Restante** (resaltado en color naranja).
3. Presione el botón **"Cobrar Saldo"**.
4. En el modal emergente, ingrese el importe a cobrar (por defecto el total del saldo pendiente) y seleccione la Caja/Banco donde ingresará el dinero.
5. Al hacer clic en "Registrar Cobro", el saldo se cancelará en la base de datos y se registrará un Ingreso en la caja elegida de forma automática.

### 3.4. Regla de Bloqueo en Taller (Laboratorio)
* Al intentar cambiar el estado de un trabajo de taller a `"Enviado al laboratorio"` o `"En producción"` (o al darlo de alta manualmente), el sistema verificará el saldo del pedido correspondiente.
* Si el pedido tiene un monto abonado igual o menor a cero (`paid <= 0`), el taller **bloqueará la acción** de forma automática y mostrará el mensaje en pantalla: 
  > *“Para enviar el pedido al laboratorio debés registrar una seña o completar el pago total”*

---

## 4. Marketing, Automatización y Fidelización

El módulo de **Marketing y Automatización** está diseñado para aumentar la tasa de recompra utilizando canales digitales (WhatsApp / Email).

### 4.1. Campañas de Automatización
* **Disparadores (Triggers):** Configuración de envíos automáticos basados en eventos temporales (ej: 12 meses después de la compra de un monofocal, o 6 meses para lentes de contacto).
* **WhatsApp Direct:** Abre una ventana de chat directo con el paciente enlazando una plantilla preconfigurada con datos de su última compra y graduación visual.
* **Tasa de Retención:** El sistema analiza la base de datos comparando los clientes recurrentes frente a los clientes de compra única para calcular el KPI de fidelidad:
  $$\text{Tasa de Retención} = \frac{\text{Clientes con Múltiples Pedidos}}{\text{Clientes Totales}} \times 100$$
  *Nota de Corrección:* Este cálculo utiliza `Object.values(clientOrderCounts)` casteado de manera segura a `number[]` para filtrar a los clientes recurrentes (`count > 1`) sin generar advertencias de tipado en TypeScript.

---

## 5. Procedimientos de Mantenimiento de Código y Despliegues

Para asegurar la estabilidad técnica del sistema, cada actualización de versión debe seguir el siguiente flujo de trabajo:

1. **Corrección de Errores de Tipado:** Asegurar que todo el código TSX pase el validador estático de tipos ejecutando:
   ```bash
   cmd /c npm run lint
   ```
2. **Generación de Build de Producción:** Compilar el código fuente mediante Vite para generar la carpeta de distribución optimizada:
   ```bash
   cmd /c npm run build
   ```
3. **Respaldo de Versiones Anteriores (dist):**
   * Antes/durante la actualización, la compilación de `dist` debe respaldarse en la carpeta local `/Versiones anteriores/` bajo una subcarpeta identificada con la fecha y versión (ej. `Versiones anteriores/dist_YYYYMMDD_HHMM`).
   * La carpeta `Versiones anteriores/` está configurada en `.gitignore` para evitar la subida de compilaciones pesadas y binarios al repositorio Git.
4. **Subida de Cambios a GitHub:**
   * Validar que solo los archivos fuente modificados se encuentren en la zona de preparación (staged) mediante `git status`.
   * Realizar el commit de versión describiendo las correcciones y ejecutar `git push` a la rama principal.
