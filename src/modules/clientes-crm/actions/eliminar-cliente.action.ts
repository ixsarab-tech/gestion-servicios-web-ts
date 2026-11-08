'use server';

import { z } from 'zod';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { eliminarCliente } from '../services/cliente.service';

const EliminarClienteSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});

type EliminarClienteInput = z.infer<typeof EliminarClienteSchema>;

export const eliminarClienteAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'eliminar',
    schema: EliminarClienteSchema,
    permission: 'clientes:eliminar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'clientes',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) {
          throw new Error('datosAnteriores requiere contexto transaccional');
        }
        const { id } = input as EliminarClienteInput;
        // ⚠️ Usar `ctx.tx` (NO `prisma`) para evitar deadlock
        const anterior = await ctx.tx.cliente.findFirst({
          where: { id, deletedAt: null },
        });
        if (!anterior) {
          throw new NotFoundError('Cliente no encontrado');
        }
        return sanitizeForAudit(anterior);
      },

      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await eliminarCliente(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
