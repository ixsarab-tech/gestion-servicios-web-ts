'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearTipoServicioSchema } from '../../schemas/tipo-servicio.schema';
import { crearTipoServicio } from '../../services/tipo-servicio.service';

export const crearTipoServicioAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'crear-tipo-servicio',
    schema: CrearTipoServicioSchema,
    permission: 'catalogos:tipos-servicio:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'cat_tipos_servicio',
      registroId: (out: { id: string; nombre: string; descripcion?: string | null }) => out.id,
      datosNuevos: (out) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }) => {
    return crearTipoServicio(input, { tx: tx ?? undefined });
  },
);
