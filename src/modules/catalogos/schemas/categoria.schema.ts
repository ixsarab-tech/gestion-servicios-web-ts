import { z } from 'zod';

/** Base sin refinements — para poder extender */
export const CategoriaBaseObject = z.object({
  nombre: z.string().trim().min(1, 'Requerido').max(80, 'Máximo 80 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(255, 'Máximo 255 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

/** Schema de creación */
export const CrearCategoriaSchema = CategoriaBaseObject;
export type CrearCategoriaInput = z.infer<typeof CrearCategoriaSchema>;

/** Schema de edición */
export const EditarCategoriaSchema = CategoriaBaseObject.extend({
  id: z.string().min(1, 'ID requerido'),
});
export type EditarCategoriaInput = z.infer<typeof EditarCategoriaSchema>;

/** Filtros de listado (con paginación) */
export const FiltrosCategoriaSchema = z.object({
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
export type FiltrosCategoriaInput = z.infer<typeof FiltrosCategoriaSchema>;
