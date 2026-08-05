---
category: Concept
tags: [optica-paracao, ux, manual, tutorial, react, html-animation]
updated: 2026-08-05
---

# Optica Paracao - Manual Guiado Animado

## Objetivo

Transformar el actual **Modo Manual Interactivo Vivo** de [[system_optica_paracao]] en un sistema de tutoriales guiados por tarea, con explicaciones paso a paso y animaciones HTML que simulen visualmente cada flujo de trabajo.

## Contexto Actual

La aplicacion de produccion `https://opticagestionparacao.lnx.com.ar` ya tiene:

- Boton **Modo Manual** en la barra superior.
- Seccion **Ayuda y Soporte** (`/help`).
- Articulos de ayuda por categorias: clinica, configuracion, administracion, finanzas, facturacion y soporte.
- Un overlay actual llamado **Modo Manual Interactivo Vivo (Activo)**.
- El modo actual funciona por `mouseover`: al pasar el mouse sobre botones, campos o modulos, muestra una explicacion en una tarjeta flotante.

El problema: el modo actual explica elementos aislados, pero no ensena tareas completas. El usuario necesita entender flujos reales de punta a punta.

## Cambio Deseado

Crear un **Manual Guiado por Tareas** que conviva con el modo manual actual o lo mejore progresivamente.

Cada tutorial debe tener:

- Lista de pasos numerados.
- Paso actual marcado visualmente.
- Animacion HTML simulada de la tarea.
- Botones **Anterior**, **Siguiente**, **Repetir demo** y **Cerrar**.
- Barra de progreso.
- Texto breve y accionable.
- Resaltado del elemento simulado que se esta explicando.
- Datos ficticios, nunca datos reales de produccion.

## Experiencia Propuesta

Cuando el usuario active **Modo Manual**, debe poder elegir entre:

1. **Explorar pantalla actual**
   - Mantiene el comportamiento existente de tooltip por hover.
2. **Aprender una tarea**
   - Abre un selector de tutoriales guiados.

## Tutoriales Iniciales Recomendados

### Registrar Venta de Lente Especial

Flujo:

1. Ir a **Pedidos**.
2. Crear **Nuevo Pedido**.
3. Elegir tipo de lente: Monofocal, Bifocal, Multifocal o Contactologia.
4. Cargar receta OD/OI: ESF, CIL, EJE, ADD y distancia pupilar si corresponde.
5. Buscar o registrar cliente.
6. Seleccionar armazon y cristales.
7. Definir forma de pago, total, sena y saldo.
8. Confirmar pedido.
9. Enviar trabajo a laboratorio.

Animacion esperada:

- Simular una pantalla compacta de la app.
- Mostrar cursor falso o highlight animado.
- Completar campos automaticamente con valores ficticios.
- Marcar cada paso en la lista lateral.

### Registrar Cliente

Flujo:

1. Ir a **Clientes**.
2. Presionar **Registrar Cliente**.
3. Completar DNI, nombre, telefono, obra social y observaciones.
4. Guardar.
5. Ver ficha del cliente.

### Cargar Compra a Proveedor

Flujo:

1. Ir a **Proveedores**.
2. Abrir pestaña **Compras**.
3. Presionar **Cargar Nueva Compra**.
4. Seleccionar proveedor.
5. Cargar factura, fecha, vencimiento, productos e importe.
6. Confirmar impacto en cuenta corriente.

### Conciliacion Bancaria

Flujo:

1. Ir a **Caja/Finanzas**.
2. Elegir banco o cuenta.
3. Seleccionar rango de fechas.
4. Tildar movimientos conciliados.
5. Comparar saldo sistema vs saldo banco.
6. Guardar conciliacion.

### Procesar Borrador de Facturacion

Flujo:

1. Ir a **Borradores Facturacion**.
2. Elegir borrador pendiente.
3. Revisar cliente, concepto e importe.
4. Seleccionar tipo de comprobante y punto de venta.
5. Procesar factura.
6. Mostrar CAE y opciones de impresion/PDF.

## Requisitos UX

