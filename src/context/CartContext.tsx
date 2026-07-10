import React, { createContext, useContext, useState, useEffect } from "react";
import { useFinance } from "./FinanceContext";
import { BillingDraft } from "../types";
import { useClients } from "./ClientContext";
import { useInventory } from "./InventoryContext";
import { useLabs } from "./LabContext";
import { useAuth } from "./AuthContext";

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
  checkout: () => { success: boolean; message: string };
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  billingDrafts: BillingDraft[];
  markDraftsAsBilled: (draftIds: string[], billingData: { isConsumidorFinal: boolean; identificador?: string; direccion?: string; billingDate: string }) => void;
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
  const [isCartOpen, setIsCartOpen] = useState<boolean>(true);

  const [billingDrafts, setBillingDrafts] = useState<BillingDraft[]>(() => {
    const saved = localStorage.getItem('optica_billing_drafts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('optica_billing_drafts', JSON.stringify(billingDrafts));
  }, [billingDrafts]);

  const markDraftsAsBilled = (draftIds: string[], billingData: { isConsumidorFinal: boolean; identificador?: string; direccion?: string; billingDate: string }) => {
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
  };

  useEffect(() => {
    if (boxes.length > 0 && !paymentMethodId) {
      const defaultBox = boxes.find(b => b.type === 'cash') || boxes[0];
      setPaymentMethodId(defaultBox.id);
    }
  }, [boxes, paymentMethodId]);

  const addToCart = (item: CartItem) => {
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
  };

  const checkout = () => {
    if (cart.length === 0) return { success: false, message: "El carrito está vacío" };

    const selectedBox = boxes.find(b => b.id === paymentMethodId);
    const boxName = selectedBox?.name || "Efectivo";

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Process each item in the cart
    cart.forEach(item => {
      if (item.type === 'prescription' && item.details) {
        const details = item.details;
        const clientObj = details.client || selectedClient;

        // 1. Add order to client orders list
        addOrder({
          clientId: clientObj?.id || '0',
          clientName: clientObj?.name || 'Cliente Mostrador',
          date: new Date().toISOString().split('T')[0],
          type: details.prescriptionType || 'monofocal',
          service: item.name,
          status: 'En Taller',
          amount: item.price * item.quantity,
          paid: item.price * item.quantity,
          medico: details.medico,
          branchId: currentBranch?.id || undefined,
        });

        // 2. Deduct stock for frame and crystal
        if (details.selectedFrame) {
          deductStock(details.selectedFrame.sku, 1, 1);
        }
        if (details.selectedCrystal) {
          deductStock(details.selectedCrystal.sku, 1, 1);
        }

        // 3. Add external lab job if applicable
        if (details.assignedLab) {
          addJob({
            labId: details.assignedLab.id,
            date: new Date().toISOString().split('T')[0],
            orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            concept: `${item.name} - ${clientObj?.name || 'Cliente'}`,
            cost: details.labCost || 0,
            status: 'Pendiente',
            labName: details.assignedLab.name,
            clientName: clientObj?.name || 'Cliente Mostrador',
            clientDni: clientObj?.dni || '',
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
            sellerName: localStorage.getItem('optica_user_name') || 'Vendedor'
          } as any);
        }
      } else if (item.type === 'product') {
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

    addTransaction({
      id: `sale-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      concept: `Venta Consolidada: ${cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
      method: boxName,
      amount: totalAmount,
      type: 'income',
      category: 'ventas',
      boxId: paymentMethodId,
      clientName: selectedClient?.name || cart.find(c => c.details?.client)?.details?.client?.name || 'Cliente Mostrador'
    });

    // Registrar en Borradores de Facturación
    const newDraft: BillingDraft = {
      id: `draft-${Date.now()}`,
      date: dateStr,
      clientName: selectedClient?.name || cart.find(c => c.details?.client)?.details?.client?.name || 'Cliente Mostrador',
      concept: `Venta Consolidada: ${cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
      amount: totalAmount,
      paymentMethod: boxName,
      billed: false,
      items: cart.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price
      }))
    };
    setBillingDrafts(prev => [newDraft, ...prev]);

    clearCart();
    return { success: true, message: `Venta cobrada por $${totalAmount.toLocaleString()} vía ${boxName}` };
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
      markDraftsAsBilled
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
