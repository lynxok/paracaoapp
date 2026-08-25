import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useFinance } from '../context/FinanceContext';
import { useSettings } from '../context/SettingsContext';
import { 
  Shield, 
  Search, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  Filter, 
  User, 
  CreditCard,
  Building,
  Check,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface InsuranceClaim {
  id: string;
  orderId: string;
  clientId: string;
  clientName: string;
  clientDni: string;
  affiliateNumber: string;
  insuranceId: string;
  insuranceName: string;
  itemType: 'cristal' | 'armazon' | 'ambos';
  frameCoverage: number;
  crystalCoverage: number;
  totalAmount: number;
  status: 'Pendiente' | 'Presentado' | 'Cobrado';
  date: string;
}

export function InsuranceClaims() {
  const { boxes, addTransaction } = useFinance();
  const { insurances } = useSettings();

  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Collection
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const [destinationBoxId, setDestinationBoxId] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_claims')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        setClaims(data.map((row: any) => ({
          id: row.id,
          orderId: row.order_id,
          clientId: row.client_id,
          clientName: row.client_name,
          clientDni: row.client_dni || '',
          affiliateNumber: row.affiliate_number || '',
          insuranceId: row.insurance_id,
          insuranceName: row.insurance_name,
          itemType: row.item_type || 'ambos',
          frameCoverage: Number(row.frame_coverage) || 0,
          crystalCoverage: Number(row.crystal_coverage) || 0,
          totalAmount: Number(row.total_amount) || 0,
          status: row.status || 'Pendiente',
          date: row.date
        })));
      }
    } catch (e) {
      console.error("Error fetching claims:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Update claim status in DB (e.g. Presentado)
  const handleUpdateStatus = async (id: string, newStatus: 'Pendiente' | 'Presentado') => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    try {
      await supabase.from('insurance_claims').update({ status: newStatus }).eq('id', id);
    } catch (e) {
      console.error("Error updating claim status:", e);
    }
  };

  // Perform claim collection
  const handleConfirmCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !destinationBoxId || collectedAmount <= 0) return;

    try {
      // 1. Update claim status in database
      const { error: claimError } = await supabase
        .from('insurance_claims')
        .update({ status: 'Cobrado' })
        .eq('id', selectedClaim.id);

      if (claimError) throw claimError;

      // 2. Fetch the destination cash box properties to set transaction method
      const targetBox = boxes.find(b => b.id === destinationBoxId);
      const method = targetBox?.type === 'cash' ? 'cash' : 'transfer';

      // 3. Register transaction in FinanceContext
      const newTx = {
        id: `tx-claim-${Date.now()}`,
        date: collectionDate,
        time: new Date().toTimeString().slice(0, 5),
        concept: `Cobro Reintegro Obra Social: ${selectedClaim.insuranceName} - Paciente: ${selectedClaim.clientName} DNI: ${selectedClaim.clientDni} ${reference ? `(Ref: ${reference})` : ''}`,
        method: method,
        amount: collectedAmount,
        type: 'income' as const,
        category: 'Cobro Reintegro',
        boxId: destinationBoxId,
        clientId: selectedClaim.clientId,
        clientName: selectedClaim.clientName,
        reconciled: true
      };

      await addTransaction(newTx);

      // 4. Update local state list
      setClaims(prev => prev.map(c => c.id === selectedClaim.id ? { ...c, status: 'Cobrado' } : c));
      
      // Close modal and reset
      setIsCollectModalOpen(false);
      setSelectedClaim(null);
      setReference('');
      
      // Trigger a clean reload of balances
      fetchClaims();
    } catch (err) {
      console.error("Error collecting claim:", err);
      alert("Hubo un error al procesar el cobro. Por favor, reintenta.");
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchesSearch = 
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.clientDni.includes(searchQuery) ||
        c.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesInsurance = insuranceFilter === 'all' || c.insuranceId === insuranceFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesInsurance && matchesStatus;
    });
  }, [claims, searchQuery, insuranceFilter, statusFilter]);

  // Statistics calculations
  const stats = useMemo(() => {
    let pendingSum = 0;
    let collectedSum = 0;
    let pendingCount = 0;
    let collectedCount = 0;

    filteredClaims.forEach(c => {
      if (c.status === 'Cobrado') {
        collectedSum += c.totalAmount;
        collectedCount += 1;
      } else {
        pendingSum += c.totalAmount;
        pendingCount += 1;
      }
    });

    return {
      pendingSum,
      collectedSum,
      pendingCount,
      collectedCount,
      totalCount: filteredClaims.length
    };
  }, [filteredClaims]);

  return (
    <div className="space-y-6">
      {/* Header Cards (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pendiente de Cobro</p>
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">${stats.pendingSum.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-2">{stats.pendingCount} solicitudes pendientes</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Cobrado (Reintegros)</p>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${stats.collectedSum.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-2">{stats.collectedCount} cobros ingresados a caja</p>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Solicitudes</p>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">{stats.totalCount}</h3>
            <p className="text-xs text-slate-500 mt-2">En el período seleccionado</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-600 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar cliente, DNI o Nro Pedido..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-bold">
              <Filter className="w-3.5 h-3.5" /> Filtrar
            </div>
            
            <select
              value={insuranceFilter}
              onChange={e => setInsuranceFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600 text-xs font-bold"
            >
              <option value="all">Todas las Obras Sociales</option>
              {insurances.map(ins => (
                <option key={ins.id} value={ins.id}>{ins.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600 text-xs font-bold"
            >
              <option value="all">Todos los Estados</option>
              <option value="Pendiente">Pendiente de Cobro</option>
              <option value="Presentado">Presentado a Mutual</option>
              <option value="Cobrado">Cobrado / Liquidado</option>
            </select>
          </div>
        </div>

        {/* Claims Table */}
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium text-sm">Cargando solicitudes de reintegro...</div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium text-sm">No se encontraron solicitudes de reintegro registradas.</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-50/20 dark:bg-slate-900/10">
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Pedido</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Obra Social</th>
                  <th className="p-4 text-right">Cristales</th>
                  <th className="p-4 text-right">Armazón</th>
                  <th className="p-4 text-right font-black">Total</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredClaims.map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 font-medium text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(claim.date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {claim.orderId}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{claim.clientName}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">DNI: {claim.clientDni} {claim.affiliateNumber && `| Cred: ${claim.affiliateNumber}`}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {claim.insuranceName}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-600 dark:text-slate-400">
                      ${claim.crystalCoverage.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-600 dark:text-slate-400">
                      ${claim.frameCoverage.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      ${claim.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        claim.status === 'Cobrado' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400" :
                        claim.status === 'Presentado' ? "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400" :
                        "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                      )}>
                        {claim.status === 'Cobrado' ? 'Cobrado' : claim.status === 'Presentado' ? 'Presentado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {claim.status === 'Pendiente' && (
                          <button 
                            onClick={() => handleUpdateStatus(claim.id, 'Presentado')}
                            className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg text-xs font-bold transition-all"
                            title="Marcar como presentado a Obra Social"
                          >
                            Presentar
                          </button>
                        )}
                        
                        {claim.status !== 'Cobrado' ? (
                          <button 
                            onClick={() => {
                              setSelectedClaim(claim);
                              setCollectedAmount(claim.totalAmount);
                              setDestinationBoxId(boxes[0]?.id || '');
                              setIsCollectModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-[1.02] flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Cobrar
                          </button>
                        ) : (
                          <span className="p-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Registrar Cobro */}
      {isCollectModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Registrar Cobro Reintegro
              </h3>
              <button 
                onClick={() => {
                  setIsCollectModalOpen(false);
                  setSelectedClaim(null);
                }} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full transition-colors text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCollection} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/10 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 text-slate-700 dark:text-slate-350 space-y-1.5">
                <p className="text-xs font-semibold">Obra Social: <strong className="text-slate-900 dark:text-white">{selectedClaim.insuranceName}</strong></p>
                <p className="text-xs font-semibold">Paciente: <strong className="text-slate-900 dark:text-white">{selectedClaim.clientName} (DNI: {selectedClaim.clientDni})</strong></p>
                <p className="text-xs font-semibold">Monto Original: <strong className="text-slate-900 dark:text-white">${selectedClaim.totalAmount.toLocaleString()}</strong></p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Monto Real Cobrado ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    step="any"
                    value={collectedAmount || ''}
                    onChange={e => setCollectedAmount(Number(e.target.value))}
                    className="h-11 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-black" 
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Caja de Destino</label>
                <select
                  value={destinationBoxId}
                  onChange={e => setDestinationBoxId(e.target.value)}
                  className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-semibold"
                  required
                >
                  <option value="">Seleccione a qué caja ingresa el dinero...</option>
                  {boxes.map(box => {
                    const balance = box.initialBalance + box.incomes - box.expenses;
                    return (
                      <option key={box.id} value={box.id}>
                        {box.name} (${balance.toLocaleString()})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha de Cobro</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    value={collectionDate}
                    onChange={e => setCollectionDate(e.target.value)}
                    className="h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-medium" 
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nro de Liquidación / Nota (Opcional)</label>
                <input 
                  type="text" 
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="Ej: Liq OSDE 08/2026"
                  className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsCollectModalOpen(false);
                    setSelectedClaim(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1.5 text-xs"
                >
                  <DollarSign className="w-4 h-4" /> Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
