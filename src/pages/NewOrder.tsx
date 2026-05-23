import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { User, Eye, Check, ArrowLeft, Search, X, Plus, Banknote, Building, CreditCard, Wallet, ChevronDown } from "lucide-react";
import { MOCK_CLIENTS } from "../lib/mockData";
import { cn } from "../lib/utils";
import { useFinance } from "../context/FinanceContext";

export function NewOrder() {
  const { boxes, addTransaction } = useFinance();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof MOCK_CLIENTS[0] | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("contado");
  const [selectedBankId, setSelectedBankId] = useState("");

  const handleConfirm = () => {
    let targetBoxId = 'caja-efectivo';
    if (paymentMethod === 'tarjeta') targetBoxId = 'tc-holding';
    if (paymentMethod === 'mercado-pago') targetBoxId = 'mercado-pago';
    if (paymentMethod === 'transferencia' && selectedBankId) targetBoxId = selectedBankId;

    addTransaction({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      concept: `Venta Rápida: ${title}`,
      amount: 4500, // Example amount
      type: 'income',
      category: 'ventas',
      boxId: targetBoxId,
      method: paymentMethod === 'contado' ? 'Efectivo' : 
              paymentMethod === 'tarjeta' ? 'Tarjeta Crédito' :
              paymentMethod === 'mercado-pago' ? 'Mercado Pago' : 'Transferencia',
      clientName: selectedClient?.name || 'Cliente Mostrador'
    });

    navigate('/orders');
  };

  const filteredClients = MOCK_CLIENTS.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    client.dni.includes(clientSearch)
  );

  const isMultifocal = type === 'multifocal';
  const isContact = type === 'contact';

  const title = isContact ? "Lentes de Contacto" : isMultifocal ? "Multifocales / Bifocales" : "Monofocales";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Asociar Cliente
              </h3>
              <button 
                onClick={() => setIsClientModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  className="w-full pl-9 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setIsClientModalOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{client.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{client.dni}</p>
                      </div>
                      <Plus className="w-4 h-4 text-blue-600" />
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-sm">No se encontraron clientes</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setIsClientModalOpen(false)}
                className="px-6 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link to="/orders/new" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-bold">Volver a Selección</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isContact ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : isMultifocal ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : 'bg-blue-100 border-blue-200 text-blue-600'}`}>
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Datos del Cliente
            </h3>
            {selectedClient && (
              <button 
                onClick={() => setSelectedClient(null)}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Desvincular
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nombre del Cliente</label>
              <div className="relative">
                <input 
                  className="h-10 pl-3 pr-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500 transition-all font-medium" 
                  placeholder="Ej: Juan Pérez" 
                  value={selectedClient?.name || ""}
                  readOnly={!!selectedClient}
                  onChange={(e) => !selectedClient && e.stopPropagation()} // Placeholder logic
                />
                {!selectedClient && (
                  <button 
                    onClick={() => setIsClientModalOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    title="Asociar Cliente"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">DNI / Identificación</label>
              <input 
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500 transition-all font-mono text-sm" 
                placeholder="12.345.678" 
                value={selectedClient?.dni || ""}
                readOnly={!!selectedClient}
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Médico Recetador</label>
              <input className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Dr. / Dra." />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Observaciones</label>
              <textarea className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none resize-none" rows={2}></textarea>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold dark:text-white mb-5 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Especificaciones Técnicas
          </h3>
          
          <div className="space-y-8">
            {['OD', 'OI'].map(eye => (
              <div key={eye} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                    {eye}
                  </span> 
                  Ojo {eye === 'OD' ? 'Derecho' : 'Izquierdo'}
                </div>
                
                {!isContact ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Esférico</label>
                      <input className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:ring-2 focus:ring-blue-600 outline-none" placeholder="0.00" />
                    </div>
                    <div className="relative">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Cilíndrico</label>
                      <input className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:ring-2 focus:ring-blue-600 outline-none" placeholder="0.00" />
                    </div>
                    <div className="relative">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Eje</label>
                      <input className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:ring-2 focus:ring-blue-600 outline-none" placeholder="0°" />
                    </div>
                    
                    {isMultifocal && (
                      <>
                        <div className="relative">
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Adición</label>
                          <input className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:ring-2 focus:ring-blue-600 outline-none" placeholder="+0.00" />
                        </div>
                        <div className="relative">
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Altura Seg.</label>
                          <input className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:ring-2 focus:ring-blue-600 outline-none" placeholder="0 mm" />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Curvatura (BC)</label>
                      <input className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:ring-2 focus:ring-blue-600 outline-none" placeholder="8.6" />
                    </div>
                    <div className="relative">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Diámetro (DIA)</label>
                      <input className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:ring-2 focus:ring-blue-600 outline-none" placeholder="14.2" />
                    </div>
                    <div className="relative">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Color</label>
                      <input className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Transparente" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24 space-y-6">
          <div>
            <h3 className="text-lg font-bold dark:text-white mb-4">Resumen del Pedido</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Selección estándar</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">$0.00</span>
              </div>
              <div className="flex justify-between pt-4">
                <p className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Total:</p>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">$0.00</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Método de Pago:</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'contado', name: '1- Contado', icon: <Banknote className="w-4 h-4" /> },
                { id: 'transferencia', name: '2- Transferencias', icon: <Building className="w-4 h-4" /> },
                { id: 'tarjeta', name: '3- Tarjeta de Crédito', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'mercado-pago', name: '4- Mercado Pago', icon: <Wallet className="w-4 h-4" /> }
              ].map(method => (
                <div key={method.id} className="space-y-2">
                  <button
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      paymentMethod === method.id 
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg" 
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    )}
                  >
                    {method.icon}
                    <span className="text-sm font-bold flex-1">{method.name}</span>
                    {method.id === 'transferencia' && <ChevronDown className={cn("w-4 h-4 transition-transform", paymentMethod === 'transferencia' ? "rotate-180" : "")} />}
                  </button>

                  {method.id === 'transferencia' && paymentMethod === 'transferencia' && (
                    <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {boxes.filter(b => b.type === 'bank').map(bank => (
                        <button
                          key={bank.id}
                          onClick={() => setSelectedBankId(bank.id)}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all",
                            selectedBankId === bank.id 
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          <Building className="w-3 h-3" />
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white font-black h-14 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            <Check className="w-6 h-6" /> Confirmar Operación
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
