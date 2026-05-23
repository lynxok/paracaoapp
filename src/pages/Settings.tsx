import React, { useState, useEffect } from "react";
import { Building2, Users, Shield, Bell, Receipt, ScrollText, Save, X, MapPin, Plus, Trash2, Smartphone, Edit2, CircleAlert, Info, Clock, AlertTriangle, CheckCircle, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { cn } from "../lib/utils";
import { logger } from "../lib/logger";

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'branches', label: 'Sucursales', icon: MapPin },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'permissions', label: 'Permisos', icon: Shield },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'billing', label: 'Facturación', icon: Receipt },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, show: boolean, user: any }>({ x: 0, y: 0, show: false, user: null });
  
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [branches, setBranches] = useState([
    { id: 1, name: "Casa Central", address: "Av. Principal 123", phone: "+54 11 4444-5555", main: true },
    { id: 2, name: "Sucursal Shopping", address: "Shopping Center - Local 45", phone: "+54 11 6666-7777", main: false },
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: "Ignacio Valente", email: "valente.ignacio@gmail.com", role: "superadmin", branch: "Todas", status: "Activo" },
    { id: 2, name: "Juana Pérez", email: "juana.p@visionclara.com", role: "admin", branch: "Casa Central", status: "Activo" },
    { id: 3, name: "Marcos Ríos", email: "m.rios@visionclara.com", role: "standard", branch: "Sucursal Shopping", status: "Inactivo" },
  ]);

  const [notificationConfig, setNotificationConfig] = useState({
    stockAlerts: true,
    orderUpdates: true,
    weeklyReports: false,
    whatsappBridge: true,
    emailLogins: true
  });

  const [auditLogs, setAuditLogs] = useState(() => logger.getLogs());

  const handleUserContextMenu = (e: React.MouseEvent, user: any) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      show: true,
      user
    });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu({ ...contextMenu, show: false });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  useEffect(() => {
    const handleUpdate = () => {
      setAuditLogs([...logger.getLogs()]);
    };
    window.addEventListener('audit_log_updated', handleUpdate);
    return () => window.removeEventListener('audit_log_updated', handleUpdate);
  }, []);

  // Initial mock logs if empty
  useEffect(() => {
    if (auditLogs.length === 0) {
      logger.log("Inicio de sesión", "info", "Auth", undefined, "Ignacio Valente");
      logger.log("Error en sincronización AFIP", "error", "Facturación", "Token de acceso expirado (Auth 401)", "Sistema");
      logger.log("Ingreso de stock", "info", "Inventario", undefined, "Juana Pérez");
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="fixed z-[100] w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 overflow-hidden animate-in fade-in zoom-in duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button 
            onClick={() => {
               setSelectedUser(contextMenu.user);
               setIsUserModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4 text-blue-600" /> Editar Perfil
          </button>
          <button 
            onClick={() => {
              setSelectedUser(contextMenu.user);
              setIsPasswordModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
          >
            <KeyRound className="w-4 h-4 text-emerald-600" /> Cambiar Contraseña
          </button>
          {contextMenu.user?.role !== 'superadmin' && (
            <button 
              onClick={() => {
                if(confirm(`¿Estás seguro de eliminar a ${contextMenu.user.name}?`)) {
                  setUsers(prev => prev.filter(u => u.id !== contextMenu.user.id));
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-slate-800"
            >
              <Trash2 className="w-4 h-4" /> Eliminar Usuario
            </button>
          )}
        </div>
      )}

      <aside className="w-full lg:w-64 space-y-2 flex-shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <tab.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 dark:text-slate-500")} />
              {tab.label}
            </button>
          );
        })}
      </aside>

      <div className="flex-1 space-y-8">
        {activeTab === 'general' && (
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Datos de la Óptica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Razón Social</label>
                <input 
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  defaultValue="Óptica Paracáo S.A." 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">CUIT</label>
                <input 
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  defaultValue="30-71234567-8" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Email Contacto</label>
                <input 
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  defaultValue="admin@visionclara.com" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Teléfono</label>
                <input 
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  defaultValue="+54 11 4567-8901" 
                />
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          </section>
        )}

        {activeTab === 'branches' && (
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" /> Sucursales
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestiona los locales físicos de tu óptica.</p>
              </div>
              <button 
                onClick={() => setIsBranchModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Nueva Sucursal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map(branch => (
                <div key={branch.id} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-blue-600 shadow-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">{branch.name}</h4>
                          {branch.main && <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">Principal</span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{branch.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-lg text-slate-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!branch.main && (
                        <button className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-lg text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 opacity-60" />
                      {branch.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {activeTab === 'users' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" /> Gestión de Usuarios
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Administra los accesos y roles de tu equipo.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedUser(null);
                    setIsUserModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm self-start"
                >
                  <Plus className="w-4 h-4" /> Nuevo Usuario
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre / Email</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sucursal</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                      onContextMenu={(e) => handleUserContextMenu(e, user)}
                    >
                      <td className="px-8 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          user.role === 'superadmin' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" :
                          user.role === 'admin' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                          "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 opacity-40" /> {user.branch}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-bold",
                          user.status === 'Activo' ? "text-emerald-600" : "text-slate-400"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Activo' ? "bg-emerald-600" : "bg-slate-400")} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserModalOpen(true);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsPasswordModalOpen(true);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-emerald-600 transition-colors"
                            title="Cambiar Contraseña"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          {user.role !== 'superadmin' && (
                            <button 
                              onClick={() => {
                                if(confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
                                  setUsers(prev => prev.filter(u => u.id !== user.id));
                                }
                              }}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        
        {activeTab === 'permissions' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" /> Matriz de Permisos
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configura qué puede hacer cada rol en el sistema.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  Restaurar Valores
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Módulo / Permiso</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ver</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Crear</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Editar</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { module: "Dashboard / Inicio", admin: "✓✓✓-", standard: "✓---" },
                    { module: "Inventario (Stock)", admin: "✓✓✓✓", standard: "✓✓--" },
                    { module: "Clientes", admin: "✓✓✓✓", standard: "✓✓--" },
                    { module: "Proveedores", admin: "✓✓✓-", standard: "✓---" },
                    { module: "Órdenes / Recetados", admin: "✓✓✓✓", standard: "✓✓--" },
                    { module: "Caja y Finanzas", admin: "✓✓--", standard: "----" },
                    { module: "Configuración Sistema", admin: "----", standard: "----" },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900 dark:text-white">{row.module}</div>
                      </td>
                      {['Ver', 'Crear', 'Editar', 'Eliminar'].map((perm, pIdx) => (
                        <td key={pIdx} className="px-8 py-5">
                          <div className="flex flex-col items-center gap-2">
                             <div className="flex items-center gap-4">
                                <label className="flex flex-col items-center gap-1 cursor-pointer group">
                                  <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-500 uppercase">Admin</span>
                                  <div className={cn(
                                    "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                                    row.admin[pIdx] === '✓' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-300"
                                  )}>
                                    {row.admin[pIdx] === '✓' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />}
                                  </div>
                                </label>
                                <label className="flex flex-col items-center gap-1 cursor-pointer group">
                                  <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-500 uppercase">Std</span>
                                  <div className={cn(
                                    "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                                    row.standard[pIdx] === '✓' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-300"
                                  )}>
                                    {row.standard[pIdx] === '✓' && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" />}
                                  </div>
                                </label>
                             </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-start gap-4">
                 <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                   <Shield className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white">Nota de Seguridad</p>
                   <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                     El rol <span className="font-bold text-purple-600 italic">Superadmin</span> tiene todos los permisos habilitados por defecto y no puede ser modificado para evitar bloqueos del sistema.
                   </p>
                 </div>
               </div>
            </div>
          </section>
        )}
        
        {activeTab === 'notifications' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" /> Preferencias de Notificación
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configura cómo y cuándo quieres recibir alertas.</p>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              {[
                { id: 'stockAlerts', label: 'Alertas de Stock Crítico', desc: 'Notificar cuando un producto baje del límite establecido.', icon: AlertTriangle, color: 'text-amber-500' },
                { id: 'orderUpdates', label: 'Actualización de Pedidos', desc: 'Avisar al cliente cuando su receta esté disponible en local.', icon: CheckCircle, color: 'text-blue-500' },
                { id: 'weeklyReports', label: 'Reportes Semanales', desc: 'Resumen automático de ventas y movimientos de caja.', icon: ScrollText, color: 'text-slate-500' },
                { id: 'whatsappBridge', label: 'Integración WhatsApp Business', desc: 'Permitir el envío automático de mensajes desde el sistema.', icon: Smartphone, color: 'text-emerald-500' },
                { id: 'emailLogins', label: 'Alertas de Seguridad', desc: 'Notificar por email cada vez que se inicie sesión desde un dispositivo nuevo.', icon: Shield, color: 'text-purple-500' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 bg-slate-100 dark:bg-slate-800 rounded-lg", (item as any).color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotificationConfig({...notificationConfig, [item.id]: !(notificationConfig as any)[item.id]})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      (notificationConfig as any)[item.id] ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                      (notificationConfig as any)[item.id] ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors">
                Guardar Configuración
              </button>
            </div>
          </section>
        )}

        {activeTab === 'billing' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 text-blue-600" /> Configuración de Facturación
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define parámetros fiscales y plantillas de comprobantes.</p>
            </div>
            
            <div className="p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Condición Frente al IVA</label>
                  <select className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none text-sm font-medium">
                    <option>Responsable Inscripto</option>
                    <option>Monotributista</option>
                    <option>Exento</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ingresos Brutos (IIBB)</label>
                  <input className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none placeholder:text-slate-400" placeholder="Ej: 902-123456-7" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Punto de Venta</label>
                  <input className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none" defaultValue="0001" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Próximo Nro. de Factura</label>
                  <input className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none" defaultValue="00021458" />
                </div>
              </div>
              
              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                <div className="flex gap-4">
                  <Info className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-400">Facturación Electrónica (AFIP)</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-500/80 mt-1 leading-relaxed">
                      La conexión con el WebService de AFIP para comprobantes en línea está <span className="font-bold">Activa</span>. No olvides renovar tu certificado digital cada 2 años.
                    </p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                      Ver Certificados
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors">
                Actualizar Datos Fiscales
              </button>
            </div>
          </section>
        )}

        {activeTab === 'audit' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ScrollText className="w-6 h-6 text-blue-600" /> Audit Log
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Registro histórico de acciones y errores del sistema.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Exportar CSV
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulo</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acción / Error</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-8 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 opacity-40" /> {log.timestamp}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {log.user[0]}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-0.5">
                          <p className={cn("text-sm font-medium", log.type === 'error' ? "text-red-600 font-bold" : "text-slate-700 dark:text-slate-300")}>
                            {log.message}
                          </p>
                          {log.details && <p className="text-[10px] text-red-500/80 font-mono italic">{log.details}</p>}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        {log.type === 'error' ? (
                          <div className="flex items-center gap-1.5 text-red-600">
                            <CircleAlert className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase">Critical Fail</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span className="text-[10px] font-black uppercase">Success</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
               <p>Mostrando los últimos 50 eventos</p>
               <button className="font-bold text-blue-600 hover:underline">Cargar más eventos</button>
            </div>
          </section>
        )}
        
        {activeTab !== 'general' && activeTab !== 'branches' && activeTab !== 'users' && activeTab !== 'permissions' && activeTab !== 'notifications' && activeTab !== 'billing' && activeTab !== 'audit' && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400 animate-in fade-in duration-300">
            <Shield className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Esta sección está en desarrollo</p>
          </div>
        )}

        {/* Modal Nueva Sucursal */}
        {isBranchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                  <MapPin className="w-6 h-6 text-blue-600" /> Registrar Nueva Sucursal
                </h3>
                <button onClick={() => setIsBranchModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setIsBranchModalOpen(false); }}>
                <div className="p-6 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de la Sucursal</label>
                    <input type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Ej: Sucursal Centro" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Dirección</label>
                    <input type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Ej: Calle 45 nro 123" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teléfono</label>
                      <input type="tel" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="+54 11 ..." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Horario</label>
                      <input type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Ej: 09:00 - 18:00" />
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                  <button 
                    type="button"
                    onClick={() => setIsBranchModalOpen(false)}
                    className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Nuevo Usuario */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                  <Users className="w-6 h-6 text-blue-600" /> Registrar Nuevo Usuario
                </h3>
                <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setIsUserModalOpen(false); }}>
                <div className="p-6 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre Completo</label>
                    <input type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Ej: Juan Pérez" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                    <input type="email" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="ejemplo@visionclara.com" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Rol de Acceso</label>
                      <select className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm" required>
                        <option value="standard">Estándar (Vendedor)</option>
                        <option value="admin">Administrador</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sucursal Asignada</label>
                      <select className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm" required>
                        <option value="all">Todas</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                  <button 
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm"
                  >
                    Crear Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Cambiar Contraseña */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                  <Lock className="w-5 h-5 text-blue-600" /> 
                  {selectedUser ? `Resetear: ${selectedUser.name}` : 'Cambiar mi Contraseña'}
                </h3>
                <button 
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setSelectedUser(null);
                    setPasswordForm({ current: "", new: "", confirm: "" });
                  }} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (passwordForm.new !== passwordForm.confirm) return;
                alert(selectedUser ? `Contraseña reseteada para ${selectedUser.name}` : "Tu contraseña ha sido actualizada");
                setIsPasswordModalOpen(false);
                setSelectedUser(null);
                setPasswordForm({ current: "", new: "", confirm: "" });
              }}>
                <div className="p-6 space-y-5">
                  {!selectedUser && (
                    <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contraseña Actual</label>
                      <div className="relative">
                        <input 
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                          className="h-11 pl-4 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {selectedUser ? "Nueva Contraseña Temporal" : "Nueva Contraseña"}
                    </label>
                    <div className="relative">
                      <input 
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                        className="h-11 pl-4 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white transition-all"
                        placeholder="Mínimo 8 caracteres"
                        required
                        minLength={8}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        className={cn(
                          "h-11 pl-4 pr-11 rounded-xl border bg-white dark:bg-slate-950 w-full focus:ring-2 outline-none text-slate-900 dark:text-white transition-all",
                          passwordForm.confirm && passwordForm.new !== passwordForm.confirm 
                            ? "border-red-500 focus:ring-red-500" 
                            : passwordForm.confirm && passwordForm.new === passwordForm.confirm
                            ? "border-emerald-500 focus:ring-emerald-500"
                            : "border-slate-200 dark:border-slate-800 focus:ring-blue-600"
                        )}
                        placeholder="Repite la contraseña"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                        <CircleAlert className="w-3 h-3" /> Las contraseñas no coinciden
                      </p>
                    )}
                    {passwordForm.confirm && passwordForm.new === passwordForm.confirm && (
                      <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Las contraseñas coinciden
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50">
                  <button 
                    type="submit"
                    disabled={(!selectedUser && !passwordForm.current) || !passwordForm.new || passwordForm.new !== passwordForm.confirm || passwordForm.new.length < 8}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {selectedUser ? "Resetear Contraseña" : "Actualizar Contraseña"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setSelectedUser(null);
                      setPasswordForm({ current: "", new: "", confirm: "" });
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
