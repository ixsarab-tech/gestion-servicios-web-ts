'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarMarcaSchema } from '../../schemas/marca.schema';
import { editarMarca } from '../../services/marca.service';

export const editarMarcaAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'editar-marca',
    schema: EditarMarcaSchema,
    permission: 'catalogos:marcas:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'cat_marcas',
      registroId: (out: { id: string; nombre: string; descripcion?: string | null }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.catMarca.findFirst({
          where: { id },
        });
        if (!anterior) throw new NotFoundError('Marca no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }) => {
    return editarMarca(input, { tx: tx ?? undefined });
  },
);
