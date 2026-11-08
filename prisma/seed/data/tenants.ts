export interface TenantSeed {
  slug: string;
  nombre: string;
  activo: boolean;
}

/**
 * 3 tenants con volumetría desigual.
 * Esto permite detectar fugas de datos entre tenants si un query
 * olvida el filtro `tenant_id` (los conteos no cuadrarán).
 */
export const TENANTS: TenantSeed[] = [
  {
    slug: 'taller-demo',
    nombre: 'Taller Demo S.A.',
    activo: true,
  },
  {
    slug: 'taller-norte',
    nombre: 'Servicio Técnico del Norte',
    activo: true,
  },
  {
    slug: 'taller-sur',
    nombre: 'Reparaciones del Sur',
    activo: true,
  },
];
