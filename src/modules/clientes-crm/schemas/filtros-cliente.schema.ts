import { z } from 'zod';

import { PAGINA_DEFAULT, TAMANO_PAGINA_DEFAULT, TAMANOS_PAGINA } from '@/shared/constants';

/**
 * Esquema de filtros para listar clientes con paginación.
 * Se usa en la URL: `?busqueda=juan&activo=true&page=2&pageSize=50`
 */
export const FiltrosClienteSchema = z.object({
  busqueda: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal('').transform(() => undefined)),

  tipo: z.enum(['FISICA', 'JURIDICA']).optional(),

  activo: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),

  ciudad: z
    .string()
    .trim()
    .max(100)
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

export type FiltrosClienteInput = z.infer<typeof FiltrosClienteSchema>;
