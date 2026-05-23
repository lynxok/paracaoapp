import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CashBox, Transaction, FinanceCategory, Supplier, SupplierTransaction } from '../types';

interface FinanceContextType {
  boxes: CashBox[];
  transactions: Transaction[];
  suppliers: Supplier[];
  addTransaction: (tx: Transaction) => void;
  addBox: (box: CashBox) => void;
  transferFunds: (fromId: string, toId: string, amount: number, concept: string) => void;
  addSupplierTransaction: (supplierId: string, tx: Omit<SupplierTransaction, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'balance' | 'transactions'>) => void;
  linkPaymentToInvoices: (supplierId: string, invoiceIds: string[]) => void;
  toggleTransactionReconciliation: (transactionId: string) => void;
  updateBoxClosingBalance: (boxId: string, balance: number) => void;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  { 
    id: "sup-1", 
    code: "PV-001",
    name: "Luxottica Group", 
    cuit: "30-12345678-9",
    cbu: "1234567890123456789012",
    contact: "Carlos Varela", 
    email: "c.varela@lux.com", 
    phone: "+54 9 11 2233-4455", 
    category: "Armazones Premium", 
    paymentTerms: "30 días",
    balance: 0,
    transactions: []
  },
  { 
    id: "sup-2", 
    code: "PV-002",
    name: "Essilor S.A.", 
    cuit: "30-87654321-0",
    cbu: "9876543210987654321098",
    contact: "Marta Gómez", 
    email: "marta.g@essilor.com", 
    phone: "+54 9 11 3344-5566", 
    category: "Cristales", 
    paymentTerms: "Contado",
    balance: 1240,
    transactions: [
      { id: 'st-1', date: '2023-10-20', voucherNumber: 'FC-A-0001-00001234', amount: 1240, type: 'invoice', status: 'pending', description: 'Compra de cristales tallados' }
    ]
  },
  { 
    id: "sup-3", 
    code: "PV-003",
    name: "Bausch + Lomb", 
    cuit: "33-55667788-2",
    cbu: "0000000000000000000000",
    contact: "Jorge Ríos", 
    email: "jrios@bausch.com", 
    phone: "+54 9 11 4455-6677", 
    category: "Lentes Contacto", 
    paymentTerms: "60 días",
    balance: 450,
    transactions: [
      { id: 'st-2', date: '2023-10-15', voucherNumber: 'FC-A-0001-00005566', amount: 450, type: 'invoice', status: 'pending', description: 'Pack de lentes de contacto' }
    ]
  },
];

const INITIAL_BOXES: CashBox[] = [
  {
    id: 'caja-efectivo',
    name: 'Caja Efectivo',
    type: 'cash',
    initialBalance: 500,
    incomes: 1250,
    expenses: 120,
    expectedCash: 1630,
    physicalCount: {},
  },
  {
    id: 'santander-1',
    name: 'Santander 1',
    type: 'bank',
    initialBalance: 15400,
    incomes: 45000,
    expenses: 12000,
  },
  {
    id: 'galicia-1',
    name: 'Banco Galicia',
    type: 'bank',
    initialBalance: 8500,
    incomes: 12000,
    expenses: 3000,
  },
  {
    id: 'tc-holding',
    name: 'Tarjeta de Crédito (Pendiente)',
    type: 'credit_card',
    initialBalance: 0,
    incomes: 0,
    expenses: 0,
  },
  {
    id: 'mercado-pago',
    name: 'Mercado Pago',
    type: 'digital',
    initialBalance: 1200,
    incomes: 5600,
    expenses: 800,
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-24', time: "16:50", concept: "Insumos Limpieza", method: "Efectivo", amount: 120, type: 'expense', category: 'limpieza', boxId: 'caja-efectivo' },
  { id: '2', date: '2023-10-24', time: "14:20", concept: "Venta #10236: Lentes Contacto", method: "Tarjeta Crédito", amount: 1200, type: 'income', category: 'ventas', boxId: 'tc-holding', clientName: 'Juan Perez' },
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boxes, setBoxes] = useState<CashBox[]>(INITIAL_BOXES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
    setBoxes(prev => prev.map(b => {
      if (b.id === tx.boxId) {
        return {
          ...b,
          incomes: tx.type === 'income' ? b.incomes + tx.amount : b.incomes,
          expenses: tx.type === 'expense' ? b.expenses + tx.amount : b.expenses,
          expectedCash: b.type === 'cash' ? (b.expectedCash || 0) + (tx.type === 'income' ? tx.amount : -tx.amount) : b.expectedCash
        };
      }
      return b;
    }));
  };

  const addSupplierTransaction = (supplierId: string, txData: Omit<SupplierTransaction, 'id'>) => {
    const newTx: SupplierTransaction = {
      ...txData,
      id: `st-${Date.now()}`
    };

    setSuppliers(prev => prev.map(sup => {
      if (sup.id === supplierId) {
        const newBalance = txData.type === 'invoice' 
          ? sup.balance + txData.amount 
          : sup.balance - txData.amount;
        
        return {
          ...sup,
          balance: newBalance,
          transactions: [newTx, ...sup.transactions]
        };
      }
      return sup;
    }));
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'balance' | 'transactions'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      balance: 0,
      transactions: []
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const linkPaymentToInvoices = (supplierId: string, invoiceIds: string[]) => {
    setSuppliers(prev => prev.map(sup => {
      if (sup.id === supplierId) {
        const updatedTransactions = sup.transactions.map(tx => {
          if (invoiceIds.includes(tx.id)) {
            return { ...tx, status: 'paid' as const };
          }
          return tx;
        });
        return {
          ...sup,
          transactions: updatedTransactions
        };
      }
      return sup;
    }));
  };

  const toggleTransactionReconciliation = (transactionId: string) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === transactionId ? { ...tx, reconciled: !tx.reconciled } : tx
    ));
  };

  const updateBoxClosingBalance = (boxId: string, balance: number) => {
    setBoxes(prev => prev.map(box => 
      box.id === boxId ? { ...box, lastClosingBalance: balance } : box
    ));
  };

  const addBox = (box: CashBox) => {
    setBoxes(prev => [...prev, box]);
  };

  const transferFunds = (fromId: string, toId: string, amount: number, concept: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const expenseTx: Transaction = {
      id: `tx-${Date.now()}-exp`,
      date: dateStr,
      time: timeStr,
      concept: `Transferencia: ${concept}`,
      method: 'Transferencia',
      amount: amount,
      type: 'expense',
      category: 'transferencia',
      boxId: fromId,
    };

    const incomeTx: Transaction = {
      id: `tx-${Date.now()}-inc`,
      date: dateStr,
      time: timeStr,
      concept: `Recepción: ${concept}`,
      method: 'Transferencia',
      amount: amount,
      type: 'income',
      category: 'transferencia',
      boxId: toId,
    };

    addTransaction(expenseTx);
    addTransaction(incomeTx);
  };

  return (
    <FinanceContext.Provider value={{ 
      boxes, 
      transactions, 
      suppliers,
      addTransaction, 
      addBox, 
      transferFunds,
      addSupplierTransaction,
      updateSupplier,
      addSupplier,
      linkPaymentToInvoices,
      toggleTransactionReconciliation,
      updateBoxClosingBalance
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
