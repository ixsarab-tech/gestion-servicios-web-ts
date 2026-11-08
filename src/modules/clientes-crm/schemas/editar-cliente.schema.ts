import { z } from 'zod';

/**
 * Esquema de edición de cliente.
 * Todos los campos opcionales excepto el `id`.
 * Se declara explícitamente (no extendiendo) para evitar conflictos con
 * defaults/transforms y refinements de Zod 4.
 */
export const EditarClienteSchema = z.object({
  id: z.string().min(1, 'ID requerido'),

  tipo: z.enum(['FISICA', 'JURIDICA']).optional(),

  rfc: z
    .string()
    .trim()
    .toUpperCase()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  razonSocial: z
    .string()
    .trim()
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  nombre: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres')
    .optional(),

  apellidos: z
    .string()
    .trim()
    .max(120, 'Máximo 120 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  email: z
    .union([z.email('Email inválido'), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v)),

  telefono: z.string().trim().min(7).max(32).optional(),

  telefonoAlternativo: z
    .string()
    .trim()
    .optional()
    .or(z.literal('').transform(() => undefined)),

  fechaNacimiento: z.coerce.date().optional(),

  notas: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type EditarClienteInput = z.infer<typeof EditarClienteSchema>;
