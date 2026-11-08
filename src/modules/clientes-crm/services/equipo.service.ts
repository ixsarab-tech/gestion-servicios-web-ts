import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';

import type { CrearEquipoInput, EditarEquipoInput } from '../schemas';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export async function crearEquipo(input: CrearEquipoInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  // Verificar cliente
  const cliente = await client.cliente.findFirst({
    where: { id: input.clienteId, deletedAt: null },
    select: { id: true },
  });
  if (!cliente) {
    throw new NotFoundError('Cliente no encontrado');
  }

  // Verificar numeroSerie único (si viene)
  if (input.numeroSerie) {
    const existe = await client.clienteEquipo.findFirst({
      where: { numeroSerie: input.numeroSerie, activo: true },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe un equipo con el número de serie "${input.numeroSerie}"`);
    }
  }

  const data: Prisma.ClienteEquipoUncheckedCreateInput = {
    tenantId,
    clienteId: input.clienteId,
    categoriaId: input.categoriaId ?? null,
    marcaId: input.marcaId ?? null,
    modelo: input.modelo ?? null,
    numeroSerie: input.numeroSerie ?? null,
    descripcion: input.descripcion ?? null,
    fechaAdquisicion: input.fechaAdquisicion ?? null,
    observaciones: input.observaciones ?? null,
    activo: true,
  };

  return client.clienteEquipo.create({ data });
}

// ═══════════════════════════════════════════════════════════════
// EDITAR
// ═══════════════════════════════════════════════════════════════

export async function editarEquipo(input: EditarEquipoInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.clienteEquipo.findFirst({
    where: { id: input.id, activo: true },
    select: { id: true, numeroSerie: true },
  });
  if (!actual) {
    throw new NotFoundError('Equipo no encontrado');
  }

  // Verificar numeroSerie único si cambia
  if (input.numeroSerie && input.numeroSerie !== actual.numeroSerie) {
    const existe = await client.clienteEquipo.findFirst({
      where: { numeroSerie: input.numeroSerie, activo: true, id: { not: input.id } },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(
        `Ya existe otro equipo con el número de serie "${input.numeroSerie}"`,
      );
    }
  }

  const data: Prisma.ClienteEquipoUncheckedUpdateInput = {
    categoriaId: input.categoriaId ?? null,
    marcaId: input.marcaId ?? null,
    modelo: input.modelo ?? null,
    numeroSerie: input.numeroSerie ?? null,
    descripcion: input.descripcion ?? null,
    fechaAdquisicion: input.fechaAdquisicion ?? null,
    observaciones: input.observaciones ?? null,
  };

  return client.clienteEquipo.update({
    where: { id: input.id },
    data,
  });
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR (soft delete)
// ═══════════════════════════════════════════════════════════════

export async function eliminarEquipo(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.clienteEquipo.findFirst({
    where: { id, activo: true },
    select: { id: true },
  });
  if (!actual) {
    throw new NotFoundError('Equipo no encontrado');
  }

  await client.clienteEquipo.update({
    where: { id },
    data: { activo: false },
  });
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO
// ═══════════════════════════════════════════════════════════════

export async function obtenerEquipo(id: string) {
  return prisma.clienteEquipo.findFirst({
    where: { id, activo: true },
    include: {
      categoria: { select: { id: true, nombre: true } },
      marca: { select: { id: true, nombre: true } },
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// LISTAR POR CLIENTE
// ═══════════════════════════════════════════════════════════════

export async function listarEquiposDeCliente(clienteId: string) {
  return prisma.clienteEquipo.findMany({
    where: { clienteId, activo: true },
    include: {
      categoria: { select: { id: true, nombre: true } },
      marca: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
