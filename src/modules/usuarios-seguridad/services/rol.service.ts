import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, ConflictError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';

import type { AsignarRolInput, RevocarRolInput } from '../schemas';
import type { RolConPermisos, RolResumen } from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// LISTAR ROLES
// ═══════════════════════════════════════════════════════════════

export async function listarRoles(): Promise<RolResumen[]> {
  const roles = await prisma.rol.findMany({
    orderBy: [{ esSistema: 'desc' }, { nombre: 'asc' }],
    include: {
      _count: { select: { permisos: true } },
    },
  });

  return roles.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    esSistema: r.esSistema,
    totalPermisos: r._count.permisos,
  }));
}

// ═══════════════════════════════════════════════════════════════
// OBTENER ROL CON PERMISOS
// ═══════════════════════════════════════════════════════════════

export async function obtenerRol(id: string): Promise<RolConPermisos | null> {
  const r = await prisma.rol.findFirst({
    where: { id },
    include: {
      permisos: {
        include: {
          permiso: { select: { codigo: true, descripcion: true } },
        },
      },
      _count: { select: { permisos: true } },
    },
  });
  if (!r) return null;

  return {
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    esSistema: r.esSistema,
    totalPermisos: r._count.permisos,
    permisos: r.permisos.map((rp) => rp.permiso),
  };
}

// ═══════════════════════════════════════════════════════════════
// ASIGNAR ROL
// ═══════════════════════════════════════════════════════════════

export async function asignarRolAUsuario(input: AsignarRolInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const usuario = await client.usuario.findFirst({
    where: { id: input.usuarioId },
    select: { id: true, tenantId: true },
  });
  if (!usuario) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const rol = await client.rol.findFirst({
    where: { id: input.rolId },
    select: { id: true, tenantId: true },
  });
  if (!rol) {
    throw new NotFoundError('Rol no encontrado');
  }

  if (usuario.tenantId !== tenantId || rol.tenantId !== tenantId) {
    throw new BusinessRuleError('Usuario y rol deben pertenecer al mismo tenant');
  }

  const yaAsignado = await client.usuarioRol.findUnique({
    where: {
      usuarioId_rolId: {
        usuarioId: input.usuarioId,
        rolId: input.rolId,
      },
    },
  });
  if (yaAsignado) {
    throw new ConflictError('El usuario ya tiene ese rol asignado');
  }

  return client.usuarioRol.create({
    data: {
      usuarioId: input.usuarioId,
      rolId: input.rolId,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// REVOCAR ROL
// ═══════════════════════════════════════════════════════════════

export async function revocarRolDeUsuario(input: RevocarRolInput, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const asignacion = await client.usuarioRol.findUnique({
    where: {
      usuarioId_rolId: {
        usuarioId: input.usuarioId,
        rolId: input.rolId,
      },
    },
  });
  if (!asignacion) {
    throw new NotFoundError('Asignación no encontrada');
  }

  const totalRoles = await client.usuarioRol.count({
    where: { usuarioId: input.usuarioId },
  });
  if (totalRoles <= 1) {
    throw new BusinessRuleError('El usuario debe tener al menos un rol');
  }

  await client.usuarioRol.delete({
    where: {
      usuarioId_rolId: {
        usuarioId: input.usuarioId,
        rolId: input.rolId,
      },
    },
  });
}
