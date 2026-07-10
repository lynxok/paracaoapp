import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Insurance, CrystalPricingRule, CrystalItem } from '../types';

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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0 && typeof parsed[0] === 'string') {
        return parsed.map((name: string, idx: number) => ({ id: String(idx+1), name, cbu: '', alias: '', accountNumber: '' }));
      }
      return parsed;
    }
    return INITIAL_BANKS;
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
  const removeCrystalItem = (id: string) => {
    setCrystalItems(prev => prev.filter(r => r.id !== id));
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

  useEffect(() => { localStorage.setItem('optica_crystal_items', JSON.stringify(crystalItems)); }, [crystalItems]);
  useEffect(() => { localStorage.setItem('optica_treatments', JSON.stringify(treatments)); }, [treatments]);

  const addCrystalRule = (rule: Omit<CrystalPricingRule, 'id'>) => {
    setCrystalRules(prev => [...prev, { ...rule, id: `cr-${Date.now()}` }]);
  };
  const updateCrystalRule = (rule: CrystalPricingRule) => {
    setCrystalRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  };
  const removeCrystalRule = (id: string) => {
    setCrystalRules(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => { localStorage.setItem('optica_insurances', JSON.stringify(insurances)); }, [insurances]);

  useEffect(() => {
    localStorage.setItem('optica_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('optica_inventory_categories', JSON.stringify(inventoryCategories));
  }, [inventoryCategories]);

  useEffect(() => {
    localStorage.setItem('optica_lens_colors', JSON.stringify(lensColors));
  }, [lensColors]);

  useEffect(() => {
    localStorage.setItem('optica_contact_lens_colors', JSON.stringify(contactLensColors));
  }, [contactLensColors]);

  useEffect(() => { localStorage.setItem('optica_lens_types', JSON.stringify(lensTypes)); }, [lensTypes]);
  useEffect(() => { localStorage.setItem('optica_crystal_rules', JSON.stringify(crystalRules)); }, [crystalRules]);
  useEffect(() => { localStorage.setItem('optica_logo', opticaLogo); }, [opticaLogo]);
  useEffect(() => { localStorage.setItem('optica_name', opticaName); }, [opticaName]);
  useEffect(() => { localStorage.setItem('optica_phone', opticaPhone); }, [opticaPhone]);
  useEffect(() => { localStorage.setItem('optica_address', opticaAddress); }, [opticaAddress]);
  useEffect(() => { 
    localStorage.setItem('optica_theme', appTheme); 
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);

  // Initial theme application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, []);

  const addInsurance = (ins: Omit<Insurance, 'id'>) => setInsurances([...insurances, { ...ins, id: Date.now().toString() }]);

  const updateInsurance = (insurance: Insurance) => {
    setInsurances(prev => prev.map(i => i.id === insurance.id ? insurance : i));
  };

  const removeInsurance = (id: string) => {
    // Soft delete
    setInsurances(prev => prev.map(i => i.id === id ? { ...i, active: false } : i));
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

  const removeInventoryCategory = (name: string) => {
    setInventoryCategories(inventoryCategories.filter(c => c !== name));
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

  const addBank = (bank: Omit<BankEntity, 'id'>) => {
    const newBank: BankEntity = {
      ...bank,
      id: Date.now().toString(),
    };
    setBanks([...banks, newBank]);
  };

  const updateBank = (updatedBank: BankEntity) => {
    setBanks(banks.map(b => b.id === updatedBank.id ? updatedBank : b));
  };

  const removeBank = (id: string) => {
    setBanks(banks.filter(b => b.id !== id));
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
