import { z } from 'zod';

export const RepuestoBaseObject = z.object({
  nombre: z.string().trim().min(1, 'Requerido').max(255, 'Máximo 255 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  cantidad: z.coerce
    .number()
    .int('Debe ser un entero')
    .positive('La cantidad debe ser mayor a 0')
    .max(999999, 'Máximo 999,999'),
  costoUnitario: z.coerce
    .number()
    .min(0, 'El costo no puede ser negativo')
    .max(9999999999, 'Máximo 9,999,999,999'),
});

export const AgregarRepuestoSchema = RepuestoBaseObject.extend({
  reparacionId: z.string().min(1, 'Reparación requerida'),
});
export type AgregarRepuestoInput = z.infer<typeof AgregarRepuestoSchema>;

export const EditarRepuestoSchema = RepuestoBaseObject.extend({
  id: z.string().min(1, 'ID requerido'),
});
export type EditarRepuestoInput = z.infer<typeof EditarRepuestoSchema>;

export const EliminarRepuestoSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type EliminarRepuestoInput = z.infer<typeof EliminarRepuestoSchema>;
