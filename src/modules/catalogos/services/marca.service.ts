import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';
import type { PaginatedResult } from '@/shared/types/pagination';
import { buildPaginatedResult } from '@/shared/utils/pagination';

import type { CrearMarcaInput, EditarMarcaInput, FiltrosMarcaInput } from '../schemas';
import type { MarcaResumen } from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export async function crearMarca(input: CrearMarcaInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const existe = await client.catMarca.findFirst({
    where: { nombre: input.nombre },
    select: { id: true },
  });
  if (existe) {
    throw new ConflictError(`Ya existe una marca con el nombre "${input.nombre}"`);
  }

  const data: Prisma.CatMarcaUncheckedCreateInput = {
    tenantId,
    nombre: input.nombre,
    activo: true,
  };

  return client.catMarca.create({ data });
}

// ═══════════════════════════════════════════════════════════════
// EDITAR
// ═══════════════════════════════════════════════════════════════

export async function editarMarca(input: EditarMarcaInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.catMarca.findFirst({
    where: { id: input.id },
    select: { id: true, nombre: true },
  });
  if (!actual) {
    throw new NotFoundError('Marca no encontrada');
  }

  if (input.nombre !== actual.nombre) {
    const existe = await client.catMarca.findFirst({
      where: { nombre: input.nombre, id: { not: input.id } },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe otra marca con el nombre "${input.nombre}"`);
    }
  }

  return client.catMarca.update({
    where: { id: input.id },
    data: { nombre: input.nombre },
  });
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR (soft delete)
// ═══════════════════════════════════════════════════════════════

export async function eliminarMarca(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.catMarca.findFirst({
    where: { id },
    select: { id: true },
  });
  if (!actual) {
    throw new NotFoundError('Marca no encontrada');
  }

  await client.catMarca.update({
    where: { id },
    data: { activo: false },
  });
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO
// ═══════════════════════════════════════════════════════════════

export async function obtenerMarca(id: string) {
  return prisma.catMarca.findFirst({ where: { id } });
}

// ═══════════════════════════════════════════════════════════════
// LISTAR (paginado)
// ═══════════════════════════════════════════════════════════════

export async function listarMarcas(
  filtros: FiltrosMarcaInput,
): Promise<PaginatedResult<MarcaResumen>> {
  const { busqueda, activo, page, pageSize } = filtros;

  const where: Prisma.CatMarcaWhereInput = {};
  if (activo !== undefined) where.activo = activo;
  if (busqueda) where.nombre = { contains: busqueda };

  const skip = (page - 1) * pageSize;

  const [marcas, total] = await Promise.all([
    prisma.catMarca.findMany({
      where,
      orderBy: { nombre: 'asc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        nombre: true,
        activo: true,
        createdAt: true,
        _count: { select: { equipos: true } },
      },
    }),
    prisma.catMarca.count({ where }),
  ]);

  const items: MarcaResumen[] = marcas.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    activo: m.activo,
    createdAt: m.createdAt,
    totalEquipos: m._count.equipos,
  }));

  return buildPaginatedResult(items, total, { page, pageSize });
}
