import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CashBox, CashBoxType, Transaction, FinanceCategory, Supplier, SupplierTransaction, Cheque } from '../types';
import { useNotifications } from './NotificationsContext';

interface FinanceContextType {
  boxes: CashBox[];
  transactions: Transaction[];
  suppliers: Supplier[];
  cheques: Cheque[];
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
  addCheques: (chequesList: Cheque[]) => void;
  updateChequeStatus: (id: string, status: Cheque['status'], boxId?: string) => void;
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
  const [cheques, setCheques] = useState<Cheque[]>([]);

  // Load boxes, transactions, and suppliers directly from Supabase on mount
  useEffect(() => {
    async function loadFinanceData() {
      try {
        // Helper mapping function for Cajas
        const mapBankToCashBox = (b: any): CashBox => {
          let type: CashBoxType = 'bank';
          if (b.type === 'Caja Efectivo') type = 'cash';
          else if (b.type === 'Tarjeta de Credito') type = 'credit_card';
          else if (b.type === 'Transferencia') type = 'bank';
          else {
            const nameLower = b.name.toLowerCase();
            if (nameLower.includes('efectivo') || nameLower.includes('caja')) {
              type = 'cash';
            } else if (nameLower.includes('tarjeta') || nameLower.includes('visa') || nameLower.includes('master')) {
              type = 'credit_card';
            } else if (nameLower.includes('pago') || nameLower.includes('digital')) {
              type = 'digital';
            } else {
              type = 'bank';
            }
          }

          let associated: string[] = [];
          if (b.associated_banks) {
            try {
              associated = JSON.parse(b.associated_banks);
            } catch (e) {
              if (typeof b.associated_banks === 'string' && b.associated_banks.length > 0) {
                associated = b.associated_banks.split(',');
              }
            }
          }

          return {
            id: `bank-${b.id}`,
            name: b.name,
            type,
            initialBalance: 0,
            incomes: 0,
            expenses: 0,
            expectedCash: 0,
            physicalCount: {},
            lastClosingBalance: 0,
            associatedBanks: associated.map((id: string) => `bank-${id}`)
          };
        };

        // 1. Fetch Banks to dynamically construct Bank CashBoxes (with local storage fallback)
        let activeBanks: any[] = [];
        try {
          const { data: dbBanks } = await supabase.from('banks').select('*');
          if (dbBanks && dbBanks.length > 0) {
            activeBanks = dbBanks;
          } else {
            const saved = localStorage.getItem('optica_banks');
            if (saved) activeBanks = JSON.parse(saved);
          }
        } catch (e) {
          console.error("Error loading banks from Supabase, loading from localStorage:", e);
          const saved = localStorage.getItem('optica_banks');
          if (saved) activeBanks = JSON.parse(saved);
        }

        const dynamicBankBoxes: CashBox[] = activeBanks.map(mapBankToCashBox);

        // Prepend DEFAULT_CASH_BOX only if no cash box exists in database/local
        const hasCashBox = dynamicBankBoxes.some(box => box.type === 'cash');
        const initialBoxes = hasCashBox ? dynamicBankBoxes : [DEFAULT_CASH_BOX, ...dynamicBankBoxes];

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
        }
        
        // 4. Fetch Cheques
        try {
          const { data: dbCheques } = await supabase.from('cheques').select('*');
          if (dbCheques && dbCheques.length > 0) {
            setCheques(dbCheques.map((c: any) => ({
              id: c.id,
              number: c.number,
              bank: c.bank,
              amount: Number(c.amount) || 0,
              dueDate: c.due_date,
              terms: c.terms || '',
              status: c.status || 'Pendiente',
              type: c.type || 'Emitido',
              supplierId: c.supplier_id,
              supplierName: c.supplier_name,
              clientId: c.client_id,
              clientName: c.client_name,
              voucherId: c.voucher_id,
              observation: c.observation,
              createdAt: c.created_at
            })));
          } else {
            const savedCheques = localStorage.getItem('optica_cheques');
            if (savedCheques) setCheques(JSON.parse(savedCheques));
          }
        } catch (e) {
          console.warn("Could not load cheques from Supabase, loading from localStorage:", e);
          const savedCheques = localStorage.getItem('optica_cheques');
          if (savedCheques) setCheques(JSON.parse(savedCheques));
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
            // Helper mapping function inline for realtime payload
            const b = payload.new;
            let type: CashBoxType = 'bank';
            if (b.type === 'Caja Efectivo') type = 'cash';
            else if (b.type === 'Tarjeta de Credito') type = 'credit_card';
            else if (b.type === 'Transferencia') type = 'bank';
            else {
              const nameLower = b.name.toLowerCase();
              if (nameLower.includes('efectivo') || nameLower.includes('caja')) type = 'cash';
              else if (nameLower.includes('tarjeta') || nameLower.includes('visa') || nameLower.includes('master')) type = 'credit_card';
              else if (nameLower.includes('pago') || nameLower.includes('digital')) type = 'digital';
            }

            let associated: string[] = [];
            if (b.associated_banks) {
              try {
                associated = JSON.parse(b.associated_banks);
              } catch (e) {
                if (typeof b.associated_banks === 'string' && b.associated_banks.length > 0) {
                  associated = b.associated_banks.split(',');
                }
              }
            }

            const newBox: CashBox = {
              id: `bank-${b.id}`,
              name: b.name,
              type,
              initialBalance: 0,
              incomes: 0,
              expenses: 0,
              expectedCash: 0,
              physicalCount: {},
              lastClosingBalance: 0,
              associatedBanks: associated.map((id: string) => `bank-${id}`)
            };

            setBoxes(prev => {
              const existsIdx = prev.findIndex(existing => existing.id === newBox.id);
              if (existsIdx >= 0) {
                return prev.map((item, idx) => idx === existsIdx ? { ...item, name: newBox.name, type: newBox.type, associatedBanks: newBox.associatedBanks } : item);
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

  // Sync cheques changes to local storage & Supabase
  useEffect(() => {
    localStorage.setItem('optica_cheques', JSON.stringify(cheques));
    async function syncCheques() {
      if (cheques.length > 0) {
        try {
          await supabase.from('cheques').upsert(cheques.map(c => ({
            id: c.id,
            number: c.number,
            bank: c.bank,
            amount: c.amount,
            due_date: c.dueDate,
            terms: c.terms || '',
            status: c.status,
            type: c.type,
            supplier_id: c.supplierId || null,
            supplier_name: c.supplierName || null,
            client_id: c.clientId || null,
            client_name: c.clientName || null,
            voucher_id: c.voucherId || null,
            observation: c.observation || null
          })));
        } catch (e) {
          console.error("Error syncing cheques to Supabase:", e);
        }
      }
    }
    syncCheques();
  }, [cheques]);

  const addCheques = (chequesList: Cheque[]) => {
    setCheques(prev => [...chequesList, ...prev]);
  };

  const updateChequeStatus = async (id: string, status: Cheque['status'], boxId?: string) => {
    let affectedCheque: Cheque | null = null;
    
    setCheques(prev => prev.map(c => {
      if (c.id === id) {
        affectedCheque = { ...c, status };
        return affectedCheque;
      }
      return c;
    }));

    // If marked as Cobrado, register transaction in Finance
    if (status === 'Cobrado' && boxId) {
      setTimeout(() => {
        if (!affectedCheque) return;
        const box = boxes.find(b => b.id === boxId);
        const boxName = box?.name || 'Caja';
        
        if (affectedCheque.type === 'Emitido') {
          // Cheque we gave to supplier -> debited from our account -> Expense
          addTransaction({
            id: `tx-cheque-deb-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            concept: `Débito Cheque Nº ${affectedCheque.number} - Banco: ${affectedCheque.bank} (Proveedor: ${affectedCheque.supplierName || 'Proveedor'})`,
            method: boxName,
            amount: affectedCheque.amount,
            type: 'expense',
            category: 'Gastos Administrativos',
            boxId: boxId,
            reconciled: true
          });
        } else {
          // Cheque we received from client -> deposited/cashed -> Income
          addTransaction({
            id: `tx-cheque-dep-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            concept: `Depósito Cheque Nº ${affectedCheque.number} - Banco: ${affectedCheque.bank} (Cliente: ${affectedCheque.clientName || 'Cliente'})`,
            method: boxName,
            amount: affectedCheque.amount,
            type: 'income',
            category: 'Cobros',
            boxId: boxId,
            reconciled: true
          });
        }
      }, 100);
    }

    try {
      await supabase.from('cheques').update({ status }).eq('id', id);
    } catch (e) {
      console.error("Error updating cheque status in Supabase:", e);
    }
  };

  return (
    <FinanceContext.Provider value={{ 
      boxes, 
      transactions, 
      suppliers,
      cheques,
      addTransaction, 
      voidTransaction,
      addBox, 
      transferFunds,
      addSupplierTransaction,
      updateSupplier,
      addSupplier,
      linkPaymentToInvoices,
      toggleTransactionReconciliation,
      updateBoxClosingBalance,
      addCheques,
      updateChequeStatus
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
