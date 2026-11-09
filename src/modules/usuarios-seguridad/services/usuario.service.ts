import bcrypt from 'bcryptjs';

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';
import type { PaginatedResult } from '@/shared/types/pagination';
import { buildPaginatedResult } from '@/shared/utils/pagination';

import type {
  CambiarPasswordInput,
  CrearUsuarioInput,
  DesactivarUsuarioInput,
  EditarUsuarioInput,
  FiltrosUsuarioInput,
  ReactivarUsuarioInput,
} from '../schemas';
import type { UsuarioConRelaciones, UsuarioResumen } from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

const BCRYPT_ROUNDS = 10;

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export async function crearUsuario(input: CrearUsuarioInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const existe = await client.usuario.findFirst({
    where: { email: input.email },
    select: { id: true },
  });
  if (existe) {
    throw new ConflictError(`Ya existe un usuario con el email "${input.email}"`);
  }

  const roles = await client.rol.findMany({
    where: { id: { in: input.rolIds } },
    select: { id: true },
  });
  if (roles.length !== input.rolIds.length) {
    throw new BusinessRuleError('Uno o más roles no existen');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const usuario = await client.usuario.create({
    data: {
      tenantId,
      email: input.email,
      passwordHash,
      nombre: input.nombre,
      apellidos: input.apellidos ?? null,
      telefono: input.telefono ?? null,
      activo: true,
    },
  });

  await client.usuarioRol.createMany({
    data: input.rolIds.map((rolId) => ({
      usuarioId: usuario.id,
      rolId,
    })),
  });

  return usuario;
}

// ═══════════════════════════════════════════════════════════════
// EDITAR (sin password ni roles)
// ═══════════════════════════════════════════════════════════════

export async function editarUsuario(input: EditarUsuarioInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.usuario.findFirst({
    where: { id: input.id },
    select: { id: true, email: true },
  });
  if (!actual) {
    throw new NotFoundError('Usuario no encontrado');
  }

  if (input.email !== actual.email) {
    const existe = await client.usuario.findFirst({
      where: { email: input.email, id: { not: input.id } },
      select: { id: true },
    });
    if (existe) {
      throw new ConflictError(`Ya existe otro usuario con el email "${input.email}"`);
    }
  }

  return client.usuario.update({
    where: { id: input.id },
    data: {
      email: input.email,
      nombre: input.nombre,
      apellidos: input.apellidos ?? null,
      telefono: input.telefono ?? null,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// CAMBIAR PASSWORD (admin reset)
// ═══════════════════════════════════════════════════════════════

export async function cambiarPassword(
  input: CambiarPasswordInput,
  ctx: Ctx = {},
): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.usuario.findFirst({
    where: { id: input.id },
    select: { id: true },
  });
  if (!actual) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  await client.usuario.update({
    where: { id: input.id },
    data: { passwordHash },
  });
}

// ═══════════════════════════════════════════════════════════════
// DESACTIVAR / REACTIVAR (soft)
// ═══════════════════════════════════════════════════════════════

export async function desactivarUsuario(
  input: DesactivarUsuarioInput,
  usuarioActualId: string,
  ctx: Ctx = {},
) {
  const client = ctx.tx ?? prisma;

  if (input.id === usuarioActualId) {
    throw new BusinessRuleError('No puedes desactivar tu propio usuario');
  }

  const actual = await client.usuario.findFirst({
    where: { id: input.id },
    select: { id: true, activo: true },
  });
  if (!actual) {
    throw new NotFoundError('Usuario no encontrado');
  }
  if (!actual.activo) {
    throw new BusinessRuleError('El usuario ya está inactivo');
  }

  return client.usuario.update({
    where: { id: input.id },
    data: { activo: false },
  });
}

export async function reactivarUsuario(input: ReactivarUsuarioInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.usuario.findFirst({
    where: { id: input.id },
    select: { id: true, activo: true },
  });
  if (!actual) {
    throw new NotFoundError('Usuario no encontrado');
  }
  if (actual.activo) {
    throw new BusinessRuleError('El usuario ya está activo');
  }

  return client.usuario.update({
    where: { id: input.id },
    data: { activo: true },
  });
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO (con roles + sesiones count)
// ═══════════════════════════════════════════════════════════════

export async function obtenerUsuario(id: string): Promise<UsuarioConRelaciones | null> {
  const u = await prisma.usuario.findFirst({
    where: { id },
    include: {
      roles: {
        include: {
          rol: { select: { id: true, nombre: true, descripcion: true } },
        },
      },
      _count: { select: { sesiones: true } },
    },
  });
  if (!u) return null;

  return {
    id: u.id,
    email: u.email,
    nombre: u.nombre,
    apellidos: u.apellidos,
    telefono: u.telefono,
    activo: u.activo,
    ultimoLogin: u.ultimoLogin,
    createdAt: u.createdAt,
    roles: u.roles.map((ur) => ur.rol),
    totalSesiones: u._count.sesiones,
  };
}

// ═══════════════════════════════════════════════════════════════
// LISTAR PAGINADO
// ═══════════════════════════════════════════════════════════════

export async function listarUsuarios(
  filtros: FiltrosUsuarioInput,
): Promise<PaginatedResult<UsuarioResumen>> {
  const { busqueda, activo, rolId, page, pageSize } = filtros;

  const where: Prisma.UsuarioWhereInput = {};
  if (activo !== undefined) where.activo = activo;
  if (busqueda) {
    where.OR = [{ nombre: { contains: busqueda } }, { email: { contains: busqueda } }];
  }
  if (rolId) {
    where.roles = { some: { rolId } };
  }

  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
      include: {
        roles: {
          include: {
            rol: { select: { id: true, nombre: true, descripcion: true } },
          },
        },
      },
    }),
    prisma.usuario.count({ where }),
  ]);

  const items: UsuarioResumen[] = rows.map((u) => ({
    id: u.id,
    email: u.email,
    nombre: u.nombre,
    apellidos: u.apellidos,
    telefono: u.telefono,
    activo: u.activo,
    ultimoLogin: u.ultimoLogin,
    createdAt: u.createdAt,
    roles: u.roles.map((ur) => ur.rol),
  }));

  return buildPaginatedResult(items, total, { page, pageSize });
}
