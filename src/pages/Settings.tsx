import React, { useState, useEffect, useRef } from "react";
import { Building2, Users, Shield, Bell, Receipt, ScrollText, Save, X, MapPin, Plus, Trash2, Smartphone, Edit2, CircleAlert, Info, Clock, AlertTriangle, CheckCircle, Eye, EyeOff, KeyRound, Lock, Activity, Package, Database, Cloud, ImageIcon, Sparkles, FileText, FlaskConical, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { getSavedConnections, saveConnections, getActiveConnectionId, switchConnection, SupabaseConnection } from "../lib/supabase";
import { logger } from "../lib/logger";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { useLabs } from "../context/LabContext";
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
  { id: 'labs', label: 'Laboratorios', icon: FlaskConical },
  { id: 'crystals', label: 'Tabla de Cristales', icon: Eye },
  { id: 'database', label: 'Base de Datos', icon: Database },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
];

export function Settings() {
  const currentUser = { name: "Ignacio Valente", role: "superadmin" }; // User Mock for permissions
  const [activeTab, setActiveTab] = useState('general');
  const [connections, setConnections] = useState<SupabaseConnection[]>(() => getSavedConnections());
  const activeConnectionId = getActiveConnectionId();
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const [editingConn, setEditingConn] = useState<SupabaseConnection | null>(null);
  const [connName, setConnName] = useState('');
  const [connUrl, setConnUrl] = useState('');
  const [connAnonKey, setConnAnonKey] = useState('');

  
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
  const { 
    insurances, addInsurance, updateInsurance, removeInsurance, 
    banks, addBank, updateBank, removeBank, 
    inventoryCategories, addInventoryCategory, updateInventoryCategory, removeInventoryCategory, 
    lensColors, addLensColor, updateLensColor, removeLensColor, 
    contactLensColors, addContactLensColor, updateContactLensColor, removeContactLensColor, 
    lensTypes, addLensType, updateLensType, removeLensType, 
    opticaLogo, setOpticaLogo, opticaName, setOpticaName, opticaPhone, setOpticaPhone, opticaAddress, setOpticaAddress, 
    appTheme, setAppTheme, pdfConfig, setPdfConfig, 
    crystalRules, addCrystalRule, updateCrystalRule, removeCrystalRule,
    crystalItems, addCrystalItem, updateCrystalItem, removeCrystalItem,
    treatments, addTreatment, updateTreatment, removeTreatment,
    brands, setBrands, materials, setMaterials, indices, setIndices, designs, setDesigns, colors, setColors
  } = useSettings();
  const { labs, addLab, updateLab, deleteLab } = useLabs();

  // Crystal refactored state
  const [crystalSubTab, setCrystalSubTab] = useState<'catalog' | 'masters'>('catalog');
  
  const EMPTY_CRYSTAL_ITEM = {
    name: '',
    type: 'monofocal',
    material: 'Orgánico',
    index: '1.49',
    brand: 'Essilor',
    design: 'Esférico',
    color: 'Blanco',
    basePrice: 0,
    active: true,
    sphMin: -6.00,
    sphMax: 6.00,
    cylMax: 2.00,
    addMin: 1.00,
    addMax: 3.00,
    treatments: []
  };
  const [isCrystalItemModalOpen, setIsCrystalItemModalOpen] = useState(false);
  const [editingCrystalItem, setEditingCrystalItem] = useState<any>(null);
  const [crystalItemForm, setCrystalItemForm] = useState<any>(EMPTY_CRYSTAL_ITEM);

  const EMPTY_TREATMENT = {
    name: '',
    price: 0,
    active: true,
    incompatibleMaterials: [],
    incompatibleTreatments: []
  };
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<any>(null);
  const [treatmentForm, setTreatmentForm] = useState<any>(EMPTY_TREATMENT);

  const [masterInputValues, setMasterInputValues] = useState({
    brand: '',
    material: '',
    index: '',
    design: '',
    color: '',
    treatment: ''
  });

  // Legacy Crystal rules modal state
  const EMPTY_CRYSTAL_RULE = { name: '', material: 'Orgánico', tratamiento: 'Blanco', precio: 0, conditions: [{ esfMin: -6, esfMax: 6, cilMax: 2 }] };
  const [isCrystalRuleModalOpen, setIsCrystalRuleModalOpen] = useState(false);
  const [editingCrystalRule, setEditingCrystalRule] = useState<any>(null);
  const [crystalRuleForm, setCrystalRuleForm] = useState<any>(EMPTY_CRYSTAL_RULE);
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
  const [newLab, setNewLab] = useState({ name: '', contact: '' });
  const [isLabEditModalOpen, setIsLabEditModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState({ id: '', name: '', contact: '' });
  
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
    let sql = `-- MIGRACIÓN COMPLETA PARA SUPABASE (SIN LOCALSTORAGE)\n`;
    sql += `-- Instrucciones: Copiá y pegá este código completo en el SQL Editor de tu consola de Supabase y hacé clic en RUN.\n\n`;

    sql += `-- OTORGAR PERMISOS GLOBALES DE LECTURA Y ESCRITURA EN EL ESQUEMA PUBLIC\n`;
    sql += `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;\n`;
    sql += `GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;\n`;
    sql += `GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;\n`;
    sql += `GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;\n`;
    sql += `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;\n\n`;


    sql += `-- 1. Tabla de Perfiles de Usuario\n`;
    sql += `CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  name text,
  email text,
  role text DEFAULT 'standard',
  default_branch_id text DEFAULT '1',
  status text DEFAULT 'Activo',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en profiles" ON profiles;\n`;
    sql += `CREATE POLICY "Permitir todo en profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 2. Tabla de Clientes\n`;
    sql += `CREATE TABLE IF NOT EXISTS clients (
  id text PRIMARY KEY,
  name text,
  dni text,
  phone text,
  email text,
  lastVisit text,
  balance numeric DEFAULT 0
);\n`;
    sql += `ALTER TABLE clients ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en clients" ON clients;\n`;
    sql += `CREATE POLICY "Permitir todo en clients" ON clients FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 3. Tabla de Inventario / Productos\n`;
    sql += `CREATE TABLE IF NOT EXISTS inventory (
  sku text PRIMARY KEY,
  name text,
  cat text,
  price text,
  color text,
  buyPrice numeric DEFAULT 0,
  criticalStock numeric DEFAULT 5,
  stocks jsonb DEFAULT '{"1": 0, "2": 0}'::jsonb
);\n`;
    sql += `ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en inventory" ON inventory;\n`;
    sql += `CREATE POLICY "Permitir todo en inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 4. Tabla de Órdenes y Pedidos\n`;
    sql += `CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  clientId text,
  clientName text,
  date text,
  type text,
  service text,
  status text,
  amount numeric DEFAULT 0,
  paid numeric DEFAULT 0
);\n`;
    sql += `ALTER TABLE orders ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en orders" ON orders;\n`;
    sql += `CREATE POLICY "Permitir todo en orders" ON orders FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 5. Tabla de Campañas de Marketing / Promociones\n`;
    sql += `CREATE TABLE IF NOT EXISTS campaigns (
  id text PRIMARY KEY,
  name text,
  status text DEFAULT 'Active',
  sent numeric DEFAULT 0,
  conversion text DEFAULT '0%',
  type text DEFAULT 'WhatsApp',
  timeValue numeric DEFAULT 6,
  timeUnit text DEFAULT 'months',
  productType text DEFAULT 'any',
  template text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en campaigns" ON campaigns;\n`;
    sql += `CREATE POLICY "Permitir todo en campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 6. Tabla de Médicos / Oftalmólogos\n`;
    sql += `CREATE TABLE IF NOT EXISTS doctors (
  id text PRIMARY KEY,
  name text,
  mp text,
  specialty text,
  clinic text,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en doctors" ON doctors;\n`;
    sql += `CREATE POLICY "Permitir todo en doctors" ON doctors FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 7. Tabla de Bancos y Entidades Financieras\n`;
    sql += `CREATE TABLE IF NOT EXISTS banks (
  id text PRIMARY KEY,
  name text,
  accountNumber text,
  cbu text,
  alias text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE banks ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en banks" ON banks;\n`;
    sql += `CREATE POLICY "Permitir todo en banks" ON banks FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 8. Tabla de Obras Sociales y Mutuas\n`;
    sql += `CREATE TABLE IF NOT EXISTS insurances (
  id text PRIMARY KEY,
  name text,
  code text,
  discount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en insurances" ON insurances;\n`;
    sql += `CREATE POLICY "Permitir todo en insurances" ON insurances FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 9. Tabla de Proveedores\n`;
    sql += `CREATE TABLE IF NOT EXISTS suppliers (
  id text PRIMARY KEY,
  name text,
  phone text,
  email text,
  address text,
  contact text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en suppliers" ON suppliers;\n`;
    sql += `CREATE POLICY "Permitir todo en suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 10. Tabla de Laboratorios Ópticos\n`;
    sql += `CREATE TABLE IF NOT EXISTS labs (
  id text PRIMARY KEY,
  name text,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE labs ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en labs" ON labs;\n`;
    sql += `CREATE POLICY "Permitir todo en labs" ON labs FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 11. Tabla de Catálogo de Cristales\n`;
    sql += `CREATE TABLE IF NOT EXISTS crystal_items (
  id text PRIMARY KEY,
  name text,
  type text,
  material text,
  index text,
  brand text,
  design text,
  color text,
  basePrice numeric DEFAULT 0,
  active boolean DEFAULT true,
  sphMin numeric,
  sphMax numeric,
  cylMax numeric,
  addMin numeric,
  addMax numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE crystal_items ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en crystal_items" ON crystal_items;\n`;
    sql += `CREATE POLICY "Permitir todo en crystal_items" ON crystal_items FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 12. Tabla de Reglas de Precio de Cristales\n`;
    sql += `CREATE TABLE IF NOT EXISTS crystal_rules (
  id text PRIMARY KEY,
  name text,
  material text,
  tratamiento text,
  precio numeric DEFAULT 0,
  conditions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE crystal_rules ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en crystal_rules" ON crystal_rules;\n`;
    sql += `CREATE POLICY "Permitir todo en crystal_rules" ON crystal_rules FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 13. Tabla de Tratamientos de Cristales\n`;
    sql += `CREATE TABLE IF NOT EXISTS crystal_treatments (
  id text PRIMARY KEY,
  name text,
  price numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE crystal_treatments ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en crystal_treatments" ON crystal_treatments;\n`;
    sql += `CREATE POLICY "Permitir todo en crystal_treatments" ON crystal_treatments FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 14. Tabla de Maestros de Cristales (Marcas, Materiales, Índices, Diseños, Colores)\n`;
    sql += `CREATE TABLE IF NOT EXISTS crystal_masters (
  id text PRIMARY KEY,
  category text, -- 'brand', 'material', 'index', 'design', 'color'
  name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE crystal_masters ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en crystal_masters" ON crystal_masters;\n`;
    sql += `CREATE POLICY "Permitir todo en crystal_masters" ON crystal_masters FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 15. Tabla de Sucursales y Bocas de Venta\n`;
    sql += `CREATE TABLE IF NOT EXISTS branches (
  id text PRIMARY KEY,
  name text,
  address text,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE branches ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en branches" ON branches;\n`;
    sql += `CREATE POLICY "Permitir todo en branches" ON branches FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 16. Tabla de Categorías de Inventario\n`;
    sql += `CREATE TABLE IF NOT EXISTS inventory_categories (
  id text PRIMARY KEY,
  name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en inventory_categories" ON inventory_categories;\n`;
    sql += `CREATE POLICY "Permitir todo en inventory_categories" ON inventory_categories FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 17. Tabla de Ajustes del Sistema y Datos Corporativos\n`;
    sql += `CREATE TABLE IF NOT EXISTS system_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en system_settings" ON system_settings;\n`;
    sql += `CREATE POLICY "Permitir todo en system_settings" ON system_settings FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 18. Tabla de Logs de Auditoría\n`;
    sql += `CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY,
  timestamp text,
  user_name text,
  user_role text,
  action text,
  module text,
  details text,
  ip text
);\n`;
    sql += `ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en audit_logs" ON audit_logs;\n`;
    sql += `CREATE POLICY "Permitir todo en audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 19. Tabla de Transacciones Financieras de Caja\n`;
    sql += `CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  date text,
  time text,
  concept text,
  method text,
  amount numeric,
  type text,
  category text,
  box_id text,
  client_id text,
  client_name text,
  reconciled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en transactions" ON transactions;\n`;
    sql += `CREATE POLICY "Permitir todo en transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 20. Tabla de Proveedores\n`;
    sql += `CREATE TABLE IF NOT EXISTS suppliers (
  id text PRIMARY KEY,
  code text,
  name text,
  cuit text,
  cbu text,
  contact text,
  email text,
  phone text,
  category text,
  payment_terms text,
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en suppliers" ON suppliers;\n`;
    sql += `CREATE POLICY "Permitir todo en suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 21. Tabla de Transacciones de Proveedores (Cuentas Corrientes)\n`;
    sql += `CREATE TABLE IF NOT EXISTS supplier_transactions (
  id text PRIMARY KEY,
  supplier_id text REFERENCES suppliers(id) ON DELETE CASCADE,
  date text,
  due_date text,
  payment_terms text,
  voucher_number text,
  amount numeric,
  type text,
  status text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE supplier_transactions ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en supplier_transactions" ON supplier_transactions;\n`;
    sql += `CREATE POLICY "Permitir todo en supplier_transactions" ON supplier_transactions FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- 22. Tabla de Borradores de Facturación (Billing Drafts)\n`;
    sql += `CREATE TABLE IF NOT EXISTS billing_drafts (
  id text PRIMARY KEY,
  date text,
  client_name text,
  concept text,
  amount numeric,
  payment_method text,
  billed boolean DEFAULT false,
  billing_data jsonb,
  items jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);\n`;
    sql += `ALTER TABLE billing_drafts ENABLE ROW LEVEL SECURITY;\n`;
    sql += `DROP POLICY IF EXISTS "Permitir todo en billing_drafts" ON billing_drafts;\n`;
    sql += `CREATE POLICY "Permitir todo en billing_drafts" ON billing_drafts FOR ALL USING (true) WITH CHECK (true);\n\n`;

    sql += `-- DATOS INICIALES PREDETERMINADOS (SEED DATA)\n\n`;

    sql += `-- Bancos y Entidades\n`;
    sql += `INSERT INTO banks (id, name, accountNumber, cbu, alias) VALUES
('1', 'Banco Galicia', '', '', ''),
('2', 'Banco Santander', '', '', ''),
('3', 'Mercado Pago', '', '', '')
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- Obras Sociales\n`;
    sql += `INSERT INTO insurances (id, name, code, discount) VALUES
('1', 'Particular', 'PART', 0),
('2', 'OSDE', 'OSDE', 0),
('3', 'Swiss Medical', 'SMED', 0),
('4', 'PAMI', 'PAMI', 0),
('5', 'Jerárquicos', 'JERA', 0),
('6', 'IAPOS', 'IAPO', 0)
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- Sucursales\n`;
    sql += `INSERT INTO branches (id, name, address, phone) VALUES
('1', 'Casa Central', 'Av. Principal 123', '0343-4200000'),
('2', 'Shopping Mall', 'Local 45', '0343-4300000')
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- Categorías de Inventario\n`;
    sql += `INSERT INTO inventory_categories (id, name) VALUES
('cat-1', 'Armazones'),
('cat-2', 'Anteojos de Sol'),
('cat-3', 'Anteojos Terminados'),
('cat-4', 'Cristales'),
('cat-5', 'Lentes de Contacto'),
('cat-6', 'Líquidos'),
('cat-7', 'Accesorios')
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- Campañas de Marketing\n`;
    sql += `INSERT INTO campaigns (id, name, status, sent, conversion, type, timeValue, timeUnit, productType, template) VALUES
('1', 'Recordatorio Control Anual', 'Active', 145, '12%', 'WhatsApp', 12, 'months', 'any', '¡Hola {nombre_cliente}! Te escribimos de la Óptica. Notamos que tu último control para tus {producto} fue en {fecha}. ¿Te gustaría agendar una cita para revisar tu graduación visual? 👓'),
('2', 'Promo Lentes de Contacto', 'Scheduled', 0, '0%', 'WhatsApp', 6, 'months', 'contact', 'Hola {nombre_cliente}, te recordamos que ya pasó un tiempo desde tu última visita por tus lentes de contacto. ¡Te esperamos!'),
('3', 'Renovación Multifocales', 'Active', 89, '8%', 'WhatsApp', 12, 'months', 'multifocal', 'Estimado/a {nombre_cliente}, ya ha transcurrido un año desde que adquirió sus lentes multifocales. Le recomendamos agendar su cita de control anual.')
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- Catálogo de Cristales\n`;
    sql += `INSERT INTO crystal_items (id, name, type, material, index, brand, design, color, basePrice, active, sphMin, sphMax, cylMax) VALUES
('cr-1', 'Monofocal Essilor Orgánico 1.49 Esférico Blanco', 'monofocal', 'Orgánico', '1.49', 'Essilor', 'Esférico', 'Blanco', 15000, true, -6.00, 6.00, 2.00),
('cr-2', 'Monofocal Zeiss Policarbonato 1.59 Esférico Blanco', 'monofocal', 'Policarbonato', '1.59', 'Zeiss', 'Esférico', 'Blanco', 22000, true, -8.00, 4.00, 4.00),
('cr-3', 'Multifocal Novar Orgánico 1.67 Digital Blanco', 'multifocal', 'Orgánico', '1.67', 'Novar', 'Digital', 'Blanco', 45000, true, -10.00, 6.00, 4.00)
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- Reglas de Precio de Cristales\n`;
    sql += `INSERT INTO crystal_rules (id, name, material, tratamiento, precio, conditions) VALUES
('cr-1', 'Orgánico Blanco — Stock', 'Orgánico', 'Blanco', 26000, '[{"esfMin": -6, "esfMax": 6, "cilMax": 2, "esfPlusCilMax": 6}]'::jsonb),
('cr-2', 'Orgánico c/AR — Stock', 'Orgánico', 'AR', 41000, '[{"esfMin": -6, "esfMax": 6, "cilMax": 2, "esfPlusCilMax": 6}]'::jsonb),
('cr-3', 'Orgánico AR + Blue Cut — Stock', 'Orgánico', 'AR + Blue Cut', 49900, '[{"esfMin": -4, "esfMax": 4, "cilMax": 2, "esfPlusCilMax": 6}]'::jsonb)
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- Tratamientos de Cristales\n`;
    sql += `INSERT INTO crystal_treatments (id, name, price) VALUES
('tr-1', 'Blanco', 0),
('tr-2', 'AR (Antireflex)', 15000),
('tr-3', 'AR + Blue Cut', 23900),
('tr-4', 'Fotocromático', 35000)
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- Maestros de Cristales (Marcas, Materiales, Índices, Diseños)\n`;
    sql += `INSERT INTO crystal_masters (id, category, name) VALUES
('m-1', 'brand', 'Essilor'),
('m-2', 'brand', 'Zeiss'),
('m-3', 'brand', 'Novar'),
('m-4', 'brand', 'Rodenstock'),
('m-5', 'material', 'Orgánico'),
('m-6', 'material', 'Policarbonato'),
('m-7', 'material', 'Mineral'),
('m-8', 'index', '1.49'),
('m-9', 'index', '1.56'),
('m-10', 'index', '1.59'),
('m-11', 'index', '1.67'),
('m-12', 'design', 'Esférico'),
('m-13', 'design', 'Digital'),
('m-14', 'design', 'Multifocal')
ON CONFLICT (id) DO NOTHING;\n\n`;

    sql += `-- REAFIRMAR PERMISOS FINALES DE ACCESO\n`;
    sql += `GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;\n`;
    sql += `GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;\n\n`;

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migracion_supabase.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert("Script SQL generado correctamente.\\n\\nCopiá y pegá el contenido de 'migracion_supabase.sql' en el SQL Editor de tu panel de Supabase para crear las tablas e importar los datos iniciales.");
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
                          value={branch.afipPtoVenta || branchPVs[branch.id] || ""}
                          onChange={async e => {
                            const pto = e.target.value;
                            const updatedPVs = { ...branchPVs, [branch.id]: pto };
                            setBranchPVs(updatedPVs);
                            localStorage.setItem('optica_branch_pvs', JSON.stringify(updatedPVs));
                            await updateBranch({ ...branch, afipPtoVenta: pto });
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
                        const val = e.target.value;
                        setAfipCuit(val);
                        localStorage.setItem('optica_afip_cuit', val);
                        supabase.from('system_settings').upsert([{ key: 'optica_afip_cuit', value: val }]).catch(console.error);
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
                        const val = e.target.value;
                        setAfipEnv(val);
                        localStorage.setItem('optica_afip_env', val);
                        supabase.from('system_settings').upsert([{ key: 'optica_afip_env', value: val }]).catch(console.error);
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
                          onClick={async () => {
                            setAfipCertName("");
                            localStorage.removeItem('optica_afip_cert');
                            if (currentBranch) {
                              await updateBranch({ ...currentBranch, afipCertName: "", afipCertContent: "" });
                            }
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
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const name = file.name;
                            const reader = new FileReader();
                            reader.onload = async (event) => {
                              const content = event.target?.result as string || "";
                              setAfipCertName(name);
                              localStorage.setItem('optica_afip_cert', name);
                              if (currentBranch) {
                                await updateBranch({
                                  ...currentBranch,
                                  afipCertName: name,
                                  afipCertContent: content,
                                  afipCuit: afipCuit,
                                  afipEnv: afipEnv as any
                                });
                              }
                            };
                            reader.readAsText(file);
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
                          onClick={async () => {
                            setAfipKeyName("");
                            localStorage.removeItem('optica_afip_key');
                            if (currentBranch) {
                              await updateBranch({ ...currentBranch, afipKeyName: "", afipKeyContent: "" });
                            }
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
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const name = file.name;
                            const reader = new FileReader();
                            reader.onload = async (event) => {
                              const content = event.target?.result as string || "";
                              setAfipKeyName(name);
                              localStorage.setItem('optica_afip_key', name);
                              if (currentBranch) {
                                await updateBranch({
                                  ...currentBranch,
                                  afipKeyName: name,
                                  afipKeyContent: content,
                                  afipCuit: afipCuit,
                                  afipEnv: afipEnv as any
                                });
                              }
                            };
                            reader.readAsText(file);
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

        {activeTab === 'labs' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-blue-600" /> Laboratorios
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Administra la lista de laboratorios ópticos con los que trabaja la óptica.</p>
            </div>
            
            <div className="p-6 sm:p-8">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newLab.name.trim()) {
                    addLab(newLab);
                    setNewLab({ name: '', contact: '' });
                  }
                }}
                className="flex flex-col gap-4 mb-8 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Laboratorio</label>
                    <input 
                      type="text" 
                      value={newLab.name}
                      onChange={e => setNewLab({...newLab, name: e.target.value})}
                      placeholder="Ej: Laboratorio Óptico Central" 
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contacto / Observaciones (Opcional)</label>
                    <input 
                      type="text" 
                      value={newLab.contact}
                      onChange={e => setNewLab({...newLab, contact: e.target.value})}
                      placeholder="Ej: Tel: 4567-8901 / info@labcentral.com" 
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700 mt-2 gap-3">
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm">
                    <Plus className="w-4 h-4" /> Registrar Laboratorio
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labs.map(lab => (
                  <div key={lab.id} className="relative flex flex-col p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm group hover:border-blue-300 dark:hover:border-blue-900 transition-all">
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingLab({ id: lab.id, name: lab.name, contact: lab.contact || '' });
                          setIsLabEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`¿Seguro que deseas eliminar el laboratorio ${lab.name}?`)) {
                            deleteLab(lab.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg pr-12 truncate">{lab.name}</h4>
                    </div>

                    <div className="mt-1">
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contacto</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 italic">
                        {lab.contact || 'Sin información de contacto'}
                      </p>
                    </div>
                  </div>
                ))}

                {labs.length === 0 && (
                  <div className="col-span-full py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 dark:text-slate-400">
                    No hay laboratorios registrados. Registra uno usando el formulario de arriba.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Editar Laboratorio */}
            {isLabEditModalOpen && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                      <FlaskConical className="w-6 h-6 text-blue-600" /> Editar Laboratorio
                    </h3>
                    <button onClick={() => setIsLabEditModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingLab.name.trim()) {
                      updateLab(editingLab);
                      setIsLabEditModalOpen(false);
                    }
                  }}>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Laboratorio</label>
                        <input type="text" value={editingLab.name} onChange={e => setEditingLab({...editingLab, name: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" required />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contacto / Observaciones</label>
                        <input type="text" value={editingLab.contact} onChange={e => setEditingLab({...editingLab, contact: e.target.value})} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsLabEditModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
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
            </div>
          </section>
        )}

        {activeTab === 'crystals' && (
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-6 h-6 text-emerald-600" /> Administración del Módulo Cristales
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configurá el catálogo de cristales, tratamientos disponibles y las opciones de selección para las sucursales.</p>
              </div>
            </div>

            {/* Sub-pestañas */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <button 
                onClick={() => setCrystalSubTab('catalog')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${crystalSubTab === 'catalog' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
              >
                Catálogo de Precios
              </button>
              <button 
                onClick={() => setCrystalSubTab('masters')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${crystalSubTab === 'masters' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
              >
                Listas Maestras
              </button>
            </div>

            {/* SUB-TAB: CATALOG (CRYSTAL ITEMS) */}
            {crystalSubTab === 'catalog' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-white">Precios de Lentes / Cristales</h4>
                  <button
                    onClick={() => { setCrystalItemForm(EMPTY_CRYSTAL_ITEM); setEditingCrystalItem(null); setIsCrystalItemModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Nuevo Cristal
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="text-left px-4 py-3">Nombre / Tipo</th>
                        <th className="text-left px-4 py-3">Marca / Diseño</th>
                        <th className="text-left px-4 py-3">Material / Índice / Color</th>
                        <th className="text-left px-4 py-3">Rango de Receta (OD/OI)</th>
                        <th className="text-right px-4 py-3">Precio Par</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {crystalItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <div>{item.name}</div>
                            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{item.type}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-650 dark:text-slate-400">
                            <div>{item.brand}</div>
                            <div className="text-xs text-slate-400">{item.design}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-650 dark:text-slate-400">
                            <div>{item.material} (índice {item.index})</div>
                            <div className="text-xs text-slate-400">Color: {item.color}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            <div>ESF: {item.sphMin >= 0 ? `+${item.sphMin}` : item.sphMin} a {item.sphMax >= 0 ? `+${item.sphMax}` : item.sphMax}</div>
                            <div>CIL máx: {item.cylMax}</div>
                            {(item.type === 'multifocal' || item.type === 'ocupacional') && (
                              <div className="text-[10px] text-blue-600 font-bold">ADD: {item.addMin} a {item.addMax}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-emerald-600">
                            ${item.basePrice.toLocaleString('es-AR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => { setCrystalItemForm({ ...item }); setEditingCrystalItem(item); setIsCrystalItemModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              ><Edit2 className="w-4 h-4" /></button>
                              <button
                                onClick={() => { if (confirm('¿Eliminar este cristal del catálogo?')) removeCrystalItem(item.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              ><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {crystalItems.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No hay cristales registrados en el catálogo. Hacé click en "Nuevo Cristal" para comenzar.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB: MASTERS */}
            {crystalSubTab === 'masters' && (
              <div className="space-y-6">
                <h4 className="font-bold text-slate-900 dark:text-white">Gestión de Opciones para Selectores</h4>
                <p className="text-xs text-slate-500">Agregá o eliminá elementos de los menús desplegables del cotizador para mantenerlos alineados con tus proveedores.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* BRANDS */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Marcas</h5>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      {brands.map(b => (
                        <div key={b} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-medium">
                          <span>{b}</span>
                          <button onClick={() => setBrands(brands.filter(x => x !== b))} className="text-red-500 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nueva Marca..." 
                        value={masterInputValues.brand}
                        onChange={e => setMasterInputValues({...masterInputValues, brand: e.target.value})}
                        className="h-9 px-3 text-xs flex-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (masterInputValues.brand.trim() && !brands.includes(masterInputValues.brand.trim())) {
                            setBrands([...brands, masterInputValues.brand.trim()]);
                            setMasterInputValues({...masterInputValues, brand: ''});
                          }
                        }}
                        className="px-3 bg-emerald-600 text-white rounded text-xs font-bold"
                      >Agregar</button>
                    </div>
                  </div>

                  {/* MATERIALS */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Materiales</h5>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      {materials.map(b => (
                        <div key={b} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-medium">
                          <span>{b}</span>
                          <button onClick={() => setMaterials(materials.filter(x => x !== b))} className="text-red-500 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nuevo Material..." 
                        value={masterInputValues.material}
                        onChange={e => setMasterInputValues({...masterInputValues, material: e.target.value})}
                        className="h-9 px-3 text-xs flex-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (masterInputValues.material.trim() && !materials.includes(masterInputValues.material.trim())) {
                            setMaterials([...materials, masterInputValues.material.trim()]);
                            setMasterInputValues({...masterInputValues, material: ''});
                          }
                        }}
                        className="px-3 bg-emerald-600 text-white rounded text-xs font-bold"
                      >Agregar</button>
                    </div>
                  </div>

                  {/* INDICES */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Índices</h5>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      {indices.map(b => (
                        <div key={b} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-medium">
                          <span>{b}</span>
                          <button onClick={() => setIndices(indices.filter(x => x !== b))} className="text-red-500 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nuevo Índice..." 
                        value={masterInputValues.index}
                        onChange={e => setMasterInputValues({...masterInputValues, index: e.target.value})}
                        className="h-9 px-3 text-xs flex-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (masterInputValues.index.trim() && !indices.includes(masterInputValues.index.trim())) {
                            setIndices([...indices, masterInputValues.index.trim()]);
                            setMasterInputValues({...masterInputValues, index: ''});
                          }
                        }}
                        className="px-3 bg-emerald-600 text-white rounded text-xs font-bold"
                      >Agregar</button>
                    </div>
                  </div>

                  {/* DESIGNS */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Diseños</h5>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      {designs.map(b => (
                        <div key={b} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-medium">
                          <span>{b}</span>
                          <button onClick={() => setDesigns(designs.filter(x => x !== b))} className="text-red-500 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nuevo Diseño..." 
                        value={masterInputValues.design}
                        onChange={e => setMasterInputValues({...masterInputValues, design: e.target.value})}
                        className="h-9 px-3 text-xs flex-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (masterInputValues.design.trim() && !designs.includes(masterInputValues.design.trim())) {
                            setDesigns([...designs, masterInputValues.design.trim()]);
                            setMasterInputValues({...masterInputValues, design: ''});
                          }
                        }}
                        className="px-3 bg-emerald-600 text-white rounded text-xs font-bold"
                      >Agregar</button>
                    </div>
                  </div>

                  {/* COLORS */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Colores</h5>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      {colors.map(b => (
                        <div key={b} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-medium">
                          <span>{b}</span>
                          <button onClick={() => setColors(colors.filter(x => x !== b))} className="text-red-500 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nuevo Color..." 
                        value={masterInputValues.color}
                        onChange={e => setMasterInputValues({...masterInputValues, color: e.target.value})}
                        className="h-9 px-3 text-xs flex-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (masterInputValues.color.trim() && !colors.includes(masterInputValues.color.trim())) {
                            setColors([...colors, masterInputValues.color.trim()]);
                            setMasterInputValues({...masterInputValues, color: ''});
                          }
                        }}
                        className="px-3 bg-emerald-600 text-white rounded text-xs font-bold"
                      >Agregar</button>
                    </div>
                  </div>

                  {/* TREATMENTS */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Tratamientos</h5>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      {treatments.map(t => (
                        <div key={t} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-medium">
                          <span>{t}</span>
                          <button onClick={() => removeTreatment(t)} className="text-red-500 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nuevo Tratamiento..." 
                        value={masterInputValues.treatment}
                        onChange={e => setMasterInputValues({...masterInputValues, treatment: e.target.value})}
                        className="h-9 px-3 text-xs flex-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (masterInputValues.treatment.trim() && !treatments.includes(masterInputValues.treatment.trim())) {
                            addTreatment(masterInputValues.treatment.trim());
                            setMasterInputValues({...masterInputValues, treatment: ''});
                          }
                        }}
                        className="px-3 bg-emerald-600 text-white rounded text-xs font-bold"
                      >Agregar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: NUEVO / EDITAR CRISTAL */}
            {isCrystalItemModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-emerald-600" /> {editingCrystalItem ? 'Editar Cristal' : 'Cargar Nuevo Cristal'}
                    </h3>
                    <button onClick={() => setIsCrystalItemModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-650 block mb-1">Nombre Comercial del Cristal</label>
                        <input 
                          type="text" 
                          value={crystalItemForm.name} 
                          onChange={e => setCrystalItemForm({...crystalItemForm, name: e.target.value})} 
                          placeholder="Ej: Essilor Crizal Sapphire Monofocal 1.67" 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-650 block mb-1">Tipo de Lente</label>
                        <select 
                          value={crystalItemForm.type} 
                          onChange={e => setCrystalItemForm({...crystalItemForm, type: e.target.value})} 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        >
                          <option value="monofocal">Monofocal</option>
                          <option value="bifocal">Bifocal</option>
                          <option value="multifocal">Multifocal</option>
                          <option value="ocupacional">Ocupacional</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-650 block mb-1">Marca</label>
                        <select 
                          value={crystalItemForm.brand} 
                          onChange={e => setCrystalItemForm({...crystalItemForm, brand: e.target.value})} 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        >
                          {brands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-650 block mb-1">Material</label>
                        <select 
                          value={crystalItemForm.material} 
                          onChange={e => setCrystalItemForm({...crystalItemForm, material: e.target.value})} 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        >
                          {materials.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-650 block mb-1">Índice de Refracción</label>
                        <select 
                          value={crystalItemForm.index} 
                          onChange={e => setCrystalItemForm({...crystalItemForm, index: e.target.value})} 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        >
                          {indices.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-650 block mb-1">Diseño</label>
                        <select 
                          value={crystalItemForm.design} 
                          onChange={e => setCrystalItemForm({...crystalItemForm, design: e.target.value})} 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        >
                          {designs.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-650 block mb-1">Color Base</label>
                        <select 
                          value={crystalItemForm.color} 
                          onChange={e => setCrystalItemForm({...crystalItemForm, color: e.target.value})} 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        >
                          {colors.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-650 block mb-1">Precio Base del Par (ARS)</label>
                        <input 
                          type="number" 
                          value={crystalItemForm.basePrice || ''} 
                          onChange={e => setCrystalItemForm({...crystalItemForm, basePrice: parseFloat(e.target.value) || 0})} 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none font-mono font-bold" 
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300">Límites y Rangos Técnicos de la Receta</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ESF Mínimo (ej: -12.00)</label>
                          <input type="number" step="0.25" value={crystalItemForm.sphMin} onChange={e => setCrystalItemForm({...crystalItemForm, sphMin: parseFloat(e.target.value)})} className="h-9 px-2 w-full rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-center" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ESF Máximo (ej: 6.00)</label>
                          <input type="number" step="0.25" value={crystalItemForm.sphMax} onChange={e => setCrystalItemForm({...crystalItemForm, sphMax: parseFloat(e.target.value)})} className="h-9 px-2 w-full rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-center" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">CIL Máximo (Abs) (ej: 4.00)</label>
                          <input type="number" step="0.25" min="0" value={crystalItemForm.cylMax} onChange={e => setCrystalItemForm({...crystalItemForm, cylMax: parseFloat(e.target.value)})} className="h-9 px-2 w-full rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-center" />
                        </div>
                      </div>
                      {(crystalItemForm.type === 'multifocal' || crystalItemForm.type === 'ocupacional') && (
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ADD Mínima (ej: 1.00)</label>
                            <input type="number" step="0.25" min="0" value={crystalItemForm.addMin || ''} onChange={e => setCrystalItemForm({...crystalItemForm, addMin: parseFloat(e.target.value) || undefined})} className="h-9 px-2 w-full rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-center" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ADD Máxima (ej: 3.50)</label>
                            <input type="number" step="0.25" min="0" value={crystalItemForm.addMax || ''} onChange={e => setCrystalItemForm({...crystalItemForm, addMax: parseFloat(e.target.value) || undefined})} className="h-9 px-2 w-full rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-center" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tratamientos Compatibles */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tratamientos Compatibles / Incluidos</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {treatments.map(t => {
                          const formTreatments = crystalItemForm.treatments || [];
                          const isChecked = formTreatments.includes(t);
                          return (
                            <label key={t} className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-slate-400 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setCrystalItemForm({
                                      ...crystalItemForm,
                                      treatments: formTreatments.filter((x: string) => x !== t)
                                    });
                                  } else {
                                    setCrystalItemForm({
                                      ...crystalItemForm,
                                      treatments: [...formTreatments, t]
                                    });
                                  }
                                }}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span>{t}</span>
                            </label>
                          );
                        })}
                        {treatments.length === 0 && (
                          <span className="text-xs text-slate-400 col-span-3">No hay tratamientos creados en la lista maestra.</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end bg-slate-50 dark:bg-slate-900/50">
                    <button onClick={() => setIsCrystalItemModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button
                      onClick={() => {
                        if (!crystalItemForm.name.trim() || crystalItemForm.basePrice <= 0) return alert('Por favor, completá el nombre y el precio.');
                        if (editingCrystalItem) {
                          updateCrystalItem({ ...crystalItemForm, id: editingCrystalItem.id });
                        } else {
                          addCrystalItem(crystalItemForm);
                        }
                        setIsCrystalItemModalOpen(false);
                      }}
                      className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      {editingCrystalItem ? 'Guardar Cambios' : 'Registrar Cristal'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: NUEVO / EDITAR TRATAMIENTO */}
            {isTreatmentModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-emerald-600" /> {editingTreatment ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
                    </h3>
                    <button onClick={() => setIsTreatmentModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-650 block mb-1">Nombre del Tratamiento</label>
                        <input 
                          type="text" 
                          value={treatmentForm.name} 
                          onChange={e => setTreatmentForm({...treatmentForm, name: e.target.value})} 
                          placeholder="Ej: Antirreflejo Sapphire, Blue Cut..." 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-650 block mb-1">Precio Adicional del Par (ARS)</label>
                        <input 
                          type="number" 
                          value={treatmentForm.price || ''} 
                          onChange={e => setTreatmentForm({...treatmentForm, price: parseFloat(e.target.value) || 0})} 
                          className="h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none font-mono font-bold" 
                        />
                      </div>
                      
                      {/* Checkboxes de Materiales Incompatibles */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Materiales Incompatibles</label>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          {materials.map(mat => {
                            const isChecked = treatmentForm.incompatibleMaterials.includes(mat);
                            return (
                              <label key={mat} className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const nextList = isChecked 
                                      ? treatmentForm.incompatibleMaterials.filter((x: string) => x !== mat)
                                      : [...treatmentForm.incompatibleMaterials, mat];
                                    setTreatmentForm({...treatmentForm, incompatibleMaterials: nextList});
                                  }}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                />
                                <span>{mat}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Checkboxes de Tratamientos Incompatibles */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Tratamientos Incompatibles (Cruzados)</label>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          {treatments.filter(t => t.id !== treatmentForm.id).map(t => {
                            const isChecked = treatmentForm.incompatibleTreatments.includes(t.id);
                            return (
                              <label key={t.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const nextList = isChecked 
                                      ? treatmentForm.incompatibleTreatments.filter((x: string) => x !== t.id)
                                      : [...treatmentForm.incompatibleTreatments, t.id];
                                    setTreatmentForm({...treatmentForm, incompatibleTreatments: nextList});
                                  }}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                />
                                <span>{t.name}</span>
                              </label>
                            );
                          })}
                          {treatments.filter(t => t.id !== treatmentForm.id).length === 0 && (
                            <span className="text-xs text-slate-400 col-span-2">No hay otros tratamientos creados para excluir.</span>
                          )}
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-2">
                        <input 
                          type="checkbox"
                          checked={treatmentForm.active}
                          onChange={e => setTreatmentForm({...treatmentForm, active: e.target.checked})}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span>Tratamiento Activo (disponible para venta)</span>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end bg-slate-50 dark:bg-slate-900/50">
                    <button onClick={() => setIsTreatmentModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button
                      onClick={() => {
                        if (!treatmentForm.name.trim() || treatmentForm.price < 0) return alert('Por favor, completá el nombre y el precio.');
                        if (editingTreatment) {
                          updateTreatment({ ...treatmentForm, id: editingTreatment.id });
                        } else {
                          addTreatment(treatmentForm);
                        }
                        setIsTreatmentModalOpen(false);
                      }}
                      className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      {editingTreatment ? 'Guardar Cambios' : 'Registrar Tratamiento'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab !== 'general' && activeTab !== 'appearance' && activeTab !== 'branches' && activeTab !== 'users' && activeTab !== 'permissions' && activeTab !== 'notifications' && activeTab !== 'billing' && activeTab !== 'audit' && activeTab !== 'insurances' && activeTab !== 'banks' && activeTab !== 'inventory' && activeTab !== 'labs' && activeTab !== 'crystals' && activeTab !== 'database' && (
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
              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                const target = e.target as any;
                const emailVal = target.elements.email.value;
                const passVal = target.elements.password.value;
                const nameVal = target.elements.name.value;
                const roleVal = target.elements.role.value;
                const branchVal = target.elements.branch.value;

                const res = await addUser({
                  id: Date.now().toString(),
                  name: nameVal,
                  email: emailVal,
                  username: emailVal.split('@')[0],
                  password: passVal,
                  role: roleVal,
                  defaultBranchId: branchVal,
                  status: 'Activo'
                });

                if (res.success) {
                  alert("¡Usuario creado con éxito en Supabase Auth!");
                  setIsUserModalOpen(false); 
                } else {
                  alert("Error al crear usuario en Supabase: " + (res.error || "Intenta nuevamente."));
                }
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contraseña de Acceso</label>
                    <input name="password" type="password" minLength={6} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Mínimo 6 caracteres" required />
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
                        <option value="1">Casa Central</option>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Gestión de Bases de Datos (Supabase)
              </h3>
              <button 
                onClick={() => {
                  setEditingConn(null);
                  setConnName('');
                  setConnUrl('');
                  setConnAnonKey('');
                  setIsConnModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Nueva Conexión
              </button>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-2xl">
              Aquí puedes registrar y gestionar las conexiones a diferentes proyectos de Supabase en la nube. Selecciona la conexión activa para alternar de forma inmediata la base de datos de la aplicación.
            </p>

            {/* Listado de Conexiones */}
            <div className="grid grid-cols-1 gap-4 mb-12">
              {connections.map((conn) => {
                const isActive = conn.id === activeConnectionId;
                return (
                  <div key={conn.id} className={`p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isActive ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg border shadow-sm ${isActive ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 dark:text-white">{conn.name}</h4>
                          {isActive && <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Activo</span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{conn.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isActive && (
                        <button 
                          onClick={() => {
                            if (confirm(`¿Estás seguro de alternar a la base de datos '${conn.name}'? Se cerrará tu sesión actual y la página se recargará.`)) {
                              switchConnection(conn.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Activar
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setEditingConn(conn);
                          setConnName(conn.name);
                          setConnUrl(conn.url);
                          setConnAnonKey(conn.anonKey);
                          setIsConnModalOpen(true);
                        }}
                        className="p-2 hover:bg-white dark:hover:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                        title="Editar Conexión"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {conn.id !== 'default' && !isActive && (
                        <button 
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar la conexión '${conn.name}'?`)) {
                              const updated = connections.filter(c => c.id !== conn.id);
                              setConnections(updated);
                              saveConnections(updated);
                            }
                          }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 transition-colors"
                          title="Eliminar Conexión"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Backups Locales */}
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Database className="w-5 h-5 text-indigo-600" /> Copia de Seguridad Local
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" /> Exportar Backup
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-8">
                  Descarga una copia completa de toda tu base de datos local en formato JSON.
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
                  Restaura tu información a partir de un archivo JSON de respaldo.
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

            {/* SQL Seed Card */}
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Cloud className="w-5 h-5 text-emerald-600" /> Script de Inicialización de Base de Datos
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
              Genera el script SQL para inicializar las tablas (`clients`, `inventory`, `orders`, `profiles`) e importar tus datos locales en cualquier base de datos nueva de Supabase.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex flex-col gap-1.5 max-w-xl">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Project URL (para validar en script)</label>
                <input 
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none text-xs font-mono" 
                  placeholder="https://xyzcompany.supabase.co" 
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 max-w-xl">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">API Key / Anon Key (para validar en script)</label>
                <input 
                  type="password"
                  className="h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none text-xs font-mono" 
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={handleGenerateSupabaseSQL}
              className="px-6 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
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

            {/* Modal de Conexión Supabase */}
            {isConnModalOpen && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                      <Cloud className="w-6 h-6 text-blue-600" /> 
                      {editingConn ? 'Editar Conexión Supabase' : 'Nueva Conexión Supabase'}
                    </h3>
                    <button 
                      onClick={() => setIsConnModalOpen(false)} 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!connName.trim() || !connUrl.trim() || !connAnonKey.trim()) {
                      alert("Todos los campos son obligatorios.");
                      return;
                    }
                    if (editingConn) {
                      const updated = connections.map(c => c.id === editingConn.id ? { ...c, name: connName, url: connUrl, anonKey: connAnonKey } : c);
                      setConnections(updated);
                      saveConnections(updated);
                      if (editingConn.id === activeConnectionId) {
                        switchConnection(editingConn.id);
                      } else {
                        setIsConnModalOpen(false);
                      }
                    } else {
                      const newConn = {
                        id: `conn-${Date.now()}`,
                        name: connName,
                        url: connUrl,
                        anonKey: connAnonKey
                      };
                      const updated = [...connections, newConn];
                      setConnections(updated);
                      saveConnections(updated);
                      if (window.confirm(`¡Conexión '${connName}' agregada! ¿Deseas activarla ahora mismo? (Esto recargará la página)`)) {
                        switchConnection(newConn.id);
                      } else {
                        setIsConnModalOpen(false);
                      }
                    }
                  }}>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre Descriptivo</label>
                        <input 
                          type="text" 
                          value={connName}
                          onChange={e => setConnName(e.target.value)}
                          className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                          placeholder="Ej: Óptica Paracao - Sucursal 2" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Project URL</label>
                        <input 
                          type="url" 
                          value={connUrl}
                          onChange={e => setConnUrl(e.target.value)}
                          className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-mono text-xs" 
                          placeholder="https://xyzcompany.supabase.co" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Anon Key / API Public Key</label>
                        <textarea 
                          value={connAnonKey}
                          onChange={e => setConnAnonKey(e.target.value)}
                          className="h-24 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-mono text-xs resize-none" 
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                          required 
                        />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsConnModalOpen(false)} 
                        className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm"
                      >
                        {editingConn ? 'Guardar Cambios' : 'Agregar Conexión'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
