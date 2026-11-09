import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';
import type { PaginatedResult } from '@/shared/types/pagination';
import { buildPaginatedResult } from '@/shared/utils/pagination';

import type {
  CompletarReparacionInput,
  CrearReparacionInput,
  EditarReparacionInput,
  FiltrosReparacionInput,
} from '../schemas';
import type {
  ReparacionConRelaciones,
  ReparacionResumen,
  RepuestoResumen,
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

export async function crearReparacion(
  input: CrearReparacionInput,
  usuarioId: string,
  ctx: Ctx = {},
) {
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
  const estadosPermitidos = ['APROBADO', 'REPARANDO'];
  if (!estadosPermitidos.includes(orden.estado)) {
    throw new BusinessRuleError(
      `No se puede crear una reparación en una orden en estado "${orden.estado}"`,
    );
  }

  // 2. No debe existir otra reparación (1:1)
  const existente = await client.reparacion.findFirst({
    where: { ordenId: input.ordenId },
    select: { id: true },
  });
  if (existente) {
    throw new ConflictError('Ya existe una reparación para esta orden');
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

  // 4. Técnico: del input o el usuario actual
  const tecnicoId = input.tecnicoId ?? usuarioId;

  // 5. Crear reparación
  const reparacion = await client.reparacion.create({
    data: {
      tenantId,
      ordenId: input.ordenId,
      tecnicoId,
      diagnosticoId: input.diagnosticoId ?? null,
      estado: 'PENDIENTE',
      notas: input.notas ?? null,
    },
  });

  // 6. Acoplamiento: orden APROBADO → REPARANDO
  if (orden.estado === 'APROBADO') {
    await client.ordenServicio.update({
      where: { id: input.ordenId },
      data: { estado: 'REPARANDO' },
    });
    await client.ordenEstadoHistorial.create({
      data: {
        tenantId,
        ordenId: input.ordenId,
        estadoAnterior: 'APROBADO',
        estadoNuevo: 'REPARANDO',
        comentario: 'Reparación iniciada',
      },
    });
  }

  return reparacion;
}

// ═══════════════════════════════════════════════════════════════
// EDITAR (solo si no COMPLETADA)
// ═══════════════════════════════════════════════════════════════

export async function editarReparacion(input: EditarReparacionInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.reparacion.findFirst({
    where: { id: input.id },
    select: { id: true, estado: true },
  });
  if (!actual) {
    throw new NotFoundError('Reparación no encontrada');
  }
  if (actual.estado === 'COMPLETADA') {
    throw new BusinessRuleError('No se puede editar una reparación completada');
  }

  const data: Prisma.ReparacionUncheckedUpdateInput = {};
  if (input.notas !== undefined) data.notas = input.notas ?? null;
  if (input.tecnicoId !== undefined) data.tecnicoId = input.tecnicoId;
  if (input.diagnosticoId !== undefined) data.diagnosticoId = input.diagnosticoId ?? null;

  return client.reparacion.update({ where: { id: input.id }, data });
}

// ═══════════════════════════════════════════════════════════════
// BLOQUEAR
// ═══════════════════════════════════════════════════════════════

export async function bloquearReparacion(
  id: string,
  motivo: string,
  ctx: Ctx = {},
) {
  const client = ctx.tx ?? prisma;

  const actual = await client.reparacion.findFirst({
    where: { id },
    select: { id: true, estado: true, notas: true },
  });
  if (!actual) {
    throw new NotFoundError('Reparación no encontrada');
  }
  if (actual.estado === 'COMPLETADA') {
    throw new BusinessRuleError('No se puede bloquear una reparación completada');
  }
  if (actual.estado === 'BLOQUEADA') {
    throw new BusinessRuleError('La reparación ya está bloqueada');
  }

  const notaBloqueo = `[BLOQUEADA: ${motivo}]${actual.notas ? `\n\n${actual.notas}` : ''}`;

  return client.reparacion.update({
    where: { id },
    data: {
      estado: 'BLOQUEADA',
      notas: notaBloqueo,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// COMPLETAR (requiere EN_PROCESO, acopla orden → LISTO)
// ═══════════════════════════════════════════════════════════════

export async function completarReparacion(
  input: CompletarReparacionInput,
  ctx: Ctx = {},
) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const actual = await client.reparacion.findFirst({
    where: { id: input.id },
    select: { id: true, estado: true, ordenId: true, notas: true },
  });
  if (!actual) {
    throw new NotFoundError('Reparación no encontrada');
  }
  if (actual.estado === 'COMPLETADA') {
    throw new BusinessRuleError('La reparación ya está completada');
  }
  if (actual.estado === 'PENDIENTE') {
    throw new BusinessRuleError(
      'No se puede completar una reparación que no ha iniciado (PENDIENTE)',
    );
  }
  if (actual.estado === 'BLOQUEADA') {
    throw new BusinessRuleError(
      'No se puede completar una reparación bloqueada. Desbloquéala primero.',
    );
  }

  const notasFinales = input.notas
    ? actual.notas
      ? `${actual.notas}\n\n${input.notas}`
      : input.notas
    : actual.notas;

  const reparacion = await client.reparacion.update({
    where: { id: input.id },
    data: {
      estado: 'COMPLETADA',
      notas: notasFinales,
      fechaFin: new Date(),
    },
  });

  // Acoplamiento: orden REPARANDO → LISTO
  const orden = await client.ordenServicio.findFirst({
    where: { id: actual.ordenId },
    select: { estado: true },
  });
  if (orden?.estado === 'REPARANDO') {
    await client.ordenServicio.update({
      where: { id: actual.ordenId },
      data: { estado: 'LISTO' },
    });
    await client.ordenEstadoHistorial.create({
      data: {
        tenantId,
        ordenId: actual.ordenId,
        estadoAnterior: 'REPARANDO',
        estadoNuevo: 'LISTO',
        comentario: 'Reparación completada',
      },
    });
  }

  return reparacion;
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR (solo PENDIENTE, hard delete con cascade de repuestos)
// ═══════════════════════════════════════════════════════════════

export async function eliminarReparacion(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.reparacion.findFirst({
    where: { id },
    select: { id: true, estado: true },
  });
  if (!actual) {
    throw new NotFoundError('Reparación no encontrada');
  }
  if (actual.estado !== 'PENDIENTE') {
    throw new BusinessRuleError(
      `Solo se pueden eliminar reparaciones en PENDIENTE. Estado: ${actual.estado}`,
    );
  }

  await client.reparacion.delete({ where: { id } });
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO (con relaciones)
// ═══════════════════════════════════════════════════════════════

export async function obtenerReparacion(
  id: string,
): Promise<ReparacionConRelaciones | null> {
  const r = await prisma.reparacion.findFirst({
    where: { id },
    include: {
      orden: { select: { id: true, folio: true, estado: true } },
      tecnico: { select: { id: true, nombre: true, apellidos: true } },
      diagnostico: { select: { id: true } },
      repuestos: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!r) return null;

  return mapToConRelaciones(r);
}

// ═══════════════════════════════════════════════════════════════
// LISTAR POR ORDEN
// ═══════════════════════════════════════════════════════════════

export async function listarReparacionesDeOrden(
  ordenId: string,
): Promise<ReparacionConRelaciones[]> {
  const rows = await prisma.reparacion.findMany({
    where: { ordenId },
    include: {
      orden: { select: { id: true, folio: true, estado: true } },
      tecnico: { select: { id: true, nombre: true, apellidos: true } },
      diagnostico: { select: { id: true } },
      repuestos: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map(mapToConRelaciones);
}

// ═══════════════════════════════════════════════════════════════
// LISTAR PAGINADO
// ═══════════════════════════════════════════════════════════════

export async function listarReparaciones(
  filtros: FiltrosReparacionInput,
): Promise<PaginatedResult<ReparacionResumen>> {
  const { estado, ordenId, tecnicoId, page, pageSize } = filtros;

  const where: Prisma.ReparacionWhereInput = {};
  if (estado) where.estado = estado;
  if (ordenId) where.ordenId = ordenId;
  if (tecnicoId) where.tecnicoId = tecnicoId;

  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.reparacion.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        orden: { select: { id: true, folio: true, estado: true } },
        _count: { select: { repuestos: true } },
        repuestos: { select: { subtotal: true } },
      },
    }),
    prisma.reparacion.count({ where }),
  ]);

  const items: ReparacionResumen[] = rows.map((r) => ({
    id: r.id,
    estado: r.estado,
    notas: r.notas,
    fechaInicio: r.fechaInicio,
    fechaFin: r.fechaFin,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    totalRepuestos: r._count.repuestos,
    costoTotal: round2(r.repuestos.reduce((s, rep) => s + Number(rep.subtotal), 0)),
  }));

  return buildPaginatedResult(items, total, { page, pageSize });
}

// ═══════════════════════════════════════════════════════════════
// MAPPER PRIVADO
// ═══════════════════════════════════════════════════════════════

type ReparacionWithRelations = Prisma.ReparacionGetPayload<{
  include: {
    orden: { select: { id: true; folio: true; estado: true } };
    tecnico: { select: { id: true; nombre: true; apellidos: true } };
    diagnostico: { select: { id: true } };
    repuestos: true;
  };
}>;

function mapToConRelaciones(r: ReparacionWithRelations): ReparacionConRelaciones {
  const repuestos: RepuestoResumen[] = r.repuestos.map((rep) => ({
    id: rep.id,
    nombre: rep.nombre,
    descripcion: rep.descripcion,
    cantidad: rep.cantidad,
    costoUnitario: Number(rep.costoUnitario),
    subtotal: Number(rep.subtotal),
    createdAt: rep.createdAt,
  }));

  const costoTotal = round2(repuestos.reduce((s, rep) => s + rep.subtotal, 0));

  return {
    id: r.id,
    estado: r.estado,
    notas: r.notas,
    fechaInicio: r.fechaInicio,
    fechaFin: r.fechaFin,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    totalRepuestos: repuestos.length,
    costoTotal,
    orden: r.orden,
    tecnico: r.tecnico,
    diagnostico: r.diagnostico,
    repuestos,
  };
}
