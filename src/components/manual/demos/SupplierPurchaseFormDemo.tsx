import React from "react";
import { Truck, FileText, CheckCircle2, Building } from "lucide-react";
import { ManualHighlight } from "../ManualHighlight";

interface SupplierPurchaseFormDemoProps {
  currentStepIndex: number;
}

export function SupplierPurchaseFormDemo({ currentStepIndex }: SupplierPurchaseFormDemoProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-400" />
          <h4 className="text-sm font-bold text-white">Comprobante de Compra a Proveedor</h4>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold border border-blue-500/30">
          Modo Demo 1:1
        </span>
      </div>

      <div className="space-y-3">
        <ManualHighlight active={currentStepIndex === 2} label="Proveedor">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Proveedor Seleccionado</span>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Distribuidora Óptica del Litoral S.A. (CUIT 30-71029384-9)</span>
            </div>
          </div>
        </ManualHighlight>

        <ManualHighlight active={currentStepIndex === 3} label="Factura e Importes">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300">Factura A N° 0001-00048291</span>
              <span className="text-amber-400 font-mono">Vencimiento: 15 días</span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                <span className="text-slate-300">Cristales Orgánicos Antirreflex x50 par</span>
                <span className="text-white font-bold">$300.000</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                <span className="text-slate-300">Estuches Rígidos Premium x100 un</span>
                <span className="text-white font-bold">$150.000</span>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-800 text-xs font-bold">
              <span className="text-slate-400">Total Comprobante + IVA</span>
              <span className="text-emerald-400 text-sm font-mono">$450.000</span>
            </div>
          </div>
        </ManualHighlight>

        <ManualHighlight active={currentStepIndex === 4} label="Impacto en Cta Cte">
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirmar e Impactar en Stock y Cta Cte
            </button>
          </div>
        </ManualHighlight>
      </div>
    </div>
  );
}
