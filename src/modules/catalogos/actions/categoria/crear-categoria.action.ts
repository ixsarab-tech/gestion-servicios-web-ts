'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearCategoriaSchema } from '../../schemas/categoria.schema';
import { crearCategoria } from '../../services/categoria.service';

export const crearCategoriaAction = validatedAction(
  {
    modulo: 'catalogos',
    accion: 'crear-categoria',
    schema: CrearCategoriaSchema,
    permission: 'catalogos:categorias:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'cat_categorias_equipo',
      registroId: (out: { id: string; nombre: string; descripcion?: string | null }) => out.id,
      datosNuevos: (out) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }) => {
    return crearCategoria(input, { tx: tx ?? undefined });
  },
);
