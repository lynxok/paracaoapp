import React, { useState } from "react";
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  UserPlus, 
  FileText, 
  Settings, 
  Glasses, 
  Eye, 
  Wallet, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  MessageSquare,
  Users,
  ShoppingCart,
  Package,
  Truck,
  FlaskConical,
  BarChart3,
  Sparkles,
  Info,
  Activity,
  RefreshCw,
  Send,
  Database,
  Shield,
  Building2,
  MapPin,
  Receipt,
  Bell,
  ScrollText
} from "lucide-react";

interface HelpArticle {
  id: string;
  category: "clinica" | "admin" | "finanzas" | "config" | "facturas" | "soporte";
  title: string;
  shortDesc: string;
  content: React.ReactNode;
  tags: string[];
}

export function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Transposition Calculator State
  const [sph, setSph] = useState("");
  const [cyl, setCyl] = useState("");
  const [axis, setAxis] = useState("");
  const [transposed, setTransposed] = useState<{ sph: string; cyl: string; axis: string } | null>(null);

  // Support Form State
  const [supportName, setSupportName] = useState("");
  const [supportMsg, setSupportMsg] = useState("");
  const [supportUrgency, setSupportUrgency] = useState("baja");

  const categories = [
    { id: "todos", label: "Todas las Guías" },
    { id: "clinica", label: "Clínica & Pedidos" },
    { id: "admin", label: "Administración & Stock" },
    { id: "finanzas", label: "Caja & Finanzas" },
    { id: "facturas", label: "Facturación & Borradores" },
    { id: "config", label: "Configuración & Usuarios" },
    { id: "soporte", label: "Soporte & Transposición" }
  ];

  // Optical Transposition Logic
  const handleCalculateTransposition = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseFloat(sph) || 0;
    const c = parseFloat(cyl) || 0;
    let a = parseInt(axis) || 0;

    if (c === 0) {
      setTransposed({
        sph: s.toFixed(2),
        cyl: "0.00",
        axis: "0"
      });
      return;
    }

    // New Sphere = Sphere + Cylinder
    const newSph = s + c;
    // New Cylinder = - Cylinder
    const newCyl = -c;
    // New Axis = Axis + 90 (if Axis <= 90) or Axis - 90 (if Axis > 90)
    let newAxis = a;
    if (a > 0 && a <= 180) {
      if (a <= 90) {
        newAxis = a + 90;
      } else {
        newAxis = a - 90;
      }
    } else if (a === 0) {
      newAxis = 90; // Default conversion for 0 axis
    }

    setTransposed({
      sph: (newSph > 0 ? "+" : "") + newSph.toFixed(2),
      cyl: (newCyl > 0 ? "+" : "") + newCyl.toFixed(2),
      axis: newAxis.toString()
    });
  };

  const handleClearTransposition = () => {
    setSph("");
    setCyl("");
    setAxis("");
    setTransposed(null);
  };

  // Support WhatsApp Dispatcher
  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName.trim() || !supportMsg.trim()) {
      alert("Por favor completa tu nombre y el mensaje de soporte.");
      return;
    }
    const urgencyEmoji = supportUrgency === "alta" ? "🚨 CRÍTICO" : supportUrgency === "media" ? "⚠️ IMPORTANTE" : "ℹ️ CONSULTA";
    const text = `Hola Soporte LYNX / Óptica Paracao.
Mi nombre es: ${supportName}.
Urgencia: ${urgencyEmoji}

Mensaje de error / consulta:
"${supportMsg}"

Enviado desde el Centro de Ayuda del Sistema.`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/543435555555?text=${encodedText}`, "_blank");
  };

  const articles: HelpArticle[] = [
    {
      id: "venta-lentes-especiales",
      category: "clinica",
      title: "Cómo registrar la venta de un lente especial (Monofocal, Bifocal, Multifocal, Contactología)",
      shortDesc: "Guía paso a paso para la carga técnica de recetas de anteojos y lentes de contacto.",
      tags: ["monofocal", "bifocal", "multifocal", "contacto", "receta", "pedido"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            El registro de lentes recetados se realiza a través del módulo de <strong>Pedidos</strong>. Este flujo está diseñado para capturar de manera exacta los parámetros ópticos de la receta médica.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Paso 1: Iniciar el Pedido</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Diríjase a la sección <strong>Pedidos</strong> en el menú lateral izquierdo o presione <strong>"Nuevo Pedido"</strong> en el Panel de Control.</li>
              <li>Seleccione la patología o tipo de lente a recetar:
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li><strong>Monofocales:</strong> Visión sencilla (lejos o cerca).</li>
                  <li><strong>Multifocales / Bifocales:</strong> Lentes de adición y progresivos.</li>
                  <li><strong>Ocupacionales:</strong> Media y corta distancia (para oficina).</li>
                  <li><strong>Lentes de Contacto:</strong> Parámetros de contacto.</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Paso 2: Carga de la Receta (Graduación Técnica)</h4>
            <p className="text-slate-600 dark:text-slate-300">
              Complete los campos para el <strong>Ojo Derecho (OD)</strong> y <strong>Ojo Izquierdo (OI)</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Esfera (ESF):</strong> Valores positivos (+) para hipermetropía o negativos (-) para miopía.</li>
              <li><strong>Cilindro (CIL) y Eje (EJE):</strong> Para corregir el astigmatismo. Eje expresado en grados (0° a 180°).</li>
              <li><strong>Adición (ADD):</strong> Necesario para lentes de cerca (Bifocales / Multifocales).</li>
              <li><strong>Distancia Pupilar (D.P.) y Altura:</strong> Indispensable para centrar correctamente los cristales, especialmente en multifocales.</li>
              <li><strong>Curva Base y Diámetro:</strong> Específicos para el módulo de <em>Lentes de Contacto</em>.</li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Paso 3: Selección de Armazón, Cristales y Cliente</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Cliente:</strong> Busque al cliente por DNI/Nombre o regístrelo en el momento.</li>
              <li><strong>Armazón y Cristales:</strong> Puede seleccionarlos del inventario cargado o agregar conceptos de cristales personalizados (material, tratamiento, laboratorio tallador).</li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Paso 4: Pago, Seña y Envío a Taller</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Defina el método de pago del cliente (Efectivo, Tarjeta, Transferencia, Cuenta Corriente, Mutual).</li>
              <li>El cliente puede abonar el total o dejar una <strong>Seña</strong>. La diferencia se imputará automáticamente a su Cuenta Corriente.</li>
              <li>Al confirmar el pedido, este se añade al Carrito, se procesa la venta y el trabajo viaja al módulo de <strong>Laboratorios</strong> en estado <code>En Taller</code> de forma automática.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "alta-usuarios",
      category: "config",
      title: "Cómo dar de alta un nuevo usuario / empleado en el sistema",
      shortDesc: "Guía para gestionar el personal del local y configurar sus permisos y sucursales.",
      tags: ["usuario", "empleado", "permisos", "crear usuario", "ajustes", "seguridad"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            La creación de usuarios del sistema es una acción reservada para perfiles con rol de <strong>Administrador</strong>. Se realiza desde la pestaña de Configuración.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Paso a Paso para el Alta de un Usuario</h4>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Diríjase a la sección <strong>Ajustes</strong> (icono de engranaje) en el menú lateral izquierdo.</li>
              <li>En el menú superior de pestañas, haga clic en <strong>Usuarios</strong>.</li>
              <li>Haga clic en el botón <strong>"Agregar Usuario"</strong> (ubicado en la esquina superior derecha del panel).</li>
              <li>Complete el formulario con los siguientes campos obligatorios:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Nombre completo:</strong> Identificación del personal en tickets y auditorías.</li>
                  <li><strong>Usuario (Username):</strong> Nombre de usuario con el que iniciará sesión.</li>
                  <li><strong>Email:</strong> Dirección de correo electrónico de contacto.</li>
                  <li><strong>Rol de Sistema:</strong>
                    <ul className="list-circle pl-5 mt-1">
                      <li><code>Administrador</code>: Control total de la aplicación, finanzas y ajustes.</li>
                      <li><code>Vendedor / Óptico</code>: Carga de recetas, ventas y stock, sin acceso a configuraciones de facturación AFIP o cierres financieros globales.</li>
                    </ul>
                  </li>
                  <li><strong>Sucursal Asignada:</strong> Vincule al empleado a una sucursal específica (ej. Casa Central, Sucursal Paracao).</li>
                  <li><strong>Contraseña Inicial:</strong> Defina una contraseña provisoria de acceso.</li>
                </ul>
              </li>
              <li>Suba una foto o seleccione un avatar identificador para el panel de turnos y control de flujo.</li>
              <li>Presione <strong>"Guardar Usuario"</strong>. A partir de este momento, el empleado podrá iniciar sesión con sus credenciales.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: "compra-proveedor",
      category: "admin",
      title: "Cómo registrar una compra a un proveedor e impactar su Cuenta Corriente",
      shortDesc: "Procedimiento para ingresar facturas de compra comerciales y registrar deudas.",
      tags: ["proveedor", "compra", "factura", "cuenta corriente", "deuda"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            La carga de compras comerciales incrementa automáticamente el saldo deudor con el proveedor en su ficha de Cuenta Corriente.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Paso a Paso:</h4>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Diríjase al módulo de <strong>Proveedores</strong> desde la barra de navegación lateral.</li>
              <li>En las pestañas superiores, seleccione la opción <strong>"Compras"</strong>.</li>
              <li>Haga clic en el botón <strong>"Cargar Nueva Compra"</strong>.</li>
              <li>Complete el formulario con:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Proveedor:</strong> Seleccione de la lista (ej: Essilor, Ran-ieri).</li>
                  <li><strong>Nº de Factura / Comprobante:</strong> Registre el identificador de la factura física.</li>
                  <li><strong>Monto Total:</strong> Ingrese la suma final facturada.</li>
                  <li><strong>Condición de Pago:</strong> Elija financiamiento (ej: Contado, 30 días, 60 días).</li>
                  <li><strong>Fecha de Vencimiento:</strong> Indispensable para alertas de pago.</li>
                </ul>
              </li>
              <li>Presione <strong>"Confirmar Impacto en C.C."</strong>. El sistema procesará el registro y sumará la deuda a la cuenta corriente del proveedor.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: "facturas-proveedores-pendientes",
      category: "admin",
      title: "Cómo monitorear facturas pendientes de pago de proveedores",
      shortDesc: "Uso del tablero de alertas para controlar vencimientos de compras.",
      tags: ["proveedores", "compras", "facturas", "vencimientos", "pagos"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            El sistema consolida todas las obligaciones comerciales que no tienen una Orden de Pago definitiva asociada en un único panel.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Uso del Módulo de Facturas Pendientes:</h4>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Ingrese a <strong>Proveedores</strong> y seleccione la pestaña <strong>"Facturas Pendientes"</strong>.</li>
              <li>El panel principal muestra una tarjeta con la <strong>Deuda Consolidada Total</strong>.</li>
              <li>La tabla lista las facturas ordenadas por fecha de vencimiento. Los comprobantes vencidos o próximos a vencer aparecerán resaltados.</li>
              <li>Para asentar el pago, puede presionar el botón <strong>"Pagar Factura"</strong> directamente en la fila de la factura para abrir el modal de Orden de Pago y reducir la deuda.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "conciliacion-bancaria-guia",
      category: "finanzas",
      title: "Cómo realizar una Conciliación Bancaria paso a paso",
      shortDesc: "Guía para tildar movimientos bancarios y equilibrar cierres de caja.",
      tags: ["conciliacion", "banco", "cierre", "saldo", "extracto", "gastos bancarios"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            La conciliación permite contrastar los registros financieros del sistema con los extractos reales del Homebanking.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Paso a Paso para Conciliar:</h4>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Vaya al módulo <strong>Caja/Finanzas</strong> y seleccione la pestaña superior <strong>"Conciliación"</strong>.</li>
              <li>Seleccione la **Cuenta Bancaria** o billetera digital que desea auditar.</li>
              <li>Indique el rango de fechas (Desde / Hasta) que coincida con el extracto bancario PDF físico.</li>
              <li>Ingrese el <strong>"Cierre conciliación actual"</strong> (el saldo final que figura en su extracto oficial real). El sistema calculará la diferencia contra el último arqueo.</li>
              <li>En el campo <strong>Gastos Bancarios</strong>, ingrese cualquier cargo del banco (impuestos al cheque, mantenimiento) que no esté asociado a una venta.</li>
              <li><strong>Tildado de movimientos:</strong> Compare la lista del sistema contra su extracto. Haga clic sobre cada movimiento coincidente en la pantalla para tildarlo (cambiará a color verde).</li>
              <li>Una vez que la diferencia de cierres arroje balance cero, presione <strong>"Confirmar Conciliación"</strong>.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: "arqueo-caja-fisica",
      category: "finanzas",
      title: "Cómo realizar el Arqueo de Cajas Físicas (Caja Chica y Principal)",
      shortDesc: "Registro diario de ingresos y egresos de efectivo y control de cierre de jornada.",
      tags: ["caja", "arqueo", "caja chica", "ingresos", "egresos", "cierre caja"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            El arqueo garantiza que el dinero en efectivo guardado físicamente en la sucursal coincida con el balance contable del sistema.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Procedimiento Diario:</h4>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Inicio de Jornada:</strong> Verifique el saldo de apertura cargado en la caja correspondiente ("Caja Chica" o "Caja Principal").</li>
              <li><strong>Cargar Movimientos Manuales:</strong> Si hay gastos chicos (ej. papelería) o aportes de capital, regístrelos mediante los botones <strong>"Nuevo Egreso"</strong> o <strong>"Nuevo Ingreso"</strong> detallando el concepto. Las señas de pedidos se asientan solas al procesar las ventas.</li>
              <li><strong>Cierre de Caja:</strong> Al finalizar el día, acceda a <strong>"Cierre de Caja"</strong>. Cuente los billetes físicos y digite el saldo real de cierre. El sistema le alertará inmediatamente si existe un faltante o sobrante de caja.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "borrador-facturas",
      category: "facturas",
      title: "Cómo gestionar y procesar borradores de facturación",
      shortDesc: "Guía para emitir comprobantes oficiales a partir de las señas o pedidos cargados.",
      tags: ["factura", "borrador", "afip", "arca", "cae", "facturacion", "consumidor final"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            Cuando un cliente realiza un pago o una seña de un pedido, el sistema genera de forma automática un <strong>Borrador de Factura</strong>. Esto permite separar la cobranza diaria de la emisión fiscal del comprobante oficial (para validación AFIP/ARCA).
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Flujo de Facturación de Borradores</h4>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Vaya al módulo <strong>Borradores Facturación</strong> desde el menú lateral izquierdo.</li>
              <li>Verá dos pestañas principales:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Borradores Pendientes:</strong> Ventas registradas que aún no tienen una factura fiscal emitida.</li>
                  <li><strong>Facturados / Historial:</strong> Comprobantes que ya han sido procesados y timbrados fiscalmente.</li>
                </ul>
              </li>
              <li><strong>Seleccionar Comprobantes:</strong> Marque los casilleros de los borradores que desea facturar. Puede seleccionar múltiples borradores para facturación masiva.</li>
              <li>Haga clic en <strong>"Facturar Seleccionados"</strong> en el panel de acciones.</li>
              <li>Se abrirá el modal de facturación donde podrá definir:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Tipo de Cliente:</strong> Consumidor Final (para montos menores sin identificar) o Nominado (requiere cargar CUIT/DNI, Nombre/Razón Social y Dirección).</li>
                  <li><strong>Fecha de Facturación:</strong> Por defecto, es el día actual.</li>
                </ul>
              </li>
              <li>Presione <strong>"Procesar Factura"</strong>. El sistema enviará la solicitud al webservice de AFIP/ARCA utilizando los certificados de la sucursal, obtendrá el CAE y generará la factura correspondiente.</li>
              <li>Desde la pestaña de Historial, podrá visualizar la vista previa de la factura oficial y mandarla a imprimir en formato ticket térmico o PDF A4.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: "ajustes-explicados",
      category: "config",
      title: "Explicación de todas las pestañas de la sección de Ajustes",
      shortDesc: "Manual técnico detallado para parametrizar las variables del negocio, sucursales y AFIP.",
      tags: ["ajustes", "configuración", "certificados", "afip", "obras sociales", "sucursales", "bancos", "permisos"],
      content: (
        <div className="space-y-6 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            El panel de <strong>Ajustes (Settings)</strong> permite centralizar la administración del sistema. A continuación se detallan las 14 pestañas disponibles en este panel de control:
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> 1. General
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Contiene la información corporativa base de la óptica (Razón Social, Nombre de Fantasía, Correo de Administración, CUIT Emisor y Teléfono de contacto). Estos datos se imprimen automáticamente en el pie de página de los presupuestos y recibos generados.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-violet-500" /> 2. Apariencia
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Permite cambiar el tema visual predeterminado del sistema (Claro, Oscuro o Automático). Asimismo, incluye el <strong>Constructor de PDFs</strong>, donde se definen los márgenes de impresión de tickets térmicos, la paleta de colores para los reportes y la posición exacta del logotipo.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" /> 3. Sucursales
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Módulo para dar de alta y administrar las diferentes bocas de venta físicas (ej: Casa Central, Sucursal Shopping, etc.). Cada sucursal cuenta con su propia dirección, teléfono y caja física independiente asignada para los arqueos diarios de caja.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Users className="w-4 h-4 text-indigo-500" /> 4. Usuarios
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Directorio y formulario de alta de empleados. Permite asignar contraseñas, avatares, correos electrónicos y vincular a cada usuario a una sucursal física determinada de manera excluyente.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Shield className="w-4 h-4 text-red-500" /> 5. Permisos
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Matriz de control de accesos (RBAC). Permite activar o desactivar la visualización y permisos de edición de los diferentes módulos del sistema (Finanzas, Compras, Ajustes, CRM) de acuerdo al rol del empleado (Administrador, Vendedor, Óptico, Auditor).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Bell className="w-4 h-4 text-amber-500" /> 6. Notificaciones
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Configura los disparadores de avisos automáticos. Por ejemplo, define los umbrales mínimos de stock para alertas en el dashboard o el tiempo transcurrido para alertas de CRM (ej: avisar 12 meses después de la compra de un lente).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Receipt className="w-4 h-4 text-cyan-500" /> 7. Facturación (AFIP)
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Mapeo fiscal del sistema. Permite configurar el CUIT emisor, los Puntos de Venta (PV) homologados y alternar entre los entornos de <strong>Homologación / Testing</strong> y <strong>Producción / AFIP Real</strong>. Asimismo, es la sección donde se realiza la carga y actualización de los archivos de llave privada (<code>.key</code>) y el certificado digital (<code>.crt</code>).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Activity className="w-4 h-4 text-pink-500" /> 8. Obras Sociales
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Directorio de coberturas médicas cargadas (OSDE, Swiss Medical, PAMI, etc.). Permite establecer de manera paramétrica qué monto o porcentaje fijo cubre cada obra social según la categoría del lente (ej: reintegro plano de $5.000 para lentes monofocales y $12.000 para lentes multifocales).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" /> 9. Bancos
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Registra las cuentas bancarias o billeteras virtuales asociadas a la empresa (ej: Banco Santander, Cuenta Mercado Pago, etc.). Estas cuentas se utilizan de forma automatizada al momento de tildar cobros y pagos para la conciliación de extractos.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Package className="w-4 h-4 text-orange-500" /> 10. Categorías
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Administración de las familias de productos para organizar el inventario (armazones de metal, armazones de acetato, cristales monofocales, multifocales, lentes de contacto, líquidos, accesorios). Permite automatizar los cálculos de impuestos de stock por rubro.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <FlaskConical className="w-4 h-4 text-teal-500" /> 11. Laboratorios
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Directorio de laboratorios externos de tallado óptico. Permite configurar los costos base y plazos estimados de entrega de cada taller externo para coordinar los pedidos de cristales multifocales y bifocales.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Eye className="w-4 h-4 text-blue-500" /> 12. Tabla de Cristales
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Base tarifaria estructurada de cristales. Registra y asocia los precios, materiales (Orgánico, Policarbonato, Mineral) y tratamientos (Antirreflex, Filtro Azul, Fotocromático) cargados en el sistema.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <Database className="w-4 h-4 text-purple-500" /> 13. Base de Datos
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Muestra estadísticas de consumo y almacenamiento del motor de datos Supabase, el estado de la caché local y permite forzar una sincronización manual o depuración de datos temporales offline.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
                <ScrollText className="w-4 h-4 text-slate-500" /> 14. Audit Log
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Historial cronológico inalterable que audita los movimientos de los usuarios (ej: quién borró un pedido, quién editó una cuenta corriente de cliente, fechas y horas de inicios de sesión). Indispensable para controles internos de seguridad.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "tabla-cristales-rangos",
      category: "config",
      title: "Tabla de Cristales y Funcionamiento de Rangos de Recetas",
      shortDesc: "Cómo se estructuran los precios de cristales y cómo el cotizador los filtra según la graduación del paciente.",
      tags: ["cristales", "tabla de cristales", "rangos", "esfera", "cilindro", "adicion", "graduacion", "cotizador"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            La <strong>Tabla de Cristales</strong> (Ajustes &rarr; Tabla de Cristales) centraliza el tarifario de lentes de la óptica. Su diseño inteligente evita que los vendedores coticen lentes incorrectos o fuera de los límites de fabricación del proveedor.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">1. Campos de un Cristal en el Catálogo</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Al cargar o editar un cristal se definen parámetros descriptivos y límites de graduación:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <li><strong>Nombre y Tipo:</strong> Identificación del lente y su categoría (Monofocal, Bifocal, Multifocal, Ocupacional).</li>
              <li><strong>Marca y Diseño:</strong> Ej: <em>Essilor / Varilux Comfort Max</em> o <em>Novar / AI FreeForm</em>.</li>
              <li><strong>Material e Índice:</strong> Ej: Orgánico, Policarbonato o Alto Índice (1.56, 1.6, 1.67, 1.74). A mayor índice, menor espesor para altas dioptrías.</li>
              <li><strong>Color y Tratamiento:</strong> Blanco, Antirreflex (AR), Filtro Azul (Blue Cut), Fotocromático (Transitions), Ocupacional.</li>
              <li><strong>Precio Par:</strong> El costo final base asignado al par de cristales.</li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">2. ¿Cómo funcionan los Rangos de Graduación?</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Los rangos definen la viabilidad técnica y el precio del cristal de acuerdo a las dioptrías del paciente:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <li>
                <strong>Límites Esféricos (ESF Mín y ESF Máx):</strong> 
                Representa el rango de dioptrías esféricas cubiertas. 
                <br />
                <span className="text-indigo-650 dark:text-indigo-400 font-medium">Ejemplo:</span> Si un cristal económico tiene un rango de <code>ESF: -4.00 a +4.00</code>, y el paciente tiene una miopía de <code>-4.50</code>, el cotizador del sistema descartará este cristal y solo ofrecerá aquellos con rango extendido (ej: hasta <code>-6.00</code> o de Alto Índice).
              </li>
              <li>
                <strong>Cilindro Máximo (CIL máx):</strong> 
                Representa el límite máximo de astigmatismo permitido (expresado en valor absoluto).
                <br />
                <span className="text-indigo-650 dark:text-indigo-400 font-medium">Ejemplo:</span> Si un cristal de stock tiene un <code>CIL máx: 2.00</code> y la receta del paciente indica un cilindro de <code>-2.50</code>, este cristal no se mostrará. El sistema forzará al vendedor a elegir un cristal de rango de receta extendida de laboratorio.
              </li>
              <li>
                <strong>Adición Mín/Máx (ADD):</strong> 
                Específico para multifocales u ocupacionales, limita la corrección para presbicia (ej: adición de <code>+1.00</code> a <code>+3.00</code> dioptrías).
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">3. Comportamiento Automatizado en "Nuevo Pedido"</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Cuando el vendedor digita la receta en la pantalla de venta:
            </p>
            <ol className="list-decimal pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <li>El sistema extrae los valores de ESF y CIL del Ojo Derecho e Izquierdo.</li>
              <li>Busca en el catálogo de cristales activos y filtra matemáticamente aplicando la regla:
                <div className="my-1.5 p-2 bg-slate-950 text-emerald-400 rounded font-mono text-center text-[10px]">
                  ESF_mín &le; Receta_ESF &le; ESF_máx &nbsp;&nbsp;AND&nbsp;&nbsp; |Receta_CIL| &le; CIL_máx
                </div>
              </li>
              <li>El vendedor solo visualiza los cristales que cumplen con esta condición. De esta forma, el precio cotizado es 100% exacto y técnicamente factible para el laboratorio.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: "resolucion-problemas",
      category: "soporte",
      title: "Resolución de Problemas Comunes (Hardware, AFIP y Conexión)",
      shortDesc: "Guías de contingencia para resolver caídas de servicio, puertos COM y sincronización.",
      tags: ["problemas", "error", "afip", "arca", "puerto", "ticket", "impresora", "barcode"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <div className="p-4 rounded-xl border border-red-200/60 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 space-y-2">
            <h4 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5" /> 1. Errores de Conexión AFIP/ARCA (Error de Facturación)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Si al intentar procesar un borrador de factura el sistema devuelve un error fiscal o error de comunicación:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <li><strong>Verificar estado de servidores:</strong> Visite el monitor de estado de webservices de AFIP. La AFIP experimenta micro-caídas habituales.</li>
              <li><strong>Expiración de Certificado:</strong> Ingrese a Ajustes &rarr; AFIP y revise que la fecha de validez del certificado digital (.crt) no se encuentre vencida. Si es así, debe regenerar la relación en la web de AFIP con clave fiscal y subir el nuevo archivo en Ajustes.</li>
              <li><strong>Punto de Venta Incorrecto:</strong> Asegúrese de que el número de Punto de Venta configurado en la sucursal coincide exactamente con el tipo "Factura Electrónica (WebServices)" habilitado en AFIP.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
            <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5" /> 2. Fallas en Impresoras Térmicas y Lector de Códigos
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Si la comandera térmica no emite los tickets de seña o el escáner de marcos no responde:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <li><strong>Verificar el Puente de LYNX (Electron Bridge):</strong> Si la aplicación corre en modo escritorio nativo, asegúrese de que el software puente esté activo en la barra de tareas de Windows.</li>
              <li><strong>Mapeo de Puertos COM/USB:</strong> Desconecte y vuelva a conectar el puerto USB. En Ajustes &rarr; Hardware, presione "Escanear puertos" para refrescar el identificador COM asignado por Windows.</li>
              <li><strong>Cola de Impresión:</strong> Verifique que no haya documentos trabados en la cola de impresión del sistema operativo Windows.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
            <h4 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Database className="w-4.5 h-4.5" /> 3. Demoras de Sincronización (Supabase)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Si detecta que los cobros en cuenta corriente o las modificaciones de clientes tardan en aparecer en otras terminales:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <li>Revise el estado de su conexión de internet local en el local.</li>
              <li>El sistema cuenta con resiliencia offline. Los datos se guardan temporalmente en base de datos local y se sincronizan al recuperar señal estable. Evite limpiar la caché del navegador si el indicador de red muestra "Sin Sincronizar".</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "respaldos-versiones",
      category: "config",
      title: "Respaldos de Versiones y Copias de Seguridad (Backups)",
      shortDesc: "Cómo se resguardan el código de distribución, los assets y la contabilidad.",
      tags: ["respaldo", "copia", "seguridad", "backup", "versiones", "base de datos"],
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-300">
            Para garantizar la continuidad operativa y evitar interrupciones por fallas de hardware, el sistema dispone de un esquema de respaldos redundantes.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">1. Respaldo de Código y Versiones Operativas</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              El sistema cuenta con un script automatizado en Node.js llamado <code>create_backup.cjs</code>. Este script se ejecuta de manera complementaria al compilar actualizaciones:
            </p>
            <ol className="list-decimal pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-1">
              <li>Al ejecutar <code>npm run build</code>, se compila la carpeta de producción <code>dist</code>.</li>
              <li>Posteriormente, el comando de resguardo copia de manera recursiva la carpeta actual compilada dentro de la ruta <code>/BackUp de versiones/Version_[X]</code>.</li>
              <li>Mantiene estrictamente las últimas <strong>10 versiones</strong> de respaldo históricas en el disco duro local, depurando automáticamente las más antiguas para optimizar el almacenamiento.</li>
              <li>Genera un archivo autodescriptivo llamado <code>detalles.txt</code> registrando la hora de guardado y los cambios aplicados en dicha versión.</li>
            </ol>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">2. Respaldo Contable y Clínico</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Toda la información de Clientes, Cuentas Corrientes, Historiales Clínicos y Facturación se sincroniza en la nube de forma encriptada:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <li>El motor cloud de <strong>Supabase</strong> realiza respaldos lógicos diarios automáticos de la base de datos PostgreSQL.</li>
              <li>Los archivos adjuntos de recetas y PDFs de facturación se resguardan en Storage buckets con redundancia geográfica.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const faqs = [
    {
      q: "¿Cómo se diferencia el flujo de un lente Bifocal frente a un Multifocal?",
      a: "En el sistema, ambos se ingresan utilizando la plantilla de recetas avanzadas. Sin embargo, al configurar la receta en 'Multifocales / Bifocales', es de suma importancia agregar la Altura de Pasillo y el tipo de diseño del cristal en el campo de adición, ya que influye directamente en el pedido del laboratorio tallador."
    },
    {
      q: "¿Por qué una venta rápida o un pedido no aparece automáticamente facturado?",
      a: "El sistema utiliza un sistema de pre-factura o Borrador de Factura. Esto permite que el personal de ventas registre el cobro y la seña al cliente de forma inmediata, y luego tesorería o la administración procese la factura fiscal en bloque al final del día para optimizar la comunicación con la AFIP."
    },
    {
      q: "¿Cómo se modifica el stock de un cristal o armazón al venderlo?",
      a: "El stock de armazones o accesorios restará de forma automática en una unidad al procesarse una Venta Rápida o al confirmarse un Pedido Clínico si el producto fue enlazado desde el catálogo de inventario por su SKU correspondiente."
    },
    {
      q: "¿Cómo configuro las coberturas de una Obra Social o Mutual?",
      a: "Vaya a Ajustes -> Obras Sociales. Allí puede crear una mutual y definir las coberturas monetarias específicas para cada categoría (ej: reintegro del 100% en cristales monofocales o cobertura fija de $15.000 para multifocales)."
    }
  ];

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          art.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "todos" || art.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-300">
      {/* Hero Header with Search */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 p-8 md:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
            <HelpCircle className="w-4 h-4 text-blue-300 animate-pulse" /> Centro de Soporte & Ayuda
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            ¿Cómo te ayudamos hoy?
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            Explora las guías operativas paso a paso y la documentación técnica de todos los módulos de tu sistema de gestión óptica.
          </p>
          
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por palabra clave (ej. monofocal, factura, usuario, afip, ajustes)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full pl-12 pr-4 rounded-xl bg-white text-slate-900 shadow-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
            />
          </div>
        </div>
        {/* Abstract decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent opacity-20 pointer-events-none skew-x-12"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Categorías</h3>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:block bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/40 p-5 rounded-2xl border border-blue-100/50 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Recursos Extras
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Consulte y descargue las especificaciones técnicas completas y los manuales corporativos de Óptica Paracao.
            </p>
            <div className="space-y-2">
              <a 
                href="/Manual de Procedimiento.md" 
                target="_blank" 
                className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 transition-colors"
              >
                <span>Manual de Procedimiento</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a 
                href="/1. Módulos y Funciones del Sistema.txt" 
                target="_blank" 
                className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 transition-colors"
              >
                <span>Estructura de Módulos</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8 lg:col-span-3">
          {/* Transposition Calculator (Always visible at top of soporte or when searched) */}
          {(selectedCategory === "soporte" || selectedCategory === "todos") && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 border border-indigo-700/30 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/25 rounded-xl text-indigo-400">
                  <RefreshCw className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Calculadora de Transposición Óptica</h3>
                  <p className="text-slate-300 text-xs">Convierte rápidamente recetas cilindro-positivo a cilindro-negativo para pedidos de taller.</p>
                </div>
              </div>

              <form onSubmit={handleCalculateTransposition} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Esfera (ESF)</label>
                  <input
                    type="number"
                    step="0.25"
                    placeholder="0.00"
                    value={sph}
                    onChange={(e) => setSph(e.target.value)}
                    className="h-10 w-full mt-1.5 px-3 rounded-lg bg-slate-900 text-white border border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cilindro (CIL)</label>
                  <input
                    type="number"
                    step="0.25"
                    placeholder="0.00"
                    value={cyl}
                    onChange={(e) => setCyl(e.target.value)}
                    className="h-10 w-full mt-1.5 px-3 rounded-lg bg-slate-900 text-white border border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Eje (EJE)</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    placeholder="90"
                    value={axis}
                    onChange={(e) => setAxis(e.target.value)}
                    className="h-10 w-full mt-1.5 px-3 rounded-lg bg-slate-900 text-white border border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="h-10 flex-1 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-bold text-xs rounded-lg uppercase tracking-wider shadow-lg shadow-indigo-500/20"
                  >
                    Calcular
                  </button>
                  <button
                    type="button"
                    onClick={handleClearTransposition}
                    className="h-10 px-3 bg-slate-850 hover:bg-slate-850 transition-colors text-slate-350 text-xs font-bold rounded-lg border border-slate-750/50"
                  >
                    Borrar
                  </button>
                </div>
              </form>

              {transposed && (
                <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-500/30 grid grid-cols-3 gap-4 text-center animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Esfera Transpuesta</p>
                    <p className="text-xl font-black mt-1 text-white">{transposed.sph}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Cilindro Transpuesto</p>
                    <p className="text-xl font-black mt-1 text-white">{transposed.cyl}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Eje Transpuesto</p>
                    <p className="text-xl font-black mt-1 text-white">{transposed.axis}°</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Articles list */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" /> Guías de Funcionamiento
            </h2>
            
            {filteredArticles.length > 0 ? (
              filteredArticles.map((art) => (
                <div 
                  key={art.id} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 animate-in fade-in-50 duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md">
                        {categories.find(c => c.id === art.category)?.label}
                      </span>
                      <h3 className="text-lg font-bold dark:text-white mt-2">{art.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{art.shortDesc}</p>
                    </div>
                  </div>
                  
                  <hr className="border-slate-100 dark:border-slate-800" />
                  
                  <div className="text-slate-700 dark:text-slate-300">
                    {art.content}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {art.tags.map(tag => (
                      <span 
                        key={tag} 
                        onClick={() => setSearchTerm(tag)}
                        className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
                <Info className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold dark:text-white">No encontramos guías con tu búsqueda</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Prueba buscando palabras alternativas como "monofocal", "cliente", "factura", "afip" o selecciona otra categoría.
                </p>
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedCategory("todos"); }} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>

          {/* Contact Support Form (Always visible at bottom of Soporte page) */}
          {(selectedCategory === "soporte" || selectedCategory === "todos") && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold dark:text-white">Contacto con Soporte LYNX</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">¿Tienes algún inconveniente técnico que no pudiste resolver? Envíanos tu consulta.</p>
                </div>
              </div>

              <form onSubmit={handleSendSupport} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tu Nombre</label>
                    <input
                      type="text"
                      placeholder="Ej. Ignacio Contable"
                      value={supportName}
                      onChange={(e) => setSupportName(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nivel de Urgencia</label>
                    <select
                      value={supportUrgency}
                      onChange={(e) => setSupportUrgency(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="baja">Consulta General (Baja)</option>
                      <option value="media">Error Operativo (Media)</option>
                      <option value="alta">Sistema Detenido / Bloqueo (Alta / Crítico)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mensaje o Detalle del Error</label>
                  <textarea
                    rows={4}
                    placeholder="Describe el error, código de error si existe, y qué acción estabas intentando realizar..."
                    value={supportMsg}
                    onChange={(e) => setSupportMsg(e.target.value)}
                    className="p-3 rounded-lg border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm dark:text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                >
                  <MessageSquare className="w-4 h-4" /> Enviar por WhatsApp a Soporte LYNX
                </button>
              </form>
            </div>
          )}

          {/* FAQs section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Preguntas Frecuentes (FAQs)
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {faqs.map((faq, index) => {
                const faqId = `faq-${index}`;
                const isOpen = openFaq === faqId;
                return (
                  <div 
                    key={faqId}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-250"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faqId)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-sm dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-4"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/50 animate-in slide-in-from-top-1 duration-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
