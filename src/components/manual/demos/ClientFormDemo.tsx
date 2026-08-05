import React from "react";
import { User, Phone, Mail, FileText, Building2, Save, X } from "lucide-react";
import { ManualHighlight } from "../ManualHighlight";

interface ClientFormDemoProps {
  currentStepIndex: number;
}

export function ClientFormDemo({ currentStepIndex }: ClientFormDemoProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> Ficha de Alta de Paciente
        </h4>
        <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold border border-blue-500/30">
          Modo Demo 1:1
        </span>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ManualHighlight active={currentStepIndex === 2} label="DNI / CUIT">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">DNI / CUIT</label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  readOnly
                  value="34.582.910"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </ManualHighlight>

          <ManualHighlight active={currentStepIndex === 2} label="Nombre Completo">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  readOnly
                  value="Roberto Fernández"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </ManualHighlight>

          <ManualHighlight active={currentStepIndex === 2} label="Teléfono WhatsApp">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Teléfono WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  readOnly
                  value="+54 343 4591029"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </ManualHighlight>

          <ManualHighlight active={currentStepIndex === 2} label="Obra Social">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Obra Social / Mutual</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  readOnly
                  value="OSDE 310 - Plan Familiar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </ManualHighlight>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <ManualHighlight active={currentStepIndex === 3 || currentStepIndex === 4} label="Guardar Cliente">
            <button
              type="button"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <Save className="w-4 h-4" /> Guardar Ficha de Paciente
            </button>
          </ManualHighlight>
        </div>
      </form>
    </div>
  );
}
