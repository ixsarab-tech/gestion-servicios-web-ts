'use server';

import type { Reparacion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarReparacionSchema } from '../schemas';
import { editarReparacion } from '../services';

export const editarReparacionAction = validatedAction(
  {
    modulo: 'reparaciones',
    accion: 'editar-reparacion',
    schema: EditarReparacionSchema,
    permission: 'reparaciones:editar',
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
    return editarReparacion(input, { tx: tx ?? undefined });
  },
);
