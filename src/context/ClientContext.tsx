import React, { createContext, useContext, useState, ReactNode } from 'react';
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
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: "Juan Pérez", dni: "12345678", phone: "+54 9 11 1234-5678", email: "juan.p@gmail.com", lastVisit: "15 Oct 2023", balance: -4500 },
  { id: '2', name: "Ana García", dni: "32110455", phone: "+54 9 11 8765-4321", email: "agarcia@outlook.com", lastVisit: "12 Oct 2023", balance: 0 },
  { id: '3', name: "Carlos Ruiz", dni: "44551223", phone: "+54 9 343 111-2222", email: "cruiz.opt@gmail.com", lastVisit: "05 Oct 2023", balance: 1200 },
  { id: '4', name: "María González", dni: "28991002", phone: "+54 9 343 333-4444", email: "mariag@gmail.com", lastVisit: "Ayer", balance: 0 },
];

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-2458", clientId: "4", clientName: "María González", date: "2023-10-24", type: "multifocal", service: "Lentes Multifocales", status: "En Taller", amount: 120000, paid: 60000 },
  { id: "ORD-2457", clientId: "1", clientName: "Juan Pérez", date: "2023-10-23", type: "monofocal", service: "Lentes Monofocales", status: "Completado", amount: 45000, paid: 45000 },
  { id: "ORD-2456", clientId: "3", clientName: "Carlos Ruiz", date: "2023-10-22", type: "sale", service: "Armazón Ray-Ban", status: "Para Retirar", amount: 85000, paid: 85000 },
];

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

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
    // In a real app, this would fetch from a separate transactions list or context
    // For now, let's just return an empty array or simulate some
    return [];
  };

  const getClientBalance = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.balance || 0;
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
      getClientBalance
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
