import React, { createContext, useContext, useState, useEffect } from "react";
import { useFinance } from "./FinanceContext";
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
  clearCart: () => void;
  selectedClient: any | null;
  setSelectedClient: (client: any | null) => void;
  paymentMethodId: string;
  setPaymentMethodId: (id: string) => void;
  checkout: () => { success: boolean; message: string };
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
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
            orderId: `#PED-${Math.floor(10000 + Math.random() * 90000)}`,
            concept: `${item.name} - ${clientObj?.name || 'Cliente'}`,
            cost: 0,
            status: 'Pendiente',
          });
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

    clearCart();
    return { success: true, message: `Venta cobrada por $${totalAmount.toLocaleString()} vía ${boxName}` };
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      selectedClient,
      setSelectedClient,
      paymentMethodId,
      setPaymentMethodId,
      checkout,
      isCartOpen,
      setIsCartOpen
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
