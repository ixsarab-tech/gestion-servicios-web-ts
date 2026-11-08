import { z } from 'zod';

export const EditarOrdenSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  tecnicoAsignadoId: z
    .string()
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  fallaReportada: z
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
  fechaCompromiso: z.coerce.date().optional().nullable(),
});

export type EditarOrdenInput = z.infer<typeof EditarOrdenSchema>;