- Idioma de UI: espanol argentino.
- Mantener estetica premium de la app: dark mode, glassmorphism, bordes suaves, micro-animaciones.
- No usar parrafos largos dentro del tutorial.
- No bloquear completamente la app si no hace falta; preferir modal lateral o overlay claro.
- El tutorial debe ser entendible para personal no tecnico.
- Debe poder cerrarse en cualquier momento.
- Debe funcionar bien en desktop y en pantallas chicas.
- Debe tener buen contraste y controles de al menos 44px cuando sean clickeables.

## Regla Para Que La Simulacion Respete El Diseno Real

Las animaciones HTML del Manual Guiado **no deben parecer mockups genericos ni dibujitos inventados**. Deben verse como una mini version de la pantalla real que estan explicando.

Prioridad de implementacion:

1. **Reutilizar componentes reales de la app siempre que sea posible**
   - Formularios reales.
   - Botones reales.
   - Inputs reales.
   - Cards reales.
   - Tablas reales.
   - Iconos reales.
   - Clases Tailwind/CSS reales.
2. **Agregar un modo demo a componentes existentes**
   - Ejemplo: `ClientForm mode="demo"`.
   - Ejemplo: `OrderLensForm lensType="monofocal" mode="demo"`.
   - Ejemplo: `SupplierPurchaseForm mode="demo"`.
   - En modo demo se usan datos ficticios y se bloquea cualquier escritura en Supabase.
3. **Si no se puede reutilizar el componente real, crear una version reducida pero visualmente fiel**
   - Mismos nombres de campos.
   - Mismos colores.
   - Mismos bordes, sombras, espaciados y estados.
   - Misma jerarquia visual.
   - Mismos textos de botones.
   - Mismo comportamiento responsive aproximado.

Regla practica: si el usuario mira la simulacion y luego mira la pantalla real, debe sentir que esta viendo la misma interfaz, solo en version guiada, reducida y con datos de ejemplo.

Ejemplo recomendado:

```tsx
type DemoMode = "real" | "demo";

<ClientForm mode="demo" />
<OrderLensForm lensType="monofocal" mode="demo" />
<SupplierPurchaseForm mode="demo" />
<CashClosingForm mode="demo" />
```

En `mode="demo"`:

- No llamar a Supabase.
- No guardar clientes, pedidos, ventas ni movimientos reales.
- Precargar datos ficticios.
- Permitir highlights y cursor animado.
- Permitir avanzar paso a paso.
- Mantener la misma estetica que el componente real.

## Requisitos Tecnicos

- Implementar preferentemente en React/TypeScript siguiendo los patrones existentes.
- Evitar dependencias pesadas si se puede resolver con CSS animations + state.
- Crear una estructura de datos para los tutoriales:
  - `id`
  - `title`
  - `category`
  - `description`
  - `steps`
  - `animationType` o componente asociado
- Separar datos del tutorial de la UI para poder agregar nuevos tutoriales sin reescribir el componente.
- Las animaciones deben ser simulaciones HTML/CSS, no deben ejecutar acciones reales ni modificar Supabase.
- No usar informacion real de clientes, facturas ni proveedores.

## Componentes Sugeridos

- `GuidedManualLauncher`
- `GuidedManualModal`
- `TutorialStepList`
- `TutorialAnimationStage`
- `ManualDemoCursor`
- `ManualHighlight`
- Componentes demo especificos:
  - `OrderLensDemo`
  - `ClientRegistrationDemo`
  - `SupplierPurchaseDemo`
  - `BankReconciliationDemo`
  - `BillingDraftDemo`

## Criterios de Aceptacion

- Desde **Modo Manual** se puede abrir un selector de tutoriales.
- Al elegir un tutorial, aparece una guia paso a paso.
- El paso activo se marca de forma clara.
- La animacion HTML cambia sincronizada con el paso activo.
- Se puede avanzar, retroceder y repetir la animacion.
- El modo tooltip existente sigue funcionando o queda disponible como opcion.
- No se escriben datos en Supabase durante las demos.
- La UI se ve integrada con la app actual.
- No hay textos superpuestos ni botones con texto cortado.
- Funciona en desktop y mobile.

## QA Real Del Modo Manual Actual - 2026-08-05

Se ingreso a produccion con usuario QA y se probaron pantallas principales.

