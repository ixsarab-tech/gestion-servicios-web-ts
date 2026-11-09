'use server';

import type { Usuario } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { DesactivarUsuarioSchema } from '../schemas';
import { desactivarUsuario } from '../services';

export const desactivarUsuarioAction = validatedAction(
  {
    modulo: 'usuarios',
    accion: 'desactivar-usuario',
    schema: DesactivarUsuarioSchema,
    permission: 'usuarios:desactivar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'usuarios',
      registroId: (out: Usuario) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.usuario.findFirst({ where: { id } });
        if (!anterior) throw new NotFoundError('Usuario no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: Usuario) => sanitizeForAudit(out),
    },
  },
  async (input, { user, tx }): Promise<Usuario> => {
    return desactivarUsuario(input, user.id, { tx: tx ?? undefined });
  },
);
