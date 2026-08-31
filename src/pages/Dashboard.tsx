import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, PackagePlus, Calculator, AlertTriangle, CheckCircle2, ShoppingCart, Cake, Gift, Bell, Clock, Smartphone, X, Search, Filter, History, ArrowUpRight, Check, Package, FileText } from "lucide-react";
import { useClients } from "../context/ClientContext";
import { useFinance } from "../context/FinanceContext";
import { useNotifications } from "../context/NotificationsContext";

export function Dashboard() {
  const navigate = useNavigate();
  const { clients, orders } = useClients();
  const { boxes, cheques = [] } = useFinance();
  const { notifications, removeNotification } = useNotifications();

  const [isAllOrdersModalOpen, setIsAllOrdersModalOpen] = useState(false);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("all");

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const todayStr = today.toISOString().split('T')[0];

  const filteredAllOrders = useMemo(() => {
    return orders.filter(order => {
      const q = ordersSearchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        (order.id && order.id.toLowerCase().includes(q)) ||
        (order.clientName && order.clientName.toLowerCase().includes(q)) ||
        (order.service && order.service.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (ordersStatusFilter === "all") return true;
      if (ordersStatusFilter === "taller") return order.status === "En Taller";
      if (ordersStatusFilter === "retirar") return order.status === "Para Retirar" || order.status === "Recibido";
      if (ordersStatusFilter === "entregado") return order.status === "Entregado" || order.status === "Completado";
      if (ordersStatusFilter === "demorado") return order.status === "Demorado" || order.status === "Cancelado";
      return true;
    });
  }, [orders, ordersSearchQuery, ordersStatusFilter]);

  const chequesAlerts = useMemo(() => {
    const todayVal = new Date();
    todayVal.setHours(0,0,0,0);
    const next7Days = new Date(todayVal);
    next7Days.setDate(todayVal.getDate() + 7);

    let expiredCount = 0;
    let upcomingCount = 0;

    (cheques || []).forEach(c => {
      if (c.status === 'Pendiente') {
        const dueDate = new Date(c.dueDate + 'T12:00:00');
        if (dueDate < todayVal) {
          expiredCount++;
        } else if (dueDate <= next7Days) {
          upcomingCount++;
        }
      }
    });

    return {
      expiredCount,
      upcomingCount,
      totalAlerts: expiredCount + upcomingCount
    };
  }, [cheques]);

  const upcomingBirthdays = clients.filter(c => {
    if (!c.birthDate) return false;
    const parts = c.birthDate.split('-');
    if (parts.length !== 3) return false;
    const [year, month, day] = parts;
    const bMonth = parseInt(month, 10) - 1;
    const bDay = parseInt(day, 10);
    
    const bDateThisYear = new Date(today.getFullYear(), bMonth, bDay);
    
    // If birthday passed this year, check next year
    if (bDateThisYear.getTime() < today.getTime() - 86400000) {
      bDateThisYear.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = bDateThisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  }).map(c => {
    const [year, month, day] = c.birthDate!.split('-');
    const bMonth = parseInt(month, 10) - 1;
    const bDay = parseInt(day, 10);
    const isToday = bMonth === currentMonth && bDay === currentDay;
    
    return {
      id: c.id,
      name: c.name,
      date: isToday ? todayStr : new Date(today.getFullYear(), bMonth, bDay).toISOString().split('T')[0],
      isToday,
      phone: c.phone || ''
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const recentOrders = orders.slice(0, 5);
  
  const pendingOrdersCount = orders.filter(o => o.status !== 'Completado' && o.status !== 'Entregado').length;

  const customersPending = orders.map(order => {
    const client = clients.find(c => c.id === order.clientId);
    if (!client) return null;
    const orderDate = new Date(order.date);
    let nextControlDate = new Date(orderDate);
    if (order.service.toLowerCase().includes('contacto')) {
      nextControlDate.setMonth(nextControlDate.getMonth() + 6);
    } else {
      nextControlDate.setFullYear(nextControlDate.getFullYear() + 1);
    }
    const diffDays = Math.ceil((nextControlDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    // Show overdue (up to 30 days ago) or upcoming (in next 15 days)
    if (diffDays > 15 || diffDays < -30) return null;
    
    return {
      id: order.id,
      name: client.name,
      product: order.service,
      status: diffDays < 0 ? 'Vencido' : 'Próximo',
      phone: client.phone || '',
      diffDays,
      lastPurchase: order.date
    };
  }).filter(Boolean).sort((a, b) => a!.diffDays - b!.diffDays).slice(0, 5); // Take top 5

  const handleReminderWhatsApp = (customer: any) => {
    if(!customer.phone) {
      alert("El cliente no tiene teléfono registrado.");
      return;
    }
    const message = encodeURIComponent(`¡Hola ${customer.name}! Te escribimos de la Óptica. Notamos que tu último control para tus ${customer.product} fue en ${new Date(customer.lastPurchase).toLocaleDateString('es-ES')}. ¿Te gustaría agendar una cita para revisar tu graduación visual? 👓`);
    window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleWhatsApp = (client: any) => {
    const message = encodeURIComponent(`¡Hola ${client.name}! Te escribimos de la Óptica para desearte un muy feliz cumpleaños. 🎂👓`);
    window.open(`https://wa.me/${client.phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {chequesAlerts.totalAlerts > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
            <div>
              <p className="text-sm font-bold">Cheques Pendientes de Atención</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Hay {chequesAlerts.expiredCount} cheques vencidos y {chequesAlerts.upcomingCount} cheques próximos a vencer (dentro de los próximos 7 días).
              </p>
            </div>
          </div>
          <Link 
            to="/finance" 
            className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-all shrink-0 shadow-sm"
          >
            Gestionar Cheques
          </Link>
        </div>
      )}

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
            <button 
              onClick={() => setIsAllOrdersModalOpen(true)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-all flex items-center gap-1 cursor-pointer"
            >
              Ver todo ({orders.length})
            </button>
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
                  {recentOrders.map((row) => {
                    let badgeClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                    if (row.status === "Completado" || row.status === "Entregado") {
                      badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
                    } else if (row.status === "En Taller") {
                      badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
                    } else if (row.status === "Demorado") {
                      badgeClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 font-bold";
                    } else if (row.status === "Para Retirar" || row.status === "Recibido") {
                      badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
                    }
                    
                    return (
                    <tr 
                      key={row.id} 
                      onClick={() => setIsAllOrdersModalOpen(true)}
                      className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      title="Clic para ver historial completo"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{row.id}</td>
                      <td className="px-6 py-4">{row.clientName}</td>
                      <td className="px-6 py-4">{row.service}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${badgeClass}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">${row.amount.toLocaleString('es-AR')}</td>
                    </tr>
                    );
                  })}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay pedidos recientes.</td>
                    </tr>
                  )}
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
                {upcomingBirthdays.map((client) => (
                  <div key={client.id} className={`p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${client.isToday ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${client.isToday ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {client.isToday ? <Gift className="w-4 h-4" /> : <Cake className="w-4 h-4" />}
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
                        {client.isToday ? '¡Hoy!' : 'Próximamente'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${client.isToday ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                      {new Date(client.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                    {client.isToday && (
                      <button 
                        onClick={() => handleWhatsApp(client)}
                        className="text-[10px] font-black text-blue-600 underline mt-0.5"
                      >
                        Saludar
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {upcomingBirthdays.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No hay cumpleaños en los próximos 7 días.
                </div>
              )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-indigo-500" />
              Controles Pendientes
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {customersPending.map(customer => customer && (
                  <div key={customer.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${customer.status === 'Vencido' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</p>
                          <button 
                            onClick={() => handleReminderWhatsApp(customer)}
                            title="Enviar recordatorio de control por WhatsApp"
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {customer.product}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-wider ${customer.status === 'Vencido' ? 'text-red-600' : 'text-indigo-600'}`}>
                        {customer.status}
                      </p>
                      <button 
                        onClick={() => handleReminderWhatsApp(customer)}
                        className="text-[10px] font-black text-indigo-600 underline mt-0.5"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                ))}
                {customersPending.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No hay controles de salud visual pendientes.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas y Avisos
            </h2>
            <div className="flex flex-col gap-3">
              {notifications.slice(0, 3).map(notif => (
                <div key={notif.id} className={`flex gap-4 rounded-xl border border-slate-200 dark:border-slate-800 ${notif.bg} p-4`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/50 dark:bg-black/20 ${notif.color}`}>
                    {notif.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                    {notif.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                    {notif.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {notif.type === 'info' && <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                      <span className="text-[10px] text-slate-500">{notif.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{notif.desc}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-slate-500 font-medium">Todo está al día</p>
                  <p className="text-xs text-slate-400 mt-1">No tienes avisos pendientes.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modal Completo de Todas las Órdenes / Actividad */}
      {isAllOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Registro Completo de Actividad & Pedidos</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {orders.length} pedidos registrados · Total facturado: <span className="font-bold text-slate-800 dark:text-slate-200">${orders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString('es-AR')}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAllOrdersModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-500 block font-medium">Total Pedidos</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{orders.length}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
                <span className="text-amber-600 dark:text-amber-400 block font-medium">En Taller</span>
                <span className="text-lg font-black text-amber-700 dark:text-amber-300">{orders.filter(o => o.status === 'En Taller').length}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200/80 dark:border-blue-900/40">
                <span className="text-blue-600 dark:text-blue-400 block font-medium">Listos para Retirar</span>
                <span className="text-lg font-black text-blue-700 dark:text-blue-300">{orders.filter(o => o.status === 'Para Retirar' || o.status === 'Recibido').length}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40">
                <span className="text-emerald-600 dark:text-emerald-400 block font-medium">Entregados</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{orders.filter(o => o.status === 'Entregado' || o.status === 'Completado').length}</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar por ID, cliente o producto..."
                  value={ordersSearchQuery}
                  onChange={(e) => setOrdersSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                />
                {ordersSearchQuery && (
                  <button onClick={() => setOrdersSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Todos', count: orders.length },
                  { id: 'taller', label: 'En Taller', count: orders.filter(o => o.status === 'En Taller').length },
                  { id: 'retirar', label: 'Para Retirar', count: orders.filter(o => o.status === 'Para Retirar' || o.status === 'Recibido').length },
                  { id: 'entregado', label: 'Entregados', count: orders.filter(o => o.status === 'Entregado' || o.status === 'Completado').length },
                  { id: 'demorado', label: 'Demorados', count: orders.filter(o => o.status === 'Demorado' || o.status === 'Cancelado').length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setOrdersStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      ordersStatusFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Table Content */}
            <div className="p-4 overflow-y-auto max-h-[500px] flex-1">
              {filteredAllOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-slate-600 dark:text-slate-300">No se encontraron pedidos</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba cambiando el término de búsqueda o el filtro de estado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-5 py-3 font-semibold">ID Pedido</th>
                        <th className="px-5 py-3 font-semibold">Fecha</th>
                        <th className="px-5 py-3 font-semibold">Cliente</th>
                        <th className="px-5 py-3 font-semibold">Servicio / Producto</th>
                        <th className="px-5 py-3 font-semibold">Estado</th>
                        <th className="px-5 py-3 font-semibold text-right">Monto</th>
                        <th className="px-5 py-3 font-semibold text-right">Saldo</th>
                        <th className="px-5 py-3 font-semibold text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {filteredAllOrders.map((order) => {
                        let badgeClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                        if (order.status === "Completado" || order.status === "Entregado") {
                          badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
                        } else if (order.status === "En Taller") {
                          badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
                        } else if (order.status === "Para Retirar" || order.status === "Recibido") {
                          badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
                        } else if (order.status === "Demorado" || order.status === "Cancelado") {
                          badgeClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 font-bold";
                        }

                        const saldo = Math.max(0, (order.amount || 0) - (order.paid || 0));

                        return (
                          <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                              {order.id}
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                              {order.date ? new Date(order.date).toLocaleDateString('es-AR') : '-'}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                              {order.clientName}
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                              {order.service}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${badgeClass}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              ${(order.amount || 0).toLocaleString('es-AR')}
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              {saldo > 0 ? (
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                                  ${saldo.toLocaleString('es-AR')}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                  Saldado
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setIsAllOrdersModalOpen(false);
                                  navigate('/clients', {
                                    state: {
                                      clientId: order.clientId,
                                      clientName: order.clientName,
                                      openModal: 'orders'
                                    }
                                  });
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title={`Abrir ficha e historial de ${order.clientName}`}
                              >
                                <span>Ver Cliente</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Mostrando {filteredAllOrders.length} de {orders.length} pedidos
              </span>
              <button
                onClick={() => setIsAllOrdersModalOpen(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

