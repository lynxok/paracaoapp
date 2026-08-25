import React, { useState } from "react";
import { FlaskConical, Calendar, Search, FileText, CheckCircle2, Clock, Plus, X, Eye, CheckCircle, Glasses, Wrench } from "lucide-react";
import { useLabs, LabJob } from "../context/LabContext";
import { useSettings } from "../context/SettingsContext";
import { useClients } from "../context/ClientContext";
import { cn } from "../lib/utils";

export function Labs() {
  const { labs, jobs, payments, addJob, updateJobStatus, updateJobEstimatedDelivery } = useLabs();
  const { lensTypes, materials, indices, brands, designs, colors, treatments } = useSettings();
  const { orders } = useClients();
  
  const [selectedLabId, setSelectedLabId] = useState(labs[0]?.id || "");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [activeJobDetails, setActiveJobDetails] = useState<LabJob | null>(null);

  const checkOrderPaymentStatus = (orderId: string): boolean => {
    const matchedOrder = orders.find(o => o.id.trim().toLowerCase() === orderId.trim().toLowerCase());
    if (matchedOrder && matchedOrder.paid <= 0) {
      return false;
    }
    return true;
  };

  const handleStatusChangeAttempt = (orderId: string, status: string): boolean => {
    if (status === 'Enviado al laboratorio' || status === 'En producción') {
      const isPaidOrHasSena = checkOrderPaymentStatus(orderId);
      if (!isPaidOrHasSena) {
        alert("Para enviar el pedido al laboratorio debés registrar una seña o completar el pago total");
        return false;
      }
    }
    return true;
  };

  const filteredJobs = jobs.filter(j => j.labId === selectedLabId && j.date.startsWith(period));
  const filteredPayments = payments.filter(p => p.labId === selectedLabId && p.date.startsWith(period));

  const totalJobs = filteredJobs.length;
  const subtotal = filteredJobs.reduce((sum, j) => sum + j.cost, 0);
  const pagos = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const saldo = subtotal - pagos;

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'crystal' | 'service'>('crystal');

  // General Job Form State
  const [newJob, setNewJob] = useState({
    date: new Date().toISOString().split('T')[0],
    orderId: '',
    clientName: '',
    clientDni: '',
    concept: '',
    cost: 0,
    status: 'Pendiente' as any,
    estimatedLabDeliveryDate: '',
    observaciones: ''
  });

  // Guided Crystal Form State
  const [crystalForm, setCrystalForm] = useState({
    lensType: 'Monofocal',
    material: 'Orgánico',
    index: '1.49',
    brand: 'Essilor',
    design: 'Esférico',
    color: 'Blanco',
    eyes: 'ambos' as 'ambos' | 'od' | 'oi',
    selectedTreatments: [] as string[],
    prescription: {
      lejosOD: { esf: '', cil: '', eje: '' },
      lejosOI: { esf: '', cil: '', eje: '' },
      adicionOD: '',
      adicionOI: '',
      alturaOD: '',
      alturaOI: '',
      diOD: '',
      diOI: ''
    }
  });

  const toggleTreatment = (tName: string) => {
    setCrystalForm(prev => {
      const exists = prev.selectedTreatments.includes(tName);
      return {
        ...prev,
        selectedTreatments: exists 
          ? prev.selectedTreatments.filter(t => t !== tName)
          : [...prev.selectedTreatments, tName]
      };
    });
  };

  const resetForm = () => {
    setNewJob({
      date: new Date().toISOString().split('T')[0],
      orderId: '',
      clientName: '',
      clientDni: '',
      concept: '',
      cost: 0,
      status: 'Pendiente',
      estimatedLabDeliveryDate: '',
      observaciones: ''
    });
    setCrystalForm({
      lensType: 'Monofocal',
      material: 'Orgánico',
      index: '1.49',
      brand: 'Essilor',
      design: 'Esférico',
      color: 'Blanco',
      eyes: 'ambos',
      selectedTreatments: [],
      prescription: {
        lejosOD: { esf: '', cil: '', eje: '' },
        lejosOI: { esf: '', cil: '', eje: '' },
        adicionOD: '',
        adicionOI: '',
        alturaOD: '',
        alturaOI: '',
        diOD: '',
        diOI: ''
      }
    });
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabId) return;

    const trimmedOrderId = newJob.orderId.trim();
    if (jobs.some(j => j.orderId.trim().toLowerCase() === trimmedOrderId.toLowerCase())) {
      alert(`El número de pedido "${trimmedOrderId}" ya existe. Por favor ingrese un número único.`);
      return;
    }

    if (newJob.status === 'Enviado al laboratorio' || newJob.status === 'En producción') {
      const ok = handleStatusChangeAttempt(trimmedOrderId, newJob.status);
      if (!ok) return;
    }

    const labObj = labs.find(l => l.id === selectedLabId);

    if (modalMode === 'crystal') {
      const autoConcept = newJob.concept.trim() || `${crystalForm.lensType} ${crystalForm.material} ${crystalForm.index} - ${crystalForm.brand}`;
      
      addJob({
        labId: selectedLabId,
        labName: labObj?.name,
        date: newJob.date,
        orderId: trimmedOrderId,
        concept: autoConcept,
        cost: newJob.cost,
        status: newJob.status,
        clientName: newJob.clientName,
        clientDni: newJob.clientDni,
        estimatedLabDeliveryDate: newJob.estimatedLabDeliveryDate,
        observaciones: newJob.observaciones,
        crystalDetails: {
          id: `c-manual-${Date.now()}`,
          name: `${crystalForm.lensType} ${crystalForm.material} ${crystalForm.index}`,
          type: crystalForm.lensType,
          material: crystalForm.material,
          index: crystalForm.index,
          brand: crystalForm.brand,
          design: crystalForm.design,
          color: crystalForm.color,
          eyes: crystalForm.eyes,
          basePrice: newJob.cost,
          totalPrice: newJob.cost
        },
        prescription: {
          type: crystalForm.lensType,
          lejosOD: crystalForm.prescription.lejosOD,
          lejosOI: crystalForm.prescription.lejosOI,
          adicionOD: crystalForm.prescription.adicionOD,
          adicionOI: crystalForm.prescription.adicionOI,
          alturaOD: crystalForm.prescription.alturaOD,
          alturaOI: crystalForm.prescription.alturaOI,
          diOD: crystalForm.prescription.diOD,
          diOI: crystalForm.prescription.diOI
        },
        treatments: crystalForm.selectedTreatments as any
      });
    } else {
      addJob({
        labId: selectedLabId,
        labName: labObj?.name,
        date: newJob.date,
        orderId: trimmedOrderId,
        concept: newJob.concept || 'Trabajo de Servicio / Reparación',
        cost: newJob.cost,
        status: newJob.status,
        clientName: newJob.clientName,
        clientDni: newJob.clientDni,
        estimatedLabDeliveryDate: newJob.estimatedLabDeliveryDate,
        observaciones: newJob.observaciones
      });
    }

    setIsJobModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-8">
      {/* Top Header Filters */}
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

      {/* Stats Cards */}
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

      {/* Main Jobs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Detalle de Trabajos
          </div>
          <button 
            onClick={() => setIsJobModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm rounded-lg hover:opacity-90 transition-opacity font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Cargar Trabajo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha Ingreso</th>
                <th className="px-6 py-4 font-semibold">Pedido</th>
                <th className="px-6 py-4 font-semibold">Concepto</th>
                <th className="px-6 py-4 font-semibold text-right">Costo</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-center">Fecha Est. Entrega Lab</th>
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
                      <input
                        type="date"
                        value={job.estimatedLabDeliveryDate || ''}
                        onChange={(e) => updateJobEstimatedDelivery(job.id, e.target.value)}
                        className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                      />
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
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No hay trabajos registrados para este laboratorio en el periodo seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nuevo Trabajo Modal (Guiado / Servicio) */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                Cargar Trabajo de Laboratorio
              </h3>
              <button onClick={() => { setIsJobModalOpen(false); resetForm(); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddJob}>
              <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar text-xs">
                
                {/* Selector de Modo */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setModalMode('crystal')}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all",
                      modalMode === 'crystal' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    <Glasses className="w-4 h-4" /> Recetado / Cristal (Guiado)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setModalMode('service')}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all",
                      modalMode === 'service' ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    <Wrench className="w-4 h-4" /> Servicio / Rápido
                  </button>
                </div>

                {/* 1. DATOS GENERALES DEL TRABAJO */}
                <div className="space-y-3">
                  <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wide text-[11px]">
                    1. Datos del Pedido
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Fecha de Ingreso *</label>
                      <input type="date" required className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-medium" value={newJob.date} onChange={e => setNewJob({...newJob, date: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Nro Pedido / Código *</label>
                      <input type="text" required placeholder="Ej: #4950" className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-medium" value={newJob.orderId} onChange={e => setNewJob({...newJob, orderId: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Nombre del Paciente / Cliente</label>
                      <input type="text" placeholder="Ej: Juan Pérez" className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-medium" value={newJob.clientName} onChange={e => setNewJob({...newJob, clientName: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* 2. MODAL GUIADO: ELECCIÓN DE CRISTAL Y TRATAMIENTOS */}
                {modalMode === 'crystal' && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wide text-[11px]">
                        2. Especificación del Cristal
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Tipo de Lente</label>
                          <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full font-medium" value={crystalForm.lensType} onChange={e => setCrystalForm({...crystalForm, lensType: e.target.value})}>
                            {(lensTypes.length > 0 ? lensTypes : ['Monofocal', 'Bifocal', 'Multifocal', 'Ocupacional']).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Material</label>
                          <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full font-medium" value={crystalForm.material} onChange={e => setCrystalForm({...crystalForm, material: e.target.value})}>
                            {(materials.length > 0 ? materials : ['Orgánico', 'Policarbonato', 'Mineral', 'Trivex']).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Índice</label>
                          <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full font-medium" value={crystalForm.index} onChange={e => setCrystalForm({...crystalForm, index: e.target.value})}>
                            {(indices.length > 0 ? indices : ['1.49', '1.56', '1.59', '1.61', '1.67', '1.74']).map(i => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Diseño</label>
                          <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full font-medium" value={crystalForm.design} onChange={e => setCrystalForm({...crystalForm, design: e.target.value})}>
                            {(designs.length > 0 ? designs : ['Esférico', 'Asférico', 'Digital', 'Progresivo']).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Marca / Taller</label>
                          <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full font-medium" value={crystalForm.brand} onChange={e => setCrystalForm({...crystalForm, brand: e.target.value})}>
                            {(brands.length > 0 ? brands : ['Essilor', 'Zeiss', 'Kodak', 'Novar', 'Hoya', 'Genérico']).map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Color</label>
                          <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full font-medium" value={crystalForm.color} onChange={e => setCrystalForm({...crystalForm, color: e.target.value})}>
                            {(colors.length > 0 ? colors : ['Blanco', 'Gris', 'Marrón', 'Verde']).map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Ojos Afectados</label>
                          <div className="flex gap-2 h-9 items-center">
                            {[
                              { id: 'ambos', label: 'Ambos Ojos (OD + OI)' },
                              { id: 'od', label: 'Solo Ojo Derecho' },
                              { id: 'oi', label: 'Solo Ojo Izquierdo' }
                            ].map(eyeOpt => (
                              <label key={eyeOpt.id} className={cn(
                                "flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold text-center cursor-pointer transition-all",
                                crystalForm.eyes === eyeOpt.id ? "bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "border-slate-200 text-slate-600 dark:border-slate-800"
                              )}>
                                <input type="radio" name="eyesOpt" className="sr-only" value={eyeOpt.id} checked={crystalForm.eyes === eyeOpt.id} onChange={() => setCrystalForm({...crystalForm, eyes: eyeOpt.id as any})} />
                                {eyeOpt.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tratamientos */}
                      <div className="mt-3">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Tratamientos Adicionales</label>
                        <div className="flex flex-wrap gap-2">
                          {(treatments.length > 0 ? treatments : ['Anti-reflex', 'Fotocromático', 'Filtro Azul', 'Filtro UV', 'Hard Coat / Antirrayas']).map(t => {
                            const isSelected = crystalForm.selectedTreatments.includes(t);
                            return (
                              <button
                                type="button"
                                key={t}
                                onClick={() => toggleTreatment(t)}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-bold border transition-all",
                                  isSelected 
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                )}
                              >
                                {isSelected ? '✓ ' : '+ '} {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 3. RECETA OFTÁLMICA (GRADUACIÓN) */}
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wide text-[11px]">
                        3. Graduación Oftálmica (Opcional para el Taller)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                          <thead className="bg-slate-50 dark:bg-slate-800/40 text-[10px] uppercase font-bold text-slate-500">
                            <tr>
                              <th className="p-2 text-left">Ojo</th>
                              <th className="p-2">Esférico</th>
                              <th className="p-2">Cilíndrico</th>
                              <th className="p-2">Eje (°)</th>
                              <th className="p-2">Adición</th>
                              <th className="p-2">Altura (mm)</th>
                              <th className="p-2">D.I. (mm)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                              <td className="p-2 font-bold text-left bg-slate-50/50 dark:bg-slate-900/50">OD (Derecho)</td>
                              <td className="p-1"><input type="text" placeholder="0.00" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.lejosOD.esf} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, lejosOD: {...crystalForm.prescription.lejosOD, esf: e.target.value}}})} /></td>
                              <td className="p-1"><input type="text" placeholder="0.00" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.lejosOD.cil} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, lejosOD: {...crystalForm.prescription.lejosOD, cil: e.target.value}}})} /></td>
                              <td className="p-1"><input type="text" placeholder="180" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.lejosOD.eje} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, lejosOD: {...crystalForm.prescription.lejosOD, eje: e.target.value}}})} /></td>
                              <td className="p-1"><input type="text" placeholder="+2.00" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.adicionOD} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, adicionOD: e.target.value}})} /></td>
                              <td className="p-1"><input type="text" placeholder="18" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.alturaOD} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, alturaOD: e.target.value}})} /></td>
                              <td className="p-1"><input type="text" placeholder="31.5" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.diOD} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, diOD: e.target.value}})} /></td>
                            </tr>
                            <tr>
                              <td className="p-2 font-bold text-left bg-slate-50/50 dark:bg-slate-900/50">OI (Izquierdo)</td>
                              <td className="p-1"><input type="text" placeholder="0.00" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.lejosOI.esf} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, lejosOI: {...crystalForm.prescription.lejosOI, esf: e.target.value}}})} /></td>
                              <td className="p-1"><input type="text" placeholder="0.00" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.lejosOI.cil} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, lejosOI: {...crystalForm.prescription.lejosOI, cil: e.target.value}}})} /></td>
                              <td className="p-1"><input type="text" placeholder="180" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.lejosOI.eje} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, lejosOI: {...crystalForm.prescription.lejosOI, eje: e.target.value}}})} /></td>
                              <td className="p-1"><input type="text" placeholder="+2.00" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.adicionOI} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, adicionOI: e.target.value}})} /></td>
                              <td className="p-1"><input type="text" placeholder="18" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.alturaOI} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, alturaOI: e.target.value}})} /></td>
                              <td className="p-1"><input type="text" placeholder="31.5" className="w-16 text-center h-8 border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" value={crystalForm.prescription.diOI} onChange={e => setCrystalForm({...crystalForm, prescription: {...crystalForm.prescription, diOI: e.target.value}})} /></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* MODAL SERVICIO O CONCEPTO LIBRE */}
                {modalMode === 'service' && (
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wide text-[11px]">
                      2. Descripción del Servicio / Reparación
                    </h4>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Concepto del Trabajo *</label>
                      <input type="text" required placeholder="Ej: Soldadura de patilla / Reparación de armazón" className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-medium" value={newJob.concept} onChange={e => setNewJob({...newJob, concept: e.target.value})} />
                    </div>
                  </div>
                )}

                {/* 4. COSTOS Y TIEMPOS */}
                <div className="space-y-3">
                  <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wide text-[11px]">
                    {modalMode === 'crystal' ? '4. Costo y Tiempos de Entrega' : '3. Costo y Tiempos de Entrega'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Costo Total del Trabajo ($) *</label>
                      <input type="number" required min="0" className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-bold" value={newJob.cost || ''} onChange={e => setNewJob({...newJob, cost: Number(e.target.value)})} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Estado Inicial</label>
                      <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full font-medium" value={newJob.status} onChange={e => setNewJob({...newJob, status: e.target.value as any})}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Enviado al laboratorio">Enviado al laboratorio</option>
                        <option value="En producción">En producción</option>
                        <option value="Recibido">Recibido</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Fecha Est. Entrega Lab</label>
                      <input type="date" className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-medium" value={newJob.estimatedLabDeliveryDate} onChange={e => setNewJob({...newJob, estimatedLabDeliveryDate: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Observaciones para el Taller</label>
                    <textarea rows={2} placeholder="Ej: Entregar bisel especial / cliente retira con armazón propio" className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-medium text-xs" value={newJob.observaciones} onChange={e => setNewJob({...newJob, observaciones: e.target.value})} />
                  </div>
                </div>

              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button type="button" onClick={() => { setIsJobModalOpen(false); resetForm(); }} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-xs">Guardar Trabajo</button>
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
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{lejos?.eje || cerca?.eje || '—'}{lejos?.eje || cerca?.eje ? '°' : ''}</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{add ? `+${add}` : '—'}</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{alt ? `${alt} mm` : '—'}</td>
                              <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{di ? `${di} mm` : '—'}</td>
                              <td className="px-2 py-2 text-slate-850 dark:text-slate-350">{ap ? `${ap} mm` : '—'}</td>
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
                        {activeJobDetails.treatments.map(t => {
                          const tName = typeof t === 'string' ? t : (t as any)?.name;
                          return (
                            <span key={tName} className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold shadow-sm">{tName}</span>
                          );
                        })}
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
                    if (newStatus === 'Enviado al laboratorio' || newStatus === 'En producción') {
                      const ok = handleStatusChangeAttempt(activeJobDetails.orderId, newStatus);
                      if (!ok) return;
                    }
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
