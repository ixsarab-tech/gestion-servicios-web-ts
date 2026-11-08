import { z } from 'zod';

/** Base sin refinements — para poder extender */
export const DireccionBaseObject = z.object({
  clienteId: z.string().min(1, 'Cliente requerido'),

  etiqueta: z.string().trim().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),

  calle: z.string().trim().min(1, 'Requerido').max(255, 'Máximo 255 caracteres'),

  ciudad: z.string().trim().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),

  departamento: z
    .string()
    .trim()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  pais: z.string().trim().length(2, 'Código ISO de 2 letras').default('NI'),

  codigoPostal: z
    .string()
    .trim()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  referencias: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  esPrincipal: z.boolean().default(false),
});

export const CrearDireccionSchema = DireccionBaseObject;
export type CrearDireccionInput = z.infer<typeof CrearDireccionSchema>;

export const EditarDireccionSchema = DireccionBaseObject.extend({
  id: z.string().min(1, 'ID requerido'),
});
export type EditarDireccionInput = z.infer<typeof EditarDireccionSchema>;
