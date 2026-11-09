import { z } from 'zod';

export const EstadoReparacionEnum = z.enum([
  'PENDIENTE',
  'EN_PROCESO',
  'COMPLETADA',
  'BLOQUEADA',
]);
export type EstadoReparacionType = z.infer<typeof EstadoReparacionEnum>;

export const CrearReparacionSchema = z.object({
  ordenId: z.string().min(1, 'Orden requerida'),
  diagnosticoId: z.string().min(1).optional(),
  tecnicoId: z.string().min(1).optional(), // si no viene, el service usa user.id
  notas: z
    .string()
    .trim()
    .max(5000, 'Máximo 5000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
export type CrearReparacionInput = z.infer<typeof CrearReparacionSchema>;

export const EditarReparacionSchema = CrearReparacionSchema.extend({
  id: z.string().min(1, 'ID requerido'),
});
export type EditarReparacionInput = z.infer<typeof EditarReparacionSchema>;

export const BloquearReparacionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  motivo: z
    .string()
    .trim()
    .min(10, 'El motivo debe tener al menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
});
export type BloquearReparacionInput = z.infer<typeof BloquearReparacionSchema>;

export const CompletarReparacionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  notas: z
    .string()
    .trim()
    .max(5000, 'Máximo 5000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
export type CompletarReparacionInput = z.infer<typeof CompletarReparacionSchema>;

export const EliminarReparacionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type EliminarReparacionInput = z.infer<typeof EliminarReparacionSchema>;

export const FiltrosReparacionSchema = z.object({
  estado: EstadoReparacionEnum.optional(),
  ordenId: z.string().optional(),
  tecnicoId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export type FiltrosReparacionInput = z.infer<typeof FiltrosReparacionSchema>;
