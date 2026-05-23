import React, { useState } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, QrCode, User, X, Check, Building, Wallet } from "lucide-react";
import { cn } from "../lib/utils";
import { useFinance } from "../context/FinanceContext";
import { Transaction } from "../types";
import { useEffect } from "react";

const ITEMS = [
  { 
    id: 1, 
    name: "Ray-Ban Aviator Blue", 
    sku: "RB-3025-B", 
    price: 165.00, 
    category: "Gafas de Sol",
    stocks: { 1: 5, 2: 7 } 
  },
  { 
    id: 2, 
    name: "Oakley Holbrook Black", 
    sku: "OK-HLB-K", 
    price: 140.00, 
    category: "Gafas de Sol",
    stocks: { 1: 3, 2: 5 } 
  },
  { 
    id: 3, 
    name: "Estuche Rígido Pro", 
    sku: "ACC-01", 
    price: 15.00, 
    category: "Accesorios",
    stocks: { 1: 20, 2: 25 } 
  },
  { 
    id: 4, 
    name: "Líquido Limpiador 50ml", 
    sku: "CLN-50", 
    price: 8.50, 
    category: "Accesorios",
    stocks: { 1: 60, 2: 60 } 
  },
  { 
    id: 5, 
    name: "Microfibra Premium", 
    sku: "CLN-MF", 
    price: 4.00, 
    category: "Accesorios",
    stocks: { 1: 100, 2: 100 } 
  },
];

