import { z } from 'zod';

export const CotizacionItemBaseObject = z.object({
  concepto: z.string().trim().min(1, 'Requerido').max(255, 'Máximo 255 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  cantidad: z.coerce
    .number()
    .positive('La cantidad debe ser mayor a 0')
    .max(999999, 'Máximo 999,999'),
  precioUnitario: z.coerce
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(9999999999, 'Máximo 9,999,999,999'),
  orden: z.coerce.number().int().min(0).default(0).optional(),
});

export const CrearCotizacionItemSchema = CotizacionItemBaseObject;
export type CrearCotizacionItemInput = z.infer<typeof CrearCotizacionItemSchema>;

export const EditarCotizacionItemSchema = CotizacionItemBaseObject.extend({
  id: z.string().min(1, 'ID requerido'),
});
export type EditarCotizacionItemInput = z.infer<typeof EditarCotizacionItemSchema>;

export const EliminarCotizacionItemSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type EliminarCotizacionItemInput = z.infer<typeof EliminarCotizacionItemSchema>;
