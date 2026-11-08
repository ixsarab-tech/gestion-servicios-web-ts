'use server';

import type { Cotizacion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { AprobarCotizacionSchema } from '../schemas';
import { aprobarCotizacion } from '../services';

export const aprobarCotizacionAction = validatedAction(
  {
    modulo: 'presupuestos',
    accion: 'aprobar-cotizacion',
    schema: AprobarCotizacionSchema,
    permission: 'presupuestos:aprobar',
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
    return aprobarCotizacion(input.id, { tx: tx ?? undefined });
  },
);
