import { z } from 'zod';

export const CrearDiagnosticoSchema = z.object({
  ordenId: z.string().min(1, 'Orden requerida'),
  pruebasRealizadas: z
    .string()
    .trim()
    .max(5000, 'Máximo 5000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  voltajesMedidos: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  componentesDanados: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  observaciones: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type CrearDiagnosticoInput = z.infer<typeof CrearDiagnosticoSchema>;

export const EditarDiagnosticoSchema = CrearDiagnosticoSchema.extend({
  id: z.string().min(1, 'ID requerido'),
  conclusion: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type EditarDiagnosticoInput = z.infer<typeof EditarDiagnosticoSchema>;

export const CompletarDiagnosticoSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  conclusion: z
    .string()
    .trim()
    .min(10, 'La conclusión debe tener al menos 10 caracteres')
    .max(2000, 'Máximo 2000 caracteres'),
});

export type CompletarDiagnosticoInput = z.infer<typeof CompletarDiagnosticoSchema>;
