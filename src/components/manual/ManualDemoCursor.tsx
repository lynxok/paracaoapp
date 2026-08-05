import React from "react";
import { MousePointer, Sparkles } from "lucide-react";

interface ManualDemoCursorProps {
  x: number;
  y: number;
  isClicking?: boolean;
  label?: string;
}

export function ManualDemoCursor({ x, y, isClicking = false, label }: ManualDemoCursorProps) {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-700 ease-in-out flex flex-col items-start"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-10px, -10px)"
      }}
    >
      <div className="relative">
        {/* Pulsing ring when clicking */}
        {isClicking && (
          <span className="absolute -inset-3 rounded-full bg-blue-500/40 animate-ping" />
        )}
        <MousePointer
          className={`w-7 h-7 text-blue-400 drop-shadow-[0_4px_12px_rgba(59,130,246,0.6)] fill-blue-600 transition-transform duration-200 ${
            isClicking ? "scale-90" : "scale-100"
          }`}
        />
      </div>

      {label && (
        <div className="mt-1 px-2.5 py-1 bg-slate-900/90 text-blue-300 border border-blue-500/40 rounded-lg text-[10px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}
