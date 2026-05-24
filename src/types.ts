/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dni: string;
  phone: string;
  email: string;
  birthDate?: string;
  age?: string;
  address?: {
    street: string;
    number: string;
    floor?: string;
    apartment?: string;
  };
  insurance?: string; // Legacy string name, migrating to insuranceId
  insuranceId?: string;
  affiliateNumber?: string;
  lastVisit?: string;
  balance: number; // Balance for Current Account (C.C.)
}

export interface InsuranceCoverage {
  categoryId: string; // The category name for now, e.g. "Cristales Monofocales", "Armazones"
  percentage: number; // e.g. 10 for 10%
}

export interface Insurance {
  id: string;
  name: string;
  active: boolean;
  coverages: InsuranceCoverage[];
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  type: 'monofocal' | 'multifocal' | 'contact' | 'sale';
  service: string;
  status: string;
  amount: number;
  paid: number;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  time: string;
  concept: string;
  method: string;
  amount: number;
  type: TransactionType;
  category: string;
  boxId: string;
  clientId?: string;
  clientName?: string;
  reconciled?: boolean;
}

export interface SupplierTransaction {
  id: string;
  date: string;
  dueDate?: string;
  paymentTerms?: string;
  voucherNumber: string;
  amount: number;
  type: 'invoice' | 'payment';
  status: 'pending' | 'paid' | 'cancelled';
  description?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  cuit: string;
  cbu?: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  paymentTerms?: string;
  balance: number;
  transactions: SupplierTransaction[];
}

export type CashBoxType = 'cash' | 'bank' | 'digital' | 'credit_card';

export interface CashBox {
  id: string;
  name: string;
  type: CashBoxType;
  initialBalance: number;
  incomes: number;
  expenses: number;
  expectedCash?: number;
  physicalCount?: Record<number, string>;
  lastClosingBalance?: number;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

export interface Denomination {
  id: number;
  value: number;
  label: string;
}
