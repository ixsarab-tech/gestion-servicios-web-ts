'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarClienteSchema } from '../schemas/editar-cliente.schema';
import { editarCliente } from '../services/cliente.service';
import type { ClienteConRelaciones } from '../types';

export const editarClienteAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'editar',
    schema: EditarClienteSchema,
    permission: 'clientes:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'clientes',
      registroId: (out: ClienteConRelaciones) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) {
          throw new Error('datosAnteriores requiere contexto transaccional');
        }
        const { id } = input as { id: string };
        // ⚠️ Usar `ctx.tx` (NO `prisma`) para evitar deadlock
        const anterior = await ctx.tx.cliente.findFirst({
          where: { id, deletedAt: null },
        });
        if (!anterior) {
          throw new NotFoundError('Cliente no encontrado');
        }
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out: ClienteConRelaciones) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<ClienteConRelaciones> => {
    return editarCliente(input, { tx: tx ?? undefined });
  },
);
