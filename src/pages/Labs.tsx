import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FlaskConical, Calendar, Search, FileText, CheckCircle2, Clock, Plus, X, Eye, CheckCircle, Glasses, Wrench, AlertTriangle, ChevronDown, Package, ArrowRight, User, Printer } from "lucide-react";
import { useLabs, LabJob } from "../context/LabContext";
import { useSettings } from "../context/SettingsContext";
import { useClients } from "../context/ClientContext";
import { cn } from "../lib/utils";

export function Labs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { labs, jobs, payments, addJob, updateJobStatus, updateJobEstimatedDelivery } = useLabs();
  const { lensTypes, materials, indices, brands, designs, colors, treatments, opticaLogo, opticaName, opticaPhone, opticaAddress } = useSettings();
  const { orders, clients } = useClients();
  
  const [selectedLabId, setSelectedLabId] = useState("all");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [activeJobDetails, setActiveJobDetails] = useState<(LabJob & { order?: any; doctor?: string; branch?: string }) | null>(null);

  // Auto-open job details when navigated with orderId / jobId in state or query params
  useEffect(() => {
    const state = location.state as { openOrderId?: string; openJobId?: string } | null;
    const searchParams = new URLSearchParams(location.search);
    const targetOrderId = state?.openOrderId || searchParams.get('orderId');
    const targetJobId = state?.openJobId || searchParams.get('jobId');

    if (targetOrderId || targetJobId) {
      // 1. Try finding in jobs
      const foundJob = jobs.find(j => 
        (targetJobId && String(j.id) === String(targetJobId)) ||
        (targetOrderId && j.orderId && j.orderId.trim().toLowerCase() === targetOrderId.trim().toLowerCase())
      );

      if (foundJob) {
        setSelectedLabId("all");
        if (foundJob.date) {
          setPeriod(foundJob.date.slice(0, 7));
        }
        // Also enrich with client info and prescription details if missing in lab job
        const matchedOrder = orders.find(o => o.id && o.id.trim().toLowerCase() === (foundJob.orderId || '').trim().toLowerCase());
        const clientObj = clients.find(c => 
          (c.id && String(c.id) === String(matchedOrder?.clientId)) ||
          (c.dni && matchedOrder?.clientId && c.dni.trim() === String(matchedOrder.clientId).trim()) ||
          (c.name && foundJob.clientName && c.name.trim().toLowerCase() === foundJob.clientName.trim().toLowerCase())
        );

        const rx = matchedOrder?.prescriptionDetails;

        setActiveJobDetails({
          ...foundJob,
          clientDni: foundJob.clientDni || clientObj?.dni || '',
          clientName: foundJob.clientName || clientObj?.name || matchedOrder?.clientName || 'Cliente',
          sellerName: foundJob.sellerName || 'Sucursal Principal',
          branchName: foundJob.branchName || (matchedOrder?.branchId === '1' ? 'Casa Central' : matchedOrder?.branchId ? `Sucursal ${matchedOrder.branchId}` : 'Casa Central'),
          doctor: matchedOrder?.medico || '',
          order: matchedOrder || undefined,
          prescription: foundJob.prescription || (rx ? {
            type: rx.prescriptionType || matchedOrder?.type || 'monofocal',
            lejosOD: rx.lejosOD,
            lejosOI: rx.lejosOI,
            cercaOD: rx.cercaOD,
            cercaOI: rx.cercaOI,
            adicionOD: rx.adicionOD,
            adicionOI: rx.adicionOI,
            alturaOD: rx.alturaOD,
            alturaOI: rx.alturaOI,
            diOD: rx.diOD,
            diOI: rx.diOI,
            apOD: rx.apOD,
            apOI: rx.apOI,
          } : undefined),
          crystalDetails: foundJob.crystalDetails || (rx?.selectedCrystalItem ? {
            id: rx.selectedCrystalItem.id || '',
            name: rx.selectedCrystalItem.name || matchedOrder?.service || 'Cristal Óptico',
            type: rx.selectedCrystalItem.type || matchedOrder?.type || 'monofocal',
            material: rx.selectedCrystalItem.material || 'Orgánico',
            index: rx.selectedCrystalItem.index || '1.49',
            brand: rx.selectedCrystalItem.brand || 'Genérico',
            design: rx.selectedCrystalItem.design || 'Esférico',
            color: rx.selectedCrystalItem.color || 'Blanco',
            eyes: rx.selectedOjos || rx.eyesCharged || 'ambos',
            basePrice: matchedOrder?.amount || 0,
            totalPrice: matchedOrder?.amount || 0
          } : undefined),
          treatments: (foundJob.treatments && foundJob.treatments.length > 0) ? foundJob.treatments : (rx?.selectedTreatments || []),
          observaciones: foundJob.observaciones || rx?.observaciones || matchedOrder?.notes || undefined
        });
        return;
      }

      // 2. Fallback: match from orders and populate with all order & prescription details
      if (targetOrderId && orders.length > 0) {
        const matchedOrder = orders.find(o => o.id && o.id.trim().toLowerCase() === targetOrderId.trim().toLowerCase());
        if (matchedOrder) {
          setSelectedLabId("all");
          if (matchedOrder.date) {
            setPeriod(matchedOrder.date.slice(0, 7));
          }
          const clientObj = clients.find(c => 
            (c.id && String(c.id) === String(matchedOrder.clientId)) ||
            (c.dni && matchedOrder.clientId && c.dni.trim() === String(matchedOrder.clientId).trim()) ||
            (c.name && matchedOrder.clientName && c.name.trim().toLowerCase() === matchedOrder.clientName.trim().toLowerCase())
          );
          const rx = matchedOrder.prescriptionDetails;
          
          setActiveJobDetails({
            id: `temp-${matchedOrder.id}`,
            labId: 'all',
            labName: rx?.assignedLab?.name || 'Taller Interno / Laboratorio',
            date: matchedOrder.date || new Date().toISOString().split('T')[0],
            orderId: matchedOrder.id,
            concept: matchedOrder.service || 'Trabajo Recetado',
            cost: matchedOrder.amount || 0,
            status: (matchedOrder.status as any) || 'En Taller',
            clientName: matchedOrder.clientName || clientObj?.name || 'Cliente',
            clientDni: clientObj?.dni || '',
            sellerName: 'Sucursal Principal',
            branchName: matchedOrder.branchId === '1' ? 'Casa Central' : matchedOrder.branchId ? `Sucursal ${matchedOrder.branchId}` : 'Casa Central',
            doctor: matchedOrder.medico || '',
            order: matchedOrder,
            prescription: rx ? {
              type: rx.prescriptionType || matchedOrder.type,
              lejosOD: rx.lejosOD,
              lejosOI: rx.lejosOI,
              cercaOD: rx.cercaOD,
              cercaOI: rx.cercaOI,
              adicionOD: rx.adicionOD,
              adicionOI: rx.adicionOI,
              alturaOD: rx.alturaOD,
              alturaOI: rx.alturaOI,
              diOD: rx.diOD,
              diOI: rx.diOI,
              apOD: rx.apOD,
              apOI: rx.apOI,
            } : undefined,
            crystalDetails: rx?.selectedCrystalItem ? {
              id: rx.selectedCrystalItem.id || '',
              name: rx.selectedCrystalItem.name || matchedOrder.service,
              type: rx.selectedCrystalItem.type || matchedOrder.type,
              material: rx.selectedCrystalItem.material || 'Orgánico',
              index: rx.selectedCrystalItem.index || '1.49',
              brand: rx.selectedCrystalItem.brand || 'Genérico',
              design: rx.selectedCrystalItem.design || 'Esférico',
              color: rx.selectedCrystalItem.color || 'Blanco',
              eyes: rx.selectedOjos || rx.eyesCharged || 'ambos',
              basePrice: matchedOrder.amount || 0,
              totalPrice: matchedOrder.amount || 0
            } : undefined,
            treatments: rx?.selectedTreatments || [],
            observaciones: rx?.observaciones || `Trabajo vinculado a la orden de venta ${matchedOrder.id} - ${matchedOrder.service}`
          });
        }
      }
    }
  }, [location.state, location.search, jobs, orders, clients]);

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

  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'pendientes' | 'demorados' | 'para_retirar' | 'entregados'>('all');
  const [filterByPeriod, setFilterByPeriod] = useState<boolean>(false);

  // Combine jobs with prescription orders that might not be in lab_jobs yet (Taller Propio / Sin Laboratorio asignado)
  const unifiedJobs: (LabJob & { order?: any; doctor?: string; isInternalWorkshop?: boolean })[] = React.useMemo(() => {
    // 1. First enrich all existing jobs with corresponding order details if available
    const list: (LabJob & { order?: any; doctor?: string; isInternalWorkshop?: boolean })[] = jobs.map(job => {
      const matchedOrder = orders.find(o => o.id && (o.id.trim().toLowerCase() === (job.orderId || '').trim().toLowerCase()));
      const clientObj = clients.find(c => 
        (c.id && String(c.id) === String(matchedOrder?.clientId)) ||
        (c.dni && matchedOrder?.clientId && c.dni.trim() === String(matchedOrder.clientId).trim()) ||
        (c.name && job.clientName && c.name.trim().toLowerCase() === job.clientName.trim().toLowerCase())
      );
      const rx = matchedOrder?.prescriptionDetails;

      return {
        ...job,
        clientDni: job.clientDni || clientObj?.dni || '',
        clientName: job.clientName || clientObj?.name || matchedOrder?.clientName || 'Cliente',
        sellerName: job.sellerName || 'Sucursal Principal',
        branchName: job.branchName || (matchedOrder?.branchId === '1' ? 'Casa Central' : matchedOrder?.branchId ? `Sucursal ${matchedOrder.branchId}` : 'Casa Central'),
        doctor: matchedOrder?.medico || '',
        order: matchedOrder || undefined,
        prescription: job.prescription || (rx ? {
          type: rx.prescriptionType || matchedOrder?.type || 'monofocal',
          lejosOD: rx.lejosOD,
          lejosOI: rx.lejosOI,
          cercaOD: rx.cercaOD,
          cercaOI: rx.cercaOI,
          adicionOD: rx.adicionOD,
          adicionOI: rx.adicionOI,
          alturaOD: rx.alturaOD,
          alturaOI: rx.alturaOI,
          diOD: rx.diOD,
          diOI: rx.diOI,
          apOD: rx.apOD,
          apOI: rx.apOI,
        } : undefined),
        crystalDetails: job.crystalDetails || (rx?.selectedCrystalItem ? {
          id: rx.selectedCrystalItem.id || '',
          name: rx.selectedCrystalItem.name || matchedOrder?.service || 'Cristal Óptico',
          type: rx.selectedCrystalItem.type || matchedOrder?.type || 'monofocal',
          material: rx.selectedCrystalItem.material || 'Orgánico',
          index: rx.selectedCrystalItem.index || '1.49',
          brand: rx.selectedCrystalItem.brand || 'Genérico',
          design: rx.selectedCrystalItem.design || 'Esférico',
          color: rx.selectedCrystalItem.color || 'Blanco',
          eyes: rx.selectedOjos || rx.eyesCharged || 'ambos',
          basePrice: matchedOrder?.amount || 0,
          totalPrice: matchedOrder?.amount || 0
        } : undefined),
        treatments: (job.treatments && job.treatments.length > 0) ? job.treatments : (rx?.selectedTreatments || []),
        observaciones: job.observaciones || rx?.observaciones || matchedOrder?.notes || undefined
      };
    });

    const registeredOrderIds = new Set(jobs.map(j => (j.orderId || '').trim().toLowerCase()));

    orders.forEach(order => {
      // If it's a prescription order or workshop service and NOT yet registered in jobs
      const isRx = order.type === 'monofocal' || order.type === 'multifocal' || order.type === 'ocupacional' || order.type === 'bifocal' || order.type === 'contacto';
      const orderIdLower = (order.id || '').trim().toLowerCase();
      
      if (isRx && !registeredOrderIds.has(orderIdLower)) {
        const clientObj = clients.find(c => 
          (c.id && String(c.id) === String(order.clientId)) ||
          (c.dni && order.clientId && c.dni.trim() === String(order.clientId).trim()) ||
          (c.name && order.clientName && c.name.trim().toLowerCase() === order.clientName.trim().toLowerCase())
        );
        const rx = order.prescriptionDetails;
        const assignedLab = rx?.assignedLab;

        list.push({
          id: `order-job-${order.id}`,
          labId: assignedLab?.id || 'taller-propio',
          labName: assignedLab?.name || 'Taller Propio (Interno)',
          date: order.date || new Date().toISOString().split('T')[0],
          orderId: order.id,
          concept: order.service || 'Trabajo Recetado',
          cost: order.amount || 0,
          status: (order.status as any) || 'En Taller',
          clientName: order.clientName || clientObj?.name || 'Cliente',
          clientDni: clientObj?.dni || '',
          sellerName: 'Sucursal Principal',
          branchName: order.branchId === '1' ? 'Casa Central' : order.branchId ? `Sucursal ${order.branchId}` : 'Casa Central',
          doctor: order.medico || '',
          isInternalWorkshop: !assignedLab,
          order: order,
          prescription: rx ? {
            type: rx.prescriptionType || order.type,
            lejosOD: rx.lejosOD,
            lejosOI: rx.lejosOI,
            cercaOD: rx.cercaOD,
            cercaOI: rx.cercaOI,
            adicionOD: rx.adicionOD,
            adicionOI: rx.adicionOI,
            alturaOD: rx.alturaOD,
            alturaOI: rx.alturaOI,
            diOD: rx.diOD,
            diOI: rx.diOI,
            apOD: rx.apOD,
            apOI: rx.apOI,
          } : undefined,
          crystalDetails: rx?.selectedCrystalItem ? {
            id: rx.selectedCrystalItem.id || '',
            name: rx.selectedCrystalItem.name || order.service,
            type: rx.selectedCrystalItem.type || order.type,
            material: rx.selectedCrystalItem.material || 'Orgánico',
            index: rx.selectedCrystalItem.index || '1.49',
            brand: rx.selectedCrystalItem.brand || 'Genérico',
            design: rx.selectedCrystalItem.design || 'Esférico',
            color: rx.selectedCrystalItem.color || 'Blanco',
            eyes: rx.selectedOjos || rx.eyesCharged || 'ambos',
            basePrice: order.amount || 0,
            totalPrice: order.amount || 0
          } : undefined,
          treatments: rx?.selectedTreatments || [],
          observaciones: rx?.observaciones || `Trabajo vinculado a la orden ${order.id}`
        });
      }
    });

    return list;
  }, [jobs, orders, clients]);

  const filteredJobs = unifiedJobs.filter(j => {
    // Filter by Lab
    if (selectedLabId === 'taller-propio') {
      if (j.labId !== 'taller-propio' && !j.isInternalWorkshop && j.labName !== 'Taller Propio (Interno)') return false;
    } else if (selectedLabId && selectedLabId !== 'all') {
      if (j.labId !== selectedLabId) return false;
    }

    // Filter by Status Tab
    if (activeStatusFilter === 'pendientes') {
      if (j.status !== 'En Taller' && j.status !== 'Demorado') return false;
    } else if (activeStatusFilter === 'demorados') {
      if (j.status !== 'Demorado') return false;
    } else if (activeStatusFilter === 'para_retirar') {
      if (j.status !== 'Para Retirar' && (j.status as any) !== 'Recibido') return false;
    } else if (activeStatusFilter === 'entregados') {
      if (j.status !== 'Entregado' && (j.status as any) !== 'Completado') return false;
    }

    // Filter by Period (Only if filterByPeriod is active, or if viewing 'entregados' history)
    if (filterByPeriod && period) {
      if (!j.date.startsWith(period)) return false;
    }

    return true;
  });

  const filteredPayments = payments.filter(p => (selectedLabId === 'all' || !selectedLabId || p.labId === selectedLabId) && (!filterByPeriod || !period || p.date.startsWith(period)));

  const totalJobs = filteredJobs.length;
  const subtotal = filteredJobs.reduce((sum, j) => sum + j.cost, 0);
  const pagos = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const saldo = subtotal - pagos;

  // Counts for status tabs
  const pendingCount = unifiedJobs.filter(j => (selectedLabId === 'all' || !selectedLabId || j.labId === selectedLabId) && (j.status === 'En Taller' || j.status === 'Demorado')).length;
  const readyCount = unifiedJobs.filter(j => (selectedLabId === 'all' || !selectedLabId || j.labId === selectedLabId) && (j.status === 'Para Retirar' || (j.status as any) === 'Recibido')).length;
  const deliveredCount = unifiedJobs.filter(j => (selectedLabId === 'all' || !selectedLabId || j.labId === selectedLabId) && (j.status === 'Entregado' || (j.status as any) === 'Completado')).length;

  const handlePrintJob = (jobToPrint: (LabJob & { order?: any; doctor?: string; branch?: string; isInternalWorkshop?: boolean })) => {
    // Si el trabajo no tiene todos los campos de cliente o receta resueltos, los buscamos de la orden
    const matchedOrder = jobToPrint.order || orders.find(o => o.id && o.id.trim().toLowerCase() === (jobToPrint.orderId || '').trim().toLowerCase());
    const clientObj = clients.find(c => 
      (c.id && String(c.id) === String(matchedOrder?.clientId)) ||
      (c.dni && matchedOrder?.clientId && c.dni.trim() === String(matchedOrder.clientId).trim()) ||
      (c.name && jobToPrint.clientName && c.name.trim().toLowerCase() === jobToPrint.clientName.trim().toLowerCase())
    );
    const rx = jobToPrint.prescription || matchedOrder?.prescriptionDetails;
    const cd = jobToPrint.crystalDetails || rx?.selectedCrystalItem;
    const clientName = jobToPrint.clientName || clientObj?.name || matchedOrder?.clientName || 'Cliente';
    const clientDni = jobToPrint.clientDni || clientObj?.dni || '';
    const doctor = jobToPrint.doctor || matchedOrder?.medico || 'No especificado';
    const labName = jobToPrint.labName || rx?.assignedLab?.name || 'Laboratorio Externo / Taller';
    const deliveryDateStr = jobToPrint.estimatedLabDeliveryDate || (matchedOrder?.prescriptionDetails as any)?.deliveryDate || (matchedOrder as any)?.deliveryDate || '';
    
    // Tratamientos
    let trts = '';
    if (jobToPrint.treatments && jobToPrint.treatments.length > 0) {
      trts = jobToPrint.treatments.map(t => typeof t === 'string' ? t : (t as any)?.name).filter(Boolean).join(', ');
    } else if (rx?.selectedTreatments && rx.selectedTreatments.length > 0) {
      trts = rx.selectedTreatments.map((t: any) => typeof t === 'string' ? t : t?.name).filter(Boolean).join(', ');
    }

    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) return;

    const logoHtml = opticaLogo
      ? `<img src="${opticaLogo}" alt="Logo" style="max-height:60px;max-width:160px;object-fit:contain;" />`
      : `<div style="font-size:22px;font-weight:900;color:#1e3a8a;">${opticaName || 'Óptica'}</div>`;
    const infoLine = [opticaPhone, opticaAddress].filter(Boolean).join(' &nbsp;|&nbsp; ');

    const lejosOD = rx?.lejosOD;
    const lejosOI = rx?.lejosOI;
    const cercaOD = rx?.cercaOD;
    const cercaOI = rx?.cercaOI;
    const hasRx = !!(lejosOD || lejosOI || cercaOD || cercaOI || rx?.adicionOD || rx?.adicionOI);

    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Orden de Laboratorio - ${jobToPrint.orderId || jobToPrint.id}</title>
        <style>
          @page { size: A4; margin: 15mm 18mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #111; background: #fff; padding: 20px; }
          .page { width: 100%; max-width: 820px; margin: 0 auto; }
          
          /* Encabezado */
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 16px; }
          .header-left .info-line { font-size: 10px; color: #555; margin-top: 4px; }
          .header-right { text-align: right; }
          .order-num { font-size: 24px; font-weight: 900; color: #1e3a8a; line-height: 1; }
          .order-type { font-size: 12px; font-weight: 700; color: #334155; margin-top: 2px; }
          .order-dates { font-size: 10px; color: #555; margin-top: 4px; line-height: 1.5; }
          .delivery-badge { background: #dcfce7; color: #166534; font-weight: 800; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 4px; }
          
          /* Barra de datos principales */
          .patient-bar { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
          .patient-name { font-size: 16px; font-weight: 900; color: #0f172a; }
          .patient-label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.06em; margin-bottom: 2px; }
          .lab-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; }
          
          /* Grillas y Secciones */
          .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #1e3a8a; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 3px; margin-bottom: 8px; margin-top: 14px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; }
          .info-card { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; padding: 8px 10px; }
          .info-card .label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
          .info-card .val { font-size: 12px; font-weight: 700; color: #1e293b; }
          
          /* Tabla de Receta */
          .presc-table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 14px; }
          .presc-table th { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #475569; background: #f1f5f9; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; }
          .presc-table th:first-child { text-align: left; padding-left: 8px; }
          .presc-table td { text-align: center; padding: 6px 4px; font-size: 12px; font-weight: 600; border: 1px solid #cbd5e1; }
          .presc-table td:first-child { text-align: left; font-weight: 700; background: #f8fafc; padding-left: 8px; }
          
          /* Observaciones */
          .obs-box { border: 1.5px dashed #94a3b8; border-radius: 6px; padding: 10px 12px; margin-top: 14px; background: #fcfcfc; }
          
          /* Firmas */
          .footer { margin-top: 36px; padding-top: 14px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; }
          .sign-block { text-align: center; }
          .sign-line { border-top: 1px solid #000; width: 180px; padding-top: 4px; font-size: 9px; color: #475569; margin-top: 40px; }
          
          .no-print { margin-top: 24px; text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
          .btn { padding: 8px 24px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; }
          .btn-print { background: #1e3a8a; color: #fff; margin-right: 10px; }
          .btn-close { background: #e2e8f0; color: #334155; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="header-left">
              ${logoHtml}
              ${infoLine ? `<div class="info-line">${infoLine}</div>` : '<div class="info-line">Óptica Paracao · Laboratorio de Calibrado y Taller</div>'}
            </div>
            <div class="header-right">
              <div class="order-num">${jobToPrint.orderId || jobToPrint.id}</div>
              <div class="order-type">ORDEN DE TRABAJO A LABORATORIO</div>
              <div class="order-dates">
                Fecha emisión: ${new Date(jobToPrint.date + 'T12:00:00').toLocaleDateString('es-AR')}<br/>
                ${deliveryDateStr ? `<span class="delivery-badge">⏰ Entrega: ${new Date(deliveryDateStr + 'T12:00:00').toLocaleDateString('es-AR')}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="patient-bar">
            <div>
              <div class="patient-label">Paciente / Cliente</div>
              <div class="patient-name">${clientName} ${clientDni ? `(DNI: ${clientDni})` : ''}</div>
              <div style="font-size: 11px; color: #475569; margin-top: 2px;">Médico Prescriptor: <strong>${doctor}</strong></div>
            </div>
            <div style="text-align: right;">
              <div class="patient-label">Laboratorio Destino</div>
              <div class="lab-badge">🔬 ${labName}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Estado: <strong>${jobToPrint.status}</strong></div>
            </div>
          </div>

          ${hasRx ? `
          <div class="section-title">Graduación Oftálmica (${rx?.type || (rx as any)?.prescriptionType || 'Receta'})</div>
          <table class="presc-table">
            <thead>
              <tr>
                <th style="width: 140px;">Ojo</th>
                <th>Esférico</th>
                <th>Cilíndrico</th>
                <th>Eje</th>
                <th>Adición</th>
                <th>Altura</th>
                <th>D.I.P.</th>
                <th>A.P.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Derecho (OD)</td>
                <td>${lejosOD?.esf || cercaOD?.esf || '—'}</td>
                <td>${lejosOD?.cil || cercaOD?.cil || '—'}</td>
                <td>${lejosOD?.eje || cercaOD?.eje ? `${lejosOD?.eje || cercaOD?.eje}°` : '—'}</td>
                <td>${rx?.adicionOD ? `+${rx.adicionOD}` : '—'}</td>
                <td>${rx?.alturaOD ? `${rx.alturaOD} mm` : '—'}</td>
                <td>${rx?.diOD ? `${rx.diOD} mm` : '—'}</td>
                <td>${rx?.apOD ? `${rx.apOD} mm` : '—'}</td>
              </tr>
              <tr>
                <td>Izquierdo (OI)</td>
                <td>${lejosOI?.esf || cercaOI?.esf || '—'}</td>
                <td>${lejosOI?.cil || cercaOI?.cil || '—'}</td>
                <td>${lejosOI?.eje || cercaOI?.eje ? `${lejosOI?.eje || cercaOI?.eje}°` : '—'}</td>
                <td>${rx?.adicionOI ? `+${rx.adicionOI}` : '—'}</td>
                <td>${rx?.alturaOI ? `${rx.alturaOI} mm` : '—'}</td>
                <td>${rx?.diOI ? `${rx.diOI} mm` : '—'}</td>
                <td>${rx?.apOI ? `${rx.apOI} mm` : '—'}</td>
              </tr>
            </tbody>
          </table>
          ` : ''}

          <div class="section-title">Especificaciones Técnicas del Trabajo</div>
          <div class="grid-3">
            <div class="info-card">
              <div class="label">Cristal / Servicio</div>
              <div class="val">${cd?.name || jobToPrint.concept || 'Cristal Óptico'}</div>
            </div>
            <div class="info-card">
              <div class="label">Material / Índice</div>
              <div class="val">${cd?.material || 'Orgánico'} ${cd?.index ? `(Índice ${cd.index})` : ''}</div>
            </div>
            <div class="info-card">
              <div class="label">Ojos Cotizados</div>
              <div class="val" style="text-transform: uppercase;">${cd?.eyes || 'Ambos'}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="info-card">
              <div class="label">Tratamientos Especiales</div>
              <div class="val">${trts || 'Ninguno / Estándar'}</div>
            </div>
            <div class="info-card">
              <div class="label">Armazón / Montura</div>
              <div class="val">${matchedOrder?.frame?.name || matchedOrder?.frame?.model || 'Armazón del cliente / en taller'}</div>
            </div>
          </div>

          ${(jobToPrint.observaciones || (matchedOrder as any)?.notes) ? `
          <div class="obs-box">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 4px;">Observaciones Técnicas / Biselado</div>
            <div style="font-size: 11px; font-style: italic; color: #1e293b;">${jobToPrint.observaciones || (matchedOrder as any)?.notes}</div>
          </div>
          ` : ''}

          <div class="footer">
            <div class="sign-block">
              <div class="sign-line">Firma y Sello Óptica</div>
            </div>
            <div class="sign-block">
              <div class="sign-line">Recibido en Laboratorio (Firma/Fecha)</div>
            </div>
          </div>
        </div>

        <div class="no-print">
          <button class="btn btn-print" onclick="window.print()">🖨️ Imprimir Pedido</button>
          <button class="btn btn-close" onclick="window.close()">Cerrar</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
  };

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
    status: 'En Taller' as any,
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
    const targetLabId = (selectedLabId === 'all' || !selectedLabId) ? (labs[0]?.id || 'lab-general') : selectedLabId;
    const labObj = labs.find(l => l.id === targetLabId);

    const trimmedOrderId = newJob.orderId.trim();
    if (jobs.some(j => j.orderId.trim().toLowerCase() === trimmedOrderId.toLowerCase())) {
      alert(`El número de pedido "${trimmedOrderId}" ya existe. Por favor ingrese un número único.`);
      return;
    }

    if (modalMode === 'crystal') {
      const autoConcept = newJob.concept.trim() || `${crystalForm.lensType} ${crystalForm.material} ${crystalForm.index} - ${crystalForm.brand}`;
      
      addJob({
        labId: targetLabId,
        labName: labObj?.name || 'Laboratorio',
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
        labId: targetLabId,
        labName: labObj?.name || 'Laboratorio',
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
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Laboratorio Asignado
            </label>
            <select 
              className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-bold"
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
            >
              <option value="all">🌐 Todos los Laboratorios y Talleres</option>
              <option value="taller-propio">🏠 Taller Propio / Sin Laboratorio asignado</option>
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>🔬 {lab.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Filtrar por Mes
              </label>
              <button 
                type="button"
                onClick={() => setFilterByPeriod(!filterByPeriod)}
                className={cn(
                  "text-[10px] font-black uppercase px-2 py-0.5 rounded transition-all cursor-pointer",
                  filterByPeriod 
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {filterByPeriod ? "✓ Mes Activo" : "Ver Histórico Completo"}
              </button>
            </div>
            <input 
              className={cn(
                "w-full h-11 px-3 rounded-lg border bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none transition-all",
                filterByPeriod 
                  ? "border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white" 
                  : "border-slate-200 dark:border-slate-800 text-slate-400 opacity-60"
              )} 
              type="month" 
              value={period}
              disabled={!filterByPeriod}
              onChange={(e) => {
                setPeriod(e.target.value);
                setFilterByPeriod(true);
              }}
            />
          </div>

          <button 
            type="button"
            onClick={() => setFilterByPeriod(true)}
            className="h-11 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" /> Aplicar Filtro
          </button>
        </div>

        {/* Status Quick Filter Tabs */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center text-xs">
          <span className="text-[11px] font-black text-slate-400 uppercase mr-1">Estado de Trabajos:</span>
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeStatusFilter === 'all'
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750"
            )}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-current">{unifiedJobs.length}</span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('pendientes')}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeStatusFilter === 'pendientes'
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/60"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En Taller / Producción</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">{pendingCount}</span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('para_retirar')}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeStatusFilter === 'para_retirar'
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-900/60"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Listos para Retirar</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">{readyCount}</span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('entregados')}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeStatusFilter === 'entregados'
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/60"
            )}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Entregados</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">{deliveredCount}</span>
          </button>
        </div>
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
                let statusClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900';
                let statusIcon = <Clock className="w-3 h-3 text-amber-600" />;
                
                if (job.status === 'Demorado') {
                  statusClasses = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900';
                  statusIcon = <AlertTriangle className="w-3 h-3 text-red-500" />;
                } else if (job.status === 'Para Retirar' || job.status === 'Recibido') {
                  statusClasses = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
                  statusIcon = <CheckCircle2 className="w-3 h-3 text-blue-500" />;
                } else if (job.status === 'Entregado' || job.status === 'Completado') {
                  statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900';
                  statusIcon = <CheckCircle className="w-3 h-3 text-emerald-500" />;
                } else {
                  statusClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900';
                  statusIcon = <Clock className="w-3 h-3 text-amber-600" />;
                }

                return (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(job.date + 'T00:00:00').toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{job.orderId}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      <div className="font-medium text-slate-900 dark:text-white">{job.concept}</div>
                      {selectedLabId === 'all' && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded w-fit">
                          <FlaskConical className="w-3 h-3" />
                          <span>{job.labName || 'Laboratorio'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${job.cost.toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-flex items-center group">
                        <select
                          value={job.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as any;
                            updateJobStatus(job.id, newStatus);
                          }}
                          className={cn(
                            "appearance-none cursor-pointer inline-flex items-center gap-1.5 pl-3 pr-6 py-1 rounded-full text-xs font-bold border transition-all shadow-sm outline-none hover:opacity-90 hover:scale-[1.02] focus:ring-2 focus:ring-blue-500/50",
                            statusClasses
                          )}
                          title="Hacé clic para cambiar el estado de este pedido"
                        >
                          <option value="En Taller" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">🟡 En Taller</option>
                          <option value="Demorado" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">🔴 Demorado</option>
                          <option value="Para Retirar" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">🔵 Para Retirar</option>
                          <option value="Entregado" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">🟢 Entregado</option>
                        </select>
                        <div className="pointer-events-none absolute right-2 flex items-center text-current opacity-70">
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </div>
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
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handlePrintJob(job)}
                          title="Imprimir Pedido a Laboratorio"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => setActiveJobDetails(job)}
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ficha Técnica
                        </button>
                      </div>
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
                        <option value="En Taller">🟡 En Taller</option>
                        <option value="Demorado">🔴 Demorado</option>
                        <option value="Para Retirar">🔵 Para Retirar</option>
                        <option value="Entregado">🟢 Entregado</option>
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

              {/* Receta Oftálmica */}
              {(() => {
                const rx = activeJobDetails.prescription || activeJobDetails.order?.prescriptionDetails;
                const rxType = (rx?.type || rx?.prescriptionType || activeJobDetails.order?.type || 'Receta Oftálmica').toUpperCase();
                
                return (
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase tracking-wide">
                      Receta Oftálmica ({rxType})
                    </h4>
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
                            const lejos = isOD ? rx?.lejosOD : rx?.lejosOI;
                            const cerca = isOD ? rx?.cercaOD : rx?.cercaOI;
                            const add = isOD ? rx?.adicionOD : rx?.adicionOI;
                            const alt = isOD ? rx?.alturaOD : rx?.alturaOI;
                            const di = isOD ? rx?.diOD : rx?.diOI;
                            const ap = isOD ? rx?.apOD : rx?.apOI;

                            return (
                              <tr key={label} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                                <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 font-bold text-left">{label}</td>
                                <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{lejos?.esf || cerca?.esf || '—'}</td>
                                <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{lejos?.cil || cerca?.cil || '—'}</td>
                                <td className="px-2 py-2 border-r border-slate-100 dark:border-slate-850 text-slate-850 dark:text-slate-350">{lejos?.eje || cerca?.eje ? `${lejos?.eje || cerca?.eje}°` : '—'}</td>
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
                );
              })()}

              {/* Detalles del Cristal y Tratamientos Cotizados */}
              {(() => {
                const rx = activeJobDetails.order?.prescriptionDetails;
                const crystal = activeJobDetails.crystalDetails || (rx?.selectedCrystalItem ? {
                  name: rx.selectedCrystalItem.name || activeJobDetails.order?.service || activeJobDetails.concept || 'Cristal Oftálmico',
                  material: rx.selectedCrystalItem.material || 'Orgánico',
                  index: rx.selectedCrystalItem.index || '1.49',
                  eyes: rx.selectedOjos || rx.eyesCharged || 'ambos'
                } : {
                  name: activeJobDetails.order?.service || activeJobDetails.concept || 'Cristal Oftálmico',
                  material: 'Orgánico',
                  index: '1.49',
                  eyes: 'ambos'
                });

                const treatmentsList = (activeJobDetails.treatments && activeJobDetails.treatments.length > 0)
                  ? activeJobDetails.treatments
                  : (rx?.selectedTreatments || []);

                return (
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase tracking-wide">
                      Cristal y Tratamientos Cotizados
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                      <div>
                        <span className="text-slate-400 block mb-0.5 font-bold">Cristal Seleccionado</span>
                        <span className="text-slate-850 dark:text-white font-bold">{crystal.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Material</span>
                        <span className="text-slate-855 dark:text-white font-bold">{crystal.material || 'Orgánico'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Índice</span>
                        <span className="text-slate-855 dark:text-white font-bold">{crystal.index || '1.49'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Ojos Cotizados</span>
                        <span className="text-slate-855 dark:text-white font-bold uppercase">{crystal.eyes || 'AMBOS'}</span>
                      </div>
                    </div>
                    
                    {treatmentsList && treatmentsList.length > 0 && (
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-905 rounded-xl">
                        <span className="font-bold text-[10px] text-emerald-800 dark:text-emerald-450 block uppercase mb-1">Tratamientos Aplicados</span>
                        <div className="flex flex-wrap gap-1.5">
                          {treatmentsList.map((t: any) => {
                            const tName = typeof t === 'string' ? t : (t?.name || t?.title || String(t));
                            return (
                              <span key={tName} className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold shadow-sm">{tName}</span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Información Adicional de la Orden Vinculada */}
              {activeJobDetails.order && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                      <Glasses className="w-4 h-4" />
                      <span>Información Comercial del Pedido</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Tipo: {activeJobDetails.order.type?.toUpperCase() || 'TRABAJO ÓPTICO'}
                    </span>
                  </div>
                  {activeJobDetails.doctor && (
                    <p className="text-slate-600 dark:text-slate-400">
                      Médico Oftalmólogo: <span className="font-bold text-slate-900 dark:text-white">{activeJobDetails.doctor}</span>
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Total Venta</span>
                      <span className="font-bold text-slate-900 dark:text-white">${activeJobDetails.order.amount?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Abonado</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-450">${activeJobDetails.order.paid?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Saldo Restante</span>
                      <span className="font-bold text-amber-600 dark:text-amber-450">${((activeJobDetails.order.amount || 0) - (activeJobDetails.order.paid || 0)).toLocaleString()}</span>
                    </div>
                  </div>
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
                  <option value="En Taller">🟡 En Taller</option>
                  <option value="Demorado">🔴 Demorado</option>
                  <option value="Para Retirar">🔵 Para Retirar</option>
                  <option value="Entregado">🟢 Entregado</option>
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              {activeJobDetails.order ? (
                <button
                  type="button"
                  onClick={() => {
                    const ord = activeJobDetails.order;
                    setActiveJobDetails(null);
                    navigate('/clients', {
                      state: {
                        clientId: ord.clientId,
                        clientName: ord.clientName,
                        openModal: 'orders',
                        openOrderId: ord.id
                      }
                    });
                  }}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver en Historial del Cliente</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintJob(activeJobDetails)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Ficha para Laboratorio</span>
                </button>

                <button 
                  onClick={() => setActiveJobDetails(null)} 
                  className="px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg font-bold shadow-sm hover:opacity-90 transition-opacity text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
