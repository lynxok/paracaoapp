import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  DollarSign, 
  TrendingDown, 
  Calculator,
  History,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CashBox, Transaction } from '../../types';

interface BankReconciliationProps {
  boxes: CashBox[];
  transactions: Transaction[];
  onToggleReconciliation: (id: string) => void;
  onUpdateClosing: (boxId: string, balance: number) => void;
}

export function BankReconciliation({ boxes, transactions, onToggleReconciliation, onUpdateClosing }: BankReconciliationProps) {
  const [selectedBoxId, setSelectedBoxId] = useState('');
  const [period, setPeriod] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [currentClosingAmount, setCurrentClosingAmount] = useState<string>('');
  const [bankExpenses, setBankExpenses] = useState<string>('');

  const selectedBox = useMemo(() => boxes.find(b => b.id === selectedBoxId), [boxes, selectedBoxId]);

  const bankBoxes = useMemo(() => boxes.filter(b => b.type === 'bank' || b.type === 'digital'), [boxes]);

  const filteredTransactions = useMemo(() => {
    if (!selectedBoxId) return [];
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const startDate = new Date(period.start);
      const endDate = new Date(period.end);
      return tx.boxId === selectedBoxId && txDate >= startDate && txDate <= endDate;
    });
  }, [transactions, selectedBoxId, period]);

  const lastClosing = selectedBox?.lastClosingBalance || 0;
  const currentClosing = parseFloat(currentClosingAmount) || 0;
  const diff = lastClosing - currentClosing;
  const expenses = parseFloat(bankExpenses) || 0;
  const totalAfterExpenses = diff - expenses;

  const handleConfirmClosing = () => {
    if (selectedBoxId && currentClosingAmount) {
       onUpdateClosing(selectedBoxId, currentClosing);
       // Reset or feedback
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Config & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Configuración de Conciliación
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">1. Seleccionar Banco/Cuenta</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
                  value={selectedBoxId}
                  onChange={(e) => setSelectedBoxId(e.target.value)}
                >
                  <option value="">Seleccionar banco...</option>
                  {bankBoxes.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Desde</label>
                  <input 
                    type="date"
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                    value={period.start}
                    onChange={(e) => setPeriod({...period, start: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Hasta</label>
                  <input 
                    type="date"
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                    value={period.end}
                    onChange={(e) => setPeriod({...period, end: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-500 uppercase">Monto último cierre</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">${lastClosing.toLocaleString()}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Cierre conciliación actual</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 font-black"
                    placeholder="0.00"
                    value={currentClosingAmount}
                    onChange={(e) => setCurrentClosingAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
                <p className="text-xs font-black text-indigo-600 uppercase">Diferencia cierres</p>
                <p className={cn("text-xl font-black", diff === 0 ? "text-slate-900 dark:text-white" : diff > 0 ? "text-emerald-600" : "text-rose-600")}>
                  ${diff.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Gastos bancarios</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-600 font-bold text-rose-600"
                    placeholder="0.00"
                    value={bankExpenses}
                    onChange={(e) => setBankExpenses(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total menos gastos bancarios</p>
                <p className="text-2xl font-black">${totalAfterExpenses.toLocaleString()}</p>
              </div>

              <button 
                onClick={handleConfirmClosing}
                disabled={!selectedBoxId || !currentClosingAmount}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                Confirmar Conciliación
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[700px]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Movimientos a Conciliar</h3>
                  <p className="text-sm text-slate-500">
                    Periodo: <span className="font-bold text-slate-900 dark:text-white">{period.start}</span> al <span className="font-bold text-slate-900 dark:text-white">{period.end}</span>
                  </p>
                </div>
              </div>
              {selectedBoxId && (
                <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Items Conciliados</p>
                  <p className="text-lg font-black text-emerald-600 leading-none">
                    {filteredTransactions.filter(tx => tx.reconciled).length} / {filteredTransactions.length}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
              {!selectedBoxId ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                   <AlertCircle className="w-12 h-12 opacity-20" />
                   <p className="font-bold text-center">Selecciona un banco para comenzar la conciliación</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                   <Calendar className="w-12 h-12 opacity-20" />
                   <p className="font-bold text-center">No hay movimientos en el periodo seleccionado</p>
                </div>
              ) : (
                filteredTransactions.map(tx => (
                  <div 
                    key={tx.id}
                    onClick={() => onToggleReconciliation(tx.id)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                      tx.reconciled 
                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 shadow-sm" 
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        tx.reconciled 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200"
                      )}>
                        {tx.reconciled ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-bold transition-colors", tx.reconciled ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white")}>
                          {tx.concept}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{tx.date} · {tx.time}</span>
                          <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{tx.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-base font-black",
                        tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </p>
                      {tx.reconciled && (
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest group-hover:block transition-all">Conciliado</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
