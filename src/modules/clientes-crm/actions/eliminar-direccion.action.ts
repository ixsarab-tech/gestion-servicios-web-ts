'use server';

import { z } from 'zod';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { eliminarDireccion } from '../services/direccion.service';

const EliminarDireccionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});

export const eliminarDireccionAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'eliminar-direccion',
    schema: EliminarDireccionSchema,
    permission: 'clientes:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'cliente_direcciones',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.clienteDireccion.findFirst({
          where: { id, activo: true },
        });
        if (!anterior) throw new NotFoundError('Dirección no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await eliminarDireccion(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
