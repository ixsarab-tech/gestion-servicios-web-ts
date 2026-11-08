import { Prisma } from '@/generated/prisma/client';
import { calcularIVA } from '@/shared/constants/impuestos';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';
import type { PaginatedResult } from '@/shared/types/pagination';
import { buildPaginatedResult } from '@/shared/utils/pagination';

import type {
  CrearCotizacionInput,
  EditarCotizacionInput,
  FiltrosCotizacionInput,
} from '../schemas';
import type {
  CotizacionConRelaciones,
  CotizacionItemResumen,
  CotizacionResumen,
} from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export async function crearCotizacion(input: CrearCotizacionInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  // 1. Orden existe y en estado válido
  const orden = await client.ordenServicio.findFirst({
    where: { id: input.ordenId },
    select: { id: true, estado: true },
  });
  if (!orden) {
    throw new NotFoundError('Orden no encontrada');
  }
  const estadosPermitidos = ['EN_DIAGNOSTICO', 'PRESUPUESTADO'];
  if (!estadosPermitidos.includes(orden.estado)) {
    throw new BusinessRuleError(
      `No se puede cotizar una orden en estado "${orden.estado}"`,
    );
  }

  // 2. No debe haber otra cotización activa
  const activa = await client.cotizacion.findFirst({
    where: {
      ordenId: input.ordenId,
      estado: { in: ['BORRADOR', 'ENVIADA'] },
    },
    select: { id: true, estado: true },
  });
  if (activa) {
    throw new ConflictError(
      `Ya existe una cotización activa (${activa.estado}) para esta orden`,
    );
  }

  // 3. Diagnóstico opcional debe existir
  if (input.diagnosticoId) {
    const diag = await client.diagnostico.findFirst({
      where: { id: input.diagnosticoId },
      select: { id: true },
    });
    if (!diag) {
      throw new NotFoundError('Diagnóstico no encontrado');
    }
  }

  // 4. Calcular totales
  const itemsConSubtotal = input.items.map((item, idx) => ({
    concepto: item.concepto,
    descripcion: item.descripcion ?? null,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: round2(item.cantidad * item.precioUnitario),
    orden: idx,
  }));
  const subtotal = round2(itemsConSubtotal.reduce((s, i) => s + i.subtotal, 0));
  const iva = calcularIVA(subtotal);
  const total = round2(subtotal + iva);

  // 5. Crear cotización
  const data: Prisma.CotizacionUncheckedCreateInput = {
    tenantId,
    ordenId: input.ordenId,
    diagnosticoId: input.diagnosticoId ?? null,
    estado: 'BORRADOR',
    subtotal: new Prisma.Decimal(subtotal),
    iva: new Prisma.Decimal(iva),
    total: new Prisma.Decimal(total),
    moneda: input.moneda,
    notas: input.notas ?? null,
    validaHasta: input.validaHasta ?? null,
  };
  const cotizacion = await client.cotizacion.create({ data });

  // 6. Insertar items
  await client.cotizacionItem.createMany({
    data: itemsConSubtotal.map((i) => ({
      tenantId,
      cotizacionId: cotizacion.id,
      concepto: i.concepto,
      descripcion: i.descripcion,
      cantidad: new Prisma.Decimal(i.cantidad),
      precioUnitario: new Prisma.Decimal(i.precioUnitario),
      subtotal: new Prisma.Decimal(i.subtotal),
      orden: i.orden,
    })),
  });

  return cotizacion;
}

// ═══════════════════════════════════════════════════════════════
// EDITAR (solo BORRADOR)
// ═══════════════════════════════════════════════════════════════

export async function editarCotizacion(input: EditarCotizacionInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.cotizacion.findFirst({
    where: { id: input.id },
    select: { id: true, estado: true },
  });
  if (!actual) {
    throw new NotFoundError('Cotización no encontrada');
  }
  if (actual.estado !== 'BORRADOR') {
    throw new BusinessRuleError(
      `No se puede editar una cotización en estado "${actual.estado}"`,
    );
  }

  const data: Prisma.CotizacionUncheckedUpdateInput = {};
  if (input.notas !== undefined) data.notas = input.notas ?? null;
  if (input.validaHasta !== undefined) data.validaHasta = input.validaHasta ?? null;
  if (input.moneda !== undefined) data.moneda = input.moneda;

  return client.cotizacion.update({ where: { id: input.id }, data });
}

