import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';
import type { PaginatedResult } from '@/shared/types/pagination';
import { buildPaginatedResult } from '@/shared/utils/pagination';

import type {
  CrearTipoServicioInput,
  EditarTipoServicioInput,
  FiltrosTipoServicioInput,
} from '../schemas';
import type { TipoServicioResumen } from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export async function crearTipoServicio(input: CrearTipoServicioInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const existe = await client.catTipoServicio.findFirst({
    where: { nombre: input.nombre },
    select: { id: true },
  });
  if (existe) {
    throw new ConflictError(`Ya existe un tipo de servicio con el nombre "${input.nombre}"`);
  }

  const data: Prisma.CatTipoServicioUncheckedCreateInput = {
    tenantId,
    nombre: input.nombre,
    descripcion: input.descripcion ?? null,
    activo: true,
  };

  return client.catTipoServicio.create({ data });
}

// ═══════════════════════════════════════════════════════════════
// EDITAR
// ═══════════════════════════════════════════════════════════════

export async function editarTipoServicio(input: EditarTipoServicioInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.catTipoServicio.findFirst({
    where: { id: input.id },
    select: { id: true, nombre: true },
  });
  if (!actual) {
    throw new NotFoundError('Tipo de servicio no encontrado');
  }

  if (input.nombre !== actual.nombre) {
    const existe = await client.catTipoServicio.findFirst({
      where: { nombre: input.nombre, id: { not: input.id } },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe otro tipo de servicio con el nombre "${input.nombre}"`);
    }
  }

  return client.catTipoServicio.update({
    where: { id: input.id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR (soft delete)
// ═══════════════════════════════════════════════════════════════

export async function eliminarTipoServicio(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.catTipoServicio.findFirst({
    where: { id },
    select: { id: true },
  });
  if (!actual) {
    throw new NotFoundError('Tipo de servicio no encontrado');
  }

  await client.catTipoServicio.update({
    where: { id },
    data: { activo: false },
  });
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO
// ═══════════════════════════════════════════════════════════════

export async function obtenerTipoServicio(id: string) {
  return prisma.catTipoServicio.findFirst({ where: { id } });
}

// ═══════════════════════════════════════════════════════════════
// LISTAR
// ═══════════════════════════════════════════════════════════════

export async function listarTiposServicio(
  filtros: FiltrosTipoServicioInput,
): Promise<PaginatedResult<TipoServicioResumen>> {
  const { busqueda, activo, page, pageSize } = filtros;

  const where: Prisma.CatTipoServicioWhereInput = {};
  if (activo !== undefined) where.activo = activo;
  if (busqueda) where.nombre = { contains: busqueda };

  const skip = (page - 1) * pageSize;

  const [tipos, total] = await Promise.all([
    prisma.catTipoServicio.findMany({
      where,
      orderBy: { nombre: 'asc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
        createdAt: true,
      },
    }),
    prisma.catTipoServicio.count({ where }),
  ]);

  const items: TipoServicioResumen[] = tipos.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    activo: t.activo,
    createdAt: t.createdAt,
  }));

  return buildPaginatedResult(items, total, { page, pageSize });
}

