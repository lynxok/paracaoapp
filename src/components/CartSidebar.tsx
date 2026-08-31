import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, CartItem } from "../context/CartContext";
import { useFinance } from "../context/FinanceContext";
import { useClients } from "../context/ClientContext";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Building, 
  Wallet, 
  User, 
  X, 
  Check, 
  ChevronDown, 
  Eye, 
  Sparkles, 
  AlertCircle,
  Edit,
  Printer
} from "lucide-react";
import { cn } from "../lib/utils";

export function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    selectedClient, 
    setSelectedClient, 
    paymentMethodId, 
    setPaymentMethodId, 
    checkout,
    setIsCartOpen
  } = useCart();

  const { boxes } = useFinance();
  const { clients } = useClients();

  const [activeCategory, setActiveCategory] = useState<string | null>("cash");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    client.dni.includes(clientSearch)
  );

  const toggleExpandItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (total * discountPercent) / 100;
  const finalTotal = Math.max(0, total - discountAmount);
  const subtotal = total;

  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Seña / Pago parcial states
  const [isPartial, setIsPartial] = useState(false);
  const [senaAmount, setSenaAmount] = useState<number>(0);
  const [previstoBoxId, setPrevistoBoxId] = useState<string>('');

  const handlePrintReceipt = (receipt: any) => {
    if (!receipt) return;
    const win = window.open('', '_blank', 'width=450,height=700');
    if (!win) {
      window.print();
      return;
    }

    const itemsRows = receipt.items.map((item: any) => `
      <div style="margin-bottom: 6px;">
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:11px;">
          <span>${item.quantity}x ${item.name}</span>
          <span>$${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div style="font-size:10px; color:#555; display:flex; justify-content:space-between;">
          <span>P. Unit: $${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          ${item.type === 'prescription' ? '<span style="font-style:italic;">(Recetado)</span>' : ''}
        </div>
      </div>
    `).join('');

    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Comprobante de Venta - ${receipt.id}</title>
        <style>
          @page { size: auto; margin: 6mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; background: #fff; padding: 12px; }
          .receipt { border: 2px dashed #000; padding: 16px; max-width: 360px; margin: 0 auto; }
          .text-center { text-align: center; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
          .subtitle { font-size: 10px; color: #444; margin-bottom: 2px; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .double-divider { border-bottom: 2px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 11px; }
          .bold { font-weight: bold; }
          .highlight-card { background: #f0f0f0; border: 1px solid #ccc; padding: 8px; border-radius: 4px; margin-top: 8px; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin: 6px 0; }
          .no-print { text-align: center; margin-top: 18px; }
          .btn { padding: 8px 18px; font-weight: bold; cursor: pointer; border: none; border-radius: 4px; margin: 0 4px; font-size: 12px; }
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
            <p class="subtitle">Paraná, Entre Ríos</p>
            <p class="subtitle">Comprobante de Venta / Resumen</p>
            <div class="divider"></div>
            <p class="bold" style="font-size: 11px;">COMPROBANTE #${receipt.id}</p>
            <p style="font-size: 10px;">${receipt.date} - ${receipt.time}</p>
          </div>

          <div style="margin-top: 8px;">
            <div class="row">
              <span class="bold">Cliente:</span>
              <span>${receipt.clientName}</span>
            </div>
            ${receipt.clientDni ? `
            <div class="row">
              <span class="bold">DNI:</span>
              <span>${receipt.clientDni}</span>
            </div>` : ''}
            <div class="row">
              <span class="bold">Medio de Pago:</span>
              <span>${receipt.paymentMethod}</span>
            </div>
          </div>

          <div class="divider"></div>
          <p class="bold" style="font-size: 10px; margin-bottom: 6px; text-transform: uppercase;">Detalle de Artículos / Servicios:</p>
          
          ${itemsRows}

          <div class="divider"></div>

          <div class="row">
            <span>Subtotal:</span>
            <span>$${receipt.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>

          ${receipt.discountPercent > 0 ? `
          <div class="row" style="font-weight: bold;">
            <span>Descuento (${receipt.discountPercent}%):</span>
            <span>-$${receipt.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>` : ''}

          <div class="double-divider"></div>

          <div class="total-row">
            <span>TOTAL VENTA:</span>
            <span>$${receipt.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>

          ${receipt.isPartial ? `
          <div class="highlight-card">
            <div class="row bold">
              <span>SEÑA / ABONO HOY:</span>
              <span>$${receipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="row bold" style="font-size: 12px; margin-top: 4px; border-top: 1px dashed #999; padding-top: 4px;">
              <span>SALDO PENDIENTE:</span>
              <span>$${receipt.remainingBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          ` : `
          <div class="highlight-card" style="text-align: center; font-size: 10px; font-weight: bold;">
            TOTALMENTE ABONADO ($${receipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
          </div>
          `}

          <div class="text-center" style="margin-top: 18px; font-size: 9px; color: #555;">
            <p>*** Conserve este comprobante ***</p>
            <p style="margin-top: 2px;">¡Gracias por su compra y confianza!</p>
          </div>
        </div>

        <div class="no-print">
          <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir</button>
          <button class="btn btn-secondary" onclick="window.close()">Cerrar</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
  };

  const handleCheckoutClick = () => {
    if (isProcessing) return;

    // Verificar si hay cliente en la receta del carrito o cliente seleccionado
    const hasRecipeClient = cart.some(c => c.details?.client);
    if (!selectedClient && !hasRecipeClient) {
      setIsClientModalOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = isPartial 
        ? checkout(senaAmount, paymentMethodId, previstoBoxId, discountPercent)
        : checkout(undefined, undefined, undefined, discountPercent);
      if (res.receipt) {
        setCompletedReceipt(res.receipt);
        setDiscountPercent(0);
        setIsPartial(false);
        setSenaAmount(0);
      } else {
        alert(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose || (() => setIsCartOpen(false))}
      />

      <aside className={cn(
        "fixed lg:static inset-y-0 right-0 z-50 w-full sm:max-w-md lg:w-[380px] h-full flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden shrink-0 transition-all duration-300 animate-in slide-in-from-right"
      )}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <h2 className="font-black flex items-center gap-2 text-slate-900 dark:text-white text-base">
          <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Carrito & Resumen
        </h2>
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
            {cart.reduce((acc, i) => acc + i.quantity, 0)} ITEMS
          </span>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 select-none py-12">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-full mb-3">
              <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            <p className="text-sm font-bold tracking-wide">Tu carrito está vacío</p>
            <p className="text-xs text-slate-400 text-center max-w-[200px] mt-1">
              Agrega productos o carga un recetado para comenzar.
            </p>
          </div>
        ) : (
          cart.map(item => {
            const isExpanded = !!expandedItems[item.id];
            return (
              <div 
                key={item.id} 
                className="flex flex-col p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group"
              >
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider leading-none",
                        item.type === 'prescription' 
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>
                        {item.type === 'prescription' ? 'Recetado' : 'Producto'}
                      </span>
                      {item.category && (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{item.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u</p>
                    
                    {item.type === 'product' && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between px-1 shrink-0">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-black text-slate-900 dark:text-white">${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {item.type === 'prescription' && item.details && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/30 dark:border-slate-700/30 flex items-center justify-between">
                    <button 
                      onClick={() => toggleExpandItem(item.id)}
                      className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      {isExpanded ? 'Ocultar Receta' : 'Ver Detalles de Receta'}
                    </button>

                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        if (onClose) onClose();
                        navigate(`/orders/edit/${item.id}`);
                      }}
                      className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Editar Recetado
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 text-[10px] bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 animate-in slide-in-from-top-1">
                        {item.details.client && (
                          <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-1">
                            <span className="font-bold text-slate-500">Paciente:</span>
                            <span className="font-black text-slate-700 dark:text-slate-300">{item.details.client.name}</span>
                          </div>
                        )}
                        {item.details.selectedFrame && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500">Armazón:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.details.selectedFrame.name}</span>
                          </div>
                        )}
                        {item.details.selectedCrystal && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500">Cristal:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.details.selectedCrystal.name}</span>
                          </div>
                        )}
                        {item.details.lensColor && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500">Color:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.details.lensColor}</span>
                          </div>
                        )}
                        {item.details.medico && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500">Médico:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.details.medico}</span>
                          </div>
                        )}
                        {(item.details.diOD || item.details.diOI) && (() => {
                          const od = parseFloat(item.details.diOD) || 0;
                          const oi = parseFloat(item.details.diOI) || 0;
                          const total = od + oi;
                          return (
                            <>
                              <div className="flex justify-between border-t border-slate-200/20 dark:border-slate-800/20 pt-1">
                                <span className="font-bold text-slate-500">DI (OD/OI):</span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">
                                  {item.details.diOD || '-'}/{item.details.diOI || '-'} mm
                                </span>
                              </div>
                              {total > 0 && (
                                <div className="flex justify-between">
                                  <span className="font-bold text-slate-500">DI Total:</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-black">
                                    {total} mm
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                        {(item.details.apOD || item.details.apOI) && (
                          <div className="flex justify-between border-t border-slate-200/20 dark:border-slate-800/20 pt-1">
                            <span className="font-bold text-slate-500">Altura Pupilar (OD/OI):</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {item.details.apOD || '-'}/{item.details.apOI || '-'} mm
                            </span>
                          </div>
                        )}
                        {item.details.deliveryDate && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200/20 dark:border-slate-800/20 pt-1">
                            <span>Fecha Entrega:</span>
                            <span>{new Date(item.details.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Checkout Area */}
      <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-4 pb-24 lg:pb-6">
        {/* Money breakdown */}
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Descuento TC-42 */}
          <div className="flex items-center justify-between text-xs gap-2 py-1">
            <span className="font-bold text-slate-600 dark:text-slate-400">Descuento (%)</span>
            <div className="flex items-center gap-1">
              <input 
                type="number"
                min="0"
                max="100"
                value={discountPercent || ''}
                onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                placeholder="0"
                className="w-16 h-7 text-right px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs outline-none focus:ring-1 focus:ring-blue-600"
              />
              <span className="font-bold text-slate-400">%</span>
            </div>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Descuento aplicado</span>
              <span>-${discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2.5">
            <span>TOTAL DE VENTA</span>
            <span className="text-blue-600 dark:text-blue-400">${finalTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Seña Toggle and Inputs */}
        {cart.length > 0 && (
          <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl space-y-3 border border-slate-200 dark:border-slate-850">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPartial} 
                onChange={(e) => {
                  setIsPartial(e.target.checked);
                  if (e.target.checked) {
                    setSenaAmount(Math.round(finalTotal / 2));
                    setPrevistoBoxId(boxes[0]?.id || '');
                  }
                }}
                className="w-4 h-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Registrar Seña / Pago Parcial</span>
            </label>

            {isPartial && (
              <div className="space-y-2.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 animate-in slide-in-from-top-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Monto de Seña ($)</label>
                  <input 
                    type="number" 
                    min="1"
                    max={finalTotal}
                    value={senaAmount || ''} 
                    onChange={e => setSenaAmount(Math.max(1, Math.min(finalTotal, parseFloat(e.target.value) || 0)))}
                    className="w-full h-8 px-2 rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-200"
                  />
                  <p className="text-[10px] font-medium text-slate-500 mt-1">Saldo restante: <span className="font-bold text-slate-800 dark:text-slate-200">${(finalTotal - senaAmount).toLocaleString()}</span></p>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Caja para la Seña</label>
                  <p className="text-[10px] text-slate-400 leading-tight">Selecciona abajo en "Método de Pago" la caja donde ingresará la seña.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Caja prevista para el Saldo</label>
                  <select 
                    value={previstoBoxId}
                    onChange={e => setPrevistoBoxId(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-[11px] outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-200"
                  >
                    {boxes.map(box => (
                      <option key={box.id} value={box.id}>{box.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods */}
        {cart.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</p>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5 custom-scrollbar">
              {/* Cash Box */}
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                activeCategory === 'cash' ? "border-amber-200 bg-amber-50/20 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800/40 hover:border-slate-200"
              )}>
                <button 
                  onClick={() => setActiveCategory(activeCategory === 'cash' ? null : 'cash')}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Efectivo</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", activeCategory === 'cash' && "rotate-180")} />
                </button>
                {activeCategory === 'cash' && (
                  <div className="p-2 pt-0 grid gap-1.5 animate-in slide-in-from-top-1">
                    {boxes.filter(b => b.type === 'cash').map(box => (
                      <button 
                        key={box.id}
                        onClick={() => setPaymentMethodId(box.id)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all",
                          paymentMethodId === box.id 
                            ? 'border-amber-500 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 opacity-70 hover:opacity-100'
                        )}
                      >
                        <span>{box.name}</span>
                        {paymentMethodId === box.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bank Transfer */}
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                activeCategory === 'bank' ? "border-blue-200 bg-blue-50/20 dark:bg-blue-900/10" : "border-slate-100 dark:border-slate-800/40 hover:border-slate-200"
              )}>
                <button 
                  onClick={() => setActiveCategory(activeCategory === 'bank' ? null : 'bank')}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Transferencia</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", activeCategory === 'bank' && "rotate-180")} />
                </button>
                {activeCategory === 'bank' && (
                  <div className="p-2 pt-0 grid gap-1.5 animate-in slide-in-from-top-1">
                    {boxes.filter(b => b.type === 'bank').map(box => (
                      <button 
                        key={box.id}
                        onClick={() => setPaymentMethodId(box.id)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all",
                          paymentMethodId === box.id 
                            ? 'border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 opacity-70 hover:opacity-100'
                        )}
                      >
                        <span>{box.name}</span>
                        {paymentMethodId === box.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cards */}
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                activeCategory === 'credit_card' ? "border-emerald-200 bg-emerald-50/20 dark:bg-emerald-900/10" : "border-slate-100 dark:border-slate-800/40 hover:border-slate-200"
              )}>
                <button 
                  onClick={() => setActiveCategory(activeCategory === 'credit_card' ? null : 'credit_card')}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tarjeta Crédito/Débito</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", activeCategory === 'credit_card' && "rotate-180")} />
                </button>
                {activeCategory === 'credit_card' && (
                  <div className="p-2 pt-0 grid gap-1.5 animate-in slide-in-from-top-1">
                    {boxes.filter(b => b.type === 'credit_card').map(box => (
                      <button 
                        key={box.id}
                        onClick={() => setPaymentMethodId(box.id)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all",
                          paymentMethodId === box.id 
                            ? 'border-emerald-500 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 opacity-70 hover:opacity-100'
                        )}
                      >
                        <span>{box.name}</span>
                        {paymentMethodId === box.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Billeteras Digitales */}
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                activeCategory === 'digital' ? "border-indigo-200 bg-indigo-50/20 dark:bg-indigo-900/10" : "border-slate-100 dark:border-slate-800/40 hover:border-slate-200"
              )}>
                <button 
                  onClick={() => setActiveCategory(activeCategory === 'digital' ? null : 'digital')}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mercado Pago / Digital</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", activeCategory === 'digital' && "rotate-180")} />
                </button>
                {activeCategory === 'digital' && (
                  <div className="p-2 pt-0 grid gap-1.5 animate-in slide-in-from-top-1">
                    {boxes.filter(b => b.type === 'digital').map(box => (
                      <button 
                        key={box.id}
                        onClick={() => setPaymentMethodId(box.id)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all",
                          paymentMethodId === box.id 
                            ? 'border-indigo-500 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 opacity-70 hover:opacity-100'
                        )}
                      >
                        <span>{box.name}</span>
                        {paymentMethodId === box.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <button 
          disabled={cart.length === 0}
          onClick={handleCheckoutClick}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <CreditCard className="w-5 h-5" />
          Finalizar Venta
        </button>

        {/* Client Selection (Required) */}
        {selectedClient ? (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 animate-in fade-in">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{selectedClient.name}</p>
                <p className="text-[9px] text-blue-600 dark:text-blue-400 font-mono leading-none">{selectedClient.dni}</p>
              </div>
            </div>
            <button onClick={() => setSelectedClient(null)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          cart.length > 0 && (
            <button 
              onClick={() => setIsClientModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Asociar Cliente (Requerido)</span>
            </button>
          )
        )}
      </div>

      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <User className="w-5 h-5 text-blue-600" /> Asociar Cliente para la Venta
                </h3>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                  Selecciona un cliente o elije "Cliente Mostrador" para continuar.
                </p>
              </div>
              <button onClick={() => setIsClientModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input 
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar por nombre o DNI..."
                className="w-full px-3 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-xs"
                autoFocus
              />
              <div className="max-h-56 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.map(client => {
                  const isMostrador = client.id === 'cliente-mostrador' || client.name.toLowerCase() === 'cliente mostrador';
                  return (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setIsClientModalOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs transition-colors",
                        isMostrador && "bg-blue-50/50 dark:bg-blue-900/20"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 dark:text-white">{client.name}</p>
                          {isMostrador && (
                            <span className="text-[9px] font-extrabold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded">
                              Por defecto
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{client.dni}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Receipt Modal / Prompt Impresión */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            
            {/* Header del Modal */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">¡Venta Registrada con Éxito!</h3>
                  <p className="text-[11px] text-emerald-100 font-medium">¿Desea imprimir el comprobante para el cliente?</p>
                </div>
              </div>
              <button 
                onClick={() => setCompletedReceipt(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vista Previa del Ticket / Resumen */}
            <div className="p-5 space-y-3 font-mono text-xs text-slate-700 dark:text-slate-300 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* Encabezado Comercio */}
              <div className="text-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-2.5">
                <p className="font-black text-sm text-slate-900 dark:text-white tracking-wide">ÓPTICA PARACAO</p>
                <p className="text-[10px] text-slate-400">Comprobante de Venta / Resumen</p>
                <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-slate-500">
                  <span className="font-bold">#{completedReceipt.id}</span>
                  <span>•</span>
                  <span>{completedReceipt.date} {completedReceipt.time}</span>
                </div>
              </div>

              {/* Datos Cliente & Pago */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg space-y-1 text-[11px] border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans font-medium">Cliente:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{completedReceipt.clientName}</span>
                </div>
                {completedReceipt.clientDni && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans font-medium">DNI:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{completedReceipt.clientDni}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans font-medium">Medio de Pago:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{completedReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Lista de Items */}
              <div className="border-t border-b border-dashed border-slate-200 dark:border-slate-800 py-2.5 space-y-2">
                <p className="font-bold text-slate-400 text-[10px] uppercase font-sans tracking-wider">Artículos / Servicios:</p>
                {completedReceipt.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-[11px] gap-2">
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity}x {item.name}</span>
                      <div className="text-[10px] text-slate-400">
                        ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
                      </div>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white whitespace-nowrap">
                      ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desglose Financiero */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-bold">${completedReceipt.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>

                {completedReceipt.discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Descuento ({completedReceipt.discountPercent}%):</span>
                    <span>-${completedReceipt.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span>TOTAL VENTA:</span>
                  <span className="text-blue-600 dark:text-blue-400 text-base font-black">
                    ${completedReceipt.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Bloque de Seña / Saldo Restante */}
              {completedReceipt.isPartial ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-amber-800 dark:text-amber-300 font-bold">
                    <span>Seña Dejada (Abonado):</span>
                    <span className="font-black">${completedReceipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-black pt-1 border-t border-amber-200 dark:border-amber-800/40">
                    <span>Saldo Restante Pendiente:</span>
                    <span className="text-sm font-black">${completedReceipt.remainingBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  ✓ Totalmente Abonado (${completedReceipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handlePrintReceipt(completedReceipt)}
                className="flex-1 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>🖨️ Imprimir Comprobante</span>
              </button>
              <button
                onClick={() => setCompletedReceipt(null)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Finalizar sin Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
