export interface UsuarioSeed {
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  roles: string[];
}

/**
 * Super administrador global.
 * NO pertenece a ningún tenant específico — se le asigna a taller-demo.
 * Su rol es "super_admin" (acceso total cross-tenant).
 */
export const SUPER_ADMIN: UsuarioSeed = {
  email: 'superadmin@gestion.local',
  nombre: 'Super',
  apellidos: 'Administrador',
  telefono: '+50588880000',
  roles: ['super_admin'],
};

/**
 * Plantilla de usuarios por tenant.
 * Se replicará en cada tenant con emails prefijados por el slug.
 *
 * Uso: `recepcion1@taller-demo.local`, `tecnico1@taller-norte.local`, etc.
 */
export const USUARIOS_PLANTILLA: Record<string, UsuarioSeed> = {
  admin: {
    email: 'admin',
    nombre: 'Admin',
    apellidos: 'Taller',
    telefono: '+50588880100',
    roles: ['admin_taller'],
  },
  recepcion1: {
    email: 'recepcion1',
    nombre: 'María',
    apellidos: 'López',
    telefono: '+50588880101',
    roles: ['recepcionista'],
  },
  recepcion2: {
    email: 'recepcion2',
    nombre: 'Carlos',
    apellidos: 'Martínez',
    telefono: '+50588880102',
    roles: ['recepcionista'],
  },
  tecnico1: {
    email: 'tecnico1',
    nombre: 'José',
    apellidos: 'Ramírez',
    telefono: '+50588880110',
    roles: ['tecnico'],
  },
  tecnico2: {
    email: 'tecnico2',
    nombre: 'Ana',
    apellidos: 'Gutiérrez',
    telefono: '+50588880111',
    roles: ['tecnico'],
  },
  tecnico3: {
    email: 'tecnico3',
    nombre: 'Pedro',
    apellidos: 'Hernández',
    telefono: '+50588880112',
    roles: ['tecnico'],
  },
  tecnico4: {
    email: 'tecnico4',
    nombre: 'Luisa',
    apellidos: 'Mendoza',
    telefono: '+50588880113',
    roles: ['tecnico'],
  },
  tecnico_campo1: {
    email: 'campo1',
    nombre: 'Roberto',
    apellidos: 'Castillo',
    telefono: '+50588880120',
    roles: ['tecnico_campo'],
  },
  contador: {
    email: 'contador',
    nombre: 'Elena',
    apellidos: 'Vargas',
    telefono: '+50588880130',
    roles: ['contador'],
  },
  cliente1: {
    email: 'cliente1',
    nombre: 'Cliente',
    apellidos: 'Uno',
    telefono: '+50588880140',
    roles: ['cliente_portal'],
  },
  cliente2: {
    email: 'cliente2',
    nombre: 'Cliente',
    apellidos: 'Dos',
    telefono: '+50588880141',
    roles: ['cliente_portal'],
  },
  cliente3: {
    email: 'cliente3',
    nombre: 'Cliente',
    apellidos: 'Tres',
    telefono: '+50588880142',
    roles: ['cliente_portal'],
  },
  cliente4: {
    email: 'cliente4',
    nombre: 'Cliente',
    apellidos: 'Cuatro',
    telefono: '+50588880143',
    roles: ['cliente_portal'],
  },
  cliente5: {
    email: 'cliente5',
    nombre: 'Cliente',
    apellidos: 'Cinco',
    telefono: '+50588880144',
    roles: ['cliente_portal'],
  },
};

/**
 * Genera la lista completa de usuarios para un tenant específico.
 * El email final queda como: `<prefijo>@<slug>.local`
 */
export function construirUsuariosDeTenant(slug: string): UsuarioSeed[] {
  return Object.values(USUARIOS_PLANTILLA).map((u) => ({
    ...u,
    email: `${u.email}@${slug}.local`,
  }));
}
