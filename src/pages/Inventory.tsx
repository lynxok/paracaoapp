import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { Package, AlertTriangle, DollarSign, Truck, Search, Plus, X, PackagePlus, Settings2, Trash2, Edit2, ArrowDownToLine, ArrowUpFromLine, MapPin } from "lucide-react";

// Mock branches for selector
const BRANCHES = [
  { id: 1, name: "Casa Central" },
  { id: 2, name: "Shopping" },
];

import { useInventory } from "../context/InventoryContext";
export function Inventory() {
  const { inventoryCategories: categories, lensColors, contactLensColors, lensTypes } = useSettings();
  const { inventory } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("");
  const [isStockEntryOpen, setIsStockEntryOpen] = useState(false);
  const [isStockExitOpen, setIsStockExitOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [contextItem, setContextItem] = useState<any>(null);
  const location = useLocation();

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
    if (location.pathname === "/inventory/reception") {
      setIsStockEntryOpen(true);
    }
  }, [location.pathname]);

  const [stockEntryData, setStockEntryData] = useState({
    productId: "",
    branchId: "",
    quantity: "",
    supplier: "",
    invoice: ""
  });

  // Simulated User Role (In a real app, this would come from an Auth Context)
  const userRole = "superadmin";

  const allCategories = ["Todos", ...categories];

  const filteredItems = inventory.map(item => {
    // Calculate quantity based on selected branch
    let qty = 0;
    if (selectedBranch === "all") {
      qty = Object.values(item.stocks).reduce((a, b) => a + b, 0);
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
    setIsModalOpen(false);
  };

  const totalSkus = inventory.length;
  let lowStockCount = 0;
  let totalValue = 0;

  inventory.forEach(item => {
    const totalStock = Object.values(item.stocks).reduce((a, b) => a + b, 0);
    if (totalStock <= 5) lowStockCount++;
    
    const parsedPrice = parseFloat(item.price.replace('$', '').replace(',', '')) || 0;
    totalValue += (totalStock * parsedPrice);
  });

  const formattedTotalValue = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalValue);

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
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Valor Total</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formattedTotalValue}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">En Tránsito</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
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
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.qty}</td>
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
            <form onSubmit={(e) => { e.preventDefault(); setIsStockEntryOpen(false); }}>
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
                      onChange={(e) => setStockEntryData({...stockEntryData, productId: e.target.value})}
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Proveedor (Opcional)</label>
                    <input 
                      type="text" 
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Nombre del proveedor"
                      value={stockEntryData.supplier}
                      onChange={(e) => setStockEntryData({...stockEntryData, supplier: e.target.value})}
                    />
                  </div>
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
                    <input type="number" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="5" min="0" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Precio de Compra ($)</label>
                    <input type="number" step="0.01" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="0.00" min="0" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Precio de Venta ($)</label>
                    <input 
                      type="number" 
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
            <form onSubmit={(e) => { e.preventDefault(); setIsStockExitOpen(false); }}>
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
                      required
                      min="1"
                      max={contextItem?.qty}
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                      placeholder="Ej: 1"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Motivo</label>
                    <select className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white">
                      <option>Ajuste de Inventario</option>
                      <option>Rotura / Daño</option>
                      <option>Vencimiento</option>
                      <option>Venta (Manual)</option>
                      <option>Donación</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Observaciones</label>
                  <textarea className="h-20 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white resize-none text-sm" placeholder="Detalles del movimiento..."></textarea>
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


