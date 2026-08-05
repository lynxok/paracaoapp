# 5. Proveedores, Compras y Facturas Pendientes

---

## 5.1. Objetivo del Módulo

El módulo de **Proveedores y Compras** gestiona la relación comercial con los distribuidores de armazones, cristales base, lentes de contacto y productos de insumos. Su objetivo es mantener actualizado el legajo de proveedores, ingresar facturas comerciales de compra, impactar deudas en sus Cuentas Corrientes y monitorear la agenda de **Facturas Pendientes de Pago** para evitar mora o interrupción de créditos.

---

## 5.2. Estructura Visual del Módulo de Proveedores y Compras

El panel de compras consolida las obligaciones comerciales de la empresa con alertas de vencimiento:

![Tablero de Proveedores, Compras y Facturas Pendientes](C:\Users\ignac\.gemini\antigravity\brain\9f99944d-b71c-4d65-806d-6ba04436a813\manual_seccion5_ui_1785509987750.jpg)

---

## 5.3. Explicación Detallada de Campos

### A. Ficha de Proveedor

| Nombre del Campo | Propósito y Explicación |
| :--- | :--- |
| **Código Interno** | Identificador alfanumérico para catalogar distribuidores. |
| **Razón Social / Nombre** | Nombre comercial o firma legal del proveedor (ej. *Essilor Argentina S.A.*). |
| **CUIT** | Clave Única de Identificación Tributaria para comprobantes oficiales. |
| **CBU / Alias Transferencia**| Datos bancarios directos para efectuar Órdenes de Pago desde Tesorería. |
| **Rubro / Categoría** | Clasificación del proveedor (*Cristales, Armazones, Lentes de Contacto, Accesorios*). |
| **Condición Predeterminada** | Acuerdo de financiamiento marco (*Contado, 30 días, 60 días*). |

### B. Formulario de Carga de Compras (Facturas)

- **`Proveedor`**: Selección del distribuidor emisor.
- **`Tipo de Comprobante`**: Factura A, B, C, Nota de Débito o Nota de Crédito.
- **`Número de Comprobante`**: Código numérico del comprobante (ej: `FC-A-0001-00124233`).
- **`Fecha de Emisión`**: Fecha en que se generó la compra.
- **`Fecha de Vencimiento`**: Día límite exacto para saldar la factura sin recargo.
- **`Condición de Pago`**: Financiamiento aplicado al comprobante específico (ej. *30 días fecha factura*).
- **`Monto Total ($)`**: Importe final facturado que sumará a la Cuenta Corriente de Proveedores.

---

## 5.4. Tablero de Facturas Pendientes y Órdenes de Pago

En la pestaña **Facturas Pendientes**, Tesorería dispone de un control cronológico unificado:

- **Tarjeta de Deuda Total Consolidada**: Suma acumulada en pesos de todos los comprobantes pendientes de pago de todos los proveedores.
- **Alertas de Vencimiento**:
  - 🟢 **En término**: Facturas con fecha de vencimiento a más de 7 días.
  - 🟡 **Próximo a vencer**: Facturas que vencen en los próximos 3 a 7 días.
  - 🔴 **Vencida**: Comprobantes cuya fecha límite ha expirado.
- **Botón `[ Pagar Factura ]`**: Genera la Orden de Pago, deduce el saldo de la caja/banco seleccionado y cancela la obligación en la Cuenta Corriente del proveedor.

---

## 5.5. Guía Paso a Paso: Registración de Compras y Pago

### A. Registrar una Compra e Impactar la Deuda Comercial
1. Vaya al menú **Proveedores & Compras** y seleccione la pestaña **Compras**.
2. Haga clic en **`[ + Cargar Nueva Compra ]`**.
3. Seleccione el **Proveedor** (ej. *Bausch & Lomb*).
4. Transcriba el **N° de Comprobante**, la **Fecha de Emisión** y la **Fecha de Vencimiento**.
5. Coloque el **Monto Total** del comprobante.
6. Presione **Confirmar Impacto en C.C.**. La deuda se actualizará en la ficha del proveedor.

### B. Saludar una Factura desde Facturas Pendientes
1. En el módulo Proveedores, haga clic en la pestaña táctil **Facturas Pendientes** (en rojo).
2. Localice la factura a abonar ordenada por fecha de vencimiento.
3. En la fila de la transacción, haga clic en **Pagar Factura**.
4. Seleccione la **Cuenta Bancaria** o **Caja** desde donde saldrán los fondos.
5. Ingrese el número de transferencia u orden de pago y confirme la operación.
