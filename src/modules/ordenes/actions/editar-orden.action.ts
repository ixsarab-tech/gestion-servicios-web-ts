'use server';

import type { OrdenServicio } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarOrdenSchema } from '../schemas/editar-orden.schema';
import { editarOrden } from '../services/orden.service';

export const editarOrdenAction = validatedAction(
  {
    modulo: 'ordenes',
    accion: 'editar-orden',
    schema: EditarOrdenSchema,
    permission: 'ordenes:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'ordenes_servicio',
      registroId: (out: OrdenServicio) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.ordenServicio.findFirst({
          where: { id },
        });
        if (!anterior) throw new NotFoundError('Orden no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: OrdenServicio) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<OrdenServicio> => {
    return editarOrden(input, { tx: tx ?? undefined });
  },
);
