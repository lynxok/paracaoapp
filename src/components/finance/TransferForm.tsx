import React, { useState } from 'react';
import { ArrowLeftRight, DollarSign, FileText, Calendar, Banknote, Building, CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import { CashBox } from '../../types';
import { cn } from '../../lib/utils';

interface TransferFormProps {
  boxes: CashBox[];
  onSubmit: (fromId: string, toId: string, amount: number, concept: string, date: string) => void;
}

export function TransferForm({ boxes, onSubmit }: TransferFormProps) {
  const [fromBoxId, setFromBoxId] = useState('');
  const [toBoxId, setToBoxId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [concept, setConcept] = useState('Traspaso de fondos');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fromBox = boxes.find(b => b.id === fromBoxId);
  const fromBoxBalance = fromBox ? (fromBox.initialBalance + fromBox.incomes - fromBox.expenses) : 0;

  // Filtrar cajas de destino para no incluir la caja de origen
  // y aplicar la restricción de "Bancos asociados" si la cuenta origen los tiene configurados.
  const destinationBoxes = boxes.filter(b => {
    if (b.id === fromBoxId) return false;
    if (fromBox && fromBox.associatedBanks && fromBox.associatedBanks.length > 0) {
      return fromBox.associatedBanks.includes(b.id);
    }
    return true; // Si no tiene bancos asociados, la transferencia es libre
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromBoxId || !toBoxId || amount <= 0) return;
    onSubmit(fromBoxId, toBoxId, amount, concept, date);
  };

  const getBoxIcon = (type: string) => {
    switch (type) {
      case 'cash': return <Banknote className="w-5 h-5" />;
      case 'bank': return <Building className="w-5 h-5" />;
      case 'credit_card': return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const isInsufficientFunds = fromBox ? amount > fromBoxBalance : false;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 text-white bg-indigo-600">
        <h3 className="text-xl font-black flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 animate-pulse" /> 
          Transferencias entre Cuentas
        </h3>
        <p className="text-indigo-100 text-sm mt-1">
          Realiza un traspaso de dinero de forma directa entre tus cajas de titularidad propia
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Columna Origen */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Caja de Origen</label>
              <select 
                className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 font-medium appearance-none"
                value={fromBoxId}
                onChange={(e) => {
                  setFromBoxId(e.target.value);
                  if (e.target.value === toBoxId) {
                    setToBoxId('');
                  }
                }}
                required
              >
                <option value="">Seleccionar cuenta de origen...</option>
                {boxes.map(box => {
                  const bal = box.initialBalance + box.incomes - box.expenses;
                  return (
                    <option key={box.id} value={box.id}>
                      {box.name} (${bal.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>

            {fromBox && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{getBoxIcon(fromBox.type)}</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{fromBox.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">Disponible</p>
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">${fromBoxBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna Destino */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Caja de Destino</label>
              <select 
                className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 font-medium appearance-none"
                value={toBoxId}
                onChange={(e) => setToBoxId(e.target.value)}
                required
                disabled={!fromBoxId}
              >
                <option value="">Seleccionar cuenta de destino...</option>
                {destinationBoxes.map(box => {
                  const bal = box.initialBalance + box.incomes - box.expenses;
                  return (
                    <option key={box.id} value={box.id}>
                      {box.name} (${bal.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>

            {toBoxId && (
              (() => {
                const toBox = boxes.find(b => b.id === toBoxId);
                if (!toBox) return null;
                const toBoxBalance = toBox.initialBalance + toBox.incomes - toBox.expenses;
                return (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{getBoxIcon(toBox.type)}</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{toBox.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase">Saldo actual</p>
                        <p className="text-lg font-black text-slate-700 dark:text-slate-300">${toBoxBalance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Datos de Transferencia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Concepto / Motivo</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                placeholder="Ej: Traspaso a banco para pago de sueldos"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Fecha de Movimiento</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="date"
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Monto a Transferir</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number"
                step="any"
                className={cn(
                  "w-full h-12 pl-8 pr-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 font-black text-lg transition-all",
                  isInsufficientFunds 
                    ? "border-rose-500 focus:ring-rose-500 bg-rose-50/10" 
                    : "border-slate-200 dark:border-slate-800 focus:ring-indigo-600"
                )}
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <button 
              type="submit"
              disabled={!fromBoxId || !toBoxId || amount <= 0 || isInsufficientFunds}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-md shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Realizar Transferencia
            </button>
          </div>
        </div>

        {isInsufficientFunds && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center gap-3 text-rose-700 dark:text-rose-400 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold">
              El monto ingresado (${amount.toLocaleString()}) supera el saldo disponible en {fromBox?.name} (${fromBoxBalance.toLocaleString()}).
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
