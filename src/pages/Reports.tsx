import React, { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart, BarChart3, Users, Building2, Calendar, Filter, ShieldCheck, CheckCircle2, Clock, FileSpreadsheet } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { useClients } from "../context/ClientContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../lib/supabase";
import { InsuranceClaim } from "../types";

type PeriodType = 'all' | 'day' | 'month' | 'quarter' | 'year' | 'custom';

export function Reports() {
  const { transactions } = useFinance();
  const { orders } = useClients();
  const { branches } = useAuth();

  // Filters State
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [periodType, setPeriodType] = useState<PeriodType>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const periodLabel = useMemo(() => {
    switch (periodType) {
      case 'day': return 'Hoy';
      case 'month': return 'Este Mes';
      case 'quarter': return 'Este Trimestre';
      case 'year': return 'Este Año';
      case 'custom': return `Personalizado (${startDate || 'Inicio'} a ${endDate || 'Fin'})`;
      case 'all':
      default: return 'Histórico Completo';
    }
  }, [periodType, startDate, endDate]);

  const branchLabel = useMemo(() => {
    if (selectedBranchId === 'all') return 'Todas las Sucursales';
    const found = branches.find(b => b.id === selectedBranchId);
    return found ? found.name : `Sucursal ${selectedBranchId}`;
  }, [selectedBranchId, branches]);

  // Helper date checker
  const isDateInPeriod = (dateStr: string) => {
    if (!dateStr) return false;
    const itemDate = new Date(dateStr);
    const today = new Date();
    
    // Reset time for fair day comparisons
    const dItem = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
    const dToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    switch (periodType) {
      case 'day':
        return dItem.getTime() === dToday.getTime();
      case 'month':
        return itemDate.getFullYear() === today.getFullYear() && itemDate.getMonth() === today.getMonth();
      case 'quarter': {
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const itemQuarter = Math.floor(itemDate.getMonth() / 3);
        return itemDate.getFullYear() === today.getFullYear() && itemQuarter === currentQuarter;
      }
      case 'year':
        return itemDate.getFullYear() === today.getFullYear();
      case 'custom': {
        if (startDate && new Date(dateStr) < new Date(startDate)) return false;
        if (endDate && new Date(dateStr) > new Date(endDate + 'T23:59:59')) return false;
        return true;
      }
      case 'all':
      default:
        return true;
    }
  };

  // Filtered Transactions & Orders
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filter by branch if transaction has branchId or box matches branch
      const matchesBranch = selectedBranchId === 'all' || !t.boxId || t.boxId.includes(selectedBranchId);
      const matchesPeriod = isDateInPeriod(t.date);
      return matchesBranch && matchesPeriod;
    });
  }, [transactions, selectedBranchId, periodType, startDate, endDate]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesBranch = selectedBranchId === 'all' || !o.branchId || o.branchId === selectedBranchId;
      const matchesPeriod = isDateInPeriod(o.date);
      return matchesBranch && matchesPeriod;
    });
  }, [orders, selectedBranchId, periodType, startDate, endDate]);

  // Calculate totals
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(2) : "0.00";

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  // Group expenses by category
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Otros';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = (Object.entries(expensesByCategory) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); // Top 4 categories

  const categoryColors = ['#f43f5e', '#f59e0b', '#10b981', '#64748b']; // rose, amber, emerald, slate
  
  let currentPercentage = 0;
  const gradientStops = sortedCategories.length > 0 
    ? sortedCategories.map((item, idx) => {
        const amount = item[1];
        const percentage = (amount / (totalExpenses || 1)) * 100;
        const stop = `${categoryColors[idx]} ${currentPercentage}% ${currentPercentage + percentage}%`;
        currentPercentage += percentage;
        return stop;
      }).join(', ')
    : '#e2e8f0 0% 100%'; // empty state

  // Dynamic Chart Data (Last 6 Months)
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

  filteredTransactions.forEach(t => {
    const tMonth = t.date.slice(0, 7);
    const monthData = last6Months.find(m => m.monthStr === tMonth);
    if (monthData) {
      if (t.type === 'income') monthData.income += t.amount;
      else if (t.type === 'expense') monthData.expense += t.amount;
    }
  });

  // Calculate percentages for chart heights
  const maxChartValue = Math.max(...last6Months.map(m => Math.max(m.income, m.expense)), 1);

  // Group and rank doctors by order referral count
  const doctorReferrals = filteredOrders
    .filter(o => o.medico && o.medico.trim() !== '')
    .reduce((acc, o) => {
      const doc = o.medico!.trim();
      acc[doc] = (acc[doc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedDoctors = (Object.entries(doctorReferrals) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 doctors

  const totalReferrals = (Object.values(doctorReferrals) as number[]).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-8">
      {/* Panel de Filtros Globales de Reportes */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold border-b border-slate-100 dark:border-slate-800 pb-3">
          <Filter className="w-5 h-5 text-blue-600" />
          <span>Filtros de Reporte</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          {/* Selector de Local / Sucursal */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" /> Sucursal / Local
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="h-10 px-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            >
              <option value="all">Todas las sucursales</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Selector de Período */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-500" /> Período
            </label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as PeriodType)}
              className="h-10 px-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            >
              <option value="all">Todo el histórico</option>
              <option value="day">Día actual</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
              <option value="custom">Rango Personalizado</option>
            </select>
          </div>

          {/* Fechas personalizadas */}
          {periodType === 'custom' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 px-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Hasta</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 px-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos", val: formatCurrency(totalIncome), change: "Filtrado", color: "blue", icon: DollarSign },
          { label: "Gastos", val: formatCurrency(totalExpenses), change: "Filtrado", color: "rose", icon: TrendingDown },
          { label: "Utilidad Neta", val: formatCurrency(netIncome), change: "Filtrado", color: "emerald", icon: TrendingUp },
          { label: "Margen", val: `${margin}%`, change: "Filtrado", color: "indigo", icon: Percent },
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
                <span className="block text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalExpenses)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Total</span>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-8 space-y-3 text-sm">
            {sortedCategories.length > 0 ? sortedCategories.map((item, idx) => {
              const cat = item[0];
              const amount = item[1];
              return (
                <div key={cat} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: categoryColors[idx]}}></span> <span className="capitalize">{cat}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-slate-900 dark:text-white">{totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%</span>
                    <span className="text-[10px] text-slate-400">{formatCurrency(amount)}</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-slate-500 text-sm py-4">No hay gastos registrados para desglosar.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Ranking de Médicos Derivadores
          </h3>
          {sortedDoctors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 font-semibold w-12 text-center">Puesto</th>
                    <th className="pb-3 font-semibold pl-4">Médico</th>
                    <th className="pb-3 font-semibold text-right">Derivaciones</th>
                    <th className="pb-3 font-semibold text-right">% del Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedDoctors.map((item, idx) => {
                    const docName = item[0];
                    const count = item[1];
                    const pct = totalReferrals > 0 ? ((count / totalReferrals) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={docName} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                            idx === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                            idx === 1 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                            idx === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400" :
                            "bg-slate-50 text-slate-500 dark:bg-slate-900"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-4 pl-4 font-bold text-slate-900 dark:text-white">
                          {docName}
                        </td>
                        <td className="py-4 text-right font-mono font-bold text-slate-850 dark:text-slate-300">
                          {count}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="font-mono text-xs text-slate-500">{pct}%</span>
                            <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                              <div className="bg-blue-600 h-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-bold">Sin derivaciones registradas</p>
              <p className="text-xs">Los médicos aparecerán a medida que registres recetas en este filtro.</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Resumen de Recetados
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Métricas globales sobre las prescripciones de pacientes derivadas por médicos de la zona.
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Recetas</span>
                <span className="font-black text-slate-900 dark:text-white font-mono">{filteredOrders.filter(o => o.type !== 'sale').length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Médicos Activos</span>
                <span className="font-black text-slate-900 dark:text-white font-mono">{Object.keys(doctorReferrals).length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Tasa Derivación</span>
                <span className="font-black text-emerald-600 font-mono">
                  {filteredOrders.filter(o => o.type !== 'sale').length > 0
                    ? `${Math.round((totalReferrals / filteredOrders.filter(o => o.type !== 'sale').length) * 100)}%`
                    : "0%"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REPORTE DE REINTEGROS / COBERTURAS POR OBRA SOCIAL */}
      <InsuranceClaimsSection 
        isDateInPeriod={isDateInPeriod} 
        formatCurrency={formatCurrency}
        periodLabel={periodLabel}
        branchLabel={branchLabel}
      />
    </div>
  );
}

function InsuranceClaimsSection({ 
  isDateInPeriod, 
  formatCurrency, 
  periodLabel, 
  branchLabel 
}: { 
  isDateInPeriod: (d: string) => boolean; 
  formatCurrency: (v: number) => string; 
  periodLabel: string; 
  branchLabel: string; 
}) {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase.from('insurance_claims').select('*');
      if (!error && data) {
        setClaims(data.map((row: any) => ({
          id: row.id,
          orderId: row.order_id,
          clientId: row.client_id,
          clientName: row.client_name,
          clientDni: row.client_dni,
          insuranceId: row.insurance_id,
          insuranceName: row.insurance_name,
          itemType: row.item_type,
          frameCoverage: Number(row.frame_coverage) || 0,
          crystalCoverage: Number(row.crystal_coverage) || 0,
          totalAmount: Number(row.total_amount) || 0,
          status: row.status || 'Pendiente',
          date: row.date
        })));
      }
    } catch (e) {
      console.error("Error fetching insurance claims:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'Pendiente' | 'Presentado' | 'Cobrado') => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    try {
      await supabase.from('insurance_claims').update({ status: newStatus }).eq('id', id);
    } catch (e) {
      console.error("Error updating claim status:", e);
    }
  };

  const { insurances } = useSettings();
  const [selectedInsuranceFilter, setSelectedInsuranceFilter] = useState<string>("all");

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchesPeriod = isDateInPeriod(c.date);
      const matchesInsurance = selectedInsuranceFilter === 'all' || 
        c.insuranceId === selectedInsuranceFilter || 
        c.insuranceName.toLowerCase() === selectedInsuranceFilter.toLowerCase();
      return matchesPeriod && matchesInsurance;
    });
  }, [claims, isDateInPeriod, selectedInsuranceFilter]);

  // Agrupado por Obra Social
  const groupedByInsurance = useMemo(() => {
    const map: Record<string, { name: string; pending: number; collected: number; count: number; items: InsuranceClaim[] }> = {};
    filteredClaims.forEach(claim => {
      const insName = claim.insuranceName || 'Otra Obra Social';
      if (!map[insName]) {
        map[insName] = { name: insName, pending: 0, collected: 0, count: 0, items: [] };
      }
      map[insName].count += 1;
      map[insName].items.push(claim);
      if (claim.status === 'Cobrado') {
        map[insName].collected += claim.totalAmount;
      } else {
        map[insName].pending += claim.totalAmount;
      }
    });
    return Object.values(map).sort((a, b) => b.pending - a.pending);
  }, [filteredClaims]);

  const totalPendingClaims = filteredClaims.filter(c => c.status !== 'Cobrado').reduce((sum, c) => sum + c.totalAmount, 0);
  const totalCollectedClaims = filteredClaims.filter(c => c.status === 'Cobrado').reduce((sum, c) => sum + c.totalAmount, 0);

  const handleExportExcel = (targetGroup?: { name: string; items: InsuranceClaim[] }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Si viene un grupo particular, exportamos ese grupo. Si no, exportamos los filteredClaims acumulados
    const itemsToExport = targetGroup ? targetGroup.items : filteredClaims;
    const groupTitle = targetGroup 
      ? targetGroup.name 
      : (selectedInsuranceFilter !== 'all' ? (insurances.find(i => i.id === selectedInsuranceFilter)?.name || selectedInsuranceFilter) : "TODAS LAS COBERTURAS");
      
    const totalGroupAmount = itemsToExport.reduce((sum, item) => sum + item.totalAmount, 0);
    const fmt = (num: number) => `$ ${num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          .header-row { font-weight: bold; font-size: 14px; text-align: center; height: 35px; background-color: #f2f2f2; border: 2px solid #000; }
          .th-row th { border: 1px solid #000; padding: 8px; background-color: #e6e6e6; font-weight: bold; }
          .td-cell { border: 1px solid #000; padding: 6px; }
          .total-row td { border: 1px solid #000; padding: 8px; font-weight: bold; font-style: italic; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="4" class="header-row">
              COMERCIO: OPTICA PARACAO: "${groupTitle.toUpperCase()}"- ${periodLabel.toUpperCase()}
            </td>
          </tr>
          <tr class="th-row">
            <th>Afiliados</th>
            <th>N°</th>
            <th>Fecha RECETA</th>
            <th>Monto Total</th>
          </tr>
          ${itemsToExport.map(item => `
            <tr>
              <td class="td-cell">${item.clientName.toUpperCase()}</td>
              <td class="td-cell text-center">${item.affiliateNumber || item.clientDni || '-'}</td>
              <td class="td-cell text-center">${item.date}</td>
              <td class="td-cell text-right">${fmt(item.totalAmount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2"></td>
            <td class="text-right">TOTAL:</td>
            <td class="text-right">${fmt(totalGroupAmount)}</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const cleanInsuranceName = groupTitle.toUpperCase().replace(/[^a-zA-Z0-9_\-]/g, '_');
    link.href = url;
    link.setAttribute('download', `Reintegro_${cleanInsuranceName}_${todayStr}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Reporte de Reintegros & Coberturas por Obra Social
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control de subsidios a pedir a Prepagas y Obras Sociales por reintegro de Armazones y Cristales.
            </p>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              Período seleccionado: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{periodLabel}</span>
            </span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              Sucursal: <span className="text-purple-600 dark:text-purple-400 font-extrabold">{branchLabel}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Obra Social */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={selectedInsuranceFilter}
              onChange={(e) => setSelectedInsuranceFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none pr-2"
            >
              <option value="all">Todas las Obras Sociales</option>
              {insurances.filter(ins => ins.name.trim().toLowerCase() !== 'particular' && !ins.name.trim().toLowerCase().includes('sin cobertura')).map(ins => (
                <option key={ins.id} value={ins.id}>{ins.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Botón Permanente de Exportar Excel */}
          <button
            onClick={() => handleExportExcel()}
            disabled={filteredClaims.length === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 ${
              filteredClaims.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
            title={filteredClaims.length > 0 ? "Exportar datos actuales a Excel" : "Sin datos para exportar"}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>

          <div className="flex gap-3">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-3 py-1.5 rounded-xl">
              <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pendiente</p>
              <p className="text-sm font-black text-amber-700 dark:text-amber-400 font-mono">{formatCurrency(totalPendingClaims)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1.5 rounded-xl">
              <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Cobrado</p>
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatCurrency(totalCollectedClaims)}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Cargando reporte de reintegros...</div>
      ) : groupedByInsurance.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
          No hay solicitudes de reintegro por obra social registradas para el <span className="font-bold text-slate-700 dark:text-slate-300">Período ({periodLabel})</span> en <span className="font-bold text-slate-700 dark:text-slate-300">{branchLabel}</span>.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByInsurance.map(group => (
            <div key={group.name} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{group.name}</h4>
                    <p className="text-xs text-slate-500">{group.count} solicitudes registradas</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right border-r border-slate-200 dark:border-slate-700 pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pendiente de Reintegro</p>
                    <p className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(group.pending)}</p>
                  </div>
                  <div className="text-right border-r border-slate-200 dark:border-slate-700 pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Liquidado / Cobrado</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(group.collected)}</p>
                  </div>
                  <button
                    onClick={() => handleExportExcel(group)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
                    title="Exportar planilla a Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Exportar Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] bg-white dark:bg-slate-900">
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Orden / Pedido</th>
                      <th className="p-3">Paciente / Cliente</th>
                      <th className="p-3">DNI</th>
                      <th className="p-3 text-right">Reintegro Cristal</th>
                      <th className="p-3 text-right">Reintegro Armazón</th>
                      <th className="p-3 text-right">Total Cobertura</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {group.items.map(claim => (
                      <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{claim.date}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">{claim.orderId}</td>
                        <td className="p-3 font-semibold text-slate-850 dark:text-slate-200">{claim.clientName}</td>
                        <td className="p-3 font-mono text-slate-500">{claim.clientDni || '-'}</td>
                        <td className="p-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                          {claim.crystalCoverage > 0 ? formatCurrency(claim.crystalCoverage) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                          {claim.frameCoverage > 0 ? formatCurrency(claim.frameCoverage) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(claim.totalAmount)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            claim.status === 'Cobrado'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : claim.status === 'Presentado'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {claim.status === 'Cobrado' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {claim.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {claim.status !== 'Cobrado' ? (
                            <button
                              onClick={() => handleUpdateStatus(claim.id, 'Cobrado')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all"
                            >
                              Marcar Cobrado
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(claim.id, 'Pendiente')}
                              className="px-2 py-1 text-slate-400 hover:text-amber-600 text-[10px] font-semibold"
                            >
                              Deshacer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
