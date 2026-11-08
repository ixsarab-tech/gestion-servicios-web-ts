'use server';

import type { CotizacionItem } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { AgregarItemSchema } from '../schemas';
import { agregarItem } from '../services';

export const agregarItemAction = validatedAction(
  {
    modulo: 'presupuestos',
    accion: 'agregar-item',
    schema: AgregarItemSchema,
    permission: 'presupuestos:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'cotizacion_items',
      registroId: (out: CotizacionItem) => out.id,
      datosNuevos: (out: CotizacionItem) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<CotizacionItem> => {
    return agregarItem(input, { tx: tx ?? undefined });
  },
);
