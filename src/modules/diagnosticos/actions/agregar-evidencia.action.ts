'use server';

import type { DiagnosticoEvidencia } from '@/generated/prisma/client';
import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearEvidenciaSchema } from '../schemas';
import { crearEvidencia } from '../services';

export const agregarEvidenciaAction = validatedAction(
  {
    modulo: 'diagnosticos',
    accion: 'agregar-evidencia',
    schema: CrearEvidenciaSchema,
    permission: 'diagnosticos:editar',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'diagnostico_evidencias',
      registroId: (out: DiagnosticoEvidencia) => out.id,
      datosNuevos: (out: DiagnosticoEvidencia) => sanitizeForAudit(out),
    },
  },
  async (input, { tx }): Promise<DiagnosticoEvidencia> => {
    return crearEvidencia(input, { tx: tx ?? undefined });
  },
);
