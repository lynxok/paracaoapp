# 6. Control de Stock e Inventario

---

## 6.1. Objetivo del Módulo

El módulo de **Control de Stock e Inventario** administra las existencias físicas de productos en la óptica. Su objetivo es mantener un catálogo preciso de artículos catalogados por SKU (armazones, lentes de sol, cristales base, lentes de contacto y productos de mantenimiento), alertar automáticamente ante quiebres de inventario (Stock Mínimo) y registrar ingresos masivos por recepción de mercadería de proveedores.

---

## 6.2. Estructura Visual del Inventario

La vista principal organiza los artículos en una tabla interactiva con búsqueda multicriterio y semáforos de reposición:

![Catálogo de Stock e Inventario de Óptica](C:\Users\ignac\.gemini\antigravity\brain\9f99944d-b71c-4d65-806d-6ba04436a813\manual_seccion6_ui_1785501007518.jpg)

---

## 6.3. Explicación Detallada de Campos del Fichero de Artículos

| Nombre del Campo | Propósito y Definición Técnica | Obligatorio |
| :--- | :--- | :--- |
| **SKU / Código Interno** | Código alfanumérico único para identificación de inventario y escaneo de barras. | **Sí** |
| **Descripción / Modelo** | Detalle del producto (ej. *Armazón Ray-Ban Aviator RB3025 Gold 58mm*). | **Sí** |
| **Marca / Distribuidor** | Nombre de la marca o fabricante emisor. | **Sí** |
| **Categoría / Tipo** | Clasificación (*Armazón Recetado, Lente de Sol, Lente de Contacto, Cristales Base, Líquidos/Accesorios*). | **Sí** |
| **Precio de Costo ($)** | Valor de compra al proveedor sin impuestos. | **Sí** |
| **Precio Mostrador ($)** | Valor final de venta al público en mostrador. | **Sí** |
| **Stock Actual** | Unidades disponibles físicamente en el local o depósito. | **Sí** |
| **Stock Mínimo Alerta** | Umbral de unidades límite que dispara la alerta de reposición urgente. | Recomendado |

---

## 6.4. Sistema de Alertas y Recepción de Mercadería

- **Semáforo de Reposición**:
  - 🟢 **Stock Óptimo**: Existencias por encima del stock mínimo fijado.
  - 🟡 **Stock Bajo**: Existencias igual al valor límite de alerta.
  - 🔴 **Sin Stock / Quiebre**: 0 unidades disponibles. El sistema bloquea ventas directas de ese SKU.
- **Módulo `[ Recepción de Mercadería ]`**: Permite cargar masivamente un paquete físico recibido de distribuidor incrementando de forma directa las cantidades en stock de múltiples SKUs y actualizando precios de costo.

---

## 6.5. Guía Paso a Paso: Operaciones de Inventario

### A. Alta de un Nuevo Armazón o Artículo
1. Ingrese a **Stock e Inventario** y presione **`[ + Nuevo Artículo ]`**.
2. Complete el **SKU**, la **Descripción**, la **Marca** y la **Categoría**.
3. Ingrese el **Precio Costo** y el **Precio Mostrador**.
4. Defina la cantidad de **Stock Inicial** y el **Stock Mínimo** deseado.
5. Presione **Guardar Producto**.

### B. Recepción de Paquete Fisico de Proveedor
1. Presione el botón **`[ Recepción de Mercadería ]`** en la cabecera del módulo.
2. Seleccione el **Proveedor** emisor del paquete.
3. Escanee o seleccione los SKUs recibidos e ingrese las unidades ingresantes.
4. Presione **Confirmar Ingreso a Depósito**. Las cantidades se sumarán automáticamente al catálogo.
