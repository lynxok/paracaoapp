import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useFinance } from "../context/FinanceContext";
import { Package, AlertTriangle, DollarSign, Truck, Search, Plus, X, PackagePlus, Settings2, Trash2, Edit2, ArrowDownToLine, ArrowUpFromLine, MapPin } from "lucide-react";

// Mock branches for selector
const BRANCHES = [
  { id: 1, name: "Casa Central" },
  { id: 2, name: "Shopping" },
];

import { useInventory, InventoryItem, StockMovement } from "../context/InventoryContext";
import { cn } from "../lib/utils";

function calculateFIFOValue(item: InventoryItem, movements: StockMovement[]): number {
  const itemMovements = movements.filter(m => m.sku === item.sku);
  
  // Exits (egresos)
  const totalEgresos = itemMovements
    .filter(m => m.type === 'egreso')
    .reduce((sum, m) => sum + m.quantity, 0);

  // Entries (ingresos) in chronological order (oldest first)
  const ingresos = [...itemMovements]
    .filter(m => m.type === 'ingreso')
    .reverse();

  let exitsLeft = totalEgresos;
  let remainingIngresos: { quantity: number; price: number }[] = [];

  const cleanPrice = item.price.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const defaultBuyPrice = item.buyPrice || (parseFloat(cleanPrice) * 0.6) || 0;

  for (const ing of ingresos) {
    const price = ing.buyPrice !== undefined ? ing.buyPrice : defaultBuyPrice;
    if (exitsLeft >= ing.quantity) {
      exitsLeft -= ing.quantity;
    } else {
      const remainingQty = ing.quantity - exitsLeft;
      exitsLeft = 0;
      remainingIngresos.push({ quantity: remainingQty, price });
    }
  }

  // Calculate total stock of the item across all branches
  const totalStock = (Object.values(item.stocks) as number[]).reduce((a, b) => a + b, 0);

  let valuation = 0;
  let allocatedStock = 0;

  for (const batch of remainingIngresos) {
    if (allocatedStock + batch.quantity <= totalStock) {
      valuation += batch.quantity * batch.price;
      allocatedStock += batch.quantity;
    } else {
      const needed = totalStock - allocatedStock;
      valuation += needed * batch.price;
      allocatedStock = totalStock;
      break;
    }
  }

  if (allocatedStock < totalStock) {
    const extra = totalStock - allocatedStock;
    valuation += extra * defaultBuyPrice;
  }

  return valuation;
}

