'use server';

import type { ReparacionRepuesto } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { AgregarRepuestoSchema } from '../schemas';
import { agregarRepuesto } from '../services';

export const agregarRepuestoAction = validatedAction(
  {
    modulo: 'reparaciones',
    accion: 'agregar-repuesto',
    schema: AgregarRepuestoSchema,
    permission: 'reparaciones:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'reparacion_repuestos',
      registroId: (out: ReparacionRepuesto) => out.id,
      datosNuevos: (out: ReparacionRepuesto) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<ReparacionRepuesto> => {
    return agregarRepuesto(input, { tx: tx ?? undefined });
  },
);
