'use server';

import type { Reparacion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { BloquearReparacionSchema } from '../schemas';
import { bloquearReparacion } from '../services';

export const bloquearReparacionAction = validatedAction(
  {
    modulo: 'reparaciones',
    accion: 'bloquear-reparacion',
    schema: BloquearReparacionSchema,
    permission: 'reparaciones:bloquear',
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
    return bloquearReparacion(input.id, input.motivo, { tx: tx ?? undefined });
  },
);
