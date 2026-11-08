'use server';

import type { ClienteEquipo } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearEquipoSchema } from '../schemas/equipo.schema';
import { crearEquipo } from '../services/equipo.service';

export const crearEquipoAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'crear-equipo',
    schema: CrearEquipoSchema,
    permission: 'clientes:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'cliente_equipos',
      registroId: (out: ClienteEquipo) => out.id,
      datosNuevos: (out: ClienteEquipo) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<ClienteEquipo> => {
    return crearEquipo(input, { tx: tx ?? undefined });
  },
);
