'use server';

import type { Usuario } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarUsuarioSchema } from '../schemas';
import { editarUsuario } from '../services';

export const editarUsuarioAction = validatedAction(
  {
    modulo: 'usuarios',
    accion: 'editar-usuario',
    schema: EditarUsuarioSchema,
    permission: 'usuarios:editar',
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
  async (input, { tx }): Promise<Usuario> => {
    return editarUsuario(input, { tx: tx ?? undefined });
  },
);
