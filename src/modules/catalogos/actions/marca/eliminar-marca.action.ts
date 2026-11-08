'use server';

import { z } from 'zod';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { eliminarMarca } from '../../services/marca.service';

const EliminarMarcaSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});

export const eliminarMarcaAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'eliminar-marca',
    schema: EliminarMarcaSchema,
    permission: 'catalogos:marcas:eliminar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'cat_marcas',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.catMarca.findFirst({
          where: { id },
        });
        if (!anterior) throw new NotFoundError('Marca no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }) => {
    await eliminarMarca(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
