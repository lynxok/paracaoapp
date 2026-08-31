import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationsContext';
import { useClients } from './ClientContext';
import { supabase } from '../lib/supabase';

export interface Lab {
  id: string;
  name: string;
  contact?: string;
}

export type LabJobStatus = 'Pendiente' | 'Enviado al laboratorio' | 'En producción' | 'Demorado' | 'Recibido' | 'Entregado';

export interface LabJob {
  id: string;
  labId: string;
  date: string;
  orderId: string;
  concept: string;
  cost: number;
  status: LabJobStatus;
  labName?: string;
  clientName?: string;
  clientDni?: string;
  prescription?: {
    type: string;
    lejosOD?: any;
    lejosOI?: any;
    cercaOD?: any;
    cercaOI?: any;
    adicionOD?: string;
    adicionOI?: string;
    alturaOD?: string;
    alturaOI?: string;
    diOD?: string;
    diOI?: string;
    apOD?: string;
    apOI?: string;
  };
  crystalDetails?: {
    id: string;
    name: string;
    type: string;
    material: string;
    index: string;
    brand: string;
    design: string;
    color: string;
    eyes: 'ambos' | 'od' | 'oi';
    basePrice: number;
    totalPrice: number;
  };
  treatments?: Array<{ id: string; name: string; price: number }>;
  estimatedLabDeliveryDate?: string;
  observaciones?: string;
  branchName?: string;
  sellerName?: string;
}

export interface LabPayment {
  id: string;
  labId: string;
  date: string;
  amount: number;
  reference?: string;
}

