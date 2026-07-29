import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Insurance, CrystalPricingRule, CrystalItem } from '../types';
import { supabase } from '../lib/supabase';

export interface BankEntity {
  id: string;
  name: string;
  cbu: string;
  alias: string;
  accountNumber: string;
}

export interface PDFConfig {
  pdfColorPalette: string;
  pdfLogoPosition: string;
  pdfLogoSizeWidth: number;
  pdfLogoX: number;
  pdfLogoY: number;
  pdfLynxPosition: string;
  pdfLynxSize: number;
  pdfLynxOpacity: number;
  pdfHeaderHeight: number;
  pdfCompanyNameSize: number;
  pdfCompanyNameY: number;
  pdfRightColTitleSize: number;
  pdfRightColDetailsSize: number;
  pdfRightColY: number;
  pdfInvoiceTypeX: number;
  pdfInvoiceTypeY: number;
  pdfLeftColAlign: string;
  pdfLeftColX: number;
  pdfRightColX: number;
  pdfTableStartY: number;
}

interface SettingsContextType {
  insurances: Insurance[];
  addInsurance: (insurance: Omit<Insurance, 'id'>) => void;
  updateInsurance: (insurance: Insurance) => void;
  removeInsurance: (id: string) => void;
  banks: BankEntity[];
  addBank: (bank: Omit<BankEntity, 'id'>) => void;
  updateBank: (bank: BankEntity) => void;
  removeBank: (id: string) => void;
  inventoryCategories: string[];
  addInventoryCategory: (name: string) => void;
  updateInventoryCategory: (oldName: string, newName: string) => void;
  removeInventoryCategory: (name: string) => void;
  lensColors: string[];
  addLensColor: (name: string) => void;
  updateLensColor: (oldName: string, newName: string) => void;
  removeLensColor: (name: string) => void;
  contactLensColors: string[];
  addContactLensColor: (name: string) => void;
  updateContactLensColor: (oldName: string, newName: string) => void;
  removeContactLensColor: (name: string) => void;
  lensTypes: string[];
  addLensType: (name: string) => void;
  updateLensType: (oldName: string, newName: string) => void;
  removeLensType: (name: string) => void;
  opticaLogo: string;
  setOpticaLogo: (logo: string) => void;
  opticaName: string;
  setOpticaName: (name: string) => void;
  opticaPhone: string;
  setOpticaPhone: (phone: string) => void;
  opticaAddress: string;
  setOpticaAddress: (address: string) => void;
  appTheme: string;
  setAppTheme: (theme: string) => void;
  pdfConfig: PDFConfig;
  setPdfConfig: (config: PDFConfig) => void;
  // Crystal pricing rules
  crystalRules: CrystalPricingRule[];
  addCrystalRule: (rule: Omit<CrystalPricingRule, 'id'>) => void;
  updateCrystalRule: (rule: CrystalPricingRule) => void;
  removeCrystalRule: (id: string) => void;
  // Refactored Crystals
  crystalItems: CrystalItem[];
  addCrystalItem: (item: Omit<CrystalItem, 'id'>) => void;
  updateCrystalItem: (item: CrystalItem) => void;
  removeCrystalItem: (id: string) => void;
  treatments: string[];
  addTreatment: (name: string) => void;
  updateTreatment: (oldName: string, newName: string) => void;
  removeTreatment: (name: string) => void;
  brands: string[];
  setBrands: (brands: string[]) => void;
  materials: string[];
  setMaterials: (materials: string[]) => void;
  indices: string[];
  setIndices: (indices: string[]) => void;
  designs: string[];
  setDesigns: (designs: string[]) => void;
  colors: string[];
  setColors: (colors: string[]) => void;
}

