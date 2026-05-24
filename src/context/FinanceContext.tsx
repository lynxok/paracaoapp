import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CashBox, Transaction, FinanceCategory, Supplier, SupplierTransaction } from '../types';
import { useNotifications } from './NotificationsContext';

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

const INITIAL_SUPPLIERS: Supplier[] = [];

const INITIAL_BOXES: CashBox[] = [
  {
    id: 'caja-efectivo',
    name: 'Caja Efectivo',
    type: 'cash',
    initialBalance: 0,
    incomes: 0,
    expenses: 0,
    expectedCash: 0,
    physicalCount: {},
  },
  {
    id: 'santander-1',
    name: 'Santander 1',
    type: 'bank',
    initialBalance: 0,
    incomes: 0,
    expenses: 0,
  },
  {
    id: 'galicia-1',
    name: 'Banco Galicia',
    type: 'bank',
    initialBalance: 0,
    incomes: 0,
    expenses: 0,
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
    initialBalance: 0,
    incomes: 0,
    expenses: 0,
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boxes, setBoxes] = useState<CashBox[]>(() => {
    const saved = localStorage.getItem('optica_finance_boxes');
    return saved ? JSON.parse(saved) : INITIAL_BOXES;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('optica_finance_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('optica_finance_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  useEffect(() => {
    localStorage.setItem('optica_finance_boxes', JSON.stringify(boxes));
  }, [boxes]);

  useEffect(() => {
    localStorage.setItem('optica_finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('optica_finance_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

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

  const { addNotification } = useNotifications();

  const updateBoxClosingBalance = (boxId: string, balance: number) => {
    setBoxes(prev => {
      const box = prev.find(b => b.id === boxId);
      if (box) {
        addNotification({
          title: "Cierre de Caja Exitoso",
          desc: `La caja "${box.name}" fue cerrada con un balance de $${balance}.`,
          type: "success",
          category: "Sistema",
          iconName: "CheckCircle",
          color: "text-emerald-500",
          bg: "bg-emerald-50 dark:bg-emerald-900/20"
        });
      }
      return prev.map(b => b.id === boxId ? { ...b, lastClosingBalance: balance } : b);
    });
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
