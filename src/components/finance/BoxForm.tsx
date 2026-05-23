import React, { useState } from 'react';
import { Plus, Building, Banknote, Wallet, X } from 'lucide-react';
import { CashBox, CashBoxType } from '../../types';
import { cn } from '../../lib/utils';

interface BoxFormProps {
  onClose: () => void;
  onSubmit: (box: CashBox) => void;
}

export function BoxForm({ onClose, onSubmit }: BoxFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CashBoxType>('bank');
  const [initialBalance, setInitialBalance] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBox: CashBox = {
      id: `box-${Date.now()}`,
      name,
      type,
      initialBalance,
      incomes: 0,
      expenses: 0,
      ...(type === 'cash' ? { expectedCash: initialBalance, physicalCount: {} } : {})
    };

    onSubmit(newBox);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nueva Caja</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la Caja</label>
            <input 
              className="w-full h-11 px-4 mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Ej: Santander 3, Caja Chica..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Caja</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['cash', 'bank', 'digital'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "py-3 rounded-xl border flex flex-col items-center gap-1 transition-all",
                    type === t 
                      ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {t === 'cash' ? <Banknote className="w-5 h-5" /> : 
                   t === 'bank' ? <Building className="w-5 h-5" /> : 
                   <Wallet className="w-5 h-5" />}
                  <span className="text-[10px] font-bold capitalize">
                    {t === 'cash' ? 'Efectivo' : t === 'bank' ? 'Banco' : 'Digital'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Saldo Inicial</label>
            <div className="relative mt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number"
                className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                placeholder="0.00"
                value={initialBalance || ''}
                onChange={(e) => setInitialBalance(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Crear Caja
          </button>
        </div>
      </form>
    </div>
  );
}
