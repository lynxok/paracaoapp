import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Package, AlertTriangle, ShoppingCart, Truck, CheckCircle, Info, LucideIcon } from 'lucide-react';

export type NotificationType = 'warning' | 'error' | 'info' | 'success';
export type NotificationCategory = 'Urgentes' | 'Info' | 'Sistema' | 'Todas';

export interface AppNotification {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: NotificationType;
  category: NotificationCategory;
  iconName: string; // Store icon name instead of component for serialization
  color: string;
  bg: string;
  read?: boolean;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'time'>) => void;
  removeNotification: (id: number) => void;
  clearAll: () => void;
  markAsRead: (id: number) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Initial mock notifications
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { 
    id: 1,
    title: "Bienvenido al Sistema", 
    desc: "Tu cuenta ha sido configurada correctamente.", 
    time: "Recién",
    type: "success",
    category: "Sistema",
    iconName: "CheckCircle",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20"
  }
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('optica_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('optica_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'time'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now(),
      time: "Recién",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification, clearAll, markAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
