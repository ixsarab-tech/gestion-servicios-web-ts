import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';
import type { PaginatedResult } from '@/shared/types/pagination';
import { buildPaginatedResult } from '@/shared/utils/pagination';

import type { CrearCategoriaInput, EditarCategoriaInput, FiltrosCategoriaInput } from '../schemas';
import type { CategoriaResumen } from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

export async function crearCategoria(input: CrearCategoriaInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const existe = await client.catCategoriaEquipo.findFirst({
    where: { nombre: input.nombre },
    select: { id: true },
  });
  if (existe) {
    throw new ConflictError(`Ya existe una categoría con el nombre "${input.nombre}"`);
  }

  const data: Prisma.CatCategoriaEquipoUncheckedCreateInput = {
    tenantId,
    nombre: input.nombre,
    descripcion: input.descripcion ?? null,
    activo: true,
  };

  return client.catCategoriaEquipo.create({ data });
}

export async function editarCategoria(input: EditarCategoriaInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.catCategoriaEquipo.findFirst({
    where: { id: input.id },
    select: { id: true, nombre: true },
  });
  if (!actual) {
    throw new NotFoundError('Categoría no encontrada');
  }

  if (input.nombre !== actual.nombre) {
    const existe = await client.catCategoriaEquipo.findFirst({
      where: { nombre: input.nombre, id: { not: input.id } },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe otra categoría con el nombre "${input.nombre}"`);
    }
  }

  return client.catCategoriaEquipo.update({
    where: { id: input.id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
    },
  });
}

export async function eliminarCategoria(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.catCategoriaEquipo.findFirst({
    where: { id },
    select: { id: true },
  });
  if (!actual) {
    throw new NotFoundError('Categoría no encontrada');
  }

  await client.catCategoriaEquipo.update({
    where: { id },
    data: { activo: false },
  });
}

export async function obtenerCategoria(id: string) {
  return prisma.catCategoriaEquipo.findFirst({ where: { id } });
}

export async function listarCategorias(
  filtros: FiltrosCategoriaInput,
): Promise<PaginatedResult<CategoriaResumen>> {
  const { busqueda, activo, page, pageSize } = filtros;

  const where: Prisma.CatCategoriaEquipoWhereInput = {};
  if (activo !== undefined) where.activo = activo;
  if (busqueda) where.nombre = { contains: busqueda };

  const skip = (page - 1) * pageSize;

  const [categorias, total] = await Promise.all([
    prisma.catCategoriaEquipo.findMany({
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
        _count: { select: { equipos: true } },
      },
    }),
    prisma.catCategoriaEquipo.count({ where }),
  ]);

  const items: CategoriaResumen[] = categorias.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion,
    activo: c.activo,
    createdAt: c.createdAt,
    totalEquipos: c._count.equipos,
  }));

  return buildPaginatedResult(items, total, { page, pageSize });
}

