/**
 * Catálogo de categorías de equipo.
 */
export interface CategoriaSeed {
  nombre: string;
  descripcion: string;
}

export const CATEGORIAS: CategoriaSeed[] = [
  { nombre: 'Refrigeración', descripcion: 'Refrigeradoras, congeladores, vitrinas' },
  { nombre: 'Lavandería', descripcion: 'Lavadoras, secadoras, centros de lavado' },
  { nombre: 'Cocina', descripcion: 'Estufas, hornos, microondas, campanas' },
  { nombre: 'Climatización', descripcion: 'Aires acondicionados, ventiladores, calentadores' },
  { nombre: 'Audio/Video', descripcion: 'Televisores, equipos de sonido, reproductores' },
  { nombre: 'Cómputo', descripcion: 'Laptops, desktops, impresoras, monitores' },
  {
    nombre: 'Pequeños Electrodomésticos',
    descripcion: 'Licuadoras, batidoras, cafeteras, tostadoras',
  },
  { nombre: 'Línea Blanca', descripcion: 'Lavavajillas, trituradores, extractores' },
  { nombre: 'Herramientas Eléctricas', descripcion: 'Taladros, sierras, pulidoras' },
  { nombre: 'Otros', descripcion: 'Equipos no clasificados en otras categorías' },
];
