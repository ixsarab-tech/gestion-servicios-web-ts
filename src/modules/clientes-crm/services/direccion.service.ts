import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';

import type { CrearDireccionInput, EditarDireccionInput } from '../schemas';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export async function crearDireccion(input: CrearDireccionInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  // Verificar que el cliente existe en este tenant
  const cliente = await client.cliente.findFirst({
    where: { id: input.clienteId, deletedAt: null },
    select: { id: true },
  });
  if (!cliente) {
    throw new NotFoundError('Cliente no encontrado');
  }

  // Si es principal, desmarcar las demás del mismo cliente
  if (input.esPrincipal) {
    await client.clienteDireccion.updateMany({
      where: { clienteId: input.clienteId, esPrincipal: true, activo: true },
      data: { esPrincipal: false },
    });
  }

  const data: Prisma.ClienteDireccionUncheckedCreateInput = {
    tenantId,
    clienteId: input.clienteId,
    etiqueta: input.etiqueta,
    calle: input.calle,
    ciudad: input.ciudad,
    departamento: input.departamento ?? null,
    pais: input.pais,
    codigoPostal: input.codigoPostal ?? null,
    referencias: input.referencias ?? null,
    esPrincipal: input.esPrincipal,
    activo: true,
  };

  return client.clienteDireccion.create({ data });
}

// ═══════════════════════════════════════════════════════════════
// EDITAR
// ═══════════════════════════════════════════════════════════════

export async function editarDireccion(input: EditarDireccionInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.clienteDireccion.findFirst({
    where: { id: input.id, activo: true },
    select: { id: true, clienteId: true },
  });
  if (!actual) {
    throw new NotFoundError('Dirección no encontrada');
  }

  // Si se marca como principal, desmarcar las demás
  if (input.esPrincipal) {
    await client.clienteDireccion.updateMany({
      where: {
        clienteId: actual.clienteId,
        esPrincipal: true,
        activo: true,
        id: { not: input.id },
      },
      data: { esPrincipal: false },
    });
  }

  const data: Prisma.ClienteDireccionUncheckedUpdateInput = {
    etiqueta: input.etiqueta,
    calle: input.calle,
    ciudad: input.ciudad,
    departamento: input.departamento ?? null,
    pais: input.pais,
    codigoPostal: input.codigoPostal ?? null,
    referencias: input.referencias ?? null,
    esPrincipal: input.esPrincipal,
  };

  return client.clienteDireccion.update({
    where: { id: input.id },
    data,
  });
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR (soft delete)
// ═══════════════════════════════════════════════════════════════

export async function eliminarDireccion(id: string, ctx: Ctx = {}): Promise<void> {
  const client = ctx.tx ?? prisma;

  const actual = await client.clienteDireccion.findFirst({
    where: { id, activo: true },
    select: { id: true },
  });
  if (!actual) {
    throw new NotFoundError('Dirección no encontrada');
  }

  await client.clienteDireccion.update({
    where: { id },
    data: { activo: false, esPrincipal: false },
  });
}

// ═══════════════════════════════════════════════════════════════
// OBTENER UNO
// ═══════════════════════════════════════════════════════════════

export async function obtenerDireccion(id: string) {
  return prisma.clienteDireccion.findFirst({
    where: { id, activo: true },
  });
}

// ═══════════════════════════════════════════════════════════════
// LISTAR POR CLIENTE
// ═══════════════════════════════════════════════════════════════

export async function listarDireccionesDeCliente(clienteId: string) {
  return prisma.clienteDireccion.findMany({
    where: { clienteId, activo: true },
    orderBy: [{ esPrincipal: 'desc' }, { createdAt: 'desc' }],
  });
}
