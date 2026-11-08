'use server';

import type { ClienteEquipo } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarEquipoSchema } from '../schemas/equipo.schema';
import { editarEquipo } from '../services/equipo.service';

export const editarEquipoAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'editar-equipo',
    schema: EditarEquipoSchema,
    permission: 'clientes:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'cliente_equipos',
      registroId: (out: ClienteEquipo) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.clienteEquipo.findFirst({
          where: { id, activo: true },
        });
        if (!anterior) throw new NotFoundError('Equipo no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: ClienteEquipo) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<ClienteEquipo> => {
    return editarEquipo(input, { tx: tx ?? undefined });
  },
);
