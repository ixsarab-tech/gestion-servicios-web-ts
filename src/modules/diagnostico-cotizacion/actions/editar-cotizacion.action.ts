'use server';

import type { Cotizacion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarCotizacionSchema } from '../schemas';
import { editarCotizacion } from '../services';

export const editarCotizacionAction = validatedAction(
  {
    modulo: 'presupuestos',
    accion: 'editar-cotizacion',
    schema: EditarCotizacionSchema,
    permission: 'presupuestos:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'cotizaciones',
      registroId: (out: Cotizacion) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.cotizacion.findFirst({ where: { id } });
        if (!anterior) throw new NotFoundError('Cotización no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: Cotizacion) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<Cotizacion> => {
    return editarCotizacion(input, { tx: tx ?? undefined });
  },
);
