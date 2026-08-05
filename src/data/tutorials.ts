export interface TutorialStep {
  number: number;
  title: string;
  description: string;
  actionHint?: string;
  targetField?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  category: 'clinica' | 'clientes' | 'proveedores' | 'finanzas' | 'facturacion' | 'ventas';
  description: string;
  iconName: string;
  estimatedMinutes: number;
  steps: TutorialStep[];
  animationType: 'order-lens' | 'order-monofocal' | 'order-multifocal' | 'client-reg' | 'supplier-purchase' | 'bank-reconciliation' | 'billing-draft' | 'quick-sale' | 'cash-closing';
}

export const TUTORIALS_DATA: Tutorial[] = [
  {
    id: 'venta-lente-especial',
    title: 'Registrar venta de lente especial',
    category: 'clinica',
    description: 'Aprende a confeccionar un pedido técnico oftálmico (monofocal, multifocal, etc.), cargar graduación y derivar a laboratorio.',
    iconName: 'Glasses',
    estimatedMinutes: 3,
    animationType: 'order-lens',
    steps: [
      {
        number: 1,
        title: 'Navegar a Pedidos',
        description: 'Haz clic en el menú "Pedidos" o "Nuevo Pedido" desde el tablero principal.',
        actionHint: 'Navegación al módulo de taller y recetados'
      },
      {
        number: 2,
        title: 'Crear Nuevo Pedido Técnico',
        description: 'Presiona el botón "+ Nuevo Pedido" para abrir la ficha de graduación.',
        actionHint: 'Inicia el formulario de recetado'
      },
      {
        number: 3,
        title: 'Elegir tipo de lente',
        description: 'Selecciona el tipo de cristal según la receta: Monofocal, Bifocal, Multifocal o Contactología.',
        actionHint: 'Ejemplo: Multifocal Digital HD'
      },
      {
        number: 4,
        title: 'Cargar receta OD / OI',
        description: 'Ingresa Esfera, Cilindro, Eje, Adición y Distancia Pupilar para Ojo Derecho y Ojo Izquierdo.',
        actionHint: 'OD: -1.50 -0.50x90° | OI: -1.25 -0.75x85°'
      },
      {
        number: 5,
        title: 'Asignar cliente y armazón',
        description: 'Busca un cliente existente o añade uno rápido, y selecciona el armazón del inventario.',
        actionHint: 'Cliente: María Gonzalez | Armazón: Ray-Ban Aviator'
      },
      {
        number: 6,
        title: 'Definir pago y seña',
        description: 'Ingresa la seña recibida en efectivo/tarjeta y revisa el saldo restante del paciente.',
        actionHint: 'Total $120.000 | Seña $60.000 | Saldo $60.000'
      },
      {
        number: 7,
        title: 'Confirmar y enviar a laboratorio',
        description: 'Guarda el pedido para generar la orden de trabajo para el taller de biselado o laboratorio externo.',
        actionHint: 'Genera remito de trabajo N° 8492'
      }
    ]
  },
  {
    id: 'pedido-monofocal',
    title: 'Pedido Monofocal (Lejos / Cerca)',
    category: 'clinica',
    description: 'Carga una receta monofocal para visión sencilla definiendo ESF, CIL, EJE, DI, armazón y envío al carrito.',
    iconName: 'Eye',
    estimatedMinutes: 2,
    animationType: 'order-monofocal',
    steps: [
      {
        number: 1,
        title: 'Seleccionar Monofocal',
        description: 'Elige la tarjeta Monofocal para visión lejana o de lectura.',
        actionHint: 'Cristal Monofocal Orgánico Antirreflex'
      },
      {
        number: 2,
        title: 'Ingresar graduación técnica',
        description: 'Carga ESF (potencia esférica), CIL (astigmatismo), EJE (0° a 180°) y DI (distancia interpupilar).',
        actionHint: 'ESF: -2.00 | CIL: -0.50 | EJE: 180° | DI: 63mm'
      },
      {
        number: 3,
        title: 'Seleccionar Armazón',
        description: 'Busca el código o modelo de armazón del stock de mostrador.',
        actionHint: 'Armazón Inyectado Flexible Negro'
      },
      {
        number: 4,
        title: 'Agregar al Carrito',
        description: 'Presiona "Agregar al Carrito" para procesar el cobro o emitir la seña.',
        actionHint: 'Enviado al resumen de ventas'
      }
    ]
  },
  {
    id: 'pedido-multifocal',
    title: 'Pedido Multifocal Progresivo',
    category: 'clinica',
    description: 'Carga avanzada para cristales progresivos incluyendo Adición (+1.00 a +3.50), Altura Pupilar y diseño de pasillo.',
    iconName: 'Sparkles',
    estimatedMinutes: 3,
    animationType: 'order-multifocal',
    steps: [
      {
        number: 1,
        title: 'Seleccionar Multifocal HD',
        description: 'Elige lentes progresivas de campo amplio.',
        actionHint: 'Multifocal Digital Personalizado'
      },
      {
        number: 2,
        title: 'Cargar Adición y Altura Pupilar',
        description: 'Especifica la Adición (ADD) para visión cercana y la Altura Pupilar en milímetros.',
        actionHint: 'ADD: +2.00 | Altura: 18mm'
      },
      {
        number: 3,
        title: 'Asignar Laboratorio Tallador',
        description: 'Selecciona el laboratorio externo responsable del tallado digital.',
        actionHint: 'Laboratorio OptiLab Taller'
      },
      {
        number: 4,
        title: 'Confirmar y generar trabajo',
        description: 'Emite la orden de trabajo para control de montaje.',
        actionHint: 'Estado: Enviado a Laboratorio'
      }
    ]
  },
  {
    id: 'registrar-cliente',
    title: 'Registrar cliente',
    category: 'clientes',
    description: 'Aprende a registrar un nuevo paciente con su DNI, contacto, obra social y datos de cuenta corriente.',
    iconName: 'UserPlus',
    estimatedMinutes: 2,
    animationType: 'client-reg',
    steps: [
      {
        number: 1,
        title: 'Ingresar a Clientes',
        description: 'Accede a la sección "Clientes" desde el menú lateral.',
        actionHint: 'Directorio general de pacientes'
      },
      {
        number: 2,
        title: 'Presionar "Registrar Cliente"',
        description: 'Haz clic en el botón superior "+ Registrar Cliente".',
        actionHint: 'Abre modal de alta'
      },
      {
        number: 3,
        title: 'Completar datos personales',
        description: 'Ingresa DNI, Nombre Completo, Teléfono WhatsApp, Email y Obra Social con su número de afiliado.',
        actionHint: 'DNI: 34.582.910 | Obra Social: OSDE'
      },
      {
        number: 4,
        title: 'Guardar cliente',
        description: 'Verifica la información y presiona "Guardar Cliente".',
        actionHint: 'Persiste la ficha en el sistema'
      },
      {
        number: 5,
        title: 'Ver ficha e historial',
        description: 'El paciente queda listo para vincularle pedidos, ventas de mostrador y señas.',
        actionHint: 'Ficha lista para uso clínico y contable'
      }
    ]
  },
  {
    id: 'venta-no-recetada',
    title: 'Venta rápida (No Recetados)',
    category: 'ventas',
    description: 'Despacho directo de mostrador para anteojos de sol, estuches, líquidos limpia cristales y accesorios.',
    iconName: 'ShoppingCart',
    estimatedMinutes: 2,
    animationType: 'quick-sale',
    steps: [
      {
        number: 1,
        title: 'Ir a Ventas Rápidas',
        description: 'Accede al módulo de ventas de mostrador.',
        actionHint: 'Punto de venta directo'
      },
      {
        number: 2,
        title: 'Escanear o seleccionar producto',
        description: 'Escanea el código de barras del producto o selecciónalo del catálogo.',
        actionHint: 'Líquido Limpiador Antifog 60ml x2'
      },
      {
        number: 3,
        title: 'Cobrar y emitir ticket',
        description: 'Selecciona Mercado Pago, Tarjeta o Efectivo y completa el cobro.',
        actionHint: 'Cobro de mostrador procesado'
      }
    ]
  },
  {
    id: 'cargar-compra-proveedor',
    title: 'Cargar compra a proveedor',
    category: 'proveedores',
    description: 'Registra facturas de compras de cristales, insumos o armazones actualizando la cuenta corriente del proveedor.',
    iconName: 'Truck',
    estimatedMinutes: 3,
    animationType: 'supplier-purchase',
    steps: [
      {
        number: 1,
        title: 'Ir a Proveedores',
        description: 'Accede al módulo de "Proveedores" y dirígete a la pestaña "Compras".',
        actionHint: 'Control de compras y proveedores'
      },
      {
        number: 2,
        title: 'Cargar Nueva Compra',
        description: 'Haz clic en "+ Cargar Nueva Compra" para registrar la comprobante recibido.',
        actionHint: 'Nuevo comprobante de proveedor'
      },
      {
        number: 3,
        title: 'Seleccionar Proveedor',
        description: 'Elige la distribuidora u optometría mayorista que emitió la factura.',
        actionHint: 'Ejemplo: Distribuidora Óptica del Litoral'
      },
      {
        number: 4,
        title: 'Detallar comprobante e importes',
        description: 'Carga N° de Factura, fecha de vencimiento, ítems adquiridos y el subtotal con IVA.',
        actionHint: 'Factura A 0001-00048291 | Total $450.000'
      },
      {
        number: 5,
        title: 'Confirmar impacto en cuenta corriente',
        description: 'Guarda la compra para actualizar existencias de stock y registrar la deuda pendiente en finanzas.',
        actionHint: 'Actualiza stock e inventario automáticamente'
      }
    ]
  },
  {
    id: 'conciliacion-bancaria',
    title: 'Realizar conciliación bancaria',
    category: 'finanzas',
    description: 'Compara los registros de cobro en tarjeta/transferencia de la óptica contra los resúmenes bancarios reales.',
    iconName: 'Wallet',
    estimatedMinutes: 4,
    animationType: 'bank-reconciliation',
    steps: [
      {
        number: 1,
        title: 'Ingresar a Caja / Finanzas',
        description: 'Dirígete al módulo "Caja/Finanzas" y selecciona la solapa "Conciliación Bancaria".',
        actionHint: 'Módulo de tesorería y bancos'
      },
      {
        number: 2,
        title: 'Elegir Banco y Fecha',
        description: 'Selecciona la cuenta (Ej: Banco Macro Cta Cte) y define el período a auditar.',
        actionHint: 'Filtro: Banco Galicia - Agosto 2026'
      },
      {
        number: 3,
        title: 'Marcar movimientos coincidentes',
        description: 'Tilda los cupones de acreditación de Posnet y transferencias que figuren en el extracto.',
        actionHint: 'Cotejo de saldo Sistema vs Extracto'
      },
      {
        number: 4,
        title: 'Verificar diferencia cero',
        description: 'Asegúrate de que la discrepancia sea $0,00 antes de cerrar el período.',
        actionHint: 'Diferencia auditada: $0,00'
      },
      {
        number: 5,
        title: 'Guardar Conciliación',
        description: 'Haz clic en "Cerrar y Guardar Conciliación" para consolidar la información contable.',
        actionHint: 'Reporte emitido y registrado'
      }
    ]
  },
  {
    id: 'arqueo-de-caja',
    title: 'Arqueo de caja diario',
    category: 'finanzas',
    description: 'Apertura, control de ingresos/egresos de efectivo de turno y cierre con arqueo físico de caja.',
    iconName: 'Wallet',
    estimatedMinutes: 3,
    animationType: 'cash-closing',
    steps: [
      {
        number: 1,
        title: 'Ingresar a Finanzas > Arqueo',
        description: 'Abre el panel de caja física diaria.',
        actionHint: 'Control de efectivo de mostrador'
      },
      {
        number: 2,
        title: 'Ingresar recuento físico',
        description: 'Suma billetes y monedas del cajón de dinero.',
        actionHint: 'Efectivo contado en caja'
      },
      {
        number: 3,
        title: 'Cerrar Arqueo y Emitir Reporte',
        description: 'Verifica la diferencia de caja y realiza el cierre de turno.',
        actionHint: 'Cierre consolidado de turno'
      }
    ]
  },
  {
    id: 'procesar-borrador-facturacion',
    title: 'Procesar borrador de facturación',
    category: 'facturacion',
    description: 'Transforma borradores de ventas o señas en facturas electrónicas oficiales emitidas con CAE de AFIP.',
    iconName: 'FileText',
    estimatedMinutes: 3,
    animationType: 'billing-draft',
    steps: [
      {
        number: 1,
        title: 'Ir a Borradores Facturación',
        description: 'Entra a la sección "Borradores Facturación" donde se listan las comprobantes pre-cargados.',
        actionHint: 'Borradores de emisión fiscal'
      },
      {
        number: 2,
        title: 'Seleccionar borrador pendiente',
        description: 'Haz clic sobre la venta o comprobante en estado "Borrador" que deseas autorizar.',
        actionHint: 'Borrador N° B-1049 - Cliente: Carlos Paez'
      },
      {
        number: 3,
        title: 'Revisar datos fiscales',
        description: 'Verifica la condición frente al IVA del cliente (Consumidor Final, Resp. Inscripto) e importes.',
        actionHint: 'Total: $85.000 | Condición: Consumidor Final'
      },
      {
        number: 4,
        title: 'Asignar Punto de Venta y Tipo',
        description: 'Selecciona si emitirás Factura A, B o C y el punto de venta correspondiente.',
        actionHint: 'Factura B - PV 0005'
      },
      {
        number: 5,
        title: 'Emitir con CAE y descargar PDF',
        description: 'Presiona "Procesar Factura" para enviarla al servicio fiscal y obtener el código CAE.',
        actionHint: 'CAE: 74392019482012 | Comprobante Oficial Generado'
      }
    ]
  }
];
