import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Eye, 
  CheckCircle2, 
  FlaskConical, 
  ClipboardCheck, 
  ShoppingBag, 
  MapPin, 
  MessageCircle, 
  Search, 
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { useSettings } from "../context/SettingsContext";

export function StatusLookup() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { opticaName, opticaPhone, opticaAddress } = useSettings();

  const [query, setQuery] = useState(searchParams.get("orderId") || searchParams.get("dni") || "");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = async (searchVal: string) => {
    const clean = searchVal.trim();
    if (!clean) return;

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      // 1. Try search by order id
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', clean)
        .maybeSingle();

      // 2. If not found, try search by client dni
      if (!data) {
        const { data: clientMatches } = await supabase
          .from('clients')
          .select('id, name, dni')
          .eq('dni', clean);

        if (clientMatches && clientMatches.length > 0) {
          const clientIds = clientMatches.map(c => c.id);
          const { data: clientOrders } = await supabase
            .from('orders')
            .select('*')
            .in('client_id', clientIds)
            .order('created_at', { ascending: false })
            .limit(1);

          if (clientOrders && clientOrders.length > 0) {
            data = clientOrders[0];
          }
        }
      }

      if (data) {
        setOrderData({
          id: data.id,
          clientName: data.client_name || data.clientname || 'Cliente',
          date: data.date,
          service: data.service || 'Anteojos Recetados',
          status: data.status || 'En Taller',
          amount: Number(data.amount) || 0,
          paid: Number(data.paid) || 0,
          estimatedDate: data.estimated_date || data.estimatedDate || null
        });
      } else {
        setOrderData(null);
        setErrorMsg("No encontramos ningún pedido asociado al N° de pedido o DNI ingresado. Por favor verificá los datos o contactanos.");
      }
    } catch (err: any) {
      console.error("Lookup error:", err);
      setErrorMsg("Ocurrió un error al buscar el pedido. Por favor intentá nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialParam = searchParams.get("orderId") || searchParams.get("dni");
    if (initialParam) {
      fetchOrder(initialParam);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ orderId: query.trim() });
      fetchOrder(query);
    }
  };

  // Steps determination based on order status
  const getSteps = (status: string) => {
    const st = (status || '').toLowerCase();
    const isEnTaller = st.includes('taller') || st.includes('laboratorio');
    const isParaRetirar = st.includes('retirar') || st.includes('listo') || st.includes('recibido');
    const isEntregado = st.includes('entregado') || st.includes('completado');

    return [
      {
        label: "Pedido Confirmado",
        desc: "Tu orden fue ingresada en nuestro sistema",
        icon: CheckCircle2,
        status: "completed"
      },
      {
        label: "En Laboratorio / Taller",
        desc: "Calibración y montaje de cristales",
        icon: FlaskConical,
        status: isEntregado || isParaRetirar ? "completed" : isEnTaller ? "active" : "pending"
      },
      {
        label: "Control de Calidad",
        desc: "Verificación óptica y alineación",
        icon: ClipboardCheck,
        status: isEntregado || isParaRetirar ? "completed" : "pending"
      },
      {
        label: "Listo para Retirar",
        desc: "Podés pasar por nuestro local",
        icon: ShoppingBag,
        status: isEntregado ? "completed" : isParaRetirar ? "active" : "pending"
      }
    ];
  };

  const steps = orderData ? getSteps(orderData.status) : [];
  const completedStepsCount = steps.filter(s => s.status === 'completed').length;
  const progressPercent = Math.min(100, Math.max(15, (completedStepsCount / steps.length) * 100));

  const targetPhone = opticaPhone ? opticaPhone.replace(/\D/g, '') : '5493434200000';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <header className="h-16 flex items-center justify-between px-6 md:px-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:text-blue-500">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-xl dark:text-white">
            {opticaName || "Óptica Paracáo"}
          </h2>
        </div>
        <Link 
          to="/login"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors"
        >
          Acceso Personal
        </Link>
      </header>
      
      <main className="flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full">
        {/* Search Box Card */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Seguimiento de Pedidos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Ingresá tu número de pedido o tu número de DNI para consultar el estado en tiempo real.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ej: ORD-1024 o 38123456"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 font-medium text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <span>Consultar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p>{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Order Details & Progress if Found */}
        {orderData && (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Pedido #{orderData.id}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Hola, {orderData.clientName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {orderData.service}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={cn(
                  "px-4 py-1.5 font-bold rounded-full text-xs border uppercase tracking-wider",
                  orderData.status === 'Entregado' 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : orderData.status === 'Para Retirar'
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                    : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                )}>
                  {orderData.status}
                </span>
                {orderData.amount > orderData.paid && (
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    Saldo a cancelar: ${(orderData.amount - orderData.paid).toLocaleString('es-AR')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="relative pl-10 space-y-10">
              {/* Background Line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              {/* Dynamic Progress Line */}
              <div 
                className="absolute left-[19px] top-4 w-1 bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000"
                style={{ height: `${progressPercent}%` }}
              ></div>
              
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative flex items-center gap-6 group">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-slate-900 shadow-sm transition-colors duration-300",
                      step.status === 'completed' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 
                      step.status === 'active' ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 animate-pulse' : 
                      'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn(
                        "font-bold text-sm transition-colors",
                        step.status === 'active' ? 'text-blue-600 dark:text-blue-400' : 
                        step.status === 'pending' ? 'text-slate-400 dark:text-slate-500' : 
                        'text-slate-900 dark:text-white'
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Contacts */}
        <div className="grid md:grid-cols-2 gap-4">
          <a 
            href={`https://wa.me/${targetPhone}?text=${encodeURIComponent(`Hola ${opticaName || 'Óptica Paracao'}, me comunico para consultar sobre mi pedido.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-xl font-bold shadow-sm hover:shadow-lg transition-all text-sm"
          >
            <MessageCircle className="w-5 h-5" /> WhatsApp de la Óptica
          </a>
          <button 
            onClick={() => {
              if (opticaAddress) {
                window.open(`https://maps.google.com/?q=${encodeURIComponent(opticaAddress)}`, '_blank');
              } else {
                alert(`Ubicación: ${opticaAddress || 'Consultar en local'}`);
              }
            }}
            className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 p-4 rounded-xl font-bold shadow-sm hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
          >
            <MapPin className="w-5 h-5 text-blue-600" /> {opticaAddress ? `Local: ${opticaAddress}` : "Ver ubicación del local"}
          </button>
        </div>
      </main>
    </div>
  );
}
