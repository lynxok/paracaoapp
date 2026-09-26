import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Building, 
  Banknote, 
  CheckCircle2, 
  Circle, 
  DollarSign, 
  TrendingDown, 
  ArrowRight, 
  Calendar, 
  Tag, 
  CheckSquare, 
  Square, 
  History, 
  Filter, 
  Search, 
  AlertCircle,
  FileSpreadsheet,
  Percent,
  Receipt,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CashBox, Transaction } from '../../types';

interface PosnetReconciliationProps {
  boxes: CashBox[];
  transactions: Transaction[];
  selectedBoxId?: string;
  onLiquidateBatch: (params: {
    sourceBoxId: string;
    destinationBoxId: string;
    transactionIds: string[];
    couponUpdates: Record<string, string>;
    grossAmount: number;
    commission: number;
    taxes: number;
    vat: number;
    otherExpenses: number;
    netAmount: number;
    notes?: string;
    date?: string;
  }) => Promise<void>;
  onUpdateCoupon: (txId: string, couponNumber: string) => Promise<void>;
  onSelectBox?: (boxId: string) => void;
}

export function PosnetReconciliation({
  boxes,
  transactions,
  selectedBoxId: initialBoxId,
  onLiquidateBatch,
  onUpdateCoupon,
  onSelectBox
}: PosnetReconciliationProps) {
  // Filter posnet boxes
  const posnetBoxes = useMemo(() => {
    return boxes.filter(b => b.type === 'posnet' || b.type === 'credit_card');
  }, [boxes]);

  // Destination boxes (Bank transfers or Physical Cash boxes)
  const destinationBoxes = useMemo(() => {
    return boxes.filter(b => b.type === 'bank' || b.type === 'cash' || b.type === 'digital');
  }, [boxes]);

  const [activeBoxId, setActiveBoxId] = useState<string>(() => {
    if (initialBoxId && posnetBoxes.some(b => b.id === initialBoxId)) {
      return initialBoxId;
    }
    return posnetBoxes[0]?.id || '';
  });

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'history'>('pending');
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [couponDrafts, setCouponDrafts] = useState<Record<string, string>>({});
  const [destinationBoxId, setDestinationBoxId] = useState<string>(() => destinationBoxes[0]?.id || '');
  
  // Deduction states
  const [commissionAmount, setCommissionAmount] = useState<string>('');
  const [taxesAmount, setTaxesAmount] = useState<string>('');
  const [vatAmount, setVatAmount] = useState<string>('');
  const [otherExpensesAmount, setOtherExpensesAmount] = useState<string>('');
  const [liquidationNotes, setLiquidationNotes] = useState<string>('');
  const [liquidationDate, setLiquidationDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Synchronize when initialBoxId changes externally or when posnetBoxes load
  React.useEffect(() => {
    if (initialBoxId && posnetBoxes.some(b => b.id === initialBoxId)) {
      setActiveBoxId(initialBoxId);
    } else if ((!activeBoxId || !posnetBoxes.some(b => b.id === activeBoxId)) && posnetBoxes.length > 0) {
      setActiveBoxId(posnetBoxes[0].id);
    }
  }, [initialBoxId, posnetBoxes, activeBoxId]);

  React.useEffect(() => {
    if ((!destinationBoxId || !destinationBoxes.some(b => b.id === destinationBoxId)) && destinationBoxes.length > 0) {
      setDestinationBoxId(destinationBoxes[0].id);
    }
  }, [destinationBoxes, destinationBoxId]);

  const currentPosnetBox = useMemo(() => {
    return boxes.find(b => b.id === activeBoxId);
  }, [boxes, activeBoxId]);

  // Income transactions for current posnet box
  const posnetTransactions = useMemo(() => {
    if (!activeBoxId) return [];
    return transactions.filter(tx => {
      const matchBox = tx.boxId === activeBoxId || 
                       tx.boxId === `bank-${activeBoxId}` || 
                       (tx.method && currentPosnetBox?.name.toLowerCase() === tx.method.toLowerCase());
      return matchBox && tx.type === 'income';
    });
  }, [transactions, activeBoxId, currentPosnetBox]);

  const pendingTransactions = useMemo(() => {
    return posnetTransactions.filter(tx => !tx.reconciled);
  }, [posnetTransactions]);

  const liquidatedTransactions = useMemo(() => {
    return posnetTransactions.filter(tx => tx.reconciled);
  }, [posnetTransactions]);

  // Filtered by search query
  const displayedPending = useMemo(() => {
    if (!searchQuery.trim()) return pendingTransactions;
    const q = searchQuery.toLowerCase().trim();
    return pendingTransactions.filter(tx => 
      tx.concept?.toLowerCase().includes(q) ||
      tx.clientName?.toLowerCase().includes(q) ||
      (couponDrafts[tx.id] || tx.couponNumber || '').toLowerCase().includes(q) ||
      tx.amount.toString().includes(q)
    );
  }, [pendingTransactions, searchQuery, couponDrafts]);

  // Calculations on selected batch
  const selectedTransactions = useMemo(() => {
    return pendingTransactions.filter(tx => selectedTxIds.includes(tx.id));
  }, [pendingTransactions, selectedTxIds]);

  const grossSelected = useMemo(() => {
    return selectedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [selectedTransactions]);

  const commission = parseFloat(commissionAmount) || 0;
  const taxes = parseFloat(taxesAmount) || 0;
  const vat = parseFloat(vatAmount) || 0;
  const otherExpenses = parseFloat(otherExpensesAmount) || 0;
  const totalDeductions = commission + taxes + vat + otherExpenses;

  const netRealAmount = Math.max(0, grossSelected - totalDeductions);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    const allIds = displayedPending.map(tx => tx.id);
    setSelectedTxIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedTxIds([]);
  };

  const handleToggleSelect = (txId: string) => {
    setSelectedTxIds(prev => 
      prev.includes(txId) ? prev.filter(id => id !== txId) : [...prev, txId]
    );
  };

  const handleCouponChange = (txId: string, value: string) => {
    setCouponDrafts(prev => ({ ...prev, [txId]: value }));
  };

  const handleSaveCoupon = async (txId: string) => {
    const val = couponDrafts[txId] || '';
    await onUpdateCoupon(txId, val);
  };

  const handleExecuteLiquidation = async () => {
    if (selectedTxIds.length === 0 || !activeBoxId || !destinationBoxId) return;

    if (totalDeductions > grossSelected) {
      alert("El total de deducciones no puede ser superior al importe bruto seleccionado.");
      return;
    }

    const destBox = boxes.find(b => b.id === destinationBoxId);
    const confirmMsg = `¿Confirmar liquidación de ${selectedTxIds.length} cobro(s)?\n\n` +
      `• Total Bruto: $${grossSelected.toLocaleString()}\n` +
      `• Deducciones: -$${totalDeductions.toLocaleString()}\n` +
      `• NETO REAL A DEPOSITAR: $${netRealAmount.toLocaleString()}\n` +
      `• Caja de Destino: ${destBox?.name || 'Caja'}`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setIsProcessing(true);
      await onLiquidateBatch({
        sourceBoxId: activeBoxId,
        destinationBoxId,
        transactionIds: selectedTxIds,
        couponUpdates: couponDrafts,
        grossAmount: grossSelected,
        commission,
        taxes,
        vat,
        otherExpenses,
        netAmount: netRealAmount,
        notes: liquidationNotes.trim() || undefined,
        date: liquidationDate
      });

      // Reset form
      setSelectedTxIds([]);
      setCommissionAmount('');
      setTaxesAmount('');
      setVatAmount('');
      setOtherExpensesAmount('');
      setLiquidationNotes('');
    } catch (e) {
      console.error("Error executing liquidation:", e);
      alert("Ocurrió un error al procesar la liquidación.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (posnetBoxes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
        <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-800 dark:text-white">No hay Cajas de Posnet registradas</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
          Para utilizar la conciliación de cupones y liquidaciones, crea una caja de tipo "3. Posnet" en el módulo de Cajas o en Configuración.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Selector de Terminal Posnet y Métricas */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-100 dark:border-purple-900/40">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Terminal de Cobro Posnet
            </span>
            <div className="flex items-center gap-3 mt-1">
              <select
                value={activeBoxId}
                onChange={(e) => {
                  setActiveBoxId(e.target.value);
                  setSelectedTxIds([]);
                  if (onSelectBox) onSelectBox(e.target.value);
                }}
                className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-base outline-none focus:ring-2 focus:ring-purple-600"
              >
                {posnetBoxes.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Saldo Bruto: ${(b.initialBalance + b.incomes - b.expenses).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* KPI Mini-cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pendiente Liquidar</p>
            <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">
              ${pendingTransactions.reduce((acc, tx) => acc + tx.amount, 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">{pendingTransactions.length} cupones</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Seleccionado</p>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              ${grossSelected.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              {selectedTxIds.length} marcado(s)
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Ya Liquidado</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              ${liquidatedTransactions.reduce((acc, tx) => acc + tx.amount, 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">{liquidatedTransactions.length} procesados</p>
          </div>
        </div>
      </div>

      {/* Subtabs: Pendientes / Historial */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={cn(
            "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
            activeSubTab === 'pending'
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <CheckSquare className="w-4 h-4" /> Cobros Pendientes ({pendingTransactions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={cn(
            "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
            activeSubTab === 'history'
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <History className="w-4 h-4" /> Historial de Liquidaciones ({liquidatedTransactions.length})
        </button>
      </div>

      {activeSubTab === 'pending' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Table Toolbar */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectedTxIds.length === displayedPending.length ? handleDeselectAll : handleSelectAll}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {selectedTxIds.length > 0 && selectedTxIds.length === displayedPending.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                        <span>Deseleccionar Todos</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                        <span>Seleccionar Todos ({displayedPending.length})</span>
                      </>
                    )}
                  </button>
                  {selectedTxIds.length > 0 && (
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/50">
                      {selectedTxIds.length} seleccionados
                    </span>
                  )}
                </div>

                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, monto o cupón..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Transactions List */}
              <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                {displayedPending.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
                    <p className="text-sm font-bold">No hay cobros pendientes de liquidar</p>
                    <p className="text-xs text-slate-400">Todos los ingresos de este Posnet se encuentran conciliados.</p>
                  </div>
                ) : (
                  displayedPending.map(tx => {
                    const isSelected = selectedTxIds.includes(tx.id);
                    const currentCoupon = couponDrafts[tx.id] !== undefined ? couponDrafts[tx.id] : (tx.couponNumber || '');

                    return (
                      <div
                        key={tx.id}
                        className={cn(
                          "p-4 flex items-center justify-between gap-4 transition-colors",
                          isSelected 
                            ? "bg-purple-50/40 dark:bg-purple-950/20 border-l-4 border-l-purple-600" 
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        )}
                      >
                        {/* Checkbox & Basic info */}
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(tx.id)}
                            className={cn(
                              "w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0",
                              isSelected 
                                ? "bg-purple-600 border-purple-600 text-white shadow-sm" 
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-purple-400"
                            )}
                          >
                            {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                          </button>

                          <div className="flex-1 min-w-0" onClick={() => handleToggleSelect(tx.id)}>
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer">
                              {tx.concept}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">{tx.date} {tx.time}</span>
                              {tx.clientName && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-500 font-bold truncate">Cliente: {tx.clientName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Editable N° de Cupón */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">N° Cupón</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Ej: 1042"
                                value={currentCoupon}
                                onChange={(e) => handleCouponChange(tx.id, e.target.value)}
                                onBlur={() => handleSaveCoupon(tx.id)}
                                className={cn(
                                  "w-24 h-7 px-2 text-xs font-mono font-bold rounded-lg border outline-none text-center transition-all",
                                  currentCoupon 
                                    ? "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600"
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            +${tx.amount.toLocaleString()}
                          </p>
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase",
                            isSelected ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" : "text-slate-400"
                          )}>
                            {isSelected ? 'Seleccionado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Liquidación & Deducciones (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  Liquidación de Cobranza
                </h4>
                <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg">
                  {selectedTxIds.length} cobro(s)
                </span>
              </div>

              {/* Resumen Bruto */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Bruto Seleccionado</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    ${grossSelected.toLocaleString()}
                  </p>
                </div>
                <CreditCard className="w-6 h-6 text-purple-500" />
              </div>

              {/* Deducciones Inputs */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Deducciones y Aranceles de Liquidación
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Comisión Posnet ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={commissionAmount}
                        onChange={(e) => setCommissionAmount(e.target.value)}
                        className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Impuestos / Retenciones ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={taxesAmount}
                        onChange={(e) => setTaxesAmount(e.target.value)}
                        className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">IVA ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={vatAmount}
                        onChange={(e) => setVatAmount(e.target.value)}
                        className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Otros Gastos ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={otherExpensesAmount}
                        onChange={(e) => setOtherExpensesAmount(e.target.value)}
                        className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {totalDeductions > 0 && (
                  <div className="flex justify-between items-center text-xs px-1 text-rose-600 dark:text-rose-400 font-bold">
                    <span>Total Deducciones:</span>
                    <span>-${totalDeductions.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Caja de Destino ("Depósito") */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-500" /> Caja de Destino (Donde se Deposita)
                </label>
                <select
                  value={destinationBoxId}
                  onChange={(e) => setDestinationBoxId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                >
                  <option value="">Seleccionar caja destino...</option>
                  {destinationBoxes.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.type === 'cash' ? 'Caja Efectivo' : 'Transferencias / Banco'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Observaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fecha de Depósito</label>
                  <input
                    type="date"
                    value={liquidationDate}
                    onChange={(e) => setLiquidationDate(e.target.value)}
                    className="w-full h-9 px-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">N° Resumen / Ref.</label>
                  <input
                    type="text"
                    placeholder="Ej: Resumen #4820"
                    value={liquidationNotes}
                    onChange={(e) => setLiquidationNotes(e.target.value)}
                    className="w-full h-9 px-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Total Neto Real Card */}
              <div className="p-5 bg-gradient-to-br from-purple-900 to-slate-900 rounded-2xl text-white shadow-xl space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                  Importe Neto Real a Depositar
                </p>
                <p className="text-3xl font-black text-emerald-400">
                  ${netRealAmount.toLocaleString()}
                </p>
                <p className="text-[10px] text-purple-200/70">
                  Bruto: ${grossSelected.toLocaleString()} | Descuentos: -${totalDeductions.toLocaleString()}
                </p>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleExecuteLiquidation}
                disabled={selectedTxIds.length === 0 || !destinationBoxId || isProcessing}
                className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-black text-sm shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Procesando liquidación...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirmar Liquidación y Trasladar Fondos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* History View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              Historial de Cobros Liquidados en {currentPosnetBox?.name}
            </h4>
            <span className="text-xs text-slate-400 font-bold">
              {liquidatedTransactions.length} registros conciliados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-[10px] uppercase text-slate-500 font-black tracking-widest">
                <tr>
                  <th className="p-4">Fecha Cobro</th>
                  <th className="p-4">Concepto / Cliente</th>
                  <th className="p-4 text-center">N° Cupón</th>
                  <th className="p-4 text-center">ID Liquidación</th>
                  <th className="p-4 text-right">Importe Bruto</th>
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {liquidatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                      No hay historial de cobros liquidados aún.
                    </td>
                  </tr>
                ) : (
                  liquidatedTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        {tx.date} {tx.time}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{tx.concept}</p>
                        {tx.clientName && (
                          <p className="text-[10px] text-blue-500 font-bold">Cliente: {tx.clientName}</p>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {tx.couponNumber ? (
                          <span className="px-2 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono font-bold rounded-lg border border-purple-100 dark:border-purple-900/40">
                            #{tx.couponNumber}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 italic">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono text-[10px] text-slate-500">
                        {tx.liquidationId || 'Liquidado'}
                      </td>
                      <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        +${tx.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                          Liquidado
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
