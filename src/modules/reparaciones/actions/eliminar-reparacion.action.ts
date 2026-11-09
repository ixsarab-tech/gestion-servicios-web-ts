'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EliminarReparacionSchema } from '../schemas';
import { eliminarReparacion } from '../services';

export const eliminarReparacionAction = validatedAction(
  {
    modulo: 'reparaciones',
    accion: 'eliminar-reparacion',
    schema: EliminarReparacionSchema,
    permission: 'reparaciones:eliminar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'reparaciones',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.reparacion.findFirst({
          where: { id },
          include: { repuestos: true },
        });
        if (!anterior) throw new NotFoundError('Reparación no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await eliminarReparacion(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
