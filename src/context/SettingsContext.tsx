import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Insurance } from '../types';

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
      setPdfConfig
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
