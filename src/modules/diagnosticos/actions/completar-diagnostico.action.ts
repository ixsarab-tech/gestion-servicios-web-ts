'use server';

import type { Diagnostico } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { CompletarDiagnosticoSchema } from '../schemas';
import { completarDiagnostico } from '../services';

export const completarDiagnosticoAction = validatedAction(
  {
    modulo: 'diagnosticos',
    accion: 'completar-diagnostico',
    schema: CompletarDiagnosticoSchema,
    permission: 'diagnosticos:completar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'diagnosticos',
      registroId: (out: Diagnostico) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.diagnostico.findFirst({ where: { id } });
        if (!anterior) throw new NotFoundError('Diagnóstico no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: Diagnostico) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<Diagnostico> => {
    return completarDiagnostico(input, { tx: tx ?? undefined });
  },
);
