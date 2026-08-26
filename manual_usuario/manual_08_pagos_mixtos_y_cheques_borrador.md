# 8. Pagos Mixtos y Gestión de Cheques

> **Estado:** Borrador para aprobación. Este documento describe el módulo adicional de pagos a proveedores y cheques. Una vez aprobado, se incorporará al Manual de Usuario completo.

---

## 8.1. Objetivo del módulo

El módulo permite registrar un comprobante de proveedor con uno o varios medios de pago, incluyendo **efectivo, transferencia, tarjeta y múltiples cheques**. También centraliza el seguimiento de los cheques emitidos, sus vencimientos y su estado de cobro.

Con esta funcionalidad, cada pago queda distribuido correctamente entre Caja, Banco, Tarjeta y Cheques, y el sistema evita confirmar operaciones cuyos importes no coincidan con el total del comprobante.

---

## 8.2. Conceptos clave

| Concepto | Descripción |
| --- | --- |
| **Pago mixto** | Pago compuesto por más de un medio: por ejemplo, efectivo más cheques. |
| **Cheque emitido** | Cheque entregado a un proveedor como parte de un pago. |
| **Total imputado** | Suma de todos los importes ingresados para el comprobante. |
| **Diferencia** | Resultado de `Total de la factura - Total imputado`. Debe ser exactamente `$0` para confirmar. |
| **Cuenta corriente / deuda** | Importe de una factura que queda pendiente con el proveedor; se utiliza al cargar una Factura/Débito. |

---

## 8.3. Configurar la correlatividad de cheques

Antes de emitir el primer cheque, se debe configurar el número inicial de la chequera.

1. Ingrese a **Configuración**.
2. Busque el campo **Próximo N.º de Cheque a Emitir**.
3. Ingrese el próximo número disponible de la chequera, usando solo números. Por ejemplo: `1001`.
4. Guarde la configuración.

Al seleccionar **+ Agregar cheque** en un pago a proveedor, el sistema sugerirá automáticamente ese número. Al confirmar el cheque, la configuración avanzará al número siguiente.

> **Importante:** controle que la correlatividad coincida con la chequera física. Si se saltea, anula o reemplaza un cheque, actualice el próximo número antes de realizar una nueva emisión.

---

## 8.4. Cargar un comprobante con pago mixto

1. Ingrese a **Proveedores**.
2. Abra el proveedor correspondiente o utilice la pestaña **Compras**.
3. Seleccione **Cargar comprobante**.
4. Indique el tipo de operación:
   - **Factura / Débito** para registrar una obligación del proveedor.
   - **Pago / Crédito** para registrar una cancelación o crédito.
5. Complete la **Fecha**, el **N.º de comprobante** y el **Monto de factura**.
6. Si corresponde, complete la **Condición de pago** y el **Vencimiento** general del comprobante.
7. En **Distribución de pago**, ingrese los importes que se abonarán por cada medio:
   - Efectivo y su caja de origen.
   - Transferencia y su banco o billetera de origen.
   - Tarjeta y su caja de tarjeta.
   - Cheques emitidos.
8. Revise el resumen de totales al final del formulario.
9. Cuando la **Diferencia** sea `$0`, presione **Confirmar impacto en C.C.**

### Ejemplo de pago mixto

Para una factura de `$1.000.000` se puede registrar:

- Efectivo: `$300.000`.
- Cheque a 30 días: `$400.000`.
- Cheque a 60 días: `$300.000`.

El total imputado será `$1.000.000` y la diferencia será `$0`. En ese momento el sistema permitirá confirmar la operación.

---

## 8.5. Agregar uno o más cheques

Dentro de **Distribución de pago**, utilice la sección **Cheques emitidos**.

1. Seleccione **+ Agregar cheque**.
2. Complete los siguientes campos:
   - **N.º de cheque**.
   - **Banco**.
   - **Importe**.
   - **Plazo**: 30, 60, 90 o 120 días.
   - **Vencimiento**.
   - **Observación** (opcional).
3. Presione **Confirmar agregar cheque**.
4. El cheque se incorporará a la lista de cheques del comprobante.
5. Repita el procedimiento para cada cheque adicional.

Antes de confirmar el comprobante, puede quitar un cheque de la lista mediante el botón de eliminación ubicado a su derecha.

> **Importante:** cada cheque se controla de manera individual. Por eso, aunque varios cheques formen parte de una única factura, cada uno debe contar con su propio número, banco, importe y vencimiento.

---

## 8.6. Validación obligatoria de importes

El sistema muestra en tiempo real:

- Total de la factura.
- Efectivo.
- Transferencia.
- Tarjeta.
- Cheques.
- Cuenta corriente / deuda, cuando se carga una Factura/Débito.
- Total imputado.
- Diferencia.