const INITIAL_INSURANCES: Insurance[] = [
  { id: '1', name: "Particular", active: true, coverages: [] },
  { id: '2', name: "OSDE", active: true, coverages: [{ categoryId: "monofocal", amount: 5000 }] },
  { id: '3', name: "Swiss Medical", active: true, coverages: [] },
  { id: '4', name: "PAMI", active: true, coverages: [] },
  { id: '5', name: "Jerárquicos", active: true, coverages: [] },
  { id: '6', name: "IAPOS", active: true, coverages: [] }
];
const INITIAL_BANKS: BankEntity[] = [
  { id: '1', name: "Banco Galicia", cbu: "", alias: "", accountNumber: "" },
  { id: '2', name: "Banco Santander", cbu: "", alias: "", accountNumber: "" },
  { id: '3', name: "Mercado Pago", cbu: "", alias: "", accountNumber: "" },
];

const INITIAL_PDF_CONFIG: PDFConfig = {
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

const INITIAL_INVENTORY_CATEGORIES = ["Armazones", "Anteojos de Sol", "Anteojos Terminados", "Cristales", "Lentes de Contacto", "Líquidos", "Accesorios"];
const INITIAL_LENS_COLORS = ["Blanco", "Fotocromático", "Antireflex", "Gris", "Marrón", "Verde"];
const INITIAL_CONTACT_LENS_COLORS = ["Transparente", "Celeste", "Miel", "Gris", "Verde", "Avellana"];
const INITIAL_LENS_TYPES = ["Monofocal", "Bifocal", "Multifocal", "Ocupacional"];

const INITIAL_CRYSTAL_RULES: CrystalPricingRule[] = [
  {
    id: 'cr-1',
    name: 'Orgánico Blanco — Stock',
    material: 'Orgánico',
    tratamiento: 'Blanco',
    precio: 26000,
    conditions: [{ esfMin: -6, esfMax: 6, cilMax: 2, esfPlusCilMax: 6 }],
  },
  {
    id: 'cr-2',
    name: 'Orgánico c/AR — Stock',
    material: 'Orgánico',
    tratamiento: 'AR',
    precio: 41000,
    conditions: [{ esfMin: -6, esfMax: 6, cilMax: 2, esfPlusCilMax: 6 }],
  },
  {
    id: 'cr-3',
    name: 'Orgánico AR + Blue Cut — Stock',
    material: 'Orgánico',
    tratamiento: 'AR + Blue Cut',
    precio: 49900,
    conditions: [{ esfMin: -4, esfMax: 4, cilMax: 2, esfPlusCilMax: 6 }],
  },
  {
    id: 'cr-4',
    name: 'Orgánico c/AR — Extendido (ESF altos)',
    material: 'Orgánico',
    tratamiento: 'AR',
    precio: 62000,
    conditions: [
      { esfMin: -10, esfMax: 0, cilMax: 4 },
      { esfMin: -8, esfMax: 0, cilMax: 4 },
    ],
  },
  {
    id: 'cr-5',
    name: 'Orgánico AR + Blue Cut — Extendido (CIL altos)',
    material: 'Orgánico',
    tratamiento: 'AR + Blue Cut',
    precio: 68800,
    conditions: [
      { esfMin: -4, esfMax: 4, cilMax: 4 },
      { esfMin: -6, esfMax: 6, cilMax: 2 },
    ],
  },
  {
    id: 'cr-6',
    name: 'Orgánico 1.67 AR + Blue Cut — Más extendido',
    material: 'Orgánico 1.67',
    tratamiento: 'AR + Blue Cut',
    precio: 155000,
    conditions: [
      { esfMin: -15, esfMax: 6, cilMax: 0 },
      { esfMin: -12, esfMax: 0, cilMax: 2 },
      { esfMin: -10, esfMax: 0, cilMax: 3 },
      { esfMin: -8,  esfMax: 0, cilMax: 4 },
      { esfMin: 0,   esfMax: 6, cilMax: 2 },
    ],
  },
];

const INITIAL_CRYSTAL_ITEMS: CrystalItem[] = [
  {
    id: 'cr-1',
    name: 'Monofocal Essilor Orgánico 1.49 Esférico Blanco',
    type: 'monofocal',
    material: 'Orgánico',
    index: '1.49',
    brand: 'Essilor',
    design: 'Esférico',
    color: 'Blanco',
    basePrice: 15000,
    active: true,
    sphMin: -6.00,
    sphMax: 6.00,
    cylMax: 2.00
  },
  {
    id: 'cr-2',
    name: 'Monofocal Zeiss Policarbonato 1.59 Esférico Blanco',
    type: 'monofocal',
    material: 'Policarbonato',
    index: '1.59',
    brand: 'Zeiss',
    design: 'Esférico',
    color: 'Blanco',
    basePrice: 22000,
    active: true,
    sphMin: -8.00,
    sphMax: 4.00,
    cylMax: 4.00
  },
  {
    id: 'cr-3',
    name: 'Multifocal Novar Orgánico 1.67 Digital Blanco',
    type: 'multifocal',
    material: 'Orgánico',
    index: '1.67',
    brand: 'Novar',
    design: 'Digital',
    color: 'Blanco',
    basePrice: 45000,
    active: true,
    sphMin: -10.00,
    sphMax: 6.00,
    cylMax: 4.00,
    addMin: 1.00,
    addMax: 3.00
  },
  {
    id: 'cr-4',
    name: 'Ocupacional Kodak Orgánico 1.56 Esférico Blanco',
    type: 'ocupacional',
    material: 'Orgánico',
    index: '1.56',
    brand: 'Kodak',
    design: 'Esférico',
    color: 'Blanco',
    basePrice: 32000,
    active: true,
    sphMin: -4.00,
    sphMax: 4.00,
    cylMax: 2.00,
    addMin: 1.00,
    addMax: 2.50
  }
];

const INITIAL_TREATMENTS: string[] = [
  'Antirreflejo',
  'Blue Cut',
  'Fotocromático',
  'Endurecido / Anti-rayas',
  'Polarizado',
  'Espejado'
];

const INITIAL_BRANDS_MASTERS = ['Essilor', 'Zeiss', 'Kodak', 'Novar', 'Hoya', 'Genérico'];
const INITIAL_MATERIALS_MASTERS = ['Orgánico', 'Policarbonato', 'Mineral', 'Trivex'];
const INITIAL_INDICES_MASTERS = ['1.49', '1.56', '1.59', '1.61', '1.67', '1.74'];
const INITIAL_DESIGNS_MASTERS = ['Esférico', 'Asférico', 'Digital', 'Progresivo'];
const INITIAL_COLORS_MASTERS = ['Blanco', 'Gris', 'Marrón', 'Verde', 'Azul', 'Rosa'];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [insurances, setInsurances] = useState<Insurance[]>(() => {
    const saved = localStorage.getItem('optica_insurances');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate from strings to objects if necessary
      if (parsed.length > 0 && typeof parsed[0] === 'string') {
        return parsed.map((name: string, idx: number) => ({ id: String(idx+1), name, active: true, coverages: [] }));
      }
      return parsed;
    }
    return INITIAL_INSURANCES;
  });

  const [banks, setBanks] = useState<BankEntity[]>(() => {
    const saved = localStorage.getItem('optica_banks');
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  const [inventoryCategories, setInventoryCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_inventory_categories');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_CATEGORIES;
  });

  const [lensColors, setLensColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_lens_colors');
    return saved ? JSON.parse(saved) : INITIAL_LENS_COLORS;
  });

  const [contactLensColors, setContactLensColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_contact_lens_colors');
    return saved ? JSON.parse(saved) : INITIAL_CONTACT_LENS_COLORS;
  });

  const [lensTypes, setLensTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_lens_types');
    return saved ? JSON.parse(saved) : INITIAL_LENS_TYPES;
  });

  const [opticaLogo, setOpticaLogo] = useState<string>(() => {
    return localStorage.getItem('optica_logo') || '';
  });

  const [opticaName, setOpticaName] = useState<string>(() => {
    return localStorage.getItem('optica_name') || 'Óptica Paracáo';
  });

  const [opticaPhone, setOpticaPhone] = useState<string>(() => {
    return localStorage.getItem('optica_phone') || '';
  });

  const [opticaAddress, setOpticaAddress] = useState(() => localStorage.getItem('optica_address') || "Av. Principal 123");
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem('optica_theme') || "default");
  const [pdfConfig, setPdfConfigState] = useState<PDFConfig>(() => {
    const saved = localStorage.getItem('optica_pdf_config');
    return saved ? JSON.parse(saved) : INITIAL_PDF_CONFIG;
  });

  const setPdfConfig = (newConfig: PDFConfig) => {
    setPdfConfigState(newConfig);
    localStorage.setItem('optica_pdf_config', JSON.stringify(newConfig));
  };

  const [crystalRules, setCrystalRules] = useState<CrystalPricingRule[]>(() => {
    const saved = localStorage.getItem('optica_crystal_rules');
    return saved ? JSON.parse(saved) : INITIAL_CRYSTAL_RULES;
  });

  const [crystalItems, setCrystalItems] = useState<CrystalItem[]>(() => {
    const saved = localStorage.getItem('optica_crystal_items');
    return saved ? JSON.parse(saved) : INITIAL_CRYSTAL_ITEMS;
  });

  const [treatments, setTreatments] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_treatments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            if (typeof item === 'object' && item !== null) {
              return item.name || '';
            }
            return String(item);
          }).filter(Boolean);
        }
      } catch (e) {
        // Ignorar error y usar iniciales
      }
    }
    return INITIAL_TREATMENTS;
  });

  const [brands, setBrandsState] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_brands_masters');
    return saved ? JSON.parse(saved) : INITIAL_BRANDS_MASTERS;
  });

  const [materials, setMaterialsState] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_materials_masters');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS_MASTERS;
  });

  const [indices, setIndicesState] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_indices_masters');
    return saved ? JSON.parse(saved) : INITIAL_INDICES_MASTERS;
  });

  const [designs, setDesignsState] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_designs_masters');
    return saved ? JSON.parse(saved) : INITIAL_DESIGNS_MASTERS;
  });

  const [colors, setColorsState] = useState<string[]>(() => {
    const saved = localStorage.getItem('optica_colors_masters');
    return saved ? JSON.parse(saved) : INITIAL_COLORS_MASTERS;
  });

  // Load everything from Supabase on mount
  useEffect(() => {
    async function loadAllFromSupabase() {
      try {
        // 1. Banks
        const { data: bankData } = await supabase.from('banks').select('*');
        if (bankData && bankData.length > 0) {
          setBanks(bankData.map((b: any) => ({
            id: String(b.id),
            name: b.name,
            cbu: b.cbu || '',
            alias: b.alias || '',
            accountNumber: b.accountNumber || b.account_number || ''
          })));
        }

        // 2. Insurances
        const { data: insData } = await supabase.from('insurances').select('*');
        if (insData && insData.length > 0) {
          setInsurances(insData.map((i: any) => ({
            id: String(i.id),
            name: i.name,
            active: i.active !== undefined ? i.active : true,
            coverages: i.coverages || []
          })));
        }

        // 3. Inventory Categories
        const { data: catData } = await supabase.from('inventory_categories').select('*');
        if (catData && catData.length > 0) {
          setInventoryCategories(catData.map((c: any) => c.name || c.id));
        }

        // 4. Crystal Rules
        const { data: rulesData } = await supabase.from('crystal_rules').select('*');
        if (rulesData && rulesData.length > 0) {
          setCrystalRules(rulesData.map((r: any) => ({
            id: String(r.id),
            name: r.name,
            material: r.material,
            tratamiento: r.tratamiento,
            precio: Number(r.precio || r.price || 0),
            conditions: r.conditions || []
          })));
        }

        // 5. Crystal Items
        const { data: itemsData } = await supabase.from('crystal_items').select('*');
        if (itemsData && itemsData.length > 0) {
          setCrystalItems(itemsData.map((i: any) => ({
            id: String(i.id),
            name: i.name,
            type: i.type,
            material: i.material,
            index: i.index,
            brand: i.brand,
            design: i.design,
            color: i.color,
            basePrice: Number(i.basePrice || i.base_price || 0),
            active: i.active !== undefined ? i.active : true,
            sphMin: Number(i.sphMin || i.sph_min || 0),
            sphMax: Number(i.sphMax || i.sph_max || 0),
            cylMax: Number(i.cylMax || i.cyl_max || 0),
            addMin: i.addMin !== undefined ? Number(i.addMin) : undefined,
            addMax: i.addMax !== undefined ? Number(i.addMax) : undefined,
            treatments: i.treatments || []
          })));
        }

        // 6. System settings key-value store
        const { data: sysData } = await supabase.from('system_settings').select('*');
        if (sysData && sysData.length > 0) {
          sysData.forEach((row: any) => {
            const val = row.value;
            switch (row.key) {
              case 'optica_logo': setOpticaLogo(val || ''); break;
              case 'optica_name': setOpticaName(val || 'Óptica Paracáo'); break;
              case 'optica_phone': setOpticaPhone(val || ''); break;
              case 'optica_address': setOpticaAddress(val || 'Av. Principal 123'); break;
              case 'optica_theme': {
                setAppTheme(val || 'default');
                document.documentElement.setAttribute('data-theme', val || 'default');
                break;
              }
              case 'optica_pdf_config': setPdfConfigState(val || INITIAL_PDF_CONFIG); break;
              case 'optica_lens_colors': setLensColors(val || INITIAL_LENS_COLORS); break;
              case 'optica_contact_lens_colors': setContactLensColors(val || INITIAL_CONTACT_LENS_COLORS); break;
              case 'optica_lens_types': setLensTypes(val || INITIAL_LENS_TYPES); break;
              case 'optica_treatments': setTreatments(val || INITIAL_TREATMENTS); break;
              case 'optica_brands_masters': setBrandsState(val || INITIAL_BRANDS_MASTERS); break;
              case 'optica_materials_masters': setMaterialsState(val || INITIAL_MATERIALS_MASTERS); break;
              case 'optica_indices_masters': setIndicesState(val || INITIAL_INDICES_MASTERS); break;
              case 'optica_designs_masters': setDesignsState(val || INITIAL_DESIGNS_MASTERS); break;
              case 'optica_colors_masters': setColorsState(val || INITIAL_COLORS_MASTERS); break;
              case 'optica_afip_cuit': if (val) localStorage.setItem('optica_afip_cuit', val); break;
              case 'optica_afip_env': if (val) localStorage.setItem('optica_afip_env', val); break;
              case 'optica_afip_cert': if (val) localStorage.setItem('optica_afip_cert', val); break;
              case 'optica_afip_key': if (val) localStorage.setItem('optica_afip_key', val); break;
              case 'optica_inicio_actividad': if (val) localStorage.setItem('optica_inicio_actividad', val); break;
              case 'optica_iibb': if (val) localStorage.setItem('optica_iibb', val); break;
              case 'optica_puntos_venta': if (val) localStorage.setItem('optica_puntos_venta', typeof val === 'string' ? val : JSON.stringify(val)); break;
              case 'optica_default_pv': if (val) localStorage.setItem('optica_default_pv', val); break;
            }
          });
        }
      } catch (err) {
        console.warn("Could not fully load settings from Supabase:", err);
      }
    }
    loadAllFromSupabase();
  }, []);

  // Helper to sync to system_settings table
  const syncSetting = async (key: string, value: any) => {
    try {
      await supabase.from('system_settings').upsert([{ key, value, updated_at: new Date().toISOString() }]);
    } catch (e) {
      console.error(`Error syncing system setting ${key}:`, e);
    }
  };

  // Sync state changes to local storage & Supabase
  useEffect(() => {
    localStorage.setItem('optica_banks', JSON.stringify(banks));
    async function syncBanks() {
      if (banks.length > 0) {
        try {
          await supabase.from('banks').upsert(banks.map(b => ({
            id: b.id,
            name: b.name,
            cbu: b.cbu,
            alias: b.alias,
            accountNumber: b.accountNumber
          })));
        } catch (e) {
          console.error("Error syncing banks to Supabase:", e);
        }
      }
    }
    syncBanks();
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('optica_insurances', JSON.stringify(insurances));
  }, [insurances]);

  useEffect(() => {
    localStorage.setItem('optica_inventory_categories', JSON.stringify(inventoryCategories));
    async function syncCategories() {
      if (inventoryCategories.length > 0) {
        try {
          await supabase.from('inventory_categories').upsert(
            inventoryCategories.map(c => ({ id: c, name: c }))
          );
        } catch (e) {
          console.error("Error syncing inventory categories:", e);
        }
      }
    }
    syncCategories();
  }, [inventoryCategories]);

  useEffect(() => {
    localStorage.setItem('optica_lens_colors', JSON.stringify(lensColors));
    syncSetting('optica_lens_colors', lensColors);
  }, [lensColors]);

  useEffect(() => {
    localStorage.setItem('optica_contact_lens_colors', JSON.stringify(contactLensColors));
    syncSetting('optica_contact_lens_colors', contactLensColors);
  }, [contactLensColors]);

  useEffect(() => {
    localStorage.setItem('optica_lens_types', JSON.stringify(lensTypes));
    syncSetting('optica_lens_types', lensTypes);
  }, [lensTypes]);

  useEffect(() => {
    localStorage.setItem('optica_crystal_rules', JSON.stringify(crystalRules));
    async function syncRules() {
      if (crystalRules.length > 0) {
        try {
          await supabase.from('crystal_rules').upsert(
            crystalRules.map(r => ({
              id: r.id,
              name: r.name,
              material: r.material,
              tratamiento: r.tratamiento,
              precio: r.precio,
              conditions: r.conditions
            }))
          );
        } catch (e) {
          console.error("Error syncing crystal rules to Supabase:", e);
        }
      }
    }
    syncRules();
  }, [crystalRules]);

  useEffect(() => {
    localStorage.setItem('optica_crystal_items', JSON.stringify(crystalItems));
    async function syncItems() {
      if (crystalItems.length > 0) {
        try {
          await supabase.from('crystal_items').upsert(
            crystalItems.map(i => ({
              id: i.id,
              name: i.name,
              type: i.type,
              material: i.material,
              index: i.index,
              brand: i.brand,
              design: i.design,
              color: i.color,
              basePrice: i.basePrice,
              active: i.active,
              sphMin: i.sphMin,
              sphMax: i.sphMax,
              cylMax: i.cylMax,
              addMin: i.addMin,
              addMax: i.addMax,
              treatments: i.treatments || []
            }))
          );
        } catch (e) {
          console.error("Error syncing crystal items to Supabase:", e);
        }
      }
    }
    syncItems();
  }, [crystalItems]);

  useEffect(() => {
    localStorage.setItem('optica_treatments', JSON.stringify(treatments));
    syncSetting('optica_treatments', treatments);
  }, [treatments]);

  useEffect(() => {
    localStorage.setItem('optica_logo', opticaLogo);
    syncSetting('optica_logo', opticaLogo);
  }, [opticaLogo]);

  useEffect(() => {
    localStorage.setItem('optica_name', opticaName);
    syncSetting('optica_name', opticaName);
  }, [opticaName]);

  useEffect(() => {
    localStorage.setItem('optica_phone', opticaPhone);
    syncSetting('optica_phone', opticaPhone);
  }, [opticaPhone]);

  useEffect(() => {
    localStorage.setItem('optica_address', opticaAddress);
    syncSetting('optica_address', opticaAddress);
  }, [opticaAddress]);

  useEffect(() => {
    localStorage.setItem('optica_theme', appTheme);
    document.documentElement.setAttribute('data-theme', appTheme);
    syncSetting('optica_theme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem('optica_pdf_config', JSON.stringify(pdfConfig));
    syncSetting('optica_pdf_config', pdfConfig);
  }, [pdfConfig]);

  // Sync Masters changes
  useEffect(() => {
    syncSetting('optica_brands_masters', brands);
  }, [brands]);

  useEffect(() => {
    syncSetting('optica_materials_masters', materials);
  }, [materials]);

  useEffect(() => {
    syncSetting('optica_indices_masters', indices);
  }, [indices]);

  useEffect(() => {
    syncSetting('optica_designs_masters', designs);
  }, [designs]);

  useEffect(() => {
    syncSetting('optica_colors_masters', colors);
  }, [colors]);

  const setBrands = (newVal: string[]) => { setBrandsState(newVal); localStorage.setItem('optica_brands_masters', JSON.stringify(newVal)); };
  const setMaterials = (newVal: string[]) => { setMaterialsState(newVal); localStorage.setItem('optica_materials_masters', JSON.stringify(newVal)); };
  const setIndices = (newVal: string[]) => { setIndicesState(newVal); localStorage.setItem('optica_indices_masters', JSON.stringify(newVal)); };
  const setDesigns = (newVal: string[]) => { setDesignsState(newVal); localStorage.setItem('optica_designs_masters', JSON.stringify(newVal)); };
  const setColors = (newVal: string[]) => { setColorsState(newVal); localStorage.setItem('optica_colors_masters', JSON.stringify(newVal)); };

  const addCrystalItem = (item: Omit<CrystalItem, 'id'>) => {
    setCrystalItems(prev => [...prev, { ...item, id: `cri-${Date.now()}` }]);
  };
  const updateCrystalItem = (item: CrystalItem) => {
    setCrystalItems(prev => prev.map(r => r.id === item.id ? item : r));
  };
  const removeCrystalItem = async (id: string) => {
    setCrystalItems(prev => prev.filter(r => r.id !== id));
    try {
      await supabase.from('crystal_items').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase removeCrystalItem error:", e);
    }
  };

  const addTreatment = (name: string) => {
    setTreatments(prev => [...prev, name]);
  };
  const updateTreatment = (oldName: string, newName: string) => {
    setTreatments(prev => prev.map(t => t === oldName ? newName : t));
  };
  const removeTreatment = (name: string) => {
    setTreatments(prev => prev.filter(t => t !== name));
  };

  const addCrystalRule = (rule: Omit<CrystalPricingRule, 'id'>) => {
    setCrystalRules(prev => [...prev, { ...rule, id: `cr-${Date.now()}` }]);
  };
  const updateCrystalRule = (rule: CrystalPricingRule) => {
    setCrystalRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  };
  const removeCrystalRule = async (id: string) => {
    setCrystalRules(prev => prev.filter(r => r.id !== id));
    try {
      await supabase.from('crystal_rules').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase removeCrystalRule error:", e);
    }
  };

  const addInsurance = async (ins: Omit<Insurance, 'id'>) => {
    const newIns: Insurance = { ...ins, id: Date.now().toString() };
    setInsurances(prev => [...prev, newIns]);
    try {
      await supabase.from('insurances').upsert([{ id: newIns.id, name: newIns.name, active: newIns.active, coverages: newIns.coverages }]);
    } catch (e) {
      console.error("Supabase addInsurance error:", e);
    }
  };

  const updateInsurance = async (insurance: Insurance) => {
    setInsurances(prev => prev.map(i => i.id === insurance.id ? insurance : i));
    try {
      await supabase.from('insurances').upsert([{ id: insurance.id, name: insurance.name, active: insurance.active, coverages: insurance.coverages }]);
    } catch (e) {
      console.error("Supabase updateInsurance error:", e);
    }
  };

  const removeInsurance = async (id: string) => {
    setInsurances(prev => prev.filter(i => i.id !== id));
    try {
      await supabase.from('insurances').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase removeInsurance error:", e);
    }
  };

  const addInventoryCategory = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !inventoryCategories.includes(trimmed)) {
      setInventoryCategories([...inventoryCategories, trimmed]);
    }
  };

  const updateInventoryCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== oldName && !inventoryCategories.includes(trimmed)) {
      setInventoryCategories(inventoryCategories.map(c => c === oldName ? trimmed : c));
    }
  };

  const removeInventoryCategory = async (name: string) => {
    setInventoryCategories(inventoryCategories.filter(c => c !== name));
    try {
      await supabase.from('inventory_categories').delete().eq('id', name);
    } catch (e) {
      console.error("Supabase removeInventoryCategory error:", e);
    }
  };

  const addLensColor = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !lensColors.includes(trimmed)) {
      setLensColors([...lensColors, trimmed]);
    }
  };

  const updateLensColor = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== oldName && !lensColors.includes(trimmed)) {
      setLensColors(lensColors.map(c => c === oldName ? trimmed : c));
    }
  };

  const removeLensColor = (name: string) => {
    setLensColors(lensColors.filter(c => c !== name));
  };

  const addContactLensColor = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !contactLensColors.includes(trimmed)) {
      setContactLensColors([...contactLensColors, trimmed]);
    }
  };

  const updateContactLensColor = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== oldName && !contactLensColors.includes(trimmed)) {
      setContactLensColors(contactLensColors.map(c => c === oldName ? trimmed : c));
    }
  };

  const removeContactLensColor = (name: string) => {
    setContactLensColors(contactLensColors.filter(c => c !== name));
  };

  const addLensType = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !lensTypes.includes(trimmed)) {
      setLensTypes([...lensTypes, trimmed]);
    }
  };

  const updateLensType = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== oldName && !lensTypes.includes(trimmed)) {
      setLensTypes(lensTypes.map(c => c === oldName ? trimmed : c));
    }
  };

  const removeLensType = (name: string) => {
    setLensTypes(lensTypes.filter(c => c !== name));
  };

  const addBank = async (bank: Omit<BankEntity, 'id'>) => {
    const newBank: BankEntity = {
      ...bank,
      id: Date.now().toString(),
    };
    setBanks(prev => [...prev, newBank]);
    try {
      await supabase.from('banks').upsert([{
        id: newBank.id,
        name: newBank.name,
        cbu: newBank.cbu,
        alias: newBank.alias,
        account_number: newBank.accountNumber
      }]);
    } catch (e) {
      console.error("Supabase add bank error:", e);
    }
  };

  const updateBank = async (updatedBank: BankEntity) => {
    setBanks(prev => prev.map(b => b.id === updatedBank.id ? updatedBank : b));
    try {
      await supabase.from('banks').upsert([{
        id: updatedBank.id,
        name: updatedBank.name,
        cbu: updatedBank.cbu,
        alias: updatedBank.alias,
        account_number: updatedBank.accountNumber
      }]);
    } catch (e) {
      console.error("Supabase update bank error:", e);
    }
  };

  const removeBank = async (id: string) => {
    setBanks(prev => prev.filter(b => b.id !== id));
    try {
      await supabase.from('banks').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase remove bank error:", e);
    }
  };

  return (
    <SettingsContext.Provider value={{
      insurances,
      addInsurance,
      updateInsurance,
      removeInsurance,
      banks,
      addBank,
      updateBank,
      removeBank,
      inventoryCategories,
      addInventoryCategory,
      updateInventoryCategory,
      removeInventoryCategory,
      lensColors,
      addLensColor,
      updateLensColor,
      removeLensColor,
      contactLensColors,
      addContactLensColor,
      updateContactLensColor,
      removeContactLensColor,
      lensTypes,
      addLensType,
      updateLensType,
      removeLensType,
      opticaLogo,
      setOpticaLogo,
      opticaName,
      setOpticaName,
      opticaPhone,
      setOpticaPhone,
      opticaAddress,
      setOpticaAddress,
      appTheme,
      setAppTheme,
      pdfConfig,
      setPdfConfig,
      crystalRules,
      addCrystalRule,
      updateCrystalRule,
      removeCrystalRule,
      crystalItems,
      addCrystalItem,
      updateCrystalItem,
      removeCrystalItem,
      treatments,
      addTreatment,
      updateTreatment,
      removeTreatment,
      brands,
      setBrands,
      materials,
      setMaterials,
      indices,
      setIndices,
      designs,
      setDesigns,
      colors,
      setColors,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
