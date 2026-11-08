'use server';

import { z } from 'zod';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { eliminarTipoServicio } from '../../services/tipo-servicio.service';

const EliminarTipoServicioSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});

export const eliminarTipoServicioAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'eliminar-tipo-servicio',
    schema: EliminarTipoServicioSchema,
    permission: 'catalogos:tipos-servicio:eliminar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'cat_tipos_servicio',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.catTipoServicio.findFirst({
          where: { id },
        });
        if (!anterior) throw new NotFoundError('Tipo de servicio no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }) => {
    await eliminarTipoServicio(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
