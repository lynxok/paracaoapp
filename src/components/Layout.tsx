import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  Truck, 
  FlaskConical, 
  Wallet, 
  BarChart3, 
  Settings,
  Eye,
  Search,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  User,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Activity,
  Trash2,
  Filter,
  LogOut,
  Camera,
  Lock,
  EyeOff,
  Save,
  KeyRound,
  Plus,
  Info,
  FileText,
  HelpCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import { useCart } from "../context/CartContext";
import { CartSidebar } from "./CartSidebar";
import { GuidedManualLauncher } from "./manual/GuidedManualLauncher";
import { hasPermission } from "../lib/permissions";

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Inicio" },
  { path: "/clients", icon: Users, label: "Clientes" },
  { path: "/sales", icon: ShoppingCart, label: "Ventas Rápidas" },
  { path: "/orders", icon: ShoppingCart, label: "Pedidos" },
  { path: "/inventory", icon: Package, label: "Stock" },
  { path: "/suppliers", icon: Truck, label: "Proveedores" },
  { path: "/lab-management", icon: FlaskConical, label: "Laboratorios" },
  { path: "/finance", icon: Wallet, label: "Caja/Finanzas" },
  { path: "/insurance-claims", icon: Shield, label: "Reintegros" },
  { path: "/billing-drafts", icon: FileText, label: "Borradores Facturación" },
  { path: "/reports", icon: BarChart3, label: "Reportes" },
  { path: "/marketing", icon: Sparkles, label: "CRM & Marketing" },
  { path: "/settings", icon: Settings, label: "Ajustes" },
  { path: "/help", icon: HelpCircle, label: "Ayuda" },
];

