import React, { useState } from "react";
import { FlaskConical, Calendar, Search, FileText, CheckCircle2, Clock, Plus, X } from "lucide-react";
import { useLabs, LabJob } from "../context/LabContext";

export function Labs() {
  const { labs, jobs, payments, addJob } = useLabs();
  const [selectedLabId, setSelectedLabId] = useState(labs[0]?.id || "");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  const filteredJobs = jobs.filter(j => j.labId === selectedLabId && j.date.startsWith(period));
  const filteredPayments = payments.filter(p => p.labId === selectedLabId && p.date.startsWith(period));

  const totalJobs = filteredJobs.length;
  const subtotal = filteredJobs.reduce((sum, j) => sum + j.cost, 0);
  const pagos = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const saldo = subtotal - pagos;

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState<Omit<LabJob, 'id' | 'labId'>>({
    date: new Date().toISOString().split('T')[0],
    orderId: '',
    concept: '',
    cost: 0,
    status: 'Pendiente'
  });

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabId) return;
    addJob({ ...newJob, labId: selectedLabId });
    setIsJobModalOpen(false);
    setNewJob({
      date: new Date().toISOString().split('T')[0],
      orderId: '',
      concept: '',
      cost: 0,
      status: 'Pendiente'
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Laboratorio
          </label>
          <select 
            className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
            value={selectedLabId}
            onChange={(e) => setSelectedLabId(e.target.value)}
          >
            {labs.map(lab => (
              <option key={lab.id} value={lab.id}>{lab.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Periodo
          </label>
          <input 
            className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
            type="month" 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
        <button className="h-11 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Search className="w-4 h-4" /> Consultar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Trabajos</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalJobs}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Subtotal Adeudado</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">${subtotal.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pagos a Cuenta</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${pagos.toLocaleString('es-AR')}</p>
        </div>
        <div className={`p-6 rounded-xl shadow-lg text-white relative overflow-hidden ${saldo > 0 ? 'bg-red-600' : 'bg-blue-600'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <FileText className="w-16 h-16" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1 relative z-10">Saldo Final</p>
          <p className="text-3xl font-bold relative z-10">${Math.abs(saldo).toLocaleString('es-AR')} {saldo > 0 ? '(Deuda)' : ''}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Detalle de Trabajos
          </div>
          <button 
            onClick={() => setIsJobModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Cargar Trabajo
          </button>
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
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {new Date(job.date + 'T00:00:00').toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{job.orderId}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{job.concept}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${job.cost.toLocaleString('es-AR')}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      job.status === 'Procesado' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                    }`}>
                      {job.status === 'Procesado' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />} 
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No hay trabajos registrados para este laboratorio en el periodo seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nuevo Trabajo Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                <Plus className="w-5 h-5 text-blue-600" />
                Cargar Trabajo Externo
              </h3>
              <button onClick={() => setIsJobModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddJob}>
              <div className="p-5 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha de Ingreso</label>
                  <input type="date" required className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" value={newJob.date} onChange={e => setNewJob({...newJob, date: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nro Pedido / Paciente</label>
                  <input type="text" required placeholder="Ej: #4950 - Juan Pérez" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" value={newJob.orderId} onChange={e => setNewJob({...newJob, orderId: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Concepto del Trabajo</label>
                  <input type="text" required placeholder="Ej: Tallado Multifocal Premium" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" value={newJob.concept} onChange={e => setNewJob({...newJob, concept: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Costo Total ($)</label>
                    <input type="number" required min="0" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" value={newJob.cost || ''} onChange={e => setNewJob({...newJob, cost: Number(e.target.value)})} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Estado Inicial</label>
                    <select className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" value={newJob.status} onChange={e => setNewJob({...newJob, status: e.target.value as any})}>
                      <option value="Pendiente">Pendiente (En taller)</option>
                      <option value="Procesado">Procesado (Listo)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button type="button" onClick={() => setIsJobModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm">Guardar Trabajo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
