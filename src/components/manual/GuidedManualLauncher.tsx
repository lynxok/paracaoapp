import React, { useState } from "react";
import { TUTORIALS_DATA, Tutorial } from "../../data/tutorials";
import { GuidedManualModal } from "./GuidedManualModal";
import { 
  BookOpen, 
  MousePointer, 
  Sparkles, 
  X, 
  ChevronRight, 
  Glasses, 
  UserPlus, 
  Truck, 
  Wallet, 
  FileText,
  HelpCircle
} from "lucide-react";

interface GuidedManualLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInteractiveHoverMode: () => void;
}

export function GuidedManualLauncher({ isOpen, onClose, onStartInteractiveHoverMode }: GuidedManualLauncherProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  if (!isOpen && !selectedTutorial) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case "Glasses": return Glasses;
      case "UserPlus": return UserPlus;
      case "Truck": return Truck;
      case "Wallet": return Wallet;
      case "FileText": return FileText;
      default: return BookOpen;
    }
  };

  return (
    <>
      {/* Selector Modal: Modo Hover vs Aprender una Tarea */}
      {isOpen && !selectedTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden text-slate-100 relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Centro de Aprendizaje & Modo Manual
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona cómo deseas explorar Óptica Paracao
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Option 1: Live Interactive Hover Mode */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3 relative group hover:border-blue-500/60 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      <MousePointer className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Explorar pantalla actual
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold">
                          Hover Interactivo
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Muestra explicaciones en tiempo real en la tarjeta flotante al pasar el mouse por cualquier campo o botón.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onStartInteractiveHoverMode();
                  }}
                  className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Activar Explorador por Hover <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Option 2: Learn a Guided Task */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Aprender una Tarea Completa (Tutoriales Guiados)
                  </h4>
                  <span className="text-[11px] text-blue-400 font-semibold">5 Tutoriales Disponibles</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TUTORIALS_DATA.map((tut) => {
                    const IconComp = getIcon(tut.iconName);
                    return (
                      <button
                        key={tut.id}
                        onClick={() => setSelectedTutorial(tut)}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                              {tut.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {tut.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px]">
                          <span className="text-slate-500 font-medium">
                            {tut.steps.length} pasos • {tut.estimatedMinutes} min
                          </span>
                          <span className="text-blue-400 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                            Iniciar <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guided Tutorial Modal */}
      {selectedTutorial && (
        <GuidedManualModal
          isOpen={true}
          tutorial={selectedTutorial}
          onClose={() => setSelectedTutorial(null)}
          onSelectOtherTutorial={() => setSelectedTutorial(null)}
        />
      )}
    </>
  );
}
