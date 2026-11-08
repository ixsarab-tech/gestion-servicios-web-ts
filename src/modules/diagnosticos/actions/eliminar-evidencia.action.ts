'use server';

import { validatedAction } from '@/shared/validation';

import { EliminarEvidenciaSchema } from '../schemas';
import { eliminarEvidencia } from '../services';

// ⚠️ Sin `datosAnteriores`: el service hace hard delete y `validatedAction`
// invoca `datosAnteriores` DESPUÉS del handler (bug conocido del wrapper).
export const eliminarEvidenciaAction = validatedAction(
  {
    modulo: 'diagnosticos',
    accion: 'eliminar-evidencia',
    schema: EliminarEvidenciaSchema,
    permission: 'diagnosticos:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'DELETE',
      tablaAfectada: 'diagnostico_evidencias',
      registroId: (out: { id: string }) => out.id,
      datosNuevos: () => null,
    },
  },
  async (input, { tx }): Promise<{ id: string }> => {
    await eliminarEvidencia(input.id, { tx: tx ?? undefined });
    return { id: input.id };
  },
);
