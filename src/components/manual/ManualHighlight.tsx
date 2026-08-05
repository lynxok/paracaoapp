import React from "react";

interface ManualHighlightProps {
  active: boolean;
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function ManualHighlight({ active, children, label, className = "" }: ManualHighlightProps) {
  if (!active) return <>{children}</>;

  return (
    <div className={`relative group ${className}`}>
      {/* Dynamic Glowing Border Overlay */}
      <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-80 blur-sm animate-pulse pointer-events-none z-10" />
      
      {/* Outer Outline */}
      <div className="relative border-2 border-blue-400 dark:border-blue-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20 transition-all duration-300">
        {children}
        {label && (
          <span className="absolute -top-3 left-3 bg-blue-600 text-white text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md shadow-md z-30">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
