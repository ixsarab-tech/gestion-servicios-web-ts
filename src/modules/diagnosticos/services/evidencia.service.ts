import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';

import type { CrearEvidenciaInput } from '../schemas';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// CREAR EVIDENCIA
// ═══════════════════════════════════════════════════════════════

export async function crearEvidencia(input: CrearEvidenciaInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const diagnostico = await client.diagnostico.findFirst({
    where: { id: input.diagnosticoId },
    select: { id: true, estado: true },
  });
  if (!diagnostico) {
    throw new NotFoundError('Diagnóstico no encontrado');
  }

  if (diagnostico.estado === 'COMPLETADO') {
    throw new BusinessRuleError('No se pueden agregar evidencias a un diagnóstico completado');
  }

  const data: Prisma.DiagnosticoEvidenciaUncheckedCreateInput = {
    tenantId,
    diagnosticoId: input.diagnosticoId,
    tipo: input.tipo,
    url: input.url,
    descripcion: input.descripcion ?? null,
  };

  return client.diagnosticoEvidencia.create({ data });
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR EVIDENCIA
// ═══════════════════════════════════════════════════════════════

export async function eliminarEvidencia(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const evidencia = await client.diagnosticoEvidencia.findFirst({
    where: { id },
    include: { diagnostico: { select: { estado: true } } },
  });
  if (!evidencia) {
    throw new NotFoundError('Evidencia no encontrada');
  }

  if (evidencia.diagnostico.estado === 'COMPLETADO') {
    throw new BusinessRuleError('No se pueden eliminar evidencias de un diagnóstico completado');
  }

  await client.diagnosticoEvidencia.delete({ where: { id } });
}
