import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Plus, X, Edit2, History, UserPlus, Eye, ShoppingCart, Trash2, Receipt, Package, ArrowRight } from "lucide-react";
import { useClients } from "../context/ClientContext";
import { cn } from "../lib/utils";
import { Client } from "../types";

export function Clients() {
  const { clients, addClient, updateClient, deleteClient, getClientOrders, getClientTransactions } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCCModalOpen, setIsCCModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [dni, setDni] = useState('');
  const [dniError, setDniError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [contextItem, setContextItem] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const userRole = "superadmin"; // Simulated role

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
      name: target.elements.name.value,
      phone: target.elements.phone.value,
      email: target.elements.email.value,
      insurance: target.elements.insurance.value,
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
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre Completo</label>
                    <input 
                      name="name"
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: Juan Manuel Pérez" 
                      defaultValue={contextItem?.name}
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
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Obra Social / Seguro</label>
                  <select name="insurance" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" defaultValue={contextItem?.insurance}>
                    <option value="Particular">Particular</option>
                    <option value="OSDE">OSDE</option>
                    <option value="Swiss Medical">Swiss Medical</option>
                    <option value="PAMI">PAMI</option>
                    <option value="Otros">Otros</option>
                  </select>
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
                  <div className="text-center py-12 text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No hay movimientos registrados recientemente</p>
                    <p className="text-xs">Los pagos y facturas aparecerán aquí</p>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
               <button className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                  Cargar Pago
               </button>
               <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
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
                                  {order.type === 'monofocal' || order.type === 'multifocal' ? <Eye className="w-4 h-4" /> : <Package className="w-4 h-4" />}
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
                    <button className="mt-4 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all">
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
    </div>
  );
}
