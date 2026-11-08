import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';
import type { PaginatedResult } from '@/shared/types/pagination';
import { buildPaginatedResult } from '@/shared/utils/pagination';

import type { CrearClienteInput, EditarClienteInput, FiltrosClienteInput } from '../schemas';
import type { ClienteConRelaciones, ClienteResumen } from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export async function crearCliente(
  input: CrearClienteInput,
  ctx: Ctx = {},
): Promise<ClienteConRelaciones> {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  if (input.email) {
    const existe = await client.cliente.findFirst({
      where: { email: input.email, deletedAt: null },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe un cliente con el email ${input.email}`);
    }
  }

  if (input.rfc) {
    const existe = await client.cliente.findFirst({
      where: { rfc: input.rfc, deletedAt: null },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe un cliente con el RFC ${input.rfc}`);
    }
  }

  const data: Prisma.ClienteUncheckedCreateInput = {
    tenantId,
    tipo: input.tipo,
    rfc: input.rfc ?? null,
    razonSocial: input.razonSocial ?? null,
    nombre: input.nombre,
    apellidos: input.apellidos ?? null,
    email: input.email ?? null,
    telefono: input.telefono,
    telefonoAlternativo: input.telefonoAlternativo ?? null,
    fechaNacimiento: input.fechaNacimiento ?? null,
    notas: input.notas ?? null,
  };

  return client.cliente.create({
    data,
    include: {
      direcciones: { where: { activo: true } },
      equipos: { where: { activo: true } },
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// EDITAR
// ═══════════════════════════════════════════════════════════════

export async function editarCliente(
  input: EditarClienteInput,
  ctx: Ctx = {},
): Promise<ClienteConRelaciones> {
  const client = ctx.tx ?? prisma;

  const actual = await client.cliente.findFirst({
    where: { id: input.id, deletedAt: null },
    select: { id: true, email: true, rfc: true },
  });
  if (!actual) {
    throw new NotFoundError('Cliente no encontrado');
  }

  if (input.email && input.email !== actual.email) {
    const existe = await client.cliente.findFirst({
      where: { email: input.email, deletedAt: null, id: { not: input.id } },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe otro cliente con el email ${input.email}`);
    }
  }

  if (input.rfc && input.rfc !== actual.rfc) {
    const existe = await client.cliente.findFirst({
      where: { rfc: input.rfc, deletedAt: null, id: { not: input.id } },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe otro cliente con el RFC ${input.rfc}`);
    }
  }

  const data: Prisma.ClienteUncheckedUpdateInput = {};
  if (input.tipo !== undefined) data.tipo = input.tipo;
  if (input.rfc !== undefined) data.rfc = input.rfc ?? null;
  if (input.razonSocial !== undefined) data.razonSocial = input.razonSocial ?? null;
  if (input.nombre !== undefined) data.nombre = input.nombre;
  if (input.apellidos !== undefined) data.apellidos = input.apellidos ?? null;
  if (input.email !== undefined) data.email = input.email ?? null;
  if (input.telefono !== undefined) data.telefono = input.telefono;
  if (input.telefonoAlternativo !== undefined) {
    data.telefonoAlternativo = input.telefonoAlternativo ?? null;
  }
  if (input.fechaNacimiento !== undefined) {
    data.fechaNacimiento = input.fechaNacimiento ?? null;
  }
  if (input.notas !== undefined) data.notas = input.notas ?? null;

  return client.cliente.update({
    where: { id: input.id },
    data,
    include: {
      direcciones: { where: { activo: true } },
      equipos: { where: { activo: true } },
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR (soft delete)
// ═══════════════════════════════════════════════════════════════

export async function eliminarCliente(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.cliente.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!actual) {
    throw new NotFoundError('Cliente no encontrado');
  }

  await client.cliente.update({
    where: { id },
    data: { deletedAt: new Date(), activo: false },
  });
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO
// ═══════════════════════════════════════════════════════════════

export async function obtenerCliente(id: string): Promise<ClienteConRelaciones | null> {
  return prisma.cliente.findFirst({
    where: { id, deletedAt: null },
    include: {
      direcciones: { where: { activo: true }, orderBy: { esPrincipal: 'desc' } },
      equipos: { where: { activo: true }, orderBy: { createdAt: 'desc' } },
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// LISTAR (paginado)
// ═══════════════════════════════════════════════════════════════

export async function listarClientes(
  filtros: FiltrosClienteInput,
): Promise<PaginatedResult<ClienteResumen>> {
  const { busqueda, tipo, activo, ciudad, page, pageSize } = filtros;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where: Prisma.ClienteWhereInput = {
    deletedAt: null,
  };

  if (activo !== undefined) where.activo = activo;
  if (tipo !== undefined) where.tipo = tipo;

  if (busqueda) {
    where.OR = [
      { nombre: { contains: busqueda } },
      { apellidos: { contains: busqueda } },
      { razonSocial: { contains: busqueda } },
      { email: { contains: busqueda } },
      { telefono: { contains: busqueda } },
    ];
  }

  if (ciudad) {
    where.direcciones = {
      some: { ciudad: { contains: ciudad }, activo: true },
    };
  }

  const [items, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      skip,
      take,
      orderBy: [{ nombre: 'asc' }, { apellidos: 'asc' }],
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        razonSocial: true,
        email: true,
        telefono: true,
        tipo: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            equipos: { where: { activo: true } },
            direcciones: { where: { activo: true } },
          },
        },
      },
    }),
    prisma.cliente.count({ where }),
  ]);

  const mapped: ClienteResumen[] = items.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    apellidos: c.apellidos,
    razonSocial: c.razonSocial,
    email: c.email,
    telefono: c.telefono,
    tipo: c.tipo,
    activo: c.activo,
    totalEquipos: c._count.equipos,
    totalDirecciones: c._count.direcciones,
    createdAt: c.createdAt,
  }));

  return buildPaginatedResult(mapped, total, { page, pageSize });
}