export function Layout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, isCartOpen, setIsCartOpen } = useCart();
  const isSalesOrOrdersPage = location.pathname.startsWith('/sales') || location.pathname.startsWith('/orders');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManualLauncherOpen, setIsManualLauncherOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const startInteractiveHoverMode = () => {
    const guideEl = document.getElementById('manual-overlay-guide');
    if (guideEl) {
      guideEl.remove();
    } else {
      const overlay = document.createElement('div');
      overlay.id = 'manual-overlay-guide';
      overlay.className = 'fixed inset-0 z-[999] bg-transparent pointer-events-none flex flex-col justify-between p-6 animate-in fade-in duration-200';
      overlay.innerHTML = `
        <div class="flex justify-between items-center bg-slate-900/95 border border-blue-500/50 p-4 rounded-2xl shadow-2xl pointer-events-auto backdrop-blur-md">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📖</span>
            <div>
              <h3 class="text-base font-bold text-blue-400">Modo Manual Interactivo Vivo (Activo)</h3>
              <p class="text-xs text-slate-300">Pasa el mouse sobre cualquier botón, campo o tabla para ver su explicación en tiempo real.</p>
            </div>
          </div>
          <button id="close-manual-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer">
            ✕ Salir del Manual
          </button>
        </div>

        <!-- Tooltip Flotante Esquina Inferior Derecha -->
        <div id="manual-tooltip-card" class="fixed bottom-6 right-6 bg-slate-900/95 border border-blue-500/50 p-5 rounded-2xl w-96 text-left space-y-2 shadow-2xl pointer-events-none transition-all duration-200 backdrop-blur-md z-[1000]">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-bold text-[10px] rounded uppercase tracking-wider">💡 Explicación en Tiempo Real</span>
          </div>
          <h4 id="manual-tip-title" class="text-sm font-bold text-white">Pasa el cursor sobre un elemento</h4>
          <p id="manual-tip-desc" class="text-xs text-slate-300 leading-relaxed">
            Mueve el cursor por el menú izquierdo, botones de acciones rápidas o formularios para leer para qué sirve cada uno.
          </p>
        </div>
      `;
      document.body.appendChild(overlay);

      const closeBtn = document.getElementById('close-manual-btn');
      if (closeBtn) {
        closeBtn.onclick = () => {
          document.getElementById('manual-overlay-guide')?.remove();
          document.removeEventListener('mouseover', handleMouseOver);
        };
      }

      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const titleEl = document.getElementById('manual-tip-title');
        const descEl = document.getElementById('manual-tip-desc');
        if (!titleEl || !descEl) return;

        // 1. Priorizar atributos explícitos data-manual-title y data-manual-description
        const manualAttrEl = target.closest('[data-manual-title]') as HTMLElement;
        if (manualAttrEl) {
          titleEl.innerText = manualAttrEl.getAttribute('data-manual-title') || 'Elemento del Sistema';
          descEl.innerText = manualAttrEl.getAttribute('data-manual-description') || 'Sin descripción detallada disponible.';
          return;
        }

        const text = target.innerText?.trim() || target.getAttribute('placeholder') || target.getAttribute('title') || '';

        // Detecciones por coincidencia de texto
        if (text.includes('Registrar Cliente') || target.closest('a[href="/clients/new"]')) {
          titleEl.innerText = "Registrar Cliente";
          descEl.innerText = "Abre la ficha de alta para ingresar DNI, Nombre, Teléfono y Obra Social de un nuevo paciente.";
        } else if (text.includes('Nuevo Cliente') || text.includes('+ Nuevo Cliente')) {
          titleEl.innerText = "Alta de Nuevo Paciente";
          descEl.innerText = "Permite registrar un nuevo paciente completando sus datos personales y cobertura de mutual.";
        } else if (text.includes('Recetados') || target.closest('a[href="/orders/new"]')) {
          titleEl.innerText = "Nuevo Pedido / Recetados";
          descEl.innerText = "Abre la pantalla de carga técnica para graduaciones oftálmicas (Monofocales, Multifocales, Contactología).";
        } else if (text.includes('Monofocales') || text.includes('Monofocal')) {
          titleEl.innerText = "Cristales Monofocales";
          descEl.innerText = "Visión sencilla para lejos o cerca. Carga única de Esfera, Cilindro y Eje.";
        } else if (text.includes('Multifocales') || text.includes('Multifocal')) {
          titleEl.innerText = "Cristales Multifocales Progresivos";
          descEl.innerText = "Visión progresiva multifocal. Requiere carga de Adición (ADD) y Altura Pupilar.";
        } else if (text.includes('Ocupacionales')) {
          titleEl.innerText = "Lentes Ocupacionales";
          descEl.innerText = "Lentes de visión intermedia para oficinas y computadoras.";
        } else if (text.includes('Contactología') || text.includes('Lentes de Contacto')) {
          titleEl.innerText = "Lentes de Contacto";
          descEl.innerText = "Carga de parámetros específicos para lentes de contacto blandas, tóricas o gas permeables.";
        } else if (text.includes('Agregar marco') || text.includes('Armazón')) {
          titleEl.innerText = "Selección de Armazón";
          descEl.innerText = "Enlaza un armazón del inventario por SKU o ingresa una montura propia del cliente.";
        } else if (text.includes('Enviar a Laboratorio') || text.includes('Enviar a Taller')) {
          titleEl.innerText = "Derivación a Laboratorio";
          descEl.innerText = "Genera el remito de trabajo técnico para taller de biselado o laboratorio externo.";
        } else if (text.includes('Agregar al Carrito')) {
          titleEl.innerText = "Agregar al Carrito de Ventas";
          descEl.innerText = "Envia el pedido técnico al resumen de venta para cobro o registro de seña.";
        } else if (text.includes('Venta No Recetados') || target.closest('a[href="/sales"]')) {
          titleEl.innerText = "Venta No Recetados (Venta Rápida)";
          descEl.innerText = "Despacho directo de mostrador para lentes de sol, líquidos limpiadores, estuches y accesorios de stock.";
        } else if (text.includes('Ingreso Mercadería') || target.closest('a[href="/inventory/reception"]')) {
          titleEl.innerText = "Ingreso de Mercadería";
          descEl.innerText = "Permite recibir paquetes físicos de proveedores incrementando masivamente el inventario de SKUs.";
        } else if (text.includes('Arqueo de Caja') || target.closest('a[href="/finance"]')) {
          titleEl.innerText = "Arqueo de Caja y Finanzas";
          descEl.innerText = "Gestión de efectivo diario (apertura, ingresos, egresos) y módulo de conciliación bancaria.";
        } else if (text.includes('Clientes') || target.closest('a[href="/clients"]')) {
          titleEl.innerText = "Módulo de Clientes";
          descEl.innerText = "Directorio general de pacientes, consulta de Cuenta Corriente, cobro de saldos y legajo histórico.";
        } else if (text.includes('Stock') || target.closest('a[href="/inventory"]')) {
          titleEl.innerText = "Módulo de Stock e Inventario";
          descEl.innerText = "Catálogo de existencias de armazones, cristales base e insumos con alertas de stock mínimo.";
        } else if (text.includes('Proveedores') || target.closest('a[href="/suppliers"]')) {
          titleEl.innerText = "Módulo de Proveedores y Compras";
          descEl.innerText = "Directorio de distribuidores, carga de facturas de compra y tablero de facturas pendientes de pago.";
        } else if (text.includes('Laboratorios') || target.closest('a[href="/lab-management"]')) {
          titleEl.innerText = "Liquidación de Laboratorios";
          descEl.innerText = "Control de trabajos en taller enviado a laboratorios externos de tallado y montajes.";
        } else {
          // Fallback limpio cuando el elemento no tiene coincidencia específica
          titleEl.innerText = "Elemento del Sistema";
          descEl.innerText = "Este elemento todavía no tiene ayuda contextual específica asignada.";
        }
      };

      document.addEventListener('mouseover', handleMouseOver);
    }
  };
  const { currentUser, currentBranch, logout } = useAuth();
  const isPathAllowed = hasPermission(currentUser?.role, location.pathname);
  const visibleMenuItems = menuItems.filter(item => hasPermission(currentUser?.role, item.path));
  
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "Usuario",
    role: currentUser?.role || "Administrador",
    branch: currentBranch?.name || "Casa Central",
    avatar: currentUser?.avatar || "https://picsum.photos/seed/doctor/100/100"
  });

  useEffect(() => {
    setProfileData(prev => ({
      ...prev,
      name: currentUser?.name || prev.name,
      role: currentUser?.role || prev.role,
      branch: currentBranch?.name || prev.branch,
      avatar: currentUser?.avatar || prev.avatar
    }));
  }, [currentUser, currentBranch]);

  const [passForm, setPassForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('Todas');
  const { notifications, removeNotification, clearAll } = useNotifications();

  const getIconComponent = (name: string) => {
    switch(name) {
      case 'Package': return Package;
      case 'AlertTriangle': return AlertTriangle;
      case 'ShoppingCart': return ShoppingCart;
      case 'Truck': return Truck;
      case 'CheckCircle': return CheckCircle;
      default: return Info;
    }
  };

  const handleClearAll = () => {
    clearAll();
  };

  const handleArchive = (id: number) => {
    removeNotification(id);
  };

  const filteredNotifications = notifications.filter(n => 
    notificationFilter === 'Todas' || n.category === notificationFilter
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative selection:bg-blue-500/30">
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                <User className="w-5 h-5 text-blue-600" /> Mi Perfil
              </h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert("Perfil actualizado correctamente");
              setIsProfileModalOpen(false);
            }}>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div 
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl bg-center bg-cover"
                      style={{ backgroundImage: `url(${profileData.avatar})` }}
                    />
                    <button 
                      type="button"
                      onClick={() => setProfileData({...profileData, avatar: `https://picsum.photos/seed/${Math.random()}/100/100`})}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 text-center">Cambiar avatar</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nombre</label>
                    <input 
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       Seguridad
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500">Contraseña Actual</label>
                        <div className="relative">
                          <input 
                            type={showPass.current ? "text" : "password"}
                            value={passForm.current}
                            onChange={(e) => setPassForm({...passForm, current: e.target.value})}
                            className="h-10 pl-4 pr-10 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500">Nueva Contraseña</label>
                        <div className="relative">
                          <input 
                            type={showPass.new ? "text" : "password"}
                            value={passForm.new}
                            onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                            className="h-10 pl-4 pr-10 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500">Confirmar</label>
                        <div className="relative">
                          <input 
                            type={showPass.confirm ? "text" : "password"}
                            value={passForm.confirm}
                            onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                            className={cn(
                              "h-10 pl-4 pr-10 rounded-lg border bg-white dark:bg-slate-950 w-full focus:ring-2 outline-none text-sm",
                              passForm.confirm && passForm.new !== passForm.confirm && "border-red-500"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-2">
                <button 
                  type="submit"
                  disabled={passForm.new && passForm.new !== passForm.confirm}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-3 left-3 z-50 flex-shrink-0 glass-panel flex flex-col transition-all duration-300 ease-in-out rounded-2xl lg:ml-3 lg:mr-1 my-3",
        isSidebarCollapsed ? "lg:w-[80px]" : "lg:w-[260px]",
        isMobileMenuOpen ? "translate-x-0 w-[260px]" : "-translate-x-[120%] lg:translate-x-0"
      )}>
        <div className={cn("flex flex-col items-center justify-center border-b border-slate-900/5 dark:border-white/[0.05] relative transition-all duration-300", isSidebarCollapsed ? "p-3 pt-6" : "p-6 pt-8")}>
          <button className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm z-20"
            title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          
          <div className="relative -mb-2 mt-1 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/40 blur-[30px] rounded-full scale-125 -z-10 hidden dark:block"></div>
            <img 
              src={`${window.location.origin}/argoslogo.png`} 
              alt="Argos" 
              className={cn("w-auto object-contain drop-shadow-md transition-all duration-300", isSidebarCollapsed ? "h-14 max-w-[50px]" : "h-28")} 
            />
          </div>
          
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 mt-0 z-10 animate-in fade-in duration-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[11px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">
                {profileData.branch}
              </p>
            </div>
          )}
        </div>
        
        <div className={cn("flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar transition-all duration-300", isSidebarCollapsed ? "p-2" : "p-4")}>
          <nav className="flex flex-col gap-1.5">
            {visibleMenuItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  title={isSidebarCollapsed ? item.label : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isSidebarCollapsed ? "justify-center px-2" : "px-4",
                    isActive 
                      ? "bg-blue-500/5 dark:bg-white/[0.08] text-blue-600 dark:text-white font-medium border border-blue-500/10 dark:border-white/[0.05] shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/[0.03]"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", isActive ? "scale-110 text-blue-600 dark:text-blue-400" : "group-hover:scale-110")} />
                  {!isSidebarCollapsed && (
                    <span className="text-sm tracking-wide whitespace-nowrap animate-in fade-in duration-200">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile at Bottom */}
        <div className={cn("pt-4 pb-1 border-t border-slate-900/5 dark:border-white/[0.05] bg-slate-50/50 dark:bg-slate-900/40 transition-all duration-300", isSidebarCollapsed ? "px-2" : "px-4")}>
          <div className={cn("flex items-center gap-2", isSidebarCollapsed ? "flex-col justify-center" : "justify-between")}>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              title={isSidebarCollapsed ? profileData.name : undefined}
              className={cn("flex items-center gap-3 overflow-hidden text-left hover:bg-white dark:hover:bg-slate-800 p-1 rounded-lg transition-colors min-w-0", isSidebarCollapsed ? "justify-center" : "flex-1")}
            >
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-9 w-9 border-2 border-blue-600/20 shrink-0" 
                style={{backgroundImage: `url(${profileData.avatar})`}}
              ></div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col overflow-hidden animate-in fade-in duration-200">
                  <h1 className="text-slate-900 dark:text-white text-xs font-bold truncate">{profileData.name}</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate uppercase tracking-wider font-semibold">{profileData.role}</p>
                </div>
              )}
            </button>
            <button 
              onClick={() => {
                if(confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                  logout();
                }
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {!isSidebarCollapsed ? (
          <div className="pb-4 pt-0 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-b-2xl animate-in fade-in duration-200">
            <a href="https://www.lnx.com.ar" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center group cursor-pointer gap-0">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Desarrollado por</span>
              <img src="/logolynxnaranja.png" alt="LYNX" className="h-10 w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100 mt-0.5" />
            </a>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1">v2.4.2 (28/08)</span>
          </div>
        ) : (
          <div className="pb-3 pt-1 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-b-2xl">
            <a href="https://www.lnx.com.ar" target="_blank" rel="noopener noreferrer" title="Desarrollado por LYNX - v2.4.2" className="group cursor-pointer">
              <img src="/logolynxnaranja.png" alt="LYNX" className="h-5 w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" />
            </a>
            <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">v2.4.2</span>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between pl-2 lg:pl-3 pr-4 lg:pr-6 bg-transparent shrink-0 z-50 no-print mt-1">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)}
                className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 group"
                title="Volver"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="h-10 pl-11 pr-4 rounded-full glass-panel border-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-900/80 text-sm w-48 lg:w-72 text-slate-900 dark:text-white placeholder:text-slate-500 transition-all" 
                placeholder="Buscar pacientes, pedidos..." 
                type="text"
              />
            </div>
            
            <button 
              onClick={() => {
                const newDark = !isDark;
                setIsDark(newDark);
                if (newDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }} 
              className="p-2.5 rounded-full glass-panel hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-all text-slate-600 dark:text-slate-300 active:scale-90"
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              <div className="transition-transform duration-300 rotate-0 dark:-rotate-12">
                {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
              </div>
            </button>

            {/* Toggle Modo Manual / Guiado */}
            <button 
              onClick={() => setIsManualLauncherOpen(true)}
              className="px-3 py-2 rounded-full glass-panel hover:bg-blue-600/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 transition-all font-bold text-xs flex items-center gap-2 active:scale-95 shadow-sm"
              title="Abrir Modo Manual y Tutoriales Guiados"
            >
              <BookOpen className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="hidden sm:inline">Modo Manual</span>
            </button>

            {/* Cart Toggle Button */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={cn(
                  "relative p-2.5 rounded-full transition-all group active:scale-95 glass-panel hover:bg-slate-200/50 dark:hover:bg-slate-800/60",
                  isCartOpen ? "bg-slate-200/80 dark:bg-slate-800/80 ring-1 ring-slate-900/10 dark:ring-white/10 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"
                )}
                title="Ver Carrito / Resumen"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                    {cart.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "relative p-2.5 rounded-full transition-all group active:scale-95 glass-panel hover:bg-slate-200/50 dark:hover:bg-slate-800/60",
                  showNotifications ? "bg-slate-200/80 dark:bg-slate-800/80 ring-1 ring-slate-900/10 dark:ring-white/10" : "text-slate-600 dark:text-slate-300"
                )}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white">Notificaciones</h4>
                      {notifications.length > 0 && (
                        <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {notifications.length} {notifications.length === 1 ? 'Nueva' : 'Nuevas'}
                        </span>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notif, idx) => {
                          const Icon = getIconComponent(notif.iconName);
                          return (
                            <div key={notif.id} className={cn(
                              "p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer",
                              idx === 0 && "bg-blue-50/20 dark:bg-blue-900/5"
                            )}>
                              <div className="flex gap-3">
                                <div className={cn("p-2 h-fit rounded-lg", notif.bg)}>
                                  <Icon className={cn("w-4 h-4", notif.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{notif.desc}</p>
                                  <p className="text-[10px] text-slate-400 mt-2 font-medium">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center opacity-40">
                          <Bell className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs font-bold uppercase tracking-widest">Sin notificaciones</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 text-center">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          setShowAllNotifications(true);
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Ver todas las notificaciones
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area with Cart Sidebar */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Area */}
          <main className="flex-1 overflow-y-auto pl-2 lg:pl-3 pr-4 lg:pr-6 pt-2 pb-24 lg:pb-8">
            {isPathAllowed ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm my-4">
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-full text-rose-600 dark:text-rose-400 mb-4">
                  <Shield className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Acceso Restringido</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6 font-medium">
                  Tu perfil de usuario (<span className="font-bold text-slate-900 dark:text-white uppercase">{currentUser?.role || 'Vendedor'}</span>) no cuenta con permisos autorizados para acceder a esta sección.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all text-sm"
                >
                  Volver al Inicio
                </button>
              </div>
            )}
          </main>
          <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>

        {/* Mobile Bottom Navigation Bar (Touch-First) */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-area-pb">
          <div className="flex items-center justify-around h-16 px-2">
            <button 
              onClick={() => navigate('/')}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                location.pathname === '/' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[10px] font-bold">Inicio</span>
            </button>
            <button 
              onClick={() => navigate('/clients')}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                location.pathname.startsWith('/clients') && location.pathname !== '/clients/new' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Users className="w-6 h-6" />
              <span className="text-[10px] font-bold">Clientes</span>
            </button>
            <button 
              onClick={() => navigate('/orders/new')}
              className="flex flex-col items-center justify-center w-full h-full gap-1 -mt-5"
            >
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Nueva Venta</span>
            </button>
            <button 
              onClick={() => navigate('/finance')}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                location.pathname.startsWith('/finance') ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Wallet className="w-6 h-6" />
              <span className="text-[10px] font-bold">Finanzas</span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
              <span className="text-[10px] font-bold">Menú</span>
            </button>
          </div>
        </nav>

        {/* All Notifications Modal */}
        {showAllNotifications && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">Centro de Notificaciones</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Historial completo de alertas del sistema</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAllNotifications(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                {['Todas', 'Urgentes', 'Info', 'Sistema'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setNotificationFilter(filter)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all tracking-wider",
                      notificationFilter === filter 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {filter}
                  </button>
                ))}
                <button 
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}
                  className="ml-auto px-4 py-1.5 flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full text-xs font-black uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Borrar Todo
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 sm:p-6 space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => {
                    const Icon = getIconComponent(notif.iconName);
                    return (
                      <div key={notif.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group flex gap-4">
                        <div className={cn("p-3 h-fit rounded-xl shrink-0 transition-transform group-hover:scale-110", notif.bg)}>
                          <Icon className={cn("w-5 h-5", notif.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{notif.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.desc}</p>
                          <div className="mt-4 flex items-center gap-3">
                            <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline">Accionar</button>
                            <span className="text-slate-200 dark:text-slate-800">|</span>
                            <button 
                              onClick={() => handleArchive(notif.id)}
                              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                            >
                              Archivar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale py-12">
                    <Bell className="w-12 h-12 mb-4" />
                    <p className="font-bold">No hay notificaciones en esta categoría</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Estado del Servidor: <span className="text-emerald-500 font-bold uppercase tracking-tighter">Conectado</span>
                </p>
                <button 
                  onClick={() => setShowAllNotifications(false)}
                  className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-black uppercase tracking-widest transition-transform active:scale-95"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Guided Manual Launcher Component */}
        <GuidedManualLauncher
          isOpen={isManualLauncherOpen}
          onClose={() => setIsManualLauncherOpen(false)}
          onStartInteractiveHoverMode={startInteractiveHoverMode}
        />
      </div>
    </div>
  );
}
