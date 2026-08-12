/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import { Orders } from "./pages/Orders";
import { NewOrder } from "./pages/NewOrder";
import { Inventory } from "./pages/Inventory";
import { Suppliers } from "./pages/Suppliers";
import { Finance } from "./pages/Finance";
import { Reports } from "./pages/Reports";
import { Labs } from "./pages/Labs";

import { Settings } from "./pages/Settings";
import { StatusLookup } from "./pages/StatusLookup";
import { Sales } from "./pages/Sales";
import { Marketing } from "./pages/Marketing";
import { BillingDrafts } from "./pages/BillingDrafts";
import { Help } from "./pages/Help";

import { FinanceProvider } from "./context/FinanceContext";
import { ClientProvider } from "./context/ClientContext";
import { SettingsProvider } from "./context/SettingsContext";
import { LabProvider } from "./context/LabContext";
import { InventoryProvider } from "./context/InventoryContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { Login } from "./pages/Login";
import { CartProvider } from "./context/CartContext";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout title="Panel de Control" subtitle="Bienvenido de nuevo"><Dashboard /></Layout>} />
      <Route path="/clients" element={<Layout title="Gestión de Clientes" subtitle="2.450 clientes registrados"><Clients /></Layout>} />
      <Route path="/clients/new" element={<Layout title="Gestión de Clientes" subtitle="2.450 clientes registrados"><Clients /></Layout>} />
      <Route path="/sales" element={<Layout title="Venta No Recetados" subtitle="Venta rápida de productos de stock"><Sales /></Layout>} />
      <Route path="/orders" element={<Layout title="Nuevo Pedido" subtitle="Seleccione el tipo de lente"><Orders /></Layout>} />
      <Route path="/orders/new" element={<Layout title="Nuevo Pedido" subtitle="Seleccione el tipo de lente"><Orders /></Layout>} />
      <Route path="/orders/new/:type" element={<Layout title="Detalle de Pedido" subtitle="#PED-2023-884"><NewOrder /></Layout>} />
      <Route path="/orders/edit/:cartItemId" element={<Layout title="Editar Pedido" subtitle="Edición de receta en carrito"><NewOrder /></Layout>} />
      <Route path="/inventory" element={<Layout title="Gestión de Stock" subtitle="1.240 SKUs en catálogo"><Inventory /></Layout>} />
      <Route path="/inventory/reception" element={<Layout title="Recepción de Mercadería" subtitle="Actualización de stock"><Inventory /></Layout>} />
      <Route path="/suppliers" element={<Layout title="Proveedores" subtitle="Directorio de proveedores"><Suppliers /></Layout>} />
      <Route path="/lab-management" element={<Layout title="Liquidación de Laboratorios" subtitle="Gestión de pagos externos"><Labs /></Layout>} />
      <Route path="/finance" element={<Layout title="Arqueo de Caja" subtitle="Caja Principal #01 - 24 Oct 2023"><Finance /></Layout>} />
      <Route path="/finance/closing" element={<Layout title="Arqueo de Caja" subtitle="Cierre de caja diario"><Finance /></Layout>} />
      <Route path="/reports" element={<Layout title="Reportes de Rentabilidad" subtitle="Análisis financiero detallado"><Reports /></Layout>} />
      <Route path="/marketing" element={<Layout title="CRM & Marketing" subtitle="Fidelización y recordatorios"><Marketing /></Layout>} />
      <Route path="/settings" element={<Layout title="Configuración" subtitle="Ajustes generales del sistema"><Settings /></Layout>} />
      <Route path="/billing-drafts" element={<Layout title="Borradores de Facturación" subtitle="Ventas pendientes de registrar facturas"><BillingDrafts /></Layout>} />
      <Route path="/help" element={<Layout title="Ayuda y Soporte" subtitle="Preguntas frecuentes y manuales del sistema"><Help /></Layout>} />
      
      {/* External View */}
      <Route path="/status-lookup" element={<StatusLookup />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <SettingsProvider>
          <FinanceProvider>
            <ClientProvider>
              <LabProvider>
                <InventoryProvider>
                  <CartProvider>
                    <AppContent />
                  </CartProvider>
                </InventoryProvider>
              </LabProvider>
            </ClientProvider>
          </FinanceProvider>
          </SettingsProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
