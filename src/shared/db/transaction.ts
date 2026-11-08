import type { Prisma } from '@/generated/prisma/client';
import { applyTenantExtension } from '@/shared/tenant/extension';

import { prisma } from './client';

/**
 * Opciones para withTransaction.
 */
export interface TransactionOptions {
  /** Timeout máximo en milisegundos (default: 10s). */
  timeoutMs?: number;
  /** Nivel de aislamiento (default: ReadCommitted). */
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}

/**
 * Ejecuta un bloque dentro de una transacción ACID.
 * Si el callback lanza, Prisma hace ROLLBACK completo.
 *
 * IMPORTANTE: el `tx` que recibe el callback está envuelto en el mismo proxy
 * tenant que `prisma`. Así los servicios que usan `tx` obtienen el filtro
 * automático por `tenant_id` sin hacer nada extra.
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = {},
): Promise<T> {
  const { timeoutMs = 10_000, isolationLevel = 'ReadCommitted' } = options;

  return prisma.$transaction(
    async (tx) => {
      // Envolver el tx en el proxy tenant para que los servicios tengan
      // el filtro automático. `applyTenantExtension` es genérico y acepta
      // cualquier cliente Prisma, incluidos los transaccionales.
      const tenantTx = applyTenantExtension(tx as never) as Prisma.TransactionClient;
      return fn(tenantTx);
    },
    {
      timeout: timeoutMs,
      isolationLevel,
    },
  );
}
