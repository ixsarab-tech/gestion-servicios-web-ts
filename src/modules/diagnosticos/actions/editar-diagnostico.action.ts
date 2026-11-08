'use server';

import type { Diagnostico } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarDiagnosticoSchema } from '../schemas';
import { editarDiagnostico } from '../services';

export const editarDiagnosticoAction = validatedAction(
  {
    modulo: 'diagnosticos',
    accion: 'editar-diagnostico',
    schema: EditarDiagnosticoSchema,
    permission: 'diagnosticos:editar',
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
    return editarDiagnostico(input, { tx: tx ?? undefined });
  },
);
