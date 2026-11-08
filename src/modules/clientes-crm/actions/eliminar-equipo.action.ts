'use server';

import { z } from 'zod';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { eliminarEquipo } from '../services/equipo.service';

const EliminarEquipoSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});

export const eliminarEquipoAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'eliminar-equipo',
    schema: EliminarEquipoSchema,
    permission: 'clientes:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'cliente_equipos',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.clienteEquipo.findFirst({
          where: { id, activo: true },
        });
        if (!anterior) throw new NotFoundError('Equipo no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await eliminarEquipo(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
