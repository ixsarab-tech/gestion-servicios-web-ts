'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { NotFoundError } from '@/shared/errors';
import { validatedAction } from '@/shared/validation';

import { EliminarCotizacionSchema } from '../schemas';
import { eliminarCotizacion } from '../services';

// Con el fix de `validatedAction` (datosAnteriores ANTES del handler),
// podemos capturar el estado completo (cotización + items) incluso en hard delete.
export const eliminarCotizacionAction = validatedAction(
  {
    modulo: 'presupuestos',
    accion: 'eliminar-cotizacion',
    schema: EliminarCotizacionSchema,
    permission: 'presupuestos:eliminar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'cotizaciones',
      registroId: (out: { id: string }) => out.id,
      datosAnteriores: async (input, ctx) => {
        if (!ctx) throw new Error('ctx requerido');
        const { id } = input as { id: string };
        const anterior = await ctx.tx.cotizacion.findFirst({
          where: { id },
          include: { items: true },
        });
        if (!anterior) throw new NotFoundError('Cotización no encontrada');
        return sanitizeForAudit(anterior);
      },
      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await eliminarCotizacion(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
