'use server';

import type { Reparacion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearReparacionSchema } from '../schemas';
import { crearReparacion } from '../services';

export const crearReparacionAction = validatedAction(
  {
    modulo: 'reparaciones',
    accion: 'crear-reparacion',
    schema: CrearReparacionSchema,
    permission: 'reparaciones:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'reparaciones',
      registroId: (out: Reparacion) => out.id,
      datosNuevos: (out: Reparacion) => sanitizeForAudit(out),
    },
  },
  async (input, { user, tx }): Promise<Reparacion> => {
    return crearReparacion(input, user.id, { tx: tx ?? undefined });
  },
);
