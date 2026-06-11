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
import { useCart } from "../context/CartContext";

export function Sales() {
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");

  const filteredItems = ITEMS.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (item: typeof ITEMS[0]) => {
    addToCart({
      id: `prod-${item.id}`,
      type: 'product',
      name: item.name,
      price: item.price,
      quantity: 1,
      sku: item.sku,
      category: item.category
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-[calc(100vh-160px)]">
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
                        onClick={() => handleAddToCart(item)}
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
    </div>
  );
}
