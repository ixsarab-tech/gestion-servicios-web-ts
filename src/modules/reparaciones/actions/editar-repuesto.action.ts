'use server';

import type { ReparacionRepuesto } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarRepuestoSchema } from '../schemas';
import { editarRepuesto } from '../services';

export const editarRepuestoAction = validatedAction(
  {
    modulo: 'reparaciones',
    accion: 'editar-repuesto',
    schema: EditarRepuestoSchema,
    permission: 'reparaciones:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'reparacion_repuestos',
      registroId: (out: ReparacionRepuesto) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.reparacionRepuesto.findFirst({ where: { id } });
        if (!anterior) throw new NotFoundError('Repuesto no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: ReparacionRepuesto) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<ReparacionRepuesto> => {
    return editarRepuesto(input, { tx: tx ?? undefined });
  },
);
