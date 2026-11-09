'use server';

import type { Reparacion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { CompletarReparacionSchema } from '../schemas';
import { completarReparacion } from '../services';

export const completarReparacionAction = validatedAction(
  {
    modulo: 'reparaciones',
    accion: 'completar-reparacion',
    schema: CompletarReparacionSchema,
    permission: 'reparaciones:completar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'reparaciones',
      registroId: (out: Reparacion) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.reparacion.findFirst({ where: { id } });
        if (!anterior) throw new NotFoundError('Reparación no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: Reparacion) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<Reparacion> => {
    return completarReparacion(input, { tx: tx ?? undefined });
  },
);