import { MOCK_CLIENTS } from "../lib/mockData";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function Sales() {
  const { boxes, addTransaction } = useFinance();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof MOCK_CLIENTS[0] | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>("cash");

  useEffect(() => {
    if (boxes.length > 0 && !paymentMethodId) {
      const defaultBox = boxes.find(b => b.type === 'cash') || boxes[0];
      setPaymentMethodId(defaultBox.id);
      setActiveCategory(defaultBox.type);
    }
  }, [boxes, paymentMethodId]);

  const filteredClients = MOCK_CLIENTS.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    client.dni.includes(clientSearch)
  );

  // Mock branches for availability headers
  const branchList = [
    { id: 1, short: "CC", full: "Casa Central" },
    { id: 2, short: "SH", full: "Shopping" }
  ];

  const filteredItems = ITEMS.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: typeof ITEMS[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  const handleCheckout = () => {
    const selectedBox = boxes.find(b => b.id === paymentMethodId);
    
    // Register transaction in Finance
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const transaction: Transaction = {
      id: `sale-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      concept: `Venta Rápida: ${cart.length} item(s)`,
      method: selectedBox?.name || "Desconocido",
      amount: total,
      type: 'income',
      category: 'ventas',
      boxId: paymentMethodId,
      clientName: selectedClient?.name || undefined
    };

    addTransaction(transaction);

    if (selectedClient) {
      alert(`Venta realizada por $${total.toLocaleString()} vía ${selectedBox?.name} para el cliente ${selectedClient.name}`);
    } else {
      alert(`Venta realizada por $${total.toLocaleString()} vía ${selectedBox?.name}`);
    }
    setCart([]);
    setSelectedClient(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto h-[calc(100vh-160px)]">
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
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o categoría..."
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm font-medium"
          />
        </div>

        <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Stock CC</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Stock SH</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Precio</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tighter">{item.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "text-xs font-black",
                        item.stocks[1] > 5 ? "text-emerald-600" : item.stocks[1] > 0 ? "text-amber-500" : "text-red-500"
                      )}>
                        {item.stocks[1]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "text-xs font-black",
                        item.stocks[2] > 5 ? "text-emerald-600" : item.stocks[2] > 0 ? "text-amber-500" : "text-red-500"
                      )}>
                        {item.stocks[2]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white">${item.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => addToCart(item)}
                        className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cart & Checkout Area */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Carrito de Venta
            </h2>
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {cart.reduce((acc, i) => acc + i.quantity, 0)} ITEMS
            </span>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 select-none">
                <ShoppingCart className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">Carrito vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">${item.price.toFixed(2)} c/u</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between px-1">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-black text-slate-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>IVA (21%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white pt-1">
                <span>TOTAL</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Método de Pago</p>
              
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                {/* 1- Contado */}
                <div className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  activeCategory === 'cash' ? "border-amber-200 bg-amber-50/30 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                )}>
                  <button 
                    onClick={() => setActiveCategory(activeCategory === 'cash' ? null : 'cash')}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                        <Banknote className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">1- Contado</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Efectivo / Caja Física</p>
                      </div>
                    </div>
                    {activeCategory === 'cash' ? <Plus className="w-4 h-4 rotate-45 transition-transform" /> : <Plus className="w-4 h-4 transition-transform" />}
                  </button>
                  
                  {activeCategory === 'cash' && (
                    <div className="p-3 pt-0 grid gap-2 animate-in slide-in-from-top-2 duration-200">
                      {boxes.filter(b => b.type === 'cash').map(box => (
                        <button 
                          key={box.id}
                          onClick={() => setPaymentMethodId(box.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all",
                            paymentMethodId === box.id 
                              ? 'border-amber-600 bg-white dark:bg-slate-900 text-amber-600 shadow-sm' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 opacity-60 hover:opacity-100'
                          )}
                        >
                          <span>{box.name}</span>
                          {paymentMethodId === box.id && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2- Transferencias */}
                <div className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  activeCategory === 'bank' ? "border-blue-200 bg-blue-50/30 dark:bg-blue-900/10" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                )}>
                  <button 
                    onClick={() => setActiveCategory(activeCategory === 'bank' ? null : 'bank')}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Building className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">2- Transferencias</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Bancos / Cuentas Propias</p>
                      </div>
                    </div>
                    {activeCategory === 'bank' ? <Plus className="w-4 h-4 rotate-45 transition-transform" /> : <Plus className="w-4 h-4 transition-transform" />}
                  </button>
                  
                  {activeCategory === 'bank' && (
                    <div className="p-3 pt-0 grid gap-2 animate-in slide-in-from-top-2 duration-200">
                      {boxes.filter(b => b.type === 'bank').map(box => (
                        <button 
                          key={box.id}
                          onClick={() => setPaymentMethodId(box.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all",
                            paymentMethodId === box.id 
                              ? 'border-blue-600 bg-white dark:bg-slate-900 text-blue-600 shadow-sm' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 opacity-60 hover:opacity-100'
                          )}
                        >
                          <span>{box.name}</span>
                          {paymentMethodId === box.id && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3- Tarjeta de Crédito */}
                <div className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  activeCategory === 'credit_card' ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                )}>
                  <button 
                    onClick={() => setActiveCategory(activeCategory === 'credit_card' ? null : 'credit_card')}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">3- Tarjeta de Crédito</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Posnet / MP QR / Otros</p>
                      </div>
                    </div>
                    {activeCategory === 'credit_card' ? <Plus className="w-4 h-4 rotate-45 transition-transform" /> : <Plus className="w-4 h-4 transition-transform" />}
                  </button>
                  
                  {activeCategory === 'credit_card' && (
                    <div className="p-3 pt-0 grid gap-2 animate-in slide-in-from-top-2 duration-200">
                      {boxes.filter(b => b.type === 'credit_card').map(box => (
                        <button 
                          key={box.id}
                          onClick={() => setPaymentMethodId(box.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all",
                            paymentMethodId === box.id 
                              ? 'border-emerald-600 bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 opacity-60 hover:opacity-100'
                          )}
                        >
                          <span>{box.name}</span>
                          {paymentMethodId === box.id && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4- Mercado Pago */}
                <div className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  activeCategory === 'digital' ? "border-indigo-200 bg-indigo-50/30 dark:bg-indigo-900/10" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                )}>
                  <button 
                    onClick={() => setActiveCategory(activeCategory === 'digital' ? null : 'digital')}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <Wallet className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">4- Mercado Pago</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Billeteras Digitales</p>
                      </div>
                    </div>
                    {activeCategory === 'digital' ? <Plus className="w-4 h-4 rotate-45 transition-transform" /> : <Plus className="w-4 h-4 transition-transform" />}
                  </button>
                  
                  {activeCategory === 'digital' && (
                    <div className="p-3 pt-0 grid gap-2 animate-in slide-in-from-top-2 duration-200">
                      {boxes.filter(b => b.type === 'digital').map(box => (
                        <button 
                          key={box.id}
                          onClick={() => setPaymentMethodId(box.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all",
                            paymentMethodId === box.id 
                              ? 'border-indigo-600 bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 opacity-60 hover:opacity-100'
                          )}
                        >
                          <span>{box.name}</span>
                          {paymentMethodId === box.id && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <CreditCard className="w-5 h-5" />
              Finalizar Venta
            </button>

            {selectedClient ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{selectedClient.name}</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">{selectedClient.dni}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg text-blue-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsClientModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 rounded-lg"
              >
                 <User className="w-4 h-4" /> Asociar Cliente (Opcional)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