interface LabContextType {
  labs: Lab[];
  jobs: LabJob[];
  payments: LabPayment[];
  addLab: (lab: Omit<Lab, 'id'>) => void;
  updateLab: (lab: Lab) => void;
  deleteLab: (id: string) => void;
  addJob: (job: Omit<LabJob, 'id'>) => void;
  updateJobStatus: (id: string, status: LabJobStatus) => void;
  updateJobEstimatedDelivery: (id: string, estimatedLabDeliveryDate: string) => void;
  addPayment: (payment: Omit<LabPayment, 'id'>) => void;
  getLabBalance: (labId: string) => { totalJobs: number; totalCost: number; totalPaid: number; balance: number };
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export function LabProvider({ children }: { children: ReactNode }) {
  const { addNotification } = useNotifications();
  const { updateOrderStatus } = useClients();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [jobs, setJobs] = useState<LabJob[]>([]);
  const [payments, setPayments] = useState<LabPayment[]>([]);

  // Load 100% from Supabase on mount
  useEffect(() => {
    async function loadLabDataFromSupabase() {
      try {
        const { data: dbLabs, error: lErr } = await supabase.from('labs').select('*');
        if (!lErr && dbLabs) setLabs(dbLabs);

        const { data: dbJobs, error: jErr } = await supabase.from('lab_jobs').select('*');
        if (!jErr && dbJobs) {
          const mappedJobs: LabJob[] = dbJobs.map(row => ({
            id: row.id,
            labId: row.lab_id || row.labId,
            orderId: row.order_id || row.orderId,
            date: row.date,
            concept: row.concept,
            cost: Number(row.cost) || 0,
            status: row.status,
            labName: row.lab_name || row.labName,
            clientName: row.client_name || row.clientName,
            clientDni: row.client_dni || row.clientDni,
            prescription: row.prescription,
            crystalDetails: row.crystal_details || row.crystalDetails,
            treatments: row.treatments,
            estimatedLabDeliveryDate: row.estimated_lab_delivery_date || row.estimatedLabDeliveryDate,
            observaciones: row.observaciones,
            branchName: row.branch_name || row.branchName,
            sellerName: row.seller_name || row.sellerName
          }));
          setJobs(mappedJobs);
        }

        const { data: dbPayments, error: pErr } = await supabase.from('lab_payments').select('*');
        if (!pErr && dbPayments) {
          const mappedPayments: LabPayment[] = dbPayments.map(row => ({
            id: row.id,
            labId: row.lab_id || row.labId,
            date: row.date,
            amount: Number(row.amount) || 0,
            reference: row.reference
          }));
          setPayments(mappedPayments);
        }
      } catch (err) {
        console.warn("Could not load lab data from Supabase:", err);
      }
    }
    loadLabDataFromSupabase();
  }, []);

  const addLab = async (lab: Omit<Lab, 'id'>) => {
    const newLab: Lab = { ...lab, id: Date.now().toString() };
    try {
      const { error } = await supabase.from('labs').upsert([newLab]);
      if (error) {
        alert(`⚠️ Error al registrar el laboratorio en la base de datos: ${error.message}`);
        throw error;
      }
      setLabs(prev => [...prev, newLab]);
    } catch (e: any) {
      console.error("Supabase addLab error:", e);
      alert(`⚠️ Error al conectar con la base de datos: ${e?.message || 'Error desconocido'}`);
      throw e;
    }
  };

  const updateLab = async (lab: Lab) => {
    try {
      const { error } = await supabase.from('labs').upsert([lab]);
      if (error) {
        alert(`⚠️ Error al actualizar laboratorio en la base de datos: ${error.message}`);
        throw error;
      }
      setLabs(prev => prev.map(l => l.id === lab.id ? lab : l));
    } catch (e: any) {
      console.error("Supabase updateLab error:", e);
      alert(`⚠️ Error al actualizar en la base de datos: ${e?.message || 'Error desconocido'}`);
      throw e;
    }
  };

  const deleteLab = async (id: string) => {
    try {
      const { error } = await supabase.from('labs').delete().eq('id', id);
      if (error) {
        alert(`⚠️ Error al eliminar el laboratorio de la base de datos: ${error.message}`);
        throw error;
      }
      setLabs(prev => prev.filter(l => l.id !== id));
    } catch (e: any) {
      console.error("Supabase deleteLab error:", e);
      alert(`⚠️ Error al eliminar de la base de datos: ${e?.message || 'Error desconocido'}`);
      throw e;
    }
  };

  const addJob = async (job: Omit<LabJob, 'id'>) => {
    const newJob: LabJob = { ...job, id: Date.now().toString() };
    setJobs(prev => [...prev, newJob]);
    try {
      await supabase.from('lab_jobs').upsert([{
        id: newJob.id,
        lab_id: newJob.labId,
        order_id: newJob.orderId,
        date: newJob.date,
        concept: newJob.concept,
        cost: newJob.cost,
        status: newJob.status,
        lab_name: newJob.labName,
        client_name: newJob.clientName,
        client_dni: newJob.clientDni,
        prescription: newJob.prescription,
        crystal_details: newJob.crystalDetails,
        treatments: newJob.treatments,
        estimated_lab_delivery_date: newJob.estimatedLabDeliveryDate,
        observaciones: newJob.observaciones,
        branch_name: newJob.branchName,
        seller_name: newJob.sellerName
      }]);
    } catch (e) {
      console.error("Supabase addJob error:", e);
    }
  };

  const updateJobStatus = async (id: string, status: LabJobStatus) => {
    // Sincronizar estado con la orden comercial del cliente
    const targetJob = jobs.find(j => j.id === id);
    if (targetJob && targetJob.orderId) {
      let mappedOrderStatus = 'En Taller';
      if (status === 'Recibido') {
        mappedOrderStatus = 'Para Retirar';
      } else if (status === 'Entregado') {
        mappedOrderStatus = 'Entregado';
      } else if (status === 'Demorado') {
        mappedOrderStatus = 'Demorado';
      } else if (status === 'Pendiente' || status === 'Enviado al laboratorio' || status === 'En producción') {
        mappedOrderStatus = 'En Taller';
      }
      updateOrderStatus(targetJob.orderId, mappedOrderStatus);
    }

    setJobs(prevJobs => {
      const updated = prevJobs.map(j => j.id === id ? { ...j, status } : j);
      
      const job = prevJobs.find(j => j.id === id);
      if (job && job.status !== status) {
        let notifType: 'info' | 'success' | 'warning' = 'info';
        let notifIcon = 'Truck';
        
        if (status === 'Recibido') {
          notifType = 'success';
          notifIcon = 'CheckCircle';
        } else if (status === 'Entregado') {
          notifType = 'success';
          notifIcon = 'ShoppingBag';
        } else if (status === 'Demorado') {
          notifType = 'warning';
          notifIcon = 'AlertTriangle';
        }
        
        addNotification({
          title: `Pedido ${status}`,
          desc: `El trabajo de ${job.concept} (Pedido #${job.orderId}) ha cambiado su estado a ${status}.`,
          type: notifType,
          category: "Info",
          iconName: notifIcon,
          color: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-900/20"
        });
      }
      
      return updated;
    });

    try {
      await supabase.from('lab_jobs').update({ status }).eq('id', id);
    } catch (e) {
      console.error("Supabase updateJobStatus error:", e);
    }
  };

  const updateJobEstimatedDelivery = async (id: string, estimatedLabDeliveryDate: string) => {
    setJobs(prevJobs => prevJobs.map(j => j.id === id ? { ...j, estimatedLabDeliveryDate } : j));
    try {
      await supabase.from('lab_jobs').update({ estimated_lab_delivery_date: estimatedLabDeliveryDate }).eq('id', id);
    } catch (e) {
      console.error("Supabase updateJobEstimatedDelivery error:", e);
    }
  };
  
  const addPayment = async (payment: Omit<LabPayment, 'id'>) => {
    const newPayment: LabPayment = { ...payment, id: Date.now().toString() };
    setPayments(prev => [...prev, newPayment]);
    try {
      await supabase.from('lab_payments').upsert([{
        id: newPayment.id,
        lab_id: newPayment.labId,
        date: newPayment.date,
        amount: newPayment.amount,
        reference: newPayment.reference
      }]);
    } catch (e) {
      console.error("Supabase addPayment error:", e);
    }
  };

  const getLabBalance = (labId: string) => {
    const labJobs = jobs.filter(j => j.labId === labId);
    const labPayments = payments.filter(p => p.labId === labId);
    
    const totalJobs = labJobs.length;
    const totalCost = labJobs.reduce((sum, j) => sum + j.cost, 0);
    const totalPaid = labPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return { totalJobs, totalCost, totalPaid, balance: totalCost - totalPaid };
  };

  return (
    <LabContext.Provider value={{ labs, jobs, payments, addLab, updateLab, deleteLab, addJob, updateJobStatus, updateJobEstimatedDelivery, addPayment, getLabBalance }}>
      {children}
    </LabContext.Provider>
  );
}

export const useLabs = () => {
  const context = useContext(LabContext);
  if (!context) throw new Error('useLabs must be used within a LabProvider');
  return context;
};
