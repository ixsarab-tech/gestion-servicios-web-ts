import { z } from 'zod';

/** Base sin refinements — para poder extender */
export const MarcaBaseObject = z.object({
  nombre: z.string().trim().min(1, 'Requerido').max(80, 'Máximo 80 caracteres'),
});

/** Schema de creación */
export const CrearMarcaSchema = MarcaBaseObject;
export type CrearMarcaInput = z.infer<typeof CrearMarcaSchema>;

/** Schema de edición */
export const EditarMarcaSchema = MarcaBaseObject.extend({
  id: z.string().min(1, 'ID requerido'),
});
export type EditarMarcaInput = z.infer<typeof EditarMarcaSchema>;

/** Filtros de listado (con paginación) */
export const FiltrosMarcaSchema = z.object({
  busqueda: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  activo: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export type FiltrosMarcaInput = z.infer<typeof FiltrosMarcaSchema>;
