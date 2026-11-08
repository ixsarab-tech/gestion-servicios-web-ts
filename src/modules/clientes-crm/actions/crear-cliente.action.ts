'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearClienteSchema } from '../schemas/crear-cliente.schema';
import { crearCliente } from '../services/cliente.service';
import type { ClienteConRelaciones } from '../types';

export const crearClienteAction = validatedAction(
  {
    modulo: 'clientes',
    accion: 'crear',
    schema: CrearClienteSchema,
    permission: 'clientes:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'clientes',
      registroId: (out: ClienteConRelaciones) => out.id,
      datosNuevos: (out: ClienteConRelaciones) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<ClienteConRelaciones> => {
    return crearCliente(input, { tx: tx ?? undefined });
  },
);
