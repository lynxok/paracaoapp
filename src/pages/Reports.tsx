import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart, BarChart3 } from "lucide-react";
import { useFinance } from "../context/FinanceContext";

export function Reports() {
  const { transactions } = useFinance();

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(2) : "0.00";

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  // Group expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Otros';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4); // Top 4 categories

  const categoryColors = ['#f43f5e', '#f59e0b', '#10b981', '#64748b']; // rose, amber, emerald, slate
  
  let currentPercentage = 0;
  const gradientStops = sortedCategories.length > 0 
    ? sortedCategories.map(([cat, amount], idx) => {
        const percentage = (amount / totalExpenses) * 100;
        const stop = `${categoryColors[idx]} ${currentPercentage}% ${currentPercentage + percentage}%`;
        currentPercentage += percentage;
        return stop;
      }).join(', ')
    : '#e2e8f0 0% 100%'; // empty state

  // Chart data for last 6 months
  const today = new Date();
  const last6Months = Array.from({length: 6}, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
    return {
      monthStr: d.toISOString().slice(0, 7), // YYYY-MM
      label: d.toLocaleString('es-ES', { month: 'short' }),
      income: 0,
      expense: 0
    };
  });

  transactions.forEach(t => {
    const tMonth = t.date.slice(0, 7);
    const monthData = last6Months.find(m => m.monthStr === tMonth);
    if (monthData) {
      if (t.type === 'income') monthData.income += t.amount;
      else if (t.type === 'expense') monthData.expense += t.amount;
    }
  });

  // Calculate percentages for chart heights
  const maxChartValue = Math.max(...last6Months.map(m => Math.max(m.income, m.expense)), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos", val: formatCurrency(totalIncome), change: "Total", color: "blue", icon: DollarSign },
          { label: "Gastos", val: formatCurrency(totalExpenses), change: "Total", color: "rose", icon: TrendingDown },
          { label: "Utilidad Neta", val: formatCurrency(netIncome), change: "Total", color: "emerald", icon: TrendingUp },
          { label: "Margen", val: `${margin}%`, change: "Total", color: "indigo", icon: Percent },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between mb-4">
              <div className={`p-2 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full flex items-center">
                {stat.change}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Ventas vs Egresos (6 meses)
            </h3>
            <select className="text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-md px-3 py-1.5 text-slate-600 dark:text-slate-300 outline-none">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {last6Months.map((m, i) => {
              const hInc = (m.income / maxChartValue) * 100;
              const hExp = (m.expense / maxChartValue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="flex gap-1 items-end w-full h-full justify-center">
                    <div className="w-full max-w-12 bg-blue-600 dark:bg-blue-500 rounded-t-sm relative group-hover:bg-blue-700 dark:group-hover:bg-blue-400 transition-colors" style={{height: `${Math.max(hInc, 2)}%`}}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {formatCurrency(m.income)}
                      </div>
                    </div>
                    <div className="w-full max-w-12 bg-rose-400 dark:bg-rose-500/80 rounded-t-sm relative group-hover:bg-rose-500 dark:group-hover:bg-rose-400 transition-colors" style={{height: `${Math.max(hExp, 2)}%`}}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {formatCurrency(m.expense)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium capitalize">{m.label}</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500"></div> Ingresos
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500/80"></div> Egresos
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
          <h3 className="font-bold text-slate-900 dark:text-white mb-8 w-full flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Desglose de Gastos
          </h3>
          
          <div className="relative w-48 h-48 rounded-full" style={{background: `conic-gradient(${gradientStops})`}}>
            <div className="absolute inset-0 m-auto w-32 h-32 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
              <div className="text-center">
                <span className="block text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalExpenses)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Total</span>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-8 space-y-3 text-sm">
            {sortedCategories.length > 0 ? sortedCategories.map(([cat, amount], idx) => (
              <div key={cat} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <span className="w-3 h-3 rounded-full" style={{backgroundColor: categoryColors[idx]}}></span> <span className="capitalize">{cat}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-slate-900 dark:text-white">{((amount / totalExpenses) * 100).toFixed(1)}%</span>
                  <span className="text-[10px] text-slate-400">{formatCurrency(amount)}</span>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-500 text-sm py-4">No hay gastos registrados para desglosar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
