import { PERMISOS } from './permisos';

export interface RolSeed {
  nombre: string;
  descripcion: string;
  esSistema: boolean;
  /** Códigos de permiso asignados a este rol. */
  permisos: string[];
}

/** Todos los códigos de permiso como atajo. */
const TODOS = PERMISOS.map((p) => p.codigo);

/** Helper: filtra permisos por prefijo de módulo. */
function permisosDe(modulos: string[]): string[] {
  return TODOS.filter((codigo) => {
    const modulo = codigo.split(':')[0];
    return modulos.includes(modulo ?? '');
  });
}

/**
 * Catálogo de roles por tenant.
 * El rol "super_admin" es global (se crea una vez, sin tenant).
 */
export const ROLES_POR_TENANT: RolSeed[] = [
  {
    nombre: 'admin_taller',
    descripcion: 'Administrador del taller. Acceso total excepto super_admin.',
    esSistema: true,
    permisos: TODOS,
  },
  {
    nombre: 'recepcionista',
    descripcion: 'Personal de recepción. Gestiona admisión, clientes y agendamiento.',
    esSistema: true,
    permisos: [
      ...permisosDe(['clientes', 'ordenes']),
      'presupuestos:ver',
      'presupuestos:crear',
      'presupuestos:editar',
      'presupuestos:enviar',
      'portal:ver_catalogo',
      'portal:agendar',
      'portal:ver_tracking',
      'catalogos:marcas:ver',
      'catalogos:categorias:ver',
      'catalogos:tipos-servicio:ver',
      'ordenes:ver',
      'ordenes:crear',
      'ordenes:editar',
      'ordenes:asignar',
      'ordenes:cambiar_estado',
      'diagnosticos:ver',
    ],
  },
  {
    nombre: 'tecnico',
    descripcion: 'Técnico de taller. Diagnóstico, reparación y uso de inventario.',
    esSistema: true,
    permisos: [
      'ordenes:ver',
      'ordenes:cambiar_estado',
      'diagnosticos:ver',
      'diagnosticos:crear',
      'diagnosticos:editar',
      'presupuestos:ver',
      'reparaciones:ver',
      'reparaciones:actualizar_tiempo',
      'reparaciones:agregar_nota',
      'inventario:ver',
      'inventario:salida',
      'catalogos:marcas:ver',
      'catalogos:categorias:ver',
      'catalogos:tipos-servicio:ver',
      'ordenes:ver',
      'ordenes:cambiar_estado',
      'diagnosticos:ver',
      'diagnosticos:crear',
      'diagnosticos:editar',
      'diagnosticos:completar',
    ],
  },
  {
    nombre: 'tecnico_campo',
    descripcion: 'Técnico de servicio a domicilio. Incluye logística y cobro en sitio.',
    esSistema: true,
    permisos: [
      'ordenes:ver',
      'ordenes:cambiar_estado',
      'diagnosticos:ver',
      'diagnosticos:crear',
      'reparaciones:ver',
      'reparaciones:actualizar_tiempo',
      'reparaciones:agregar_nota',
      'inventario:ver',
      'inventario:salida',
      'logistica:ver',
      'logistica:checkin',
      'logistica:checkout',
      'logistica:cobrar',
      'catalogos:marcas:ver',
      'catalogos:categorias:ver',
      'catalogos:tipos-servicio:ver',
      'ordenes:ver',
      'ordenes:cambiar_estado',
      'diagnosticos:ver',
      'diagnosticos:crear',
      'diagnosticos:editar',
      'diagnosticos:completar',
    ],
  },
  {
    nombre: 'contador',
    descripcion: 'Contador. Acceso a facturación, cobros y reportes financieros.',
    esSistema: true,
    permisos: [
      'clientes:ver',
      'ordenes:ver',
      'facturacion:ver',
      'facturacion:emitir',
      'facturacion:anular',
      'facturacion:cobrar',
      'facturacion:exportar',
      'garantias:ver',
      'reportes:ver_operativos',
      'reportes:ver_financieros',
      'reportes:exportar',
      'ordenes:ver',
      'ordenes:exportar',
      'diagnosticos:ver',
    ],
  },
  {
    nombre: 'cliente_portal',
    descripcion: 'Cliente final. Solo puede ver sus propias órdenes y datos.',
    esSistema: true,
    permisos: ['portal:ver_catalogo', 'portal:cotizar', 'portal:agendar', 'portal:ver_tracking'],
  },
];

/** Rol global (no depende de tenant). */
export const ROL_SUPER_ADMIN: RolSeed = {
  nombre: 'super_admin',
  descripcion: 'Super administrador global. Acceso total al sistema.',
  esSistema: true,
  permisos: TODOS,
};


