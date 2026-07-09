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

---

## 2. Configuración y Parámetros del Sistema (Ajustes)

El panel de **Ajustes (Settings)** permite parametrizar las variables del negocio para todas las sucursales.

### 2.1. Obras Sociales (Insurances)
* **Gestión:** Permite dar de alta y editar obras sociales (ej. OSDE, Swiss Medical, PAMI, IAPOS).
* **Reglas de Cobertura por Categoría:** Permite establecer montos fijos de cobertura según la categoría del producto (ej: cobertura de $5,000 en cristales monofocales).
* *Nota Técnica:* Al actualizar o crear una obra social, se invoca la función `updateInsurance` o `addInsurance` respectivamente, las cuales sincronizan el estado local con la base de datos a través de `SettingsContext`.

### 2.2. Datos de Facturación AFIP / ARCA
* Configuración del CUIT emisor, punto de venta por defecto de la sucursal, y subida del certificado digital (`.crt`) y clave privada (`.key`) necesarios para la firma electrónica del CAE.

### 2.3. Parámetros Generales de Diseño
* **Apariencia:** Elección del tema visual de la aplicación.
* **PDF Constructor:** Ajuste de posición de logos, márgenes y paletas de colores en los presupuestos y facturas impresas.

---

## 3. Marketing, Automatización y Fidelización

El módulo de **Marketing y Automatización** está diseñado para aumentar la tasa de recompra utilizando canales digitales (WhatsApp / Email).

### 3.1. Campañas de Automatización
* **Disparadores (Triggers):** Configuración de envíos automáticos basados en eventos temporales (ej: 12 meses después de la compra de un monofocal, o 6 meses para lentes de contacto).
* **WhatsApp Direct:** Abre una ventana de chat directo con el paciente enlazando una plantilla preconfigurada con datos de su última compra y graduación visual.
* **Tasa de Retención:** El sistema analiza la base de datos comparando los clientes recurrentes frente a los clientes de compra única para calcular el KPI de fidelidad:
  $$\text{Tasa de Retención} = \frac{\text{Clientes con Múltiples Pedidos}}{\text{Clientes Totales}} \times 100$$
  *Nota de Corrección:* Este cálculo utiliza `Object.values(clientOrderCounts)` casteado de manera segura a `number[]` para filtrar a los clientes recurrentes (`count > 1`) sin generar advertencias de tipado en TypeScript.

---

## 4. Procedimientos de Mantenimiento de Código y Despliegues

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
