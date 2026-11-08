'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarCategoriaSchema } from '../../schemas/categoria.schema';
import { editarCategoria } from '../../services/categoria.service';

export const editarCategoriaAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'editar-categoria',
    schema: EditarCategoriaSchema,
    permission: 'catalogos:categorias:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'cat_categorias_equipo',
      registroId: (out: { id: string; nombre: string; descripcion?: string | null }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.catCategoriaEquipo.findFirst({
          where: { id },
        });
        if (!anterior) throw new NotFoundError('Categoría no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }) => {
    return editarCategoria(input, { tx: tx ?? undefined });
  },
);
