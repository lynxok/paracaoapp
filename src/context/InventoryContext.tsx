import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationsContext';

export interface InventoryItem {
  name: string;
  sku: string;
  cat: string;
  price: string;
  color: string; // The UI pill color
  productColor?: string; // The actual product color/tone
  lensType?: string; // Monofocal, etc
  stocks: Record<number, number>;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (sku: string, item: InventoryItem) => void;
  deductStock: (sku: string, branchId: number, quantity: number) => void;
}

const INITIAL_INVENTORY: InventoryItem[] = [];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('optica_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  useEffect(() => {
    localStorage.setItem('optica_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };

  const updateInventoryItem = (sku: string, updated: InventoryItem) => {
    setInventory(prev => prev.map(item => item.sku === sku ? updated : item));
  };

  const { addNotification } = useNotifications();

  const deductStock = (sku: string, branchId: number, quantity: number) => {
    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        const currentStock = item.stocks[branchId] || 0;
        const newStock = Math.max(0, currentStock - quantity);
        
        if (newStock < 5 && currentStock >= 5) {
          addNotification({
            title: `Stock bajo en ${item.name}`,
            desc: `El producto ${item.name} (SKU: ${item.sku}) tiene un stock crítico de ${newStock} unidades.`,
            type: 'warning',
            category: 'Urgentes',
            iconName: 'Package',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
          });
        }

        return {
          ...item,
          stocks: {
            ...item.stocks,
            [branchId]: newStock
          }
        };
      }
      return item;
    }));
  };

  return (
    <InventoryContext.Provider value={{ inventory, addInventoryItem, updateInventoryItem, deductStock }}>
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
