'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EditarTipoServicioSchema } from '../../schemas/tipo-servicio.schema';
import { editarTipoServicio } from '../../services/tipo-servicio.service';

export const editarTipoServicioAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'editar-tipo-servicio',
    schema: EditarTipoServicioSchema,
    permission: 'catalogos:tipos-servicio:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'UPDATE',
      tablaAfectada: 'cat_tipos_servicio',
      registroId: (out: { id: string; nombre: string; descripcion?: string | null }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.catTipoServicio.findFirst({
          where: { id },
        });
        if (!anterior) throw new NotFoundError('Tipo de servicio no encontrado');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: (out) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }) => {
    return editarTipoServicio(input, { tx: tx ?? undefined });
  },
);