// ═══════════════════════════════════════════════════════════════
// ENVIAR (BORRADOR → ENVIADA)
// ═══════════════════════════════════════════════════════════════

export async function enviarCotizacion(id: string, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.cotizacion.findFirst({
    where: { id },
    select: { id: true, estado: true },
  });
  if (!actual) {
    throw new NotFoundError('Cotización no encontrada');
  }
  if (actual.estado !== 'BORRADOR') {
    throw new BusinessRuleError(
      `Solo se pueden enviar cotizaciones en BORRADOR. Estado actual: ${actual.estado}`,
    );
  }

  return client.cotizacion.update({
    where: { id },
    data: { estado: 'ENVIADA', enviadaEn: new Date() },
  });
}

// ═══════════════════════════════════════════════════════════════
// APROBAR (ENVIADA → APROBADA, orden → APROBADO)
// ═══════════════════════════════════════════════════════════════

export async function aprobarCotizacion(id: string, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const actual = await client.cotizacion.findFirst({
    where: { id },
    select: { id: true, estado: true, ordenId: true },
  });
  if (!actual) {
    throw new NotFoundError('Cotización no encontrada');
  }
  if (actual.estado !== 'ENVIADA') {
    throw new BusinessRuleError(
      `Solo se pueden aprobar cotizaciones ENVIADAS. Estado actual: ${actual.estado}`,
    );
  }

  const cotizacion = await client.cotizacion.update({
    where: { id },
    data: { estado: 'APROBADA', respondidaEn: new Date() },
  });

  // Acoplamiento: si la orden está en PRESUPUESTADO → APROBADO
  const orden = await client.ordenServicio.findFirst({
    where: { id: actual.ordenId },
    select: { estado: true },
  });
  if (orden?.estado === 'PRESUPUESTADO') {
    await client.ordenServicio.update({
      where: { id: actual.ordenId },
      data: { estado: 'APROBADO' },
    });
    await client.ordenEstadoHistorial.create({
      data: {
        tenantId,
        ordenId: actual.ordenId,
        estadoAnterior: 'PRESUPUESTADO',
        estadoNuevo: 'APROBADO',
        comentario: 'Cotización aprobada por el cliente',
      },
    });
  }

  return cotizacion;
}

// ═══════════════════════════════════════════════════════════════
// RECHAZAR (ENVIADA → RECHAZADA, orden → EN_DIAGNOSTICO)
// ═══════════════════════════════════════════════════════════════

export async function rechazarCotizacion(
  id: string,
  motivo: string,
  ctx: Ctx = {},
) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const actual = await client.cotizacion.findFirst({
    where: { id },
    select: { id: true, estado: true, ordenId: true, notas: true },
  });
  if (!actual) {
    throw new NotFoundError('Cotización no encontrada');
  }
  if (actual.estado !== 'ENVIADA') {
    throw new BusinessRuleError(
      `Solo se pueden rechazar cotizaciones ENVIADAS. Estado actual: ${actual.estado}`,
    );
  }

  const notaRechazo = `[RECHAZADA: ${motivo}]${actual.notas ? `\n\n${actual.notas}` : ''}`;

  const cotizacion = await client.cotizacion.update({
    where: { id },
    data: {
      estado: 'RECHAZADA',
      respondidaEn: new Date(),
      notas: notaRechazo,
    },
  });

  // Acoplamiento: orden vuelve a EN_DIAGNOSTICO (permite re-cotizar)
  const orden = await client.ordenServicio.findFirst({
    where: { id: actual.ordenId },
    select: { estado: true },
  });
  if (orden?.estado === 'PRESUPUESTADO') {
    await client.ordenServicio.update({
      where: { id: actual.ordenId },
      data: { estado: 'EN_DIAGNOSTICO' },
    });
    await client.ordenEstadoHistorial.create({
      data: {
        tenantId,
        ordenId: actual.ordenId,
        estadoAnterior: 'PRESUPUESTADO',
        estadoNuevo: 'EN_DIAGNOSTICO',
        comentario: `Cotización rechazada: ${motivo}`,
      },
    });
  }

  return cotizacion;
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR (solo BORRADOR, hard delete con cascade de items)
// ═══════════════════════════════════════════════════════════════

