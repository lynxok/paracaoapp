import React, { useState } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, QrCode, User, X, Check, Building, Wallet } from "lucide-react";
import { cn } from "../lib/utils";
import { useFinance } from "../context/FinanceContext";
import { Transaction } from "../types";
import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useInventory, InventoryItem } from "../context/InventoryContext";

export function Sales() {
  const { inventory } = useInventory();
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    (item.cat && item.cat.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddToCart = (item: InventoryItem) => {
    const numPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.-]+/g, "")) || 0;
    addToCart({
      id: `prod-${item.sku}`,
      type: 'product',
      name: item.name,
      price: numPrice,
      quantity: 1,
      sku: item.sku,
      category: item.cat
    });
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-160px)]">
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
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No se encontraron productos en el inventario de Supabase.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const numPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.-]+/g, "")) || 0;
                    const stockCC = item.stocks?.[1] ?? 0;
                    const stockSH = item.stocks?.[2] ?? 0;

                    return (
                      <tr key={item.sku} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tighter">{item.sku}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            {item.cat}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "text-xs font-black",
                            stockCC > 5 ? "text-emerald-600" : stockCC > 0 ? "text-amber-500" : "text-red-500"
                          )}>
                            {stockCC}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "text-xs font-black",
                            stockSH > 5 ? "text-emerald-600" : stockSH > 0 ? "text-amber-500" : "text-red-500"
                          )}>
                            {stockSH}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-slate-900 dark:text-white">${numPrice.toFixed(2)}</span>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
