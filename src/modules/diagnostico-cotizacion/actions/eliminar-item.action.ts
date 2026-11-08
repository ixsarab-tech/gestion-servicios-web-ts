'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EliminarItemSchema } from '../schemas';
import { eliminarItem } from '../services';

export const eliminarItemAction = validatedAction(
  {
    modulo: 'presupuestos',
    accion: 'eliminar-item',
    schema: EliminarItemSchema,
    permission: 'presupuestos:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'cotizacion_items',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.cotizacionItem.findFirst({ where: { id } });
        if (!anterior) throw new NotFoundError('Item no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await eliminarItem(input, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
