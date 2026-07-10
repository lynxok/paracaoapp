import React, { useState } from "react";
import { FlaskConical, Calendar, Search, FileText, CheckCircle2, Clock, Plus, X, Eye, CheckCircle, ShoppingBag } from "lucide-react";
import { useLabs, LabJob } from "../context/LabContext";
import { cn } from "../lib/utils";

export function Labs() {
  const { labs, jobs, payments, addJob, updateJobStatus } = useLabs();
  const [selectedLabId, setSelectedLabId] = useState(labs[0]?.id || "");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [activeJobDetails, setActiveJobDetails] = useState<LabJob | null>(null);

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
                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJobs.map((job) => {
                let statusClasses = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
                let statusIcon = <Clock className="w-3 h-3" />;
                
                if (job.status === 'Enviado al laboratorio') {
                  statusClasses = 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900';
                  statusIcon = <FlaskConical className="w-3 h-3" />;
                } else if (job.status === 'En producción') {
                  statusClasses = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
                  statusIcon = <Clock className="w-3 h-3" />;
                } else if (job.status === 'Recibido') {
                  statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900';
                  statusIcon = <CheckCircle2 className="w-3 h-3" />;
                } else if (job.status === 'Entregado') {
                  statusClasses = 'bg-slate-900 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-slate-100';
                  statusIcon = <CheckCircle className="w-3 h-3" />;
                }

                return (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(job.date + 'T00:00:00').toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{job.orderId}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{job.concept}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${job.cost.toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusClasses}`}>
                        {statusIcon} 
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setActiveJobDetails(job)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ficha Técnica
                      </button>
                    </td>
                  </tr>
                );
              })}
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
                      <option value="Pendiente">Pendiente</option>
                      <option value="Enviado al laboratorio">Enviado al laboratorio</option>
                      <option value="En producción">En producción</option>
                      <option value="Recibido">Recibido</option>
                      <option value="Entregado">Entregado</option>
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
      {/* Ficha Técnica Modal */}
      {activeJobDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                Ficha de Trabajo Laboratorio: {activeJobDetails.orderId}
              </h3>
              <button onClick={() => setActiveJobDetails(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
              {/* Encabezado General */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                <div>
                  <span className="text-slate-400 block mb-0.5">Cliente</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{activeJobDetails.clientName || 'Cliente Mostrador'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">DNI</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeJobDetails.clientDni || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Vendedor</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeJobDetails.sellerName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Sucursal</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeJobDetails.branchName || '—'}</span>
                </div>
              </div>

              {/* Receta */}
              {activeJobDetails.prescription && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase tracking-wide">Receta Oftálmica ({activeJobDetails.prescription.type})</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-slate-150 dark:border-slate-800 text-center font-medium">
                      <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-widest text-[9px]">
                        <tr>
                          <th className="px-2 py-1.5 border-r border-b border-slate-200 dark:border-slate-800 text-left">Ojo</th>
                          <th className="px-2 py-1.5 border-r border-b border-slate-200 dark:border-slate-800">Esférico</th>
                          <th className="px-2 py-1.5 border-r border-b border-slate-200 dark:border-slate-800">Cilíndrico</th>
                          <th className="px-2 py-1.5 border-r border-b border-slate-200 dark:border-slate-800">Eje</th>
                          <th className="px-2 py-1.5 border-r border-b border-slate-200 dark:border-slate-800">Adición</th>
                          <th className="px-2 py-1.5 border-r border-b border-slate-200 dark:border-slate-800">Altura</th>
                          <th className="px-2 py-1.5 border-r border-b border-slate-200 dark:border-slate-800">D. Interpupilar</th>
                          <th className="px-2 py-1.5 border-b border-slate-200 dark:border-slate-800">A. Pupilar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {['Derecho (OD)', 'Izquierdo (OI)'].map((label, idx) => {
                          const isOD = idx === 0;
                          const lejos = isOD ? activeJobDetails.prescription?.lejosOD : activeJobDetails.prescription?.lejosOI;
                          const cerca = isOD ? activeJobDetails.prescription?.cercaOD : activeJobDetails.prescription?.cercaOI;
                          const add = isOD ? activeJobDetails.prescription?.adicionOD : activeJobDetails.prescription?.adicionOI;
                          const alt = isOD ? activeJobDetails.prescription?.alturaOD : activeJobDetails.prescription?.alturaOI;
                          const di = isOD ? activeJobDetails.prescription?.diOD : activeJobDetails.prescription?.diOI;
                          const ap = isOD ? activeJobDetails.prescription?.apOD : activeJobDetails.prescription?.apOI;

                          return (
                            <tr key={label} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 font-bold text-left">{label}</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{lejos?.esf || cerca?.esf || '—'}</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{lejos?.cil || cerca?.cil || '—'}</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{lejos?.eje || cerca?.eje || '—'}°</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{add ? `+${add}` : '—'}</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{alt || '—'} mm</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{di || '—'} mm</td>
                              <td className="px-2 py-2 text-slate-850 dark:text-slate-350">{ap || '—'} mm</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detalles del Cristal */}
              {activeJobDetails.crystalDetails && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase tracking-wide">Cristal y Tratamientos Cotizados</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold">Cristal Seleccionado</span>
                      <span className="text-slate-850 dark:text-white font-bold">{activeJobDetails.crystalDetails.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Material</span>
                      <span className="text-slate-855 dark:text-white font-bold">{activeJobDetails.crystalDetails.material}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Índice</span>
                      <span className="text-slate-855 dark:text-white font-bold">{activeJobDetails.crystalDetails.index}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Ojos Cotizados</span>
                      <span className="text-slate-855 dark:text-white font-bold uppercase">{activeJobDetails.crystalDetails.eyes}</span>
                    </div>
                  </div>
                  
                  {activeJobDetails.treatments && activeJobDetails.treatments.length > 0 && (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-905 rounded-xl">
                      <span className="font-bold text-[10px] text-emerald-800 dark:text-emerald-450 block uppercase mb-1">Tratamientos Aplicados</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeJobDetails.treatments.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold shadow-sm">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Observaciones */}
              {activeJobDetails.observaciones && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 block uppercase">Observaciones</span>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-750 dark:text-slate-350">
                    {activeJobDetails.observaciones}
                  </div>
                </div>
              )}

              {/* Gestión de Estado */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="font-black text-blue-700 dark:text-blue-400 block uppercase mb-1">Cambiar Estado de Producción</span>
                  <p className="text-slate-500 text-[10px]">Actualizá la etapa del recetado en taller para notificar a la sucursal.</p>
                </div>
                <select
                  value={activeJobDetails.status}
                  onChange={e => {
                    const newStatus = e.target.value as any;
                    updateJobStatus(activeJobDetails.id, newStatus);
                    setActiveJobDetails({ ...activeJobDetails, status: newStatus });
                  }}
                  className="h-10 px-3 rounded-lg border border-slate-250 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs outline-none"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Enviado al laboratorio">Enviado al laboratorio</option>
                  <option value="En producción">En producción</option>
                  <option value="Recibido">Recibido (Listo en Local)</option>
                  <option value="Entregado">Entregado al Cliente</option>
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/50">
              <button 
                onClick={() => setActiveJobDetails(null)} 
                className="px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg font-bold shadow-sm hover:opacity-90 transition-opacity text-xs"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
