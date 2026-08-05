import React, { useState, useEffect } from "react";
import { Tutorial } from "../../data/tutorials";
import { TutorialStepList } from "./TutorialStepList";
import { TutorialAnimationStage } from "./TutorialAnimationStage";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Play, 
  Pause, 
  BookOpen,
  Sparkles
} from "lucide-react";

interface GuidedManualModalProps {
  isOpen: boolean;
  tutorial: Tutorial;
  onClose: () => void;
  onSelectOtherTutorial: () => void;
}

export function GuidedManualModal({ isOpen, tutorial, onClose, onSelectOtherTutorial }: GuidedManualModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Reset state when tutorial changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsAutoplay(true);
  }, [tutorial]);

  // Autoplay loop timer
  useEffect(() => {
    if (!isAutoplay || !isOpen) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= tutorial.steps.length - 1) {
          return 0; // Repeat from beginning
        }
        return prev + 1;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoplay, isOpen, tutorial.steps.length]);

  if (!isOpen) return null;

  const currentStep = tutorial.steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / tutorial.steps.length) * 100);

  const handleNext = () => {
    setIsAutoplay(false);
    if (currentStepIndex < tutorial.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    setIsAutoplay(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleRepeatDemo = () => {
    setCurrentStepIndex(0);
    setIsAutoplay(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 relative">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 flex items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Tutorial Guiado
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {tutorial.estimatedMinutes} min aprox.
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {tutorial.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSelectOtherTutorial}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
            >
              Cambiar Tutorial
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Cerrar Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-1.5 overflow-hidden relative">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto p-4 sm:p-6 gap-6 custom-scrollbar">
          {/* Left Column: Steps List */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Pasos del Flujo ({currentStepIndex + 1} de {tutorial.steps.length})
                </h4>
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
                    isAutoplay
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {isAutoplay ? (
                    <>
                      <Pause className="w-3 h-3" /> Auto-play Activo
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Reanudar Auto-play
                    </>
                  )}
                </button>
              </div>

              <TutorialStepList
                steps={tutorial.steps}
                currentStepIndex={currentStepIndex}
                onSelectStep={(idx) => {
                  setIsAutoplay(false);
                  setCurrentStepIndex(idx);
                }}
              />
            </div>

            {/* Current Step Focus Banner */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                Paso Activo Actual
              </span>
              <h5 className="text-sm font-bold text-white">{currentStep.title}</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{currentStep.description}</p>
            </div>
          </div>

          {/* Right Column: Animation Stage */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[360px]">
            <TutorialAnimationStage
              tutorial={tutorial}
              currentStepIndex={currentStepIndex}
              isAutoplay={isAutoplay}
            />
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRepeatDemo}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Repetir Demo
            </button>
            <button
              onClick={onSelectOtherTutorial}
              className="sm:hidden px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
            >
              Otros Tutoriales
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-all border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === tutorial.steps.length - 1}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-lg shadow-blue-600/30"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 ml-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
