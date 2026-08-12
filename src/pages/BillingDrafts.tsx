import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Calendar, 
  User, 
  CreditCard,
  Check,
  AlertCircle,
  AlertTriangle,
  Eye,
  MapPin,
  Printer,
  X,
  Store
} from "lucide-react";
import { cn } from "../lib/utils";
import { BillingDraft } from "../types";

export function BillingDrafts() {
  const { billingDrafts, markDraftsAsBilled, updateDraftBranch } = useCart();
  const { branches, currentBranch } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'billed'>('pending');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Check if real AFIP/ARCA connection is configured
  const isArcaConfigured = !!localStorage.getItem('optica_afip_cuit') && localStorage.getItem('optica_afip_cuit') !== '';
  
  // Modal states
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isConsumidorFinal, setIsConsumidorFinal] = useState(true);
  const [billingDate, setBillingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [identificador, setIdentificador] = useState("");
  const [direccion, setDireccion] = useState("");

  // Invoice Preview Modal
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [previewDraft, setPreviewDraft] = useState<BillingDraft | null>(null);

  const pendingDrafts = billingDrafts.filter(d => !d.billed);
  const billedDrafts = billingDrafts.filter(d => d.billed);

  const totalPendingAmount = pendingDrafts.reduce((acc, d) => acc + d.amount, 0);
  const totalBilledAmount = billedDrafts.reduce((acc, d) => acc + d.amount, 0);
  const pendingCount = pendingDrafts.length;
  const billedCount = billedDrafts.length;

  const currentList = activeTab === 'pending' ? pendingDrafts : billedDrafts;

  const filteredDrafts = currentList.filter(d => 
    d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.branchName && d.branchName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredDrafts.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleOpenBillingModal = () => {
    if (selectedIds.length === 0) {
      alert("Seleccioná al menos un borrador para facturar.");
      return;
    }
    setIdentificador("");
    setDireccion("");
    setIsConsumidorFinal(true);
    setBillingDate(new Date().toISOString().split('T')[0]);
    setIsBillingModalOpen(true);
  };

  const handleProcessBilling = () => {
    if (!isConsumidorFinal && (!identificador.trim() || !direccion.trim())) {
      alert("Por favor, ingresá el CUIT/DNI y la Dirección para la facturación nominada.");
      return;
    }
    if (!billingDate) {
      alert("Por favor, seleccioná una fecha de facturación válida.");
      return;
    }

    markDraftsAsBilled(selectedIds, {
      isConsumidorFinal,
      identificador: isConsumidorFinal ? undefined : identificador.trim(),
      direccion: isConsumidorFinal ? undefined : direccion.trim(),
      billingDate
    });

    setIsBillingModalOpen(false);
    setSelectedIds([]);
    
    if (!isArcaConfigured) {
      alert("Esta factura se está facturando con el simulador, para facturar con factura real de ARCA configurar la conexión en ajustes");
    } else {
      alert("¡Borradores facturados correctamente!");
    }
  };

  const handleOpenPreview = (draft: BillingDraft) => {
    setPreviewDraft(draft);
    setIsInvoicePreviewOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-300">
      
      {/* Simulation Warning Banner */}
      {!isArcaConfigured && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span><strong>Simulador de Facturación Activo:</strong> Esta factura se está facturando con el simulador, para facturar con factura real de ARCA configurar la conexión en ajustes.</span>
          </div>
          <Link to="/settings" className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 shadow-sm">
            Configurar Ajustes
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-950/20 dark:to-orange-950/20 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-900/40 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Pendiente de Facturar</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">${totalPendingAmount.toLocaleString('es-AR')}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 block mt-0.5 font-medium">{pendingCount} transacciones en borrador</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Facturado Consolidado</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">${totalBilledAmount.toLocaleString('es-AR')}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-450 block mt-0.5 font-medium">{billedCount} facturas emitidas</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 rounded-2xl border border-blue-200/50 dark:border-blue-900/40 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500 text-white rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Total Registros</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{billingDrafts.length}</span>
            <span className="text-xs text-blue-600 dark:text-blue-450 block mt-0.5 font-medium">Borradores + Facturas totales</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Header Options */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => { setActiveTab('pending'); setSelectedIds([]); }}
              className={cn(
                "flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                activeTab === 'pending'
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
            >
              <Clock className="w-4 h-4" /> Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => { setActiveTab('billed'); setSelectedIds([]); }}
              className={cn(
                "flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                activeTab === 'billed'
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
            >
              <CheckCircle2 className="w-4 h-4" /> Facturadas ({billedCount})
            </button>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente, sucursal, importe..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-4 w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
              />
            </div>

            {activeTab === 'pending' && (
              <button
                onClick={handleOpenBillingModal}
                disabled={selectedIds.length === 0}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm",
                  selectedIds.length > 0
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-855 text-slate-400 cursor-not-allowed border border-slate-200/50 dark:border-slate-800"
                )}
              >
                <FileText className="w-4 h-4" /> Facturar Selección ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold">
              <tr>
                {activeTab === 'pending' && (
                  <th className="px-6 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={filteredDrafts.length > 0 && selectedIds.length === filteredDrafts.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-350 focus:ring-emerald-500"
                    />
                  </th>
                )}
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Local / Sucursal</th>
                <th className="px-6 py-4">Detalle / Concepto</th>
                <th className="px-6 py-4">Medio de Cobro</th>
                {activeTab === 'billed' && <th className="px-6 py-4">Datos Factura</th>}
                <th className="px-6 py-4 text-right">Importe</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredDrafts.map(draft => (
                <tr 
                  key={draft.id} 
                  className={cn(
                    "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors",
                    selectedIds.includes(draft.id) && "bg-emerald-500/5 dark:bg-emerald-950/10"
                  )}
                >
                  {activeTab === 'pending' && (
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(draft.id)}
                        onChange={() => handleToggleSelect(draft.id)}
                        className="w-4 h-4 rounded text-emerald-600 border-slate-350 focus:ring-emerald-500"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    {draft.date}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {draft.clientName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <select
                        value={draft.branchId || currentBranch?.id || branches[0]?.id || '1'}
                        onChange={(e) => {
                          const selectedBranch = branches.find(b => b.id === e.target.value);
                          if (selectedBranch) {
                            updateDraftBranch(draft.id, selectedBranch.id, selectedBranch.name);
                          }
                        }}
                        className="h-8 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:border-indigo-400"
                        title="Seleccionar sucursal / local de cobro"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-650 dark:text-slate-300 text-xs">
                    {draft.concept}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-wider text-[10px]">
                      {draft.paymentMethod}
                    </span>
                  </td>
                  {activeTab === 'billed' && (
                    <td className="px-6 py-4 text-xs">
                      {draft.billingData && (
                        <div className="space-y-0.5 text-slate-650 dark:text-slate-400">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            {draft.billingData.isConsumidorFinal ? "Consumidor Final" : "Factura Nominada"}
                          </p>
                          {draft.billingData.identificador && (
                            <p className="text-[10px] font-mono">
                              CUIT/DNI: {draft.billingData.identificador}
                            </p>
                          )}
                          {draft.billingData.direccion && (
                            <p className="text-[10px]">
                              Dirección: {draft.billingData.direccion}
                            </p>
                          )}
                          <p className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Fec. Factura: {draft.billingData.billingDate}
                          </p>
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                    ${draft.amount.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenPreview(draft)}
                      title={draft.billed ? "Ver Factura Emitida" : "Ver Vista Previa de Factura"}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredDrafts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-sm font-bold text-slate-500">No hay borradores en este listado</p>
                      <p className="text-xs text-slate-450">Las ventas consolidadas en el carrito se registrarán automáticamente aquí.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: FACTURACION INTERACTIVA */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-250">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 animate-pulse" /> Confirmar Facturación
              </h3>
              <p className="text-xs text-slate-450 mt-1">Vas a facturar {selectedIds.length} borradores de venta seleccionados.</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Destinatario</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsConsumidorFinal(true)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      isConsumidorFinal
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    )}
                  >
                    <User className="w-3.5 h-3.5" /> Cons. Final
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConsumidorFinal(false)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      !isConsumidorFinal
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Factura A/B
                  </button>
                </div>
              </div>

              {/* Dynamic Nominada Inputs */}
              {!isConsumidorFinal && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CUIT / DNI del Cliente</label>
                    <input
                      type="text"
                      value={identificador}
                      onChange={e => setIdentificador(e.target.value)}
                      placeholder="Ej: 30-12345678-9 o 38450123"
                      className="h-10 px-3 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dirección Completa</label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={e => setDireccion(e.target.value)}
                      placeholder="Ej: Calle San Martín 420, Paraná"
                      className="h-10 px-3 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fecha de la Factura</label>
                <div className="relative">
                  <input
                    type="date"
                    value={billingDate}
                    onChange={e => setBillingDate(e.target.value)}
                    className="h-10 px-3 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                  />
                </div>
              </div>

              {!isArcaConfigured && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-2.5 text-xs mt-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-amber-800 dark:text-amber-300 space-y-0.5">
                    <p className="font-bold">Modo Simulador de Facturación</p>
                    <p className="text-[11px] leading-tight opacity-90">
                      esta factura se está facturadno con el simulador, para facutar con factura real de ARCA configurar la conexión en ajustes
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setIsBillingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessBilling}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-colors"
              >
                <Check className="w-4 h-4" /> Registrar Facturación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVOICE PREVIEW (ESTILO AFIP PREMIUN) */}
      {isInvoicePreviewOpen && previewDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-250 dark:border-slate-800 overflow-hidden my-8 print:my-0 print:border-0 print:shadow-none animate-in fade-in zoom-in duration-200">
            
            {/* Header / Actions */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 print:hidden">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" /> Factura Electrónica (Borrador/Muestra)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="h-8 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
                <button
                  onClick={() => setIsInvoicePreviewOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AFIP Invoice Body */}
            <div id="afip-invoice-sheet" className="p-6 md:p-8 space-y-6 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 font-sans print:p-0 relative overflow-hidden">
              
              {/* Marca de agua de Borrador */}
              {!previewDraft.billed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <div className="text-red-500/10 dark:text-red-500/5 text-5xl md:text-6xl font-black uppercase tracking-widest -rotate-30 border-8 border-dashed border-red-500/10 dark:border-red-500/5 px-8 py-4 text-center">
                    Borrador / Muestra<br/>
                    <span className="text-xl md:text-2xl font-bold tracking-normal block mt-1">No válido como comprobante</span>
                  </div>
                </div>
              )}
              
              {/* AFIP Header Box */}
              <div className="border border-slate-350 dark:border-slate-750 rounded-lg overflow-hidden grid grid-cols-2 relative divide-x divide-slate-350 dark:divide-slate-750">
                
                {/* Middle Letter Box (A / B) */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-12 h-14 bg-white dark:bg-slate-950 border-b border-l border-r border-slate-350 dark:border-slate-750 flex flex-col items-center justify-center z-10">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {previewDraft.billingData?.isConsumidorFinal === false ? "A" : "B"}
                  </span>
                  <span className="text-[7px] text-slate-550 dark:text-slate-450 uppercase font-black tracking-tighter">cod. 011</span>
                </div>

                {/* Left Header - Issuer Info */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">ÓPTICA PARACAO</span>
                  </div>
                  <div className="space-y-0.5 text-[11px] text-slate-550 dark:text-slate-400 font-medium">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">Sucursal de Cobro: {previewDraft.branchName || "Casa Central"}</p>
                    <p>Razón Social: Optica Paracao S.R.L.</p>
                    <p>Domicilio Comercial: Av. Principal 123 - Paraná, Entre Ríos</p>
                    <p>Condición frente al IVA: IVA Responsable Inscripto</p>
                  </div>
                </div>

                {/* Right Header - Invoice Info */}
                <div className="p-4 pl-8 space-y-2 text-xs text-right md:text-left md:pl-12">
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase">Factura</h4>
                  <div className="space-y-0.5 text-[11px] text-slate-550 dark:text-slate-400 font-medium">
                    <p className="font-mono">Punto de Venta: 00004 &nbsp; Comp. Nro: 00003185</p>
                    <p>Fecha de Emisión: {previewDraft.billingData?.billingDate || previewDraft.date}</p>
                    <p>CUIT: 30-71458923-4</p>
                    <p>Convenio Multilateral: 902-124859-1</p>
                    <p>Inicio de Actividades: 01/10/2018</p>
                  </div>
                </div>
              </div>

              {/* Client Info Section */}
              <div className="border border-slate-350 dark:border-slate-750 rounded-lg p-4 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p><span className="font-bold text-slate-500">CUIT / DNI:</span> <span className="font-mono font-bold">{previewDraft.billingData?.identificador || "99-99999999-9 (Cons. Final)"}</span></p>
                    <p><span className="font-bold text-slate-500">Apellido y Nombre / Razón Social:</span> <span className="font-bold text-slate-900 dark:text-white">{previewDraft.clientName}</span></p>
                  </div>
                  <div className="space-y-1">
                    <p><span className="font-bold text-slate-500">Condición frente al IVA:</span> <span>{previewDraft.billingData?.isConsumidorFinal ? "Consumidor Final" : "Responsable Inscripto / Monotributo"}</span></p>
                    <p><span className="font-bold text-slate-500">Dirección:</span> <span>{previewDraft.billingData?.direccion || "Domicilio Particular"}</span></p>
                  </div>
                </div>
                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-[11px]">
                  <span className="font-bold text-slate-500">Condición de Venta:</span> <span className="font-bold uppercase text-emerald-600 dark:text-emerald-450">{previewDraft.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-350 dark:border-slate-750 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold border-b border-slate-350 dark:border-slate-750">
                    <tr>
                      <th className="px-4 py-2 w-16 text-center">Código</th>
                      <th className="px-4 py-2">Producto / Servicio</th>
                      <th className="px-4 py-2 w-16 text-center">Cant.</th>
                      <th className="px-4 py-2 w-24 text-right">U. Medida</th>
                      <th className="px-4 py-2 w-24 text-right">Precio Unit.</th>
                      <th className="px-4 py-2 w-24 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {previewDraft.items && previewDraft.items.length > 0 ? (
                      previewDraft.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="px-4 py-3 text-center font-mono text-slate-400">{1000 + idx}</td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-0.5">Producto/Servicio de Óptica</p>
                          </td>
                          <td className="px-4 py-3 text-center">{item.quantity.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">unidades</td>
                          <td className="px-4 py-3 text-right">${item.price.toLocaleString('es-AR')}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">${(item.price * item.quantity).toLocaleString('es-AR')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                        <td className="px-4 py-3 text-center font-mono text-slate-400">9002</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{previewDraft.concept}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">Receta Óptica - Procesamiento en Taller</p>
                        </td>
                        <td className="px-4 py-3 text-center">1.00</td>
                        <td className="px-4 py-3 text-right">unidades</td>
                        <td className="px-4 py-3 text-right">${previewDraft.amount.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">${previewDraft.amount.toLocaleString('es-AR')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-between items-start pt-2">
                <div className="max-w-md text-[10px] text-slate-400 font-medium">
                  <p>Factura emitida a través de controlador fiscal simulado.</p>
                  <p>El importe total indicado incluye todos los impuestos y percepciones provinciales aplicables.</p>
                </div>
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Importe Neto Gravado:</span>
                    <span>${(previewDraft.amount / 1.21).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>IVA 21%:</span>
                    <span>${(previewDraft.amount - (previewDraft.amount / 1.21)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span>Importe Total:</span>
                    <span>${previewDraft.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* AFIP Footer Details */}
              <div className="pt-6 border-t border-slate-350 dark:border-slate-750 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* QR and Barcode Mock */}
                <div className="flex items-center gap-3">
                  {/* Mock AFIP QR */}
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 flex flex-col justify-between items-center select-none">
                    <div className="grid grid-cols-4 gap-0.5 w-full h-full opacity-60">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={cn("rounded-sm", (i % 2 === 0 || i % 3 === 0) ? "bg-black dark:bg-white" : "bg-transparent")} />
                      ))}
                    </div>
                  </div>
                  {/* AFIP Logo Mock */}
                  <div className="space-y-0.5 select-none">
                    <span className="px-1.5 py-0.5 bg-blue-700 text-white rounded font-black tracking-tighter text-[9px]">AFIP</span>
                    <p className="text-[8px] text-slate-450 font-bold uppercase tracking-tight">Comprobante Autorizado</p>
                  </div>
                </div>

                {/* CAE Data */}
                <div className="text-right text-[11px] text-slate-650 dark:text-slate-400 font-mono font-bold space-y-0.5">
                  <p>CAE Nro: &nbsp; <span className="text-slate-900 dark:text-white">{previewDraft.billed ? "73284901859341" : "PENDIENTE DE EMISIÓN"}</span></p>
                  <p>Fecha de Vto. de CAE: &nbsp; <span className="text-slate-900 dark:text-white">{previewDraft.billed ? (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 10)).toISOString().split('T')[0] : "PENDIENTE"}</span></p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
