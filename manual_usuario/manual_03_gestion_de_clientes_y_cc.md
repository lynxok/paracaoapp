# 3. Gestión de Clientes y Cuentas Corrientes (C.C.)

---

## 3.1. Objetivo del Módulo

El módulo de **Gestión de Clientes** funciona como la Ficha Integral de Pacientes/Clientes y CRM de la óptica. Su objetivo es mantener centralizada toda la información personal, historial de graduaciones médicas, registros de compras y el balance financiero individual (Cuenta Corriente) de cada cliente para brindar un servicio personalizado y un control de cobros riguroso.

---

## 3.2. Estructura Visual de la Ficha de Clientes

La pantalla principal de clientes presenta una tabla organizada con búsqueda rápida por DNI o Nombre, mostrando el saldo corriente y accesos a sus fichas:

![Gestión de Clientes y Tabla de Cuentas Corrientes](C:\Users\ignac\.gemini\antigravity\brain\9f99944d-b71c-4d65-806d-6ba04436a813\manual_seccion3_ui_1785509953265.jpg)

---

## 3.3. Explicación Detallada de Campos y Formulario de Cliente

Al dar de alta o editar un cliente, se completan los siguientes campos:

### A. Datos Personales y de Contacto

| Nombre del Campo | Tipo de Dato | Propósito y Definición | Obligatorio |
| :--- | :--- | :--- | :--- |
| **Nombre y Apellido** | Texto libre | Identificación completa del paciente/cliente. | **Sí** |
| **DNI / CUIT** | Numérico | Documento de identidad único. Sirve como clave principal para evitar duplicados y emitir comprobantes de venta. | **Sí** |
| **Teléfono / WhatsApp**| Teléfono | Número de contacto directo. Se utiliza para notificar vía SMS o WhatsApp cuando el encargo está listo para retirar. | Recomendado |
| **Email** | Correo electr. | Dirección para envío de facturas electrónicas y recordatorios de recetas. | Opcional |
| **Dirección (Calle, N°)**| Texto libre | Domicilio del cliente (Calle, Número, Piso, Departamento). | Opcional |
| **Obra Social / Cobertura**| Desplegable | Entidad de cobertura médica del cliente (ej: *Particular, OSDE, Swiss Medical, PAMI, IAPOS*). Esencial para aplicar convenios y descuentos. | **Sí** |
| **Fecha de Nacimiento** | Fecha | Permite el cálculo automático de la edad del paciente para adecuar la sugerencia de multifocales o lentes de contacto. | Recomendado |

---

## 3.4. Estructura y Funcionamiento de la Cuenta Corriente (C.C.)

Cada cliente posee una pestaña de **Cuenta Corriente** que consolida su historial financiero con la óptica.

```
┌────────────────────────────────────────────────────────────────────────┐
│  CLIENTE: Juan Pérez (DNI 30.123.456)                                  │
│  SALDO ACTUAL: -$15,000 (Deuda Pendiente - Indicador Rojo)             │
├────────────────────────────────────────────────────────────────────────┤
│ FECHA      │ CONCEPTO             │ DEBE (+)   │ HABER (-)  │ SALDO    │
├────────────┼──────────────────────┼────────────┼────────────┼──────────┤
│ 10/05/2026 │ Seña Pedido ORD-102  │ -          │ $20,000    │ -$15,000 │
│ 10/05/2026 │ Cargo Pedido ORD-102 │ $35,000    │ -          │ -$35,000 │
└────────────┴──────────────────────┴────────────┴────────────┴──────────┘
```

### Campos del Tablero de Cuenta Corriente:
- **`Saldo Actual`**:
  - **Verde ($0.00 o positivo)**: El cliente no debe dinero o tiene saldo a favor (anticipo).
  - **Rojo (valor negativo)**: Indica el monto exacto que el cliente debe saldar antes o durante el retiro de su pedido.
- **`Columna Debe`**: Importes correspondientes a compras o encargos de cristales imputados a su cuenta.
- **`Columna Haber`**: Pagos, señas o entregas en efectivo/transferencia realizadas por el cliente.
- **`Botón Asentar Pago / Cobro`**: Despliega el formulario para registrar una nueva entrada de dinero a favor de la cuenta corriente.

---

## 3.5. Guía Paso a Paso: Operaciones Frecuentes con Clientes

### A. Modificar Datos de un Cliente Existente
1. Vaya al menú lateral y seleccione **Clientes & C.C.**.
2. En la barra de búsqueda superior, ingrese el **DNI** o **Nombre** del cliente.
3. En la fila correspondiente, haga clic en el botón de edición **`[ Lápiz Azul ]`**.
4. Actualice los datos necesarios (ej: cambio de teléfono o dirección).
5. Presione **Confirmar Cambios**.

### B. Consultar el Historial de Pedidos Realizados
1. En la fila del cliente, haga clic en el botón **`[ Ver Pedidos / Paquete Morado ]`**.
2. Se desplegará la lista cronológica de todos los encargos realizados por el paciente.
3. Cada registro muestra: N° de Orden, Tipo de Cristal, Estado de Taller (`En Taller`, `Para Retirar`, `Completado`) y Balance de Pago.
4. Haga clic en **`[ Ver Detalle ]`** sobre un pedido para consultar la receta y graduación histórica de los cristales.

### C. Registración de Cobro / Cancelación de Saldo Pendiente
1. En la lista de clientes, haga clic en **`[ Cuenta Corriente / Ticket Verde ]`**.
2. Verifique el **Saldo Actual** (en rojo).
3. Haga clic en **Registrar Pago**.
4. Ingrese el **Monto a Abonar**, el **Medio de Pago** (Efectivo, Tarjeta de Débito/Crédito, Transferencia Bancaria) y la **Caja de Destino**.
5. Haga clic en **Confirmar Pago**. El saldo de la cuenta corriente se actualizará de inmediato y el movimiento ingresará al arqueo de caja del día.
