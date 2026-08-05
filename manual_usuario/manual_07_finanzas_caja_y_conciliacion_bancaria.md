# 7. Finanzas, Caja y Conciliación Bancaria

---

## 7.1. Objetivo del Módulo

El módulo de **Finanzas, Caja y Conciliación Bancaria** es el centro de control financiero del negocio. Su objetivo es garantizar la coincidencia exacta entre el dinero registrado en el software y las existencias reales, tanto en cajas físicas de efectivo (Arqueos diarios) como en cuentas bancarias o billeteras digitales (Conciliación interactiva contra extractos oficiales de homebanking).

---

## 7.2. Estructura Visual del Módulo de Conciliación Bancaria

La interfaz de conciliación avanzada divide los controles en parámetros de extracto y tildado interactivo de movimientos:

![Pantalla de Conciliación Bancaria y Audito de Cajas](C:\Users\ignac\.gemini\antigravity\brain\9f99944d-b71c-4d65-806d-6ba04436a813\manual_seccion7_ui_1785510022426.jpg)

---

## 7.3. Explicación Detallada de Módulos y Campos

### A. Arqueo de Caja Física (Caja Chica / Caja Principal)

- **Saldo de Apertura**: Monto inicial de efectivo disponible en billetes al abrir el turno.
- **Ingresos del Día**: Sumatorio automático de cobros de mostrador y señas asentadas en efectivo.
- **Egresos Manuales**: Salidas de dinero por compras menores autorizadas (ej. papelería, limpieza) detallando concepto.
- **Saldo Teórico**: Cálculo automático (`Apertura + Ingresos - Egresos`).
- **Conteo Físico Real**: Casilla para transcribir la suma final de billetes contados a mano en el cajón.
- **Diferencia de Caja**: Muestra en verde ($0 balance perfecto) o rojo la variación detectada.

### B. Conciliación Bancaria Avanzada (Campos de Control)

| Nombre del Campo | Propósito y Explicación Técnica |
| :--- | :--- |
| **1. Selector de Banco / Cuenta** | Desplegable para elegir la entidad a conciliar (*Santander, Galicia, Mercado Pago*). |
| **2. Filtro Rango Desde - Hasta**| Selector de fechas exactas correspondiente al periodo de auditoría del extracto bancario PDF. |
| **Monto Último Cierre ($)** | Saldo final consolidado recuperado automáticamente de la última conciliación cerrada. |
| **Cierre Conciliación Actual ($)**| Casilla para ingresar el saldo final exacto impreso al pie del extracto de Homebanking. |
| **Diferencia de Cierres ($)** | Cálculo en tiempo real que indica si las cuentas están equilibradas. |
| **Gastos Bancarios ($)** | Campo directo para imputar comisiones, mantenimiento de cuenta o sellados sin descuadrar cobros. |
| **Tildado Interactivo (`[✓]`)** | Casillas táctiles al lado de cada movimiento registrado en el sistema para marcar concordancia con el extracto físico. |

---

## 7.4. Guía Paso a Paso: Procedimiento de Conciliación Bancaria

1. Vaya a **Finanzas & Caja** y haga clic en la pestaña **Conciliación**.
2. En **1. Seleccionar Banco/Cuenta**, elija la cuenta bancaria o billetera virtual que desea auditar.
3. Defina las fechas en los campos **Desde** y **Hasta** coincidiendo con el periodo de su extracto oficial.
4. Transcriba el saldo de cierre que figura en su extracto oficial en la casilla **Cierre conciliación actual**.
5. Si el banco le cobró mantenimiento o comisiones, ingrese dicho monto en la casilla **Gastos Bancarios**.
6. Compare renglón por renglón su extracto oficial contra la tabla de movimientos en pantalla. Por cada movimiento coincidente, haga clic en el casillero de **Tildado (`[✓]`)**.
7. Verifique que el indicador **Diferencia de Cierres** llegue a **`$0.00`**.
8. Haga clic en **Cerrar y Guardar Conciliación**. El periodo quedará auditado y protegido contra modificaciones.
