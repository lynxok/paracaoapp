import React, { createContext, useContext, useState, useEffect } from "react";
import { useFinance } from "./FinanceContext";
import { BillingDraft } from "../types";
import { useClients } from "./ClientContext";
import { useInventory } from "./InventoryContext";
import { useLabs } from "./LabContext";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

export interface CartItem {
  id: string;
  type: 'product' | 'prescription';
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  category?: string;
  details?: {
    client?: any;
    prescriptionType?: string;
    lejosOD?: any;
    lejosOI?: any;
    cercaOD?: any;
    cercaOI?: any;
    adicionOD?: string;
    adicionOI?: string;
    alturaOD?: string;
    alturaOI?: string;
    medico?: string;
    observaciones?: string;
    lensColor?: string;
    selectedCrystal?: any;
    selectedFrame?: any;
    assignedLab?: any;
    deliveryDate?: string;
    crystalCoverage?: number;
    frameCoverage?: number;
    subtotal?: number;
    totalCoverage?: number;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateCartItem: (id: string, updatedItem: CartItem) => void;
  clearCart: () => void;
  selectedClient: any | null;
  setSelectedClient: (client: any | null) => void;
  paymentMethodId: string;
  setPaymentMethodId: (id: string) => void;
  checkout: (paidAmount?: number, senaMethodId?: string, previstoMethodId?: string, discountPercent?: number) => { success: boolean; message: string; receipt?: any };
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  billingDrafts: BillingDraft[];
  markDraftsAsBilled: (draftIds: string[], billingData: { isConsumidorFinal: boolean; identificador?: string; direccion?: string; billingDate: string }) => void;
  updateDraftBranch: (draftId: string, branchId: string, branchName: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { boxes, addTransaction } = useFinance();
  const { addOrder } = useClients();
  const { deductStock } = useInventory();
  const { addJob } = useLabs();
  const { currentBranch } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const [billingDrafts, setBillingDrafts] = useState<BillingDraft[]>([]);

  // Load billing drafts from Supabase on mount
  useEffect(() => {
    async function loadDrafts() {
      try {
        const { data, error } = await supabase.from('billing_drafts').select('*');
        if (!error && data && data.length > 0) {
          setBillingDrafts(data.map((d: any) => ({
            id: d.id,
            date: d.date,
            clientName: d.client_name,
            concept: d.concept,
            amount: Number(d.amount),
            paymentMethod: d.payment_method,
            billed: d.billed,
            branchId: d.branch_id || currentBranch?.id || '1',
            branchName: d.branch_name || currentBranch?.name || 'Casa Central',
            billingData: d.billing_data,
            items: d.items
          })));
        }
      } catch (e) {
        console.warn("Could not load billing drafts from Supabase:", e);
      }
    }
    loadDrafts();
  }, [currentBranch]);

  useEffect(() => {
    localStorage.setItem('optica_billing_drafts', JSON.stringify(billingDrafts));
  }, [billingDrafts]);

  const updateDraftBranch = (draftId: string, branchId: string, branchName: string) => {
    setBillingDrafts(prev => prev.map(draft => {
      if (draft.id === draftId) {
        return {
          ...draft,
          branchId,
          branchName
        };
      }
      return draft;
    }));

    try {
      supabase.from('billing_drafts')
        .update({ branch_id: branchId, branch_name: branchName })
        .eq('id', draftId)
        .then(({ error }) => {
          if (error) console.error('Error updating draft branch in Supabase:', error);
        });
    } catch (e) {
      console.error("Error updating draft branch:", e);
    }
  };

  const markDraftsAsBilled = async (draftIds: string[], billingData: { isConsumidorFinal: boolean; identificador?: string; direccion?: string; billingDate: string }) => {
    setBillingDrafts(prev => prev.map(draft => {
      if (draftIds.includes(draft.id)) {
        return {
          ...draft,
          billed: true,
          billingData
        };
      }
      return draft;
    }));

    try {
      await Promise.all(
        draftIds.map(id =>
          supabase.from('billing_drafts').update({
            billed: true,
            billing_data: billingData
          }).eq('id', id)
        )
      );
    } catch (e) {
      console.error("Supabase markDraftsAsBilled error:", e);
    }
  };

  useEffect(() => {
    if (boxes.length > 0 && !paymentMethodId) {
      const defaultBox = boxes.find(b => b.type === 'cash') || boxes[0];
      setPaymentMethodId(defaultBox.id);
    }
  }, [boxes, paymentMethodId]);

  const addToCart = (item: CartItem) => {
    setIsCartOpen(true);
    setCart(prev => {
      // For products, merge same ID. For prescriptions, always add as separate line items
      if (item.type === 'product') {
        const existing = prev.find(i => i.id === item.id && i.type === 'product');
        if (existing) {
          return prev.map(i => i.id === item.id && i.type === 'product' 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
          );
        }
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) };
      }
      return i;
    }));
  };

  const updateCartItem = (id: string, updatedItem: CartItem) => {
    setCart(prev => prev.map(item => item.id === id ? updatedItem : item));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient(null);
    setIsCartOpen(false);
  };

  const checkout = (paidAmount?: number, senaMethodId?: string, previstoMethodId?: string, discountPercent?: number) => {
    if (cart.length === 0) return { success: false, message: "El carrito está vacío" };

    const selectedBox = boxes.find(b => b.id === (paidAmount !== undefined ? senaMethodId : paymentMethodId));
    const boxName = selectedBox?.name || "Efectivo";

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const validDiscountPercent = (discountPercent && discountPercent > 0) ? Math.min(100, discountPercent) : 0;
    const discountAmount = (subtotal * validDiscountPercent) / 100;
    const totalAmount = Math.max(0, subtotal - discountAmount);

    const isPartial = paidAmount !== undefined && paidAmount < totalAmount;
    const effectivePaid = paidAmount !== undefined ? Math.min(paidAmount, totalAmount) : totalAmount;
    const remainingBalance = Math.max(0, totalAmount - effectivePaid);

    const targetClient = selectedClient || cart.find(c => c.details?.client)?.details?.client;
    const targetClientId = targetClient?.id || 'cliente-mostrador';
    const targetClientName = targetClient?.name || 'Cliente Mostrador';

    const orderIdGenerated = `ORD-${Date.now().toString().slice(-6)}`;

    // Process each item in the cart
    cart.forEach(item => {
      const itemRawTotal = item.price * item.quantity;
      const itemTotal = subtotal > 0 ? (itemRawTotal * totalAmount) / subtotal : 0;
      const itemPaid = totalAmount > 0 ? (itemTotal * effectivePaid) / totalAmount : 0;

      if (item.type === 'prescription' && item.details) {
        const details = item.details;
        
        // Asignar prioritariamente al cliente titular de la receta médica (details.client)
        const rxClient = details.client || targetClient;
        const rxClientId = rxClient?.id || targetClientId;
        const rxClientName = rxClient?.name || targetClientName;
        const rxClientDni = rxClient?.dni || targetClient?.dni || '';

        // 1. Add order to client orders list (del titular de la receta)
        addOrder({
          id: orderIdGenerated,
          clientId: rxClientId,
          clientName: rxClientName,
          date: new Date().toISOString().split('T')[0],
          type: details.prescriptionType || 'monofocal',
          service: item.name,
          status: 'En Taller',
          amount: itemTotal,
          paid: itemPaid,
          medico: details.medico,
          branchId: currentBranch?.id || undefined,
          senaMethodId: senaMethodId,
          previstoMethodId: previstoMethodId
        });

        // 2. Deduct stock for frame and crystal
        if (details.selectedFrame) {
          deductStock(details.selectedFrame.sku, 1, 1);
        }
        if (details.selectedCrystal) {
          deductStock(details.selectedCrystal.sku, 1, 1);
        }

        // 3. Add external lab job if applicable (titular de la receta)
        if (details.assignedLab) {
          addJob({
            labId: details.assignedLab.id,
            date: new Date().toISOString().split('T')[0],
            orderId: orderIdGenerated,
            concept: `${item.name} - ${rxClientName}`,
            cost: details.labCost || 0,
            status: 'Pendiente',
            labName: details.assignedLab.name,
            clientName: rxClientName,
            clientDni: rxClientDni,
            prescription: {
              type: details.prescriptionType || 'monofocal',
              lejosOD: details.lejosOD,
              lejosOI: details.lejosOI,
              cercaOD: details.cercaOD,
              cercaOI: details.cercaOI,
              adicionOD: details.adicionOD,
              adicionOI: details.adicionOI,
              alturaOD: details.alturaOD,
              alturaOI: details.alturaOI,
              diOD: details.diOD,
              diOI: details.diOI,
              apOD: details.apOD,
              apOI: details.apOI,
            },
            crystalDetails: details.selectedCrystalItem ? {
              id: details.selectedCrystalItem.id,
              name: details.selectedCrystalItem.name,
              type: details.selectedCrystalItem.type,
              material: details.selectedCrystalItem.material,
              index: details.selectedCrystalItem.index,
              brand: details.selectedCrystalItem.brand,
              design: details.selectedCrystalItem.design,
              color: details.selectedCrystalItem.color,
              eyes: details.eyesCharged || 'ambos',
              basePrice: details.selectedCrystalItem.basePrice,
              totalPrice: item.price
            } : {
              id: '',
              name: item.name,
              type: details.prescriptionType || 'monofocal',
              material: details.material || 'Orgánico',
              index: details.index || '1.49',
              brand: details.marca || 'Genérico',
              design: details.diseno || 'Esférico',
              color: details.color || 'Blanco',
              eyes: details.eyesCharged || 'ambos',
              basePrice: item.price,
              totalPrice: item.price
            },
            treatments: details.selectedTreatments || [],
            observaciones: details.observaciones || item.observaciones || '',
            branchName: currentBranch?.name || 'Sucursal Única',
            sellerName: localStorage.getItem('optica_user_name') || 'Vendedor',
            estimatedLabDeliveryDate: ''
          } as any);
        }

        // 4. Register Insurance Claim if reimbursements are present (titular de la receta)
        if (details.insuranceId && (details.frameCoverage > 0 || details.crystalCoverage > 0)) {
          const claimId = `claim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const claimData = {
            id: claimId,
            order_id: orderIdGenerated,
            client_id: rxClientId,
            client_name: rxClientName,
            client_dni: rxClientDni,
            affiliate_number: rxClient?.affiliateNumber || '',
            insurance_id: details.insuranceId,
            insurance_name: details.insuranceName || 'Obra Social',
            item_type: (details.frameCoverage > 0 && details.crystalCoverage > 0) ? 'ambos' : details.frameCoverage > 0 ? 'armazon' : 'cristal',
            frame_coverage: details.frameCoverage || 0,
            crystal_coverage: details.crystalCoverage || 0,
            total_amount: (details.frameCoverage || 0) + (details.crystalCoverage || 0),
            status: 'Pendiente',
            date: new Date().toISOString().split('T')[0]
          };

          supabase.from('insurance_claims').upsert([claimData]).then(({ error }) => {
            if (error) console.error("Error al registrar reintegro de obra social en Supabase:", error);
          });
        }
      } else {
        // Record product sale in client purchase history
        addOrder({
          id: orderIdGenerated,
          clientId: targetClientId,
          clientName: targetClientName,
          date: new Date().toISOString().split('T')[0],
          type: 'producto',
          service: `${item.quantity}x ${item.name}`,
          status: itemPaid === itemTotal ? 'Entregado' : 'Pendiente Entrega',
          amount: itemTotal,
          paid: itemPaid,
          branchId: currentBranch?.id || undefined,
          senaMethodId: senaMethodId,
          previstoMethodId: previstoMethodId
        });

        // Simple product stock deduction (optional, if catalog SKUs match inventory)
        if (item.sku) {
          deductStock(item.sku, item.quantity, 1);
        }
      }
    });

    // Register single consolidated transaction in Finance
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const descSuffix = validDiscountPercent > 0 ? ` (Desc. ${validDiscountPercent}%)` : '';
    const partialSuffix = isPartial ? ` [Seña: $${effectivePaid.toLocaleString('es-AR')} - Saldo: $${remainingBalance.toLocaleString('es-AR')}]` : '';

    addTransaction({
      id: `sale-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      concept: `Venta Consolidada: ${cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}${descSuffix}${partialSuffix}`,
      method: boxName,
      amount: effectivePaid,
      type: 'income',
      category: 'ventas',
      boxId: paidAmount !== undefined ? (senaMethodId || paymentMethodId) : paymentMethodId,
      clientId: targetClientId,
      clientName: targetClientName
    });

    // Registrar en Borradores de Facturación
    const newDraft: BillingDraft = {
      id: `draft-${Date.now()}`,
      date: dateStr,
      clientName: selectedClient?.name || cart.find(c => c.details?.client)?.details?.client?.name || 'Cliente Mostrador',
      concept: `Venta Consolidada: ${cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}${descSuffix}`,
      amount: totalAmount,
      paymentMethod: boxName,
      billed: false,
      branchId: currentBranch?.id || '1',
      branchName: currentBranch?.name || 'Casa Central',
      items: cart.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price
      }))
    };
    setBillingDrafts(prev => [newDraft, ...prev]);

    supabase.from('billing_drafts').upsert([{
      id: newDraft.id,
      date: newDraft.date,
      client_name: newDraft.clientName,
      concept: newDraft.concept,
      amount: newDraft.amount,
      payment_method: newDraft.paymentMethod,
      billed: newDraft.billed,
      branch_id: newDraft.branchId,
      branch_name: newDraft.branchName,
      items: newDraft.items
    }]).then(({ error }) => {
      if (error) console.error('Error saving billing draft:', error);
    });

    const itemsSummary = cart.map(i => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      type: i.type,
      prescriptionDetails: i.type === 'prescription' ? i.details : undefined
    }));

    clearCart();
    return { 
      success: true, 
      message: `Venta cobrada por $${effectivePaid.toLocaleString('es-AR')} vía ${boxName}`,
      receipt: {
        id: `REC-${Date.now().toString().slice(-6)}`,
        date: dateStr,
        time: timeStr,
        clientName: targetClientName,
        clientDni: targetClient?.dni || '',
        clientPhone: targetClient?.phone || '',
        items: itemsSummary,
        subtotal: subtotal,
        discountPercent: validDiscountPercent,
        discountAmount: discountAmount,
        total: totalAmount,
        isPartial: isPartial,
        paidAmount: effectivePaid,
        remainingBalance: remainingBalance,
        paymentMethod: boxName,
        previstoBoxName: boxes.find(b => b.id === previstoMethodId)?.name || undefined
      }
    };
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItem,
      clearCart,
      selectedClient,
      setSelectedClient,
      paymentMethodId,
      setPaymentMethodId,
      checkout,
      isCartOpen,
      setIsCartOpen,
      billingDrafts,
      markDraftsAsBilled,
      updateDraftBranch
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
