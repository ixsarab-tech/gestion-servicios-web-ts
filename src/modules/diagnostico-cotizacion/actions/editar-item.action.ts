'use server';

import type { CotizacionItem } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarCotizacionItemSchema } from '../schemas';
import { editarItem } from '../services';

export const editarItemAction = validatedAction(
  {
    modulo: 'presupuestos',
    accion: 'editar-item',
    schema: EditarCotizacionItemSchema,
    permission: 'presupuestos:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'cotizacion_items',
      registroId: (out: CotizacionItem) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.cotizacionItem.findFirst({ where: { id } });
        if (!anterior) throw new NotFoundError('Item no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: CotizacionItem) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<CotizacionItem> => {
    return editarItem(input, { tx: tx ?? undefined });
  },
);
