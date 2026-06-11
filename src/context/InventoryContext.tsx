import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationsContext';

export interface InventoryItem {
  name: string;
  sku: string;
  cat: string;
  price: string;
  buyPrice?: number;
  criticalStock?: number;
  color: string; // The UI pill color
  productColor?: string; // The actual product color/tone
  lensType?: string; // Monofocal, etc
  stocks: Record<number, number>;
}

export interface StockMovement {
  id: string;
  date: string;
  time: string;
  sku: string;
  productName: string;
  branchId: number;
  branchName: string;
  quantity: number;
  type: 'ingreso' | 'egreso';
  buyPrice?: number;
  supplier?: string;
  invoice?: string;
  reason?: string;
  notes?: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (sku: string, item: InventoryItem) => void;
  deleteInventoryItem: (sku: string) => void;
  deductStock: (sku: string, branchId: number, quantity: number) => void;
  registerMovement: (movement: Omit<StockMovement, 'id' | 'date' | 'time'>) => void;
}

const INITIAL_INVENTORY: InventoryItem[] = [];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('optica_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('optica_stock_movements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('optica_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('optica_stock_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };

  const updateInventoryItem = (sku: string, updated: InventoryItem) => {
    setInventory(prev => prev.map(item => item.sku === sku ? updated : item));
  };

  const deleteInventoryItem = (sku: string) => {
    setInventory(prev => prev.filter(item => item.sku !== sku));
  };

  const { addNotification } = useNotifications();

  const deductStock = (sku: string, branchId: number, quantity: number) => {
    const item = inventory.find(i => i.sku === sku);
    if (item) {
      const branchName = branchId === 1 ? "Casa Central" : "Shopping";
      registerMovement({
        sku,
        productName: item.name,
        branchId,
        branchName,
        quantity,
        type: 'egreso',
        reason: 'Venta'
      });
    }
  };

  const registerMovement = (movData: Omit<StockMovement, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR');
    const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const newMovement: StockMovement = {
      ...movData,
      id: `mov-${Date.now()}`,
      date: dateStr,
      time: timeStr
    };

    setStockMovements(prev => [newMovement, ...prev]);

    setInventory(prev => prev.map(item => {
      if (item.sku === movData.sku) {
        const currentStock = item.stocks[movData.branchId] || 0;
        const adjustment = movData.type === 'ingreso' ? movData.quantity : -movData.quantity;
        const newStock = Math.max(0, currentStock + adjustment);

        if (movData.type === 'egreso' && newStock < 5 && currentStock >= 5) {
          addNotification({
            title: `Stock bajo en ${item.name}`,
            desc: `El producto ${item.name} (SKU: ${item.sku}) tiene un stock crítico de ${newStock} unidades en ${movData.branchName}.`,
            type: 'warning',
            category: 'Urgentes',
            iconName: 'Package',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
          });
        }

        return {
          ...item,
          buyPrice: movData.type === 'ingreso' && movData.buyPrice !== undefined ? movData.buyPrice : item.buyPrice,
          stocks: {
            ...item.stocks,
            [movData.branchId]: newStock
          }
        };
      }
      return item;
    }));
  };

  return (
    <InventoryContext.Provider value={{ inventory, stockMovements, addInventoryItem, updateInventoryItem, deleteInventoryItem, deductStock, registerMovement }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
