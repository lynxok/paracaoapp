import React, { useState, useMemo, useEffect } from "react";
import { 
  Calculator, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Building, 
  Plus, 
  Trash2, 
  ArrowLeftRight, 
  Wallet, 
  PieChart,
  ChevronRight,
  PlusCircle,
  History,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  LayoutGrid,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  X,
  ChevronDown
} from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { CashBox, Transaction, Denomination, FinanceCategory, Cheque } from "../types";
import { BoxForm } from "../components/finance/BoxForm";
import { TransactionForm } from "../components/finance/TransactionForm";
import { BankReconciliation } from "../components/finance/BankReconciliation";
import { TransferForm } from "../components/finance/TransferForm";

const INITIAL_DENOMINATIONS: Denomination[] = [
  { id: 1, value: 1000, label: "$1000" },
  { id: 2, value: 500, label: "$500" },
  { id: 3, value: 200, label: "$200" },
  { id: 4, value: 100, label: "$100" },
  { id: 5, value: 50, label: "$50" },
  { id: 6, value: 20, label: "$20" },
  { id: 7, value: 10, label: "$10" },
];

import { useFinance } from "../context/FinanceContext";

const FINANCE_CATEGORIES: FinanceCategory[] = [
  // Incomes
  { id: 'ventas', name: 'Ventas Óptica', type: 'income' },
  { id: 'reparaciones', name: 'Reparaciones', type: 'income' },
  { id: 'obras-sociales', name: 'Obras Sociales', type: 'income' },
  { id: 'varios-ingreso', name: 'Varios', type: 'income' },
  { id: 'transferencia', name: 'Transferencia Int.', type: 'income' },
  // Expenses
  { id: 'alquiler', name: 'Alquiler', type: 'expense' },
  { id: 'sueldos', name: 'Sueldos', type: 'expense' },
  { id: 'laboratorios', name: 'Laboratorios', type: 'expense' },
  { id: 'mercaderia', name: 'Mercadería', type: 'expense' },
  { id: 'impuestos', name: 'Impuestos/Servicios', type: 'expense' },
  { id: 'marketing', name: 'Marketing/Publicidad', type: 'expense' },
  { id: 'limpieza', name: 'Limpieza e Insumos', type: 'expense' },
  { id: 'varios-egreso', name: 'Varios / Otros', type: 'expense' },
  { id: 'transferencia', name: 'Transferencia Int.', type: 'expense' },
];

type FinanceTab = 'cajas' | 'ingresos' | 'egresos' | 'transferencias' | 'conciliacion' | 'cheques';

