import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, CartItem } from "../context/CartContext";
import { useFinance } from "../context/FinanceContext";
import { useClients } from "../context/ClientContext";
import { useSettings } from "../context/SettingsContext";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Building, 
  Wallet, 
  User, 
  X, 
  Check, 
  ChevronDown, 
  Eye, 
  Sparkles, 
  AlertCircle,
  Edit,
  Printer
} from "lucide-react";
import { cn } from "../lib/utils";

export function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    selectedClient, 
    setSelectedClient, 
    paymentMethodId, 
    setPaymentMethodId, 
    checkout,
    setIsCartOpen
  } = useCart();

  const { boxes } = useFinance();
  const { clients } = useClients();
  const { receiptPaperSize, opticaName, opticaAddress, opticaPhone, opticaLogo } = useSettings();

  const [activeCategory, setActiveCategory] = useState<string | null>("cash");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    client.dni.includes(clientSearch)
  );

  const toggleExpandItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (total * discountPercent) / 100;
  const finalTotal = Math.max(0, total - discountAmount);
  const subtotal = total;

  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Seña / Pago parcial states
  const [isPartial, setIsPartial] = useState(false);
  const [senaAmount, setSenaAmount] = useState<number | string>(0);
  const [previstoBoxId, setPrevistoBoxId] = useState<string>('');

  const handlePrintReceipt = (receipt: any, forcedFormat?: 'a4' | 'ticket') => {
    if (!receipt) return;
    const format = forcedFormat || receiptPaperSize || 'a4';
    const isA4 = format === 'a4';

    const win = window.open('', '_blank', isA4 ? 'width=900,height=900' : 'width=450,height=750');
    if (!win) {
      window.print();
      return;
    }

    const businessName = opticaName || "ÓPTICA PARACAO";
    const businessAddress = opticaAddress || "Paraná, Entre Ríos";
    const businessPhone = opticaPhone || "";

    // Prescription Items
    const prescriptionItems = receipt.items.filter((item: any) => item.type === 'prescription');
    const hasPrescription = prescriptionItems.length > 0;

    if (isA4) {
      // HTML template for A4 format
      const itemsRowsA4 = receipt.items.map((item: any, idx: number) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 9px 8px; font-weight: 600; color: #1e293b;">${idx + 1}</td>
          <td style="padding: 9px 8px;">
            <div style="font-weight: 700; color: #0f172a; font-size: 12px;">${item.name}</div>
            ${item.type === 'prescription' ? '<span style="display:inline-block; margin-top:2px; font-size:10px; font-weight:700; color:#2563eb; background:#eff6ff; padding:2px 6px; border-radius:4px;">Trabajo de Laboratorio / Óptica Recetada</span>' : ''}
          </td>
          <td style="padding: 9px 8px; text-align: center; font-weight: 600;">${item.quantity}</td>
          <td style="padding: 9px 8px; text-align: right; font-weight: 600;">$${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 9px 8px; text-align: right; font-weight: 700; color: #0f172a;">$${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

      // Build prescription technical blocks for A4
      const prescriptionBlocksA4 = prescriptionItems.map((item: any, pIdx: number) => {
        const details = item.prescriptionDetails || {};
        const client = details.client;
        const frame = details.selectedFrame;
        const crystal = details.selectedCrystal;

        // Measures
        const od = parseFloat(details.diOD) || 0;
        const oi = parseFloat(details.diOI) || 0;
        const totalDi = od + oi;

        return `
          <div style="margin-top: 18px; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 14px 16px; background: #fafafa; break-inside: avoid;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-bottom: 12px;">
              <h3 style="font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.04em;">
                🔬 Ficha Técnica de Receta Óptica ${prescriptionItems.length > 1 ? `(#${pIdx + 1})` : ''} - ${item.name}
              </h3>
              ${details.medico ? `<span style="font-size: 11px; font-weight: 600; color: #475569;">👨‍⚕️ Médico Oftalmólogo: <strong style="color:#0f172a;">${details.medico}</strong></span>` : ''}
            </div>

            <!-- Graduaciones OD / OI -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px;">
              <thead>
                <tr style="background: #e2e8f0; text-align: center; font-size: 10px; text-transform: uppercase; color: #475569;">
                  <th style="padding: 6px 8px; text-align: left; width: 22%;">Ojo / Sección</th>
                  <th style="padding: 6px 8px; width: 15%;">Esfera (Esf)</th>
                  <th style="padding: 6px 8px; width: 15%;">Cilindro (Cil)</th>
                  <th style="padding: 6px 8px; width: 15%;">Eje (°)</th>
                  <th style="padding: 6px 8px; width: 15%;">Adición (Add)</th>
                  <th style="padding: 6px 8px; width: 18%;">DI / Altura</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0; text-align: center;">
                  <td style="padding: 7px 8px; text-align: left; font-weight: 700; color: #1e3a8a; background: #f1f5f9;">OJO DERECHO (OD)</td>
                  <td style="padding: 7px 8px; font-weight: 700;">${details.lejosOD?.esfera || details.cercaOD?.esfera || '-'}</td>
                  <td style="padding: 7px 8px; font-weight: 700;">${details.lejosOD?.cilindro || details.cercaOD?.cilindro || '-'}</td>
                  <td style="padding: 7px 8px; font-weight: 700;">${details.lejosOD?.eje || details.cercaOD?.eje || '-'}°</td>
                  <td style="padding: 7px 8px; font-weight: 700;">${details.adicionOD || '-'}</td>
                  <td style="padding: 7px 8px; font-weight: 600; color: #334155;">
                    DI: ${details.diOD || '-'} mm ${details.apOD ? `| AP: ${details.apOD} mm` : ''}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0; text-align: center;">
                  <td style="padding: 7px 8px; text-align: left; font-weight: 700; color: #1e3a8a; background: #f1f5f9;">OJO IZQUIERDO (OI)</td>
                  <td style="padding: 7px 8px; font-weight: 700;">${details.lejosOI?.esfera || details.cercaOI?.esfera || '-'}</td>
                  <td style="padding: 7px 8px; font-weight: 700;">${details.lejosOI?.cilindro || details.cercaOI?.cilindro || '-'}</td>
                  <td style="padding: 7px 8px; font-weight: 700;">${details.lejosOI?.eje || details.cercaOI?.eje || '-'}°</td>
                  <td style="padding: 7px 8px; font-weight: 700;">${details.adicionOI || '-'}</td>
                  <td style="padding: 7px 8px; font-weight: 600; color: #334155;">
                    DI: ${details.diOI || '-'} mm ${details.apOI ? `| AP: ${details.apOI} mm` : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Armazón, Cristales y Tratamientos -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px; margin-top: 8px;">
              <div style="background: #fff; border: 1px solid #e2e8f0; padding: 8px 10px; border-radius: 6px;">
                <div style="font-weight: 700; color: #475569; font-size: 10px; text-transform: uppercase;">Armazón Seleccionado</div>
                <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">
                  ${frame ? (frame.name || `${frame.brand || ''} ${frame.model || ''}`) : (details.ownFrame ? 'Armazón Propio del Paciente' : 'No especificado')}
                </div>
                ${frame?.color ? `<div style="color: #64748b; font-size: 10px;">Color: ${frame.color}</div>` : ''}
              </div>

              <div style="background: #fff; border: 1px solid #e2e8f0; padding: 8px 10px; border-radius: 6px;">
                <div style="font-weight: 700; color: #475569; font-size: 10px; text-transform: uppercase;">Cristales y Tratamiento</div>
                <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">
                  ${crystal ? crystal.name : (details.prescriptionType || 'Monofocal')}
                </div>
                <div style="color: #64748b; font-size: 10px;">
                  ${[
                    details.material ? `Mat: ${details.material}` : '',
                    details.diseno ? `Diseño: ${details.diseno}` : '',
                    details.lensColor ? `Color: ${details.lensColor}` : '',
                    details.selectedTreatments && details.selectedTreatments.length ? `Tratamientos: ${details.selectedTreatments.join(', ')}` : ''
                  ].filter(Boolean).join(' | ')}
                </div>
              </div>
            </div>

            ${(details.observaciones || details.deliveryDate) ? `
              <div style="margin-top: 8px; font-size: 10.5px; background: #fff; border: 1px dashed #cbd5e1; padding: 8px 10px; border-radius: 6px;">
                ${details.deliveryDate ? `<span style="font-weight: 700; color: #059669;">📅 Fecha Estimada de Entrega: ${new Date(details.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR')}</span> ` : ''}
                ${details.observaciones ? `<div style="color: #475569; margin-top: 2px;"><strong>Observaciones de Taller:</strong> ${details.observaciones}</div>` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      win.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Comprobante de Venta - ${receipt.id}</title>
          <style>
            @page { size: A4; margin: 15mm 16mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #1e293b; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 14px; margin-bottom: 16px; }
            .brand-name { font-size: 22px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.02em; }
            .brand-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
            .doc-info { text-align: right; }
            .doc-title { font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
            .doc-number { font-size: 16px; font-weight: 900; color: #2563eb; margin-top: 2px; }
            .doc-date { font-size: 11px; color: #64748b; margin-top: 2px; }
            
            .patient-box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 4px solid #1e3a8a; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; }
            .patient-name { font-size: 16px; font-weight: 900; color: #0f172a; }
            .patient-details { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 6px; font-size: 11px; color: #475569; }

            .table-items { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11.5px; }
            .table-items th { background: #1e3a8a; color: #fff; font-size: 10px; text-transform: uppercase; font-weight: 700; padding: 8px; text-align: left; }
            
            .financial-card { margin-top: 18px; border: 2px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; background: #fff; }
            .fin-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 12px; }
            .fin-row.total-main { font-size: 16px; font-weight: 900; color: #0f172a; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1; padding: 8px 0; margin: 6px 0; }
            .fin-row.highlight-sena { background: #eff6ff; padding: 8px 12px; border-radius: 6px; margin-top: 6px; font-size: 13px; font-weight: 800; color: #1d4ed8; }
            .fin-row.highlight-debt { background: #fef2f2; padding: 8px 12px; border-radius: 6px; margin-top: 6px; font-size: 15px; font-weight: 900; color: #b91c1c; }
            .fin-row.highlight-paid { background: #f0fdf4; padding: 8px 12px; border-radius: 6px; margin-top: 6px; font-size: 13px; font-weight: 800; color: #15803d; text-align: center; display: block; }

            .footer-sign { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 14px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #64748b; }
            .sign-box { width: 200px; text-align: center; }
            .sign-line { border-top: 1px solid #475569; margin-top: 38px; padding-top: 4px; font-size: 10px; font-weight: 600; color: #334155; }

            .no-print { text-align: center; margin-top: 24px; }
            .btn { padding: 9px 22px; font-weight: bold; cursor: pointer; border: none; border-radius: 6px; margin: 0 4px; font-size: 12px; }
            .btn-primary { background: #1e3a8a; color: #fff; }
            .btn-secondary { background: #f1f5f9; color: #333; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand-name">${businessName}</h1>
              <div class="brand-sub">${businessAddress}</div>
              ${businessPhone ? `<div class="brand-sub">Tel: ${businessPhone}</div>` : ''}
            </div>
            <div class="doc-info">
              <div class="doc-title">Comprobante de Venta y Trabajo</div>
              <div class="doc-number">N° ${receipt.id}</div>
              <div class="doc-date">Fecha: ${receipt.date} &bull; Hora: ${receipt.time}</div>
            </div>
          </div>

          <div class="patient-box">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 0.05em;">Datos del Paciente / Cliente</div>
            <div class="patient-name">${receipt.clientName}</div>
            <div class="patient-details">
              ${receipt.clientDni ? `<div><strong>DNI:</strong> ${receipt.clientDni}</div>` : ''}
              ${receipt.clientPhone ? `<div><strong>Teléfono:</strong> ${receipt.clientPhone}</div>` : ''}
              ${receipt.clientAddress ? `<div><strong>Dirección:</strong> ${receipt.clientAddress}</div>` : ''}
              ${receipt.clientInsurance ? `<div><strong>Obra Social:</strong> ${receipt.clientInsurance}</div>` : ''}
              <div><strong>Forma de Pago:</strong> ${receipt.paymentMethod}</div>
            </div>
          </div>

          <!-- Tabla de Artículos y Servicios -->
          <table class="table-items">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 55%;">Descripción del Ítem / Servicio</th>
                <th style="width: 10%; text-align: center;">Cant.</th>
                <th style="width: 15%; text-align: right;">Precio Unit.</th>
                <th style="width: 15%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsA4}
            </tbody>
          </table>

          <!-- Bloques de Receta Óptica (si corresponde) -->
          ${prescriptionBlocksA4}

          <!-- Resumen Financiero y Seña -->
          <div class="financial-card">
            <div class="fin-row">
              <span style="color: #64748b;">Subtotal Productos y Servicios:</span>
              <span style="font-weight: 700;">$${receipt.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>

            ${receipt.discountPercent > 0 ? `
              <div class="fin-row" style="color: #059669; font-weight: 700;">
                <span>Descuento aplicado (${receipt.discountPercent}%):</span>
                <span>-$${receipt.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            ` : ''}

            <div class="fin-row total-main">
              <span>TOTAL DEL VALOR DE VENTA:</span>
              <span style="color: #1e3a8a;">$${receipt.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>

            ${receipt.isPartial ? `
              <div class="fin-row highlight-sena">
                <span>SEÑA A DESCONTAR (Abonado Hoy):</span>
                <span>-$${receipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="fin-row highlight-debt">
                <span>TOTAL ADEUDADO / SALDO A PAGAR:</span>
                <span>$${receipt.remainingBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              ${receipt.previstoBoxName ? `<div style="font-size: 10px; color: #64748b; margin-top: 4px; text-align: right;">Previsto a cancelar en: <strong>${receipt.previstoBoxName}</strong> al retirar</div>` : ''}
            ` : `
              <div class="highlight-paid">
                ✓ TOTALMENTE ABONADO EN EL ACTO ($${receipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
              </div>
            `}
          </div>

          <div class="footer-sign">
            <div class="sign-box">
              <div class="sign-line">Firma y Aclaración Cliente</div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Conformidad de solicitud y encargo</div>
            </div>
            <div class="sign-box">
              <div class="sign-line">Por ${businessName}</div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Comprobante de Control / Laboratorio</div>
            </div>
          </div>

          <div class="no-print">
            <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir Hoja A4</button>
            <button class="btn btn-secondary" onclick="window.close()">Cerrar</button>
          </div>
        </body>
        </html>
      `);
    } else {
      // Thermal 80mm format
      const itemsRowsThermal = receipt.items.map((item: any) => {
        let detailsText = '';
        if (item.type === 'prescription' && item.prescriptionDetails) {
          const d = item.prescriptionDetails;
          detailsText = `
            <div style="font-size: 9px; color: #333; margin: 3px 0 4px 6px; border-left: 2px solid #555; padding-left: 4px;">
              ${d.medico ? `<div>Médico: ${d.medico}</div>` : ''}
              ${(d.lejosOD || d.cercaOD) ? `<div>OD: ${d.lejosOD?.esfera || d.cercaOD?.esfera || '0'} / ${d.lejosOD?.cilindro || d.cercaOD?.cilindro || '0'} x ${d.lejosOD?.eje || d.cercaOD?.eje || '0'}°</div>` : ''}
              ${(d.lejosOI || d.cercaOI) ? `<div>OI: ${d.lejosOI?.esfera || d.cercaOI?.esfera || '0'} / ${d.lejosOI?.cilindro || d.cercaOI?.cilindro || '0'} x ${d.lejosOI?.eje || d.cercaOI?.eje || '0'}°</div>` : ''}
              ${(d.diOD || d.diOI) ? `<div>DI: ${d.diOD || '-'}/${d.diOI || '-'} mm ${d.apOD ? `| AP: ${d.apOD}` : ''}</div>` : ''}
              ${d.selectedFrame ? `<div>Arm: ${d.selectedFrame.name || d.selectedFrame.model || 'Armazón'}</div>` : ''}
              ${d.selectedCrystal ? `<div>Cristal: ${d.selectedCrystal.name || 'Cristal'}</div>` : ''}
            </div>
          `;
        }

        return `
          <div style="margin-bottom: 6px;">
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:11px;">
              <span>${item.quantity}x ${item.name}</span>
              <span>$${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="font-size:10px; color:#555; display:flex; justify-content:space-between;">
              <span>P. Unit: $${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              ${item.type === 'prescription' ? '<span style="font-weight:bold;">(Recetado)</span>' : ''}
            </div>
            ${detailsText}
          </div>
        `;
      }).join('');

      win.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Comprobante - ${receipt.id}</title>
          <style>
            @page { size: auto; margin: 4mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #000; background: #fff; padding: 8px; }
            .receipt { max-width: 330px; margin: 0 auto; }
            .text-center { text-align: center; }
            .title { font-size: 15px; font-weight: bold; margin-bottom: 2px; }
            .subtitle { font-size: 10px; color: #444; }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .double-divider { border-bottom: 2px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px; }
            .bold { font-weight: bold; }
            .highlight-card { background: #f2f2f2; border: 1px solid #bbb; padding: 6px; border-radius: 4px; margin-top: 6px; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; margin: 5px 0; }
            .no-print { text-align: center; margin-top: 14px; }
            .btn { padding: 6px 14px; font-weight: bold; cursor: pointer; border: none; border-radius: 4px; margin: 0 4px; font-size: 11px; }
            .btn-primary { background: #000; color: #fff; }
            .btn-secondary { background: #eee; color: #333; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="text-center">
              <h2 class="title">${businessName}</h2>
              <p class="subtitle">${businessAddress}</p>
              ${businessPhone ? `<p class="subtitle">Tel: ${businessPhone}</p>` : ''}
              <div class="divider"></div>
              <p class="bold" style="font-size: 11px;">COMPROBANTE #${receipt.id}</p>
              <p style="font-size: 9px;">${receipt.date} - ${receipt.time}</p>
            </div>

            <div style="margin-top: 6px;">
              <div class="row">
                <span class="bold">Paciente:</span>
                <span>${receipt.clientName}</span>
              </div>
              ${receipt.clientDni ? `
              <div class="row">
                <span class="bold">DNI:</span>
                <span>${receipt.clientDni}</span>
              </div>` : ''}
              ${receipt.clientPhone ? `
              <div class="row">
                <span class="bold">Tel:</span>
                <span>${receipt.clientPhone}</span>
              </div>` : ''}
              <div class="row">
                <span class="bold">Medio de Pago:</span>
                <span>${receipt.paymentMethod}</span>
              </div>
            </div>

            <div class="divider"></div>
            <p class="bold" style="font-size: 9.5px; margin-bottom: 4px; text-transform: uppercase;">Detalle de Artículos / Servicios:</p>
            ${itemsRowsThermal}

            <div class="divider"></div>
            <div class="row">
              <span>Subtotal:</span>
              <span>$${receipt.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>

            ${receipt.discountPercent > 0 ? `
            <div class="row bold">
              <span>Descuento (${receipt.discountPercent}%):</span>
              <span>-$${receipt.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>` : ''}

            <div class="double-divider"></div>
            <div class="total-row">
              <span>TOTAL VALOR VENTA:</span>
              <span>$${receipt.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>

            ${receipt.isPartial ? `
            <div class="highlight-card">
              <div class="row bold">
                <span>SEÑA A DESCONTAR:</span>
                <span>$${receipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="row bold" style="font-size: 12px; margin-top: 4px; border-top: 1px dashed #777; padding-top: 4px; color: #900;">
                <span>SALDO ADEUDADO:</span>
                <span>$${receipt.remainingBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            ` : `
            <div class="highlight-card" style="text-align: center; font-size: 10px; font-weight: bold;">
              TOTALMENTE ABONADO ($${receipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
            </div>
            `}

            <div class="text-center" style="margin-top: 14px; font-size: 9px; color: #444;">
              <p>*** Conserve este comprobante ***</p>
              <p style="margin-top: 2px;">¡Gracias por su compra y confianza!</p>
            </div>
          </div>

          <div class="no-print">
            <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir Ticket</button>
            <button class="btn btn-secondary" onclick="window.close()">Cerrar</button>
          </div>
        </body>
        </html>
      `);
    }

    win.document.close();
    win.focus();
  };

  const handleCheckoutClick = () => {
    if (isProcessing) return;

    // Verificar si hay cliente en la receta del carrito o cliente seleccionado
    const hasRecipeClient = cart.some(c => c.details?.client);
    if (!selectedClient && !hasRecipeClient) {
      setIsClientModalOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const parsedSena = typeof senaAmount === 'string' ? parseFloat(senaAmount) || 0 : senaAmount;
      const res = isPartial 
        ? checkout(parsedSena, paymentMethodId, previstoBoxId, discountPercent)
        : checkout(undefined, undefined, undefined, discountPercent);
      if (res.receipt) {
        setCompletedReceipt(res.receipt);
        setDiscountPercent(0);
        setIsPartial(false);
        setSenaAmount(0);
      } else {
        alert(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose || (() => setIsCartOpen(false))}
      />

      <aside className={cn(
        "fixed lg:static inset-y-0 right-0 z-50 w-full sm:max-w-md lg:w-[410px] h-full flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden shrink-0 transition-all duration-300 animate-in slide-in-from-right"
      )}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <h2 className="font-black flex items-center gap-2 text-slate-900 dark:text-white text-base">
          <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Carrito & Resumen
        </h2>
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
            {cart.reduce((acc, i) => acc + i.quantity, 0)} ITEMS
          </span>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart List */}
      <div className="flex-1 min-h-[160px] max-h-[48vh] overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-slate-900">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 select-none py-12">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-full mb-3">
              <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            <p className="text-sm font-bold tracking-wide">Tu carrito está vacío</p>
            <p className="text-xs text-slate-400 text-center max-w-[200px] mt-1">
              Agrega productos o carga un recetado para comenzar.
            </p>
          </div>
        ) : (
          cart.map(item => {
            const isExpanded = !!expandedItems[item.id];
            return (
              <div 
                key={item.id} 
                className="flex flex-col p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
              >
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider leading-none",
                        item.type === 'prescription' 
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>
                        {item.type === 'prescription' ? 'Recetado' : 'Producto'}
                      </span>
                      {item.category && (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate" title={item.name}>{item.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u</p>
                    
                    {item.type === 'product' && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between px-1 shrink-0">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-black text-slate-900 dark:text-white">${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {item.type === 'prescription' && item.details && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/30 dark:border-slate-700/30">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => toggleExpandItem(item.id)}
                        className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        {isExpanded ? 'Ocultar Receta' : 'Ver Detalles de Receta'}
                      </button>

                      <button 
                        onClick={() => {
                          setIsCartOpen(false);
                          if (onClose) onClose();
                          navigate(`/orders/edit/${item.id}`);
                        }}
                        className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Editar Recetado
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 text-[10px] bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 animate-in slide-in-from-top-1">
                        {item.details.client && (
                          <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-1">
                            <span className="font-bold text-slate-500">Paciente:</span>
                            <span className="font-black text-slate-700 dark:text-slate-300">{item.details.client.name}</span>
                          </div>
                        )}
                        {item.details.selectedFrame && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500">Armazón:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.details.selectedFrame.name}</span>
                          </div>
                        )}
                        {item.details.selectedCrystal && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500">Cristal:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.details.selectedCrystal.name}</span>
                          </div>
                        )}
                        {item.details.lensColor && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500">Color:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.details.lensColor}</span>
                          </div>
                        )}
                        {item.details.medico && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500">Médico:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.details.medico}</span>
                          </div>
                        )}
                        {(item.details.diOD || item.details.diOI) && (() => {
                          const od = parseFloat(item.details.diOD) || 0;
                          const oi = parseFloat(item.details.diOI) || 0;
                          const total = od + oi;
                          return (
                            <>
                              <div className="flex justify-between border-t border-slate-200/20 dark:border-slate-800/20 pt-1">
                                <span className="font-bold text-slate-500">DI (OD/OI):</span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">
                                  {item.details.diOD || '-'}/{item.details.diOI || '-'} mm
                                </span>
                              </div>
                              {total > 0 && (
                                <div className="flex justify-between">
                                  <span className="font-bold text-slate-500">DI Total:</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-black">
                                    {total} mm
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                        {(item.details.apOD || item.details.apOI) && (
                          <div className="flex justify-between border-t border-slate-200/20 dark:border-slate-800/20 pt-1">
                            <span className="font-bold text-slate-500">Altura Pupilar (OD/OI):</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {item.details.apOD || '-'}/{item.details.apOI || '-'} mm
                            </span>
                          </div>
                        )}
                        {item.details.deliveryDate && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200/20 dark:border-slate-800/20 pt-1">
                            <span>Fecha Entrega:</span>
                            <span>{new Date(item.details.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Checkout Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-3 pb-24 lg:pb-6 custom-scrollbar">
        {/* Money breakdown */}
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Descuento TC-42 */}
          <div className="flex items-center justify-between text-xs gap-2 py-1">
            <span className="font-bold text-slate-600 dark:text-slate-400">Descuento (%)</span>
            <div className="flex items-center gap-1">
              <input 
                type="number"
                min="0"
                max="100"
                value={discountPercent || ''}
                onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                placeholder="0"
                className="w-16 h-7 text-right px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs outline-none focus:ring-1 focus:ring-blue-600"
              />
              <span className="font-bold text-slate-400">%</span>
            </div>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Descuento aplicado</span>
              <span>-${discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2.5">
            <span>TOTAL DE VENTA</span>
            <span className="text-blue-600 dark:text-blue-400">${finalTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Seña Toggle and Inputs */}
        {cart.length > 0 && (
          <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl space-y-3 border border-slate-200 dark:border-slate-850">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPartial} 
                onChange={(e) => {
                  setIsPartial(e.target.checked);
                  if (e.target.checked) {
                    setSenaAmount(Math.round(finalTotal / 2));
                    setPrevistoBoxId(boxes[0]?.id || '');
                  }
                }}
                className="w-4 h-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Registrar Seña / Pago Parcial</span>
            </label>

            {isPartial && (
              <div className="space-y-2.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 animate-in slide-in-from-top-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Monto de Seña ($)</label>
                  <input 
                    type="number" 
                    min="1"
                    max={finalTotal}
                    placeholder="0"
                    value={senaAmount === 0 ? '' : senaAmount} 
                    onFocus={(e) => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setSenaAmount('');
                        return;
                      }
                      const num = parseFloat(val);
                      setSenaAmount(isNaN(num) ? '' : Math.min(finalTotal, num));
                    }}
                    onBlur={() => {
                      const num = parseFloat(String(senaAmount)) || 0;
                      if (num <= 0) {
                        setSenaAmount(Math.min(finalTotal, Math.round(finalTotal / 2) || 1));
                      } else {
                        setSenaAmount(Math.min(finalTotal, Math.max(1, num)));
                      }
                    }}
                    className="w-full h-8 px-2 rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-200"
                  />
                  <p className="text-[10px] font-medium text-slate-500 mt-1">
                    Saldo restante: <span className="font-bold text-slate-800 dark:text-slate-200">${Math.max(0, finalTotal - (parseFloat(String(senaAmount)) || 0)).toLocaleString()}</span>
                  </p>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Caja para la Seña</label>
                  <p className="text-[10px] text-slate-400 leading-tight">Selecciona abajo en "Método de Pago" la caja donde ingresará la seña.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Caja prevista para el Saldo</label>
                  <select 
                    value={previstoBoxId}
                    onChange={e => setPrevistoBoxId(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-[11px] outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-200"
                  >
                    {boxes.map(box => (
                      <option key={box.id} value={box.id}>{box.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods */}
        {cart.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</p>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5 custom-scrollbar">
              {/* Cash Box */}
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                activeCategory === 'cash' ? "border-amber-200 bg-amber-50/20 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800/40 hover:border-slate-200"
              )}>
                <button 
                  onClick={() => setActiveCategory(activeCategory === 'cash' ? null : 'cash')}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Efectivo</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", activeCategory === 'cash' && "rotate-180")} />
                </button>
                {activeCategory === 'cash' && (
                  <div className="p-2 pt-0 grid gap-1.5 animate-in slide-in-from-top-1">
                    {boxes.filter(b => b.type === 'cash').map(box => (
                      <button 
                        key={box.id}
                        onClick={() => setPaymentMethodId(box.id)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all",
                          paymentMethodId === box.id 
                            ? 'border-amber-500 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 opacity-70 hover:opacity-100'
                        )}
                      >
                        <span>{box.name}</span>
                        {paymentMethodId === box.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bank Transfer */}
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                activeCategory === 'bank' ? "border-blue-200 bg-blue-50/20 dark:bg-blue-900/10" : "border-slate-100 dark:border-slate-800/40 hover:border-slate-200"
              )}>
                <button 
                  onClick={() => setActiveCategory(activeCategory === 'bank' ? null : 'bank')}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Transferencia</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", activeCategory === 'bank' && "rotate-180")} />
                </button>
                {activeCategory === 'bank' && (
                  <div className="p-2 pt-0 grid gap-1.5 animate-in slide-in-from-top-1">
                    {boxes.filter(b => b.type === 'bank').map(box => (
                      <button 
                        key={box.id}
                        onClick={() => setPaymentMethodId(box.id)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all",
                          paymentMethodId === box.id 
                            ? 'border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 opacity-70 hover:opacity-100'
                        )}
                      >
                        <span>{box.name}</span>
                        {paymentMethodId === box.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cards */}
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                activeCategory === 'credit_card' ? "border-emerald-200 bg-emerald-50/20 dark:bg-emerald-900/10" : "border-slate-100 dark:border-slate-800/40 hover:border-slate-200"
              )}>
                <button 
                  onClick={() => setActiveCategory(activeCategory === 'credit_card' ? null : 'credit_card')}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tarjeta Crédito/Débito</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", activeCategory === 'credit_card' && "rotate-180")} />
                </button>
                {activeCategory === 'credit_card' && (
                  <div className="p-2 pt-0 grid gap-1.5 animate-in slide-in-from-top-1">
                    {boxes.filter(b => b.type === 'credit_card').map(box => (
                      <button 
                        key={box.id}
                        onClick={() => setPaymentMethodId(box.id)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all",
                          paymentMethodId === box.id 
                            ? 'border-emerald-500 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 opacity-70 hover:opacity-100'
                        )}
                      >
                        <span>{box.name}</span>
                        {paymentMethodId === box.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Billeteras Digitales */}
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                activeCategory === 'digital' ? "border-indigo-200 bg-indigo-50/20 dark:bg-indigo-900/10" : "border-slate-100 dark:border-slate-800/40 hover:border-slate-200"
              )}>
                <button 
                  onClick={() => setActiveCategory(activeCategory === 'digital' ? null : 'digital')}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mercado Pago / Digital</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", activeCategory === 'digital' && "rotate-180")} />
                </button>
                {activeCategory === 'digital' && (
                  <div className="p-2 pt-0 grid gap-1.5 animate-in slide-in-from-top-1">
                    {boxes.filter(b => b.type === 'digital').map(box => (
                      <button 
                        key={box.id}
                        onClick={() => setPaymentMethodId(box.id)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all",
                          paymentMethodId === box.id 
                            ? 'border-indigo-500 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 opacity-70 hover:opacity-100'
                        )}
                      >
                        <span>{box.name}</span>
                        {paymentMethodId === box.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <button 
          disabled={cart.length === 0}
          onClick={handleCheckoutClick}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <CreditCard className="w-5 h-5" />
          Finalizar Venta
        </button>

        {/* Client Selection (Required) */}
        {selectedClient ? (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 animate-in fade-in">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{selectedClient.name}</p>
                <p className="text-[9px] text-blue-600 dark:text-blue-400 font-mono leading-none">{selectedClient.dni}</p>
              </div>
            </div>
            <button onClick={() => setSelectedClient(null)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          cart.length > 0 && (
            <button 
              onClick={() => setIsClientModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Asociar Cliente (Requerido)</span>
            </button>
          )
        )}
      </div>

      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <User className="w-5 h-5 text-blue-600" /> Asociar Cliente para la Venta
                </h3>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                  Selecciona un cliente o elije "Cliente Mostrador" para continuar.
                </p>
              </div>
              <button onClick={() => setIsClientModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input 
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar por nombre o DNI..."
                className="w-full px-3 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-xs"
                autoFocus
              />
              <div className="max-h-56 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.map(client => {
                  const isMostrador = client.id === 'cliente-mostrador' || client.name.toLowerCase() === 'cliente mostrador';
                  return (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setIsClientModalOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs transition-colors",
                        isMostrador && "bg-blue-50/50 dark:bg-blue-900/20"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 dark:text-white">{client.name}</p>
                          {isMostrador && (
                            <span className="text-[9px] font-extrabold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded">
                              Por defecto
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{client.dni}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Receipt Modal / Prompt Impresión */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            
            {/* Header del Modal */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">¡Venta Registrada con Éxito!</h3>
                  <p className="text-[11px] text-emerald-100 font-medium">¿Desea imprimir el comprobante para el cliente?</p>
                </div>
              </div>
              <button 
                onClick={() => setCompletedReceipt(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vista Previa del Ticket / Resumen */}
            <div className="p-5 space-y-3 font-mono text-xs text-slate-700 dark:text-slate-300 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* Encabezado Comercio */}
              <div className="text-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-2.5">
                <p className="font-black text-sm text-slate-900 dark:text-white tracking-wide">ÓPTICA PARACAO</p>
                <p className="text-[10px] text-slate-400">Comprobante de Venta / Resumen</p>
                <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-slate-500">
                  <span className="font-bold">#{completedReceipt.id}</span>
                  <span>•</span>
                  <span>{completedReceipt.date} {completedReceipt.time}</span>
                </div>
              </div>

              {/* Datos Cliente & Pago */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg space-y-1 text-[11px] border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans font-medium">Cliente:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{completedReceipt.clientName}</span>
                </div>
                {completedReceipt.clientDni && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans font-medium">DNI:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{completedReceipt.clientDni}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans font-medium">Medio de Pago:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{completedReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Lista de Items */}
              <div className="border-t border-b border-dashed border-slate-200 dark:border-slate-800 py-2.5 space-y-2">
                <p className="font-bold text-slate-400 text-[10px] uppercase font-sans tracking-wider">Artículos / Servicios:</p>
                {completedReceipt.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-[11px] gap-2">
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity}x {item.name}</span>
                      <div className="text-[10px] text-slate-400">
                        ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
                      </div>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white whitespace-nowrap">
                      ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desglose Financiero */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-bold">${completedReceipt.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>

                {completedReceipt.discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Descuento ({completedReceipt.discountPercent}%):</span>
                    <span>-${completedReceipt.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span>TOTAL VENTA:</span>
                  <span className="text-blue-600 dark:text-blue-400 text-base font-black">
                    ${completedReceipt.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Bloque de Seña / Saldo Restante */}
              {completedReceipt.isPartial ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-amber-800 dark:text-amber-300 font-bold">
                    <span>Seña Dejada (Abonado):</span>
                    <span className="font-black">${completedReceipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-black pt-1 border-t border-amber-200 dark:border-amber-800/40">
                    <span>Saldo Restante Pendiente:</span>
                    <span className="text-sm font-black">${completedReceipt.remainingBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  ✓ Totalmente Abonado (${completedReceipt.paidAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handlePrintReceipt(completedReceipt, 'a4')}
                  className={cn(
                    "flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] border",
                    receiptPaperSize === 'a4'
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-blue-500/20"
                      : "bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                  )}
                  title="Imprimir en tamaño completo A4 con tabla de receta y firmas"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Imprimir A4 {receiptPaperSize === 'a4' ? '(Predet.)' : ''}</span>
                </button>

                <button
                  onClick={() => handlePrintReceipt(completedReceipt, 'ticket')}
                  className={cn(
                    "flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] border",
                    receiptPaperSize === 'ticket'
                      ? "bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white border-slate-900 shadow-sm"
                      : "bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                  )}
                  title="Imprimir en rollo de 80mm térmico"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimir Ticket {receiptPaperSize === 'ticket' ? '(Predet.)' : ''}</span>
                </button>
              </div>

              <button
                onClick={() => setCompletedReceipt(null)}
                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Finalizar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
