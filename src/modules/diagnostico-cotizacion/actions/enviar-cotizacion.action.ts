'use server';

import type { Cotizacion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EnviarCotizacionSchema } from '../schemas';
import { enviarCotizacion } from '../services';

export const enviarCotizacionAction = validatedAction(
  {
    modulo: 'presupuestos',
    accion: 'enviar-cotizacion',
    schema: EnviarCotizacionSchema,
    permission: 'presupuestos:enviar',
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
    return enviarCotizacion(input.id, { tx: tx ?? undefined });
  },
);
