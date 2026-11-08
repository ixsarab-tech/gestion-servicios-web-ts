'use server';

import type { OrdenServicio } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearOrdenSchema } from '../schemas/crear-orden.schema';
import { crearOrden } from '../services/orden.service';

export const crearOrdenAction = validatedAction(
  {
    modulo: 'ordenes',
    accion: 'crear-orden',
    schema: CrearOrdenSchema,
    permission: 'ordenes:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'ordenes_servicio',
      registroId: (out: OrdenServicio) => out.id,
      datosNuevos: (out: OrdenServicio) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<OrdenServicio> => {
    return crearOrden(input, { tx: tx ?? undefined });
  },
);
