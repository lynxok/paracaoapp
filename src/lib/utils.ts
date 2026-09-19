import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parsea valores monetarios en formato string o number (ej. "$120.000", "$120.000,50", "120.000", 120000)
 * a un número float estándar de JavaScript seguro para cálculos matemáticos.
 */
export function parseCurrency(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  // Quitar signo peso, espacios y otros caracteres que no sean dígitos o separadores
  str = str.replace(/[^0-9,.-]/g, '');

  if (!str) return 0;

  // Si contiene tanto punto como coma, el punto es separador de miles y la coma es decimal (formato AR / ES)
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes('.')) {
    // Si solo tiene puntos:
    // En Argentina los precios se guardan/muestran como $120.000, $50.000, $1.250.000
    // Si tiene más de un punto, son separadores de miles
    // O si tiene exactamente un punto seguido de 3 dígitos (ej. "120.000"), es separador de miles
    const parts = str.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/\./g, '');
    }
  } else if (str.includes(',')) {
    // Si solo tiene coma, es separador decimal (ej. "120,50")
    str = str.replace(',', '.');
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Formatea un número o string monetario al estándar de pesos argentinos ($120.000 o $120.000,50 si se piden decimales).
 */
export function formatMoney(val: number | string | null | undefined, includeDecimals = false): string {
  const num = typeof val === 'number' ? val : parseCurrency(val);
  return `$${num.toLocaleString('es-AR', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  })}`;
}
