import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationsContext';
import { supabase } from '../lib/supabase';

export interface Lab {
  id: string;
  name: string;
  contact?: string;
}

export type LabJobStatus = 'Pendiente' | 'Enviado al laboratorio' | 'En producción' | 'Recibido' | 'Entregado';

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
  addPayment: (payment: Omit<LabPayment, 'id'>) => void;
  getLabBalance: (labId: string) => { totalJobs: number; totalCost: number; totalPaid: number; balance: number };
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export function LabProvider({ children }: { children: ReactNode }) {
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
        if (!jErr && dbJobs) setJobs(dbJobs);

        const { data: dbPayments, error: pErr } = await supabase.from('lab_payments').select('*');
        if (!pErr && dbPayments) setPayments(dbPayments);
      } catch (err) {
        console.warn("Could not load lab data from Supabase:", err);
      }
    }
    loadLabDataFromSupabase();
  }, []);

  const { addNotification } = useNotifications();

  const addLab = async (lab: Omit<Lab, 'id'>) => {
    const newLab: Lab = { ...lab, id: Date.now().toString() };
    setLabs(prev => [...prev, newLab]);
    try {
      await supabase.from('labs').upsert([newLab]);
    } catch (e) {
      console.error("Supabase addLab error:", e);
    }
  };

  const updateLab = async (lab: Lab) => {
    setLabs(prev => prev.map(l => l.id === lab.id ? lab : l));
    try {
      await supabase.from('labs').upsert([lab]);
    } catch (e) {
      console.error("Supabase updateLab error:", e);
    }
  };

  const deleteLab = async (id: string) => {
    setLabs(prev => prev.filter(l => l.id !== id));
    try {
      await supabase.from('labs').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase deleteLab error:", e);
    }
  };

  const addJob = async (job: Omit<LabJob, 'id'>) => {
    const newJob: LabJob = { ...job, id: Date.now().toString() };
    setJobs(prev => [...prev, newJob]);
    try {
      await supabase.from('lab_jobs').upsert([newJob]);
    } catch (e) {
      console.error("Supabase addJob error:", e);
    }
  };

  const updateJobStatus = async (id: string, status: LabJobStatus) => {
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
  
  const addPayment = async (payment: Omit<LabPayment, 'id'>) => {
    const newPayment: LabPayment = { ...payment, id: Date.now().toString() };
    setPayments(prev => [...prev, newPayment]);
    try {
      await supabase.from('lab_payments').upsert([newPayment]);
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
    <LabContext.Provider value={{ labs, jobs, payments, addLab, updateLab, deleteLab, addJob, updateJobStatus, addPayment, getLabBalance }}>
      {children}
    </LabContext.Provider>
  );
}

export const useLabs = () => {
  const context = useContext(LabContext);
  if (!context) throw new Error('useLabs must be used within a LabProvider');
  return context;
};
