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
  Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";

const CAMPAIGNS = [
  { id: 1, name: "Recordatorio Control Anual", status: "Active", sent: 145, conversion: "12%", type: "WhatsApp" },
  { id: 2, name: "Promo Lentes de Contacto", status: "Scheduled", sent: 0, conversion: "0%", type: "Email" },
  { id: 3, name: "Renovación Multifocales", status: "Active", sent: 89, conversion: "8%", type: "WhatsApp" },
];

const CUSTOMERS_PENDING = [
  { 
    id: 1, 
    name: "Roberto Gómez", 
    lastPurchase: "2023-05-10", 
    product: "Multifocales", 
    status: "Vencido",
    contact: "+54 9 11 5555-0101"
  },
  { 
    id: 2, 
    name: "Ana Leyes", 
    lastPurchase: "2024-01-15", 
    product: "Lentes de Contacto", 
    status: "Próximo",
    contact: "+54 9 11 5555-0202"
  },
  { 
    id: 3, 
    name: "Carlos Paez", 
    lastPurchase: "2023-04-20", 
    product: "Monofocales", 
    status: "Vencido",
    contact: "+54 9 11 5555-0303"
  },
];

export function Marketing() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Clientes Activos", value: "1,248", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Tasa de Retención", value: "68%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Recordatorios Mes", value: "342", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "Ventas Invitadas", value: "$450k", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
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
              <button className="text-sm font-bold text-blue-600 hover:underline">Nueva Campaña</button>
            </div>
            <div className="p-6 space-y-4">
              {CAMPAIGNS.map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
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
                  {CUSTOMERS_PENDING.map(customer => (
                    <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</span>
                          <span className="text-[10px] text-slate-500">{customer.product}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {customer.lastPurchase}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                          customer.status === 'Vencido' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {customer.status === 'Vencido' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700 transition-all flex items-center gap-2 ml-auto shadow-sm shadow-emerald-200 dark:shadow-none">
                          <Smartphone className="w-3 h-3" /> WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
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
            <button className="w-full mt-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all">
              Programar Todos
            </button>
          </div>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Próximos Vencimientos
            </h4>
            <div className="space-y-4">
              {[
                { label: "Mayo 2024", count: 42, color: "bg-blue-500" },
                { label: "Junio 2024", count: 58, color: "bg-purple-500" },
                { label: "Julio 2024", count: 31, color: "bg-indigo-500" },
              ].map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>{m.label}</span>
                    <span>{m.count} Clientes</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", m.color)} style={{ width: `${(m.count / 60) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
