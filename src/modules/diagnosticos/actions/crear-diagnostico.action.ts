'use server';

import type { Diagnostico } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearDiagnosticoSchema } from '../schemas';
import { crearDiagnostico } from '../services';

export const crearDiagnosticoAction = validatedAction(
  {
    modulo: 'diagnosticos',
    accion: 'crear-diagnostico',
    schema: CrearDiagnosticoSchema,
    permission: 'diagnosticos:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'diagnosticos',
      registroId: (out: Diagnostico) => out.id,
      datosNuevos: (out: Diagnostico) => sanitizeForAudit(out),
    },
  },
  async (input, { user, tx }): Promise<Diagnostico> => {
    return crearDiagnostico(input, user.id, { tx: tx ?? undefined });
  },
);
