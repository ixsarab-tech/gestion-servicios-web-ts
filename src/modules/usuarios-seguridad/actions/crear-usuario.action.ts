'use server';

import type { Usuario } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearUsuarioSchema } from '../schemas';
import { crearUsuario } from '../services';

export const crearUsuarioAction = validatedAction(
  {
    modulo: 'usuarios',
    accion: 'crear-usuario',
    schema: CrearUsuarioSchema,
    permission: 'usuarios:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'usuarios',
      registroId: (out: Usuario) => out.id,
      datosNuevos: (out: Usuario) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<Usuario> => {
    return crearUsuario(input, { tx: tx ?? undefined });
  },
);