export function Finance() {
  const { 
    boxes, 
    transactions, 
    suppliers, 
    cheques = [],
    addTransaction, 
    addBox, 
    transferFunds, 
    addSupplierTransaction, 
    linkPaymentToInvoices,
    toggleTransactionReconciliation,
    updateBoxClosingBalance,
    voidTransaction,
    updateChequeStatus
  } = useFinance();
  const [activeTab, setActiveTab] = useState<FinanceTab>('cajas');

  // Cheques specific states
  const [chequeStatusFilter, setChequeStatusFilter] = useState('Pendiente');
  const [chequeSearch, setChequeSearch] = useState('');
  const [accreditingCheque, setAccreditingCheque] = useState<Cheque | null>(null);
  const [accreditBoxId, setAccreditBoxId] = useState('');
  const [isAccreditModalOpen, setIsAccreditModalOpen] = useState(false);

  const chequesAlerts = useMemo(() => {
    const todayVal = new Date();
    todayVal.setHours(0,0,0,0);
    const next7Days = new Date(todayVal);
    next7Days.setDate(todayVal.getDate() + 7);

    let expiredCount = 0;
    let upcomingCount = 0;

    (cheques || []).forEach(c => {
      if (c.status === 'Pendiente') {
        const dueDate = new Date(c.dueDate + 'T12:00:00');
        if (dueDate < todayVal) {
          expiredCount++;
        } else if (dueDate <= next7Days) {
          upcomingCount++;
        }
      }
    });

    return {
      expiredCount,
      upcomingCount,
      totalAlerts: expiredCount + upcomingCount
    };
  }, [cheques]);
  const [selectedBoxId, setSelectedBoxId] = useState<string>('consolidated');
  const [denominations, setDenominations] = useState<Denomination[]>(INITIAL_DENOMINATIONS);
  const [showAddBox, setShowAddBox] = useState(false);
  const [showAddDenom, setShowAddDenom] = useState(false);
  const [newDenom, setNewDenom] = useState("");
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileAmount, setReconcileAmount] = useState<string>("");
  const [reconcileTarget, setReconcileTarget] = useState<string>("");
  const [reconcileSource, setReconcileSource] = useState<string>("");
  const [todayInsuranceClaims, setTodayInsuranceClaims] = useState<number>(0);

  useEffect(() => {
    async function loadTodayClaims() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase.from('insurance_claims').select('total_amount').eq('date', todayStr);
        if (!error && data) {
          const total = data.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0);
          setTodayInsuranceClaims(total);
        }
      } catch (e) {
        console.error("Error loading today claims in Finance:", e);
      }
    }
    loadTodayClaims();
  }, []);

  const selectedBox = useMemo(() => 
    boxes.find(b => b.id === selectedBoxId)
  , [boxes, selectedBoxId]);

  const boxTransactions = useMemo(() => {
    if (selectedBoxId === 'consolidated') return transactions;
    return transactions.filter(t => t.boxId === selectedBoxId);
  }, [transactions, selectedBoxId]);

  const consolidatedStats = useMemo(() => {
    return boxes.reduce((acc, box) => ({
      balance: acc.balance + (box.initialBalance + box.incomes - box.expenses),
      incomes: acc.incomes + box.incomes,
      expenses: acc.expenses + box.expenses,
      initial: acc.initial + box.initialBalance
    }), { balance: 0, incomes: 0, expenses: 0, initial: 0 });
  }, [boxes]);

  const totalPhysical = useMemo(() => {
    if (!selectedBox || !selectedBox.physicalCount) return 0;
    return denominations.reduce((acc, current) => {
      const count = parseInt(selectedBox.physicalCount?.[current.id] || "0");
      return acc + (count * current.value);
    }, 0);
  }, [denominations, selectedBox]);

  const difference = useMemo(() => {
    if (!selectedBox || selectedBox.type !== 'cash') return 0;
    return totalPhysical - (selectedBox.expectedCash || 0);
  }, [totalPhysical, selectedBox]);

  const handleUpdateTransaction = (tx: Transaction, extraData?: { supplierId: string, invoiceIds: string[] }) => {
    addTransaction(tx);
    
    if (extraData) {
      addSupplierTransaction(extraData.supplierId, {
        date: tx.date,
        voucherNumber: `OP-${Date.now().toString().slice(-6)}`,
        amount: tx.amount,
        type: 'payment',
        status: 'paid',
        description: tx.concept
      });

      if (extraData.invoiceIds.length > 0) {
        linkPaymentToInvoices(extraData.supplierId, extraData.invoiceIds);
      }
    }
    
    setActiveTab('cajas');
  };

  const handleUpdateCount = (denomId: number, value: string) => {
    // This part should technically be in context or handled locally if it's transient
    // For now, let's assume it's transient and we don't save physical count to context yet
  };

  const handleAddDenomination = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(newDenom);
    if (!isNaN(val) && val > 0) {
      const id = Date.now();
      setDenominations([{ id, value: val, label: `$${val}` }, ...denominations].sort((a, b) => b.value - a.value));
      setNewDenom("");
      setShowAddDenom(false);
    }
  };

  const removeDenomination = (id: number) => {
    setDenominations(denominations.filter(d => d.id !== id));
  };

  const handleAddBox = (box: CashBox) => {
    addBox(box);
    setShowAddBox(false);
    setSelectedBoxId(box.id);
  };

  const handleReconcile = () => {
    const amount = parseFloat(reconcileAmount);
    if (isNaN(amount) || amount <= 0 || !reconcileTarget || !selectedBoxId) return;
    
    transferFunds(selectedBoxId, reconcileTarget, amount, "Conciliación Tarjeta de Crédito");
    setShowReconcileModal(false);
    setReconcileAmount("");
  };

  const handleTransfer = (fromId: string, toId: string, amount: number, concept: string, dateStr: string) => {
    transferFunds(fromId, toId, amount, concept);
    setActiveTab('cajas');
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Reconcile Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Conciliar Tarjeta de Crédito</h3>
              <p className="text-sm text-slate-500">Mueve los fondos de la cuenta de TC a una cuenta bancaria.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Monto a Conciliar</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="0.00"
                    value={reconcileAmount}
                    onChange={(e) => setReconcileAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Destino (Banco)</label>
                <select 
                  className="w-full h-12 px-4 mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                  value={reconcileTarget}
                  onChange={(e) => setReconcileTarget(e.target.value)}
                >
                  <option value="">Seleccionar banco...</option>
                  {boxes.filter(b => b.type === 'bank' || b.type === 'digital').map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowReconcileModal(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReconcile}
                disabled={!reconcileAmount || !reconcileTarget}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                Ejecutar Conciliación
              </button>
            </div>
          </div>
        </div>
      )}

      {chequesAlerts.totalAlerts > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
            <div>
              <p className="text-sm font-bold">Cheques Pendientes de Atención</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Hay {chequesAlerts.expiredCount} cheques vencidos y {chequesAlerts.upcomingCount} cheques próximos a vencer (dentro de los próximos 7 días).
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('cheques')} 
            className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-all shrink-0 shadow-sm"
          >
            Gestionar Cheques
          </button>
        </div>
      )}

      {/* Module Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 w-full sm:w-auto shrink-0">
          <button 
            onClick={() => setActiveTab('cajas')}
            className={cn(
              "shrink-0 flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'cajas' ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <LayoutGrid className="w-4 h-4" /> Cajas
          </button>
          <button 
            onClick={() => setActiveTab('ingresos')}
            className={cn(
              "shrink-0 flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'ingresos' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <ArrowUpCircle className="w-4 h-4" /> Ingresos
          </button>
          <button 
            onClick={() => setActiveTab('egresos')}
            className={cn(
              "shrink-0 flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'egresos' ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <ArrowDownCircle className="w-4 h-4" /> Egresos
          </button>
          <button 
            onClick={() => setActiveTab('transferencias')}
            className={cn(
              "shrink-0 flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'transferencias' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <ArrowLeftRight className="w-4 h-4" /> Transferencias
          </button>
          <button 
            onClick={() => setActiveTab('cheques')}
            className={cn(
              "shrink-0 flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'cheques' ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <FileText className="w-4 h-4" /> Cheques
          </button>
          <button 
            onClick={() => setActiveTab('conciliacion')}
            className={cn(
              "shrink-0 flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'conciliacion' ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <History className="w-4 h-4" /> Conciliación
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 px-3 py-1.5 sm:py-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Disponible:</p>
          <p className={cn(
            "text-base sm:text-lg font-black",
            consolidatedStats.balance >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600"
          )}>
            ${consolidatedStats.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {activeTab === 'cajas' ? (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            <button 
              onClick={() => setSelectedBoxId('consolidated')}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                selectedBoxId === 'consolidated' 
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500"
              )}
            >
              <PieChart className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm font-bold">Consolidado</p>
                <p className={cn("text-xs opacity-80", selectedBoxId === 'consolidated' ? "text-blue-100" : "text-slate-500")}>Todas las cajas</p>
              </div>
              <p className="font-bold text-sm">
                ${consolidatedStats.balance.toLocaleString()}
              </p>
            </button>

            <div className="pt-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tus Cajas</p>
                <button 
                  onClick={() => setShowAddBox(true)}
                  className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {boxes.map(box => (
                  <button 
                    key={box.id}
                    onClick={() => setSelectedBoxId(box.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                      selectedBoxId === box.id 
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-950 dark:text-white dark:border-slate-800 shadow-lg" 
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedBoxId === box.id ? "bg-white/10 dark:bg-white/10" : "bg-slate-50 dark:bg-slate-800"
                    )}>
                      {box.type === 'cash' ? <Banknote className="w-4 h-4" /> : 
                       box.type === 'bank' ? <Building className="w-4 h-4" /> : 
                       box.type === 'credit_card' ? <CreditCard className="w-4 h-4" /> :
                       <Wallet className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">{box.name}</p>
                      <p className={cn("text-[10px]", selectedBoxId === box.id ? "opacity-70" : "text-slate-400 group-hover:text-slate-500 uppercase tracking-tighter font-medium")}>
                        {box.type === 'cash' ? 'Efectivo' : box.type === 'bank' ? 'Banco' : 'Digital'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">${(box.initialBalance + box.incomes - box.expenses).toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {showAddBox && (
              <BoxForm onClose={() => setShowAddBox(false)} onSubmit={handleAddBox} />
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6 w-full">
            {selectedBoxId === 'consolidated' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-500" /> Capital Total
                    </p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">${consolidatedStats.balance.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Suma de todas las cajas activas</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-slate-400" /> Saldo Inicial
                    </p>
                    <p className="text-2xl font-black text-slate-700 dark:text-slate-300">${consolidatedStats.initial.toLocaleString()}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" /> Ingresos Totales
                    </p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+${consolidatedStats.incomes.toLocaleString()}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-rose-500" /> Egresos Totales
                    </p>
                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400">-${consolidatedStats.expenses.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Distribución de Fondos</h3>
                      <p className="text-sm text-slate-500">Composición de tu liquidez actual</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {boxes.map(box => {
                        const balance = box.initialBalance + box.incomes - box.expenses;
                        const percentage = consolidatedStats.balance > 0 ? (balance / consolidatedStats.balance) * 100 : 0;
                        return (
                          <div key={box.id} className="space-y-1.5">
                            <div className="flex justify-between items-end">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{box.name}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{box.type}</span>
                              </div>
                              <span className="text-sm font-black text-slate-900 dark:text-white">${balance.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Últimos Movimientos Consolidados</span>
                    </div>
                    <button className="text-xs text-blue-600 font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                      <Filter className="w-3 h-3" /> Filtrar
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/30 text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                        <tr>
                          <th className="px-6 py-3 font-black">Fecha/Hora</th>
                          <th className="px-6 py-3 font-black">Caja</th>
                          <th className="px-6 py-3 font-black">Concepto</th>
                          <th className="px-6 py-3 font-black">Categoría</th>
                          <th className="px-6 py-3 font-black text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-slate-900 dark:text-white font-medium">{tx.date}</span>
                                <span className="text-[10px] text-slate-400">{tx.time}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                {boxes.find(b => b.id === tx.boxId)?.name || 'Desconocida'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white">{tx.concept}</span>
                                {tx.clientName && <span className="text-[10px] text-blue-500">Cliente: {tx.clientName}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-500 capitalize">
                              {FINANCE_CATEGORIES.find(c => c.id === tx.category)?.name || tx.category}
                            </td>
                            <td className={cn(
                              "px-6 py-4 text-right font-black",
                              tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      selectedBox?.type === 'cash' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" :
                      selectedBox?.type === 'bank' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                      selectedBox?.type === 'credit_card' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
                      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                    )}>
                      {selectedBox?.type === 'cash' ? <Banknote className="w-6 h-6" /> : 
                       selectedBox?.type === 'bank' ? <Building className="w-6 h-6" /> : 
                       selectedBox?.type === 'credit_card' ? <CreditCard className="w-6 h-6" /> :
                       <Wallet className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedBox?.name}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {selectedBox?.type === 'cash' ? 'Fondo de Caja Físico' : 
                         selectedBox?.type === 'bank' ? 'Cuenta Bancaria' : 
                         selectedBox?.type === 'credit_card' ? 'Cuenta de Tarjetas Pendiente' :
                         'Portal de Pagos Digital'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Saldo Inicial</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">${selectedBox?.initialBalance.toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Ingresos</p>
                      <p className="text-2xl font-black text-emerald-600">+${selectedBox?.incomes.toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Egresos</p>
                      <p className="text-2xl font-black text-rose-600">-${selectedBox?.expenses.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex justify-between items-center">
                      <span>Movimientos de la Caja</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/30 text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                          <tr>
                            <th className="px-6 py-3 font-black">Fecha/Hora</th>
                            <th className="px-6 py-3 font-black">Concepto</th>
                            <th className="px-6 py-3 font-black text-right">Monto</th>
                            <th className="px-6 py-3 font-black text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {boxTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No hay movimientos registrados hoy</td>
                            </tr>
                          ) : (
                            boxTransactions.map(tx => (
                              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-slate-900 dark:text-white font-medium">{tx.date}</span>
                                    <span className="text-[10px] text-slate-400">{tx.time}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 flex flex-col">
                                  <span className="font-bold text-slate-900 dark:text-white">{tx.concept}</span>
                                  <span className="text-[10px] text-slate-400 lowercase">{FINANCE_CATEGORIES.find(c => c.id === tx.category)?.name} · {tx.method}</span>
                                </td>
                                <td className={cn(
                                  "px-6 py-4 text-right font-black",
                                  tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                                )}>
                                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Estás seguro de anular el movimiento "${tx.concept}" por $${tx.amount.toLocaleString()}?`)) {
                                        voidTransaction(tx.id);
                                      }
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors border border-rose-200 dark:border-rose-800/50"
                                    title="Anular venta / movimiento"
                                  >
                                    Anular
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-1">
                  {selectedBox?.type === 'cash' ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col sticky top-24">
                      <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <Calculator className="w-6 h-6" /> Recuento Físico
                          </h3>
                          <p className="text-blue-100 text-sm mt-1 opacity-80">{selectedBox.name}</p>
                        </div>
                        <button 
                          onClick={() => setShowAddDenom(!showAddDenom)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        {showAddDenom && (
                          <form onSubmit={handleAddDenomination} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wider">Nueva Denominación</p>
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                value={newDenom}
                                onChange={(e) => setNewDenom(e.target.value)}
                                className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold outline-none"
                                placeholder="$ Monto"
                                autoFocus
                              />
                              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Añadir</button>
                            </div>
                          </form>
                        )}

                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Esperado en Sistema (Efectivo/Banco)</p>
                              <p className="text-xl font-black text-slate-900 dark:text-white">${selectedBox.expectedCash?.toLocaleString()}</p>
                            </div>
                            <DollarSign className="w-6 h-6 text-blue-600" />
                          </div>

                          {todayInsuranceClaims > 0 && (
                            <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40">
                              <div>
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest">A Cobrar por Obra Social / Prepaga (Hoy)</p>
                                <p className="text-lg font-black text-amber-700 dark:text-amber-400 font-mono">${todayInsuranceClaims.toLocaleString('es-AR')}</p>
                              </div>
                              <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-md">Reintegros</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {denominations.map(denom => (
                            <div key={denom.id} className="flex justify-between items-center gap-4 group">
                              <div className="flex items-center gap-2">
                                <button onClick={() => removeDenomination(denom.id)} className="p-1 opacity-0 group-hover:opacity-100 text-red-500 rounded"><Trash2 className="w-3 h-3" /></button>
                                <label className="text-sm font-black text-slate-600 dark:text-slate-300 w-12">{denom.label}</label>
                              </div>
                              <input 
                                className="h-10 px-3 w-32 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 text-right font-black focus:ring-2 focus:ring-blue-600 outline-none text-sm dark:text-white shadow-sm" 
                                type="number" 
                                placeholder="0" 
                                value={selectedBox.physicalCount?.[denom.id] || ""}
                                onChange={(e) => handleUpdateCount(denom.id, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                          <div className="flex justify-between text-xl font-black text-slate-900 dark:text-white">
                            <span>Total Arqueo:</span>
                            <span>${totalPhysical.toLocaleString()}</span>
                          </div>
                          <div className={cn(
                            "flex justify-between font-black text-sm p-3 rounded-lg",
                            difference === 0 ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20" : 
                            difference > 0 ? "text-blue-700 bg-blue-50 dark:bg-blue-900/20" : 
                            "text-rose-700 bg-rose-50 dark:bg-rose-900/20"
                          )}>
                            <span>Diferencia:</span>
                            <span>{difference > 0 ? '+' : ''}{difference.toLocaleString()}</span>
                          </div>
                        </div>
                        <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl shadow-xl transition-all active:scale-95">
                          Confirmar Cierre de Caja
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 sticky top-24">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Acciones de Cuenta</h3>
                        <div className="grid gap-2">
                          {selectedBox?.type === 'credit_card' && (
                            <button 
                              onClick={() => setShowReconcileModal(true)}
                              className="flex items-center justify-between p-4 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <ArrowLeftRight className="w-4 h-4" />
                                <span className="text-sm font-bold">Conciliar y Transferir</span>
                              </div>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setActiveTab('ingresos')} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all group">
                            <div className="flex items-center gap-3"><Plus className="w-4 h-4 text-emerald-500" /><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Registrar Ingreso</span></div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </button>
                          <button onClick={() => setActiveTab('egresos')} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 transition-all group">
                            <div className="flex items-center gap-3"><Trash2 className="w-4 h-4 text-rose-500" /><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Registrar Egreso</span></div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </button>
                          <button className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all group">
                            <div className="flex items-center gap-3"><ArrowLeftRight className="w-4 h-4 text-indigo-500" /><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Transferir Fondos</span></div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'conciliacion' ? (
        <BankReconciliation 
          boxes={boxes} 
          transactions={transactions} 
          onToggleReconciliation={toggleTransactionReconciliation} 
          onUpdateClosing={updateBoxClosingBalance} 
        />
      ) : activeTab === 'cheques' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cheques Pendientes</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {cheques.filter(c => c.status === 'Pendiente').length}{' '}
                <span className="text-xs font-normal text-slate-500">
                  (${cheques.filter(c => c.status === 'Pendiente').reduce((sum, c) => sum + c.amount, 0).toLocaleString()})
                </span>
              </p>
            </div>
            <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl shadow-sm text-amber-800 dark:text-amber-300">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Próximos a Vencer</p>
              <p className="text-2xl font-black">
                {chequesAlerts.upcomingCount}{' '}
                <span className="text-xs font-normal">
                  (${cheques.filter(c => {
                    const todayVal = new Date();
                    todayVal.setHours(0,0,0,0);
                    const next7Days = new Date(todayVal);
                    next7Days.setDate(todayVal.getDate() + 7);
                    const dueDate = new Date(c.dueDate + 'T12:00:00');
                    return c.status === 'Pendiente' && dueDate >= todayVal && dueDate <= next7Days;
                  }).reduce((sum, c) => sum + c.amount, 0).toLocaleString()})
                </span>
              </p>
            </div>
            <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-2xl shadow-sm text-red-800 dark:text-red-300">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Cheques Vencidos</p>
              <p className="text-2xl font-black">
                {chequesAlerts.expiredCount}{' '}
                <span className="text-xs font-normal">
                  (${cheques.filter(c => {
                    const todayVal = new Date();
                    todayVal.setHours(0,0,0,0);
                    return c.status === 'Pendiente' && new Date(c.dueDate + 'T12:00:00') < todayVal;
                  }).reduce((sum, c) => sum + c.amount, 0).toLocaleString()})
                </span>
              </p>
            </div>
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-sm text-emerald-800 dark:text-emerald-300">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Cheques Cobrados</p>
              <p className="text-2xl font-black">
                {cheques.filter(c => c.status === 'Cobrado').length}{' '}
                <span className="text-xs font-normal">
                  (${cheques.filter(c => c.status === 'Cobrado').reduce((sum, c) => sum + c.amount, 0).toLocaleString()})
                </span>
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input 
                type="text"
                value={chequeSearch}
                onChange={e => setChequeSearch(e.target.value)}
                placeholder="Buscar por Nº, Banco o Titular..."
                className="w-full pl-9 pr-4 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
              {['Pendiente', 'Proximos', 'Vencidos', 'Cobrado', 'Anulado', 'Rechazado', 'Todos'].map(f => (
                <button
                  key={f}
                  onClick={() => setChequeStatusFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0",
                    chequeStatusFilter === f 
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {f === 'Proximos' ? 'A Vencer' : f === 'Todos' ? 'Todos' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Cheques Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-150 dark:border-slate-850">
                    <th className="p-4">Nº Cheque</th>
                    <th className="p-4">Banco</th>
                    <th className="p-4">Importe</th>
                    <th className="p-4">Vencimiento</th>
                    <th className="p-4">Plazo</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Cliente / Proveedor</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCheques.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-12 text-slate-400 font-medium">
                        No se encontraron cheques con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredCheques.map(c => {
                      const todayVal = new Date();
                      todayVal.setHours(0,0,0,0);
                      const next7Days = new Date(todayVal);
                      next7Days.setDate(todayVal.getDate() + 7);
                      const dueDate = new Date(c.dueDate + 'T12:00:00');
                      
                      let statusBadge = (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {c.status}
                        </span>
                      );

                      if (c.status === 'Cobrado') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-455 uppercase tracking-wider">
                            Cobrado
                          </span>
                        );
                      } else if (c.status === 'Anulado' || c.status === 'Rechazado') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-650 dark:text-red-450 uppercase tracking-wider">
                            {c.status}
                          </span>
                        );
                      } else if (c.status === 'Pendiente') {
                        if (dueDate < todayVal) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-650 dark:text-red-450 uppercase tracking-wider animate-pulse">
                              Vencido
                            </span>
                          );
                        } else if (dueDate <= next7Days) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-455 uppercase tracking-wider">
                              A Vencer
                            </span>
                          );
                        } else {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-455 uppercase tracking-wider">
                              Pendiente
                            </span>
                          );
                        }
                      }

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{c.number}</td>
                          <td className="p-4 text-slate-555 dark:text-slate-400">{c.bank}</td>
                          <td className="p-4 font-black text-slate-900 dark:text-white">${c.amount.toLocaleString()}</td>
                          <td className="p-4 font-medium">{new Date(c.dueDate + 'T12:00:00').toLocaleDateString()}</td>
                          <td className="p-4 text-slate-500">{c.terms}</td>
                          <td className="p-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase",
                              c.type === 'Emitido' ? "bg-rose-50 text-rose-600 dark:bg-rose-900/25" : "bg-blue-50 text-blue-600 dark:bg-blue-900/25"
                            )}>
                              {c.type}
                            </span>
                          </td>
                          <td className="p-4">
                            {c.type === 'Emitido' ? (
                              <span className="font-bold text-slate-700 dark:text-slate-300">{c.supplierName || 'Proveedor'}</span>
                            ) : (
                              <span className="font-bold text-slate-700 dark:text-slate-300">{c.clientName || 'Cliente'}</span>
                            )}
                            {c.observation && <p className="text-[10px] text-slate-450 italic mt-0.5 font-medium">{c.observation}</p>}
                          </td>
                          <td className="p-4">{statusBadge}</td>
                          <td className="p-4 text-right">
                            {c.status === 'Pendiente' && (
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => {
                                    setAccreditingCheque(c);
                                    setAccreditBoxId(boxes[0]?.id || '');
                                    setIsAccreditModalOpen(true);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition-all"
                                  title="Acreditar / Cobrar Cheque"
                                >
                                  Acreditar
                                </button>
                                <button 
                                  onClick={() => {
                                    if(window.confirm("¿Seguro que deseas marcar este cheque como RECHAZADO?")) {
                                      updateChequeStatus(c.id, 'Rechazado');
                                    }
                                  }}
                                  className="px-2 py-1 bg-red-650 hover:bg-red-750 text-white rounded font-bold text-[10px] transition-all"
                                  title="Marcar como Rechazado"
                                >
                                  Rechazar
                                </button>
                                <button 
                                  onClick={() => {
                                    if(window.confirm("¿Seguro que deseas marcar este cheque como ANULADO?")) {
                                      updateChequeStatus(c.id, 'Anulado');
                                    }
                                  }}
                                  className="px-2 py-1 bg-slate-350 hover:bg-slate-450 text-slate-750 dark:text-slate-300 rounded font-bold text-[10px] transition-all"
                                  title="Marcar como Anulado"
                                >
                                  Anular
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accreditation Modal */}
          {isAccreditModalOpen && accreditingCheque && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">Acreditar / Cobrar Cheque</h3>
                  <button onClick={() => { setIsAccreditModalOpen(false); setAccreditingCheque(null); }} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl space-y-1.5 border border-slate-250/20">
                    <p className="text-xs text-slate-500 font-medium">Cheque Nº: <span className="font-bold text-slate-800 dark:text-slate-200">{accreditingCheque.number}</span></p>
                    <p className="text-xs text-slate-500 font-medium">Banco: <span className="font-bold text-slate-800 dark:text-slate-200">{accreditingCheque.bank}</span></p>
                    <p className="text-xs text-slate-500 font-medium">Monto: <span className="font-black text-emerald-600 dark:text-emerald-450">${accreditingCheque.amount.toLocaleString()}</span></p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Caja / Banco de Destino</label>
                    <select
                      value={accreditBoxId}
                      onChange={e => setAccreditBoxId(e.target.value)}
                      className="w-full h-11 px-3 mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                    >
                      {boxes.map(box => (
                        <option key={box.id} value={box.id}>{box.name} ({box.type === 'cash' ? 'Efectivo' : 'Banco'})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button 
                    onClick={() => { setIsAccreditModalOpen(false); setAccreditingCheque(null); }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 transition-all text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      updateChequeStatus(accreditingCheque.id, 'Cobrado', accreditBoxId);
                      setIsAccreditModalOpen(false);
                      setAccreditingCheque(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    Confirmar Cobro
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'transferencias' ? (
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
          <TransferForm 
            boxes={boxes}
            onSubmit={handleTransfer}
          />
        </div>
      ) : (
        /* Render Form for Ingresos or Egresos */
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
          <TransactionForm 
            type={activeTab === 'ingresos' ? 'income' : 'expense'} 
            boxes={boxes}
            categories={FINANCE_CATEGORIES}
            suppliers={suppliers}
            onSubmit={handleUpdateTransaction}
          />
        </div>
      )}
    </div>
  );
}
