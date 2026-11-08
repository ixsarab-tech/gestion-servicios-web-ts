/**
 * Códigos ISO 3166-1 alpha-2 de países (foco Centroamérica + principales).
 */
export const PAISES_INFO = {
  NI: { codigo: 'NI', nombre: 'Nicaragua', prefijoTelefono: '+505' },
  CR: { codigo: 'CR', nombre: 'Costa Rica', prefijoTelefono: '+506' },
  HN: { codigo: 'HN', nombre: 'Honduras', prefijoTelefono: '+504' },
  SV: { codigo: 'SV', nombre: 'El Salvador', prefijoTelefono: '+503' },
  GT: { codigo: 'GT', nombre: 'Guatemala', prefijoTelefono: '+502' },
  PA: { codigo: 'PA', nombre: 'Panamá', prefijoTelefono: '+507' },
  MX: { codigo: 'MX', nombre: 'México', prefijoTelefono: '+52' },
  US: { codigo: 'US', nombre: 'Estados Unidos', prefijoTelefono: '+1' },
} as const;

export type PaisCode = keyof typeof PAISES_INFO;

export const PAIS_DEFAULT: PaisCode = 'NI';

/** Lista de países en formato para dropdowns. */
export const PAISES_OPCIONES = Object.values(PAISES_INFO).map((p) => ({
  value: p.codigo,
  label: p.nombre,
}));
