import { Link, useLocation } from "react-router-dom";
import { Eye, Glasses, CircleDot, Briefcase } from "lucide-react";

export function Orders() {
  const location = useLocation();
  const search = location.search;
  const state = location.state;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Link 
        to={`/orders/new/monofocal${search}`}
        state={state}
        data-manual-title="Cristales Monofocales"
        data-manual-description="Visión sencilla para lejos o cerca. Permite cargar la receta de Esfera, Cilindro y Eje para un solo foco visual."
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/50 transition-all group flex flex-col items-center text-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Eye className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Monofocales</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs leading-relaxed">Visión sencilla para lejos o cerca. Ideal para miopía o hipermetropía.</p>
        </div>
      </Link>
      
      <Link 
        to={`/orders/new/multifocal${search}`}
        state={state}
        data-manual-title="Cristales Multifocales Progresivos"
        data-manual-description="Lentes progresivas o bifocales con zonas de visión combinada (lejos, intermedia y cerca). Requiere adición (ADD) y altura pupilar."
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-indigo-500/50 transition-all group flex flex-col items-center text-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Glasses className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Multifocales</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs leading-relaxed">Lentes progresivos o con segmento. Para presbicia y visión combinada.</p>
        </div>
      </Link>
      
      <Link 
        to={`/orders/new/ocupacional${search}`}
        state={state}
        data-manual-title="Lentes Ocupacionales"
        data-manual-description="Optimizados para visión de cerca y distancia intermedia de pantallas de oficina o escritorio."
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-violet-500/50 transition-all group flex flex-col items-center text-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Briefcase className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Ocupacionales</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs leading-relaxed">Lentes de cerca y media distancia. Óptimos para oficina y uso de pantallas.</p>
        </div>
      </Link>
      
      <Link 
        to={`/orders/new/contact${search}`}
        state={state}
        data-manual-title="Lentes de Contacto"
        data-manual-description="Ficha clínica para lentes de contacto blandas, tóricas para astigmatismo, cosméticas o multifocales."
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-emerald-500/50 transition-all group flex flex-col items-center text-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <CircleDot className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Lentes de Contacto</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs leading-relaxed">Blandos, tóricos, cosméticos o multifocales de contacto.</p>
        </div>
      </Link>
    </div>
  );
}
