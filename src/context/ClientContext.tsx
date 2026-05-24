import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Order, Transaction } from '../types';

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
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('optica_clients');
    if (saved) return JSON.parse(saved);
    return INITIAL_CLIENTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('optica_orders');
    if (saved) return JSON.parse(saved);
    return INITIAL_ORDERS;
  });

  // Save to localStorage whenever clients or orders change
  useEffect(() => {
    localStorage.setItem('optica_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('optica_orders', JSON.stringify(orders));
  }, [orders]);

  const addClient = (clientData: Omit<Client, 'id' | 'balance'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      balance: 0,
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
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

  const addOrder = (orderData: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
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
