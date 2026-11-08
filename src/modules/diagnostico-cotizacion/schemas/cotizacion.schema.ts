import { z } from 'zod';

import { CotizacionItemBaseObject } from './cotizacion-item.schema';

export const EstadoCotizacionEnum = z.enum([
  'BORRADOR',
  'ENVIADA',
  'APROBADA',
  'RECHAZADA',
  'VENCIDA',
]);
export type EstadoCotizacionType = z.infer<typeof EstadoCotizacionEnum>;

export const MonedaEnum = z.enum(['NIO', 'USD']);
export type MonedaType = z.infer<typeof MonedaEnum>;

export const CrearCotizacionSchema = z.object({
  ordenId: z.string().min(1, 'Orden requerida'),
  diagnosticoId: z.string().min(1).optional(),
  notas: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  validaHasta: z.coerce.date().optional(),
  moneda: MonedaEnum.default('NIO'),
  items: z.array(CotizacionItemBaseObject).min(1, 'Agrega al menos un ítem'),
});
export type CrearCotizacionInput = z.infer<typeof CrearCotizacionSchema>;

export const EditarCotizacionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  notas: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  validaHasta: z.coerce.date().optional().nullable(),
  moneda: MonedaEnum.optional(),
});
export type EditarCotizacionInput = z.infer<typeof EditarCotizacionSchema>;

export const EnviarCotizacionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type EnviarCotizacionInput = z.infer<typeof EnviarCotizacionSchema>;

export const AprobarCotizacionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type AprobarCotizacionInput = z.infer<typeof AprobarCotizacionSchema>;

export const RechazarCotizacionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  motivo: z
    .string()
    .trim()
    .min(10, 'El motivo debe tener al menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
});
export type RechazarCotizacionInput = z.infer<typeof RechazarCotizacionSchema>;

export const EliminarCotizacionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type EliminarCotizacionInput = z.infer<typeof EliminarCotizacionSchema>;

export const AgregarItemSchema = CotizacionItemBaseObject.extend({
  cotizacionId: z.string().min(1, 'Cotización requerida'),
});
export type AgregarItemInput = z.infer<typeof AgregarItemSchema>;

export const EliminarItemSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type EliminarItemInput = z.infer<typeof EliminarItemSchema>;

export const FiltrosCotizacionSchema = z.object({
  busqueda: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  estado: EstadoCotizacionEnum.optional(),
  ordenId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export type FiltrosCotizacionInput = z.infer<typeof FiltrosCotizacionSchema>;

