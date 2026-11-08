import type { z } from 'zod';

import type { Prisma } from '@/generated/prisma/client';
import { registrarAuditoria, registrarAuditoriaTx } from '@/shared/audit';
import { getSession } from '@/shared/auth/session';
import type { SessionUser } from '@/shared/auth/types';
import { withTransaction } from '@/shared/db/transaction';
import { ERROR_CODES } from '@/shared/errors/codes';
import { type ErrorContext, handleError } from '@/shared/errors/handler';
import { fail, ok, type Result } from '@/shared/errors/result';
import { runWithTenant } from '@/shared/tenant/context';

import type { ActionContext, ValidatedActionConfig } from './types';

type ActionHandler<TSchema extends z.ZodTypeAny, TOut> = (
  input: z.infer<TSchema>,
  ctx: ActionContext,
) => Promise<TOut>;

/**
 * Envuelve una Server Action aplicando, en orden:
 *   1. Validación Zod del input
 *   2. Autenticación (getSession)
 *   3. Autorización (permission y/o roles)
 *   4. Aislamiento multi-tenant (runWithTenant)
 *   5. Transacción ACID (si transactional: true)
 *   6. Auditoría (si config.audit)
 *   7. Manejo centralizado de errores → Result<T>
 *
 * NUNCA lanza. Siempre devuelve Result<T>.
 */
export function validatedAction<TSchema extends z.ZodTypeAny, TOut>(
  config: ValidatedActionConfig<TSchema, TOut>,
  handler: ActionHandler<TSchema, TOut>,
): (rawInput: unknown) => Promise<Result<TOut>> {
  const errorCtx: ErrorContext = { modulo: config.modulo, accion: config.accion };

  return async (rawInput: unknown): Promise<Result<TOut>> => {
    // ─── 1. Validación Zod ───
    const parsed = config.schema.safeParse(rawInput);
    if (!parsed.success) {
      return handleError(parsed.error, errorCtx);
    }
    const input = parsed.data;

    // ─── 2. Autenticación ───
    let user: SessionUser | null = null;
    try {
      user = await getSession();
    } catch (err) {
      return handleError(err, errorCtx);
    }
    if (!user) {
      return fail(
        ERROR_CODES.UNAUTHENTICATED,
        `[${config.modulo}:${config.accion}] Debes iniciar sesión para continuar`,
      );
    }

    // ─── 3. Autorización ───
    if (config.permission && !user.permisos.includes(config.permission)) {
      return fail(
        ERROR_CODES.FORBIDDEN,
        `[${config.modulo}:${config.accion}] Falta el permiso requerido: ${config.permission}`,
      );
    }
    if (config.roles && !config.roles.some((r) => user.roles.includes(r))) {
      return fail(
        ERROR_CODES.FORBIDDEN,
        `[${config.modulo}:${config.accion}] Se requiere uno de los roles: ${config.roles.join(', ')}`,
      );
    }

    // ─── 4. Ejecución dentro del contexto del tenant ───
    const effectiveUser = user;
    return runWithTenant(
      { tenantId: effectiveUser.tenantId, usuarioId: effectiveUser.id },
      async (): Promise<Result<TOut>> => {
        try {
          if (config.transactional) {
            return await runTransactional(config, handler, input, effectiveUser);
          }
          return await runStandalone(config, handler, input, effectiveUser);
        } catch (err) {
          return handleError(err, {
            ...errorCtx,
            usuarioId: effectiveUser.id,
            tenantId: effectiveUser.tenantId,
          });
        }
      },
    );
  };
}

/**
 * Ejecuta handler + auditoría dentro de una única transacción ACID.
 *
 * ⚠️ `datosAnteriores` se captura ANTES del handler para que la auditoría
 * registre el estado real previo (y para permitir deletes duros sin crash).
 */
async function runTransactional<TSchema extends z.ZodTypeAny, TOut>(
  config: ValidatedActionConfig<TSchema, TOut>,
  handler: ActionHandler<TSchema, TOut>,
  input: z.infer<TSchema>,
  user: SessionUser,
): Promise<Result<TOut>> {
  return withTransaction(async (tx) => {
    const ctx: ActionContext = {
      user,
      tenantId: user.tenantId,
      tx,
    };

    // ─── 1. Capturar estado anterior ANTES de mutar ───
    const getAnterior = config.audit?.datosAnteriores;
    const datosAnteriores = getAnterior ? await getAnterior(input, { tx }) : null;

    // ─── 2. Ejecutar la mutación ───
    const out = await handler(input, ctx);

    // ─── 3. Auditar DENTRO de la transacción → si falla, rollback completo ───
    if (config.audit) {
      const datosNuevos = config.audit.datosNuevos ? config.audit.datosNuevos(out) : null;

      await registrarAuditoriaTx(tx, {
        modulo: config.modulo,
        accion: config.audit.accionAuditoria,
        tablaAfectada: config.audit.tablaAfectada,
        registroId: config.audit.registroId(out),
        datosAnteriores,
        datosNuevos,
      });
    }

    return out;
  }).then(
    (data) => ok(data),
    (err) =>
      handleError(err, {
        modulo: config.modulo,
        accion: config.accion,
        usuarioId: user.id,
        tenantId: user.tenantId,
      }),
  );
}

/**
 * Ejecuta handler + auditoría sin transacción.
 *
 * ⚠️ Mismo orden que `runTransactional`: `datosAnteriores` antes del handler.
 */
async function runStandalone<TSchema extends z.ZodTypeAny, TOut>(
  config: ValidatedActionConfig<TSchema, TOut>,
  handler: ActionHandler<TSchema, TOut>,
  input: z.infer<TSchema>,
  user: SessionUser,
): Promise<Result<TOut>> {
  const ctx: ActionContext = {
    user,
    tenantId: user.tenantId,
    tx: null,
  };

  // ─── 1. Capturar estado anterior ANTES de mutar ───
  const getAnterior = config.audit?.datosAnteriores;
  const datosAnteriores = getAnterior ? await getAnterior(input, undefined) : null;

  // ─── 2. Ejecutar la mutación ───
  const out = await handler(input, ctx);

  // ─── 3. Auditar con el "anterior" correcto ───
  if (config.audit) {
    const datosNuevos = config.audit.datosNuevos ? config.audit.datosNuevos(out) : null;

    await registrarAuditoria({
      modulo: config.modulo,
      accion: config.audit.accionAuditoria,
      tablaAfectada: config.audit.tablaAfectada,
      registroId: config.audit.registroId(out),
      datosAnteriores,
      datosNuevos,
    });
  }

  return ok(out);
}

export type { Prisma };
