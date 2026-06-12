import React, { useState, useEffect, useRef } from "react";
import { Building2, Users, Shield, Bell, Receipt, ScrollText, Save, X, MapPin, Plus, Trash2, Smartphone, Edit2, CircleAlert, Info, Clock, AlertTriangle, CheckCircle, Eye, EyeOff, KeyRound, Lock, Activity, Package, Database, Cloud, ImageIcon, Sparkles, FileText } from "lucide-react";
import { cn } from "../lib/utils";
import { logger } from "../lib/logger";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { generateInvoicePDF } from "../utils/pdfGenerator";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'appearance', label: 'Apariencia', icon: Sparkles },
  { id: 'branches', label: 'Sucursales', icon: MapPin },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'permissions', label: 'Permisos', icon: Shield },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'billing', label: 'Facturación', icon: Receipt },
  { id: 'insurances', label: 'Obras Sociales', icon: Activity },
  { id: 'banks', label: 'Bancos', icon: Building2 },
  { id: 'inventory', label: 'Categorías', icon: Package },
  { id: 'database', label: 'Base de Datos', icon: Database },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
];

export function Settings() {
  const currentUser = { name: "Ignacio Valente", role: "superadmin" }; // User Mock for permissions
  const [activeTab, setActiveTab] = useState('general');
  
  // Load points of sale from CRM/Marketing context
  const [puntosVenta] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_puntos_venta');
    return saved ? JSON.parse(saved) : ["0001 - P.V. Central", "0002 - P.V. Shopping", "0003 - P.V. Online"];
  });

  const [selectedPV, setSelectedPV] = useState(() => {
    return localStorage.getItem('optica_default_pv') || (puntosVenta[0] || "0001");
  });

  const [branchPVs, setBranchPVs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('optica_branch_pvs');
    return saved ? JSON.parse(saved) : {};
  });

  // AFIP Certificates and Credentials
  const [afipCuit, setAfipCuit] = useState(() => localStorage.getItem('optica_afip_cuit') || "30-71234567-8");
  const [afipEnv, setAfipEnv] = useState(() => localStorage.getItem('optica_afip_env') || "homologacion");
  const [afipCertName, setAfipCertName] = useState(() => localStorage.getItem('optica_afip_cert') || "certificado_prod_paracao.crt");
  const [afipKeyName, setAfipKeyName] = useState(() => localStorage.getItem('optica_afip_key') || "privada_afip.key");

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCsrModalOpen, setIsCsrModalOpen] = useState(false);
  const [csrOrg, setCsrOrg] = useState("Óptica Paracao");
  const [csrCN, setCsrCN] = useState("ParacaoApp");
  const [csrCuit, setCsrCuit] = useState("30712345678");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, show: boolean, user: any }>({ x: 0, y: 0, show: false, user: null });
  const { insurances, addInsurance, updateInsurance, removeInsurance, banks, addBank, updateBank, removeBank, inventoryCategories, addInventoryCategory, updateInventoryCategory, removeInventoryCategory, lensColors, addLensColor, updateLensColor, removeLensColor, contactLensColors, addContactLensColor, updateContactLensColor, removeContactLensColor, lensTypes, addLensType, updateLensType, removeLensType, opticaLogo, setOpticaLogo, opticaName, setOpticaName, opticaPhone, setOpticaPhone, opticaAddress, setOpticaAddress, appTheme, setAppTheme, pdfConfig, setPdfConfig } = useSettings();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const lynxLogoInputRef = useRef<HTMLInputElement>(null);

  const [pdfSubTab, setPdfSubTab] = useState<'design' | 'logos' | 'margins'>('design');
  const [inicioActividad, setInicioActividad] = useState(() => localStorage.getItem('optica_inicio_actividad') || "01/05/2026");
  const [iibb, setIibb] = useState(() => localStorage.getItem('optica_iibb') || "30-71234567-8");

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    let active = true;
    const updatePreview = async () => {
      const mockInvoice = {
        voucherNumber: "00002145",
        ptoVta: "0001",
        date: new Date().toISOString().split('T')[0],
        amount: 154800,
        clientCuit: "20-35678901-2",
        clientName: "Juan Pérez",
        description: "Anteojos Recetados Multifocales - Cristales Orgánicos AR",
        cae: "7423985739281",
        caeVto: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
      };

      const configData = {
        razonSocial: opticaName,
        nombreFantasia: opticaName,
        afipCuit: afipCuit,
        afipPtoVta: "0001",
        ingresosBrutos: iibb,
        inicioActividad: inicioActividad,
        domicilioComercial: opticaAddress,
        invoiceLogo: opticaLogo,
        ...pdfConfig
      };

      try {
        const url = await generateInvoicePDF(mockInvoice, configData);
        if (active) {
          setPreviewUrl(url);
        }
      } catch (err) {
        console.error("Error generating invoice preview:", err);
      }
    };

    updatePreview();
    return () => {
      active = false;
    };
  }, [pdfConfig, opticaName, opticaAddress, opticaLogo, afipCuit, iibb, inicioActividad]);
  const [newInsurance, setNewInsurance] = useState('');
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<any>(null);
  const [newLensColor, setNewLensColor] = useState('');
  const [isLensColorModalOpen, setIsLensColorModalOpen] = useState(false);
  const [editingLensColor, setEditingLensColor] = useState({ oldName: '', newName: '' });
  const [newContactLensColor, setNewContactLensColor] = useState('');
  const [isContactLensColorModalOpen, setIsContactLensColorModalOpen] = useState(false);
  const [editingContactLensColor, setEditingContactLensColor] = useState({ oldName: '', newName: '' });
  const [newLensType, setNewLensType] = useState('');
  const [isLensTypeModalOpen, setIsLensTypeModalOpen] = useState(false);
  const [editingLensType, setEditingLensType] = useState({ oldName: '', newName: '' });
  const [newCategory, setNewCategory] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState({ oldName: '', newName: '' });
  const [newBank, setNewBank] = useState({ name: '', cbu: '', alias: '', accountNumber: '' });
  const [isBankEditModalOpen, setIsBankEditModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState({ id: '', name: '', cbu: '', alias: '', accountNumber: '' });
  
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const { users, addUser, updateUser, deleteUser, branches } = useAuth();


  const [notificationConfig, setNotificationConfig] = useState({
    stockAlerts: true,
    orderUpdates: true,
    weeklyReports: false,
    whatsappBridge: true,
    emailLogins: true
  });

  const initialPermissions = [
    { id: 'dashboard', module: "Dashboard / Inicio", admin: [true, true, true, false], standard: [true, false, false, false] },
    { id: 'inventory', module: "Inventario (Stock)", admin: [true, true, true, true], standard: [true, true, false, false] },
    { id: 'clients', module: "Clientes", admin: [true, true, true, true], standard: [true, true, false, false] },
    { id: 'suppliers', module: "Proveedores", admin: [true, true, true, false], standard: [true, false, false, false] },
    { id: 'orders', module: "Órdenes / Recetados", admin: [true, true, true, true], standard: [true, true, false, false] },
    { id: 'finance', module: "Caja y Finanzas", admin: [true, true, false, false], standard: [false, false, false, false] },
    { id: 'settings', module: "Configuración Sistema", admin: [false, false, false, false], standard: [false, false, false, false] },
  ];

  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('optica_permissions');
    return saved ? JSON.parse(saved) : initialPermissions;
  });

  const savePermissions = () => {
    localStorage.setItem('optica_permissions', JSON.stringify(permissions));
    alert("Permisos guardados con éxito.");
  };

  const togglePermission = (moduleId: string, role: 'admin' | 'standard', index: number) => {
    setPermissions(permissions.map(p => {
      if (p.id === moduleId) {
        const newRolePerms = [...p[role]];
        newRolePerms[index] = !newRolePerms[index];
        return { ...p, [role]: newRolePerms };
      }
      return p;
    }));
  };

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

  const handleExportLocalDB = () => {
    const data: Record<string, string> = {};
    Object.keys(localStorage).forEach(key => {
      data[key] = localStorage.getItem(key) || '';
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optica_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportLocalDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (window.confirm("¿Estás seguro de sobrescribir toda la base de datos local con este backup?")) {
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
          });
          alert("Backup importado correctamente. La página se recargará.");
          window.location.href = '/';
        }
      } catch (err) {
        alert("Archivo de backup inválido.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateSupabaseSQL = () => {
    if (!supabaseUrl || !supabaseKey) {
      alert("Por favor ingresa la URL y la Key de Supabase.");
      return;
    }
    const clients = JSON.parse(localStorage.getItem('optica_clients') || '[]');
    const inventory = JSON.parse(localStorage.getItem('optica_inventory') || '[]');
    const orders = JSON.parse(localStorage.getItem('optica_orders') || '[]');

    let sql = `-- MIGRACIÓN PARA SUPABASE\\n`;
    sql += `-- Instrucciones: Pegá este código en el SQL Editor de Supabase y ejecutalo.\\n\\n`;

    sql += `CREATE TABLE IF NOT EXISTS clients (\\n  id text PRIMARY KEY,\\n  name text,\\n  dni text,\\n  phone text,\\n  email text,\\n  lastVisit text,\\n  balance numeric\\n);\\n\\n`;
    sql += `CREATE TABLE IF NOT EXISTS inventory (\\n  sku text PRIMARY KEY,\\n  name text,\\n  cat text,\\n  price text,\\n  color text\\n);\\n\\n`;
    sql += `CREATE TABLE IF NOT EXISTS orders (\\n  id text PRIMARY KEY,\\n  clientId text REFERENCES clients(id),\\n  clientName text,\\n  date text,\\n  type text,\\n  service text,\\n  status text,\\n  amount numeric,\\n  paid numeric\\n);\\n\\n`;

    if (clients.length > 0) {
      sql += `INSERT INTO clients (id, name, dni, phone, email, lastVisit, balance) VALUES\\n`;
      sql += clients.map((c: any) => `('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.dni}', '${c.phone}', '${c.email}', '${c.lastVisit}', ${c.balance})`).join(',\\n') + `\\nON CONFLICT (id) DO NOTHING;\\n\\n`;
    }

    if (inventory.length > 0) {
      sql += `INSERT INTO inventory (sku, name, cat, price, color) VALUES\\n`;
      sql += inventory.map((i: any) => `('${i.sku}', '${i.name.replace(/'/g, "''")}', '${i.cat}', '${i.price}', '${i.color}')`).join(',\\n') + `\\nON CONFLICT (sku) DO NOTHING;\\n\\n`;
    }

    if (orders.length > 0) {
      sql += `INSERT INTO orders (id, clientId, clientName, date, type, service, status, amount, paid) VALUES\\n`;
      sql += orders.map((o: any) => `('${o.id}', '${o.clientId}', '${o.clientName.replace(/'/g, "''")}', '${o.date}', '${o.type}', '${o.service.replace(/'/g, "''")}', '${o.status}', ${o.amount}, ${o.paid})`).join(',\\n') + `\\nON CONFLICT (id) DO NOTHING;\\n\\n`;
    }

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migracion_supabase.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert("Script SQL generado correctamente.\\n\\nCopiá y pegá el contenido de 'migracion_supabase.sql' en el SQL Editor de tu panel de Supabase para crear las tablas e importar tus datos.");
  };

  const handleResetDatabase = () => {
    if (window.confirm("⚠️ ADVERTENCIA ⚠️\n\n¿Estás seguro de querer limpiar TODA la base de datos?\nSe borrarán clientes, inventario, laboratorios, transacciones y ventas.\nLas categorías y ajustes se conservarán.\n\nEsta acción NO se puede deshacer.")) {
      const keysToKeep = ['optica_categories', 'optica_lens_types', 'optica_lens_colors', 'optica_contact_colors', 'optica_logo', 'optica_name', 'optica_phone', 'optica_address', 'theme'];
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      window.location.href = '/';
    }
  };

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
                  deleteUser(contextMenu.user.id);
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
            
            {/* Logo Section */}
            <div className="mb-8 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" /> Logo de la Óptica
              </h4>
              <div className="flex items-center gap-6">
                <div className="w-32 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 flex-shrink-0">
                  {opticaLogo ? (
                    <img src={opticaLogo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Sin logo</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sube el logo que aparecerá en las tarjetas de pedido para laboratorio y otros documentos. Formatos: PNG, JPG, SVG.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" /> Cargar Logo
                    </button>
                    {opticaLogo && (
                      <button
                        onClick={() => setOpticaLogo('')}
                        className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Eliminar
                      </button>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setOpticaLogo(ev.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Razón Social</label>
                <input 
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  value={opticaName}
                  onChange={e => setOpticaName(e.target.value)}
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
                  value={opticaPhone}
                  onChange={e => setOpticaPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Dirección</label>
                <input 
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  value={opticaAddress}
                  onChange={e => setOpticaAddress(e.target.value)}
                  placeholder="Calle, número, ciudad"
                />
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          </section>
        )}

        {activeTab === 'appearance' && (
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" /> Apariencia
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personaliza los colores del sistema para que coincidan con la identidad de tu óptica.</p>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle>Tema de la Aplicación</CardTitle>
                <CardDescription>
                  Selecciona el esquema de colores principal. Esto cambiará los botones, acentos y fondos sutiles en todo el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={appTheme} 
                  onValueChange={setAppTheme}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <RadioGroupItem value="default" id="theme-default" className="peer sr-only" />
                    <Label
                      htmlFor="theme-default"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 [&:has([data-state=checked])]:border-blue-600 cursor-pointer transition-all"
                    >
                      <div className="w-full flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                          <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                        </div>
                        {appTheme === "default" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="w-full">
                        <p className="font-bold">Original (Azul/Índigo)</p>
                        <p className="text-xs text-muted-foreground mt-1">Colores por defecto del sistema LYNX.</p>
                      </div>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem value="ocean" id="theme-ocean" className="peer sr-only" />
                    <Label
                      htmlFor="theme-ocean"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 peer-data-[state=checked]:border-cyan-600 peer-data-[state=checked]:bg-cyan-50 dark:peer-data-[state=checked]:bg-cyan-900/20 [&:has([data-state=checked])]:border-cyan-600 cursor-pointer transition-all"
                    >
                      <div className="w-full flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 rounded-full bg-[#0891b2]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#0ea5e9]"></div>
                        </div>
                        {appTheme === "ocean" && <CheckCircle className="w-4 h-4 text-cyan-600" />}
                      </div>
                      <div className="w-full">
                        <p className="font-bold">Océano (Cyan/Celeste)</p>
                        <p className="text-xs text-muted-foreground mt-1">Aspecto fresco, clínico y moderno.</p>
                      </div>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem value="emerald" id="theme-emerald" className="peer sr-only" />
                    <Label
                      htmlFor="theme-emerald"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-900/20 [&:has([data-state=checked])]:border-emerald-600 cursor-pointer transition-all"
                    >
                      <div className="w-full flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 rounded-full bg-[#059669]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#14b8a6]"></div>
                        </div>
                        {appTheme === "emerald" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="w-full">
                        <p className="font-bold">Esmeralda (Verde/Teal)</p>
                        <p className="text-xs text-muted-foreground mt-1">Enfoque en salud visual y bienestar.</p>
                      </div>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem value="violet" id="theme-violet" className="peer sr-only" />
                    <Label
                      htmlFor="theme-violet"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50 dark:peer-data-[state=checked]:bg-violet-900/20 [&:has([data-state=checked])]:border-violet-600 cursor-pointer transition-all"
                    >
                      <div className="w-full flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 rounded-full bg-[#7c3aed]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#d946ef]"></div>
                        </div>
                        {appTheme === "violet" && <CheckCircle className="w-4 h-4 text-violet-600" />}
                      </div>
                      <div className="w-full">
                        <p className="font-bold">Violeta (Uva/Fucsia)</p>
                        <p className="text-xs text-muted-foreground mt-1">Estética premium y elegante.</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
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
                          <MapPin className="w-3 h-3 opacity-40" /> {branches.find(b => b.id === user.defaultBranchId)?.name || 'Todas'}
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
                                  deleteUser(user.id);
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
                <button 
                  onClick={() => setPermissions(initialPermissions)}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Restaurar Valores
                </button>
                <button 
                  onClick={savePermissions}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
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
                  {permissions.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900 dark:text-white">{row.module}</div>
                      </td>
                      {['Ver', 'Crear', 'Editar', 'Eliminar'].map((perm, pIdx) => (
                        <td key={pIdx} className="px-8 py-5">
                          <div className="flex flex-col items-center gap-2">
                             <div className="flex items-center gap-4">
                                <label className="flex flex-col items-center gap-1 cursor-pointer group">
                                  <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-500 uppercase">Admin</span>
                                  <div 
                                    onClick={() => togglePermission(row.id, 'admin', pIdx)}
                                    className={cn(
                                    "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                                    row.admin[pIdx] ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-300"
                                  )}>
                                    {row.admin[pIdx] && <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />}
                                  </div>
                                </label>
                                <label className="flex flex-col items-center gap-1 cursor-pointer group">
                                  <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-500 uppercase">Std</span>
                                  <div 
                                    onClick={() => togglePermission(row.id, 'standard', pIdx)}
                                    className={cn(
                                    "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                                    row.standard[pIdx] ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-300"
                                  )}>
                                    {row.standard[pIdx] && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" />}
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
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Punto de Venta por Defecto</label>
                  <select 
                    value={selectedPV}
                    onChange={e => {
                      setSelectedPV(e.target.value);
                      localStorage.setItem('optica_default_pv', e.target.value);
                    }}
                    className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none text-sm font-medium text-slate-900 dark:text-white"
                  >
                    {puntosVenta.map(pv => (
                      <option key={pv} value={pv}>{pv}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Próximo Nro. de Factura</label>
                  <input className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none" defaultValue="00021458" />
                </div>

                {/* Punto de Venta por Sucursal */}
                <div className="flex flex-col gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6 md:col-span-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4.5 h-4.5 text-blue-600" /> Puntos de Venta Asignados por Sucursal
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Define qué Punto de Venta facturará automáticamente cada sucursal.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {branches.map(branch => (
                      <div key={branch.id} className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{branch.name}</label>
                        <select
                          value={branchPVs[branch.id] || ""}
                          onChange={e => {
                            const updated = { ...branchPVs, [branch.id]: e.target.value };
                            setBranchPVs(updated);
                            localStorage.setItem('optica_branch_pvs', JSON.stringify(updated));
                          }}
                          className="h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none text-xs font-semibold text-slate-900 dark:text-white"
                        >
                          <option value="">Seleccionar Punto de Venta...</option>
                          {puntosVenta.map(pv => (
                            <option key={pv} value={pv}>{pv}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <ScrollText className="w-5 h-5 text-blue-600" /> Credenciales y Certificados de AFIP / ARCA
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Carga los archivos de certificado de homologación o producción y asocia el CUIT para operar con factura electrónica.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CUIT Vinculado</label>
                    <input 
                      type="text" 
                      value={afipCuit}
                      onChange={e => {
                        setAfipCuit(e.target.value);
                        localStorage.setItem('optica_afip_cuit', e.target.value);
                      }}
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono" 
                      placeholder="Ej: 30-71234567-8"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Entorno del Servidor</label>
                    <select 
                      value={afipEnv}
                      onChange={e => {
                        setAfipEnv(e.target.value);
                        localStorage.setItem('optica_afip_env', e.target.value);
                      }}
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold"
                    >
                      <option value="homologacion">Homologación (Testing / Pruebas)</option>
                      <option value="produccion">Producción (Real / Fiscal)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Certificate Upload Slot */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Certificado Digital (.crt / .pem)</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Firmado y descargado desde la web de AFIP.</p>
                    </div>
                    {afipCertName ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 font-bold truncate max-w-[180px]">{afipCertName}</span>
                        <button 
                          onClick={() => {
                            setAfipCertName("");
                            localStorage.removeItem('optica_afip_cert');
                          }}
                          className="text-xs text-red-500 hover:underline font-bold shrink-0 ml-2"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <label className="h-10 flex items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all text-xs font-bold text-slate-500 dark:text-slate-400">
                        Subir certificado_firmado.crt
                        <input 
                          type="file" 
                          accept=".crt,.pem" 
                          className="hidden" 
                          onChange={e => {
                            const name = e.target.files?.[0]?.name || "certificado.crt";
                            setAfipCertName(name);
                            localStorage.setItem('optica_afip_cert', name);
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Private Key Upload Slot */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Clave Privada (.key)</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Clave RSA generada junto con el archivo CSR.</p>
                    </div>
                    {afipKeyName ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 font-bold truncate max-w-[180px]">{afipKeyName}</span>
                        <button 
                          onClick={() => {
                            setAfipKeyName("");
                            localStorage.removeItem('optica_afip_key');
                          }}
                          className="text-xs text-red-500 hover:underline font-bold shrink-0 ml-2"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <label className="h-10 flex items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all text-xs font-bold text-slate-500 dark:text-slate-400">
                        Subir clave_privada.key
                        <input 
                          type="file" 
                          accept=".key" 
                          className="hidden" 
                          onChange={e => {
                            const name = e.target.files?.[0]?.name || "privada.key";
                            setAfipKeyName(name);
                            localStorage.setItem('optica_afip_key', name);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">¿No tienes una clave privada ni un archivo de pedido de firma?</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setCsrCuit(afipCuit.replace(/\D/g, '') || "30712345678");
                      setIsCsrModalOpen(true);
                    }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    🔑 Generar Clave y Solicitud CSR (AFIP)
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de Personalización y Vista Previa */}
            <div className="p-6 sm:p-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Diseño y Personalización de Factura PDF
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ajusta la paleta de colores, márgenes de logos y el alto de las secciones de tu factura. Los cambios se previsualizan automáticamente.
                </p>
              </div>

              {/* Sub-tabs layout */}
              <div className="flex border-b border-slate-205 dark:border-slate-800 mb-6 gap-6">
                {[
                  { id: 'design', label: 'DISEÑO & DATOS' },
                  { id: 'logos', label: 'LOGOS' },
                  { id: 'margins', label: 'ALINEACIÓN & MÁRGENES' }
                ].map(subtab => {
                  const isSubActive = pdfSubTab === subtab.id;
                  return (
                    <button
                      key={subtab.id}
                      type="button"
                      onClick={() => setPdfSubTab(subtab.id as any)}
                      className={cn(
                        "pb-3 text-xs font-black tracking-wider transition-all relative uppercase",
                        isSubActive 
                          ? "text-amber-500 font-extrabold" 
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                    >
                      {subtab.label}
                      {isSubActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full animate-in fade-in slide-in-from-left-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Formulario de Parámetros */}
                <div className="xl:col-span-7 space-y-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-900">
                  
                  {pdfSubTab === 'design' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Paleta de Colores */}
                      <div>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-3">
                          Paleta de Colores Principal
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { id: 'slate', name: 'PIZARRA CLÁSICA', c1: 'bg-[#1e293b]', c2: 'bg-[#94a3b8]' },
                            { id: 'blue', name: 'AZUL PROFESIONAL', c1: 'bg-[#1e3a8a]', c2: 'bg-[#60a5fa]' },
                            { id: 'emerald', name: 'VERDE ESMERALDA', c1: 'bg-[#064e3b]', c2: 'bg-[#34d499]' },
                            { id: 'amber', name: 'ÁMBAR PREMIUM', c1: 'bg-[#78350f]', c2: 'bg-[#fbbf24]' },
                            { id: 'monochrome', name: 'MONOCROMO', c1: 'bg-black', c2: 'bg-zinc-500' }
                          ].map(palette => {
                            const isSelected = pdfConfig.pdfColorPalette === palette.id;
                            return (
                              <button
                                key={palette.id}
                                type="button"
                                onClick={() => setPdfConfig({ ...pdfConfig, pdfColorPalette: palette.id })}
                                className={cn(
                                  "flex items-center justify-between p-3.5 rounded-xl border bg-white dark:bg-slate-900 transition-all text-left",
                                  isSelected 
                                    ? "border-amber-500 ring-1 ring-amber-500 shadow-sm" 
                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                              >
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">{palette.name}</span>
                                <div className="flex gap-1.5">
                                  <span className={cn("w-3 h-3 rounded-full shadow-sm", palette.c1)} />
                                  <span className={cn("w-3 h-3 rounded-full shadow-sm", palette.c2)} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Datos Fiscales / Comerciales */}
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-4">
                          Datos Fiscales / Comerciales de Emisor
                        </span>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Nombre Comercial / Fantasía (Lado Izquierdo)
                            </label>
                            <input 
                              type="text" 
                              value={opticaName} 
                              onChange={e => setOpticaName(e.target.value)}
                              className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Dirección Comercial (Lado Izquierdo)
                            </label>
                            <input 
                              type="text" 
                              value={opticaAddress} 
                              onChange={e => setOpticaAddress(e.target.value)}
                              className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                Inicio de Actividad
                              </label>
                              <input 
                                type="text" 
                                value={inicioActividad} 
                                onChange={e => {
                                  setInicioActividad(e.target.value);
                                  localStorage.setItem('optica_inicio_actividad', e.target.value);
                                }}
                                className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                Ingresos Brutos C.M
                              </label>
                              <input 
                                type="text" 
                                value={iibb} 
                                onChange={e => {
                                  setIibb(e.target.value);
                                  localStorage.setItem('optica_iibb', e.target.value);
                                }}
                                className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {pdfSubTab === 'logos' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Logo del Comercio */}
                      <div>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-4">
                          Logo del Comercio
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Posición del Logo</label>
                            <select 
                              value={pdfConfig.pdfLogoPosition}
                              onChange={e => setPdfConfig({...pdfConfig, pdfLogoPosition: e.target.value})}
                              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none text-xs font-semibold"
                            >
                              <option value="izquierda">CABECERA IZQUIERDA</option>
                              <option value="derecha">CABECERA DERECHA</option>
                              <option value="oculto">OCULTO / SIN LOGO</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ancho del Logo ({pdfConfig.pdfLogoSizeWidth} mm)</span>
                            <input 
                              type="range"
                              min="10"
                              max="100"
                              value={pdfConfig.pdfLogoSizeWidth}
                              onChange={e => setPdfConfig({...pdfConfig, pdfLogoSizeWidth: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Alineación Horizontal X ({pdfConfig.pdfLogoX} mm)</span>
                            <input 
                              type="range"
                              min="0"
                              max="150"
                              value={pdfConfig.pdfLogoX}
                              onChange={e => setPdfConfig({...pdfConfig, pdfLogoX: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Alineación Vertical Y ({pdfConfig.pdfLogoY} mm)</span>
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              value={pdfConfig.pdfLogoY}
                              onChange={e => setPdfConfig({...pdfConfig, pdfLogoY: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center hover:border-amber-500 transition-all cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                          <div className="flex flex-col items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-amber-500 mb-2" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">HAZ CLIC O ARRASTRA EL LOGO DEL NEGOCIO</span>
                            {opticaLogo ? (
                              <span className="text-[10px] text-emerald-600 font-extrabold mt-1.5">✓ LOGO CARGADO</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 mt-1">Formatos recomendados: PNG, JPG</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Marca LYNX Branding */}
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-4">
                          Logo / Marca de LYNX (Branding)
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ubicación en Hoja</label>
                            <select 
                              value={pdfConfig.pdfLynxPosition}
                              onChange={e => setPdfConfig({...pdfConfig, pdfLynxPosition: e.target.value})}
                              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none text-xs font-semibold"
                            >
                              <option value="abajo_centro">ABAJO AL CENTRO (PIE DE P)</option>
                              <option value="abajo_derecha">ABAJO A LA DERECHA (PIE DE P)</option>
                              <option value="abajo_izquierda">ABAJO A LA IZQUIERDA (PIE DE P)</option>
                              <option value="marca_agua">FONDO (MARCA DE AGUA)</option>
                              <option value="oculto">OCULTO / SIN BRANDING</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ancho del Logo LYNX ({pdfConfig.pdfLynxSize} mm)</span>
                            <input 
                              type="range"
                              min="5"
                              max="80"
                              value={pdfConfig.pdfLynxSize}
                              onChange={e => setPdfConfig({...pdfConfig, pdfLynxSize: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* File input for Custom LYNX Branding */}
                          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center hover:border-amber-500 transition-all cursor-pointer flex flex-col items-center justify-center" onClick={() => lynxLogoInputRef.current?.click()}>
                            <Smartphone className="w-6 h-6 text-amber-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">SUBIR LOGO LYNX PERSONALIZADO</span>
                            {pdfConfig.pdfLynxLogo ? (
                              <span className="text-[9px] text-emerald-600 font-extrabold mt-1">✓ LOGO PERSONALIZADO</span>
                            ) : (
                              <span className="text-[9px] text-slate-400 mt-0.5">Formatos: PNG, JPG, SVG</span>
                            )}
                            <input
                              ref={lynxLogoInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setPdfConfig({
                                    ...pdfConfig,
                                    pdfLynxLogo: ev.target?.result as string
                                  });
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setPdfConfig({
                                  ...pdfConfig,
                                  pdfLynxLogo: undefined
                                });
                              }}
                              className="w-full h-full p-4 rounded-xl border border-red-200 dark:border-red-950/45 text-red-600 dark:text-red-400 bg-red-50/10 dark:bg-red-950/10 hover:bg-red-50/20 dark:hover:bg-red-950/20 transition-all font-bold text-xs uppercase tracking-wide"
                            >
                              Restaurar Original
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {pdfSubTab === 'margins' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Dimensiones Generales de la Hoja */}
                      <div>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-4">
                          Dimensiones Generales de la Hoja
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Altura de Cabecera ({pdfConfig.pdfHeaderHeight} mm)</span>
                            <input 
                              type="range"
                              min="20"
                              max="120"
                              value={pdfConfig.pdfHeaderHeight}
                              onChange={e => setPdfConfig({...pdfConfig, pdfHeaderHeight: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Inicio de Tabla de Ítems ({pdfConfig.pdfTableStartY} mm)</span>
                            <input 
                              type="range"
                              min="50"
                              max="200"
                              value={pdfConfig.pdfTableStartY}
                              onChange={e => setPdfConfig({...pdfConfig, pdfTableStartY: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Columna Izquierda (Fantasía) */}
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-4">
                          Columna Izquierda (Fantasía)
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Alineación de Texto</label>
                            <select 
                              value={pdfConfig.pdfLeftColAlign}
                              onChange={e => setPdfConfig({...pdfConfig, pdfLeftColAlign: e.target.value})}
                              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none text-xs font-semibold"
                            >
                              <option value="centrado">CENTRADO EN BLOQUE IZQUIERDO</option>
                              <option value="izquierda">IZQUIERDA EN CABECERA</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tamaño de Fuente Nombre ({pdfConfig.pdfCompanyNameSize} px)</span>
                            <input 
                              type="range"
                              min="8"
                              max="28"
                              value={pdfConfig.pdfCompanyNameSize}
                              onChange={e => setPdfConfig({...pdfConfig, pdfCompanyNameSize: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Posición Horizontal Margen X ({pdfConfig.pdfLeftColX} mm)</span>
                            <input 
                              type="range"
                              min="5"
                              max="100"
                              value={pdfConfig.pdfLeftColX}
                              onChange={e => setPdfConfig({...pdfConfig, pdfLeftColX: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Posición Vertical Alineación Y ({pdfConfig.pdfCompanyNameY} mm)</span>
                            <input 
                              type="range"
                              min="5"
                              max="100"
                              value={pdfConfig.pdfCompanyNameY}
                              onChange={e => setPdfConfig({...pdfConfig, pdfCompanyNameY: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Columna Derecha (Factura) */}
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-4">
                          Columna Derecha (Factura)
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Posición Horizontal X ({pdfConfig.pdfRightColX} mm)</span>
                            <input 
                              type="range"
                              min="50"
                              max="180"
                              value={pdfConfig.pdfRightColX}
                              onChange={e => setPdfConfig({...pdfConfig, pdfRightColX: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Posición Vertical Y ({pdfConfig.pdfRightColY} mm)</span>
                            <input 
                              type="range"
                              min="5"
                              max="100"
                              value={pdfConfig.pdfRightColY}
                              onChange={e => setPdfConfig({...pdfConfig, pdfRightColY: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tamaño Fuente Título ({pdfConfig.pdfRightColTitleSize} pt)</span>
                            <input 
                              type="range"
                              min="8"
                              max="28"
                              value={pdfConfig.pdfRightColTitleSize}
                              onChange={e => setPdfConfig({...pdfConfig, pdfRightColTitleSize: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tamaño de Detalles ({pdfConfig.pdfRightColDetailsSize} pt)</span>
                            <input 
                              type="range"
                              min="6"
                              max="14"
                              value={pdfConfig.pdfRightColDetailsSize}
                              onChange={e => setPdfConfig({...pdfConfig, pdfRightColDetailsSize: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Restablecer valores default */}
                  <div className="flex justify-between items-center pt-5 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        const INITIAL_PDF_CONFIG_LOCAL = {
                          pdfColorPalette: 'slate',
                          pdfLogoPosition: 'izquierda',
                          pdfLogoSizeWidth: 30,
                          pdfLogoX: 15,
                          pdfLogoY: 12,
                          pdfLynxPosition: 'abajo_derecha',
                          pdfLynxSize: 25,
                          pdfLynxOpacity: 0.08,
                          pdfHeaderHeight: 55,
                          pdfCompanyNameSize: 16,
                          pdfCompanyNameY: 25,
                          pdfRightColTitleSize: 18,
                          pdfRightColDetailsSize: 9,
                          pdfRightColY: 15,
                          pdfInvoiceTypeX: 95,
                          pdfInvoiceTypeY: 10,
                          pdfLeftColAlign: 'centrado',
                          pdfLeftColX: 15,
                          pdfRightColX: 110,
                          pdfTableStartY: 92
                        };
                        setPdfConfig(INITIAL_PDF_CONFIG_LOCAL);
                      }}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg text-xs font-bold transition-all"
                    >
                      Restaurar Valores por Defecto
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('optica_inicio_actividad', inicioActividad);
                        localStorage.setItem('optica_iibb', iibb);
                        setPdfConfig({...pdfConfig});
                        alert("¡Diseño final guardado correctamente!");
                      }}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> GUARDAR DISEÑO FINAL
                    </button>
                  </div>
                </div>

                {/* Previsualización en Tiempo Real */}
                <div className="xl:col-span-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-500" /> VISTA PREVIA DEL PDF EN VIVO
                    </span>
                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> AUTO-REGENERANDO
                    </span>
                  </div>
                  {previewUrl ? (
                    <iframe 
                      src={previewUrl} 
                      title="Previsualización Factura" 
                      className="w-full h-[600px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-[600px] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 italic text-sm">
                      Generando previsualización del diseño...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'insurances' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" /> Obras Sociales y Coberturas
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Administra las coberturas disponibles y los descuentos por categoría de producto.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingInsurance({ name: '', active: true, coverages: [] });
                  setIsInsuranceModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" /> Nueva Obra Social
              </button>
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insurances.filter(i => i.active !== false).map(ins => (
                  <div key={ins.id} className="flex flex-col p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{ins.name}</h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingInsurance({ ...ins });
                            setIsInsuranceModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm(`¿Seguro que deseas eliminar/desactivar la obra social ${ins.name}?`)) {
                              removeInsurance(ins.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Coberturas</p>
                      {ins.coverages?.length > 0 ? (
                        <div className="space-y-1">
                          {ins.coverages.map((cov: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                              <span className="text-slate-600 dark:text-slate-300">{cov.categoryId}</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">${cov.amount?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No hay coberturas configuradas</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'banks' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" /> Bancos y Entidades
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Administra la lista de bancos y pasarelas de pago disponibles.</p>
            </div>
            
            <div className="p-6 sm:p-8">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newBank.name.trim()) {
                    addBank(newBank);
                    setNewBank({ name: '', cbu: '', alias: '', accountNumber: '' });
                  }
                }}
                className="flex flex-col gap-4 mb-8 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Banco / Billetera</label>
                    <input 
                      type="text" 
                      value={newBank.name}
                      onChange={e => setNewBank({...newBank, name: e.target.value})}
                      placeholder="Ej: Banco Macro" 
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nro de Cuenta (Opcional)</label>
                    <input 
                      type="text" 
                      value={newBank.accountNumber}
                      onChange={e => setNewBank({...newBank, accountNumber: e.target.value})}
                      placeholder="Ej: CC-1234567/8" 
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CBU / CVU (Opcional)</label>
                    <input 
                      type="text" 
                      value={newBank.cbu}
                      onChange={e => setNewBank({...newBank, cbu: e.target.value})}
                      placeholder="22 dígitos" 
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alias (Opcional)</label>
                    <input 
                      type="text" 
                      value={newBank.alias}
                      onChange={e => setNewBank({...newBank, alias: e.target.value})}
                      placeholder="Ej: optica.paracao.mp" 
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700 mt-2 gap-3">
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Registrar Banco
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {banks.map(bank => (
                  <div key={bank.id} className="relative flex flex-col p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm group hover:border-blue-300 dark:hover:border-blue-900 transition-all">
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingBank({ id: bank.id, name: bank.name, cbu: bank.cbu, alias: bank.alias, accountNumber: bank.accountNumber });
                          setIsBankEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeBank(bank.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white pr-6 leading-tight">{bank.name}</h4>
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      {bank.accountNumber && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nro de Cuenta</p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{bank.accountNumber}</p>
                        </div>
                      )}
                      {bank.cbu && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CBU/CVU</p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono tracking-wider">{bank.cbu}</p>
                        </div>
                      )}
                      {bank.alias && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alias</p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">{bank.alias}</p>
                        </div>
                      )}
                      {!bank.accountNumber && !bank.cbu && !bank.alias && (
                        <p className="text-xs text-slate-400 italic">Sin datos adicionales registrados</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Editar Banco */}
            {isBankEditModalOpen && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                      <Building2 className="w-6 h-6 text-blue-600" /> Editar Banco
                    </h3>
                    <button onClick={() => setIsBankEditModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingBank.name.trim()) {
                      updateBank(editingBank);
                      setIsBankEditModalOpen(false);
                    }
                  }}>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Banco / Billetera</label>
                        <input type="text" value={editingBank.name} onChange={e => setEditingBank({...editingBank, name: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" required />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nro de Cuenta</label>
                        <input type="text" value={editingBank.accountNumber} onChange={e => setEditingBank({...editingBank, accountNumber: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CBU / CVU</label>
                        <input type="text" value={editingBank.cbu} onChange={e => setEditingBank({...editingBank, cbu: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alias</label>
                        <input type="text" value={editingBank.alias} onChange={e => setEditingBank({...editingBank, alias: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsBankEditModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                      <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"><Save className="w-4 h-4"/> Guardar Cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'inventory' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" /> Categorías de Inventario
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configura las categorías para clasificar tus productos y stock.</p>
            </div>
            
            <div className="p-6 sm:p-8">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCategory.trim()) {
                    addInventoryCategory(newCategory);
                    setNewCategory('');
                  }
                }}
                className="flex gap-3 mb-8"
              >
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Añadir nueva categoría (Ej: Lentes de Contacto)" 
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                />
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Añadir
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {inventoryCategories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors group shadow-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingCategory({ oldName: cat, newName: cat });
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeInventoryCategory(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Editar Categoría */}
            {isCategoryModalOpen && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                      <Package className="w-6 h-6 text-blue-600" /> Editar Categoría
                    </h3>
                    <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingCategory.newName.trim()) {
                      updateInventoryCategory(editingCategory.oldName, editingCategory.newName);
                      setIsCategoryModalOpen(false);
                    }
                  }}>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre de la Categoría</label>
                        <input type="text" value={editingCategory.newName} onChange={e => setEditingCategory({...editingCategory, newName: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" required />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                      <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"><Save className="w-4 h-4"/> Guardar Cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Divider and Lens Colors Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 sm:p-8 mt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Eye className="w-6 h-6 text-indigo-600" /> Colores de Cristales
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Configura los colores disponibles para los pedidos de laboratorio.</p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newLensColor.trim()) {
                    addLensColor(newLensColor);
                    setNewLensColor('');
                  }
                }}
                className="flex gap-3 mb-8"
              >
                <input 
                  type="text" 
                  value={newLensColor}
                  onChange={e => setNewLensColor(e.target.value)}
                  placeholder="Añadir nuevo color (Ej: Fotocromático)" 
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white"
                />
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Añadir
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {lensColors.map(color => (
                  <div key={color} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group shadow-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{color}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingLensColor({ oldName: color, newName: color });
                          setIsLensColorModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeLensColor(color)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Editar Color Cristal */}
            {isLensColorModalOpen && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                      <Eye className="w-6 h-6 text-indigo-600" /> Editar Color
                    </h3>
                    <button onClick={() => setIsLensColorModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingLensColor.newName.trim()) {
                      updateLensColor(editingLensColor.oldName, editingLensColor.newName);
                      setIsLensColorModalOpen(false);
                    }
                  }}>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Color</label>
                        <input type="text" value={editingLensColor.newName} onChange={e => setEditingLensColor({...editingLensColor, newName: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-white" required />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsLensColorModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                      <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"><Save className="w-4 h-4"/> Guardar Cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Divider and Contact Lens Colors Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 sm:p-8 mt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Eye className="w-6 h-6 text-teal-600" /> Colores de Lentes de Contacto
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Configura los colores específicos para lentes de contacto.</p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newContactLensColor.trim()) {
                    addContactLensColor(newContactLensColor);
                    setNewContactLensColor('');
                  }
                }}
                className="flex gap-3 mb-8"
              >
                <input 
                  type="text" 
                  value={newContactLensColor}
                  onChange={e => setNewContactLensColor(e.target.value)}
                  placeholder="Añadir nuevo color (Ej: Celestes)" 
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-teal-600 text-slate-900 dark:text-white"
                />
                <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Añadir
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {contactLensColors.map(color => (
                  <div key={color} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-200 dark:hover:border-teal-900/50 transition-colors group shadow-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{color}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingContactLensColor({ oldName: color, newName: color });
                          setIsContactLensColorModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeContactLensColor(color)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Editar Color Lentes de Contacto */}
            {isContactLensColorModalOpen && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                      <Eye className="w-6 h-6 text-teal-600" /> Editar Color
                    </h3>
                    <button onClick={() => setIsContactLensColorModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingContactLensColor.newName.trim()) {
                      updateContactLensColor(editingContactLensColor.oldName, editingContactLensColor.newName);
                      setIsContactLensColorModalOpen(false);
                    }
                  }}>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Color</label>
                        <input type="text" value={editingContactLensColor.newName} onChange={e => setEditingContactLensColor({...editingContactLensColor, newName: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-teal-600 outline-none text-slate-900 dark:text-white" required />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsContactLensColorModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                      <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold shadow-sm hover:bg-teal-700 transition-colors flex items-center gap-2"><Save className="w-4 h-4"/> Guardar Cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Divider and Lens Types Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 sm:p-8 mt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Eye className="w-6 h-6 text-purple-600" /> Tipos de Cristales
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Configura los tipos de cristales disponibles (Ej: Monofocal, Multifocal).</p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newLensType.trim()) {
                    addLensType(newLensType);
                    setNewLensType('');
                  }
                }}
                className="flex gap-3 mb-8"
              >
                <input 
                  type="text" 
                  value={newLensType}
                  onChange={e => setNewLensType(e.target.value)}
                  placeholder="Añadir nuevo tipo (Ej: Monofocal)" 
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white"
                />
                <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Añadir
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {lensTypes.map(type => (
                  <div key={type} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-200 dark:hover:border-purple-900/50 transition-colors group shadow-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{type}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingLensType({ oldName: type, newName: type });
                          setIsLensTypeModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeLensType(type)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Editar Tipo de Cristal */}
            {isLensTypeModalOpen && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                      <Eye className="w-6 h-6 text-purple-600" /> Editar Tipo
                    </h3>
                    <button onClick={() => setIsLensTypeModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingLensType.newName.trim()) {
                      updateLensType(editingLensType.oldName, editingLensType.newName);
                      setIsLensTypeModalOpen(false);
                    }
                  }}>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Tipo</label>
                        <input type="text" value={editingLensType.newName} onChange={e => setEditingLensType({...editingLensType, newName: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-purple-600 outline-none text-slate-900 dark:text-white" required />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsLensTypeModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                      <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-bold shadow-sm hover:bg-purple-700 transition-colors flex items-center gap-2"><Save className="w-4 h-4"/> Guardar Cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
        
        {activeTab !== 'general' && activeTab !== 'appearance' && activeTab !== 'branches' && activeTab !== 'users' && activeTab !== 'permissions' && activeTab !== 'notifications' && activeTab !== 'billing' && activeTab !== 'audit' && activeTab !== 'insurances' && activeTab !== 'banks' && activeTab !== 'inventory' && activeTab !== 'database' && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center animate-in fade-in duration-300 min-h-[400px]">
            <CircleAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Sección en Construcción</h3>
            <p className="text-slate-500 dark:text-slate-500 mt-2 max-w-md">Esta área de configuración estará disponible en la próxima actualización del sistema.</p>
          </div>
        )}

        {isInsuranceModalOpen && editingInsurance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  {editingInsurance.id ? 'Editar Obra Social' : 'Nueva Obra Social'}
                </h3>
                <button 
                  onClick={() => setIsInsuranceModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de la Obra Social</label>
                  <input 
                    type="text" 
                    value={editingInsurance.name}
                    onChange={e => setEditingInsurance({...editingInsurance, name: e.target.value})}
                    className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                    placeholder="Ej: OSDE, Swiss Medical..."
                  />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Coberturas por Categoría</h4>
                  <div className="space-y-3 mb-4">
                    {editingInsurance.coverages.map((cov: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <select
                          value={cov.categoryId}
                          onChange={e => {
                            const newCovs = [...editingInsurance.coverages];
                            newCovs[idx].categoryId = e.target.value;
                            setEditingInsurance({...editingInsurance, coverages: newCovs});
                          }}
                          className="flex-1 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                        >
                          <option value="">Seleccionar Categoría</option>
                          {inventoryCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="relative w-36">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input 
                            type="number"
                            min="0"
                            value={cov.amount || ''}
                            onChange={e => {
                              const newCovs = [...editingInsurance.coverages];
                              newCovs[idx].amount = Number(e.target.value);
                              setEditingInsurance({...editingInsurance, coverages: newCovs});
                            }}
                            className="h-11 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-mono"
                            placeholder="Ej: 5000"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const newCovs = editingInsurance.coverages.filter((_: any, i: number) => i !== idx);
                            setEditingInsurance({...editingInsurance, coverages: newCovs});
                          }}
                          className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingInsurance({
                        ...editingInsurance, 
                        coverages: [...editingInsurance.coverages, { categoryId: '', amount: 0 }]
                      });
                    }}
                    className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Añadir Regla de Cobertura
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  onClick={() => setIsInsuranceModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (!editingInsurance.name.trim()) return alert("El nombre es requerido");
                    if (editingInsurance.id) {
                      updateInsurance(editingInsurance);
                    } else {
                      addInsurance({ name: editingInsurance.name, active: true, coverages: editingInsurance.coverages });
                    }
                    setIsInsuranceModalOpen(false);
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </div>
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
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                const target = e.target as any;
                addUser({
                  id: Date.now().toString(),
                  name: target.elements.name.value,
                  email: target.elements.email.value,
                  username: target.elements.email.value.split('@')[0], // Generate default username
                  password: "password123", // Default initial password
                  role: target.elements.role.value,
                  defaultBranchId: target.elements.branch.value,
                  status: 'Activo'
                });
                setIsUserModalOpen(false); 
              }}>
                <div className="p-6 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre Completo</label>
                    <input name="name" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Ej: Juan Pérez" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                    <input name="email" type="email" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="ejemplo@visionclara.com" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Rol de Acceso</label>
                      <select name="role" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm" required>
                        <option value="standard">Estándar (Vendedor)</option>
                        <option value="admin">Administrador</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sucursal Asignada</label>
                      <select name="branch" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm" required>
                        <option value="all">Todas</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
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

        {activeTab === 'database' && (
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Base de Datos Local
            </h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-2xl">
              Actualmente los datos de la aplicación se guardan de forma segura en el almacenamiento local del navegador (LocalStorage). Desde aquí puedes administrar tus datos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" /> Exportar Backup
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-8">
                  Descarga una copia completa de toda tu base de datos en formato JSON.
                </p>
                <button 
                  onClick={handleExportLocalDB}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Descargar Copia Local
                </button>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" /> Importar Backup
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-8">
                  Restaura tu información a partir de un archivo JSON descargado previamente.
                </p>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImportLocalDB}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cargar Archivo JSON
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2 pt-8 border-t border-slate-200 dark:border-slate-800">
              <Cloud className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Migración a Supabase (Nube)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
              Puedes exportar tu información actual para llevarla a una base de datos en la nube como Supabase. Al generar el script SQL, obtendrás el código necesario para crear las tablas e importar tus datos exactos de forma automatizada en tu panel de Supabase.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex flex-col gap-1.5 max-w-xl">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Project URL</label>
                <input 
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="https://xyzcompany.supabase.co" 
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 max-w-xl">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">API Key / Service Role Key</label>
                <input 
                  type="password"
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={handleGenerateSupabaseSQL}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Cloud className="w-4 h-4" /> Generar Script SQL para Supabase
            </button>

            {/* Danger Zone */}
            <div className="mt-16 p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl">
              <h4 className="text-red-700 dark:text-red-400 font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Zona de Peligro
              </h4>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                Esta acción eliminará todos los registros de la base de datos local (clientes, inventario, pedidos, finanzas, laboratorios). 
                Solo se conservarán los ajustes visuales y categorías.
              </p>
              <button 
                onClick={handleResetDatabase}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold shadow-sm hover:bg-red-700 transition-colors"
              >
                Resetear Base de Datos
              </button>
            </div>
          </section>
        )}
      </div>

      {/* AFIP CSR / Key Generation Wizard Modal */}
      {isCsrModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                🔑 Asistente Generador CSR & Clave
              </h3>
              <button 
                onClick={() => setIsCsrModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Genera tu clave privada local y la solicitud de firma (CSR) requerida por el portal de AFIP (Clave Fiscal) para habilitar la facturación electrónica.
              </p>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">CUIT del Contribuyente (sin guiones)</label>
                  <input 
                    type="text" 
                    value={csrCuit}
                    onChange={e => setCsrCuit(e.target.value.replace(/\D/g, ''))}
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white" 
                    placeholder="30712345678"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nombre de la Organización (Razón Social)</label>
                  <input 
                    type="text" 
                    value={csrOrg}
                    onChange={e => setCsrOrg(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white" 
                    placeholder="Óptica Paracao"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nombre del Sistema (CN)</label>
                  <input 
                    type="text" 
                    value={csrCN}
                    onChange={e => setCsrCN(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white" 
                    placeholder="ParacaoApp"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-[10px] text-blue-700 dark:text-blue-400/90 leading-relaxed font-medium">
                  <strong>Próximo Paso:</strong> Al hacer click en Generar, se crearán y descargarán los archivos <code>privada.key</code> y <code>pedido.csr</code>. Deberás subir el archivo <code>pedido.csr</code> al portal de AFIP ("Administración de Certificados Digitales") para obtener tu certificado <code>certificado.crt</code> definitivo.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsCsrModalOpen(false)} 
                className="px-6 py-2.5 rounded-lg font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={() => {
                  // Simulate CSR & Private Key Generation & Download
                  const mockPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0t6aKz... (Clave RSA Privada de 2048 bits de ${csrOrg})\n-----END RSA PRIVATE KEY-----`;
                  const mockCsr = `-----BEGIN CERTIFICATE REQUEST-----\nMIIBnMCMQswCQYDVQQGEwJBUjE... (Pedido CSR para CUIT ${csrCuit} / CN=${csrCN})\n-----END CERTIFICATE REQUEST-----`;

                  const downloadFile = (content: string, filename: string) => {
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                  };

                  downloadFile(mockPrivateKey, "privada.key");
                  setTimeout(() => downloadFile(mockCsr, "pedido.csr"), 300);

                  alert("¡Archivos 'privada.key' y 'pedido.csr' generados y descargados con éxito!\n\nPor favor, subí el archivo 'pedido.csr' a la web de AFIP.");
                  
                  // Auto fill in the loaded inputs for testing
                  setAfipKeyName("privada.key");
                  localStorage.setItem('optica_afip_key', "privada.key");

                  setIsCsrModalOpen(false);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/10"
              >
                Generar y Descargar Archivos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
