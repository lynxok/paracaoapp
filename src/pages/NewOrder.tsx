import React, { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { User, Eye, Check, ArrowLeft, Search, X, Plus, Banknote, Building, CreditCard, Wallet, ChevronDown, ArrowDownToLine, ArrowUpFromLine, FlaskConical, Printer, CalendarDays } from "lucide-react";
import { cn } from "../lib/utils";
import { useFinance } from "../context/FinanceContext";
import { useClients } from "../context/ClientContext";
import { useSettings } from "../context/SettingsContext";
import { useInventory } from "../context/InventoryContext";
import { useLabs } from "../context/LabContext";
import { useCart } from "../context/CartContext";
import { CrystalPricingCondition } from "../types";

export function NewOrder() {
  const { boxes, addTransaction } = useFinance();
  const { clients, addOrder } = useClients();
  const { insurances, lensColors, contactLensColors, opticaLogo, opticaName, opticaPhone, opticaAddress, crystalRules } = useSettings();
  const { inventory, deductStock } = useInventory();
  const { labs, addJob } = useLabs();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  // Helper: evaluate a prescription eye against all crystal rules
  const getCrystalPrice = (esf: number, cil: number, material: string, tratamiento: string): number => {
    const matchingRules = crystalRules.filter(r => r.material === material && r.tratamiento === tratamiento);
    for (const rule of matchingRules) {
      const matches = rule.conditions.some((cond: CrystalPricingCondition) => {
        const absEsf = Math.abs(esf);
        const absCil = Math.abs(cil);
        const inEsfRange = esf >= cond.esfMin && esf <= cond.esfMax;
        const inCilRange = absCil <= cond.cilMax;
        const sumOk = cond.esfPlusCilMax === undefined || (absEsf + absCil) <= cond.esfPlusCilMax;
        return inEsfRange && inCilRange && sumOk;
      });
      if (matches) return rule.precio;
    }
    return 0;
  };
  const isMultifocal = type === 'multifocal';
  const isOccupational = type === 'ocupacional';
  const isContact = type === 'contact';
  const title = isContact ? "Lentes de Contacto" : isMultifocal ? "Multifocales / Bifocales" : isOccupational ? "Ocupacionales" : "Monofocales";
  const printRef = useRef<HTMLDivElement>(null);

  // Client state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [tempDni, setTempDni] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const resetForm = (mode: 'sameClient' | 'all') => {
    setLejosOD({ esf: "", cil: "", eje: "" });
    setLejosOI({ esf: "", cil: "", eje: "" });
    setCercaOD({ esf: "", cil: "", eje: "" });
    setCercaOI({ esf: "", cil: "", eje: "" });
    setAdicionOD("");
    setAdicionOI("");
    setAlturaOD("");
    setAlturaOI("");
    setDiOD("");
    setDiOI("");
    setApOD("");
    setApOI("");
    setSelectedFrame(null);
    setAssignedLab(null);
    setDeliveryDate("");
    setObservaciones("");
    setSelectedMaterial('Orgánico');
    setSelectedTratamiento('Blanco');
    setInternalLabCost('');
    
    if (mode === 'all') {
      setSelectedClient(null);
      setMedico("");
      setMatricula("");
      setSelectedDoctor(null);
    }
  };

  const handleDniSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTempDni(val);
    const cleanVal = val.replace(/\D/g, '');
    if (cleanVal.length >= 7) {
      const found = clients.find(c => c.dni.replace(/\D/g, '') === cleanVal);
      if (found) {
        setSelectedClient(found);
        setTempDni(""); // clear after match
      }
    }
  };

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("contado");
  const [selectedBankId, setSelectedBankId] = useState("");

  // Frame state
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [frameSearch, setFrameSearch] = useState("");

  // Lab state
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [selectedLabId, setSelectedLabId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [assignedLab, setAssignedLab] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [orderNumber] = useState(`#${Math.floor(10000 + Math.random() * 90000)}`);

  // Prescription state
  const [enableLejos, setEnableLejos] = useState(true);
  const [enableCerca, setEnableCerca] = useState(false);
  const [lejosOD, setLejosOD] = useState({ esf: "", cil: "", eje: "" });
  const [lejosOI, setLejosOI] = useState({ esf: "", cil: "", eje: "" });
  const [cercaOD, setCercaOD] = useState({ esf: "", cil: "", eje: "" });
  const [cercaOI, setCercaOI] = useState({ esf: "", cil: "", eje: "" });
  const [adicionOD, setAdicionOD] = useState("");
  const [adicionOI, setAdicionOI] = useState("");
  const [alturaOD, setAlturaOD] = useState("");
  const [alturaOI, setAlturaOI] = useState("");
  const [medico, setMedico] = useState("");
  
  // Doctor Database State & Handlers
  const [doctors, setDoctors] = useState<any[]>(() => {
    const saved = localStorage.getItem('optica_doctors');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: '1', name: "Dr. Guillermo Altamirano", matricula: "12345" },
      { id: '2', name: "Dra. Carolina Martínez", matricula: "67890" },
      { id: '3', name: "Dr. Roberto Gómez", matricula: "54321" }
    ];
  });

  const [matricula, setMatricula] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [showSaveDoctorBtn, setShowSaveDoctorBtn] = useState(false);

  const handleMatriculaSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMatricula(val);
    
    if (val.trim() === "") {
      setSelectedDoctor(null);
      setMedico("");
      setShowSaveDoctorBtn(false);
      return;
    }

    const found = doctors.find(doc => doc.matricula.trim().toLowerCase() === val.trim().toLowerCase());
    if (found) {
      setSelectedDoctor(found);
      setMedico(found.name);
      setShowSaveDoctorBtn(false);
    } else {
      setSelectedDoctor(null);
      setShowSaveDoctorBtn(true);
    }
  };

  const handleSaveDoctor = () => {
    if (!medico || !matricula) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: medico,
      matricula: matricula
    };
    const updated = [...doctors, newDoc];
    setDoctors(updated);
    localStorage.setItem('optica_doctors', JSON.stringify(updated));
    setSelectedDoctor(newDoc);
    setShowSaveDoctorBtn(false);
    alert(`Médico ${medico} registrado con éxito en la base de datos.`);
  };

  const [observaciones, setObservaciones] = useState("");
  const [lensColor, setLensColor] = useState(lensColors[0] || '');

  // Crystal selectors (material + tratamiento — price calculated dynamically)
  const [selectedMaterial, setSelectedMaterial] = useState('Orgánico');
  const [selectedTratamiento, setSelectedTratamiento] = useState('Blanco');

  // Derive available unique materials and tratamientos from crystalRules
  const availableMaterials = [...new Set(crystalRules.map(r => r.material))];
  const availableTratamientos = [...new Set(crystalRules.filter(r => r.material === selectedMaterial).map(r => r.tratamiento))];

  // Internal lab cost (when no external lab used)
  const [internalLabCost, setInternalLabCost] = useState('');

  // Derived values — crystal price calculated per eye from prescription + rules
  const lejosPriceOD = (!isContact && (type !== 'monofocal' || enableLejos))
    ? getCrystalPrice(parseFloat(lejosOD.esf) || 0, parseFloat(lejosOD.cil) || 0, selectedMaterial, selectedTratamiento)
    : 0;
  const lejosPriceOI = (!isContact && (type !== 'monofocal' || enableLejos))
    ? getCrystalPrice(parseFloat(lejosOI.esf) || 0, parseFloat(lejosOI.cil) || 0, selectedMaterial, selectedTratamiento)
    : 0;

  const cercaPriceOD = (!isContact && type === 'monofocal' && enableCerca)
    ? getCrystalPrice(parseFloat(cercaOD.esf) || 0, parseFloat(cercaOD.cil) || 0, selectedMaterial, selectedTratamiento)
    : 0;
  const cercaPriceOI = (!isContact && type === 'monofocal' && enableCerca)
    ? getCrystalPrice(parseFloat(cercaOI.esf) || 0, parseFloat(cercaOI.cil) || 0, selectedMaterial, selectedTratamiento)
    : 0;

  const crystalPriceOD = lejosPriceOD + cercaPriceOD;
  const crystalPriceOI = lejosPriceOI + cercaPriceOI;
  const crystalPrice = crystalPriceOD + crystalPriceOI;

  const framePrice = selectedFrame ? selectedFrame.numericPrice : 0;
  const labIntCost = parseFloat(internalLabCost) || 0;
  const subtotal = crystalPrice + framePrice + labIntCost;

  let crystalCoverage = 0;
  let frameCoverage = 0;
  const clientInsurance = selectedClient?.insuranceId ? insurances.find(i => i.id === selectedClient.insuranceId) : null;
  
  if (clientInsurance && clientInsurance.coverages) {
    if (crystalPrice > 0) {
       const rule = clientInsurance.coverages.find((c: any) => c.categoryId === 'Cristales');
       if (rule) crystalCoverage = Math.min(crystalPrice, rule.amount || 0);
    }
    if (selectedFrame) {
       const rule = clientInsurance.coverages.find((c: any) => c.categoryId === selectedFrame.cat);
       if (rule) frameCoverage = Math.min(framePrice, rule.amount || 0);
    }
  }

  const totalCoverage = crystalCoverage + frameCoverage;
  const orderTotal = Math.max(0, subtotal - totalCoverage);

  const filteredCrystals: any[] = []; // Crystal pricing is now rule-based, not stock-based

  // Placeholder: this will eventually come from the Auth Context based on the user's login selection
  const currentBranchId = '1'; 

  const renderStockBreakdown = (stocks: Record<string, number>) => {
    const branchesMap: Record<string, string> = { '1': 'Casa Central', '2': 'Shopping' };
    const currentStock = stocks[currentBranchId] || 0;
    
    const otherBranches = Object.entries(stocks).filter(([bId, qty]) => bId !== currentBranchId && qty > 0);
    const hasOtherStock = otherBranches.length > 0;
    
    if (currentStock === 0 && !hasOtherStock) {
      return <span className="text-red-500 font-bold text-xs">Agotado</span>;
    }
    
    const otherBreakdown = otherBranches.map(([bId, qty]) => `${branchesMap[bId] || `Suc ${bId}`}: ${qty}`).join(' | ');

    if (currentStock > 0) {
      return (
        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs text-right block">
          {currentStock} en tu sucursal
          {hasOtherStock && <span className="text-slate-500 text-[10px] block font-normal mt-0.5">(También en: {otherBreakdown})</span>}
        </span>
      );
    } else {
      return (
        <span className="text-orange-500 font-bold text-xs text-right block">
          0 aquí <span className="text-slate-500 text-[10px] block font-normal mt-0.5">Disponible en: {otherBreakdown}</span>
        </span>
      );
    }
  };

  const [diOD, setDiOD] = useState("");
  const [diOI, setDiOI] = useState("");
  const [apOD, setApOD] = useState("");
  const [apOI, setApOI] = useState("");

  const handleConfirm = () => {
    addToCart({
      id: `prescription-${Date.now()}`,
      type: 'prescription',
      name: `${title}: ${selectedClient?.name || 'Cliente Mostrador'}`,
      price: orderTotal || 4500,
      quantity: 1,
      details: {
        client: selectedClient,
        prescriptionType: type || 'monofocal',
        enableLejos,
        enableCerca,
        lejosOD,
        lejosOI,
        cercaOD,
        cercaOI,
        adicionOD,
        adicionOI,
        alturaOD,
        alturaOI,
        diOD,
        diOI,
        apOD,
        apOI,
        medico,
        observaciones,
        lensColor,
        selectedMaterial,
        selectedTratamiento,
        crystalPriceOD,
        crystalPriceOI,
        selectedFrame,
        assignedLab,
        deliveryDate,
        crystalCoverage,
        frameCoverage,
        subtotal,
        totalCoverage
      }
    });

    setIsCartOpen(true);
    setShowSuccessModal(true);
  };

  const handleSendToLab = () => {
    const lab = labs.find(l => l.id === selectedLabId);
    if (!lab || !deliveryDate) return;
    setAssignedLab({ ...lab, deliveryDate });
    setIsLabModalOpen(false);
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) return;
    const logoHtml = opticaLogo
      ? `<img src="${opticaLogo}" alt="Logo" style="max-height:60px;max-width:160px;object-fit:contain;" />`
      : `<div style="font-size:22px;font-weight:900;color:#1e3a8a;">${opticaName || 'Óptica'}</div>`;
    const infoLine = [opticaPhone, opticaAddress].filter(Boolean).join(' &nbsp;|&nbsp; ');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Orden de Laboratorio ${orderNumber}</title>
        <style>
          @page { size: A4; margin: 18mm 16mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; font-size: 12px; color: #111; background: #fff; }
          .page { width: 100%; }
          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a8a; padding-bottom: 14px; margin-bottom: 18px; }
          .header-left .info-line { font-size: 10px; color: #555; margin-top: 4px; }
          .header-right { text-align: right; }
          .order-num { font-size: 26px; font-weight: 900; color: #1e3a8a; line-height: 1; }
          .order-type { font-size: 13px; font-weight: 700; color: #334155; margin-top: 2px; }
          .order-dates { font-size: 10px; color: #555; margin-top: 4px; line-height: 1.6; }
          .delivery-date { color: #059669; font-weight: 700; }
          /* Patient bar */
          .patient-bar { background: #eff6ff; border-left: 4px solid #1e3a8a; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
          .patient-name { font-size: 16px; font-weight: 900; color: #1e3a8a; }
          .patient-label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.06em; }
          .doctor { font-size: 11px; color: #475569; }
          /* Table */
          .section-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 3px; margin-bottom: 10px; margin-top: 14px; }
          .presc-table { width: 100%; border-collapse: collapse; }
          .presc-table th { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; text-align: center; padding: 5px 4px; border-bottom: 1px solid #e2e8f0; }
          .presc-table th:first-child { text-align: left; }
          .presc-table td { text-align: center; padding: 7px 4px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #f1f5f9; }
          .presc-table td:first-child { text-align: left; font-weight: 700; font-size: 11px; background: #f8fafc; padding-left: 8px; border-radius: 4px 0 0 4px; }
          .presc-table td .cell { border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 6px; min-width: 44px; display: inline-block; background: #fff; }
          /* Two column layout */
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 14px; }
          .info-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; }
          .info-box .label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
          .info-box .value { font-size: 13px; font-weight: 700; color: #1e293b; }
          /* Observations */
          .obs-box { border: 1px dashed #94a3b8; border-radius: 6px; padding: 10px 12px; margin-top: 14px; }
          /* Footer */
          .footer { margin-top: 28px; padding-top: 14px; border-top: 1px dashed #94a3b8; display: flex; justify-content: space-between; align-items: flex-end; }
          .sign-block { text-align: center; }
          .sign-line { border-top: 1px solid #000; width: 180px; padding-top: 4px; font-size: 9px; color: #475569; margin-top: 36px; }
          .footer-brand { font-size: 10px; color: #64748b; text-align: right; }
          @media print { 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
      <div class="page">
        <div class="header">
          <div class="header-left">
            ${logoHtml}
            ${infoLine ? `<div class="info-line">${infoLine}</div>` : ''}
          </div>
          <div class="header-right">
            <div class="order-num">${orderNumber}</div>
            <div class="order-type">${printContent.dataset.title || 'Pedido'}</div>
            <div class="order-dates">
              Fecha emisión: ${new Date().toLocaleDateString('es-AR')}<br/>
              ${printContent.dataset.delivery ? `<span class="delivery-date">⏰ Entrega estimada: ${new Date(printContent.dataset.delivery + 'T12:00:00').toLocaleDateString('es-AR')}</span>` : ''}
            </div>
          </div>
        </div>

        ${printContent.innerHTML}
      </div>

      <div class="no-print" style="text-align:center;padding:20px;">
        <button onclick="window.print()" style="padding:10px 28px;background:#1e3a8a;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;margin-right:8px">🖨️ Imprimir</button>
        <button onclick="window.close()" style="padding:10px 28px;background:#f1f5f9;color:#333;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer">Cerrar</button>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    client.dni.includes(clientSearch)
  );

  const filteredFrames = inventory
    .filter(item => item.cat === "Armazones")
    .filter(frame => 
      frame.name.toLowerCase().includes(frameSearch.toLowerCase()) || 
      frame.sku.toLowerCase().includes(frameSearch.toLowerCase())
    );

  const isEditMode = false;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Asociar Cliente
              </h3>
              <button 
                onClick={() => setIsClientModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  className="w-full pl-9 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setIsClientModalOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{client.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{client.dni}</p>
                      </div>
                      <Plus className="w-4 h-4 text-blue-600" />
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-sm">No se encontraron clientes</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setIsClientModalOpen(false)}
                className="px-6 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Frame Modal */}
      {isFrameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Search className="w-6 h-6 text-purple-600" />
                Buscar Marco
              </h3>
              <button 
                onClick={() => setIsFrameModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text"
                  value={frameSearch}
                  onChange={(e) => setFrameSearch(e.target.value)}
                  placeholder="Buscar por nombre o SKU..."
                  className="w-full pl-9 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-purple-600 outline-none text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFrames.length > 0 ? (
                  filteredFrames.map(frame => {
                    const totalStock = Object.values(frame.stocks || {}).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number;
                    const parsedPrice = parseFloat(frame.price.replace('$', '')) || 0;
                    return (
                    <button
                      key={frame.sku}
                      onClick={() => {
                        if (totalStock > 0) {
                          setSelectedFrame({...frame, numericPrice: parsedPrice});
                          setIsFrameModalOpen(false);
                        }
                      }}
                      disabled={totalStock === 0}
                      className={`w-full flex items-center justify-between p-4 transition-colors text-left ${totalStock === 0 ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <div>
                        <p className={`font-bold ${totalStock === 0 ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>{frame.name}</p>
                        <p className="text-sm text-slate-500">{frame.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${totalStock === 0 ? 'text-slate-400' : 'text-slate-900 dark:text-white'} mb-1`}>${parsedPrice.toFixed(2)}</p>
                        <div>
                          {renderStockBreakdown(frame.stocks)}
                        </div>
                      </div>
                    </button>
                  )})
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    No se encontraron marcos en inventario.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crystal Modal removed — pricing is now dynamic, not stock-based */}

      {/* Lab Send Modal */}
      {isLabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-violet-600" /> Enviar a Laboratorio
              </h3>
              <button onClick={() => setIsLabModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-violet-500" /> Laboratorio
                </label>
                <div className="relative">
                  <select
                    value={selectedLabId}
                    onChange={e => setSelectedLabId(e.target.value)}
                    className="h-11 px-3 pr-10 w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-violet-600 focus:border-violet-600 outline-none text-slate-900 dark:text-white font-bold appearance-none transition-all"
                  >
                    <option value="">-- Seleccionar laboratorio --</option>
                    {labs.map(lab => (
                      <option key={lab.id} value={lab.id}>{lab.name}{lab.contact ? ` (${lab.contact})` : ''}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {labs.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1.5">No hay laboratorios configurados. Agrégalos en la sección de Laboratorios.</p>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" /> Fecha Estimada de Entrega al Cliente
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-violet-600 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => setIsLabModalOpen(false)} className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSendToLab}
                disabled={!selectedLabId || !deliveryDate}
                className="flex-1 h-11 rounded-xl bg-violet-600 text-white font-black hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Confirmar Envío
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Card Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-6 h-6 text-blue-600" /> Tarjeta para Laboratorio
              </h3>
              <button onClick={() => setIsPrintModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Preview */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto max-h-[60vh]">
              <div
                ref={printRef as React.RefObject<HTMLDivElement>}
                data-title={title}
                data-delivery={assignedLab?.deliveryDate || ''}
                style={{ background: '#fff', color: '#111', padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px', borderRadius: '8px' }}
              >
                {/* Patient + Lab */}
                <div className="patient-bar" style={{ background: '#eff6ff', borderLeft: '4px solid #1e3a8a', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.06em', marginBottom: '2px' }}>Paciente</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#1e3a8a' }}>{selectedClient?.name || 'Sin nombre'}</div>
                    {medico && <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Dr/a. {medico}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.06em', marginBottom: '2px' }}>Laboratorio</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{assignedLab?.name}</div>
                  </div>
                </div>

                {/* Lejos */}
                {(type !== 'monofocal' || enableLejos) && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>Visión Lejos</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 1fr', gap: '6px', marginBottom: '4px' }}>
                      <div></div>
                      <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', color: '#555' }}>Esférico</div>
                      <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', color: '#555' }}>Cilíndrico</div>
                      <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', color: '#555' }}>Eje</div>
                    </div>
                    {[{ label: 'Ojo Derecho', data: lejosOD }, { label: 'Ojo Izquierdo', data: lejosOI }].map(row => (
                      <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 1fr', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '12px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>{row.label}</div>
                        {[row.data.esf, row.data.cil, row.data.eje].map((v, i) => (
                          <div key={i} style={{ textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px', fontSize: '13px', fontWeight: '600', minHeight: '28px' }}>{v || '-'}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Cerca */}
                {(type !== 'monofocal' || enableCerca) && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>Visión Cerca</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 1fr', gap: '6px', marginBottom: '4px' }}>
                      <div></div>
                      <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', color: '#555' }}>Esférico</div>
                      <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', color: '#555' }}>Cilíndrico</div>
                      <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', color: '#555' }}>Eje</div>
                    </div>
                    {[{ label: 'Ojo Derecho', data: cercaOD }, { label: 'Ojo Izquierdo', data: cercaOI }].map(row => (
                      <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 1fr', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '12px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>{row.label}</div>
                        {[row.data.esf, row.data.cil, row.data.eje].map((v, i) => (
                          <div key={i} style={{ textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px', fontSize: '13px', fontWeight: '600', minHeight: '28px' }}>{v || '-'}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Adición Multifocal / Ocupacional */}
                {(isMultifocal || isOccupational) && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>{isOccupational ? "Ocupacional" : "Multifocal"}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: '6px', marginBottom: '4px' }}>
                      <div></div>
                      <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', color: '#555' }}>Adición</div>
                      <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', color: '#555' }}>Altura Seg.</div>
                    </div>
                    {[{ label: 'Ojo Derecho', ad: adicionOD, al: alturaOD }, { label: 'Ojo Izquierdo', ad: adicionOI, al: alturaOI }].map(row => (
                      <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '12px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>{row.label}</div>
                        <div style={{ textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px', fontSize: '13px', fontWeight: '600', minHeight: '28px' }}>{row.ad || '-'}</div>
                        <div style={{ textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px', fontSize: '13px', fontWeight: '600', minHeight: '28px' }}>{row.al || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Marco y Color */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#555', marginBottom: '4px' }}>Marco / Armazón</div>
                    <div style={{ fontWeight: '700' }}>{selectedFrame ? `${selectedFrame.name} (${selectedFrame.sku})` : '(sin especificar)'}</div>
                  </div>
                  <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#555', marginBottom: '4px' }}>Color del Cristal</div>
                    <div style={{ fontWeight: '700' }}>{lensColor || '(sin especificar)'}</div>
                  </div>
                </div>

                {/* Observaciones */}
                {observaciones && (
                  <div style={{ border: '1px dashed #aaa', borderRadius: '6px', padding: '10px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#555', marginBottom: '4px' }}>Observaciones</div>
                    <div style={{ fontSize: '12px' }}>{observaciones}</div>
                  </div>
                )}

                {/* Footer firma */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '12px', borderTop: '1px dashed #ccc' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #000', width: '160px', paddingTop: '4px', fontSize: '10px', marginTop: '32px' }}>Recibido por (Laboratorio)</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px', color: '#555' }}>
                    <div>Óptica Paracáo</div>
                    <div>{orderNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => setIsPrintModalOpen(false)} className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
                Cerrar
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" /> Imprimir Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link to="/orders/new" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-bold">Volver a Selección</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isContact ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : isMultifocal ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : isOccupational ? 'bg-violet-100 border-violet-200 text-violet-600' : 'bg-blue-100 border-blue-200 text-blue-600'}`}>
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Datos del Cliente
            </h3>
            {selectedClient && (
              <button 
                onClick={() => setSelectedClient(null)}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Desvincular
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">DNI / Identificación</label>
              <input 
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500 transition-all font-mono text-sm" 
                placeholder="Ingresar DNI para buscar..." 
                value={selectedClient ? selectedClient.dni : tempDni}
                onChange={handleDniSearch}
                readOnly={!!selectedClient}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nombre del Cliente</label>
              <div className="relative">
                <input 
                  className="h-10 pl-3 pr-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500 transition-all font-medium" 
                  placeholder="Ej: Juan Pérez" 
                  value={selectedClient?.name || ""}
                  readOnly={!!selectedClient}
                  onChange={(e) => !selectedClient && e.stopPropagation()} // Placeholder logic
                />
                {!selectedClient && (
                  <button 
                    onClick={() => setIsClientModalOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    title="Asociar Cliente"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {selectedClient && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Obra Social / Cobertura</label>
                <div className="flex items-center gap-2 p-2.5 px-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {clientInsurance ? clientInsurance.name : "Particular / Sin Cobertura"}
                  </span>
                  {selectedClient.affiliateNumber && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-500">
                      (Afil: {selectedClient.affiliateNumber})
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Matrícula</label>
              <div className="relative">
                <input 
                  type="text"
                  value={matricula} 
                  onChange={handleMatriculaSearch} 
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm" 
                  placeholder="Ej: 12345" 
                />
                {selectedDoctor && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 bg-white dark:bg-slate-950 px-1">
                    <Check className="w-3.5 h-3.5" /> Registrado
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Médico Recetador</label>
              <div className="relative">
                <input 
                  value={medico} 
                  onChange={e => setMedico(e.target.value)} 
                  readOnly={!!selectedDoctor}
                  className="h-10 pl-3 pr-28 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800/50" 
                  placeholder="Ej: Dr. Guillermo Altamirano" 
                />
                {showSaveDoctorBtn && medico && matricula && (
                  <button
                    type="button"
                    onClick={handleSaveDoctor}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                  >
                    💾 Registrar
                  </button>
                )}
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Observaciones</label>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none resize-none" rows={2}></textarea>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold dark:text-white mb-5 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Especificaciones Técnicas
          </h3>
          
          <div className="space-y-8">
            {!isContact ? (
              <div className="space-y-6">
                {/* Lejos */}
                <div className={cn(
                  "p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm transition-all",
                  type === 'monofocal' && !enableLejos && "opacity-50 pointer-events-none bg-slate-100/50 dark:bg-slate-900/20"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ArrowUpFromLine className="w-5 h-5 text-blue-500" /> Visión Lejos
                    </h4>
                    {type === 'monofocal' && (
                      <label className="flex items-center gap-2 cursor-pointer pointer-events-auto select-none">
                        <input
                          type="checkbox"
                          checked={enableLejos}
                          onChange={e => setEnableLejos(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Habilitar</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Desktop Headers */}
                  <div className="hidden sm:grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3 px-2">
                    <div className="col-span-1"></div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Esférico</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Cilíndrico</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Eje</div>
                  </div>

                  <div className="space-y-3">
                    {['OD', 'OI'].map(eye => {
                      const isOD = eye === 'OD';
                      const stateVal = isOD ? lejosOD : lejosOI;
                      const setVal = isOD ? setLejosOD : setLejosOI;
                      return (
                        <div key={`lejos-${eye}`} className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="sm:w-1/4 text-center font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                            {eye === 'OD' ? 'Ojo Derecho' : 'Ojo Izquierdo'}
                          </div>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Esférico</label>
                              <input 
                                value={stateVal.esf}
                                onChange={e => setVal({ ...stateVal, esf: e.target.value })}
                                disabled={type === 'monofocal' && !enableLejos}
                                className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-55 disabled:bg-slate-100 dark:disabled:bg-slate-900" 
                                placeholder="0.00" 
                              />
                            </div>
                            <div className="relative">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Cilíndrico</label>
                              <input 
                                value={stateVal.cil}
                                onChange={e => setVal({ ...stateVal, cil: e.target.value })}
                                disabled={type === 'monofocal' && !enableLejos}
                                className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-55 disabled:bg-slate-100 dark:disabled:bg-slate-900" 
                                placeholder="0.00" 
                              />
                            </div>
                            <div className="relative">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Eje</label>
                              <input 
                                value={stateVal.eje}
                                onChange={e => setVal({ ...stateVal, eje: e.target.value })}
                                disabled={type === 'monofocal' && !enableLejos}
                                className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-55 disabled:bg-slate-100 dark:disabled:bg-slate-900" 
                                placeholder="0°" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cerca */}
                <div className={cn(
                  "p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm transition-all",
                  type === 'monofocal' && !enableCerca && "opacity-50 pointer-events-none bg-slate-100/50 dark:bg-slate-900/20"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ArrowDownToLine className="w-5 h-5 text-blue-500" /> Visión Cerca
                    </h4>
                    {type === 'monofocal' && (
                      <label className="flex items-center gap-2 cursor-pointer pointer-events-auto select-none">
                        <input
                          type="checkbox"
                          checked={enableCerca}
                          onChange={e => setEnableCerca(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Habilitar</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Desktop Headers */}
                  <div className="hidden sm:grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3 px-2">
                    <div className="col-span-1"></div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Esférico</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Cilíndrico</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Eje</div>
                  </div>

                  <div className="space-y-3">
                    {['OD', 'OI'].map(eye => {
                      const isOD = eye === 'OD';
                      const stateVal = isOD ? cercaOD : cercaOI;
                      const setVal = isOD ? setCercaOD : setCercaOI;
                      return (
                        <div key={`cerca-${eye}`} className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="sm:w-1/4 text-center font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                            {eye === 'OD' ? 'Ojo Derecho' : 'Ojo Izquierdo'}
                          </div>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Esférico</label>
                              <input 
                                value={stateVal.esf}
                                onChange={e => setVal({ ...stateVal, esf: e.target.value })}
                                disabled={type === 'monofocal' && !enableCerca}
                                className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-55 disabled:bg-slate-100 dark:disabled:bg-slate-900" 
                                placeholder="0.00" 
                              />
                            </div>
                            <div className="relative">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Cilíndrico</label>
                              <input 
                                value={stateVal.cil}
                                onChange={e => setVal({ ...stateVal, cil: e.target.value })}
                                disabled={type === 'monofocal' && !enableCerca}
                                className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-55 disabled:bg-slate-100 dark:disabled:bg-slate-900" 
                                placeholder="0.00" 
                              />
                            </div>
                            <div className="relative">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Eje</label>
                              <input 
                                value={stateVal.eje}
                                onChange={e => setVal({ ...stateVal, eje: e.target.value })}
                                disabled={type === 'monofocal' && !enableCerca}
                                className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-55 disabled:bg-slate-100 dark:disabled:bg-slate-900" 
                                placeholder="0°" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Medidas Pupilares (DI y Altura Pupilar) */}
                <div className="p-5 rounded-xl bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" /> Medidas Pupilares (DI & Altura Pupilar)
                  </h4>
                  
                  {/* Desktop Headers */}
                  <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 px-2">
                    <div className="col-span-1"></div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Distancia Interpupilar (DI)</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Altura Pupilar</div>
                  </div>

                  <div className="space-y-3">
                    {['OD', 'OI'].map(eye => {
                      const isOD = eye === 'OD';
                      return (
                        <div key={`pupil-${eye}`} className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="sm:w-1/3 text-center font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                            {eye === 'OD' ? 'Ojo Derecho' : 'Ojo Izquierdo'}
                          </div>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Distancia Interpupilar (DI)</label>
                              <input 
                                value={isOD ? diOD : diOI}
                                onChange={e => isOD ? setDiOD(e.target.value) : setDiOI(e.target.value)}
                                className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-blue-600 outline-none" 
                                placeholder="31 mm" 
                              />
                            </div>
                            <div className="relative">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Altura Pupilar</label>
                              <input 
                                value={isOD ? apOD : apOI}
                                onChange={e => isOD ? setApOD(e.target.value) : setApOI(e.target.value)}
                                className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-blue-600 outline-none" 
                                placeholder="18 mm" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Calculated Interpupillary Distance (DI) Total placed directly under DI inputs */}
                    {((parseFloat(diOD) || 0) + (parseFloat(diOI) || 0)) > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2 animate-in fade-in">
                        <div className="sm:w-1/3"></div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 text-center sm:text-left">Distancia Interpupilar Total (D.I.)</p>
                            <div className="h-11 flex items-center justify-center rounded-lg bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-center font-black text-blue-600 dark:text-blue-400 text-sm">
                              {((parseFloat(diOD) || 0) + (parseFloat(diOI) || 0))} mm
                            </div>
                          </div>
                          <div className="relative"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(isMultifocal || isOccupational) && (
                  <div className={cn(
                    "p-5 rounded-xl border shadow-sm",
                    isOccupational 
                      ? "bg-violet-50/50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-800/30"
                      : "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30"
                  )}>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Plus className={cn("w-5 h-5", isOccupational ? "text-violet-500" : "text-indigo-500")} /> {isOccupational ? "Especificaciones Ocupacionales" : "Especificaciones Multifocales"}
                    </h4>
                    
                    {/* Desktop Headers */}
                    <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 px-2">
                      <div className="col-span-1"></div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">{isOccupational ? "Degresión" : "Adición"}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Altura Seg.</div>
                    </div>

                    <div className="space-y-3">
                      {['OD', 'OI'].map(eye => {
                        const isOD = eye === 'OD';
                        return (
                          <div key={`multi-${eye}`} className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="sm:w-1/3 text-center font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                              {eye === 'OD' ? 'Ojo Derecho' : 'Ojo Izquierdo'}
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="relative">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">{isOccupational ? "Degresión" : "Adición"}</label>
                                <input 
                                  value={isOD ? adicionOD : adicionOI}
                                  onChange={e => isOD ? setAdicionOD(e.target.value) : setAdicionOI(e.target.value)}
                                  className={cn(
                                    "h-11 px-3 w-full rounded-lg bg-white dark:bg-slate-950 text-center font-medium outline-none border transition-all focus:ring-2",
                                    isOccupational 
                                      ? "border-violet-200 dark:border-violet-800 focus:ring-violet-600" 
                                      : "border-indigo-200 dark:border-indigo-800 focus:ring-indigo-600"
                                  )}
                                  placeholder="+0.00" 
                                />
                              </div>
                              <div className="relative">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block sm:hidden mb-1">Altura Seg.</label>
                                <input 
                                  value={isOD ? alturaOD : alturaOI}
                                  onChange={e => isOD ? setAlturaOD(e.target.value) : setAlturaOI(e.target.value)}
                                  className={cn(
                                    "h-11 px-3 w-full rounded-lg bg-white dark:bg-slate-950 text-center font-medium outline-none border transition-all focus:ring-2",
                                    isOccupational 
                                      ? "border-violet-200 dark:border-violet-800 focus:ring-violet-600" 
                                      : "border-indigo-200 dark:border-indigo-800 focus:ring-indigo-600"
                                  )}
                                  placeholder="0 mm" 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {['OD', 'OI'].map(eye => (
                  <div key={`contact-${eye}`} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-emerald-500" /> Ojo {eye === 'OD' ? 'Derecho' : 'Izquierdo'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="relative">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Esférico (ESF)</label>
                        <input 
                          value={eye === 'OD' ? lejosOD.esf : lejosOI.esf}
                          onChange={e => {
                            const val = e.target.value;
                            if (eye === 'OD') setLejosOD({ ...lejosOD, esf: val });
                            else setLejosOI({ ...lejosOI, esf: val });
                          }}
                          className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-emerald-600 outline-none" 
                          placeholder="0.00" 
                        />
                      </div>
                      <div className="relative">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Curvatura (BC)</label>
                        <input className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-emerald-600 outline-none" placeholder="8.6" />
                      </div>
                      <div className="relative">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Diámetro (DIA)</label>
                        <input className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-medium focus:ring-2 focus:ring-emerald-600 outline-none" placeholder="14.2" />
                      </div>
                      <div className="relative">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Color</label>
                        <select className="h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-600 outline-none text-slate-900 dark:text-white appearance-none font-medium">
                          {contactLensColors.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isContact && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Color del Cristal</label>
                  <select className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white">
                    {lensColors.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Marco (Armazón)</label>
                  {selectedFrame ? (
                    <div className="flex items-center justify-between p-2 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedFrame.name}</p>
                        <p className="text-xs text-slate-500">{selectedFrame.sku} - ${selectedFrame.numericPrice.toFixed(2)}</p>
                      </div>
                      <button onClick={() => setSelectedFrame(null)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsFrameModalOpen(true)}
                      className="h-10 px-3 w-full rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                    >
                      <Search className="w-4 h-4" /> Buscar Marco en Stock
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24 space-y-5">
          
          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
              Resumen del Pedido
            </h3>
            <div className="space-y-2">

              {/* Crystal — Material + Tratamiento + Dynamic Price */}
              {!isContact && (
                <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cristal</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Material</label>
                      <select
                        value={selectedMaterial}
                        onChange={e => {
                          const newMat = e.target.value;
                          const newTrats = [...new Set(crystalRules.filter(r => r.material === newMat).map(r => r.tratamiento))];
                          setSelectedMaterial(newMat);
                          setSelectedTratamiento(newTrats[0] || 'Blanco');
                        }}
                        className="h-9 px-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                      >
                        {availableMaterials.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tratamiento</label>
                      <select
                        value={selectedTratamiento}
                        onChange={e => setSelectedTratamiento(e.target.value)}
                        className="h-9 px-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                      >
                        {availableTratamientos.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex justify-between bg-slate-50 dark:bg-slate-800 rounded px-2 py-1">
                      <span className="text-slate-500">OD:</span>
                      <span className={`font-bold ${crystalPriceOD > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {crystalPriceOD > 0 ? `$${crystalPriceOD.toLocaleString('es-AR')}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between bg-slate-50 dark:bg-slate-800 rounded px-2 py-1">
                      <span className="text-slate-500">OI:</span>
                      <span className={`font-bold ${crystalPriceOI > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {crystalPriceOI > 0 ? `$${crystalPriceOI.toLocaleString('es-AR')}` : '—'}
                      </span>
                    </div>
                  </div>
                  {crystalPrice === 0 && (
                    ((type !== 'monofocal' || enableLejos) && (lejosOD.esf || lejosOI.esf)) ||
                    ((type === 'monofocal' && enableCerca) && (cercaOD.esf || cercaOI.esf))
                  ) && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">⚠️ La receta no encaja en ninguna regla configurada para este cristal.</p>
                  )}
                </div>
              )}

              {/* Frame */}
              {!isContact && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Marco / Armazón</p>
                    {selectedFrame ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{selectedFrame.name}</span>
                        <button onClick={() => setSelectedFrame(null)} className="text-slate-400 hover:text-red-500 flex-shrink-0"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setIsFrameModalOpen(true)} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Agregar marco del stock
                      </button>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white ml-3 flex-shrink-0">
                    {framePrice > 0 ? `$${framePrice.toFixed(2)}` : <span className="text-slate-400 text-sm font-normal">-</span>}
                  </span>
                </div>
              )}

              {/* Internal Lab Cost — only if no external lab assigned */}
              {!assignedLab && (
                <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Trabajo de Laboratorio Interno</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={internalLabCost}
                      onChange={e => setInternalLabCost(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    {labIntCost > 0 && (
                      <span className="text-sm font-bold text-orange-600 flex-shrink-0">${labIntCost.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              )}

              {/* External Lab indicator */}
              {assignedLab && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Lab Externo</p>
                    <span className="text-sm font-bold text-violet-700 dark:text-violet-300">{assignedLab.name}</span>
                  </div>
                  <span className="text-slate-400 text-sm font-normal">—</span>
                </div>
              )}

              {/* Subtotal & Coverage */}
              {totalCoverage > 0 && (
                <>
                  <div className="flex justify-between pt-2">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Subtotal:</p>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Cubre O. Social ({clientInsurance?.name}):</p>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">-${totalCoverage.toFixed(2)}</span>
                  </div>
                </>
              )}

              {/* TOTAL */}
              <div className="flex justify-between pt-3 mt-1">
                <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {totalCoverage > 0 ? "A Pagar (Cliente):" : "Total:"}
                </p>
                <span className={`text-2xl font-black ${orderTotal > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  ${orderTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Método de Pago:</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'contado', name: '1- Contado', icon: <Banknote className="w-4 h-4" /> },
                { id: 'transferencia', name: '2- Transferencias', icon: <Building className="w-4 h-4" /> },
                { id: 'tarjeta', name: '3- Tarjeta de Crédito', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'mercado-pago', name: '4- Mercado Pago', icon: <Wallet className="w-4 h-4" /> }
              ].map(method => (
                <div key={method.id} className="space-y-2">
                  <button
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      paymentMethod === method.id 
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg" 
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    )}
                  >
                    {method.icon}
                    <span className="text-sm font-bold flex-1">{method.name}</span>
                    {method.id === 'transferencia' && <ChevronDown className={cn("w-4 h-4 transition-transform", paymentMethod === 'transferencia' ? "rotate-180" : "")} />}
                  </button>

                  {method.id === 'transferencia' && paymentMethod === 'transferencia' && (
                    <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {boxes.filter(b => b.type === 'bank').map(bank => (
                        <button
                          key={bank.id}
                          onClick={() => setSelectedBankId(bank.id)}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all",
                            selectedBankId === bank.id 
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          <Building className="w-3 h-3" />
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!isContact && (
            <div>
              {assignedLab ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                  <FlaskConical className="w-5 h-5 text-violet-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-violet-700 dark:text-violet-300 truncate">{assignedLab.name}</p>
                    <p className="text-xs text-violet-500">Entrega: {new Date(assignedLab.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR')}</p>
                  </div>
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="p-2 text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-800/40 rounded-lg transition-colors"
                    title="Ver tarjeta"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button onClick={() => setAssignedLab(null)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLabModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 font-bold h-11 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-500 transition-all"
                >
                  <FlaskConical className="w-5 h-5" /> Enviar a Laboratorio
                </button>
              )}
            </div>
          )}

          <button 
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white font-black h-14 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            <Check className="w-6 h-6" /> Agregar al Carrito de Venta
          </button>
        </div>
      </div>
      
      {/* Modal de Éxito al Agregar al Carrito */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">¡Recetado Agregado!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                La orden de <strong>{selectedClient?.name || 'Cliente Mostrador'}</strong> ha sido agregada con éxito al carrito de venta.
              </p>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  resetForm('sameClient');
                  setShowSuccessModal(false);
                }}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:scale-[0.98]"
              >
                Cargar otra receta para este cliente
              </button>
              <button
                onClick={() => {
                  resetForm('all');
                  setShowSuccessModal(false);
                  navigate('/orders');
                }}
                className="w-full h-11 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all active:scale-[0.98]"
              >
                Crear pedido para otro cliente
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                }}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 font-bold text-sm transition-all active:scale-[0.98]"
              >
                Cerrar e ir al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
