/**
 * Catálogo de marcas de equipos.
 * Se inserta por tenant al ejecutar `pnpm db:seed:catalogos`.
 */
export interface MarcaSeed {
  nombre: string;
}

export const MARCAS: MarcaSeed[] = [
  { nombre: 'Samsung' },
  { nombre: 'LG' },
  { nombre: 'Whirlpool' },
  { nombre: 'Mabe' },
  { nombre: 'Oster' },
  { nombre: 'Black+Decker' },
  { nombre: 'Philips' },
  { nombre: 'Panasonic' },
  { nombre: 'Electrolux' },
  { nombre: 'Bosch' },
  { nombre: 'GE' },
  { nombre: 'Frigidaire' },
  { nombre: 'Haier' },
  { nombre: 'Hisense' },
  { nombre: 'Toshiba' },
  { nombre: 'Sharp' },
  { nombre: 'Daewoo' },
  { nombre: 'KitchenAid' },
  { nombre: 'Maytag' },
  { nombre: 'Xiaomi' },
];
