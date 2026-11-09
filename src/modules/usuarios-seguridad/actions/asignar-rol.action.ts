'use server';

import type { UsuarioRol } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { AsignarRolSchema } from '../schemas';
import { asignarRolAUsuario } from '../services';

export const asignarRolAction = validatedAction(
  {
    modulo: 'usuarios',
    accion: 'asignar-rol',
    schema: AsignarRolSchema,
    permission: 'usuarios:asignar_roles',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'usuario_roles',
      registroId: (out: UsuarioRol) => `${out.usuarioId}:${out.rolId}`,
      datosNuevos: (out: UsuarioRol) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<UsuarioRol> => {
    return asignarRolAUsuario(input, { tx: tx ?? undefined });
  },
);
