import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationsContext';
import { supabase } from '../lib/supabase';
import { Client, Order, Transaction } from '../types';
import { useFinance } from './FinanceContext';

interface ClientContextType {
  clients: Client[];
  orders: Order[];
  addClient: (clientData: Omit<Client, 'id' | 'balance'>) => Promise<Client>;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  getClientOrders: (clientId: string) => Order[];
  getClientTransactions: (clientId: string) => Transaction[];
  getClientBalance: (clientId: string) => number;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  payOrderBalance: (orderId: string, amount: number, boxId: string) => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const CLIENT_MOSTRADOR: Client = {
  id: 'cliente-mostrador',
  name: 'Cliente Mostrador',
  firstName: 'Cliente',
  lastName: 'Mostrador',
  dni: '00000000',
  phone: 'N/A',
  email: '',
  balance: 0,
};

const ensureMostradorFirst = (list: Client[]): Client[] => {
  const filtered = list.filter(c => c.id !== 'cliente-mostrador' && c.name.toLowerCase() !== 'cliente mostrador');
  return [CLIENT_MOSTRADOR, ...filtered];
};

export function ClientProvider({ children }: { children: ReactNode }) {
  const { boxes, addTransaction } = useFinance();
  const [clients, setClients] = useState<Client[]>([CLIENT_MOSTRADOR]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Helper de mapeo de Supabase (snake_case) a Client (camelCase)
  const mapDbClientToClient = (c: any): Client => ({
    id: String(c.id),
    name: c.name || '',
    firstName: c.first_name || c.firstName || '',
    lastName: c.last_name || c.lastName || '',
    dni: c.dni || '',
    phone: c.phone || '',
    email: c.email || '',
    birthDate: c.birth_date || c.birthDate || '',
    age: c.age || '',
    address: typeof c.address === 'object' && c.address !== null ? c.address : { street: '', number: '', floor: '', apartment: '' },
    insurance: c.insurance || '',
    insuranceId: c.insurance_id || c.insuranceId || '',
    insurancePlan: c.insurance_plan || c.insurancePlan || '',
    affiliateNumber: c.affiliate_number || c.affiliateNumber || '',
    lastVisit: c.last_visit || c.lastvisit || new Date().toISOString().split('T')[0],
    balance: Number(c.balance) || 0,
  });

  // Helper de mapeo de Client (camelCase) a Supabase (snake_case)
  const mapClientToDbClient = (c: Client) => ({
    id: c.id,
    name: c.name,
    first_name: c.firstName,
    last_name: c.lastName,
    dni: c.dni,
    phone: c.phone,
    email: c.email,
    birth_date: c.birthDate,
    age: c.age,
    address: c.address,
    insurance: c.insurance,
    insurance_id: c.insuranceId,
    insurance_plan: c.insurancePlan,
    affiliate_number: c.affiliateNumber,
    last_visit: c.lastVisit,
    balance: c.balance
  });

  // Fetch initial data from Supabase
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const { data: dbClients, error: cErr } = await supabase.from('clients').select('*');
        if (!cErr && dbClients) {
          const mapped = dbClients.map(mapDbClientToClient);
          setClients(ensureMostradorFirst(mapped));
        }
        const { data: dbOrders, error: oErr } = await supabase.from('orders').select('*');
        if (!oErr && dbOrders) {
          setOrders(dbOrders.map(mapDbOrderToOrder));
        }
      } catch (err) {
        console.warn("Could not sync with Supabase:", err);
      }
    }
    loadSupabaseData();
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'balance'>): Promise<Client> => {
    const existing = clients.find(c => c.dni.trim() === clientData.dni.trim());
    if (existing) {
      alert(`Ya existe un cliente registrado con el DNI ${clientData.dni}: ${existing.name}`);
      throw new Error(`DNI Duplicado: ${clientData.dni}`);
    }

    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      balance: 0,
    };

    try {
      const { error } = await supabase.from('clients').upsert([mapClientToDbClient(newClient)]);
      if (error) {
        alert(`⚠️ Error al guardar el cliente en la base de datos: ${error.message}`);
        throw error;
      }
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (e: any) {
      console.error("Supabase client insert error:", e);
      if (!e?.message?.includes('DNI Duplicado')) {
        alert(`⚠️ Error al conectar con la base de datos: ${e?.message || 'Error desconocido'}`);
      }
      throw e;
    }
  };

  const updateClient = async (updatedClient: Client) => {
    try {
      const { error } = await supabase.from('clients').upsert([mapClientToDbClient(updatedClient)]);
      if (error) {
        alert(`⚠️ Error al actualizar el cliente en la base de datos: ${error.message}`);
        throw error;
      }
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    } catch (e: any) {
      console.error("Supabase client update error:", e);
      alert(`⚠️ Error al actualizar en la base de datos: ${e?.message || 'Error desconocido'}`);
      throw e;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        alert(`⚠️ Error al eliminar el cliente de la base de datos: ${error.message}`);
        throw error;
      }
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      console.error("Supabase client delete error:", e);
      alert(`⚠️ Error al eliminar de la base de datos: ${e?.message || 'Error desconocido'}`);
      throw e;
    }
  };

  const getClientOrders = (clientId: string) => {
    const client = clients.find(c => c.id === clientId || c.dni === clientId);
    return orders.filter(o => 
      o.clientId === clientId || 
      (client && (o.clientId === client.id || (client.dni && o.clientId === client.dni) || (client.name && o.clientName?.toLowerCase() === client.name.toLowerCase())))
    );
  };

  const getClientTransactions = (clientId: string) => {
    return [];
  };

  const getClientBalance = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.balance || 0;
  };

  // Helper de mapeo de Supabase (snake_case) a Order (camelCase)
  const mapDbOrderToOrder = (o: any): Order => ({
    id: String(o.id),
    clientId: String(o.client_id || o.clientid || ''),
    clientName: o.client_name || o.clientname || '',
    date: o.date,
    type: o.type,
    service: o.service,
    status: o.status,
    amount: Number(o.amount) || 0,
    paid: Number(o.paid) || 0,
    medico: o.medico || '',
    branchId: o.branch_id || o.branchId || '',
    senaMethodId: o.sena_method_id || '',
    previstoMethodId: o.previsto_method_id || ''
  });

  // Helper de mapeo de Order (camelCase) a Supabase (snake_case)
  const mapOrderToDbOrder = (o: Order) => ({
    id: o.id,
    client_id: o.clientId,
    client_name: o.clientName,
    date: o.date,
    type: o.type,
    service: o.service,
    status: o.status,
    amount: o.amount,
    paid: o.paid,
    medico: o.medico,
    branch_id: o.branchId,
    sena_method_id: o.senaMethodId || null,
    previsto_method_id: o.previstoMethodId || null
  });

  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
    };
    setOrders(prev => [newOrder, ...prev]);
    try {
      await supabase.from('orders').upsert([mapOrderToDbOrder(newOrder)]);
    } catch (e) {
      console.error("Supabase order insert error:", e);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch (e) {
      console.error("Supabase order update status error:", e);
    }
  };

  const payOrderBalance = async (orderId: string, amount: number, boxId: string) => {
    let targetOrder: Order | null = null;
    
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        targetOrder = {
          ...o,
          paid: o.paid + amount
        };
        return targetOrder;
      }
      return o;
    }));

    // Register transaction in Finance
    setTimeout(() => {
      if (!targetOrder) return;
      const box = boxes.find(b => b.id === boxId);
      const boxName = box?.name || 'Caja';
      
      addTransaction({
        id: `tx-balance-pay-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        concept: `Cobro Saldo Pedido ${targetOrder.id} - Cliente: ${targetOrder.clientName}`,
        method: boxName,
        amount: amount,
        type: 'income',
        category: 'ventas',
        boxId: boxId,
        clientId: targetOrder.clientId,
        clientName: targetOrder.clientName
      });
    }, 100);

    try {
      await supabase.from('orders').update({ paid: (targetOrder ? (targetOrder as Order).paid : 0) }).eq('id', orderId);
    } catch (e) {
      console.error("Error updating order balance in Supabase:", e);
    }
  };

  return (
    <ClientContext.Provider value={{
      clients,
      orders,
      addClient,
      updateClient,
      deleteClient,
      getClientOrders,
      getClientTransactions,
      getClientBalance,
      addOrder,
      updateOrderStatus,
      payOrderBalance
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}
