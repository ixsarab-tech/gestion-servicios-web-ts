/**
 * Configuración de impuestos para Nicaragua.
 * Estos valores se aplican como defaults; cada tenant puede sobrescribirlos
 * vía `configuracion_tenant`.
 */

/** IVA general en Nicaragua: 15%. */
export const IVA_PORCENTAJE_DEFAULT = 15;

/** Tasa municipal por defecto (IR municipal): 1% sobre servicios. */
export const TASA_MUNICIPAL_DEFAULT = 1;

/** Retención por servicios profesionales: 10%. */
export const RETENCION_SERVICIOS_DEFAULT = 10;

/**
 * Calcula el IVA sobre un subtotal.
 * Redondea a 2 decimales (banca).
 */
export function calcularIVA(subtotal: number, porcentaje: number = IVA_PORCENTAJE_DEFAULT): number {
  return Math.round(subtotal * (porcentaje / 100) * 100) / 100;
}

/**
 * Calcula el total (subtotal + IVA).
 */
export function calcularTotalConIVA(
  subtotal: number,
  porcentaje: number = IVA_PORCENTAJE_DEFAULT,
): { subtotal: number; iva: number; total: number } {
  const iva = calcularIVA(subtotal, porcentaje);
  return {
    subtotal,
    iva,
    total: Math.round((subtotal + iva) * 100) / 100,
  };
}
