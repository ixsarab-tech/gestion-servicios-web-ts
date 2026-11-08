'use server';

import type { OrdenServicio } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { CambiarEstadoSchema } from '../schemas/cambiar-estado.schema';
import { cambiarEstado } from '../services/orden.service';

export const cambiarEstadoAction = validatedAction(
  {
    modulo: 'ordenes',
    accion: 'cambiar-estado',
    schema: CambiarEstadoSchema,
    permission: 'ordenes:cambiar_estado',
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
          select: { id: true, estado: true },
        });
        if (!anterior) throw new NotFoundError('Orden no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: OrdenServicio) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<OrdenServicio> => {
    return cambiarEstado(input, { tx: tx ?? undefined });
  },
);
