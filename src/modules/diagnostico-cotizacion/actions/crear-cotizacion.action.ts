'use server';

import type { Cotizacion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearCotizacionSchema } from '../schemas';
import { crearCotizacion } from '../services';

export const crearCotizacionAction = validatedAction(
  {
    modulo: 'presupuestos',
    accion: 'crear-cotizacion',
    schema: CrearCotizacionSchema,
    permission: 'presupuestos:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'cotizaciones',
      registroId: (out: Cotizacion) => out.id,
      datosNuevos: (out: Cotizacion) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<Cotizacion> => {
    return crearCotizacion(input, { tx: tx ?? undefined });
  },
);
