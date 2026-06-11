import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Plus, X, Edit2, History, UserPlus, Eye, ShoppingCart, Trash2, Receipt, Package, ArrowRight, Printer, CheckCircle } from "lucide-react";
import { useClients } from "../context/ClientContext";
import { useSettings } from "../context/SettingsContext";
import { useFinance } from "../context/FinanceContext";
import { cn } from "../lib/utils";
import { Client } from "../types";

export function Clients() {
  const navigate = useNavigate();
  const { clients, addClient, updateClient, deleteClient, getClientOrders, getClientTransactions } = useClients();
  const { insurances } = useSettings();
  const { boxes, addTransaction, voidTransaction, transactions } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCCModalOpen, setIsCCModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptForm, setReceiptForm] = useState({
    amount: "",
    concept: "Cancelación de Saldo de Cuenta Corriente",
    method: "Efectivo"
  });
  const [selectedBoxId, setSelectedBoxId] = useState("caja-efectivo");
  const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [dni, setDni] = useState('');
  const [dniError, setDniError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [contextItem, setContextItem] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const userRole = "superadmin"; // Simulated role

  const handlePrintReceipt = (receipt: any) => {
    const win = window.open('', '_blank', 'width=450,height=600');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Recibo de Pago - ${receipt.receiptNumber}</title>
        <style>
          @page { size: auto; margin: 10mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; background: #fff; padding: 20px; }
          .receipt { border: 2px dashed #000; padding: 20px; max-width: 380px; margin: 0 auto; }
          .text-center { text-align: center; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { font-size: 10px; color: #555; margin-bottom: 2px; }
          .divider { border-bottom: 1px solid #000; margin: 10px 0; }
          .double-divider { border-bottom: 2px dashed #000; margin: 15px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .bold { font-weight: bold; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 10px; }
          .no-print { text-align: center; margin-top: 20px; }
          .btn { padding: 8px 16px; font-weight: bold; cursor: pointer; border: none; border-radius: 4px; margin: 0 4px; }
          .btn-primary { background: #000; color: #fff; }
          .btn-secondary { background: #eee; color: #333; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
            .receipt { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="text-center">
            <h2 class="title">ÓPTICA PARACAO</h2>
            <p class="subtitle">Paraná, Entre Ríos, Argentina</p>
            <p class="subtitle">Tel: (343) 420-XXXX</p>
            <div class="divider"></div>
            <p class="bold" style="font-size: 11px;">RECIBO DE PAGO</p>
            <p style="font-size: 10px;">${receipt.receiptNumber}</p>
          </div>

          <div style="margin-top: 15px; font-size: 11px;">
            <div class="row">
              <span>Fecha: ${receipt.date}</span>
              <span>Hora: ${receipt.time}</span>
            </div>
            <div class="divider"></div>
            <div style="margin-bottom: 4px;"><span class="bold">Cliente:</span> ${receipt.clientName}</div>
            <div style="margin-bottom: 4px;"><span class="bold">DNI:</span> ${receipt.clientDni}</div>
            <div class="divider"></div>
            <div style="margin-bottom: 4px;"><span class="bold">Concepto:</span> ${receipt.concept}</div>
            <div style="margin-bottom: 4px;"><span class="bold">Medio:</span> ${receipt.method}</div>
            <div style="margin-bottom: 4px;"><span class="bold">Caja:</span> ${receipt.boxName}</div>
          </div>

          <div class="double-divider"></div>

          <div class="total-row">
            <span>TOTAL RECIBIDO</span>
            <span>$${receipt.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>

          <div class="text-center" style="margin-top: 30px; font-size: 9px; color: #666; text-transform: uppercase;">
            Gracias por su confianza
          </div>
        </div>

        <div class="no-print">
          <button class="btn btn-primary" onclick="window.print()">Imprimir</button>
          <button class="btn btn-secondary" onclick="window.close()">Cerrar</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
  };

  const handleContextMenu = (e: React.MouseEvent, item: any) => {
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

  useEffect(() => {
    if (contextItem) {
      setFormData(contextItem);
      setBirthDate(contextItem.birthDate || '');
      setAge(contextItem.age || '');
      setDni(contextItem.dni || '');
    } else {
      setFormData({});
      setBirthDate('');
      setAge('');
      setDni('');
    }
  }, [contextItem]);

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const finalData = {
      ...formData,
      dni,
      birthDate,
      age,
      firstName: target.elements.firstName.value,
      lastName: target.elements.lastName.value,
      name: `${target.elements.firstName.value} ${target.elements.lastName.value}`.trim(),
      phone: target.elements.phone.value,
      email: target.elements.email.value,
      insuranceId: (target.elements.namedItem('insuranceId') as HTMLSelectElement)?.value,
      affiliateNumber: (target.elements.namedItem('affiliateNumber') as HTMLInputElement)?.value,
      address: {
        street: target.elements.street.value,
        number: target.elements.address_number.value,
        floor: target.elements.address_floor.value,
        apartment: target.elements.address_apartment.value,
      }
    } as Client;

    if (contextItem) {
      updateClient({ ...contextItem, ...finalData });
    } else {
      addClient(finalData);
    }
    setIsModalOpen(false);
    setContextItem(null);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.dni.includes(searchTerm) || 
    c.phone.includes(searchTerm)
  );

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setBirthDate(date);
    if (date) {
      const today = new Date();
      const birthDateObj = new Date(date);
      let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge.toString() : '');
    } else {
      setAge('');
    }
  };

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove anything that is not a digit (including dots)
    const numericValue = value.replace(/\D/g, '');
    
    if (value !== numericValue) {
      setDniError('Ingresar solo números, sin puntos.');
    } else {
      setDniError('');
    }
    
    setDni(numericValue);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            className="w-full pl-9 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white outline-none" 
            placeholder="Buscar por nombre, DNI o teléfono..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto justify-center transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <UserPlus className="w-6 h-6 text-blue-600" />
                {contextItem ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
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
            <form onSubmit={handleSaveClient}>
              <div className="overflow-y-auto max-h-[calc(95vh-160px)] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre</label>
                    <input 
                      name="firstName"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: Juan" 
                      defaultValue={contextItem?.firstName || contextItem?.name?.split(' ')[0]}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Apellido</label>
                    <input 
                      name="lastName"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: Pérez" 
                      defaultValue={contextItem?.lastName || contextItem?.name?.split(' ').slice(1).join(' ')}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">DNI / Identificación</label>
                    <input 
                      type="text" 
                      value={dni || contextItem?.dni?.replace(/\./g, '') || ''}
                      onChange={handleDniChange}
                      inputMode="numeric"
                      className={`h-10 px-3 rounded-lg border ${dniError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white`} 
                      placeholder="12345678" 
                      required 
                    />
                    {dniError && <p className="text-[10px] text-red-500 font-medium">{dniError}</p>}
                  </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha de Nacimiento</label>
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={handleBirthDateChange}
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Edad</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={age}
                    placeholder="Autocalculado"
                    className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800 w-full cursor-not-allowed text-slate-900 dark:text-white" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teléfono / WhatsApp</label>
                  <input 
                    name="phone"
                    type="tel" 
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                    placeholder="+54 9 ..." 
                    defaultValue={contextItem?.phone}
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                    placeholder="ejemplo@correo.com" 
                    defaultValue={contextItem?.email}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Calle</label>
                  <input name="street" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Nombre de la calle" defaultValue={contextItem?.address?.street} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:col-span-2">
                  <div className="flex flex-col gap-1.5 text-slate-900 dark:text-white">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Número</label>
                    <input name="address_number" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none" placeholder="123" defaultValue={contextItem?.address?.number} />
                  </div>
                  <div className="flex flex-col gap-1.5 text-slate-900 dark:text-white">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Piso</label>
                    <input name="address_floor" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none" placeholder="2do" defaultValue={contextItem?.address?.floor} />
                  </div>
                  <div className="flex flex-col gap-1.5 text-slate-900 dark:text-white">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Dpto.</label>
                    <input name="address_apartment" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none" placeholder="B" defaultValue={contextItem?.address?.apartment} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Obra Social / Seguro</label>
                  <select name="insuranceId" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" defaultValue={contextItem?.insuranceId || ""}>
                    <option value="">Particular / Sin Cobertura</option>
                    {insurances.filter(i => i.active !== false).map(ins => (
                      <option key={ins.id} value={ins.id}>{ins.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nº Afiliado (Opcional)</label>
                  <input name="affiliateNumber" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Ej: 12345678" defaultValue={contextItem?.affiliateNumber} />
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
                  {contextItem ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold">DNI</th>
                <th className="px-6 py-4 font-semibold">Último Pedido</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map((c, idx) => (
                <tr 
                  key={c.id} 
                  onContextMenu={(e) => handleContextMenu(e, c)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{c.phone}</td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{c.dni}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "font-bold",
                      c.balance < 0 ? "text-rose-600" : c.balance > 0 ? "text-emerald-600" : "text-slate-400"
                    )}>
                      ${Math.abs(c.balance).toLocaleString()}
                      {c.balance < 0 && <span className="ml-1 text-[10px] uppercase font-black tracking-tighter">Deuda</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setContextItem(c);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 transition-colors" 
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => {
                           setContextItem(c);
                           setIsCCModalOpen(true);
                         }}
                         className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-emerald-600 transition-colors" 
                         title="Cuenta Corriente"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => {
                           setContextItem(c);
                           setIsOrdersModalOpen(true);
                         }}
                         className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 transition-colors" 
                         title="Pedidos"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context Menu */}
      {menuPosition && (
        <div 
          className="fixed z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 min-w-[220px] animate-in fade-in zoom-in duration-100"
          style={{ top: menuPosition.y, left: menuPosition.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente: {contextItem?.dni}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{contextItem?.name}</p>
          </div>
          <Link
            to={`/orders/new?clientId=${contextItem?.dni}`}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" /> Nuevo Pedido
          </Link>
          <button 
            onClick={() => {
              const message = encodeURIComponent(`Hola ${contextItem.name}, te contactamos de la Óptica...`);
              window.open(`https://wa.me/${contextItem.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg> Enviar WhatsApp
          </button>
          
          <button 
            onClick={() => {
              setContextItem(contextItem);
              setIsCCModalOpen(true);
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Receipt className="w-4 h-4" /> Cuenta Corriente
          </button>

          <button 
            onClick={() => {
              setContextItem(contextItem);
              setIsOrdersModalOpen(true);
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Package className="w-4 h-4" /> Ver Pedidos
          </button>
          
          <button 
            onClick={() => {
              deleteClient(contextItem.id);
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Eliminar Cliente
          </button>
        </div>
      )}

      {/* C.C. Modal */}
      {isCCModalOpen && contextItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">Cuenta Corriente</h3>
                  <p className="text-sm text-slate-500">{contextItem.name}</p>
                </div>
              </div>
              <button onClick={() => { setIsCCModalOpen(false); setContextItem(null); }} className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Actual</p>
                    <p className={cn("text-2xl font-black", contextItem.balance < 0 ? "text-rose-600" : "text-emerald-600")}>
                      ${Math.abs(contextItem.balance).toLocaleString()}
                      <span className="text-xs font-bold ml-1">{contextItem.balance < 0 ? 'Déficit' : 'A Favor'}</span>
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Consumido</p>
                    <p className="text-2xl font-black text-indigo-600">$185.400</p>
                  </div>
               </div>

               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const clientTx = transactions.filter(t => t.clientId === contextItem.id);
                    if (clientTx.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400">
                          <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="font-bold">No hay movimientos registrados recientemente</p>
                          <p className="text-xs">Los pagos y facturas aparecerán aquí</p>
                        </div>
                      );
                    }
                    return clientTx.map(tx => (
                      <div key={tx.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg text-white",
                            tx.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
                          )}>
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.concept}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {tx.date} · {tx.time} · {tx.method} ({boxes.find(b => b.id === tx.boxId)?.name || 'Caja'})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "font-bold text-sm",
                            tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </span>
                          {tx.category === 'Cobro Cliente' && (
                            <>
                              <button
                                onClick={() => {
                                  const receiptToPrint = {
                                    receiptNumber: tx.id.replace('tx-', 'REC-'),
                                    clientName: contextItem.name,
                                    clientDni: contextItem.dni,
                                    amount: tx.amount,
                                    concept: tx.concept.replace('Cobro Cuenta Corriente: ', ''),
                                    method: tx.method,
                                    boxName: boxes.find(b => b.id === tx.boxId)?.name || 'Caja General',
                                    date: tx.date,
                                    time: tx.time
                                  };
                                  handlePrintReceipt(receiptToPrint);
                                }}
                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"
                                title="Reimprimir Recibo"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de que deseas anular el recibo ${tx.id.replace('tx-', 'REC-')} por $${tx.amount.toLocaleString()}? Se restará este monto del saldo del cliente.`)) {
                                    voidTransaction(tx.id);
                                    const updatedClient = {
                                      ...contextItem,
                                      balance: contextItem.balance - tx.amount
                                    };
                                    updateClient(updatedClient);
                                    setContextItem(updatedClient);
                                    alert("El recibo ha sido anulado y el saldo del cliente actualizado.");
                                  }
                                }}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-rose-600 transition-colors"
                                title="Anular Recibo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
             </div>

             <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
               <button 
                  onClick={() => {
                    setIsCCModalOpen(false);
                    setReceiptForm({
                      amount: contextItem.balance < 0 ? Math.abs(contextItem.balance).toString() : "",
                      concept: "Cancelación de Saldo de Cuenta Corriente",
                      method: "Efectivo"
                    });
                    setSelectedBoxId(boxes[0]?.id || "caja-efectivo");
                    setGeneratedReceipt(null);
                    setIsReceiptModalOpen(true);
                  }}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  Cargar Pago
               </button>
               <button 
                  onClick={() => {
                    setIsCCModalOpen(false);
                    setReceiptForm({
                      amount: contextItem.balance < 0 ? Math.abs(contextItem.balance).toString() : "",
                      concept: "Cancelación de Saldo de Cuenta Corriente",
                      method: "Efectivo"
                    });
                    setSelectedBoxId(boxes[0]?.id || "caja-efectivo");
                    setGeneratedReceipt(null);
                    setIsReceiptModalOpen(true);
                  }}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Emitir Recibo
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {isOrdersModalOpen && contextItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">Pedidos Realizados</h3>
                  <p className="text-sm text-slate-500">{contextItem.name}</p>
                </div>
              </div>
              <button onClick={() => { setIsOrdersModalOpen(false); setContextItem(null); }} className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[500px] custom-scrollbar">
               {getClientOrders(contextItem.id).length > 0 ? (
                 <div className="space-y-4">
                    {getClientOrders(contextItem.id).map(order => (
                      <div key={order.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
                         <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                  {order.type === 'monofocal' || order.type === 'multifocal' || order.type === 'ocupacional' ? <Eye className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                               </div>
                               <div>
                                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{order.id} · {order.date}</p>
                                  <h4 className="font-bold text-slate-900 dark:text-white">{order.service}</h4>
                               </div>
                            </div>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                               {order.status}
                            </span>
                         </div>
                         <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex gap-4">
                               <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Total</p>
                                  <p className="font-bold text-slate-900 dark:text-white">${order.amount.toLocaleString()}</p>
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendiente</p>
                                  <p className="font-bold text-rose-600">${(order.amount - order.paid).toLocaleString()}</p>
                               </div>
                            </div>
                            <Link to={`/orders/new/${order.type}`} className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                               Ver Detalle <ArrowRight className="w-3 h-3" />
                            </Link>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-16 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No hay pedidos registrados</p>
                    <button 
                       onClick={() => {
                         setIsOrdersModalOpen(false);
                         navigate('/orders/new/monofocal', { state: { clientId: contextItem.id, clientName: contextItem.name } });
                       }}
                       className="mt-4 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all"
                     >
                       Iniciar un Pedido
                     </button>
                 </div>
               )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
               <button onClick={() => setIsOrdersModalOpen(false)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  Cerrar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Emission Modal */}
      {isReceiptModalOpen && contextItem && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <style>{`
              @media print {
                body > * {
                  display: none !important;
                }
                #printable-receipt-modal {
                  display: block !important;
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  height: auto;
                  background: white;
                  color: black;
                  z-index: 99999;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>
            
            <div id="printable-receipt-modal">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-900/10 no-print">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {generatedReceipt ? "Recibo Emitido Exitosamente" : "Emitir Recibo de Pago"}
                  </h3>
                </div>
                <button 
                  onClick={() => { setIsReceiptModalOpen(false); setContextItem(null); }} 
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!generatedReceipt ? (
                /* Form view */
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const now = new Date();
                    const dateStr = now.toISOString().split('T')[0];
                    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
                    const amountVal = parseFloat(receiptForm.amount);

                    if (isNaN(amountVal) || amountVal <= 0) return;

                    // Add income transaction
                    addTransaction({
                      id: `tx-${Date.now()}`,
                      date: dateStr,
                      time: timeStr,
                      concept: `Cobro Cuenta Corriente: ${receiptForm.concept}`,
                      method: receiptForm.method,
                      amount: amountVal,
                      type: 'income',
                      category: 'Cobro Cliente',
                      boxId: selectedBoxId,
                      clientId: contextItem.id,
                      clientName: contextItem.name
                    });

                    // Update client balance
                    updateClient({
                      ...contextItem,
                      balance: contextItem.balance + amountVal
                    });

                    // Set receipt details for preview
                    setGeneratedReceipt({
                      receiptNumber: `REC-${String(Math.floor(100000 + Math.random() * 900000))}`,
                      clientName: contextItem.name,
                      clientDni: contextItem.dni,
                      amount: amountVal,
                      concept: receiptForm.concept,
                      method: receiptForm.method,
                      boxName: boxes.find(b => b.id === selectedBoxId)?.name || 'Caja General',
                      date: now.toLocaleDateString('es-AR'),
                      time: now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                    });
                  }}
                  className="p-6 space-y-4 no-print"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Cliente</label>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{contextItem.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">DNI</label>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{contextItem.dni}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Monto a Recibir ($)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      step="any"
                      value={receiptForm.amount}
                      onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                      className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-mono text-lg font-bold" 
                      placeholder="0.00" 
                    />
                    {contextItem.balance < 0 && (
                      <p className="text-[11px] text-slate-400">
                        Saldo pendiente: <span className="font-bold text-rose-500">${Math.abs(contextItem.balance).toLocaleString()}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Concepto</label>
                    <input 
                      type="text" 
                      required
                      value={receiptForm.concept}
                      onChange={(e) => setReceiptForm({ ...receiptForm, concept: e.target.value })}
                      className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Cancelación de Saldo" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Medio de Pago</label>
                      <select 
                        value={receiptForm.method}
                        onChange={(e) => setReceiptForm({ ...receiptForm, method: e.target.value })}
                        className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia Bancaria</option>
                        <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                        <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                        <option value="Mercado Pago">Mercado Pago</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Caja de Destino</label>
                      <select 
                        value={selectedBoxId}
                        onChange={(e) => setSelectedBoxId(e.target.value)}
                        className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                      >
                        {boxes.map(box => (
                          <option key={box.id} value={box.id}>{box.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      type="button"
                      onClick={() => { setIsReceiptModalOpen(false); setContextItem(null); }}
                      className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md text-sm"
                    >
                      Confirmar y Generar Recibo
                    </button>
                  </div>
                </form>
              ) : (
                /* Receipt Preview / Printable view */
                <div className="p-6 space-y-6">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 p-4 rounded-xl flex items-center gap-3 text-sm no-print">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>El pago ha sido registrado y el balance de la cuenta corriente ha sido actualizado.</span>
                  </div>

                  {/* Printable Area */}
                  <div className="bg-white text-black p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 font-mono text-sm space-y-6 max-w-md mx-auto shadow-inner">
                    <div className="text-center space-y-1">
                      <h2 className="text-lg font-black tracking-wider">ÓPTICA PARACAO</h2>
                      <p className="text-xs text-slate-500">Paraná, Entre Ríos, Argentina</p>
                      <p className="text-xs text-slate-500">Tel: (343) 420-XXXX</p>
                      <div className="border-b border-slate-200 my-2"></div>
                      <p className="font-bold text-xs uppercase">Recibo de Pago X</p>
                      <p className="text-xs">{generatedReceipt.receiptNumber}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Fecha: {generatedReceipt.date}</span>
                        <span>Hora: {generatedReceipt.time}</span>
                      </div>
                      <div className="border-b border-slate-100"></div>
                      <div>
                        <span className="font-bold">Cliente:</span> {generatedReceipt.clientName}
                      </div>
                      <div>
                        <span className="font-bold">DNI:</span> {generatedReceipt.clientDni}
                      </div>
                      <div className="border-b border-slate-100"></div>
                      <div>
                        <span className="font-bold">Concepto:</span> {generatedReceipt.concept}
                      </div>
                      <div>
                        <span className="font-bold">Método:</span> {generatedReceipt.method}
                      </div>
                      <div>
                        <span className="font-bold">Caja:</span> {generatedReceipt.boxName}
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-200 pt-4 flex justify-between items-center">
                      <span className="font-black text-sm uppercase">Total Recibido</span>
                      <span className="text-xl font-black">${generatedReceipt.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="text-center pt-8 text-[9px] text-slate-400 uppercase">
                      Gracias por su confianza
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 no-print justify-end">
                    <button 
                      onClick={() => { setIsReceiptModalOpen(false); setContextItem(null); }}
                      className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-sm"
                    >
                      Finalizar
                    </button>
                    <button 
                      onClick={() => handlePrintReceipt(generatedReceipt)}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 text-sm"
                    >
                      <Printer className="w-4 h-4" /> Imprimir Recibo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
