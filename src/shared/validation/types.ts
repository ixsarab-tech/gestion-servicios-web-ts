import type { z } from 'zod';

import type { Prisma } from '@/generated/prisma/client';
import type { AccionAuditoria } from '@/generated/prisma/client';
import type { Json } from '@/shared/audit/types';
import type { SessionUser } from '@/shared/auth/types';

/**
 * Contexto que recibe el handler de una Server Action validada.
 * `tx` es null si la action no es transaccional.
 */
export interface ActionContext {
  /** Usuario autenticado (siempre presente; el wrapper exige login). */
  user: SessionUser;
  /** Tenant activo (extraído de `user.tenantId`). */
  tenantId: string;
  /** Cliente Prisma transaccional o null. */
  tx: Prisma.TransactionClient | null;
}

/**
 * Configuración de auditoría para una action.
 *
 * `datosAnteriores` recibe `(input, ctx)` donde `ctx.tx` es el cliente
 * transaccional. DEBE usarse `ctx.tx` en lugar del `prisma` global para
 * evitar deadlocks por doble conexión.
 */
export interface AuditConfig<TOut> {
  accionAuditoria: AccionAuditoria;
  tablaAfectada: string;
  registroId: (out: TOut) => string | bigint;
  datosAnteriores?: (
    input: unknown,
    ctx?: { tx: Prisma.TransactionClient },
  ) => Promise<Json | null>;
  datosNuevos?: (out: TOut) => Json | null;
}

/**
 * Configuración completa de una Server Action validada.
 */
export interface ValidatedActionConfig<TSchema extends z.ZodTypeAny, TOut> {
  /** Nombre del módulo de negocio (ej: "clientes"). */
  modulo: string;
  /** Nombre de la acción (ej: "crear"). */
  accion: string;
  /** Esquema Zod del input. */
  schema: TSchema;
  /** Permiso requerido, formato "modulo:accion". */
  permission?: string;
  /** Al menos uno de estos roles debe estar presente. */
  roles?: readonly string[];
  /** Si true, el handler corre dentro de `withTransaction`. */
  transactional?: boolean;
  /** Configuración de auditoría (opcional; si falta, no se audita). */
  audit?: AuditConfig<TOut>;
}
