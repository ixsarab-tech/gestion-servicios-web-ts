import { headers } from 'next/headers';

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { getCurrentTenant } from '@/shared/tenant/context';

import { sanitizeForAudit } from './sanitize';
import type { AuditEntryContext, AuditEntryInput } from './types';

/**
 * Extrae IP y user-agent del request actual.
 * Si no hay request (ej. script CLI), devuelve nulls.
 */
async function extractRequestContext(): Promise<AuditEntryContext> {
  try {
    const h = await headers();
    return {
      ipOrigen: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
      userAgent: h.get('user-agent') ?? null,
    };
  } catch {
    // `headers()` lanza si se llama fuera de un request.
    return { ipOrigen: null, userAgent: null };
  }
}

/**
 * Registra una entrada de auditoría usando el cliente Prisma tenant-scoped.
 * Uso: operaciones standalone (fuera de una transacción).
 *
 * NO lanza excepciones: si la auditoría falla, se loggea y se continúa.
 */
export async function registrarAuditoria(
  input: AuditEntryInput,
  ctx?: AuditEntryContext,
): Promise<void> {
  try {
    const tenantCtx = getCurrentTenant();
    if (!tenantCtx?.tenantId) {
      // Sin tenant no podemos escribir la bitácora; abandonamos silenciosamente
      // para no romper la operación de negocio.
      console.warn('[audit] Sin tenant en contexto, no se registró auditoría');
      return;
    }

    const requestCtx = ctx ?? (await extractRequestContext());

    await prisma.bitacoraAuditoria.create({
      data: {
        tenantId: tenantCtx.tenantId,
        usuarioId: tenantCtx.usuarioId ?? null,
        modulo: input.modulo,
        accion: input.accion,
        tablaAfectada: input.tablaAfectada,
        registroId: String(input.registroId),
        datosAnteriores: input.datosAnteriores ?? undefined,
        datosNuevos: input.datosNuevos ?? undefined,
        ipOrigen: requestCtx.ipOrigen ?? null,
        userAgent: requestCtx.userAgent ?? null,
      },
    });
  } catch (err) {
    // La auditoría nunca debe tumbar la operación de negocio.
    console.error('[audit] Error al registrar auditoría:', err);
  }
}

/**
 * Registra una entrada de auditoría DENTRO de una transacción existente.
 * Uso: operaciones que ya están dentro de `withTransaction(...)`.
 *
 * IMPORTANTE: aquí SÍ propagamos la excepción para que la transacción haga
 * ROLLBACK si la auditoría falla — es obligatorio auditar dentro de la misma tx.
 */
export async function registrarAuditoriaTx(
  tx: Prisma.TransactionClient,
  input: AuditEntryInput,
  ctx?: AuditEntryContext,
): Promise<void> {
  const tenantCtx = getCurrentTenant();
  if (!tenantCtx?.tenantId) {
    throw new Error('[audit] No hay tenant en contexto para registrar auditoría');
  }

  const requestCtx = ctx ?? (await extractRequestContext());

  await tx.bitacoraAuditoria.create({
    data: {
      tenantId: tenantCtx.tenantId,
      usuarioId: tenantCtx.usuarioId ?? null,
      modulo: input.modulo,
      accion: input.accion,
      tablaAfectada: input.tablaAfectada,
      registroId: String(input.registroId),
      datosAnteriores: input.datosAnteriores ?? undefined,
      datosNuevos: input.datosNuevos ?? undefined,
      ipOrigen: requestCtx.ipOrigen ?? null,
      userAgent: requestCtx.userAgent ?? null,
    },
  });
}

export { sanitizeForAudit };
