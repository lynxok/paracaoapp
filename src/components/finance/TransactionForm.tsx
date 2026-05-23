import React, { useState } from 'react';
import { PlusCircle, User, FileText, CreditCard, Banknote, Building, Wallet } from 'lucide-react';
import { CashBox, Transaction, FinanceCategory, Supplier } from '../../types';
import { cn } from '../../lib/utils';

interface TransactionFormProps {
  type: 'income' | 'expense';
  boxes: CashBox[];
  categories: FinanceCategory[];
  suppliers?: Supplier[];
  onSubmit: (transaction: Transaction, extraData?: { supplierId: string, invoiceIds: string[] }) => void;
}

export function TransactionForm({ type, boxes, categories, suppliers = [], onSubmit }: TransactionFormProps) {
  const [expenseSubtype, setExpenseSubtype] = useState<'simple' | 'payment_order'>('simple');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isPaymentOnAccount, setIsPaymentOnAccount] = useState(false);

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [boxId, setBoxId] = useState(boxes[0]?.id || '');
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [method, setMethod] = useState('Efectivo');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept || amount <= 0 || !boxId) return;

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      concept: expenseSubtype === 'payment_order' && selectedSupplierId 
        ? `Orden de Pago: ${suppliers.find(s => s.id === selectedSupplierId)?.name}` 
        : concept,
      amount,
      type,
      category: expenseSubtype === 'payment_order' ? 'laboratorios' : category,
      boxId,
      method,
      clientName: type === 'income' ? clientName : (expenseSubtype === 'payment_order' ? suppliers.find(s => s.id === selectedSupplierId)?.name : undefined),
    };

    const extraData = expenseSubtype === 'payment_order' ? {
      supplierId: selectedSupplierId,
      invoiceIds: selectedInvoiceIds
    } : undefined;

    onSubmit(newTransaction, extraData);
    // Reset form
    setConcept('');
    setAmount(0);
    setClientName('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className={cn(
        "p-6 text-white",
        type === 'income' ? "bg-emerald-600" : "bg-rose-600"
      )}>
        <h3 className="text-xl font-black flex items-center gap-2">
          <PlusCircle className="w-6 h-6" /> 
          {type === 'income' ? 'Registrar Nuevo Ingreso' : 'Registrar Nuevo Egreso'}
        </h3>
        <p className="text-white/80 text-sm mt-1">
          {type === 'income' ? 'Entrada de dinero al sistema' : 'Salida de dinero o gasto registrado'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {type === 'expense' && (
          <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button 
              type="button"
              onClick={() => setExpenseSubtype('simple')}
              className={cn(
                "flex-1 py-3 rounded-xl font-black text-sm transition-all",
                expenseSubtype === 'simple' ? "bg-white dark:bg-slate-700 text-rose-600 shadow-md" : "text-slate-500"
              )}
            >
              Egreso Simple
            </button>
            <button 
              type="button"
              onClick={() => setExpenseSubtype('payment_order')}
              className={cn(
                "flex-1 py-3 rounded-xl font-black text-sm transition-all",
                expenseSubtype === 'payment_order' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-md" : "text-slate-500"
              )}
            >
              Orden de Pago (A Proveedor)
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Info */}
          <div className="space-y-4">
            {expenseSubtype === 'payment_order' ? (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Seleccionar Proveedor</label>
                  <select 
                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium appearance-none"
                    value={selectedSupplierId}
                    onChange={(e) => {
                      setSelectedSupplierId(e.target.value);
                      setSelectedInvoiceIds([]);
                    }}
                    required
                  >
                    <option value="">Buscar proveedor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                {selectedSupplierId && (
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Seleccionar Facturas a Pagar</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {suppliers.find(s => s.id === selectedSupplierId)?.transactions
                        .filter(t => t.type === 'invoice' && t.status === 'pending')
                        .map(inv => (
                          <label 
                            key={inv.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                              selectedInvoiceIds.includes(inv.id) 
                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" 
                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox"
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                checked={selectedInvoiceIds.includes(inv.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedInvoiceIds([...selectedInvoiceIds, inv.id]);
                                    setAmount(prev => prev + inv.amount);
                                  } else {
                                    setSelectedInvoiceIds(selectedInvoiceIds.filter(id => id !== inv.id));
                                    setAmount(prev => Math.max(0, prev - inv.amount));
                                  }
                                }}
                              />
                              <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white">{inv.voucherNumber}</p>
                                <p className="text-[10px] text-slate-500">{inv.date}</p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">${inv.amount.toLocaleString()}</p>
                          </label>
                        ))}
                      
                      {suppliers.find(s => s.id === selectedSupplierId)?.transactions.filter(t => t.type === 'invoice' && t.status === 'pending').length === 0 && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border border-dashed border-slate-200">
                          <p className="text-xs text-slate-500 font-medium italic">No hay facturas pendientes.</p>
                          <label className="mt-2 flex items-center justify-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={isPaymentOnAccount} 
                              onChange={(e) => setIsPaymentOnAccount(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600"
                            />
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">Entrega a Cuenta</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Concepto / Descripción</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    placeholder={type === 'income' ? "Ej: Venta de Armazón RayBan" : "Ej: Pago de Alquiler Local"}
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {type === 'income' && (
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Cliente (Opcional)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    placeholder="Nombre del cliente..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    className="w-full h-12 pl-8 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-black text-lg"
                    placeholder="0.00"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Fecha</label>
                <input 
                  type="date"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Destino / Caja de Impacto</label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {boxes.map(box => (
                  <button
                    key={box.id}
                    type="button"
                    onClick={() => setBoxId(box.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      boxId === box.id 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    )}
                  >
                    {box.type === 'cash' ? <Banknote className="w-4 h-4" /> : 
                     box.type === 'bank' ? <Building className="w-4 h-4" /> : 
                     box.type === 'credit_card' ? <CreditCard className="w-4 h-4" /> :
                     <Wallet className="w-4 h-4" />}
                    <div className="flex-1">
                      <p className="text-xs font-bold leading-none">{box.name}</p>
                      <p className={cn("text-[10px] mt-0.5", boxId === box.id ? "text-blue-100" : "text-slate-500")}>
                        Saldo: ${(box.initialBalance + box.incomes - box.expenses).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Categoría</label>
                <select 
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.filter(c => c.type === type).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Medio de Pago</label>
                <select 
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium appearance-none"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option>Efectivo</option>
                  <option>Tarjeta Crédito</option>
                  <option>Tarjeta Débito</option>
                  <option>Transferencia</option>
                  <option>Mercado Pago</option>
                  <option>Cheque</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            type="submit"
            className={cn(
              "px-10 py-4 rounded-2xl text-white font-black text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
              type === 'income' ? "bg-emerald-600 shadow-emerald-500/20" : "bg-rose-600 shadow-rose-500/20"
            )}
          >
            Confirmar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