La operación solo se puede confirmar si la diferencia es exactamente `$0`.

### Qué valida el sistema

- La suma de efectivo, transferencias, tarjetas, cheques y, si corresponde, deuda en cuenta corriente debe coincidir con el total del comprobante.
- No se puede confirmar un pago si el total imputado es menor al total del comprobante.
- No se puede confirmar un pago si el total imputado supera el total del comprobante.
- No se puede agregar un cheque sin número, banco o importe mayor a cero.

Si utiliza únicamente cheques, la suma de todos ellos debe ser igual al importe total del comprobante.

---

## 8.7. Impacto automático de la operación

Al confirmar un comprobante correctamente distribuido:

- El efectivo genera un egreso en la caja seleccionada.
- La transferencia genera un egreso en el banco o billetera seleccionada.
- La tarjeta genera un egreso en la caja de tarjeta seleccionada.
- Cada cheque se registra en el módulo **Finanzas > Cheques** como cheque **Emitido** y **Pendiente**.
- El comprobante queda asociado al proveedor y a su cuenta corriente.

---

## 8.8. Consultar y gestionar cheques

1. Ingrese a **Finanzas**.
2. Seleccione la pestaña **Cheques**.
3. Utilice el buscador para localizar un cheque por número, banco, proveedor o cliente.
4. Use los filtros de estado para consultar cheques **Pendientes**, **Cobrados**, **Rechazados** o **Anulados**.

La grilla informa para cada cheque:

- N.º de cheque.
- Banco.
- Importe.
- Fecha de vencimiento.
- Plazo.
- Tipo: emitido o recibido.
- Proveedor o cliente relacionado.
- Estado y observación, si existe.

### Cambiar el estado de un cheque

Para un cheque pendiente se encuentran disponibles estas acciones:

- **Acreditar:** seleccione la caja o banco de destino y confirme el cobro/acreditación.
- **Rechazar:** marque el cheque como rechazado cuando no pueda cobrarse.
- **Anular:** marque el cheque como anulado cuando la operación se deje sin efecto.

---

## 8.9. Alertas de vencimiento

El sistema controla automáticamente los cheques en estado pendiente.

| Estado visual | Criterio |
| --- | --- |
| **Pendiente** | El vencimiento se encuentra a más de 7 días. |
| **A vencer** | El vencimiento ocurrirá dentro de los próximos 7 días. |
| **Vencido** | La fecha de vencimiento ya pasó. |
| **Cobrado** | El cheque fue acreditado o cobrado. |
| **Rechazado / Anulado** | El cheque fue marcado con dicho estado. |

Cuando existan cheques vencidos o próximos a vencer, el **Panel de control** y la pantalla de **Finanzas** mostrarán una alerta con la cantidad de cheques que requieren atención. Desde el botón **Gestionar cheques** se accede directamente a la pestaña correspondiente.

---

## 8.10. Buenas prácticas operativas

- Cargue un cheque por cada documento físico entregado o recibido; no agrupe varios cheques en un único registro.
- Configure y verifique el próximo número de cheque antes de comenzar a emitir desde una nueva chequera.
- Verifique número, banco, importe y fecha de vencimiento antes de confirmar.
- Utilice la observación para identificar una condición especial o referencia acordada con el proveedor.
- Controle la pestaña **Cheques** al inicio de cada jornada y antes de programar pagos.
- No anule ni rechace un cheque si todavía puede acreditarse: primero confirme su situación bancaria.
- Ante una diferencia distinta de `$0`, revise todos los medios de pago antes de modificar el monto de la factura.

---

## 8.11. Preguntas frecuentes

### ¿Puedo pagar una factura con efectivo y varios cheques?

Sí. Ingrese el monto en efectivo y agregue cada cheque por separado. El sistema permitirá confirmar cuando la suma coincida con el total de la factura.

### ¿Puedo cargar cheques con vencimientos distintos?

Sí. Cada cheque tiene su propio plazo y fecha de vencimiento. Por ejemplo, puede cargar un cheque a 30 días y otro a 60 días en el mismo comprobante.

### ¿Por qué no puedo confirmar el comprobante?

Porque el total imputado no coincide con el monto de la factura. Revise el campo **Diferencia**: debe mostrar `$0`.

### ¿Cómo sé qué cheques vencen pronto?

Revise la alerta del Panel de control o ingrese a **Finanzas > Cheques**. Los cheques que vencen en los próximos 7 días se identifican como **A vencer**.

### ¿Cómo se controla la correlatividad de los cheques?

En **Configuración**, defina el campo **Próximo N.º de Cheque a Emitir** con el próximo número libre de la chequera. El sistema lo propone al cargar un nuevo cheque y, al confirmarlo, avanza al siguiente número.
