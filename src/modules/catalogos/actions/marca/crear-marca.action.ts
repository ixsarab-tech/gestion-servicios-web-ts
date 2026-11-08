'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearMarcaSchema } from '../../schemas/marca.schema';
import { crearMarca } from '../../services/marca.service';

export const crearMarcaAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'crear-marca',
    schema: CrearMarcaSchema,
    permission: 'catalogos:marcas:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'cat_marcas',
      registroId: (out: { id: string; nombre: string; descripcion?: string | null }) => out.id,
      datosNuevos: (out) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }) => {
    return crearMarca(input, { tx: tx ?? undefined });
  },
);
