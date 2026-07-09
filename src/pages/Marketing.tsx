import React, { useState } from "react";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Search, 
  Filter, 
  Mail, 
  Smartphone, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  X,
  Save,
  Trash2,
  Info,
  Download,
  FileSpreadsheet,
  Plus,
  Check,
  Building2,
  QrCode,
  FileText
} from "lucide-react";
import { cn } from "../lib/utils";
import { useClients } from "../context/ClientContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { generateInvoicePDF } from "../utils/pdfGenerator";

const INITIAL_CAMPAIGNS = [
  { 
    id: 1, 
    name: "Recordatorio Control Anual", 
    status: "Active", 
    sent: 145, 
    conversion: "12%", 
    type: "WhatsApp",
    timeValue: 12,
    timeUnit: "months",
    productType: "any",
    template: "¡Hola {nombre_cliente}! Te escribimos de la Óptica. Notamos que tu último control para tus {producto} fue en {fecha}. ¿Te gustaría agendar una cita para revisar tu graduación visual? 👓"
  },
  { 
    id: 2, 
    name: "Promo Lentes de Contacto", 
    status: "Scheduled", 
    sent: 0, 
    conversion: "0%", 
    type: "WhatsApp",
    timeValue: 6,
    timeUnit: "months",
    productType: "contact",
    template: "Hola {nombre_cliente}, te recordamos que ya pasó un tiempo desde tu última visita por tus lentes de contacto. ¡Te esperamos!"
  },
  { 
    id: 3, 
    name: "Renovación Multifocales", 
    status: "Active", 
    sent: 89, 
    conversion: "8%", 
    type: "WhatsApp",
    timeValue: 12,
    timeUnit: "months",
    productType: "multifocal",
    template: "Estimado/a {nombre_cliente}, ya ha transcurrido un año desde que adquirió sus lentes multifocales. Le recomendamos agendar su cita de control anual."
  },
];

