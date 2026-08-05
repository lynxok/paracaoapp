import React from "react";
import { TutorialStep } from "../../data/tutorials";
import { CheckCircle2, ChevronRight } from "lucide-react";

interface TutorialStepListProps {
  steps: TutorialStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export function TutorialStepList({ steps, currentStepIndex, onSelectStep }: TutorialStepListProps) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[60vh] pr-1">
      {steps.map((step, idx) => {
        const isActive = idx === currentStepIndex;
        const isCompleted = idx < currentStepIndex;

        return (
          <button
            key={step.number}
            onClick={() => onSelectStep(idx)}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-300 relative group cursor-pointer ${
              isActive
                ? "bg-blue-600/15 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-white"
                : isCompleted
                ? "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/50"
                : "bg-slate-900/20 border-slate-800/60 text-slate-400 opacity-70 hover:opacity-100 hover:bg-slate-900/40"
            }`}
          >
            {/* Step Number or Check */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform ${
                isActive
                  ? "bg-blue-500 text-white shadow-md scale-110"
                  : isCompleted
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.number}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-xs font-bold truncate ${isActive ? "text-blue-400" : "text-slate-200"}`}>
                  {step.title}
                </h4>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {step.description}
              </p>
              {step.actionHint && (
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono text-blue-300/90 border border-blue-500/20">
                  ⚡ {step.actionHint}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
