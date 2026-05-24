import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationsContext';

export interface Lab {
  id: string;
  name: string;
  contact?: string;
}

export interface LabJob {
  id: string;
  labId: string;
  date: string;
  orderId: string;
  concept: string;
  cost: number;
  status: 'Pendiente' | 'Procesado';
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
  updateJobStatus: (id: string, status: 'Pendiente' | 'Procesado') => void;
  addPayment: (payment: Omit<LabPayment, 'id'>) => void;
  getLabBalance: (labId: string) => { totalJobs: number; totalCost: number; totalPaid: number; balance: number };
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export function LabProvider({ children }: { children: ReactNode }) {
  const [labs, setLabs] = useState<Lab[]>(() => {
    const saved = localStorage.getItem('optica_labs');
    return saved ? JSON.parse(saved) : [];
  });

  const [jobs, setJobs] = useState<LabJob[]>(() => {
    const saved = localStorage.getItem('optica_lab_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [payments, setPayments] = useState<LabPayment[]>(() => {
    const saved = localStorage.getItem('optica_lab_payments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('optica_labs', JSON.stringify(labs)); }, [labs]);
  useEffect(() => { localStorage.setItem('optica_lab_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('optica_lab_payments', JSON.stringify(payments)); }, [payments]);

  const { addNotification } = useNotifications();

  const addLab = (lab: Omit<Lab, 'id'>) => setLabs([...labs, { ...lab, id: Date.now().toString() }]);
  const updateLab = (lab: Lab) => setLabs(labs.map(l => l.id === lab.id ? lab : l));
  const deleteLab = (id: string) => setLabs(labs.filter(l => l.id !== id));

  const addJob = (job: Omit<LabJob, 'id'>) => setJobs([...jobs, { ...job, id: Date.now().toString() }]);
  const updateJobStatus = (id: string, status: 'Pendiente' | 'Procesado') => {
    setJobs(prevJobs => {
      const updated = prevJobs.map(j => j.id === id ? { ...j, status } : j);
      
      if (status === 'Procesado') {
        const job = prevJobs.find(j => j.id === id);
        if (job && job.status !== 'Procesado') {
          addNotification({
            title: "Trabajo de Laboratorio Procesado",
            desc: `El trabajo de ${job.concept} (Pedido #${job.orderId}) ha sido procesado por el laboratorio.`,
            type: "success",
            category: "Info",
            iconName: "Truck",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
          });
        }
      }
      
      return updated;
    });
  };
  
  const addPayment = (payment: Omit<LabPayment, 'id'>) => setPayments([...payments, { ...payment, id: Date.now().toString() }]);

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
