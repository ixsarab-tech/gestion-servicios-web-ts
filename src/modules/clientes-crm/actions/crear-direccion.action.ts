'use server';

import type { ClienteDireccion } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearDireccionSchema } from '../schemas/direccion.schema';
import { crearDireccion } from '../services/direccion.service';

export const crearDireccionAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'crear-direccion',
    schema: CrearDireccionSchema,
    permission: 'clientes:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'cliente_direcciones',
      registroId: (out: ClienteDireccion) => out.id,
      datosNuevos: (out: ClienteDireccion) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<ClienteDireccion> => {
    return crearDireccion(input, { tx: tx ?? undefined });
  },
);