export async function eliminarCotizacion(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.cotizacion.findFirst({
    where: { id },
    select: { id: true, estado: true },
  });
  if (!actual) {
    throw new NotFoundError('Cotización no encontrada');
  }
  if (actual.estado !== 'BORRADOR') {
    throw new BusinessRuleError(
      `Solo se pueden eliminar cotizaciones en BORRADOR. Estado actual: ${actual.estado}`,
    );
  }

  await client.cotizacion.delete({ where: { id } });
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO (con relaciones)
// ═══════════════════════════════════════════════════════════════

export async function obtenerCotizacion(id: string): Promise<CotizacionConRelaciones | null> {
  const c = await prisma.cotizacion.findFirst({
    where: { id },
    include: {
      orden: { select: { id: true, folio: true, estado: true } },
      diagnostico: { select: { id: true } },
      items: { orderBy: { orden: 'asc' } },
      _count: { select: { items: true } },
    },
  });
  if (!c) return null;

  return mapToConRelaciones(c);
}

// ═══════════════════════════════════════════════════════════════
// LISTAR POR ORDEN
// ═══════════════════════════════════════════════════════════════

export async function listarCotizacionesDeOrden(
  ordenId: string,
): Promise<CotizacionConRelaciones[]> {
  const rows = await prisma.cotizacion.findMany({
    where: { ordenId },
    include: {
      orden: { select: { id: true, folio: true, estado: true } },
      diagnostico: { select: { id: true } },
      items: { orderBy: { orden: 'asc' } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map(mapToConRelaciones);
}

// ═══════════════════════════════════════════════════════════════
// LISTAR PAGINADO
// ═══════════════════════════════════════════════════════════════

export async function listarCotizaciones(
  filtros: FiltrosCotizacionInput,
): Promise<PaginatedResult<CotizacionResumen>> {
  const { estado, ordenId, page, pageSize } = filtros;

  const where: Prisma.CotizacionWhereInput = {};
  if (estado) where.estado = estado;
  if (ordenId) where.ordenId = ordenId;

  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.cotizacion.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        orden: { select: { id: true, folio: true, estado: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.cotizacion.count({ where }),
  ]);

  const items: CotizacionResumen[] = rows.map((c) => ({
    id: c.id,
    estado: c.estado,
    subtotal: Number(c.subtotal),
    iva: Number(c.iva),
    total: Number(c.total),
    moneda: c.moneda,
    notas: c.notas,
    validaHasta: c.validaHasta,
    enviadaEn: c.enviadaEn,
    respondidaEn: c.respondidaEn,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    totalItems: c._count.items,
  }));

  return buildPaginatedResult(items, total, { page, pageSize });
}

// ═══════════════════════════════════════════════════════════════
// MAPPER PRIVADO
// ═══════════════════════════════════════════════════════════════

type CotizacionWithRelations = Prisma.CotizacionGetPayload<{
  include: {
    orden: { select: { id: true; folio: true; estado: true } };
    diagnostico: { select: { id: true } };
    items: true;
    _count: { select: { items: true } };
  };
}>;

function mapToConRelaciones(c: CotizacionWithRelations): CotizacionConRelaciones {
  return {
    id: c.id,
    estado: c.estado,
    subtotal: Number(c.subtotal),
    iva: Number(c.iva),
    total: Number(c.total),
    moneda: c.moneda,
    notas: c.notas,
    validaHasta: c.validaHasta,
    enviadaEn: c.enviadaEn,
    respondidaEn: c.respondidaEn,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    totalItems: c._count.items,
    orden: c.orden,
    diagnostico: c.diagnostico,
    items: c.items.map<CotizacionItemResumen>((i) => ({
      id: i.id,
      concepto: i.concepto,
      descripcion: i.descripcion,
      cantidad: Number(i.cantidad),
      precioUnitario: Number(i.precioUnitario),
      subtotal: Number(i.subtotal),
      orden: i.orden,
    })),
  };
}
