import React from "react";
import { Tutorial } from "../../data/tutorials";
import { ManualDemoCursor } from "./ManualDemoCursor";
import { ManualHighlight } from "./ManualHighlight";
import { ClientFormDemo } from "./demos/ClientFormDemo";
import { OrderLensFormDemo } from "./demos/OrderLensFormDemo";
import { SupplierPurchaseFormDemo } from "./demos/SupplierPurchaseFormDemo";
import { CashClosingFormDemo } from "./demos/CashClosingFormDemo";
import { 
  Glasses, 
  Search, 
  UserPlus, 
  CheckCircle, 
  ShoppingCart, 
  Plus, 
  FileText, 
  Wallet, 
  Truck, 
  Sparkles,
  Check
} from "lucide-react";

interface TutorialAnimationStageProps {
  tutorial: Tutorial;
  currentStepIndex: number;
  isAutoplay: boolean;
}

export function TutorialAnimationStage({ tutorial, currentStepIndex }: TutorialAnimationStageProps) {
  // Cursor coordinate mappings per step
  const getCursorPos = () => {
    switch (tutorial.id) {
      case "venta-lente-especial":
        switch (currentStepIndex) {
          case 0: return { x: 18, y: 15, label: "Navegando a Pedidos" };
          case 1: return { x: 82, y: 15, label: "Clic en + Nuevo Pedido" };
          case 2: return { x: 60, y: 28, label: "Seleccionando Multifocal HD" };
          case 3: return { x: 45, y: 48, label: "Cargando receta OD/OI" };
          case 4: return { x: 30, y: 72, label: "Asignando cliente María González" };
          case 5: return { x: 70, y: 72, label: "Seleccionando Ray-Ban Aviator" };
          case 6: return { x: 85, y: 88, label: "Clic en Agregar al Carrito" };
          default: return { x: 50, y: 50, label: "Paso preparado" };
        }

      case "pedido-monofocal":
        switch (currentStepIndex) {
          case 0: return { x: 20, y: 28, label: "Seleccionando Monofocal" };
          case 1: return { x: 50, y: 48, label: "Ingresando ESF -2.00, CIL -0.50, EJE 180°" };
          case 2: return { x: 70, y: 72, label: "Seleccionando Armazón Asignado" };
          case 3: return { x: 85, y: 88, label: "Clic en Agregar al Carrito" };
          default: return { x: 50, y: 50, label: "Paso preparado" };
        }

      case "pedido-multifocal":
        switch (currentStepIndex) {
          case 0: return { x: 60, y: 28, label: "Seleccionando Multifocal HD" };
          case 1: return { x: 50, y: 48, label: "Ingresando ADD +2.00 / Altura 18mm" };
          case 2: return { x: 70, y: 72, label: "Asignando Armazón Ray-Ban" };
          case 3: return { x: 85, y: 88, label: "Clic en Agregar al Carrito" };
          default: return { x: 50, y: 50, label: "Paso preparado" };
        }

      case "registrar-cliente":
        switch (currentStepIndex) {
          case 0: return { x: 18, y: 15, label: "Navegando a Clientes" };
          case 1: return { x: 82, y: 15, label: "Clic en + Registrar Cliente" };
          case 2: return { x: 50, y: 40, label: "Ingresando DNI, Nombre y WhatsApp" };
          case 3: return { x: 82, y: 85, label: "Clic en Guardar Ficha de Paciente" };
          case 4: return { x: 50, y: 65, label: "Ficha creada en sistema" };
          default: return { x: 50, y: 50, label: "Paso preparado" };
        }

      case "cargar-compra-proveedor":
        switch (currentStepIndex) {
          case 0: return { x: 18, y: 15, label: "Ir a Proveedores > Compras" };
          case 1: return { x: 82, y: 15, label: "+ Cargar Nueva Compra" };
          case 2: return { x: 50, y: 30, label: "Distribuidora Óptica del Litoral" };
          case 3: return { x: 50, y: 58, label: "Factura A y Subtotal $450.000" };
          case 4: return { x: 82, y: 88, label: "Confirmando impacto en stock" };
          default: return { x: 50, y: 50, label: "Paso preparado" };
        }

      case "arqueo-de-caja":
        switch (currentStepIndex) {
          case 0: return { x: 18, y: 15, label: "Ir a Finanzas > Arqueo" };
          case 1: return { x: 50, y: 50, label: "Recuento físico $185.000 (Diferencia $0)" };
          case 2: return { x: 82, y: 85, label: "Realizar Cierre de Arqueo y Turno" };
          default: return { x: 50, y: 50, label: "Paso preparado" };
        }

      case "conciliacion-bancaria":
        switch (currentStepIndex) {
          case 0: return { x: 18, y: 15, label: "Ir a Caja / Finanzas" };
          case 1: return { x: 40, y: 25, label: "Seleccionando Banco Macro" };
          case 2: return { x: 60, y: 52, label: "Tildando cupones coincidentes" };
          case 3: return { x: 85, y: 35, label: "Verificando Diferencia $0,00" };
          case 4: return { x: 82, y: 88, label: "Guardando Conciliación" };
          default: return { x: 50, y: 50, label: "Paso preparado" };
        }

      case "procesar-borrador-facturacion":
        switch (currentStepIndex) {
          case 0: return { x: 18, y: 15, label: "Ir a Borradores Facturación" };
          case 1: return { x: 40, y: 40, label: "Seleccionando Borrador B-1049" };
          case 2: return { x: 60, y: 45, label: "Revisando Consumidor Final" };
          case 3: return { x: 75, y: 65, label: "Asignando Factura B - PV 0005" };
          case 4: return { x: 82, y: 88, label: "Procesando CAE y Descarga PDF" };
          default: return { x: 50, y: 50, label: "Paso preparado" };
        }

      default:
        return { x: 50, y: 50, label: "Demo activa" };
    }
  };

  const cursorPos = getCursorPos();

  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[460px] bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-xl">
      {/* Top Simulated App Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          <span className="ml-2 font-mono text-[10px] text-slate-400">
            opticagestionparacao.lnx.com.ar/{tutorial.category}
          </span>
        </div>
        <div className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Fidelidad Visual 1:1 - Modo Demo</span>
        </div>
      </div>

      {/* Simulated Screen Content Body */}
      <div className="flex-1 relative rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 overflow-hidden flex flex-col justify-center gap-4">
        {/* Client Registration Demo */}
        {tutorial.id === "registrar-cliente" && (
          <ClientFormDemo currentStepIndex={currentStepIndex} />
        )}

        {/* Order Lens Demos (Monofocal, Multifocal, Especial) */}
        {(tutorial.id === "venta-lente-especial" || tutorial.id === "pedido-monofocal" || tutorial.id === "pedido-multifocal") && (
          <OrderLensFormDemo
            currentStepIndex={currentStepIndex}
            lensType={tutorial.id === "pedido-monofocal" ? "monofocal" : tutorial.id === "pedido-multifocal" ? "multifocal" : "especial"}
          />
        )}

        {/* Supplier Purchase Demo */}
        {tutorial.id === "cargar-compra-proveedor" && (
          <SupplierPurchaseFormDemo currentStepIndex={currentStepIndex} />
        )}

        {/* Cash Closing Demo */}
        {tutorial.id === "arqueo-de-caja" && (
          <CashClosingFormDemo currentStepIndex={currentStepIndex} />
        )}

        {/* Quick Sale Demo */}
        {tutorial.id === "venta-no-recetada" && (
          <div className="flex flex-col gap-3 h-full justify-between">
            <div className="flex items-center justify-between">
              <ManualHighlight active={currentStepIndex === 0} label="Paso 1">
                <span className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-blue-400" /> Ventas Rápidas
                </span>
              </ManualHighlight>
              <span className="text-xs text-slate-400 font-mono">Mostrador Terminal #1</span>
            </div>

            <ManualHighlight active={currentStepIndex === 1} label="Paso 2">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Lentes de Sol Ray-Ban Aviator Pol.</span>
                  <span className="text-emerald-400 font-mono">$150.000</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Líquido Limpiador Antifog 60ml</span>
                  <span className="font-mono">$8.000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                  <span className="text-slate-300">Total a Cobrar</span>
                  <span className="text-emerald-400 font-mono">$158.000</span>
                </div>
              </div>
            </ManualHighlight>

            <ManualHighlight active={currentStepIndex === 2} label="Paso 3">
              <button className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Cobrar con Mercado Pago QR
              </button>
            </ManualHighlight>
          </div>
        )}

        {/* Bank Reconciliation Demo */}
        {tutorial.id === "conciliacion-bancaria" && (
          <div className="flex flex-col gap-3 h-full justify-between">
            <div className="flex items-center justify-between">
              <ManualHighlight active={currentStepIndex === 0} label="Paso 1">
                <span className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-blue-400" /> Caja / Conciliación
                </span>
              </ManualHighlight>

              <ManualHighlight active={currentStepIndex === 1} label="Paso 2">
                <span className="px-3 py-1.5 bg-slate-900 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-lg">
                  Banco Macro Cta Cte (Agosto 2026)
                </span>
              </ManualHighlight>
            </div>

            <ManualHighlight active={currentStepIndex === 2} label="Paso 3">
              <div className="space-y-1.5 text-xs">
                {[
                  { desc: "Cupón Posnet Tarjeta Visa Debito #4819", monto: "$45.000", ok: true },
                  { desc: "Transferencia Recibida Mercado Pago #9201", monto: "$60.000", ok: true },
                  { desc: "Acreditación Cupones Naranja x3", monto: "$115.000", ok: true }
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={row.ok} readOnly className="w-4 h-4 accent-blue-500 rounded" />
                      <span className="text-slate-300">{row.desc}</span>
                    </div>
                    <span className="font-mono font-bold text-white">{row.monto}</span>
                  </div>
                ))}
              </div>
            </ManualHighlight>

            <div className="grid grid-cols-2 gap-2">
              <ManualHighlight active={currentStepIndex === 3} label="Paso 4">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Diferencia Auditada</span>
                  <span className="text-emerald-400 font-bold font-mono text-base">$ 0,00</span>
                </div>
              </ManualHighlight>

              <ManualHighlight active={currentStepIndex === 4} label="Paso 5">
                <button className="w-full h-full bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                  Cerrar Conciliación
                </button>
              </ManualHighlight>
            </div>
          </div>
        )}

        {/* Billing Draft Demo */}
        {tutorial.id === "procesar-borrador-facturacion" && (
          <div className="flex flex-col gap-3 h-full justify-between">
            <div className="flex items-center justify-between">
              <ManualHighlight active={currentStepIndex === 0} label="Paso 1">
                <span className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" /> Borradores Facturación
                </span>
              </ManualHighlight>

              <ManualHighlight active={currentStepIndex === 1} label="Paso 2">
                <span className="px-3 py-1.5 bg-blue-600/30 border border-blue-500 text-blue-300 text-xs font-bold rounded-lg">
                  Borrador N° B-1049 (Carlos Páez)
                </span>
              </ManualHighlight>
            </div>

            <ManualHighlight active={currentStepIndex === 2 || currentStepIndex === 3} label={currentStepIndex === 2 ? "Paso 3" : "Paso 4"}>
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Cliente: Carlos Páez (Consumidor Final)</span>
                  <span className="text-emerald-400 font-mono">$85.000</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Comprobante</span>
                    <span className="text-white font-bold">Factura B</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Punto de Venta</span>
                    <span className="text-white font-bold">PV 0005 (Electrónico AFIP)</span>
                  </div>
                </div>
              </div>
            </ManualHighlight>

            <ManualHighlight active={currentStepIndex === 4} label="Paso 5">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-300">Factura Autorizada AFIP</p>
                  <p className="text-[10px] text-emerald-400/80 font-mono">CAE: 74392019482012</p>
                </div>
                <button className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg">
                  Descargar PDF
                </button>
              </div>
            </ManualHighlight>
          </div>
        )}

        {/* Animated Virtual Cursor */}
        <ManualDemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={true} label={cursorPos.label} />
      </div>
    </div>
  );
}
