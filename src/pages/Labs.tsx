import { FlaskConical, Calendar, Search, FileText, CheckCircle2, Clock } from "lucide-react";

export function Labs() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Laboratorio
          </label>
          <select className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white">
            <option>OptiLens Lab</option>
            <option>Visión Plus</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Periodo
          </label>
          <input 
            className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
            type="month" 
            defaultValue="2023-10" 
          />
        </div>
        <button className="h-11 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Search className="w-4 h-4" /> Consultar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Trabajos</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">145</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Subtotal Adeudado</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">$4,500.00</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pagos a Cuenta</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">$1,000.00</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <FileText className="w-16 h-16" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1 relative z-10">Saldo Final</p>
          <p className="text-3xl font-bold relative z-10">$3,500.00</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Detalle de Trabajos
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Pedido</th>
                <th className="px-6 py-4 font-semibold">Concepto</th>
                <th className="px-6 py-4 font-semibold text-right">Costo</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">10/10/2023</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">#4921</td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Tallado Multifocal</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">$120.00</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Procesado
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">12/10/2023</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">#4930</td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Lente Alto Índice</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">$200.00</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3 h-3" /> Pendiente
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
