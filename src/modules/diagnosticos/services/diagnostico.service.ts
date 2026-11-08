import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';

import type {
  CompletarDiagnosticoInput,
  CrearDiagnosticoInput,
  EditarDiagnosticoInput,
} from '../schemas';
import type { DiagnosticoConRelaciones } from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export async function crearDiagnostico(
  input: CrearDiagnosticoInput,
  usuarioId: string,
  ctx: Ctx = {},
) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  // Verificar que la orden existe y está en estado válido
  const orden = await client.ordenServicio.findFirst({
    where: { id: input.ordenId },
    select: { id: true, estado: true },
  });
  if (!orden) {
    throw new NotFoundError('Orden no encontrada');
  }

  const estadosPermitidos = ['RECIBIDO', 'EN_DIAGNOSTICO'];
  if (!estadosPermitidos.includes(orden.estado)) {
    throw new BusinessRuleError(
      `No se puede crear un diagnóstico en una orden en estado "${orden.estado}"`,
    );
  }

  // Verificar que no exista un diagnóstico activo (BORRADOR o EN_PROCESO)
  const activo = await client.diagnostico.findFirst({
    where: {
      ordenId: input.ordenId,
      estado: { in: ['BORRADOR', 'EN_PROCESO'] },
    },
    select: { id: true },
  });
  if (activo) {
    throw new ConflictError('Ya existe un diagnóstico activo para esta orden');
  }

  const data: Prisma.DiagnosticoUncheckedCreateInput = {
    tenantId,
    ordenId: input.ordenId,
    tecnicoId: usuarioId,
    estado: 'EN_PROCESO',
    pruebasRealizadas: input.pruebasRealizadas ?? null,
    voltajesMedidos: input.voltajesMedidos ?? null,
    componentesDanados: input.componentesDanados ?? null,
    observaciones: input.observaciones ?? null,
    fechaInicio: new Date(),
  };

  const diagnostico = await client.diagnostico.create({ data });

  // ─── Acoplamiento orden ← diagnóstico ───
  // Si la orden está en RECIBIDO, avanzar a EN_DIAGNOSTICO
  if (orden.estado === 'RECIBIDO') {
    await client.ordenServicio.update({
      where: { id: input.ordenId },
      data: { estado: 'EN_DIAGNOSTICO' },
    });

    await client.ordenEstadoHistorial.create({
      data: {
        tenantId,
        ordenId: input.ordenId,
        estadoAnterior: 'RECIBIDO',
        estadoNuevo: 'EN_DIAGNOSTICO',
        comentario: 'Diagnóstico iniciado',
      },
    });
  }

  return diagnostico;
}

// ═══════════════════════════════════════════════════════════════
// EDITAR
// ═══════════════════════════════════════════════════════════════

export async function editarDiagnostico(input: EditarDiagnosticoInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.diagnostico.findFirst({
    where: { id: input.id },
    select: { id: true, estado: true },
  });
  if (!actual) {
    throw new NotFoundError('Diagnóstico no encontrado');
  }

  if (actual.estado === 'COMPLETADO') {
    throw new BusinessRuleError('No se puede editar un diagnóstico completado');
  }

  const data: Prisma.DiagnosticoUncheckedUpdateInput = {};
  if (input.pruebasRealizadas !== undefined) {
    data.pruebasRealizadas = input.pruebasRealizadas ?? null;
  }
  if (input.voltajesMedidos !== undefined) {
    data.voltajesMedidos = input.voltajesMedidos ?? null;
  }
  if (input.componentesDanados !== undefined) {
    data.componentesDanados = input.componentesDanados ?? null;
  }
  if (input.observaciones !== undefined) {
    data.observaciones = input.observaciones ?? null;
  }
  if (input.conclusion !== undefined) {
    data.conclusion = input.conclusion ?? null;
  }

  return client.diagnostico.update({
    where: { id: input.id },
    data,
  });
}

// ═══════════════════════════════════════════════════════════════
// COMPLETAR (bloquea edición futura + avanza la orden)
// ═══════════════════════════════════════════════════════════════

export async function completarDiagnostico(input: CompletarDiagnosticoInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const actual = await client.diagnostico.findFirst({
    where: { id: input.id },
    select: { id: true, estado: true, ordenId: true },
  });
  if (!actual) {
    throw new NotFoundError('Diagnóstico no encontrado');
  }

  if (actual.estado === 'COMPLETADO') {
    throw new BusinessRuleError('El diagnóstico ya está completado');
  }

  const diagnostico = await client.diagnostico.update({
    where: { id: input.id },
    data: {
      estado: 'COMPLETADO',
      conclusion: input.conclusion,
      fechaFin: new Date(),
    },
  });

  // ─── Acoplamiento orden ← diagnóstico ───
  // Si la orden está en EN_DIAGNOSTICO, avanzar a PRESUPUESTADO
  const orden = await client.ordenServicio.findFirst({
    where: { id: actual.ordenId },
    select: { estado: true },
  });

  if (orden?.estado === 'EN_DIAGNOSTICO') {
    await client.ordenServicio.update({
      where: { id: actual.ordenId },
      data: { estado: 'PRESUPUESTADO' },
    });

    await client.ordenEstadoHistorial.create({
      data: {
        tenantId,
        ordenId: actual.ordenId,
        estadoAnterior: 'EN_DIAGNOSTICO',
        estadoNuevo: 'PRESUPUESTADO',
        comentario: 'Diagnóstico completado',
      },
    });
  }

  return diagnostico;
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO
// ═══════════════════════════════════════════════════════════════

export async function obtenerDiagnostico(id: string): Promise<DiagnosticoConRelaciones | null> {
  const diag = await prisma.diagnostico.findFirst({
    where: { id },
    include: {
      tecnico: { select: { id: true, nombre: true, apellidos: true } },
      evidencias: { orderBy: { createdAt: 'desc' } },
    },
  });

  return diag as DiagnosticoConRelaciones | null;
}

// ═══════════════════════════════════════════════════════════════
// LISTAR POR ORDEN
// ═══════════════════════════════════════════════════════════════

export async function listarDiagnosticosDeOrden(
  ordenId: string,
): Promise<DiagnosticoConRelaciones[]> {
  const diagnosticos = await prisma.diagnostico.findMany({
    where: { ordenId },
    include: {
      tecnico: { select: { id: true, nombre: true, apellidos: true } },
      evidencias: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return diagnosticos as DiagnosticoConRelaciones[];
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR (solo si está en BORRADOR)
// ═══════════════════════════════════════════════════════════════

export async function eliminarDiagnostico(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.diagnostico.findFirst({
    where: { id },
    select: { id: true, estado: true },
  });
  if (!actual) {
    throw new NotFoundError('Diagnóstico no encontrado');
  }

  if (actual.estado !== 'BORRADOR') {
    throw new BusinessRuleError('Solo se pueden eliminar diagnósticos en estado BORRADOR');
  }

  await client.diagnostico.delete({ where: { id } });
}
