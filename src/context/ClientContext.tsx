import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Order, Transaction } from '../types';
import { supabase } from '../lib/supabase';

interface ClientContextType {
  clients: Client[];
  orders: Order[];
  addClient: (client: Omit<Client, 'id' | 'balance'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  getClientOrders: (clientId: string) => Order[];
  getClientTransactions: (clientId: string) => Transaction[];
  getClientBalance: (clientId: string) => number;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const INITIAL_CLIENTS: Client[] = [];
const INITIAL_ORDERS: Order[] = [];

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch initial data from Supabase
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const { data: dbClients, error: cErr } = await supabase.from('clients').select('*');
        if (!cErr && dbClients) {
          setClients(dbClients);
        }
        const { data: dbOrders, error: oErr } = await supabase.from('orders').select('*');
        if (!oErr && dbOrders) {
          setOrders(dbOrders);
        }
      } catch (err) {
        console.warn("Could not sync with Supabase:", err);
      }
    }
    loadSupabaseData();
  }, []);


  const addClient = async (clientData: Omit<Client, 'id' | 'balance'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      balance: 0,
    };
    setClients(prev => [...prev, newClient]);
    try {
      await supabase.from('clients').upsert([newClient]);
    } catch (e) {
      console.error("Supabase client insert error:", e);
    }
  };

  const updateClient = async (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    try {
      await supabase.from('clients').upsert([updatedClient]);
    } catch (e) {
      console.error("Supabase client update error:", e);
    }
  };

  const deleteClient = async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase client delete error:", e);
    }
  };

  const getClientOrders = (clientId: string) => {
    return orders.filter(o => o.clientId === clientId);
  };

  const getClientTransactions = (clientId: string) => {
    return [];
  };

  const getClientBalance = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.balance || 0;
  };

  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
    };
    setOrders(prev => [newOrder, ...prev]);
    try {
      await supabase.from('orders').upsert([newOrder]);
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
      updateOrderStatus
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
