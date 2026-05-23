import { Link } from "react-router-dom";
import { Eye, Glasses, CircleDot } from "lucide-react";

export function Orders() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      <Link to="/orders/new/monofocal" className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/50 transition-all group flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Eye className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Monofocales</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Visión sencilla para lejos o cerca. Ideal para miopía o hipermetropía.</p>
        </div>
      </Link>
      
      <Link to="/orders/new/multifocal" className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-indigo-500/50 transition-all group flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Glasses className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Multifocales / Bifocales</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Lentes progresivos o con segmento. Para presbicia y visión combinada.</p>
        </div>
      </Link>
      
      <Link to="/orders/new/contact" className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-emerald-500/50 transition-all group flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <CircleDot className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Lentes de Contacto</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Blandos, tóricos, cosméticos o multifocales de contacto.</p>
        </div>
      </Link>
    </div>
  );
}
