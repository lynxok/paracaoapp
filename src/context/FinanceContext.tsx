import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CashBox, Transaction, FinanceCategory, Supplier, SupplierTransaction } from '../types';
import { useNotifications } from './NotificationsContext';

interface FinanceContextType {
  boxes: CashBox[];
  transactions: Transaction[];
  suppliers: Supplier[];
  addTransaction: (tx: Transaction) => void;
  voidTransaction: (txId: string) => void;
  addBox: (box: CashBox) => void;
  transferFunds: (fromId: string, toId: string, amount: number, concept: string) => void;
  addSupplierTransaction: (supplierId: string, tx: Omit<SupplierTransaction, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'balance' | 'transactions'>) => void;
  linkPaymentToInvoices: (supplierId: string, invoiceIds: string[]) => void;
  toggleTransactionReconciliation: (transactionId: string) => void;
  updateBoxClosingBalance: (boxId: string, balance: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

import { supabase } from '../lib/supabase';

const DEFAULT_CASH_BOX: CashBox = {
  id: 'caja-efectivo',
  name: 'Caja Efectivo',
  type: 'cash',
  initialBalance: 0,
  incomes: 0,
  expenses: 0,
  expectedCash: 0,
  physicalCount: {},
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boxes, setBoxes] = useState<CashBox[]>([DEFAULT_CASH_BOX]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Load boxes, transactions, and suppliers directly from Supabase on mount
  useEffect(() => {
    async function loadFinanceData() {
      try {
        // 1. Fetch Banks to dynamically construct Bank CashBoxes
        const { data: dbBanks } = await supabase.from('banks').select('*');
        const activeBanks: any[] = dbBanks || [];

        const dynamicBankBoxes: CashBox[] = activeBanks.map((b: any) => ({
          id: `bank-${b.id}`,
          name: b.name,
          type: b.name.toLowerCase().includes('pago') || b.name.toLowerCase().includes('digital') ? 'digital' : 'bank',
          initialBalance: 0,
          incomes: 0,
          expenses: 0
        }));

        const initialBoxes = [DEFAULT_CASH_BOX, ...dynamicBankBoxes];

        // 2. Fetch Transactions
        const { data: dbTx } = await supabase.from('transactions').select('*');
        let loadedTx: Transaction[] = [];
        if (dbTx && dbTx.length > 0) {
          loadedTx = dbTx.map((t: any) => ({
            id: t.id,
            date: t.date,
            time: t.time,
            concept: t.concept,
            method: t.method,
            amount: Number(t.amount),
            type: t.type,
            category: t.category,
            boxId: t.box_id,
            clientId: t.client_id,
            clientName: t.client_name,
            reconciled: t.reconciled
          }));
          setTransactions(loadedTx);
        }

        // Calculate box expected values based on loaded transactions
        const updatedBoxes = initialBoxes.map(box => {
          const boxTx = loadedTx.filter(t => t.boxId === box.id);
          const incomes = boxTx.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
          const expenses = boxTx.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
          return {
            ...box,
            incomes,
            expenses,
            expectedCash: box.type === 'cash' ? (box.initialBalance || 0) + incomes - expenses : undefined
          };
        });
        setBoxes(updatedBoxes);

        // 3. Fetch Suppliers & their Transactions
        const { data: dbSuppliers } = await supabase.from('suppliers').select('*');
        const { data: dbSupTx } = await supabase.from('supplier_transactions').select('*');

        if (dbSuppliers) {
          const mappedSuppliers: Supplier[] = dbSuppliers.map((s: any) => {
            const txs = (dbSupTx || [])
              .filter((t: any) => t.supplier_id === s.id)
              .map((t: any) => ({
                id: t.id,
                date: t.date,
                dueDate: t.due_date,
                paymentTerms: t.payment_terms,
                voucherNumber: t.voucher_number,
                amount: Number(t.amount),
                type: t.type,
                status: t.status,
                description: t.description
              }));
            return {
              id: s.id,
              code: s.code || '',
              name: s.name,
              cuit: s.cuit || '',
              cbu: s.cbu || '',
              contact: s.contact || '',
              email: s.email || '',
              phone: s.phone || '',
              category: s.category || '',
              paymentTerms: s.payment_terms || '',
              balance: Number(s.balance || 0),
              transactions: txs
            };
          });
          setSuppliers(mappedSuppliers);
        }
      } catch (e) {
        console.warn("Could not load finance data from Supabase:", e);
      }
    }
    loadFinanceData();
  }, []);

  const addTransaction = async (tx: Transaction) => {
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

    try {
      await supabase.from('transactions').upsert([{
        id: tx.id,
        date: tx.date,
        time: tx.time,
        concept: tx.concept,
        method: tx.method,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        box_id: tx.boxId,
        client_id: tx.clientId,
        client_name: tx.clientName,
        reconciled: tx.reconciled || false
      }]);
    } catch (e) {
      console.error("Supabase addTransaction error:", e);
    }
  };

  const addSupplierTransaction = async (supplierId: string, txData: Omit<SupplierTransaction, 'id'>) => {
    const newTx: SupplierTransaction = {
      ...txData,
      id: `st-${Date.now()}`
    };

    let calculatedNewBalance: number | null = null;

    setSuppliers(prev => prev.map(sup => {
      if (sup.id === supplierId) {
        const newBalance = txData.type === 'invoice' 
          ? sup.balance + txData.amount 
          : sup.balance - txData.amount;
        
        calculatedNewBalance = newBalance;

        return {
          ...sup,
          balance: newBalance,
          transactions: [newTx, ...sup.transactions]
        };
      }
      return sup;
    }));

    if (calculatedNewBalance !== null) {
      try {
        await supabase.from('suppliers').update({ balance: calculatedNewBalance }).eq('id', supplierId);
      } catch (e) {
        console.error("Supabase update balance error:", e);
      }
    }

    try {
      await supabase.from('supplier_transactions').upsert([{
        id: newTx.id,
        supplier_id: supplierId,
        date: newTx.date,
        due_date: newTx.dueDate,
        payment_terms: newTx.paymentTerms,
        voucher_number: newTx.voucherNumber,
        amount: newTx.amount,
        type: newTx.type,
        status: newTx.status,
        description: newTx.description
      }]);
    } catch (e) {
      console.error("Supabase addSupplierTransaction error:", e);
    }
  };

  const updateSupplier = async (supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
    try {
      await supabase.from('suppliers').upsert([{
        id: supplier.id,
        code: supplier.code,
        name: supplier.name,
        cuit: supplier.cuit,
        cbu: supplier.cbu,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        category: supplier.category,
        payment_terms: supplier.paymentTerms,
        balance: supplier.balance
      }]);
    } catch (e) {
      console.error("Supabase updateSupplier error:", e);
    }
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'balance' | 'transactions'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      balance: 0,
      transactions: []
    };
    setSuppliers(prev => [...prev, newSupplier]);
    try {
      await supabase.from('suppliers').upsert([{
        id: newSupplier.id,
        code: newSupplier.code,
        name: newSupplier.name,
        cuit: newSupplier.cuit,
        cbu: newSupplier.cbu,
        contact: newSupplier.contact,
        email: newSupplier.email,
        phone: newSupplier.phone,
        category: newSupplier.category,
        payment_terms: newSupplier.paymentTerms,
        balance: newSupplier.balance
      }]);
    } catch (e) {
      console.error("Supabase addSupplier error:", e);
    }
  };

  const linkPaymentToInvoices = async (supplierId: string, invoiceIds: string[]) => {
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

    try {
      await Promise.all(
        invoiceIds.map(id =>
          supabase.from('supplier_transactions').update({ status: 'paid' }).eq('id', id)
        )
      );
    } catch (e) {
      console.error("Supabase linkPaymentToInvoices error:", e);
    }
  };

  const toggleTransactionReconciliation = async (transactionId: string) => {
    let reconciledVal = false;
    setTransactions(prev => prev.map(tx => {
      if (tx.id === transactionId) {
        reconciledVal = !tx.reconciled;
        return { ...tx, reconciled: reconciledVal };
      }
      return tx;
    }));
    try {
      await supabase.from('transactions').update({ reconciled: reconciledVal }).eq('id', transactionId);
    } catch (e) {
      console.error("Supabase toggleTransactionReconciliation error:", e);
    }
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

  // Realtime subscription for banks table updates
  useEffect(() => {
    const channel = supabase
      .channel('banks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banks' },
        (payload: any) => {
          if (payload.new && payload.new.name) {
            const b = payload.new;
            const newBox: CashBox = {
              id: `bank-${b.id}`,
              name: b.name,
              type: b.name.toLowerCase().includes('pago') || b.name.toLowerCase().includes('digital') ? 'digital' : 'bank',
              initialBalance: 0,
              incomes: 0,
              expenses: 0
            };
            setBoxes(prev => {
              if (prev.some(existing => existing.id === newBox.id || existing.name.toLowerCase() === newBox.name.toLowerCase())) {
                return prev;
              }
              return [...prev, newBox];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addBox = async (box: CashBox) => {
    setBoxes(prev => {
      if (prev.some(b => b.id === box.id)) return prev;
      return [...prev, box];
    });

    if (box.type === 'bank' || box.type === 'digital') {
      try {
        const cleanId = box.id.replace('bank-', '').replace('box-', '');
        await supabase.from('banks').upsert([{
          id: cleanId,
          name: box.name
        }]);
      } catch (e) {
        console.error("Error saving box to Supabase banks table:", e);
      }
    }
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

  const voidTransaction = async (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== txId));
    setBoxes(prev => prev.map(b => {
      if (b.id === tx.boxId) {
        return {
          ...b,
          incomes: tx.type === 'income' ? b.incomes - tx.amount : b.incomes,
          expenses: tx.type === 'expense' ? b.expenses - tx.amount : b.expenses,
          expectedCash: b.type === 'cash' ? (b.expectedCash || 0) - (tx.type === 'income' ? tx.amount : -tx.amount) : b.expectedCash
        };
      }
      return b;
    }));

    try {
      await supabase.from('transactions').delete().eq('id', txId);
    } catch (e) {
      console.error("Supabase voidTransaction error:", e);
    }
  };

  return (
    <FinanceContext.Provider value={{ 
      boxes, 
      transactions, 
      suppliers,
      addTransaction, 
      voidTransaction,
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
