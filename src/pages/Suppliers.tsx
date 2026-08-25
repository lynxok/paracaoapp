import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Receipt, Truck, X, Settings2, Trash2, Smartphone, FileText, ArrowUpRight, ArrowDownRight, History, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { Supplier, SupplierTransaction } from "../types";
import { cn } from "../lib/utils";

export function Suppliers() {
  const { suppliers, addSupplierTransaction, updateSupplier, addSupplier, addCheques, boxes, addTransaction } = useFinance();
  const [activeTab, setActiveTab] = useState<'list' | 'purchases' | 'pending'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [categories, setCategories] = useState(["Armazones", "Cristales", "Insumos de Laboratorio", "Lentes de Contacto", "Accesorios"]);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [contextItem, setContextItem] = useState<Supplier | null>(null);

  // Mixed Payment States
  const [payCash, setPayCash] = useState<number>(0);
  const [payBank, setPayBank] = useState<number>(0);
  const [payCard, setPayCard] = useState<number>(0);
  const [payCurrentAccount, setPayCurrentAccount] = useState<number>(0);
  const [addedCheques, setAddedCheques] = useState<any[]>([]);
  const [showChequeForm, setShowChequeForm] = useState(false);
  const [newCheque, setNewCheque] = useState({
    number: '',
    bank: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    terms: '30 días',
    observation: ''
  });
  const [cashBoxId, setCashBoxId] = useState('');
  const [bankBoxId, setBankBoxId] = useState('');
  const [cardBoxId, setCardBoxId] = useState('');

  // Voucher Form State
  const [voucherData, setVoucherData] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    number: '',
    amount: '',
    type: 'invoice' as 'invoice' | 'payment',
    description: '',
    supplierId: '',
    paymentTerms: ''
  });

  // Reset payment states when modal is opened/closed
  useEffect(() => {
    if (isVoucherModalOpen) {
      setPayCash(0);
      setPayBank(0);
      setPayCard(0);
      setPayCurrentAccount(0);
      setAddedCheques([]);
      setShowChequeForm(false);
      
      // Default box IDs
      const cashBox = boxes.find(b => b.type === 'cash');
      const bankBox = boxes.find(b => b.type === 'bank' || b.type === 'digital');
      const cardBox = boxes.find(b => b.type === 'credit_card');
      
      setCashBoxId(cashBox?.id || '');
      setBankBoxId(bankBox?.id || '');
      setCardBoxId(cardBox?.id || '');
    }
  }, [isVoucherModalOpen, boxes]);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContextMenu = (e: React.MouseEvent, item: Supplier) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setContextItem(item);
  };

  const closeMenu = () => {
    setMenuPosition(null);
  };

  useEffect(() => {
    const handleClick = () => closeMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Simulated User Role
  const userRole = "superadmin";

  const addCategory = () => {
    if (newCatName && !categories.includes(newCatName)) {
      setCategories([...categories, newCatName]);
      setNewCatName("");
    }
  };

  const deleteCategory = (catToDelete: string) => {
    setCategories(categories.filter(c => c !== catToDelete));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
              activeTab === 'list' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Proveedores
          </button>
          <button 
            onClick={() => setActiveTab('purchases')}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
              activeTab === 'purchases' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Compras
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
              activeTab === 'pending' ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Facturas Pendientes
          </button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="w-full pl-9 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white outline-none" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              setContextItem(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2 transition-colors text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* Register/Edit Provider Modal */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <Truck className="w-6 h-6 text-blue-600" />
                {contextItem ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setContextItem(null);
                }} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { 
                e.preventDefault(); 
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                if (contextItem) {
                  updateSupplier({
                    ...contextItem,
                    name: data.name as string,
                    code: data.code as string,
                    cuit: data.cuit as string,
                    cbu: data.cbu as string,
                    category: data.category as string,
                    paymentTerms: data.paymentTerms as string,
                    contact: data.contact as string,
                    email: data.email as string,
                    phone: data.phone as string,
                  });
                } else {
                  addSupplier({
                    name: data.name as string,
                    code: data.code as string,
                    cuit: data.cuit as string,
                    cbu: data.cbu as string,
                    category: data.category as string,
                    paymentTerms: data.paymentTerms as string,
                    contact: data.contact as string,
                    email: data.email as string,
                    phone: data.phone as string,
                  });
                }
                setIsModalOpen(false); 
                setContextItem(null); 
              }}>
              <div className="overflow-y-auto max-h-[calc(95vh-160px)] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 ">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Código</label>
                    <input 
                      name="code"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: PROV001" 
                      defaultValue={contextItem?.code}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Razón Social / Nombre</label>
                    <input 
                      name="name"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: Distribuidora Óptica Central" 
                      defaultValue={contextItem?.name}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CUIT</label>
                    <input 
                      name="cuit"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="30-XXXXXXXX-X" 
                      defaultValue={contextItem?.cuit}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CBU / Alias</label>
                    <input 
                      name="cbu"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="22 dígitos o Alias" 
                      defaultValue={contextItem?.cbu}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Categoría</label>
                      {userRole === "superadmin" && (
                        <button 
                          type="button"
                          onClick={() => setIsManageCatsOpen(true)}
                          className="text-[10px] flex items-center gap-1 text-blue-600 hover:underline font-bold"
                        >
                          <Settings2 className="w-3 h-3" /> Gestionar
                        </button>
                      )}
                    </div>
                    <select 
                      name="category"
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                      defaultValue={contextItem?.category}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Condición de Pago</label>
                    <input 
                      name="paymentTerms"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: Contado, 30 días..." 
                      defaultValue={contextItem?.paymentTerms}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Persona de Contacto</label>
                    <input 
                      name="contact"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Nombre del vendedor" 
                      defaultValue={contextItem?.contact}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teléfono</label>
                    <input 
                      name="phone"
                      type="tel" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="+54 ..." 
                      defaultValue={contextItem?.phone}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email de Pedidos</label>
                    <input 
                      name="email"
                      type="email" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="pedidos@proveedor.com" 
                      defaultValue={contextItem?.email}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setContextItem(null);
                  }}
                  className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm"
                >
                  {contextItem ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Loading Modal */}
      {isVoucherModalOpen && (selectedSupplier || activeTab === 'purchases') && (() => {
        const totalInvoiced = parseFloat(voucherData.amount) || 0;
        const totalChequesAmount = addedCheques.reduce((sum, c) => sum + c.amount, 0);
        const totalImputed = payCash + payBank + payCard + totalChequesAmount + (voucherData.type === 'invoice' ? payCurrentAccount : 0);
        const difference = totalInvoiced - totalImputed;

        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  Cargar Comprobante
                </h3>
                <button 
                  onClick={() => setIsVoucherModalOpen(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form 
                className="flex-1 flex flex-col overflow-hidden"
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetId = voucherData.supplierId || selectedSupplier?.id;
                  if (!targetId) return;

                  const supObj = suppliers.find(s => s.id === targetId);
                  const supplierName = supObj?.name || 'Proveedor';

                  // 1. Serialize payment details in description
                  const paymentDetails = {
                    efectivo: { amount: payCash, boxId: cashBoxId },
                    transferencia: { amount: payBank, boxId: bankBoxId },
                    tarjeta: { amount: payCard, boxId: cardBoxId },
                    cheques: addedCheques,
                    cuentaCorriente: payCurrentAccount
                  };
                  const desc = `${voucherData.description.trim() ? voucherData.description.trim() + ' | ' : ''}Detalles de Pago: ${JSON.stringify(paymentDetails)}`;

                  // 2. Add Supplier Transaction
                  addSupplierTransaction(targetId, {
                    date: voucherData.date,
                    dueDate: voucherData.dueDate,
                    paymentTerms: voucherData.paymentTerms,
                    voucherNumber: voucherData.number,
                    amount: parseFloat(voucherData.amount),
                    type: voucherData.type,
                    status: 'pending',
                    description: desc
                  });

                  // 3. Register cash outflows (Egresos) in Finance
                  const dateStr = voucherData.date;
                  const now = new Date();
                  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

                  if (payCash > 0 && cashBoxId) {
                    const cashBox = boxes.find(b => b.id === cashBoxId);
                    addTransaction({
                      id: `tx-sup-cash-${Date.now()}`,
                      date: dateStr,
                      time: timeStr,
                      concept: `Pago en Efectivo (Factura Nº ${voucherData.number}) - Proveedor: ${supplierName}`,
                      method: cashBox?.name || 'Efectivo',
                      amount: payCash,
                      type: 'expense',
                      category: 'Gastos Administrativos',
                      boxId: cashBoxId
                    });
                  }

                  if (payBank > 0 && bankBoxId) {
                    const bankBox = boxes.find(b => b.id === bankBoxId);
                    addTransaction({
                      id: `tx-sup-bank-${Date.now()}`,
                      date: dateStr,
                      time: timeStr,
                      concept: `Pago por Transferencia (Factura Nº ${voucherData.number}) - Proveedor: ${supplierName}`,
                      method: bankBox?.name || 'Transferencia',
                      amount: payBank,
                      type: 'expense',
                      category: 'Gastos Administrativos',
                      boxId: bankBoxId
                    });
                  }

                  if (payCard > 0 && cardBoxId) {
                    const cardBox = boxes.find(b => b.id === cardBoxId);
                    addTransaction({
                      id: `tx-sup-card-${Date.now()}`,
                      date: dateStr,
                      time: timeStr,
                      concept: `Pago con Tarjeta (Factura Nº ${voucherData.number}) - Proveedor: ${supplierName}`,
                      method: cardBox?.name || 'Tarjeta de Credito',
                      amount: payCard,
                      type: 'expense',
                      category: 'Gastos Administrativos',
                      boxId: cardBoxId
                    });
                  }

                  // 4. Register cheques in Finance
                  if (addedCheques.length > 0) {
                    addCheques(addedCheques.map((c, i) => ({
                      id: `cheque-emit-${Date.now()}-${i}`,
                      number: c.number,
                      bank: c.bank,
                      amount: c.amount,
                      dueDate: c.dueDate,
                      terms: c.terms,
                      status: 'Pendiente',
                      type: 'Emitido',
                      supplierId: targetId,
                      supplierName: supplierName,
                      voucherId: voucherData.number,
                      observation: c.observation
                    })));
                  }

                  setIsVoucherModalOpen(false);
                  setVoucherData({
                    date: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    number: '',
                    amount: '',
                    type: 'invoice' as 'invoice' | 'payment',
                    description: '',
                    supplierId: '',
                    paymentTerms: ''
                  });
                }}
              >
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  {activeTab === 'purchases' && !selectedSupplier ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Seleccionar Proveedor</label>
                      <select 
                        required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
                        value={voucherData.supplierId}
                        onChange={(e) => setVoucherData({...voucherData, supplierId: e.target.value})}
                      >
                        <option value="">Elegir proveedor...</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impactando en:</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSupplier?.name}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tipo</label>
                      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button 
                          type="button"
                          onClick={() => setVoucherData({...voucherData, type: 'invoice'})}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                            voucherData.type === 'invoice' 
                              ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" 
                              : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          Factura / Debito
                        </button>
                        <button 
                          type="button"
                          onClick={() => setVoucherData({...voucherData, type: 'payment'})}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                            voucherData.type === 'payment' 
                              ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" 
                              : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          Pago / Crédito
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Fecha</label>
                      <input 
                        type="date"
                        required
                        value={voucherData.date}
                        onChange={(e) => setVoucherData({...voucherData, date: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nº Comprobante</label>
                      <input 
                        type="text"
                        required
                        placeholder="FC-A-0001-..."
                        value={voucherData.number}
                        onChange={(e) => setVoucherData({...voucherData, number: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-white uppercase"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Monto Factura</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input 
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={voucherData.amount}
                          onChange={(e) => setVoucherData({...voucherData, amount: e.target.value})}
                          className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Condición de Pago</label>
                      <input 
                        type="text"
                        placeholder="Ej: 30 días"
                        value={voucherData.paymentTerms}
                        onChange={(e) => setVoucherData({...voucherData, paymentTerms: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Vencimiento</label>
                      <input 
                        type="date"
                        value={voucherData.dueDate}
                        onChange={(e) => setVoucherData({...voucherData, dueDate: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descripción / Concepto</label>
                    <textarea 
                      rows={2}
                      value={voucherData.description}
                      onChange={(e) => setVoucherData({...voucherData, description: e.target.value})}
                      placeholder="Detalles adicionales..."
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  {/* 5. MEDIOS DE PAGO MIXTOS */}
                  <div className="space-y-3 pt-3 border-t border-slate-150 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-550 uppercase tracking-widest">Distribución de Pago</h4>
                    
                    {/* Efectivo */}
                    <div className="grid grid-cols-2 gap-3 items-end bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/40">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Efectivo ($)</label>
                        <input 
                          type="number"
                          min="0"
                          value={payCash || ''}
                          onChange={e => setPayCash(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full h-8 px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Caja Efectivo</label>
                        <select
                          value={cashBoxId}
                          onChange={e => setCashBoxId(e.target.value)}
                          className="w-full h-8 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-800 dark:text-slate-200"
                        >
                          {boxes.filter(b => b.type === 'cash').map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Transferencia */}
                    <div className="grid grid-cols-2 gap-3 items-end bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/40">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Transferencia ($)</label>
                        <input 
                          type="number"
                          min="0"
                          value={payBank || ''}
                          onChange={e => setPayBank(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full h-8 px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Banco Destino</label>
                        <select
                          value={bankBoxId}
                          onChange={e => setBankBoxId(e.target.value)}
                          className="w-full h-8 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-800 dark:text-slate-200"
                        >
                          {boxes.filter(b => b.type === 'bank' || b.type === 'digital').map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tarjeta */}
                    <div className="grid grid-cols-2 gap-3 items-end bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/40">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Tarjeta ($)</label>
                        <input 
                          type="number"
                          min="0"
                          value={payCard || ''}
                          onChange={e => setPayCard(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full h-8 px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Caja Tarjeta</label>
                        <select
                          value={cardBoxId}
                          onChange={e => setCardBoxId(e.target.value)}
                          className="w-full h-8 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-800 dark:text-slate-200"
                        >
                          {boxes.filter(b => b.type === 'credit_card').map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Cuenta Corriente / Deuda */}
                    {voucherData.type === 'invoice' && (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/40">
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 block mb-1">Cuenta Corriente / Deuda ($)</label>
                        <input 
                          type="number"
                          min="0"
                          value={payCurrentAccount || ''}
                          onChange={e => setPayCurrentAccount(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full h-8 px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
                          placeholder="0.00"
                        />
                        <p className="text-[9px] text-slate-400 mt-1 leading-none">Monto que quedará como saldo deudor con el proveedor.</p>
                      </div>
                    )}

                    {/* Cheques */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/40 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Cheques Emitidos</span>
                        <button 
                          type="button" 
                          onClick={() => setShowChequeForm(!showChequeForm)}
                          className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded text-[9px] font-bold transition-all"
                        >
                          {showChequeForm ? 'Cerrar Alta' : '+ Agregar Cheque'}
                        </button>
                      </div>

                      {showChequeForm && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 animate-in slide-in-from-top-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Nº Cheque</label>
                              <input 
                                type="text" 
                                value={newCheque.number}
                                onChange={e => setNewCheque({...newCheque, number: e.target.value})}
                                className="w-full h-7 px-1.5 rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Banco</label>
                              <input 
                                type="text" 
                                value={newCheque.bank}
                                onChange={e => setNewCheque({...newCheque, bank: e.target.value})}
                                className="w-full h-7 px-1.5 rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Importe</label>
                              <input 
                                type="number" 
                                value={newCheque.amount || ''}
                                onChange={e => setNewCheque({...newCheque, amount: Math.max(0, parseFloat(e.target.value) || 0)})}
                                className="w-full h-7 px-1.5 rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Plazo</label>
                              <select 
                                value={newCheque.terms}
                                onChange={e => setNewCheque({...newCheque, terms: e.target.value})}
                                className="w-full h-7 px-1 rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-[10px] font-bold text-slate-800 dark:text-slate-200"
                              >
                                <option value="30 días">30 días</option>
                                <option value="60 días">60 días</option>
                                <option value="90 días">90 días</option>
                                <option value="120 días">120 días</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Vencimiento</label>
                              <input 
                                type="date" 
                                value={newCheque.dueDate}
                                onChange={e => setNewCheque({...newCheque, dueDate: e.target.value})}
                                className="w-full h-7 px-1 rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-[9px] font-bold"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Observación</label>
                            <input 
                              type="text" 
                              placeholder="Opcional..."
                              value={newCheque.observation}
                              onChange={e => setNewCheque({...newCheque, observation: e.target.value})}
                              className="w-full h-7 px-1.5 rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-medium"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={!newCheque.number || !newCheque.bank || newCheque.amount <= 0}
                            onClick={() => {
                              setAddedCheques([...addedCheques, { ...newCheque }]);
                              setNewCheque({
                                number: '',
                                bank: '',
                                amount: 0,
                                dueDate: new Date().toISOString().split('T')[0],
                                terms: '30 días',
                                observation: ''
                              });
                              setShowChequeForm(false);
                            }}
                            className="w-full py-1.5 bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                          >
                            Confirmar Agregar Cheque
                          </button>
                        </div>
                      )}

                      {/* Added Cheques List */}
                      {addedCheques.length > 0 && (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                          {addedCheques.map((c, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/50 text-[10px] font-bold shadow-sm">
                              <div>
                                <p className="text-slate-800 dark:text-slate-200">Nº {c.number} · {c.bank}</p>
                                <p className="text-slate-400 font-medium">Vence: {new Date(c.dueDate + 'T12:00:00').toLocaleDateString()} ({c.terms})</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-emerald-650 dark:text-emerald-450">${c.amount.toLocaleString()}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setAddedCheques(addedCheques.filter((_, i) => i !== idx))}
                                  className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 6. LIVE SUMS RESUMEN */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs font-bold shadow-inner">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Factura:</span>
                      <span>${totalInvoiced.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-350 font-medium pl-2">
                      <span>Efectivo:</span>
                      <span>${payCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-350 font-medium pl-2">
                      <span>Transferencia:</span>
                      <span>${payBank.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-350 font-medium pl-2">
                      <span>Tarjeta:</span>
                      <span>${payCard.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-350 font-medium pl-2">
                      <span>Cheques:</span>
                      <span>${totalChequesAmount.toLocaleString()}</span>
                    </div>
                    {voucherData.type === 'invoice' && (
                      <div className="flex justify-between text-slate-350 font-medium pl-2">
                        <span>Cuenta Corriente (Deuda):</span>
                        <span>${payCurrentAccount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700 my-1"></div>
                    <div className="flex justify-between text-slate-200">
                      <span>Total Imputado:</span>
                      <span>${totalImputed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-700 pt-1.5">
                      <span className="text-indigo-400">Diferencia:</span>
                      <span className={cn("font-black text-sm", difference === 0 ? "text-emerald-400" : "text-rose-400")}>
                        ${difference.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                  <button 
                    type="button"
                    onClick={() => setIsVoucherModalOpen(false)}
                    className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit"
                    disabled={difference !== 0}
                    className="px-8 py-2.5 bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
                  >
                    Confirmar Impacto en C.C.
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* History / Cuenta Corriente Modal */}
      {isHistoryModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">Cuenta Corriente</h3>
                  <p className="text-sm text-slate-500">{selectedSupplier.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Facturado</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  ${selectedSupplier.transactions.filter(t => t.type === 'invoice').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pagado</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  ${selectedSupplier.transactions.filter(t => t.type === 'payment').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-sm">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Saldo Deudor</p>
                <p className={cn("text-xl font-black", selectedSupplier.balance > 0 ? "text-rose-600" : "text-emerald-600")}>
                  ${selectedSupplier.balance.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-3">
                {selectedSupplier.transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
                    <Receipt className="w-12 h-12 mb-3" />
                    <p className="font-bold">No hay movimientos registrados</p>
                  </div>
                ) : (
                  selectedSupplier.transactions.map((tx) => (
                    <div 
                      key={tx.id}
                      className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2.5 rounded-lg",
                          tx.type === 'invoice' ? "bg-rose-50 text-rose-600 shadow-sm shadow-rose-100" : "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100"
                        )}>
                          {tx.type === 'invoice' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{tx.voucherNumber}</p>
                            <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold",
                                tx.type === 'invoice' ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                            )}>
                              {tx.type === 'invoice' ? 'Factura' : 'Pago'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                              <Calendar className="w-3 h-3" /> {tx.date}
                            </span>
                            {tx.description && (
                              <span className="text-[10px] text-slate-500 italic max-w-[200px] truncate">
                                {tx.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-base font-black",
                          tx.type === 'invoice' ? "text-slate-900 dark:text-white" : "text-emerald-600"
                        )}>
                          {tx.type === 'invoice' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                           <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Procesado</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Los saldos se actualizan automáticamente al cargar comprobantes.</span>
              </div>
              <button 
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setIsVoucherModalOpen(true);
                }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nuevo Comprobante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Modal (Superadmin only) */}
      {isManageCatsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                <Settings2 className="w-5 h-5 text-blue-600" />
                Gestionar Categorías
              </h3>
              <button 
                onClick={() => setIsManageCatsOpen(false)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                  placeholder="Nueva categoría..."
                />
                <button 
                  onClick={addCategory}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 group">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{cat}</span>
                    <button 
                      onClick={() => deleteCategory(cat)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setIsManageCatsOpen(false)}
                className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Proveedor</th>
                  <th className="px-6 py-4 font-semibold">Categoría / Condición</th>
                  <th className="px-6 py-4 font-semibold">Contacto</th>
                  <th className="px-6 py-4 font-semibold">Deuda Pendiente</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSuppliers.map((p) => (
                  <tr 
                    key={p.id} 
                    onContextMenu={(e) => handleContextMenu(e, p)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                  >
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{p.code}</div>
                      <div className="font-bold text-slate-900 dark:text-white leading-tight">{p.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono uppercase">{p.cuit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="w-fit text-[10px] font-black px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                          {p.category}
                        </span>
                        {p.paymentTerms && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            {p.paymentTerms}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="font-medium">{p.contact}</div>
                      <div className="text-[10px] text-slate-400">{p.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-black text-base ${p.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ${p.balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setContextItem(p);
                            setIsModalOpen(true);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 transition-colors" title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                           onClick={() => {
                             setSelectedSupplier(p);
                             setIsHistoryModalOpen(true);
                           }}
                           className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors" title="Ver Cuenta Corriente"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                           onClick={() => {
                             setSelectedSupplier(p);
                             setIsVoucherModalOpen(true);
                           }}
                           className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors" title="Cargar Comprobante"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'purchases' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                <Receipt className="w-8 h-8 mb-4 opacity-50" />
                <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Total Compras del Mes</h3>
                <p className="text-3xl font-black mt-1">$45.600</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/60">
                   <ArrowUpRight className="w-4 h-4" />
                   12% más que el mes anterior
                </div>
             </div>
             
             <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Cargar Nueva Compra</h3>
                  <p className="text-slate-500 text-sm">Registra una factura de tus proveedores para impactar en su C.C.</p>
                </div>
                <button 
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus className="w-5 h-5" /> Iniciar Carga
                </button>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
             <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Últimos Comprobantes Cargados</h3>
                <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Ver Todo el Historial</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Fecha</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Proveedor</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Nº Comprobante</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Monto</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {suppliers.flatMap(s => s.transactions.filter(t => t.type === 'invoice').map(t => ({...t, supplierName: s.name})))
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{p.date}</td>
                          <td className="px-6 py-4 font-black text-slate-900 dark:text-white uppercase text-xs">{p.supplierName}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{p.voucherNumber}</td>
                          <td className="px-6 py-4 font-black text-slate-900 dark:text-white">${p.amount.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                              p.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            )}>
                              {p.status === 'paid' ? 'Pagada' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600">
                    <AlertCircle className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-rose-600">Facturas Pendientes de Pago</h3>
                    <p className="text-rose-600/70 text-sm">Listado de todos los comprobantes que aún no tienen una orden de pago asociada.</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Deuda Total Consolidada</p>
                 <p className="text-3xl font-black text-rose-600">
                    ${suppliers.reduce((acc, s) => acc + s.balance, 0).toLocaleString()}
                 </p>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Vencimiento / Fecha</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Proveedor</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Comprobante</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px]">Saldo Pendiente</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-widest text-[10px] text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {suppliers.flatMap(s => s.transactions.filter(t => t.type === 'invoice' && t.status === 'pending').map(t => ({...t, supplierName: s.name, supplierId: s.id})))
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <Calendar className="w-4 h-4 text-slate-400" />
                               <span className="font-bold text-slate-700 dark:text-slate-300">{p.date}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-black text-slate-900 dark:text-white uppercase text-xs">{p.supplierName}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{p.voucherNumber}</td>
                          <td className="px-6 py-4 font-black text-rose-600">${p.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                             <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                               Pagar Factura
                             </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      )}
      {/* Context Menu */}
      {menuPosition && (
        <div 
          className="fixed z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 min-w-[220px] animate-in fade-in zoom-in duration-100"
          style={{ top: menuPosition.y, left: menuPosition.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proveedor</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{contextItem?.name}</p>
          </div>
          <button 
            onClick={() => {
              const message = encodeURIComponent(`Hola ${contextItem.contact}, te contactamos de la Óptica por un pedido...`);
              window.open(`https://wa.me/${contextItem.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            <Smartphone className="w-4 h-4" /> Enviar WhatsApp
          </button>
          <button 
            onClick={() => {
              setIsModalOpen(true);
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Editar Proveedor
          </button>
          <button 
            onClick={() => {
              setSelectedSupplier(contextItem);
              setIsHistoryModalOpen(true);
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <History className="w-4 h-4" /> Ver Cuenta Corriente
          </button>
          <button 
            onClick={() => {
              setSelectedSupplier(contextItem);
              setIsVoucherModalOpen(true);
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-4 h-4" /> Cargar Comprobante
          </button>

          {userRole === "superadmin" && (
            <button 
              onClick={() => {
                // Delete action
                closeMenu();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Eliminar Proveedor
            </button>
          )}
        </div>
      )}
    </div>
  );
}
