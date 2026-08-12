import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationsContext';
import { supabase } from '../lib/supabase';

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
  addInventoryItem: (item: InventoryItem) => Promise<void>;
  updateInventoryItem: (sku: string, item: InventoryItem) => Promise<void>;
  deleteInventoryItem: (sku: string) => Promise<void>;
  deductStock: (sku: string, branchId: number, quantity: number) => Promise<void>;
  registerMovement: (movement: Omit<StockMovement, 'id' | 'date' | 'time'>) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        // Load inventory products
        const { data: invData, error: invError } = await supabase.from('inventory').select('*');
        if (!invError && invData) {
          const mappedInv: InventoryItem[] = invData.map((d: any) => ({
            sku: d.sku,
            name: d.name,
            cat: d.cat,
            price: d.price,
            color: d.color || 'blue',
            buyPrice: d.buy_price !== null && d.buy_price !== undefined ? Number(d.buy_price) : undefined,
            criticalStock: d.critical_stock !== null && d.critical_stock !== undefined ? Number(d.critical_stock) : 5,
            productColor: d.product_color || undefined,
            lensType: d.lens_type || undefined,
            stocks: d.stocks || { 1: 0, 2: 0 }
          }));
          setInventory(mappedInv);
        }

        // Load stock movements
        const { data: movData, error: movError } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false });
        if (!movError && movData) {
          const mappedMovs: StockMovement[] = movData.map((m: any) => ({
            id: m.id,
            date: m.date,
            time: m.time,
            sku: m.sku,
            productName: m.product_name,
            branchId: Number(m.branch_id),
            branchName: m.branch_name,
            quantity: Number(m.quantity),
            type: m.type as 'ingreso' | 'egreso',
            buyPrice: m.buy_price !== null && m.buy_price !== undefined ? Number(m.buy_price) : undefined,
            supplier: m.supplier || undefined,
            invoice: m.invoice || undefined,
            reason: m.reason || undefined,
            notes: m.notes || undefined
          }));
          setStockMovements(mappedMovs);
        }
      } catch (err) {
        console.warn("Error loading inventory / movements from Supabase:", err);
      }
    }

    loadDataFromSupabase();
  }, []);

  const addInventoryItem = async (item: InventoryItem) => {
    try {
      const { error } = await supabase.from('inventory').upsert([{
        sku: item.sku,
        name: item.name,
        cat: item.cat,
        price: item.price,
        color: item.color,
        buy_price: item.buyPrice || 0,
        critical_stock: item.criticalStock || 5,
        product_color: item.productColor || null,
        lens_type: item.lensType || null,
        stocks: item.stocks || { 1: 0, 2: 0 }
      }]);
      if (error) {
        alert(`⚠️ Error al guardar el producto en la base de datos: ${error.message}`);
        throw error;
      }
      setInventory(prev => [...prev, item]);
    } catch (e: any) {
      console.error("Supabase inventory insert error:", e);
      alert(`⚠️ Error al conectar con la base de datos: ${e?.message || 'Error desconocido'}`);
      throw e;
    }
  };

  const updateInventoryItem = async (sku: string, updated: InventoryItem) => {
    try {
      const { error } = await supabase.from('inventory').upsert([{
        sku: updated.sku,
        name: updated.name,
        cat: updated.cat,
        price: updated.price,
        color: updated.color,
        buy_price: updated.buyPrice || 0,
        critical_stock: updated.criticalStock || 5,
        product_color: updated.productColor || null,
        lens_type: updated.lensType || null,
        stocks: updated.stocks || { 1: 0, 2: 0 }
      }]);
      if (error) {
        alert(`⚠️ Error al actualizar el producto en la base de datos: ${error.message}`);
        throw error;
      }
      setInventory(prev => prev.map(item => item.sku === sku ? updated : item));
    } catch (e: any) {
      console.error("Supabase inventory update error:", e);
      alert(`⚠️ Error al actualizar en la base de datos: ${e?.message || 'Error desconocido'}`);
      throw e;
    }
  };

  const deleteInventoryItem = async (sku: string) => {
    try {
      const { error } = await supabase.from('inventory').delete().eq('sku', sku);
      if (error) {
        alert(`⚠️ Error al eliminar el producto de la base de datos: ${error.message}`);
        throw error;
      }
      setInventory(prev => prev.filter(item => item.sku !== sku));
    } catch (e: any) {
      console.error("Supabase inventory delete error:", e);
      alert(`⚠️ Error al eliminar de la base de datos: ${e?.message || 'Error desconocido'}`);
      throw e;
    }
  };

  const { addNotification } = useNotifications();

  const deductStock = async (sku: string, branchId: number, quantity: number) => {
    const item = inventory.find(i => i.sku === sku);
    if (item) {
      const branchName = branchId === 1 ? "Casa Central" : "Shopping";
      await registerMovement({
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

  const registerMovement = async (movData: Omit<StockMovement, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR');
    const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const newMovement: StockMovement = {
      ...movData,
      id: `mov-${Date.now()}`,
      date: dateStr,
      time: timeStr
    };

    // 1. Save movement to Supabase stock_movements table
    try {
      const { error: movError } = await supabase.from('stock_movements').insert([{
        id: newMovement.id,
        date: newMovement.date,
        time: newMovement.time,
        sku: newMovement.sku,
        product_name: newMovement.productName,
        branch_id: newMovement.branchId,
        branch_name: newMovement.branchName,
        quantity: newMovement.quantity,
        type: newMovement.type,
        buy_price: newMovement.buyPrice || null,
        supplier: newMovement.supplier || null,
        invoice: newMovement.invoice || null,
        reason: newMovement.reason || null,
        notes: newMovement.notes || null
      }]);

      if (movError) {
        console.error("Error saving stock movement to Supabase:", movError);
      }
    } catch (e) {
      console.error("Supabase movement insert error:", e);
    }

    setStockMovements(prev => [newMovement, ...prev]);

    // 2. Update stock quantities in local state and Supabase inventory table
    let updatedStocksForTarget: Record<number, number> | null = null;

    setInventory(prev => prev.map(item => {
      if (item.sku === movData.sku) {
        const currentStock = item.stocks[movData.branchId] || 0;
        const adjustment = movData.type === 'ingreso' ? movData.quantity : -movData.quantity;
        const newStock = Math.max(0, currentStock + adjustment);
        updatedStocksForTarget = { ...item.stocks, [movData.branchId]: newStock };

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
          stocks: updatedStocksForTarget
        };
      }
      return item;
    }));

    if (updatedStocksForTarget) {
      try {
        await supabase.from('inventory').update({
          stocks: updatedStocksForTarget,
          ...(movData.type === 'ingreso' && movData.buyPrice !== undefined ? { buy_price: movData.buyPrice } : {})
        }).eq('sku', movData.sku);
      } catch (e) {
        console.error("Error updating inventory stocks in Supabase:", e);
      }
    }
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
