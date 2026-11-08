/**
 * Equipos de prueba para los clientes existentes.
 * Marca y categoría se referencian por nombre (se resuelven al insertar).
 */
export interface EquipoSeed {
  clienteEmail?: string;
  clienteNombre?: string;
  clienteApellidos?: string;
  marcaNombre?: string;
  categoriaNombre?: string;
  modelo: string;
  numeroSerie: string;
  descripcion: string;
  observaciones?: string;
  fechaAdquisicion?: string;
}

export const EQUIPOS: EquipoSeed[] = [
  // ─── Juan Pérez (admin23456@aduana.com) ───
  {
    clienteEmail: 'admin23456@aduana.com',
    marcaNombre: 'Samsung',
    categoriaNombre: 'Refrigeración',
    modelo: 'RT29K5030S8',
    numeroSerie: 'SAM-RT29-001',
    descripcion: 'Refrigeradora Samsung 290L, dos puertas',
    observaciones: 'Comprada en 2022, en buen estado',
    fechaAdquisicion: '2022-06-15',
  },
  {
    clienteEmail: 'admin23456@aduana.com',
    marcaNombre: 'Whirlpool',
    categoriaNombre: 'Cocina',
    modelo: 'WMC30516',
    numeroSerie: 'WP-WMC3-001',
    descripcion: 'Horno microondas Whirlpool 1.6 pies cúbicos',
  },

  // ─── Jostin (jorge.prado67899@clinica.com) ───
  {
    clienteEmail: 'jorge.prado67899@clinica.com',
    marcaNombre: 'LG',
    categoriaNombre: 'Lavandería',
    modelo: 'WM3400CW',
    numeroSerie: 'LG-WM34-002',
    descripcion: 'Lavadora LG 4.5 pies cúbicos, carga frontal',
    observaciones: 'Requiere mantenimiento semestral',
  },
  {
    clienteEmail: 'jorge.prado67899@clinica.com',
    marcaNombre: 'Samsung',
    categoriaNombre: 'Audio/Video',
    modelo: 'UN43T5300',
    numeroSerie: 'SAM-TV43-002',
    descripcion: 'Smart TV Samsung 43 pulgadas',
  },

  // ─── Carlos Jimenez ───
  {
    clienteNombre: 'Carlos',
    clienteApellidos: 'Jimenez',
    marcaNombre: 'Mabe',
    categoriaNombre: 'Refrigeración',
    modelo: 'RMA-260',
    numeroSerie: 'MB-RMA2-003',
    descripcion: 'Refrigeradora Mabe 260L',
  },

  // ─── Jose Jimenez ───
  {
    clienteNombre: 'Jose',
    clienteApellidos: 'Jimenez',
    marcaNombre: 'LG',
    categoriaNombre: 'Climatización',
    modelo: 'AC12-12000',
    numeroSerie: 'LG-AC12-004',
    descripcion: 'Aire acondicionado split LG 12,000 BTU',
  },

  // ─── Maria Jose ───
  {
    clienteNombre: 'Maria',
    clienteApellidos: 'Jose',
    marcaNombre: 'Oster',
    categoriaNombre: 'Pequeños Electrodomésticos',
    modelo: 'TSSTTVMNDG',
    numeroSerie: 'OS-HOR-005',
    descripcion: 'Horno tostador Oster 6 rebanadas',
  },
];
