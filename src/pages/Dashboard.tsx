import { Link } from "react-router-dom";
import { UserPlus, Eye, PackagePlus, Calculator, AlertTriangle, CheckCircle2, ShoppingCart, Cake, Gift, Bell } from "lucide-react";

// Mock data for clients with birthdays
const CLIENTS_BIRTHDAYS = [
  { id: 1, name: "Maria Garcia", date: new Date().toISOString().split('T')[0], type: "today", phone: "5491122334455" },
  { id: 2, name: "Juan Perez", date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], type: "upcoming", phone: "5491133445566" },
  { id: 3, name: "Ana Martinez", date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], type: "past", phone: "5491144556677" },
  { id: 4, name: "Carlos Sanchez", date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], type: "upcoming", phone: "5491155667788" },
];

export function Dashboard() {
  const today = new Date().toISOString().split('T')[0];

  const handleWhatsApp = (client: typeof CLIENTS_BIRTHDAYS[0]) => {
    const message = encodeURIComponent(`¡Hola ${client.name}! Te escribimos de la Óptica para desearte un muy feliz cumpleaños. 🎂👓`);
    window.open(`https://wa.me/${client.phone}?text=${message}`, '_blank');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/clients/new" className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg hover:border-blue-500/50 transition-all duration-200 group text-left">
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Registrar Cliente</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Crear nueva ficha médica</p>
            </div>
          </Link>
          <Link to="/orders/new" className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg hover:border-indigo-500/50 transition-all duration-200 group text-left">
            <div className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 p-3 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Recetados</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lentes recetados o de sol</p>
            </div>
          </Link>
          <Link to="/sales" className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg hover:border-blue-600 transition-all duration-200 group text-left">
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Venta No Recetados</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lentes de sol, accesorios, etc.</p>
            </div>
          </Link>
          <Link to="/inventory/reception" className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg hover:border-emerald-500/50 transition-all duration-200 group text-left">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 p-3 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <PackagePlus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Ingreso Mercadería</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Actualizar stock de insumos</p>
            </div>
          </Link>
          <Link to="/finance/closing" className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg hover:border-amber-500/50 transition-all duration-200 group text-left">
            <div className="rounded-full bg-amber-50 dark:bg-amber-900/30 p-3 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Calculator className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Arqueo de Caja</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cierre diario y balance</p>
            </div>
          </Link>
        </div>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Actividad Reciente</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Ver todo</button>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ID Pedido</th>
                    <th className="px-6 py-3 font-semibold">Cliente</th>
                    <th className="px-6 py-3 font-semibold">Servicio</th>
                    <th className="px-6 py-3 font-semibold">Estado</th>
                    <th className="px-6 py-3 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { id: "#ORD-2458", name: "María González", desc: "Lentes Multifocales", status: "En Taller", color: "amber", amount: "$120.00" },
                    { id: "#ORD-2457", name: "Juan Pérez", desc: "Consulta General", status: "Completado", color: "emerald", amount: "$45.00" },
                    { id: "#ORD-2456", name: "Lucía Méndez", desc: "Armazón Ray-Ban", status: "Para Retirar", color: "blue", amount: "$185.00" },
                    { id: "#ORD-2455", name: "Carlos Ruiz", desc: "Lentes de Contacto", status: "Completado", color: "emerald", amount: "$60.00" },
                    { id: "#ORD-2454", name: "Ana Soto", desc: "Reparación", status: "Pendiente", color: "slate", amount: "$25.00" },
                  ].map((row, idx) => (
                    <tr key={idx} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.id}</td>
                      <td className="px-6 py-4">{row.name}</td>
                      <td className="px-6 py-4">{row.desc}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full bg-${row.color}-100 dark:bg-${row.color}-900/30 px-2.5 py-0.5 text-xs font-medium text-${row.color}-800 dark:text-${row.color}-400 border border-${row.color}-200 dark:border-${row.color}-800`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Cake className="w-5 h-5 text-pink-500" />
              Cumpleaños
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-3 bg-pink-50/50 dark:bg-pink-900/10 border-b border-pink-100 dark:border-pink-900/20">
                <p className="text-[10px] font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3 h-3" /> Ventana de 7 días
                </p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {CLIENTS_BIRTHDAYS.map((client) => (
                  <div key={client.id} className={`p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${client.date === today ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${client.date === today ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {client.date === today ? <Gift className="w-4 h-4" /> : <Cake className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{client.name}</p>
                          <button 
                            onClick={() => handleWhatsApp(client)}
                            title="Enviar mensaje de WhatsApp"
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 italic">
                          {client.date === today ? '¡Hoy!' : new Date(client.date) < new Date() ? 'Fue hace poco' : 'Próximamente'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${client.date === today ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                        {new Date(client.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                      {client.date === today && (
                        <button className="text-[10px] font-black text-blue-600 underline mt-0.5">Saludar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas y Avisos
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stock Crítico</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Quedan menos de 5 unidades de Cristales Orgánicos 2.0.</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pedidos Listos</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">3 pedidos han salido del taller hoy.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

