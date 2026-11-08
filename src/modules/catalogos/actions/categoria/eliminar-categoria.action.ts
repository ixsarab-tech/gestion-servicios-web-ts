'use server';

import { z } from 'zod';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { eliminarCategoria } from '../../services/categoria.service';

const EliminarCategoriaSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});

export const eliminarCategoriaAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'eliminar-categoria',
    schema: EliminarCategoriaSchema,
    permission: 'catalogos:categorias:eliminar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'cat_categorias_equipo',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.catCategoriaEquipo.findFirst({
          where: { id },
        });
        if (!anterior) throw new NotFoundError('Categoría no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }) => {
    await eliminarCategoria(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
