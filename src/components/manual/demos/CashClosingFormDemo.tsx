import React from "react";
import { Wallet, DollarSign, CheckCircle2 } from "lucide-react";
import { ManualHighlight } from "../ManualHighlight";

interface CashClosingFormDemoProps {
  currentStepIndex: number;
}

export function CashClosingFormDemo({ currentStepIndex }: CashClosingFormDemoProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-400" />
          <h4 className="text-sm font-bold text-white">Arqueo y Cierre Físico de Caja</h4>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold border border-blue-500/30">
          Modo Demo 1:1
        </span>
      </div>

      <div className="space-y-3">
        <ManualHighlight active={currentStepIndex === 1} label="Recuento Físico">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Saldo Efectivo en Sistema</span>
              <span className="font-mono text-white font-bold text-sm">$185.000,00</span>
            </div>

            <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-slate-800">
              <span>Recuento de Billetes en Cajón</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">$185.000,00</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-bold">
              <span className="text-slate-300">Diferencia de Caja</span>
              <span className="font-mono text-emerald-400 text-sm">$ 0,00</span>
            </div>
          </div>
        </ManualHighlight>

        <ManualHighlight active={currentStepIndex === 2} label="Cierre de Turno">
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <CheckCircle2 className="w-4 h-4" /> Realizar Cierre de Arqueo y Turno
            </button>
          </div>
        </ManualHighlight>
      </div>
    </div>
  );
}
