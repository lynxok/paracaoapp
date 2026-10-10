import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive 
                ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-red-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20'
              }`}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
