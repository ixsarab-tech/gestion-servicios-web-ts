import { z } from 'zod';

import { PAGINA_DEFAULT, TAMANO_PAGINA_DEFAULT, TAMANOS_PAGINA } from '@/shared/constants';

export const FiltrosOrdenSchema = z.object({
  busqueda: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  estado: z
    .enum([
      'BORRADOR',
      'RECIBIDO',
      'EN_DIAGNOSTICO',
      'PRESUPUESTADO',
      'APROBADO',
      'REPARANDO',
      'LISTO',
      'ENTREGADO',
      'CANCELADO',
    ])
    .optional(),
  modalidad: z.enum(['TALLER', 'DOMICILIO']).optional(),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  tecnicoAsignadoId: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  page: z.coerce.number().int().min(1).default(PAGINA_DEFAULT),
  pageSize: z.coerce
    .number()
    .int()
    .refine((v) => TAMANOS_PAGINA.includes(v as (typeof TAMANOS_PAGINA)[number]), {
      message: `pageSize debe ser uno de: ${TAMANOS_PAGINA.join(', ')}`,
    })
    .default(TAMANO_PAGINA_DEFAULT),
});

export type FiltrosOrdenInput = z.infer<typeof FiltrosOrdenSchema>;
