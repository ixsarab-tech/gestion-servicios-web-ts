'use server';

import type { ClienteDireccion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarDireccionSchema } from '../schemas/direccion.schema';
import { editarDireccion } from '../services/direccion.service';

export const editarDireccionAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'editar-direccion',
    schema: EditarDireccionSchema,
    permission: 'clientes:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'cliente_direcciones',
      registroId: (out: ClienteDireccion) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.clienteDireccion.findFirst({
          where: { id, activo: true },
        });
        if (!anterior) throw new NotFoundError('Dirección no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: ClienteDireccion) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<ClienteDireccion> => {
    return editarDireccion(input, { tx: tx ?? undefined });
  },
);
