/**
 * Catálogo de tipos de servicio.
 */
export interface TipoServicioSeed {
  nombre: string;
  descripcion: string;
}

export const TIPOS_SERVICIO: TipoServicioSeed[] = [
  { nombre: 'Preventivo', descripcion: 'Mantenimiento programado para evitar fallos' },
  { nombre: 'Correctivo', descripcion: 'Reparación de una falla existente' },
  { nombre: 'Instalación', descripcion: 'Instalación de un equipo nuevo' },
  { nombre: 'Diagnóstico', descripcion: 'Evaluación técnica para determinar la causa del fallo' },
  { nombre: 'Mantenimiento', descripcion: 'Limpieza y ajuste general del equipo' },
  { nombre: 'Garantía', descripcion: 'Servicio cubierto por la garantía del fabricante' },
  { nombre: 'Revisión', descripcion: 'Verificación rápida del estado del equipo' },
];
