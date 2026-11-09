import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';

import type {
  AgregarRepuestoInput,
  EditarRepuestoInput,
  EliminarRepuestoInput,
} from '../schemas';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════
// AGREGAR REPUESTO
// ═══════════════════════════════════════════════════════════════

export async function agregarRepuesto(
  input: AgregarRepuestoInput,
  ctx: Ctx = {},
) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const reparacion = await client.reparacion.findFirst({
    where: { id: input.reparacionId },
    select: { id: true, estado: true },
  });
  if (!reparacion) {
    throw new NotFoundError('Reparación no encontrada');
  }
  if (reparacion.estado === 'COMPLETADA') {
    throw new BusinessRuleError('No se pueden agregar repuestos a una reparación completada');
  }

  const subtotal = round2(input.cantidad * input.costoUnitario);

  const repuesto = await client.reparacionRepuesto.create({
    data: {
      tenantId,
      reparacionId: input.reparacionId,
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      cantidad: input.cantidad,
      costoUnitario: new Prisma.Decimal(input.costoUnitario),
      subtotal: new Prisma.Decimal(subtotal),
    },
  });

  // Auto-transición: PENDIENTE → EN_PROCESO al agregar el primer repuesto
  if (reparacion.estado === 'PENDIENTE') {
    await client.reparacion.update({
      where: { id: input.reparacionId },
      data: { estado: 'EN_PROCESO', fechaInicio: new Date() },
    });
  }

  return repuesto;
}

// ═══════════════════════════════════════════════════════════════
// EDITAR REPUESTO
// ═══════════════════════════════════════════════════════════════

export async function editarRepuesto(input: EditarRepuestoInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.reparacionRepuesto.findFirst({
    where: { id: input.id },
    select: {
      id: true,
      reparacion: { select: { estado: true } },
    },
  });
  if (!actual) {
    throw new NotFoundError('Repuesto no encontrado');
  }
  if (actual.reparacion.estado === 'COMPLETADA') {
    throw new BusinessRuleError(
      'No se pueden editar repuestos de una reparación completada',
    );
  }

  const subtotal = round2(input.cantidad * input.costoUnitario);

  return client.reparacionRepuesto.update({
    where: { id: input.id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      cantidad: input.cantidad,
      costoUnitario: new Prisma.Decimal(input.costoUnitario),
      subtotal: new Prisma.Decimal(subtotal),
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR REPUESTO
// ═══════════════════════════════════════════════════════════════

export async function eliminarRepuesto(
  input: EliminarRepuestoInput,
  ctx: Ctx = {},
): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.reparacionRepuesto.findFirst({
    where: { id: input.id },
    select: {
      id: true,
      reparacion: { select: { estado: true } },
    },
  });
  if (!actual) {
    throw new NotFoundError('Repuesto no encontrado');
  }
  if (actual.reparacion.estado === 'COMPLETADA') {
    throw new BusinessRuleError(
      'No se pueden eliminar repuestos de una reparación completada',
    );
  }

  await client.reparacionRepuesto.delete({ where: { id: input.id } });
}
