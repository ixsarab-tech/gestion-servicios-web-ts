/**
 * Catálogo global de permisos.
 * Formato: "modulo:accion"
 * Organizados por los módulos del sistema.
 */
export interface PermisoSeed {
  codigo: string;
  modulo: string;
  descripcion: string;
}

export const PERMISOS: PermisoSeed[] = [
  // ─── Clientes / CRM ───
  { codigo: 'clientes:ver', modulo: 'clientes', descripcion: 'Ver clientes' },
  { codigo: 'clientes:crear', modulo: 'clientes', descripcion: 'Crear clientes' },
  { codigo: 'clientes:editar', modulo: 'clientes', descripcion: 'Editar clientes' },
  { codigo: 'clientes:eliminar', modulo: 'clientes', descripcion: 'Eliminar clientes' },
  { codigo: 'clientes:exportar', modulo: 'clientes', descripcion: 'Exportar clientes' },

  // ─── Órdenes de servicio ───
  { codigo: 'ordenes:ver', modulo: 'ordenes', descripcion: 'Ver órdenes' },
  { codigo: 'ordenes:crear', modulo: 'ordenes', descripcion: 'Crear órdenes' },
  { codigo: 'ordenes:editar', modulo: 'ordenes', descripcion: 'Editar órdenes' },
  { codigo: 'ordenes:asignar', modulo: 'ordenes', descripcion: 'Asignar técnicos' },
  { codigo: 'ordenes:cambiar_estado', modulo: 'ordenes', descripcion: 'Cambiar estado de órdenes' },
  { codigo: 'ordenes:cancelar', modulo: 'ordenes', descripcion: 'Cancelar órdenes' },
  { codigo: 'ordenes:exportar', modulo: 'ordenes', descripcion: 'Exportar órdenes' },

  // ─── Diagnóstico ───
  { codigo: 'diagnosticos:ver', modulo: 'diagnosticos', descripcion: 'Ver diagnósticos' },
  { codigo: 'diagnosticos:crear', modulo: 'diagnosticos', descripcion: 'Crear diagnósticos' },
  { codigo: 'diagnosticos:editar', modulo: 'diagnosticos', descripcion: 'Editar diagnósticos' },

  // ─── Presupuestos ───
  { codigo: 'presupuestos:ver', modulo: 'presupuestos', descripcion: 'Ver presupuestos' },
  { codigo: 'presupuestos:crear', modulo: 'presupuestos', descripcion: 'Crear presupuestos' },
  { codigo: 'presupuestos:editar', modulo: 'presupuestos', descripcion: 'Editar presupuestos' },
  { codigo: 'presupuestos:enviar', modulo: 'presupuestos', descripcion: 'Enviar presupuestos' },
  { codigo: 'presupuestos:aprobar', modulo: 'presupuestos', descripcion: 'Aprobar presupuestos' },
  { codigo: 'presupuestos:rechazar', modulo: 'presupuestos', descripcion: 'Rechazar presupuestos' },
  { codigo: 'presupuestos:eliminar', modulo: 'presupuestos', descripcion: 'Eliminar presupuestos' },

  // ─── Reparaciones ───
  { codigo: 'reparaciones:ver', modulo: 'reparaciones', descripcion: 'Ver reparaciones' },
  { codigo: 'reparaciones:crear', modulo: 'reparaciones', descripcion: 'Crear reparaciones' },
  { codigo: 'reparaciones:asignar', modulo: 'reparaciones', descripcion: 'Asignar reparaciones' },
  {
    codigo: 'reparaciones:actualizar_tiempo',
    modulo: 'reparaciones',
    descripcion: 'Registrar tiempos',
  },
  {
    codigo: 'reparaciones:editar',
    modulo: 'reparaciones',
    descripcion: 'Editar reparaciones',
  },
  {
    codigo: 'reparaciones:completar',
    modulo: 'reparaciones',
    descripcion: 'Marcar reparación como completada',
  },
  {
    codigo: 'reparaciones:bloquear',
    modulo: 'reparaciones',
    descripcion: 'Marcar reparación como bloqueada',
  },
  {
    codigo: 'reparaciones:eliminar',
    modulo: 'reparaciones',
    descripcion: 'Eliminar reparaciones en borrador',
  },
  {
    codigo: 'reparaciones:agregar_nota',
    modulo: 'reparaciones',
    descripcion: 'Añadir notas técnicas',
  },

  // ─── Inventario ───
  { codigo: 'inventario:ver', modulo: 'inventario', descripcion: 'Ver inventario' },
  { codigo: 'inventario:entrada', modulo: 'inventario', descripcion: 'Registrar entradas' },
  { codigo: 'inventario:salida', modulo: 'inventario', descripcion: 'Registrar salidas' },
  { codigo: 'inventario:ajuste', modulo: 'inventario', descripcion: 'Ajustar inventario' },
  { codigo: 'inventario:exportar', modulo: 'inventario', descripcion: 'Exportar inventario' },

  // ─── Logística / Field Service ───
  { codigo: 'logistica:ver', modulo: 'logistica', descripcion: 'Ver rutas' },
  { codigo: 'logistica:crear_ruta', modulo: 'logistica', descripcion: 'Crear rutas' },
  { codigo: 'logistica:checkin', modulo: 'logistica', descripcion: 'Check-in en domicilio' },
  { codigo: 'logistica:checkout', modulo: 'logistica', descripcion: 'Check-out en domicilio' },
  { codigo: 'logistica:cobrar', modulo: 'logistica', descripcion: 'Cobrar en sitio' },

  // ─── Facturación ───
  { codigo: 'facturacion:ver', modulo: 'facturacion', descripcion: 'Ver comprobantes' },
  { codigo: 'facturacion:emitir', modulo: 'facturacion', descripcion: 'Emitir comprobantes' },
  { codigo: 'facturacion:anular', modulo: 'facturacion', descripcion: 'Anular comprobantes' },
  { codigo: 'facturacion:cobrar', modulo: 'facturacion', descripcion: 'Registrar cobros' },
  { codigo: 'facturacion:exportar', modulo: 'facturacion', descripcion: 'Exportar facturación' },

  // ─── Garantías ───
  { codigo: 'garantias:ver', modulo: 'garantias', descripcion: 'Ver garantías' },
  { codigo: 'garantias:crear', modulo: 'garantias', descripcion: 'Registrar garantías' },
  { codigo: 'garantias:reclamar', modulo: 'garantias', descripcion: 'Registrar reclamaciones' },

  // ─── Reportes / BI ───
  { codigo: 'reportes:ver_operativos', modulo: 'reportes', descripcion: 'Ver reportes operativos' },
  {
    codigo: 'reportes:ver_financieros',
    modulo: 'reportes',
    descripcion: 'Ver reportes financieros',
  },
  { codigo: 'reportes:exportar', modulo: 'reportes', descripcion: 'Exportar reportes' },

  // ─── Usuarios y seguridad ───
  { codigo: 'usuarios:ver', modulo: 'usuarios', descripcion: 'Ver usuarios' },
  { codigo: 'usuarios:crear', modulo: 'usuarios', descripcion: 'Crear usuarios' },
  { codigo: 'usuarios:editar', modulo: 'usuarios', descripcion: 'Editar usuarios' },
  { codigo: 'usuarios:desactivar', modulo: 'usuarios', descripcion: 'Desactivar usuarios' },
  { codigo: 'usuarios:asignar_roles', modulo: 'usuarios', descripcion: 'Asignar roles a usuarios' },

  // ─── Configuración ───
  {
    codigo: 'configuracion:ver',
    modulo: 'configuracion',
    descripcion: 'Ver configuración del tenant',
  },
  {
    codigo: 'configuracion:editar',
    modulo: 'configuracion',
    descripcion: 'Editar configuración del tenant',
  },

  // ─── Auditoría ───
  { codigo: 'auditoria:ver', modulo: 'auditoria', descripcion: 'Ver bitácora de auditoría' },
  { codigo: 'auditoria:exportar', modulo: 'auditoria', descripcion: 'Exportar bitácora' },

  // ─── Portal y catálogo (público) ───
  { codigo: 'portal:ver_catalogo', modulo: 'portal', descripcion: 'Ver catálogo público' },
  { codigo: 'portal:cotizar', modulo: 'portal', descripcion: 'Usar cotizador' },
  { codigo: 'portal:agendar', modulo: 'portal', descripcion: 'Agendar servicios' },
  { codigo: 'portal:ver_tracking', modulo: 'portal', descripcion: 'Ver seguimiento de orden' },

  // ─── Catálogos ───
  { codigo: 'catalogos:marcas:ver', modulo: 'catalogos', descripcion: 'Ver marcas' },
  { codigo: 'catalogos:marcas:crear', modulo: 'catalogos', descripcion: 'Crear marcas' },
  { codigo: 'catalogos:marcas:editar', modulo: 'catalogos', descripcion: 'Editar marcas' },
  { codigo: 'catalogos:marcas:eliminar', modulo: 'catalogos', descripcion: 'Eliminar marcas' },
  { codigo: 'catalogos:categorias:ver', modulo: 'catalogos', descripcion: 'Ver categorías' },
  { codigo: 'catalogos:categorias:crear', modulo: 'catalogos', descripcion: 'Crear categorías' },
  { codigo: 'catalogos:categorias:editar', modulo: 'catalogos', descripcion: 'Editar categorías' },
  {
    codigo: 'catalogos:categorias:eliminar',
    modulo: 'catalogos',
    descripcion: 'Eliminar categorías',
  },
  {
    codigo: 'catalogos:tipos-servicio:ver',
    modulo: 'catalogos',
    descripcion: 'Ver tipos de servicio',
  },
  {
    codigo: 'catalogos:tipos-servicio:crear',
    modulo: 'catalogos',
    descripcion: 'Crear tipos de servicio',
  },
  {
    codigo: 'catalogos:tipos-servicio:editar',
    modulo: 'catalogos',
    descripcion: 'Editar tipos de servicio',
  },
  {
    codigo: 'catalogos:tipos-servicio:eliminar',
    modulo: 'catalogos',
    descripcion: 'Eliminar tipos de servicio',
  },

  // ─── Órdenes de Servicio ───
  { codigo: 'ordenes:ver', modulo: 'ordenes', descripcion: 'Ver órdenes de servicio' },
  { codigo: 'ordenes:crear', modulo: 'ordenes', descripcion: 'Crear órdenes' },
  { codigo: 'ordenes:editar', modulo: 'ordenes', descripcion: 'Editar órdenes' },
  { codigo: 'ordenes:cambiar_estado', modulo: 'ordenes', descripcion: 'Cambiar estado de órdenes' },
  { codigo: 'ordenes:asignar', modulo: 'ordenes', descripcion: 'Asignar técnico' },
  { codigo: 'ordenes:cancelar', modulo: 'ordenes', descripcion: 'Cancelar órdenes' },
  { codigo: 'ordenes:exportar', modulo: 'ordenes', descripcion: 'Exportar órdenes' },

  // ─── Diagnósticos técnicos ───
  { codigo: 'diagnosticos:ver', modulo: 'diagnosticos', descripcion: 'Ver diagnósticos' },
  { codigo: 'diagnosticos:crear', modulo: 'diagnosticos', descripcion: 'Crear diagnósticos' },
  {
    codigo: 'diagnosticos:editar',
    modulo: 'diagnosticos',
    descripcion: 'Editar diagnósticos',
  },
  {
    codigo: 'diagnosticos:completar',
    modulo: 'diagnosticos',
    descripcion: 'Completar diagnósticos',
  },
  {
    codigo: 'diagnosticos:eliminar',
    modulo: 'diagnosticos',
    descripcion: 'Eliminar diagnósticos',
  },
];


