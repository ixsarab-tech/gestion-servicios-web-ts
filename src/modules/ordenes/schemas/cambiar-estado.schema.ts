import { z } from 'zod';

export const EstadoOrdenEnum = z.enum([
  'BORRADOR',
  'RECIBIDO',
  'EN_DIAGNOSTICO',
  'PRESUPUESTADO',
  'APROBADO',
  'REPARANDO',
  'LISTO',
  'ENTREGADO',
  'CANCELADO',
]);

export type EstadoOrdenType = z.infer<typeof EstadoOrdenEnum>;

export const CambiarEstadoSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  nuevoEstado: EstadoOrdenEnum,
  comentario: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type CambiarEstadoInput = z.infer<typeof CambiarEstadoSchema>;
