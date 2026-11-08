import { z } from 'zod';

/** Base sin refinements — para poder extender */
export const EquipoBaseObject = z.object({
  clienteId: z.string().min(1, 'Cliente requerido'),

  categoriaId: z
    .string()
    .optional()
    .transform((v) => (v === '' || v === '__none__' ? undefined : v)),

  marcaId: z
    .string()
    .optional()
    .transform((v) => (v === '' || v === '__none__' ? undefined : v)),

  modelo: z
    .string()
    .trim()
    .max(120, 'Máximo 120 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  numeroSerie: z
    .string()
    .trim()
    .max(80, 'Máximo 80 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  descripcion: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  fechaAdquisicion: z.coerce.date().optional(),

  observaciones: z
    .string()
    .trim()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export const CrearEquipoSchema = EquipoBaseObject;
export type CrearEquipoInput = z.infer<typeof CrearEquipoSchema>;

export const EditarEquipoSchema = EquipoBaseObject.extend({
  id: z.string().min(1, 'ID requerido'),
});
export type EditarEquipoInput = z.infer<typeof EditarEquipoSchema>;
