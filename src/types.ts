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
  insurancePlan?: string;
  affiliateNumber?: string;
  lastVisit?: string;
  balance: number; // Balance for Current Account (C.C.)
}

export interface InsuranceCoverage {
  categoryId: string; // The category name for now, e.g. "Cristales Monofocales", "Armazones"
  amount: number; // e.g. 5000 for $5000
}

export interface Insurance {
  id: string;
  name: string;
  active: boolean;
  coverages: InsuranceCoverage[];
}

export interface InsuranceClaim {
  id: string;
  orderId: string;
  clientId: string;
  clientName: string;
  clientDni?: string;
  affiliateNumber?: string;
  insuranceId: string;
  insuranceName: string;
  itemType: 'armazon' | 'cristal' | 'ambos';
  frameCoverage: number;
  crystalCoverage: number;
  totalAmount: number;
  status: 'Pendiente' | 'Presentado' | 'Cobrado';
  date: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  type: 'monofocal' | 'multifocal' | 'ocupacional' | 'contact' | 'sale';
  service: string;
  status: string;
  amount: number;
  paid: number;
  medico?: string;
  branchId?: string;
  prescriptionDetails?: any;
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

// --- Crystal Pricing Rules ---
// A single range condition that a prescription must satisfy
export interface CrystalPricingCondition {
  esfMin: number;     // minimum ESF value (e.g. -15)
  esfMax: number;     // maximum ESF value (e.g. 6)
  cilMax: number;     // maximum absolute CIL value (e.g. 2)
  esfPlusCilMax?: number; // optional: |ESF| + |CIL| must not exceed this
}

// A crystal product rule: price applies when the prescription matches ANY condition (OR logic)
export interface CrystalPricingRule {
  id: string;
  name: string;           // display name e.g. "Orgánico Blanco - Stock"
  material: string;       // e.g. "Orgánico", "Orgánico 1.67"
  tratamiento: string;    // e.g. "Blanco", "AR", "AR + Blue Cut", "Fotocromatico c/AR"
  conditions: CrystalPricingCondition[]; // OR: first matching condition wins
  precio: number;         // price in ARS
}

// --- New crystals refactoring models ---

export interface CrystalItem {
  id: string;
  name: string;
  type: 'monofocal' | 'multifocal' | 'ocupacional' | 'contact';
  material: string;
  index: string;
  brand: string;
  design: string;
  color: string;
  basePrice: number;
  active: boolean;
  sphMin: number;
  sphMax: number;
  cylMax: number;
  addMin?: number;
  addMax?: number;
  treatments?: string[];
}

export interface BillingDraftItem {
  name: string;
  quantity: number;
  price: number;
}

export interface BillingDraft {
  id: string;
  date: string;
  clientName: string;
  concept: string;
  amount: number;
  paymentMethod: string;
  billed: boolean;
  branchId?: string;
  branchName?: string;
  billingData?: {
    isConsumidorFinal: boolean;
    identificador?: string;
    direccion?: string;
    billingDate: string;
  };
  items?: BillingDraftItem[];
}

