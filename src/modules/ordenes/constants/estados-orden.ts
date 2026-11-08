import type { EstadoOrden } from '@/generated/prisma/client';

/**
 * Transiciones válidas de la máquina de estados.
 * La clave es el estado actual; el array son los estados a los que puede ir.
 */
export const TRANSICIONES_VALIDAS: Record<EstadoOrden, EstadoOrden[]> = {
  BORRADOR: ['RECIBIDO', 'CANCELADO'],
  RECIBIDO: ['EN_DIAGNOSTICO', 'CANCELADO'],
  EN_DIAGNOSTICO: ['PRESUPUESTADO', 'CANCELADO'],
  PRESUPUESTADO: ['APROBADO', 'CANCELADO'],
  APROBADO: ['REPARANDO', 'CANCELADO'],
  REPARANDO: ['LISTO', 'CANCELADO'],
  LISTO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

/**
 * Labels en español para mostrar en UI.
 */
export const ESTADO_LABELS: Record<EstadoOrden, string> = {
  BORRADOR: 'Borrador',
  RECIBIDO: 'Recibido',
  EN_DIAGNOSTICO: 'En diagnóstico',
  PRESUPUESTADO: 'Presupuestado',
  APROBADO: 'Aprobado',
  REPARANDO: 'Reparando',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

/**
 * Variante de Badge de Shadcn para cada estado.
 */
export const ESTADO_BADGE_VARIANT: Record<
  EstadoOrden,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  BORRADOR: 'secondary',
  RECIBIDO: 'outline',
  EN_DIAGNOSTICO: 'outline',
  PRESUPUESTADO: 'outline',
  APROBADO: 'default',
  REPARANDO: 'default',
  LISTO: 'default',
  ENTREGADO: 'secondary',
  CANCELADO: 'destructive',
};

/**
 * ¿Es una transición válida entre dos estados?
 */
export function esTransicionValida(estadoActual: EstadoOrden, estadoNuevo: EstadoOrden): boolean {
  if (estadoActual === estadoNuevo) return false;
  return TRANSICIONES_VALIDAS[estadoActual].includes(estadoNuevo);
}