### Lo que funciona bien

- El boton **Modo Manual** se ve claramente en la barra superior.
- Al activarlo aparece el overlay **Modo Manual Interactivo Vivo (Activo)**.
- La tarjeta flotante comunica bien la idea general: pasar el mouse para recibir explicacion.
- En el panel de control reconoce correctamente:
  - **Registrar Cliente**
  - **Recetados**
  - **Stock**
  - **Proveedores**
  - **Caja/Finanzas**
- La explicacion inicial es simple y entendible para usuarios no tecnicos.

### Problemas Detectados

- En elementos no reconocidos, la tarjeta a veces queda con la explicacion anterior en lugar de mostrar una explicacion generica o indicar que no hay ayuda contextual disponible.
- En **Gestion de Clientes**, el manual no reconoce bien:
  - Boton **Nuevo Cliente**
  - Tabla de clientes
  - Acciones de la tabla
- En el formulario de **Registrar Nuevo Cliente**, los campos muestran una explicacion generica:
  - "Campo de Entrada de Datos"
  - "Ingresa texto o numeros para filtrar la informacion de la pantalla actual"
- Esa explicacion es incorrecta para campos de alta, porque no filtran informacion: cargan datos del paciente.
- El boton **Guardar Cliente** puede quedar explicado como si fuera un campo de entrada.
- En **Nuevo Pedido / Recetados**, las tarjetas de tipo de lente no tienen ayuda contextual especifica:
  - Monofocales
  - Multifocales
  - Ocupacionales
  - Lentes de Contacto
- En el formulario de pedido monofocal, campos criticos reciben ayuda generica:
  - DNI del cliente
  - ESF
  - CIL
  - EJE
  - DI
  - Altura pupilar
  - Agregar marco
  - Enviar a laboratorio
  - Agregar al carrito
- La seccion **Ayuda y Soporte** tiene buen contenido, pero los articulos estan muy largos y todos desplegados, lo que dificulta el aprendizaje rapido.
- No hay animaciones HTML ni simulaciones de tareas.
- No existe progreso paso a paso dentro de una tarea.

### Mejoras Prioritarias A Partir Del QA

1. Agregar un fallback correcto cuando un elemento no esta mapeado:
   - "Este elemento todavia no tiene ayuda contextual."
   - O limpiar la tarjeta para volver al mensaje inicial.
2. Reemplazar reglas fragiles basadas solo en `innerText` por atributos explicitos:
   - `data-manual-title`
   - `data-manual-description`
   - `data-manual-step`
   - `data-manual-flow`
3. Dar ayuda especifica a formularios:
   - DNI: buscar cliente existente o asociar ficha.
   - Nombre/Apellido: datos identificatorios.
   - Obra social: cobertura para facturacion y cuenta corriente.
   - Guardar Cliente: crea la ficha del paciente.
4. Dar ayuda tecnica especifica en pedidos:
   - ESF: potencia esferica.
   - CIL: astigmatismo.
   - EJE: orientacion del cilindro entre 0 y 180.
   - DI: distancia interpupilar.
   - Altura: centrado del cristal.
   - Cristal/Material/Tratamiento: afecta precio y laboratorio.
5. Convertir las guias largas de `/help` en acordeones o cards expandibles.
6. Incorporar tutoriales animados para los flujos de mayor uso:
   - Alta de cliente.
   - Pedido monofocal.
   - Pedido multifocal.
   - Venta no recetada.
   - Carga de compra a proveedor.
   - Arqueo de caja.
   - Facturacion desde borradores.

## Prompt Corto Para Antigravity

Implementar en [[system_optica_paracao]] un nuevo **Manual Guiado por Tareas** para mejorar el actual **Modo Manual Interactivo Vivo**. El modo actual explica elementos al pasar el mouse; conservarlo como opcion, pero agregar tutoriales guiados con pasos marcados y animaciones HTML simuladas. Empezar por los flujos: venta de lente especial, registrar cliente, compra a proveedor, conciliacion bancaria y procesar borrador de facturacion. Usar React/TypeScript, CSS animations, datos ficticios y no escribir en Supabase durante las demos. Cumplir los criterios de aceptacion de esta nota.
