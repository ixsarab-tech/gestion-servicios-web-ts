'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CambiarPasswordSchema } from '../schemas';
import { cambiarPassword } from '../services';

export const cambiarPasswordAction = validatedAction(
  {
    modulo: 'usuarios',
    accion: 'cambiar-password',
    schema: CambiarPasswordSchema,
    permission: 'usuarios:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'usuarios',
      registroId: (out: { id: string }) => out.id,
      datosNuevos: () => sanitizeForAudit({ changed: true }),
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await cambiarPassword(input, { tx: tx ?? undefined });
    return { id: input.id };
  },
);


