import { Eye, CheckCircle2, FlaskConical, ClipboardCheck, ShoppingBag, MapPin, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";

export function StatusLookup() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <header className="h-16 flex items-center justify-between px-6 md:px-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:text-blue-500">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-xl dark:text-white">Óptica<span className="text-blue-600 dark:text-blue-500">Paracáo</span></h2>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors">
          Ingresar
        </button>
      </header>
      
      <main className="flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Hola, Juan Pérez</h1>
          <p className="text-slate-500 dark:text-slate-400">Aquí puedes ver el avance de tu pedido en tiempo real.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Estado del Pedido</h3>
            <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-full text-sm border border-blue-200 dark:border-blue-800">
              En Laboratorio
            </span>
          </div>
          
          <div className="relative pl-10 space-y-12">
            {/* Background Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            {/* Progress Line */}
            <div className="absolute left-[19px] top-4 h-[120px] w-1 bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000"></div>
            
            {[
              { label: "Pedido Recibido", date: "10 Oct", icon: CheckCircle2, status: "completed" },
              { label: "En Laboratorio", date: "Actual", icon: FlaskConical, status: "active" },
              { label: "Control de Calidad", date: "Pendiente", icon: ClipboardCheck, status: "pending" },
              { label: "Listo para Retirar", date: "Pendiente", icon: ShoppingBag, status: "pending" },
            ].map((step, idx) => (
              <div key={idx} className="relative flex items-center gap-6 group">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-slate-900 shadow-sm transition-colors duration-300",
                  step.status === 'completed' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 
                  step.status === 'active' ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 animate-pulse' : 
                  'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                )}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={cn(
                    "font-bold transition-colors",
                    step.status === 'active' ? 'text-blue-600 dark:text-blue-400' : 
                    step.status === 'pending' ? 'text-slate-400 dark:text-slate-500' : 
                    'text-slate-900 dark:text-white'
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-xl font-bold shadow-sm hover:shadow-lg transition-all">
            <MessageCircle className="w-5 h-5" /> WhatsApp de la Óptica
          </button>
          <button className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 p-4 rounded-xl font-bold shadow-sm hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <MapPin className="w-5 h-5" /> Ver ubicación del local
          </button>
        </div>
      </main>
    </div>
  );
}