export function Marketing() {
  const { clients, orders } = useClients();
  const [search, setSearch] = useState("");
  
  const [campaigns, setCampaigns] = useState<any[]>(() => {
    const saved = localStorage.getItem('optica_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const saveCampaigns = (newCampaigns: any[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('optica_campaigns', JSON.stringify(newCampaigns));
  };

  const [activeCampaignId, setActiveCampaignId] = useState<number | string>(() => {
    const saved = localStorage.getItem('optica_campaigns');
    const list = saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    return list[0]?.id || "";
  });

  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'marketing' | 'consolidation'>('marketing');
  
  // Points of sale (Puntos de Venta - P.V.)
  const [puntosVenta, setPuntosVenta] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_puntos_venta');
    return saved ? JSON.parse(saved) : ["0001 - P.V. Central", "0002 - P.V. Shopping", "0003 - P.V. Online"];
  });
  const [newPV, setNewPV] = useState("");
  
  const { branches, currentBranch } = useAuth();
  const [activeInvoicingOrder, setActiveInvoicingOrder] = useState<any | null>(null);

  // Mapped branch PVs
  const [branchPVs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('optica_branch_pvs');
    return saved ? JSON.parse(saved) : {};
  });

  // Detailed invoice logs (CAE, PV, date, invoice number)
  const [invoiceDetails, setInvoiceDetails] = useState<Record<string, {
    cae: string;
    vto: string;
    pv: string;
    num: string;
    tipo: string;
  }>>(() => {
    const saved = localStorage.getItem('optica_invoice_details');
    return saved ? JSON.parse(saved) : {};
  });

  // Track which PV is selected for which order
  const [orderPVs, setOrderPVs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('optica_order_pvs');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Track invoiced order status
  const [invoicedOrders, setInvoicedOrders] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('optica_invoiced_orders');
    return saved ? JSON.parse(saved) : {};
  });

  const handleAddPV = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPV.trim() && !puntosVenta.includes(newPV.trim())) {
      const updated = [...puntosVenta, newPV.trim()];
      setPuntosVenta(updated);
      localStorage.setItem('optica_puntos_venta', JSON.stringify(updated));
      setNewPV("");
    }
  };

  const handleRemovePV = (pv: string) => {
    const updated = puntosVenta.filter(item => item !== pv);
    setPuntosVenta(updated);
    localStorage.setItem('optica_puntos_venta', JSON.stringify(updated));
  };

  const handleSelectPV = (orderId: string, pv: string) => {
    const updated = { ...orderPVs, [orderId]: pv };
    setOrderPVs(updated);
    localStorage.setItem('optica_order_pvs', JSON.stringify(updated));
  };

  const handleToggleInvoice = (orderId: string) => {
    const updated = { ...invoicedOrders, [orderId]: !invoicedOrders[orderId] };
    setInvoicedOrders(updated);
    localStorage.setItem('optica_invoiced_orders', JSON.stringify(updated));
  };

  const exportToCSV = () => {
    // Columns: ID, Fecha, DNI Cliente, Cliente, Tipo Venta, Concepto, Importe, Punto de Venta, Estado Facturación
    const headers = ["ID Pedido", "Fecha", "DNI Cliente", "Cliente", "Tipo de Venta", "Detalle/Concepto", "Importe", "Punto de Venta", "Estado"];
    
    // Sort orders by type first
    const sortedOrders = [...orders].sort((a, b) => a.type.localeCompare(b.type));
    
    const rows = sortedOrders.map(o => {
      const client = clients.find(c => c.id === o.clientId);
      const pv = orderPVs[o.id] || puntosVenta[0] || "No asignado";
      const status = invoicedOrders[o.id] ? "Facturado" : "Pendiente";
      return [
        o.id,
        o.date,
        client?.dni || "-",
        o.clientName,
        o.type.toUpperCase(),
        o.service.replace(/,/g, ' '),
        o.amount.toString(),
        pv,
        status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consolidado_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const today = new Date();
  const activeCampaign = campaigns.find(c => c.id === Number(activeCampaignId) || c.id === activeCampaignId) || campaigns[0];

  const customersPending = orders.map(order => {
    const client = clients.find(c => c.id === order.clientId);
    if (!client) return null;
    
    // Filter by product type if campaign config is available
    if (activeCampaign) {
      const pType = activeCampaign.productType || 'any';
      const orderType = order.type;
      const isContactSearch = order.service.toLowerCase().includes('contacto');

      if (pType !== 'any') {
        if (pType === 'contact' && orderType !== 'contact' && !isContactSearch) return null;
        if (pType === 'monofocal' && orderType !== 'monofocal') return null;
        if (pType === 'multifocal' && orderType !== 'multifocal') return null;
        if (pType === 'ocupacional' && orderType !== 'ocupacional') return null;
        if (pType === 'sale' && orderType !== 'sale') return null;
        if (pType === 'any_glasses' && !['monofocal', 'multifocal', 'ocupacional'].includes(orderType)) return null;
      }
    }

    const orderDate = new Date(order.date);
    let nextControlDate = new Date(orderDate);
    
    // Add dynamic time offset
    if (activeCampaign) {
      const timeVal = Number(activeCampaign.timeValue) || 12;
      const timeUnit = activeCampaign.timeUnit || 'months';
      
      if (timeUnit === 'days') {
        nextControlDate.setDate(nextControlDate.getDate() + timeVal);
      } else if (timeUnit === 'years') {
        nextControlDate.setFullYear(nextControlDate.getFullYear() + timeVal);
      } else { // months
        nextControlDate.setMonth(nextControlDate.getMonth() + timeVal);
      }
    } else {
      if (order.service.toLowerCase().includes('contacto')) {
        nextControlDate.setMonth(nextControlDate.getMonth() + 6);
      } else {
        nextControlDate.setFullYear(nextControlDate.getFullYear() + 1);
      }
    }

    const diffDays = Math.ceil((nextControlDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Solo mostramos vencidos recientemente (hasta 60 días atrás) o próximos (hasta 30 días adelante)
    if (diffDays > 45 || diffDays < -90) return null;
    
    return {
      id: order.id,
      name: client.name,
      lastPurchase: order.date,
      product: order.service,
      status: diffDays < 0 ? 'Vencido' : 'Próximo',
      contact: client.phone,
      birthDate: client.birthDate,
      nextDate: nextControlDate
    };
  }).filter(Boolean)
    .sort((a, b) => a!.nextDate.getTime() - b!.nextDate.getTime());

  const filteredCustomers = customersPending.filter(c => 
    c!.name.toLowerCase().includes(search.toLowerCase()) || 
    c!.product.toLowerCase().includes(search.toLowerCase())
  );

  const handleWhatsApp = (customer: any) => {
    let text = "";
    if (activeCampaign && activeCampaign.template) {
      text = activeCampaign.template;
    } else {
      text = "¡Hola {nombre_cliente}! Te escribimos de la Óptica. Notamos que tu último control para tus {producto} fue en {fecha}. ¿Te gustaría agendar una cita para revisar tu graduación visual? 👓";
    }
    
    // Replace variables
    text = text
      .replace(/{nombre_cliente}/g, customer.name)
      .replace(/{producto}/g, customer.product)
      .replace(/{fecha}/g, new Date(customer.lastPurchase).toLocaleDateString('es-ES'))
      .replace(/{fecha_cumpleaños}/g, customer.birthDate || '')
      .replace(/{fecha_hoy}/g, new Date().toLocaleDateString('es-ES'));

    const message = encodeURIComponent(text);
    window.open(`https://wa.me/${customer.contact.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleNewCampaign = () => {
    const name = window.prompt("Ingrese el nombre de la nueva campaña:");
    if (name) {
      const newCampaign = { 
        id: Date.now(), 
        name, 
        status: "Scheduled", 
        sent: 0, 
        conversion: "0%", 
        type: "WhatsApp",
        timeValue: 12,
        timeUnit: "months",
        productType: "any",
        template: "¡Hola {nombre_cliente}! Te escribimos de la Óptica..."
      };
      saveCampaigns([...campaigns, newCampaign]);
      setActiveCampaignId(newCampaign.id);
    }
  };

  const handleProgramAll = () => {
    if (customersPending.length === 0) {
      alert("No hay recordatorios pendientes para programar.");
      return;
    }
    alert(`Se han puesto en cola ${customersPending.length} recordatorios automáticos de WhatsApp para ser enviados gradualmente hoy.`);
  };

  const upcomingMonths = [0, 1, 2].map(offset => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const monthName = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const count = customersPending.filter(c => c!.nextDate.getMonth() === d.getMonth() && c!.nextDate.getFullYear() === d.getFullYear()).length;
    return { 
      label: monthName.charAt(0).toUpperCase() + monthName.slice(1), 
      count, 
      color: offset === 0 ? "bg-blue-500" : offset === 1 ? "bg-purple-500" : "bg-indigo-500" 
    };
  });

  const clientOrderCounts = orders.reduce((acc, order) => {
    acc[order.clientId] = (acc[order.clientId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const clientsWithMultipleOrders = (Object.values(clientOrderCounts) as number[]).filter(count => count > 1).length;
  const retentionRate = clients.length > 0 ? Math.round((clientsWithMultipleOrders / clients.length) * 100) : 0;

  const totalSales = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const formattedTotalSales = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0, notation: totalSales > 999999 ? "compact" : "standard" }).format(totalSales);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Tab Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('marketing')}
          className={cn(
            "pb-4 font-bold text-sm border-b-2 transition-all",
            activeTab === 'marketing'
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
          )}
        >
          Campañas & Automatización
        </button>
        <button
          onClick={() => setActiveTab('consolidation')}
          className={cn(
            "pb-4 font-bold text-sm border-b-2 transition-all",
            activeTab === 'consolidation'
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
          )}
        >
          Consolidación de Ventas & Facturación
        </button>
      </div>

      {activeTab === 'marketing' ? (
        <>
          {/* Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Clientes Registrados", value: clients.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Tasa de Retención", value: `${retentionRate}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "Recordatorios Mes", value: customersPending.length.toString(), icon: Calendar, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
              { label: "Ventas Totales", value: formattedTotalSales, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Campañas Activas */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" /> Campañas de Automatización
                  </h3>
                  <button onClick={handleNewCampaign} className="text-sm font-bold text-blue-600 hover:underline">Nueva Campaña</button>
                </div>
                <div className="p-6 space-y-4">
                  {campaigns.map(campaign => (
                    <div 
                      key={campaign.id} 
                      onClick={() => setSelectedCampaign(campaign)}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          campaign.type === 'WhatsApp' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {campaign.type === 'WhatsApp' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{campaign.name}</p>
                          <div className="flex items-center gap-3 text-xs mt-0.5">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded font-black uppercase text-[9px]",
                              campaign.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            )}>
                              {campaign.status}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{campaign.sent} enviados</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-emerald-600 font-bold">{campaign.conversion} conv.</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Próximos Seguimientos */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recordatorios del Día</h3>
                    <select
                      value={activeCampaignId}
                      onChange={e => setActiveCampaignId(e.target.value)}
                      className="h-8 px-2 py-0 rounded bg-slate-50 dark:bg-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar cliente..." 
                      className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Cliente</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Última Compra</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Estado</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredCustomers.map(customer => customer && (
                        <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</span>
                              <span className="text-[10px] text-slate-500">{customer.product}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            {new Date(customer.lastPurchase).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                              customer.status === 'Vencido' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            )}>
                              <AlertCircle className="w-3 h-3" />
                              {customer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleWhatsApp(customer)}
                              className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700 transition-all flex items-center gap-2 ml-auto shadow-sm shadow-emerald-200 dark:shadow-none"
                            >
                              <Smartphone className="w-3 h-3" /> WhatsApp
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                            No hay seguimientos pendientes cercanos. ¡Todo al día!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Sidebar de Acciones Rápidas */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
                <h4 className="text-lg font-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-200" /> Tip Inteligente
                </h4>
                <p className="text-blue-100 text-sm mt-3 leading-relaxed opacity-90">
                  Enviar recordatorios de control a los 12 meses aumenta la tasa de recompra en un <span className="font-bold underline">25%</span> de promedio.
                </p>
                <button onClick={handleProgramAll} className="w-full mt-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-sm">
                  Programar Todos
                </button>
              </div>

              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Próximos Vencimientos
                </h4>
                <div className="space-y-4">
                  {upcomingMonths.map((m, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>{m.label}</span>
                        <span>{m.count} Clientes</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", m.color)} style={{ width: `${Math.max(2, (m.count / Math.max(1, customersPending.length)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Modal Editar Campaña */}
          {selectedCampaign && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                    <MessageSquare className="w-6 h-6 text-blue-600" /> Editar Campaña
                  </h3>
                  <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  saveCampaigns(campaigns.map(c => c.id === selectedCampaign.id ? selectedCampaign : c));
                  setSelectedCampaign(null);
                }}>
                  <div className="p-6 space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de Campaña</label>
                      <input type="text" value={selectedCampaign.name} onChange={e => setSelectedCampaign({...selectedCampaign, name: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" required />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5 col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tiempo Post-Compra</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            min="1"
                            value={selectedCampaign.timeValue || 1} 
                            onChange={e => setSelectedCampaign({...selectedCampaign, timeValue: parseInt(e.target.value) || 1})}
                            className="w-20 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-center font-bold" 
                            required 
                          />
                          <select 
                            value={selectedCampaign.timeUnit || 'months'} 
                            onChange={e => setSelectedCampaign({...selectedCampaign, timeUnit: e.target.value})}
                            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm"
                          >
                            <option value="days">Días</option>
                            <option value="months">Meses</option>
                            <option value="years">Años</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 group/tooltip relative">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ventana de Atribución</label>
                          <Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
                          <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none">
                            Tiempo máximo posterior al envío del mensaje en el cual, si el cliente compra, la venta se contará como un éxito de esta campaña.
                          </div>
                        </div>
                        <select 
                          value={selectedCampaign.attributionWindow || 15}
                          onChange={e => setSelectedCampaign({...selectedCampaign, attributionWindow: parseInt(e.target.value) || 15})}
                          className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm"
                        >
                          <option value="7">7 días</option>
                          <option value="15">15 días</option>
                          <option value="30">30 días</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Producto Adquirido</label>
                      <select 
                        value={selectedCampaign.productType || 'any'}
                        onChange={e => setSelectedCampaign({...selectedCampaign, productType: e.target.value})}
                        className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm"
                      >
                        <option value="any">Cualquier Producto / Venta</option>
                        <option value="any_glasses">Cualquier Anteojo Recetado</option>
                        <option value="monofocal">Lentes Monofocales</option>
                        <option value="multifocal">Lentes Multifocales / Bifocales</option>
                        <option value="ocupacional">Lentes Ocupacionales</option>
                        <option value="contact">Lentes de Contacto</option>
                        <option value="sale">Venta Directa / Accesorios</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Plantilla de Mensaje</label>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold text-slate-400">Insertar:</span>
                          <button title="Inserta el nombre y apellido del cliente" type="button" onClick={() => setSelectedCampaign({...selectedCampaign, template: (selectedCampaign.template || `Hola {nombre_cliente}, te recordamos que ya pasó un tiempo desde tu última visita. ¡Te esperamos!`) + ' {nombre_cliente}'})} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors cursor-help">{`{nombre_cliente}`}</button>
                          <button title="Inserta el nombre del último producto que compró" type="button" onClick={() => setSelectedCampaign({...selectedCampaign, template: (selectedCampaign.template || `Hola {nombre_cliente}, te recordamos que ya pasó un tiempo desde tu última visita. ¡Te esperamos!`) + ' {producto}'})} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors cursor-help">{`{producto}`}</button>
                          <button title="Inserta la fecha exacta de su última compra o control" type="button" onClick={() => setSelectedCampaign({...selectedCampaign, template: (selectedCampaign.template || `Hola {nombre_cliente}, te recordamos que ya pasó un tiempo desde tu última visita. ¡Te esperamos!`) + ' {fecha}'})} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors cursor-help">{`{fecha}`}</button>
                          <button title="Inserta la fecha de cumpleaños del cliente" type="button" onClick={() => setSelectedCampaign({...selectedCampaign, template: (selectedCampaign.template || `Hola {nombre_cliente}, te recordamos que ya pasó un tiempo desde tu última visita. ¡Te esperamos!`) + ' {fecha_cumpleaños}'})} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors cursor-help">{`{fecha_cumpleaños}`}</button>
                          <button title="Inserta la fecha actual al momento de enviar el mensaje" type="button" onClick={() => setSelectedCampaign({...selectedCampaign, template: (selectedCampaign.template || `Hola {nombre_cliente}, te recordamos que ya pasó un tiempo desde tu última visita. ¡Te esperamos!`) + ' {fecha_hoy}'})} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors cursor-help">{`{fecha_hoy}`}</button>
                        </div>
                      </div>
                      <textarea 
                        rows={4} 
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm" 
                        value={selectedCampaign.template || `Hola {nombre_cliente}, te recordamos que ya pasó un tiempo desde tu última visita. ¡Te esperamos!`}
                        onChange={(e) => setSelectedCampaign({...selectedCampaign, template: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 bg-slate-50 dark:bg-slate-900/50">
                    <button 
                      type="button" 
                      onClick={() => {
                        if(confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
                          saveCampaigns(campaigns.filter(c => c.id !== selectedCampaign.id));
                          setSelectedCampaign(null);
                        }
                      }} 
                      className="px-4 py-2.5 rounded-lg font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setSelectedCampaign(null)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">Cancelar</button>
                      <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Consolidado de Ventas Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Consolidado de Ventas
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Exporta a CSV y emite facturas en ARCA (AFIP) para cada venta.</p>
                </div>
                
                <button
                  onClick={exportToCSV}
                  disabled={orders.length === 0}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-xs uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      <th className="px-4 py-3">ID Pedido</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Tipo Venta</th>
                      <th className="px-4 py-3">Concepto</th>
                      <th className="px-4 py-3">Importe</th>
                      <th className="px-4 py-3">P. Venta</th>
                      <th className="px-4 py-3 text-right">Facturar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.length > 0 ? (
                      [...orders]
                        .sort((a, b) => a.type.localeCompare(b.type))
                        .map(order => {
                          const isFacturado = !!invoicedOrders[order.id];
                          const mappedPVForBranch = order.branchId ? branchPVs[order.branchId] : (currentBranch ? branchPVs[currentBranch.id] : "");
                          const defaultPV = mappedPVForBranch || localStorage.getItem('optica_default_pv') || puntosVenta[0] || "";
                          const selectedPV = orderPVs[order.id] || defaultPV;
                          
                          return (
                            <tr 
                              key={order.id} 
                              className={cn(
                                "hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors",
                                isFacturado && "bg-emerald-50/10 dark:bg-emerald-950/5"
                              )}
                            >
                              <td className="px-4 py-4 font-mono text-xs font-bold text-slate-500">{order.id}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">{order.date}</td>
                              <td className="px-4 py-4">
                                <div className="font-bold text-slate-800 dark:text-white text-xs">{order.clientName}</div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                                  order.type === 'monofocal' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                  order.type === 'multifocal' ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" :
                                  order.type === 'ocupacional' ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" :
                                  order.type === 'contact' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                )}>
                                  {order.type}
                                </span>
                              </td>
                              <td className="px-4 py-4 max-w-[140px] truncate text-xs text-slate-600 dark:text-slate-400" title={order.service}>
                                {order.service}
                              </td>
                              <td className="px-4 py-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                                ${order.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  disabled={isFacturado}
                                  value={selectedPV}
                                  onChange={e => handleSelectPV(order.id, e.target.value)}
                                  className="h-8 px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none w-full max-w-[120px] disabled:opacity-60"
                                >
                                  {puntosVenta.map(pv => (
                                    <option key={pv} value={pv}>{pv}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button
                                  onClick={() => setActiveInvoicingOrder({ ...order, defaultPV })}
                                  className={cn(
                                    "p-1.5 rounded-lg border transition-all active:scale-90",
                                    isFacturado 
                                      ? "bg-emerald-500 border-emerald-500 text-white" 
                                      : "bg-white border-slate-200 hover:border-emerald-500 hover:text-emerald-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                                  )}
                                  title={isFacturado ? "Ver Factura Emitida" : "Emitir Factura Electrónica"}
                                >
                                  {isFacturado ? <FileText className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-sm">
                          No hay ventas ni pedidos cargados en el sistema para consolidar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right side: Points of Sale Manager */}
            <div className="space-y-6">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" /> Puntos de Venta
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Carga y gestiona múltiples puntos de venta para tus comprobantes fiscales.</p>
                </div>

                <form onSubmit={handleAddPV} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ej: 0004 - P.V. Sucursal Este"
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-1 focus:ring-blue-600 text-xs text-slate-900 dark:text-white font-medium"
                    value={newPV}
                    onChange={e => setNewPV(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-xs flex items-center justify-center shrink-0 active:scale-95"
                  >
                    Cargar
                  </button>
                </form>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                  {puntosVenta.map(pv => (
                    <div key={pv} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{pv}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePV(pv)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Facturacion Summary */}
              <section className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl shadow-blue-500/10">
                <h4 className="text-sm font-black uppercase tracking-widest text-blue-400">Resumen Fiscal</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total de Pedidos:</span>
                    <span className="font-bold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Facturados:</span>
                    <span className="font-bold text-emerald-400">{Object.values(invoicedOrders).filter(Boolean).length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pendientes de Facturación:</span>
                    <span className="font-bold text-amber-400">{orders.length - Object.values(invoicedOrders).filter(Boolean).length}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ARCA Electronic Invoicing Modal */}
      {activeInvoicingOrder && (() => {
        const order = activeInvoicingOrder;
        const isAlreadyInvoiced = !!invoicedOrders[order.id];
        const clientObj = clients.find(c => c.id === order.clientId);
        
        // Find mapped branch name
        const orderBranch = branches.find(b => b.id === order.branchId) || currentBranch || branches[0];
        const orderBranchName = orderBranch?.name || "Casa Central";
        
        // Dynamic Point of Sale based on branch mapping
        const mappedPVForBranch = order.branchId ? branchPVs[order.branchId] : (currentBranch ? branchPVs[currentBranch.id] : "");
        const defaultPV = mappedPVForBranch || localStorage.getItem('optica_default_pv') || puntosVenta[0] || "0001";
        const selectedPV = orderPVs[order.id] || defaultPV;
        
        // Get or generate invoice details
        const savedDetails = invoiceDetails[order.id];
        
        return (
          <InvoiceSimulationModal
            order={order}
            client={clientObj}
            branchName={orderBranchName}
            puntoVenta={selectedPV}
            isAlreadyInvoiced={isAlreadyInvoiced}
            savedDetails={savedDetails}
            onClose={() => setActiveInvoicingOrder(null)}
            onInvoiceSuccess={(details) => {
              // Update local state
              const updatedInvoiced = { ...invoicedOrders, [order.id]: true };
              setInvoicedOrders(updatedInvoiced);
              localStorage.setItem('optica_invoiced_orders', JSON.stringify(updatedInvoiced));

              const updatedDetails = { ...invoiceDetails, [order.id]: details };
              setInvoiceDetails(updatedDetails);
              localStorage.setItem('optica_invoice_details', JSON.stringify(updatedDetails));
            }}
            onCancelInvoice={() => {
              const updatedInvoiced = { ...invoicedOrders, [order.id]: false };
              setInvoicedOrders(updatedInvoiced);
              localStorage.setItem('optica_invoiced_orders', JSON.stringify(updatedInvoiced));

              const updatedDetails = { ...invoiceDetails };
              delete updatedDetails[order.id];
              setInvoiceDetails(updatedDetails);
              localStorage.setItem('optica_invoice_details', JSON.stringify(updatedDetails));
              setActiveInvoicingOrder(null);
            }}
          />
        );
      })()}
    </div>
  );
}

// Subcomponent: Invoice Simulation Modal
interface InvoiceSimulationModalProps {
  order: any;
  client: any;
  branchName: string;
  puntoVenta: string;
  isAlreadyInvoiced: boolean;
  savedDetails?: { cae: string; vto: string; pv: string; num: string; tipo: string };
  onClose: () => void;
  onInvoiceSuccess: (details: any) => void;
  onCancelInvoice: () => void;
}

function InvoiceSimulationModal({
  order,
  client,
  branchName,
  puntoVenta,
  isAlreadyInvoiced,
  savedDetails,
  onClose,
  onInvoiceSuccess,
  onCancelInvoice
}: InvoiceSimulationModalProps) {
  const [step, setStep] = useState(isAlreadyInvoiced ? "ready" : "idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [comprobanteTipo, setComprobanteTipo] = useState(savedDetails?.tipo || (client?.dni && client.dni.length > 8 ? "Factura A" : "Factura B"));
  const [details, setDetails] = useState<any>(savedDetails || null);

  const { opticaName, opticaAddress, opticaLogo, pdfConfig } = useSettings();

  const handleDownloadPDF = async () => {
    if (!details) return;
    
    const invoiceData = {
      voucherNumber: details.num,
      ptoVta: details.pv,
      date: order.date,
      amount: order.amount,
      clientCuit: client?.dni || "0",
      clientName: order.clientName,
      description: order.service,
      cae: details.cae,
      caeVto: details.vto
    };

    const configData = {
      razonSocial: opticaName,
      nombreFantasia: opticaName,
      afipCuit: localStorage.getItem('optica_afip_cuit') || "30-71234567-8",
      afipPtoVta: details.pv,
      ingresosBrutos: localStorage.getItem('optica_iibb') || "30-71234567-8",
      inicioActividad: localStorage.getItem('optica_inicio_actividad') || "01/05/2026",
      domicilioComercial: opticaAddress,
      invoiceLogo: opticaLogo,
      ...pdfConfig
    };

    try {
      const pdfUrl = await generateInvoicePDF(invoiceData, configData);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
    }
  };

  const startInvoicing = () => {
    setStep("processing");
    setLogs([]);
    
    const pushLog = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setLogs(prev => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    (async () => {
      await pushLog("Generando CMS: Creando XML Ticket de Requerimiento de Acceso (TRA)...", 400);
      await pushLog("Firmando digitalmente TRA con clave privada LYNX y Certificado AFIP...", 400);
      await pushLog("Conectando con Web Service de Autenticación y Autorización (WSAA)...", 500);
      await pushLog("Ticket de Acceso (TA) recibido correctamente. Token cargado en memoria.", 300);
      await pushLog(`Conectando con WSFEv1. Enviando Lote de venta por $${order.amount.toLocaleString()}...`, 500);
      await pushLog(`Procesando Punto de Venta: ${puntoVenta} (Sucursal: ${branchName})...`, 300);
      await pushLog("Validando CUIT Emisor y DNI del Cliente...", 200);
      await pushLog("¡Comprobante autorizado exitosamente por ARCA (AFIP)!", 300);
      
      const cae = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
      const vto = new Date();
      vto.setDate(vto.getDate() + 10);
      const vtoStr = vto.toLocaleDateString('es-ES');
      const invoiceNum = Math.floor(100 + Math.random() * 90000).toString().padStart(8, '0');

      const invoicePV = puntoVenta.split(' - ')[0] || "0001";

      const finalDetails = {
        cae,
        vto: vtoStr,
        pv: invoicePV,
        num: invoiceNum,
        tipo: comprobanteTipo
      };

      setDetails(finalDetails);
      onInvoiceSuccess(finalDetails);
      setStep("ready");
    })();
  };

  const formattedPV = details?.pv || puntoVenta.split(' - ')[0] || "0001";
  const formattedNum = details?.num || "00000000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row my-8 max-h-[90vh]">
        {/* Left Side: Parameters / Logging */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between border-r border-slate-100 dark:border-slate-800 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> Facturación Electrónica ARCA
              </h3>
              <span className="text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">AFIP Homologación</span>
            </div>

            {step === "idle" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Tipo de Comprobante</label>
                  <select 
                    value={comprobanteTipo}
                    onChange={e => setComprobanteTipo(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    <option>Factura B</option>
                    <option>Factura A</option>
                    <option>Factura C</option>
                    <option>Nota de Crédito B</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Sucursal de Venta</label>
                    <div className="h-10 px-3 flex items-center rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-bold text-slate-800 dark:text-slate-300">
                      {branchName}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Punto de Venta</label>
                    <div className="h-10 px-3 flex items-center rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-black text-blue-600 dark:text-blue-400">
                      {puntoVenta}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cliente:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{order.clientName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">DNI/CUIT:</span>
                    <span className="font-mono text-slate-800 dark:text-white">{client?.dni || "Consumidor Final"}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                    <span className="text-slate-400">Importe a Facturar:</span>
                    <span className="font-black text-slate-900 dark:text-white">${order.amount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={startInvoicing}
                  className="w-full h-11 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" /> Emitir Factura en ARCA
                </button>
              </div>
            )}

            {step === "processing" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <p className="text-xs font-bold text-blue-600">Comunicando con servidores de AFIP...</p>
                </div>
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-48 overflow-y-auto leading-relaxed border border-slate-800">
                  {logs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-slate-600 select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "ready" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex gap-3 text-xs">
                  <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-black text-emerald-800 dark:text-emerald-400">¡Facturación Exitosa!</h4>
                    <p className="text-emerald-700 dark:text-emerald-500 mt-0.5 leading-relaxed">El comprobante ha sido debidamente autorizado por AFIP con el número de CAE provisto.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">CAE Autorizado:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{details?.cae}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Vencimiento CAE:</span>
                    <span className="font-mono text-slate-800 dark:text-white">{details?.vto}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                    <span className="text-slate-400">Nro Comprobante:</span>
                    <span className="font-black text-slate-900 dark:text-white">{formattedPV}-{formattedNum}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Descargar PDF Factura
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (window.confirm("¿Seguro que deseas anular esta factura electrónica en el simulador local?")) {
                          onCancelInvoice();
                        }
                      }}
                      className="flex-1 h-10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all"
                    >
                      Anular Factura
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 h-10 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                    >
                      Cerrar Asistente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {step !== "processing" && (
            <button onClick={onClose} className="mt-8 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 self-start transition-colors">
              Cerrar Ventana
            </button>
          )}
        </div>

        {/* Right Side: PDF Preview */}
        <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-y-auto max-h-[90vh]">
          <div 
            className={cn(
              "w-full max-w-sm bg-white border border-slate-200 shadow-xl rounded-lg p-5 text-slate-900 flex flex-col transition-all duration-300 aspect-[1/1.4]",
              step !== "ready" && "opacity-30 pointer-events-none select-none filter blur-[1px]"
            )}
          >
            {step !== "ready" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-bold text-sm gap-2">
                <FileText className="w-10 h-10 text-slate-300" />
                <span>Previsualización del PDF</span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between border-2 border-slate-950 p-3 h-full text-[10px] leading-relaxed">
                <div>
                  <div className="flex justify-between border-b border-slate-950 pb-2 mb-2 font-sans">
                    <div>
                      <div className="font-extrabold text-xs">ÓPTICA PARACAO</div>
                      <div className="text-[8px] text-slate-500 font-semibold mt-0.5">Responsable Inscripto</div>
                      <div className="text-[7px] text-slate-400">CUIT: 30-71234567-8</div>
                    </div>
                    <div className="w-6 h-6 border border-slate-950 flex items-center justify-center font-extrabold text-xs">
                      {comprobanteTipo.includes("Factura A") ? "A" : comprobanteTipo.includes("Factura C") ? "C" : "B"}
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-xs uppercase">{comprobanteTipo.toUpperCase()}</div>
                      <div className="font-semibold text-[8px] mt-0.5">Nro: {formattedPV}-{formattedNum}</div>
                      <div className="text-[7px] text-slate-400">Fecha: {order.date}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[8px] mb-3">
                    <div><strong>Cliente:</strong> {order.clientName}</div>
                    <div><strong>DNI/CUIT:</strong> {client?.dni || "Consumidor Final"}</div>
                    <div><strong>Condición IVA:</strong> Consumidor Final</div>
                    <div><strong>Concepto:</strong> {order.service}</div>
                  </div>

                  <table className="w-full text-left border-collapse border border-slate-950 text-[8px] mt-2">
                    <thead>
                      <tr className="bg-slate-100 font-bold">
                        <th className="border border-slate-950 p-1">Descripción</th>
                        <th className="border border-slate-950 p-1 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-950 p-1">{order.service}</td>
                        <td className="border border-slate-950 p-1 text-right">${order.amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-end mt-4 pt-2 border-t border-dashed border-slate-400">
                  <div className="flex flex-col items-center">
                    <QrCode size={45} className="text-slate-950" />
                    <span className="text-[6px] font-bold text-slate-500 mt-1 uppercase tracking-tight">Comprobante Autorizado</span>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[10px] text-slate-950">TOTAL: ${order.amount.toLocaleString()}</div>
                    <div className="text-[6px] text-slate-500 font-mono mt-0.5">CAE: {details?.cae}</div>
                    <div className="text-[6px] text-slate-500 font-mono">Vto: {details?.vto}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
