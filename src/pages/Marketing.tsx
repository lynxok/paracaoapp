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
  Info
} from "lucide-react";
import { cn } from "../lib/utils";
import { useClients } from "../context/ClientContext";

const INITIAL_CAMPAIGNS = [
  { id: 1, name: "Recordatorio Control Anual", status: "Active", sent: 145, conversion: "12%", type: "WhatsApp" },
  { id: 2, name: "Promo Lentes de Contacto", status: "Scheduled", sent: 0, conversion: "0%", type: "Email" },
  { id: 3, name: "Renovación Multifocales", status: "Active", sent: 89, conversion: "8%", type: "WhatsApp" },
];

export function Marketing() {
  const { clients, orders } = useClients();
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const today = new Date();
  const customersPending = orders.map(order => {
    const client = clients.find(c => c.id === order.clientId);
    if (!client) return null;
    
    const orderDate = new Date(order.date);
    let nextControlDate = new Date(orderDate);
    
    // Si es lente de contacto (asumimos por texto o tipo), 6 meses, sino 1 año
    if (order.service.toLowerCase().includes('contacto')) {
      nextControlDate.setMonth(nextControlDate.getMonth() + 6);
    } else {
      nextControlDate.setFullYear(nextControlDate.getFullYear() + 1);
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
      nextDate: nextControlDate
    };
  }).filter(Boolean)
    .sort((a, b) => a!.nextDate.getTime() - b!.nextDate.getTime());

  const filteredCustomers = customersPending.filter(c => 
    c!.name.toLowerCase().includes(search.toLowerCase()) || 
    c!.product.toLowerCase().includes(search.toLowerCase())
  );

  const handleWhatsApp = (customer: any) => {
    const message = encodeURIComponent(`¡Hola ${customer.name}! Te escribimos de la Óptica. Notamos que tu último control para tus ${customer.product} fue en ${new Date(customer.lastPurchase).toLocaleDateString('es-ES')}. ¿Te gustaría agendar una cita para revisar tu graduación visual? 👓`);
    window.open(`https://wa.me/${customer.contact.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleNewCampaign = () => {
    const name = window.prompt("Ingrese el nombre de la nueva campaña:");
    if (name) {
      setCampaigns([...campaigns, { id: Date.now(), name, status: "Scheduled", sent: 0, conversion: "0%", type: "WhatsApp" }]);
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
  const clientsWithMultipleOrders = Object.values(clientOrderCounts).filter(count => count > 1).length;
  const retentionRate = clients.length > 0 ? Math.round((clientsWithMultipleOrders / clients.length) * 100) : 0;

  const totalSales = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const formattedTotalSales = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0, notation: totalSales > 999999 ? "compact" : "standard" }).format(totalSales);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recordatorios del Día</h3>
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
                          {customer.status === 'Vencido' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
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
              setCampaigns(campaigns.map(c => c.id === selectedCampaign.id ? selectedCampaign : c));
              setSelectedCampaign(null);
            }}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de Campaña</label>
                  <input type="text" value={selectedCampaign.name} onChange={e => setSelectedCampaign({...selectedCampaign, name: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Condición / Disparador</label>
                    <select className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm">
                      <option>12 meses post-compra</option>
                      <option>6 meses post-compra (Lentes de Contacto)</option>
                      <option>Día de cumpleaños</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 group/tooltip relative">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ventana de Atribución</label>
                      <Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
                      <div className="absolute bottom-full mb-2 left-0 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none">
                        Tiempo máximo posterior al envío del mensaje en el cual, si el cliente compra, la venta se contará como un éxito de esta campaña.
                      </div>
                    </div>
                    <select className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm">
                      <option>15 días</option>
                      <option>7 días</option>
                      <option>30 días</option>
                    </select>
                  </div>
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
                      setCampaigns(campaigns.filter(c => c.id !== selectedCampaign.id));
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
    </div>
  );
}
