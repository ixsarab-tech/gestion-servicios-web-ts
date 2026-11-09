'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EliminarRepuestoSchema } from '../schemas';
import { eliminarRepuesto } from '../services';

export const eliminarRepuestoAction = validatedAction(
  {
    modulo: 'reparaciones',
    accion: 'eliminar-repuesto',
    schema: EliminarRepuestoSchema,
    permission: 'reparaciones:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'reparacion_repuestos',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.reparacionRepuesto.findFirst({ where: { id } });
        if (!anterior) throw new NotFoundError('Repuesto no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await eliminarRepuesto(input, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
