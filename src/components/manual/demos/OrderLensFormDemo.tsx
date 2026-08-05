import React from "react";
import { Glasses, ShoppingCart, UserCheck, Eye, Sparkles } from "lucide-react";
import { ManualHighlight } from "../ManualHighlight";

interface OrderLensFormDemoProps {
  currentStepIndex: number;
  lensType: "monofocal" | "multifocal" | "especial";
}

export function OrderLensFormDemo({ currentStepIndex, lensType }: OrderLensFormDemoProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Glasses className="w-5 h-5 text-blue-400" />
          <h4 className="text-sm font-bold text-white">
            Carga Técnica de Pedido Recetado
          </h4>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold border border-blue-500/30">
          Modo Demo 1:1
        </span>
      </div>

      {/* Selector de Tipo de Lente */}
      <ManualHighlight active={currentStepIndex === 0 || currentStepIndex === 2} label="Tipo de Lente">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "monofocal", label: "Monofocal" },
            { id: "bifocal", label: "Bifocal" },
            { id: "multifocal", label: "Multifocal HD" },
            { id: "contacto", label: "Contactología" }
          ].map((item) => {
            const isSelected = 
              (lensType === "monofocal" && item.id === "monofocal") ||
              (lensType === "multifocal" && item.id === "multifocal") ||
              (lensType === "especial" && item.id === "multifocal");

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                  isSelected
                    ? "bg-blue-600/30 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </ManualHighlight>

      {/* Grilla de Receta Técnica (ESF, CIL, EJE, ADD, DI) */}
      <ManualHighlight active={currentStepIndex === 1 || currentStepIndex === 3} label="Graduación Técnica">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Prescripción OD / OI
            </span>
            <span className="text-[10px] text-blue-400 font-mono">Norma ISO Oftálmica</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
            <div className="bg-slate-900 p-1.5 rounded-lg text-slate-400 font-sans font-bold">Ojo</div>
            <div className="bg-slate-900 p-1.5 rounded-lg text-slate-400">ESF</div>
            <div className="bg-slate-900 p-1.5 rounded-lg text-slate-400">CIL</div>
            <div className="bg-slate-900 p-1.5 rounded-lg text-slate-400">EJE</div>
            <div className="bg-slate-900 p-1.5 rounded-lg text-slate-400">
              {lensType === "multifocal" ? "ADD / ALT" : "DI"}
            </div>

            <div className="p-1.5 font-bold text-blue-400 font-sans">OD</div>
            <div className="bg-slate-900 border border-blue-500/40 p-1.5 rounded-lg text-white font-bold">-2.00</div>
            <div className="bg-slate-900 border border-blue-500/40 p-1.5 rounded-lg text-white font-bold">-0.50</div>
            <div className="bg-slate-900 border border-blue-500/40 p-1.5 rounded-lg text-white font-bold">180°</div>
            <div className="bg-slate-900 border border-blue-500/40 p-1.5 rounded-lg text-white font-bold">
              {lensType === "multifocal" ? "+2.00 / 18mm" : "63mm"}
            </div>

            <div className="p-1.5 font-bold text-blue-400 font-sans">OI</div>
            <div className="bg-slate-900 border border-blue-500/40 p-1.5 rounded-lg text-white font-bold">-1.75</div>
            <div className="bg-slate-900 border border-blue-500/40 p-1.5 rounded-lg text-white font-bold">-0.50</div>
            <div className="bg-slate-900 border border-blue-500/40 p-1.5 rounded-lg text-white font-bold">175°</div>
            <div className="bg-slate-900 border border-blue-500/40 p-1.5 rounded-lg text-white font-bold">
              {lensType === "multifocal" ? "+2.00 / 18mm" : "63mm"}
            </div>
          </div>
        </div>
      </ManualHighlight>

      {/* Paciente y Armazón */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ManualHighlight active={currentStepIndex === 4} label="Paciente">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Paciente Asignado</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white truncate">María González (DNI 32.102.839)</span>
            </div>
          </div>
        </ManualHighlight>

        <ManualHighlight active={currentStepIndex === 5 || currentStepIndex === 2} label="Armazón">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Armazón Seleccionado</span>
            <span className="font-bold text-white truncate block mt-0.5">Ray-Ban Aviator RB3025 Gold</span>
          </div>
        </ManualHighlight>
      </div>

      {/* Botones de Acción */}
      <div className="pt-2 flex justify-end gap-2">
        <ManualHighlight active={currentStepIndex >= 3} label="Acción Final">
          <button
            type="button"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <ShoppingCart className="w-4 h-4" /> Agregar al Carrito de Ventas
          </button>
        </ManualHighlight>
      </div>
    </div>
  );
}
