# Plan de Implementación: Manual de Usuario Exhaustivo para Óptica Paracao

Este plan define la estructura detallada y el enfoque para la redacción del **Manual de Usuario Completo** del sistema ERP/CRM de **Óptica Paracao**.

El manual se diseñará con un formato profesional, altamente estructurado y modular, asegurando que para cada sección se detallen:
1. **Objetivo del Módulo**: Para qué sirve dentro de la operación de la óptica.
2. **Explicación de Campos**: Definición clara y propósito de cada campo, botón y control del formulario/interfaz.
3. **Guía Paso a Paso**: Procedimientos claros de uso diario.
4. **Casos de Uso / Ejemplos**: Situaciones reales de atención o gestión administrativa.

---

## Estructura del Manual de Usuario

```
manual_usuario_optica_paracao/
├── 01_introduccion_y_navegacion.md
├── 02_panel_de_control_dashboard.md
├── 03_gestion_de_clientes_y_cc.md
├── 04_pedidos_y_recetas_opticas.md
├── 05_directorio_proveedores_compras_y_facturas.md
├── 06_control_de_stock_e_inventario.md
└── 07_finanzas_caja_y_conciliacion_bancaria.md
```

---

## Contenido Detallado por Módulos

### 1. Introducción y Navegación General
- **Objetivo**: Orientar al usuario en la interfaz general, roles y navegación del sistema.
- **Campos y Menús**:
  - Menú lateral (Navegación principal: Dashboard, Clientes, Pedidos, Stock, Proveedores, Finanzas).
  - Barra superior: Búsqueda global, perfil de usuario, alertas/notificaciones.
  - Botones de acción rápida en cabecera.

### 2. Panel de Control (Dashboard)
- **Objetivo**: Ofrecer una visión panorámica en tiempo real sobre el estado financiero y operativo del negocio.
- **Campos y Widgets**:
  - **KPI Ventas Diarias**: Sumatorio acumulado de ingresos del día.
  - **Pedidos Activos en Taller**: Contador de cristales/marcos en laboratorio.
  - **Saldos Pendientes de Cobro**: Total acumulado en Cuentas Corrientes de Clientes.
  - **Facturación Mensual**: Gráfico/indicador de meta de facturación.
  - **Accesos Rápidos**: Botones "Venta Rápida Directa", "Nuevo Pedido Clínico", "Arqueo Rápido".

### 3. Gestión de Clientes y Cuenta Corriente (C.C.)
- **Objetivo**: Administrar el legajo clínico y financiero de los pacientes/clientes.
- **Campos y Secciones**:
  - **Ficha del Cliente**:
    - `Nombre y Apellido` (Texto obligatorio).
    - `DNI / CUIT` (Identificador único para facturación y búsqueda).
    - `Teléfono / WhatsApp` (Contacto directo para avisos de retiro).
    - `Dirección` (Calle, Número, Piso, Depto).
    - `Obra Social / Cobertura` (Particular, OSDE, Swiss Medical, PAMI, etc.).
    - `Edad / Fecha de Nacimiento` (Cálculo automático de edad).
  - **Cuenta Corriente de Cliente**:
    - `Saldo Actual`: Verde (Favor/Anticipo), Rojo (Deuda pendiente).
    - `Tabla de Transacciones`: Fecha, comprobante, concepto, haber, debe, saldo resultante.
    - `Botón Emisión de Pago / Cobro`: Carga de señas o saldo de cuenta.
  - **Historial de Pedidos por Cliente**:
    - Listado cronológico de órdenes asociadas (ID de orden, estado, graduación breve, monto).

### 4. Gestión de Pedidos y Recetas Ópticas
- **Objetivo**: Registrar recetas médicas, calibrado de cristales y venta de productos de stock directo.
- **Campos y Secciones**:
  - **Venta No Recetados (Venta Rápida)**:
    - Selector de producto de stock (Accesorios, Líquidos, Lentes de Sol).
    - Cantidad, Precio Unitario, Descuentos, Forma de Pago.
  - **Nuevo Pedido Clínico (Receta)**:
    - **Monofocales / Multifocales**:
      - `Ojo Derecho (OD)` y `Ojo Izquierdo (OI)`:
        - `Esférico (Esf)`: Graduación dióptrica.
        - `Cilíndrico (Cil)`: Astigmatismo.
        - `Eje`: Grados (0° a 180°).
        - `Adición (Add)`: Presbicia.
        - `Distancia Pupilar (DP / DNP)`: Distancia en milímetros.
        - `Altura de Montaje`: Exclusivo multifocales (mm desde borde inferior).
    - **Lentes de Contacto**:
      - `Curva Base (CB)`, `Diámetro (DIA)`, `Tipo de Lente` (Blanda, Rígida/Gas Permeable, Torica, Multifocal).
    - **Estado del Trabajo**: `En Taller` ➔ `Para Retirar` ➔ `Completado`.

### 5. Proveedores, Compras y Facturas Pendientes
- **Objetivo**: Gestionar la cadena de suministros, compras de insumos y compromisos de pago.
- **Campos y Secciones**:
  - **Ficha de Proveedor**: `Código`, `Razón Social`, `CUIT`, `CBU Transferencia`, `Categoría Rubro`, `Condición Predeterminada`.
  - **Módulo de Carga de Compras**:
    - `Proveedor` (Desplegable).
    - `Tipo Comprobante` (Factura A/B/C, Nota de Débito, Nota de Crédito).
    - `N° Comprobante` (ej. 0001-00012345).
    - `Fecha Emisión` y `Fecha Vencimiento` (Límite de pago sin recargo).
    - `Condición de Pago` (Contado, 30 días, 60 días).
    - `Monto Total`.
  - **Tablero de Facturas Pendientes**:
    - Listado unificado de obligaciones sin Orden de Pago asociada, ordenadas por riesgo de vencimiento.

### 6. Control de Stock e Inventario
- **Objetivo**: Controlar las existencias físicas de armazones, cristales base, lentes de contacto y accesorios.
- **Campos y Secciones**:
  - `SKU / Código Interno`, `Descripción / Modelo`, `Marca / Distribuidor`, `Categoría`, `Precio Costo`, `Precio Venta Mostrador`, `Stock Actual`, `Stock Mínimo Alerta`.

### 7. Finanzas, Caja y Conciliación Bancaria
- **Objetivo**: Garantizar la integridad del dinero en efectivo y cuentas bancarias/digitales.
- **Campos y Secciones**:
  - **Arqueo de Caja Física**:
    - Apertura, Ingresos manuales, Egresos (gastos menores), Conteo de cierre y Diferencia de caja.
  - **Conciliación Bancaria Avanzada**:
    - `Selector de Cuenta / Banco` (ej: Santander, Mercado Pago).
    - `Filtro Desde / Hasta` (Rango de fechas del extracto).
    - `Monto Último Cierre` vs `Cierre Conciliación Actual` (Cálculo de variación).
    - `Gastos Bancarios` (Campo para asimilar impuestos/comisiones).
    - `Tildado Interactivo` (Verificación manual de movimientos contra el homebanking).

---

## Verificación y Formato de Entregables
- Los documentos se redactarán progresivamente en Markdown estructurado dentro del espacio de trabajo.
- Se incluirán llamadas informativas (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`) para destacar precauciones operativas.