export function Inventory() {
  const { inventoryCategories: categories, lensColors, contactLensColors, lensTypes } = useSettings();
  const { inventory, stockMovements, addInventoryItem, updateInventoryItem, deleteInventoryItem, registerMovement } = useInventory();
  const { suppliers } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'movements'>('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("");
  const [isStockEntryOpen, setIsStockEntryOpen] = useState(false);
  const [isStockExitOpen, setIsStockExitOpen] = useState(false);
  const [isStockTransferOpen, setIsStockTransferOpen] = useState(false);
  const [stockTransferData, setStockTransferData] = useState({ sourceBranchId: "", targetBranchId: "", quantity: "" });
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [contextItem, setContextItem] = useState<any>(null);
  const [activeStockPopoverSku, setActiveStockPopoverSku] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number } | null>(null);
  const [movementDetailFilter, setMovementDetailFilter] = useState<{ sku: string; productName: string; branchId: number; branchName: string } | null>(null);
  const location = useLocation();

  const formatPrice = (val: number) => {
    const formatted = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
    // ensure no spaces between $ and numbers
    return `$${formatted.trim()}`;
  };

  const getLastPurchaseInfo = (sku: string) => {
    const purchaseMovements = [...stockMovements]
      .filter(m => m.sku === sku && m.type === 'ingreso')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (purchaseMovements.length > 0) {
      const latest = purchaseMovements[0];
      const priceVal = latest.buyPrice || 0;
      const formattedPrice = formatPrice(priceVal);
      
      let displayDate = latest.date;
      try {
        const parts = latest.date.split('T')[0].split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          displayDate = `${day}/${month}/${year}`;
        }
      } catch (e) {}
      
      return {
        price: formattedPrice,
        date: displayDate
      };
    }
    return null;
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
    const handleClick = () => {
      closeMenu();
      setActiveStockPopoverSku(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (location.pathname === "/inventory/reception") {
      setIsStockEntryOpen(true);
    }
  }, [location.pathname]);

  const [stockEntryData, setStockEntryData] = useState({
    productId: "",
    branchId: "",
    quantity: "",
    supplier: "",
    invoice: "",
    buyPrice: ""
  });

  const suggestedSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(stockEntryData.supplier.toLowerCase())
  );

  // Simulated User Role (In a real app, this would come from an Auth Context)
  const userRole = "superadmin";

  const allCategories = ["Todos", ...categories];

  const filteredItems = inventory.map(item => {
    // Calculate quantity based on selected branch
    let qty = 0;
    if (selectedBranch === "all") {
      qty = (Object.values(item.stocks) as number[]).reduce((a, b) => a + b, 0);
    } else {
      qty = (item as any).stocks[Number(selectedBranch)] || 0;
    }

    // Determine status based on qty
    let status = "En Stock";
    let color = "emerald";
    if (qty === 0) {
      status = "Agotado";
      color = "slate";
    } else if (qty < 10) {
      status = "Bajo";
      color = "red";
    }

    return { ...item, qty, status, color };
  }).filter((item) => {
    const matchesCategory = selectedCategory === "Todos" || item.cat === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formDataObj = new FormData(form);

    const name = (formDataObj.get("name") as string || "").trim();
    const sku = (formDataObj.get("sku") as string || "").trim();
    const cat = modalCategory;
    const productColor = formDataObj.get("productColor") as string || "";
    const lensType = formDataObj.get("lensType") as string || "";
    const rawPrice = formDataObj.get("price") as string;
    const rawBuyPrice = formDataObj.get("buyPrice") as string;
    const priceVal = parseFloat(rawPrice);
    const buyPriceVal = parseFloat(rawBuyPrice);
    const criticalStockVal = parseInt(formDataObj.get("criticalStock") as string) || 5;
    
    if (!name || !sku) {
      alert("Por favor, completa los campos obligatorios: Nombre y SKU.");
      return;
    }

    if (isNaN(priceVal) || priceVal < 0 || isNaN(buyPriceVal) || buyPriceVal < 0) {
      alert("Los precios deben ser números válidos iguales o mayores a 0.");
      return;
    }
    
    const stocks: Record<number, number> = {};
    BRANCHES.forEach(b => {
      stocks[b.id] = parseInt(formDataObj.get(`stock_${b.id}`) as string) || 0;
    });

    const newItem = {
      name,
      sku,
      cat,
      price: `$${priceVal.toLocaleString('es-AR')}`,
      buyPrice: buyPriceVal,
      criticalStock: criticalStockVal,
      color: cat === "Armazones" ? "purple" : cat === "Cristales" ? "emerald" : cat === "Lentes de Contacto" ? "indigo" : "blue",
      productColor,
      lensType,
      stocks
    };

    if (contextItem) {
      updateInventoryItem(contextItem.sku, newItem);
    } else {
      addInventoryItem(newItem);
    }

    setIsModalOpen(false);
    setContextItem(null);
  };

  const totalSkus = inventory.length;
  let lowStockCount = 0;
  let totalValueVenta = 0;
  let totalValueCosto = 0;

  inventory.forEach(item => {
    const totalStock = (Object.values(item.stocks) as number[]).reduce((a, b) => a + b, 0);
    const threshold = item.criticalStock !== undefined ? item.criticalStock : 5;
    if (totalStock <= threshold) lowStockCount++;
    
    const cleanPrice = item.price.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsedPrice = parseFloat(cleanPrice) || 0;
    totalValueVenta += (totalStock * parsedPrice);
    
    const itemCostoValuation = calculateFIFOValue(item, stockMovements);
    totalValueCosto += itemCostoValuation;
  });

  const formattedTotalValueVenta = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalValueVenta);
  const formattedTotalValueCosto = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalValueCosto);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... stats ... */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Total SKUs</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSkus}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Package className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Stock Bajo</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{lowStockCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Valor Total (Venta)</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formattedTotalValueVenta}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Valor Total (Costo)</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formattedTotalValueCosto}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('inventory')}
          className={cn(
            "px-6 py-3 border-b-2 font-bold text-sm transition-all",
            activeTab === 'inventory' 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Inventario de Productos
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={cn(
            "px-6 py-3 border-b-2 font-bold text-sm transition-all",
            activeTab === 'movements' 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Movimientos de Stock
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            "px-6 py-3 border-b-2 font-bold text-sm transition-all",
            activeTab === 'products' 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Productos
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in duration-150">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 font-semibold">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 md:max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  className="w-full pl-9 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white outline-none" 
                  placeholder="Buscar por nombre o SKU..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => {
                setContextItem(null);
                setModalCategory(categories[0] || "");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Añadir Nuevo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Producto</th>
                  <th className="px-6 py-4 font-semibold">Precio Compra (Últ. Compra)</th>
                  <th className="px-6 py-4 font-semibold">Precio Venta</th>
                  <th className="px-6 py-4 font-semibold">Cantidad por Sucursal</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item, idx) => {
                  const lastPurchase = getLastPurchaseInfo(item.sku);
                  const cleanPrice = item.price.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
                  const defaultBuyPrice = item.buyPrice || (parseFloat(cleanPrice) * 0.6) || 0;
                  const formattedDefaultBuyPrice = formatPrice(defaultBuyPrice);
                  const cleanSalePrice = parseFloat(item.price.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
                  const formattedSalePrice = formatPrice(cleanSalePrice);
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{item.sku}</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold">{item.cat}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {lastPurchase ? (
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-slate-900 dark:text-white">{lastPurchase.price}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">({lastPurchase.date})</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-slate-900 dark:text-white">{formattedDefaultBuyPrice}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {formattedSalePrice}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        <div className="space-y-1 text-xs">
                          {BRANCHES.map(b => (
                            <button 
                              key={b.id} 
                              onClick={() => setMovementDetailFilter({ sku: item.sku, productName: item.name, branchId: b.id, branchName: b.name })}
                              className="flex gap-2 hover:text-blue-600 transition-colors text-left group w-full"
                              title={`Ver movimientos de ${item.name} en ${b.name}`}
                            >
                              <span className="text-slate-400 group-hover:text-blue-500">{b.name}:</span>
                              <span className="font-bold text-slate-900 dark:text-white underline decoration-dotted decoration-blue-500">{item.stocks[b.id] || 0} u.</span>
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setContextItem(item);
                              setModalCategory(item.cat);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar Producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`¿Está seguro de que desea eliminar el producto "${item.name}" (SKU: ${item.sku})? Esta acción eliminará el producto del catálogo.`)) {
                                deleteInventoryItem(item.sku);
                                alert("Producto eliminado con éxito.");
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar Producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No se encontraron productos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in duration-150">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 font-semibold">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 md:max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  className="w-full pl-9 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white outline-none" 
                  placeholder="Buscar por nombre o SKU..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <select 
                    className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white outline-none min-w-[140px]"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="all">Todas las Sucursales</option>
                    {BRANCHES.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <select 
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsStockEntryOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Truck className="w-4 h-4" /> Ingreso de Mercadería
              </button>
              <button 
                onClick={() => {
                  setModalCategory(categories[0] || "");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Añadir Nuevo
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Producto</th>
                  <th className="px-6 py-4 font-semibold">Categoría</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Precio Venta</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item, idx) => (
                  <tr 
                    key={idx} 
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {item.cat}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {selectedBranch === "all" ? (
                        <div className="flex flex-col gap-1 items-start">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setPopoverPosition({
                                x: rect.left,
                                y: rect.bottom + 6
                              });
                              setActiveStockPopoverSku(activeStockPopoverSku === item.sku ? null : item.sku);
                            }}
                            className="font-medium text-slate-900 dark:text-white underline decoration-dotted decoration-blue-500 hover:text-blue-600 transition-colors text-left"
                          >
                            {item.qty}
                          </button>
                          {activeStockPopoverSku === item.sku && popoverPosition && createPortal(
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="fixed z-50 p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] space-y-1 w-40 shadow-lg animate-in fade-in slide-in-from-top-1 duration-100"
                              style={{
                                top: `${popoverPosition.y}px`,
                                left: `${popoverPosition.x}px`
                              }}
                            >
                              <p className="font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200/40 dark:border-slate-800/60 pb-0.5 mb-1">Stock por Sucursal</p>
                              {BRANCHES.map(b => (
                                <button 
                                  key={b.id} 
                                  onClick={() => {
                                    setMovementDetailFilter({ sku: item.sku, productName: item.name, branchId: b.id, branchName: b.name });
                                    setActiveStockPopoverSku(null);
                                  }}
                                  className="flex justify-between items-center text-slate-500 dark:text-slate-400 py-0.5 hover:text-blue-600 transition-colors text-left w-full group"
                                  title={`Ver movimientos de ${item.name} en ${b.name}`}
                                >
                                  <span className="group-hover:text-blue-500">{b.name}:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 underline decoration-dotted decoration-blue-500">{item.stocks[b.id] || 0} u.</span>
                                </button>
                              ))}
                            </div>,
                            document.body
                          )}
                        </div>
                      ) : (
                        <span className="font-medium text-slate-900 dark:text-white">{item.qty}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.price}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-${item.color}-600 dark:text-${item.color}-400 font-bold text-xs`}>
                        <span className={`w-2 h-2 rounded-full bg-${item.color}-500`}></span> 
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No se encontraron productos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in duration-150">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 font-semibold">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 md:max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  className="w-full pl-9 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white outline-none" 
                  placeholder="Buscar movimientos por producto o SKU..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 px-3 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <MapPin className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white outline-none min-w-[140px]"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="all">Todas las Sucursales</option>
                  {BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setStockEntryData({ productId: "", branchId: "", quantity: "", supplier: "", invoice: "" });
                  setIsStockEntryOpen(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Cargar Ingreso
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Fecha/Hora</th>
                  <th className="px-6 py-4 font-semibold">Producto</th>
                  <th className="px-6 py-4 font-semibold">Sucursal</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Cantidad</th>
                  <th className="px-6 py-4 font-semibold">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(() => {
                  const filteredMovements = stockMovements.filter(mov => {
                    const matchesSearch = mov.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                          mov.sku.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesBranch = selectedBranch === "all" || mov.branchId === Number(selectedBranch);
                    return matchesSearch && matchesBranch;
                  });

                  if (filteredMovements.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                          No se registraron movimientos de stock con los filtros actuales.
                        </td>
                      </tr>
                    );
                  }

                  return filteredMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{mov.date}</div>
                        <div className="text-xs text-slate-500">{mov.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{mov.productName}</div>
                        <div className="text-xs text-slate-500 font-mono">{mov.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold">{mov.branchName}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          mov.type === 'ingreso' ? "bg-emerald-105 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        )}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {mov.type === 'ingreso' ? '+' : '-'}{mov.quantity}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {mov.type === 'ingreso' ? (
                          <>
                            {mov.supplier && <div><span className="font-bold">Prov:</span> {mov.supplier}</div>}
                            {mov.invoice && <div><span className="font-bold">Fact/Rem:</span> {mov.invoice}</div>}
                          </>
                        ) : (
                          <>
                            {mov.reason && <div><span className="font-bold">Motivo:</span> {mov.reason}</div>}
                            {mov.notes && <div><span className="font-bold">Obs:</span> {mov.notes}</div>}
                          </>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Entry Modal */}
      {isStockEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <Truck className="w-6 h-6 text-blue-600" />
                Ingreso de Mercadería
              </h3>
              <button onClick={() => setIsStockEntryOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const prod = inventory.find(i => i.sku === stockEntryData.productId);
              const branch = BRANCHES.find(b => b.id === Number(stockEntryData.branchId));
              if (prod && branch) {
                registerMovement({
                  sku: prod.sku,
                  productName: prod.name,
                  branchId: branch.id,
                  branchName: branch.name,
                  quantity: parseInt(stockEntryData.quantity) || 0,
                  type: 'ingreso',
                  buyPrice: parseFloat(stockEntryData.buyPrice) || 0,
                  supplier: stockEntryData.supplier,
                  invoice: stockEntryData.invoice
                });
                alert("Ingreso de mercadería registrado con éxito.");
              }
              setIsStockEntryOpen(false); 
            }}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sucursal Destino</label>
                    <select 
                      required
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                      value={stockEntryData.branchId}
                      onChange={(e) => setStockEntryData({...stockEntryData, branchId: e.target.value})}
                    >
                      <option value="">Seleccionar sucursal...</option>
                      {BRANCHES.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Producto</label>
                    <select 
                      required
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                      value={stockEntryData.productId}
                      onChange={(e) => {
                        const sku = e.target.value;
                        const prod = inventory.find(item => item.sku === sku);
                        setStockEntryData({
                          ...stockEntryData,
                          productId: sku,
                          buyPrice: prod && prod.buyPrice !== undefined ? String(prod.buyPrice) : ""
                        });
                      }}
                    >
                      <option value="">Seleccionar producto...</option>
                      {inventory.map(item => (
                        <option key={item.sku} value={item.sku}>{item.name} ({item.sku})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cantidad a Ingresar</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: 10"
                      value={stockEntryData.quantity}
                      onChange={(e) => setStockEntryData({...stockEntryData, quantity: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Proveedor (Opcional)</label>
                    <input 
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Nombre del proveedor"
                      value={stockEntryData.supplier}
                      onChange={(e) => setStockEntryData({...stockEntryData, supplier: e.target.value})}
                      onFocus={() => setShowSupplierSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSupplierSuggestions(false), 200)}
                    />
                    {showSupplierSuggestions && suggestedSuppliers.length > 0 && (
                      <div className="absolute top-[68px] left-0 right-0 z-[60] max-h-40 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-100 custom-scrollbar">
                        {suggestedSuppliers.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setStockEntryData({ ...stockEntryData, supplier: s.name });
                              setShowSupplierSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
                          >
                            {s.name} <span className="text-[10px] text-slate-400 font-mono ml-1">({s.cuit})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Precio de Compra / Costo ($)</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      min="0"
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="0.00"
                      value={stockEntryData.buyPrice}
                      onChange={(e) => setStockEntryData({...stockEntryData, buyPrice: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nro Factura / Remito (Opcional)</label>
                    <input 
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: 0001-00001234"
                      value={stockEntryData.invoice}
                      onChange={(e) => setStockEntryData({...stockEntryData, invoice: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  type="button"
                  onClick={() => setIsStockEntryOpen(false)}
                  className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm"
                >
                  Registrar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <PackagePlus className="w-6 h-6 text-blue-600" />
                {contextItem ? 'Editar Producto' : 'Añadir Nuevo Producto'}
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
            <form onSubmit={handleSubmit}>
              <div className="overflow-y-auto max-h-[calc(95vh-160px)] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre del Producto</label>
                    <input 
                      type="text" 
                      name="name"
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: Ray-Ban Aviator" 
                      defaultValue={contextItem?.name}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">SKU / Código</label>
                    <input 
                      type="text" 
                      name="sku"
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="RB-3025" 
                      defaultValue={contextItem?.sku}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Categoría</label>
                      {userRole === "superadmin" && (
                        <Link 
                          to="/settings"
                          className="text-[10px] flex items-center gap-1 text-blue-600 hover:underline font-bold"
                        >
                          <Settings2 className="w-3 h-3" /> Gestionar en Ajustes
                        </Link>
                      )}
                    </div>
                    <select 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                      value={modalCategory}
                      onChange={(e) => setModalCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  {(modalCategory === "Lentes de Contacto" || modalCategory === "Anteojos de Sol" || modalCategory === "Cristales") && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Color / Tono</label>
                      <select 
                        name="productColor"
                        className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                        defaultValue={contextItem?.productColor || ""}
                      >
                        <option value="">Seleccionar color...</option>
                        {(modalCategory === "Lentes de Contacto" ? contactLensColors : lensColors).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {modalCategory === "Cristales" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Cristal</label>
                      <select 
                        name="lensType"
                        className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                        defaultValue={contextItem?.lensType || ""}
                      >
                        <option value="">Seleccionar tipo...</option>
                        {lensTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Stock por Sucursal</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      {BRANCHES.map(b => (
                        <div key={b.id} className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{b.name}</label>
                          <input 
                            type="number" 
                            name={`stock_${b.id}`}
                            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm" 
                            placeholder="0" 
                            min="0" 
                            defaultValue={contextItem?.stocks[b.id] || 0}
                            required 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Stock Crítico (Alerta)</label>
                    <input 
                      type="number" 
                      name="criticalStock" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="5" 
                      min="0" 
                      defaultValue={contextItem?.criticalStock ?? 5}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Precio de Compra ($)</label>
                    <input 
                      type="number" 
                      name="buyPrice" 
                      step="0.01" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="0.00" 
                      min="0" 
                      defaultValue={contextItem?.buyPrice ?? ""}
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Precio de Venta ($)</label>
                    <input 
                      type="number" 
                      name="price"
                      step="0.01" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="0.00" 
                      min="0" 
                      defaultValue={contextItem?.price?.replace('$', '')}
                      required 
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
                  {contextItem ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Stock Exit Modal (Egreso) */}
      {isStockExitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <ArrowUpFromLine className="w-6 h-6 text-red-600" />
                Registrar Egreso de Stock
              </h3>
              <button onClick={() => setIsStockExitOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const form = e.currentTarget;
              const formDataObj = new FormData(form);
              const branchIdVal = Number(formDataObj.get("branchId"));
              const quantityVal = parseInt(formDataObj.get("quantity") as string) || 0;
              const reasonVal = formDataObj.get("reason") as string;
              const notesVal = formDataObj.get("notes") as string || "";

              const branch = BRANCHES.find(b => b.id === branchIdVal);
              
              if (contextItem && branch) {
                // Check if branch has enough stock
                const currentStock = contextItem.stocks[branch.id] || 0;
                if (currentStock < quantityVal) {
                  alert(`Stock insuficiente en la sucursal ${branch.name}. Stock actual: ${currentStock}`);
                  return;
                }

                registerMovement({
                  sku: contextItem.sku,
                  productName: contextItem.name,
                  branchId: branch.id,
                  branchName: branch.name,
                  quantity: quantityVal,
                  type: 'egreso',
                  reason: reasonVal,
                  notes: notesVal
                });
                alert("Egreso de mercadería registrado con éxito.");
                setIsStockExitOpen(false);
              }
            }}>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">Producto: {contextItem?.name} ({contextItem?.sku})</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {BRANCHES.map(b => (
                      <p key={b.id} className="text-[10px] text-red-600 dark:text-red-500">
                        <span className="font-bold">{b.name}:</span> {contextItem?.stocks[b.id] || 0} unid.
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sucursal de Origen</label>
                  <select 
                    name="branchId"
                    required
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">Seleccionar sucursal...</option>
                    {BRANCHES.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cantidad a Retirar</label>
                    <input 
                      type="number" 
                      name="quantity"
                      required
                      min="1"
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: 1"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Motivo</label>
                    <select name="reason" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white">
                      <option value="Ajuste de Inventario">Ajuste de Inventario</option>
                      <option value="Rotura / Daño">Rotura / Daño</option>
                      <option value="Vencimiento">Vencimiento</option>
                      <option value="Venta (Manual)">Venta (Manual)</option>
                      <option value="Donación">Donación</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Observaciones</label>
                  <textarea name="notes" className="h-20 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white resize-none text-sm" placeholder="Detalles del movimiento..."></textarea>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  type="button"
                  onClick={() => setIsStockExitOpen(false)}
                  className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-red-600 text-white rounded-lg font-bold shadow-sm hover:bg-red-700 transition-all text-sm"
                >
                  Confirmar Egreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal (Mover Stock) */}
      {isStockTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <PackagePlus className="w-6 h-6 text-blue-600" />
                Mover Stock entre Sucursales
              </h3>
              <button onClick={() => setIsStockTransferOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const sourceId = Number(stockTransferData.sourceBranchId);
              const targetId = Number(stockTransferData.targetBranchId);
              const qty = parseInt(stockTransferData.quantity) || 0;

              if (sourceId === targetId) {
                alert("La sucursal de origen y destino no pueden ser la misma.");
                return;
              }

              const sourceBranch = BRANCHES.find(b => b.id === sourceId);
              const targetBranch = BRANCHES.find(b => b.id === targetId);

              if (contextItem && sourceBranch && targetBranch) {
                const currentSourceStock = contextItem.stocks[sourceBranch.id] || 0;
                if (currentSourceStock < qty) {
                  alert(`Stock insuficiente en la sucursal de origen (${sourceBranch.name}). Stock disponible: ${currentSourceStock}`);
                  return;
                }

                // Register Exit from Source
                registerMovement({
                  sku: contextItem.sku,
                  productName: contextItem.name,
                  branchId: sourceBranch.id,
                  branchName: sourceBranch.name,
                  quantity: qty,
                  type: 'egreso',
                  reason: `Transferencia a ${targetBranch.name}`
                });

                const cleanPrice = contextItem.price.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
                const defaultBuyPrice = contextItem.buyPrice || (parseFloat(cleanPrice) * 0.6) || 0;

                // Register Entry into Target
                registerMovement({
                  sku: contextItem.sku,
                  productName: contextItem.name,
                  branchId: targetBranch.id,
                  branchName: targetBranch.name,
                  quantity: qty,
                  type: 'ingreso',
                  buyPrice: defaultBuyPrice,
                  reason: `Transferencia desde ${sourceBranch.name}`
                });

                alert("Transferencia de stock registrada con éxito.");
                setIsStockTransferOpen(false);
              }
            }}>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Producto: {contextItem?.name} ({contextItem?.sku})</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {BRANCHES.map(b => (
                      <span key={b.id} className="font-semibold">{b.name}: {contextItem?.stocks[b.id] || 0} u.</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sucursal Origen</label>
                    <select 
                      required
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                      value={stockTransferData.sourceBranchId}
                      onChange={(e) => setStockTransferData({...stockTransferData, sourceBranchId: e.target.value})}
                    >
                      <option value="">Seleccionar origen...</option>
                      {BRANCHES.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sucursal Destino</label>
                    <select 
                      required
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                      value={stockTransferData.targetBranchId}
                      onChange={(e) => setStockTransferData({...stockTransferData, targetBranchId: e.target.value})}
                    >
                      <option value="">Seleccionar destino...</option>
                      {BRANCHES.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cantidad a Transferir</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                    placeholder="Ej: 5"
                    value={stockTransferData.quantity}
                    onChange={(e) => setStockTransferData({...stockTransferData, quantity: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  type="button"
                  onClick={() => setIsStockTransferOpen(false)}
                  className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm"
                >
                  Confirmar Transferencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Detail Drill-Down Modal */}
      {movementDetailFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold dark:text-white">
                  Historial de Movimientos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Producto: <span className="font-bold text-slate-700 dark:text-slate-300">{movementDetailFilter.productName} ({movementDetailFilter.sku})</span> | Sucursal: <span className="font-bold text-slate-700 dark:text-slate-300">{movementDetailFilter.branchName}</span>
                </p>
              </div>
              <button 
                onClick={() => setMovementDetailFilter(null)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {(() => {
                const filteredMovs = stockMovements.filter(
                  m => m.sku === movementDetailFilter.sku && m.branchId === movementDetailFilter.branchId
                );

                if (filteredMovs.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                      No hay movimientos registrados para este producto en esta sucursal.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-semibold font-bold">Fecha/Hora</th>
                          <th className="px-4 py-3 font-semibold font-bold">Producto</th>
                          <th className="px-4 py-3 font-semibold font-bold">Sucursal</th>
                          <th className="px-4 py-3 font-semibold font-bold">Tipo</th>
                          <th className="px-4 py-3 font-semibold font-bold">Cantidad</th>
                          <th className="px-4 py-3 font-semibold font-bold">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredMovs.map((mov) => (
                          <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {mov.date} {mov.time}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              <div>{mov.productName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{mov.sku}</div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {mov.branchName}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                mov.type === 'ingreso' 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {mov.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                              </span>
                            </td>
                            <td className={`px-4 py-3 font-bold text-xs ${
                              mov.type === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {mov.type === 'ingreso' ? `+${mov.quantity}` : `-${mov.quantity}`}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                              {mov.type === 'ingreso' ? (
                                <>
                                  {mov.supplier && <div><span className="font-semibold">Proveedor:</span> {mov.supplier}</div>}
                                  {mov.invoice && <div><span className="font-semibold">Factura/Remito:</span> {mov.invoice}</div>}
                                  {mov.notes && <div><span className="font-semibold">Obs:</span> {mov.notes}</div>}
                                  {!mov.supplier && !mov.invoice && !mov.notes && <span className="italic text-slate-400">-</span>}
                                </>
                              ) : (
                                <>
                                  {mov.reason && <div><span className="font-semibold">Motivo:</span> {mov.reason}</div>}
                                  {mov.notes && <div><span className="font-semibold">Obs:</span> {mov.notes}</div>}
                                  {!mov.reason && !mov.notes && <span className="italic text-slate-400">-</span>}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/50">
              <button 
                onClick={() => setMovementDetailFilter(null)}
                className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {menuPosition && (
        <div 
          className="fixed z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 min-w-[200px] animate-in fade-in zoom-in duration-100"
          style={{ top: menuPosition.y, left: menuPosition.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acciones: {contextItem?.sku}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{contextItem?.name}</p>
          </div>
          <button 
            onClick={() => {
              setStockEntryData({ ...stockEntryData, productId: contextItem.sku });
              setIsStockEntryOpen(true);
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4" /> Registrar Ingreso
          </button>
          
          {userRole === "superadmin" && (
            <>
              <button 
                onClick={() => {
                  setIsStockExitOpen(true);
                  closeMenu();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <ArrowUpFromLine className="w-4 h-4" /> Registrar Egreso
              </button>
              <button 
                onClick={() => {
                  setStockTransferData({ sourceBranchId: "", targetBranchId: "", quantity: "" });
                  setIsStockTransferOpen(true);
                  closeMenu();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <PackagePlus className="w-4 h-4" /> Mover Stock
              </button>
              <button 
                onClick={() => {
                  setModalCategory(contextItem?.cat || categories[0] || "");
                  setIsModalOpen(true);
                  closeMenu();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Editar Producto
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}


