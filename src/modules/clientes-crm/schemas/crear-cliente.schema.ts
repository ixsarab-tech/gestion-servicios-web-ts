import { z } from 'zod';

/**
 * Objeto base de creación de cliente.
 * SIN refinements — se exporta para poder extenderlo en otros schemas.
 */
export const ClienteBaseObject = z.object({
  tipo: z.enum(['FISICA', 'JURIDICA']).default('FISICA'),

  // Identificación fiscal (permisivo — acepta cualquier ID alfanumérico)
  rfc: z
    .string()
    .trim()
    .toUpperCase()
    .min(8, 'Mínimo 8 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Z0-9Ñ&-]+$/, 'Solo letras, números, guiones y &')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  razonSocial: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  // Datos personales
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),

  apellidos: z
    .string()
    .trim()
    .max(120, 'Máximo 120 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  // Contacto
  email: z
    .email('Email inválido')
    .trim()
    .toLowerCase()
    .max(255)
    .optional()
    .or(z.literal('').transform(() => undefined)),

  telefono: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Teléfono inválido (formato E.164)')
    .min(7)
    .max(32),

  telefonoAlternativo: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Teléfono inválido (formato E.164)')
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

/**
 * Esquema de creación con refinements.
 */
export const CrearClienteSchema = ClienteBaseObject.refine(
  (data) => {
    if (data.tipo === 'JURIDICA' && !data.razonSocial) {
      return false;
    }
    return true;
  },
  {
    message: 'La razón social es obligatoria para personas jurídicas',
    path: ['razonSocial'],
  },
);

export type CrearClienteInput = z.infer<typeof CrearClienteSchema>;
