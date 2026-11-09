'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { RevocarRolSchema } from '../schemas';
import { revocarRolDeUsuario } from '../services';

export const revocarRolAction = validatedAction(
  {
    modulo: 'usuarios',
    accion: 'revocar-rol',
    schema: RevocarRolSchema,
    permission: 'usuarios:asignar_roles',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'usuario_roles',
      registroId: (out: { usuarioId: string; rolId: string }) => `${out.usuarioId}:${out.rolId}`,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { usuarioId, rolId } = input as { usuarioId: string; rolId: string };
        const anterior = await ctx.tx.usuarioRol.findUnique({
          where: { usuarioId_rolId: { usuarioId, rolId } },
        });
        if (!anterior) throw new NotFoundError('Asignación no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ usuarioId: string; rolId: string }> => {
    await revocarRolDeUsuario(input, { tx: tx ?? undefined });
    return { usuarioId: input.usuarioId, rolId: input.rolId };
  },
);
