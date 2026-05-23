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
  KeyRound
} from "lucide-react";
import { cn } from "../lib/utils";

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Inicio" },
  { path: "/clients", icon: Users, label: "Clientes" },
  { path: "/sales", icon: ShoppingCart, label: "Ventas Rápidas" },
  { path: "/orders", icon: ShoppingCart, label: "Pedidos" },
  { path: "/inventory", icon: Package, label: "Stock" },
  { path: "/suppliers", icon: Truck, label: "Proveedores" },
  { path: "/lab-management", icon: FlaskConical, label: "Laboratorios" },
  { path: "/finance", icon: Wallet, label: "Caja/Finanzas" },
  { path: "/reports", icon: BarChart3, label: "Reportes" },
  { path: "/marketing", icon: Sparkles, label: "CRM & Marketing" },
  { path: "/settings", icon: Settings, label: "Ajustes" },
];

export function Layout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Dr. Roberto G.",
    role: "Administrador",
    avatar: "https://picsum.photos/seed/doctor/100/100"
  });

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
  const [notifications, setNotifications] = useState([
    { 
      id: 1,
      title: "Stock bajo en Sucursal CC", 
      desc: "Ray-Ban Aviator Blue (SKU: RB-3025) por debajo del mínimo.", 
      time: "Hace 5 min",
      type: "warning",
      category: "Urgentes",
      icon: Package,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20"
    },
    { 
      id: 2,
      title: "Error Facturación AFIP", 
      desc: "Falla de sincronización: Token expirado. Se requiere re-validar.", 
      time: "Hace 20 min",
      type: "error",
      category: "Urgentes",
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20"
    },
    { 
      id: 3,
      title: "Pedido Listo para Retiro", 
      desc: "Venta #12548 (Roberto Gómez) ha sido marcada como lista.", 
      time: "Hace 1 hora",
      type: "info",
      category: "Info",
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    { 
      id: 4,
      title: "Nuevo Mensaje de Proveedor", 
      desc: "OptiSupply ha actualizado los precios de cristales.", 
      time: "Ayer",
      type: "info",
      category: "Info",
      icon: Truck,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    { 
      id: 5,
      title: "Cierre de Caja Exitoso", 
      desc: "La caja #01 fue cerrada por Juana Pérez sin diferencias.", 
      time: "Ayer",
      type: "success",
      category: "Sistema",
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    }
  ]);

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleArchive = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
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
        "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between gap-3 p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:text-blue-500">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight dark:text-white">
              Óptica<span className="text-blue-600 dark:text-blue-500">Paracáo</span>
            </h2>
          </div>
          <button className="lg:hidden p-1 text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-1">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-600/10 text-blue-600 dark:text-blue-500 font-bold shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between gap-2">
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-3 overflow-hidden text-left hover:bg-white dark:hover:bg-slate-800 p-1 rounded-lg transition-colors flex-1 min-w-0"
            >
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-9 w-9 border-2 border-blue-600/20 shrink-0" 
                style={{backgroundImage: `url(${profileData.avatar})`}}
              ></div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-slate-900 dark:text-white text-xs font-bold truncate">{profileData.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate uppercase tracking-wider font-semibold">{profileData.role}</p>
              </div>
            </button>
            <button 
              onClick={() => {
                if(confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                  // In a real app, this would clear auth tokens/state
                  alert("Cerrando sesión...");
                  // Example: navigate("/login");
                }
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-30 no-print">
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
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="h-9 pl-9 pr-4 rounded-full bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-600 text-sm w-48 lg:w-64 text-slate-900 dark:text-white placeholder:text-slate-400" 
                placeholder="Buscar..." 
                type="text"
              />
            </div>
            <button 
              onClick={() => {
                const newDark = !isDark;
                setIsDark(newDark);
                // Force immediate class update to ensure UI response
                if (newDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }} 
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300 active:scale-90"
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              <div className="transition-transform duration-300 rotate-0 dark:-rotate-12">
                {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
              </div>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "relative p-2 rounded-full transition-all group active:scale-95",
                  showNotifications ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
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
                        notifications.slice(0, 5).map((notif, idx) => (
                          <div key={notif.id} className={cn(
                            "p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer",
                            idx === 0 && "bg-blue-50/20 dark:bg-blue-900/5"
                          )}>
                            <div className="flex gap-3">
                              <div className={cn("p-2 h-fit rounded-lg", notif.bg)}>
                                <notif.icon className={cn("w-4 h-4", notif.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{notif.desc}</p>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
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

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>

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
                  filteredNotifications.map((notif) => (
                    <div key={notif.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group flex gap-4">
                      <div className={cn("p-3 h-fit rounded-xl shrink-0 transition-transform group-hover:scale-110", notif.bg)}>
                        <notif.icon className={cn("w-5 h-5", notif.color)} />
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
                  ))
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
      </div>
    </div>
  );
}
