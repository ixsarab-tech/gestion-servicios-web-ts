import { Prisma } from '@/generated/prisma/client';
import { calcularIVA } from '@/shared/constants/impuestos';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';

import type {
  AgregarItemInput,
  EditarCotizacionItemInput,
  EliminarCotizacionItemInput,
} from '../schemas';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════
// HELPER: recalcular totales de la cotización desde sus items
// ═══════════════════════════════════════════════════════════════

export async function recalcularTotales(
  cotizacionId: string,
  ctx: Ctx = {},
): Promise<void> {
  const client = ctx.tx ?? prisma;

  const items = await client.cotizacionItem.findMany({
    where: { cotizacionId },
    select: { subtotal: true },
  });

  const subtotal = round2(items.reduce((sum, i) => sum + Number(i.subtotal), 0));
  const iva = calcularIVA(subtotal);
  const total = round2(subtotal + iva);

  await client.cotizacion.update({
    where: { id: cotizacionId },
    data: {
      subtotal: new Prisma.Decimal(subtotal),
      iva: new Prisma.Decimal(iva),
      total: new Prisma.Decimal(total),
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// AGREGAR ITEM
// ═══════════════════════════════════════════════════════════════

export async function agregarItem(input: AgregarItemInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const cotizacion = await client.cotizacion.findFirst({
    where: { id: input.cotizacionId },
    select: { id: true, estado: true },
  });
  if (!cotizacion) {
    throw new NotFoundError('Cotización no encontrada');
  }
  if (cotizacion.estado !== 'BORRADOR') {
    throw new BusinessRuleError(
      `No se pueden agregar items a una cotización en estado "${cotizacion.estado}"`,
    );
  }

  const subtotalItem = round2(input.cantidad * input.precioUnitario);

  const item = await client.cotizacionItem.create({
    data: {
      tenantId,
      cotizacionId: input.cotizacionId,
      concepto: input.concepto,
      descripcion: input.descripcion ?? null,
      cantidad: new Prisma.Decimal(input.cantidad),
      precioUnitario: new Prisma.Decimal(input.precioUnitario),
      subtotal: new Prisma.Decimal(subtotalItem),
      orden: input.orden ?? 0,
    },
  });

  await recalcularTotales(input.cotizacionId, { tx: ctx.tx });

  return item;
}

// ═══════════════════════════════════════════════════════════════
// EDITAR ITEM
// ═══════════════════════════════════════════════════════════════

export async function editarItem(input: EditarCotizacionItemInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.cotizacionItem.findFirst({
    where: { id: input.id },
    select: {
      id: true,
      cotizacionId: true,
      cotizacion: { select: { estado: true } },
    },
  });
  if (!actual) {
    throw new NotFoundError('Item no encontrado');
  }
  if (actual.cotizacion.estado !== 'BORRADOR') {
    throw new BusinessRuleError(
      `No se pueden editar items de una cotización en estado "${actual.cotizacion.estado}"`,
    );
  }

  const subtotalItem = round2(input.cantidad * input.precioUnitario);

  const item = await client.cotizacionItem.update({
    where: { id: input.id },
    data: {
      concepto: input.concepto,
      descripcion: input.descripcion ?? null,
      cantidad: new Prisma.Decimal(input.cantidad),
      precioUnitario: new Prisma.Decimal(input.precioUnitario),
      subtotal: new Prisma.Decimal(subtotalItem),
      ...(input.orden !== undefined ? { orden: input.orden } : {}),
    },
  });

  await recalcularTotales(actual.cotizacionId, { tx: ctx.tx });

  return item;
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR ITEM
// ═══════════════════════════════════════════════════════════════

export async function eliminarItem(
  input: EliminarCotizacionItemInput,
  ctx: Ctx = {},
): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.cotizacionItem.findFirst({
    where: { id: input.id },
    select: {
      id: true,
      cotizacionId: true,
      cotizacion: { select: { estado: true } },
    },
  });
  if (!actual) {
    throw new NotFoundError('Item no encontrado');
  }
  if (actual.cotizacion.estado !== 'BORRADOR') {
    throw new BusinessRuleError(
      `No se pueden eliminar items de una cotización en estado "${actual.cotizacion.estado}"`,
    );
  }

  const count = await client.cotizacionItem.count({
    where: { cotizacionId: actual.cotizacionId },
  });
  if (count <= 1) {
    throw new BusinessRuleError(
      'No se puede eliminar el único item. Agrega otro antes o elimina la cotización completa.',
    );
  }

  await client.cotizacionItem.delete({ where: { id: input.id } });

  await recalcularTotales(actual.cotizacionId, { tx: ctx.tx });
}
