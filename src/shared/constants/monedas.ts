/**
 * Monedas soportadas por el sistema.
 * Se usa el código ISO 4217.
 */
export const MONEDAS = {
  NIO: 'NIO',
  USD: 'USD',
} as const;

export type MonedaCode = (typeof MONEDAS)[keyof typeof MONEDAS];

export interface MonedaInfo {
  codigo: MonedaCode;
  nombre: string;
  simbolo: string;
  locale: string;
  decimales: number;
}

export const MONEDAS_INFO: Record<MonedaCode, MonedaInfo> = {
  [MONEDAS.NIO]: {
    codigo: MONEDAS.NIO,
    nombre: 'Córdoba nicaragüense',
    simbolo: 'C$',
    locale: 'es-NI',
    decimales: 2,
  },
  [MONEDAS.USD]: {
    codigo: MONEDAS.USD,
    nombre: 'Dólar estadounidense',
    simbolo: '$',
    locale: 'en-US',
    decimales: 2,
  },
};

/** Moneda por defecto del sistema. */
export const MONEDA_DEFAULT: MonedaCode = MONEDAS.NIO;

/**
 * Formatea un monto con la moneda indicada.
 * Uso: formatearMonto(1234.5, 'NIO') → "C$ 1,234.50"
 */
export function formatearMonto(monto: number, moneda: MonedaCode = MONEDA_DEFAULT): string {
  const info = MONEDAS_INFO[moneda];
  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: info.codigo,
    minimumFractionDigits: info.decimales,
    maximumFractionDigits: info.decimales,
  }).format(monto);
}
