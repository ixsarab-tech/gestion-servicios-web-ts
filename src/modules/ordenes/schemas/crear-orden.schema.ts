import { z } from 'zod';

export const ChecklistEsteticoSchema = z.object({
  golpes: z.boolean().default(false),
  rayones: z.boolean().default(false),
  pantallaRota: z.boolean().default(false),
  carcasaDanada: z.boolean().default(false),
  humedad: z.boolean().default(false),
  faltanTornillos: z.boolean().default(false),
  notas: z
    .string()
    .trim()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type ChecklistEsteticoInput = z.infer<typeof ChecklistEsteticoSchema>;

export const OrdenBaseObject = z.object({
  clienteId: z.string().min(1, 'Cliente requerido'),
  equipoId: z.string().min(1, 'Equipo requerido'),

  tipoServicioId: z
    .string()
    .optional()
    .transform((v) => (v === '' || v === '__none__' ? undefined : v)),

  direccionId: z
    .string()
    .optional()
    .transform((v) => (v === '' || v === '__none__' ? undefined : v)),

  modalidad: z.enum(['TALLER', 'DOMICILIO']).default('TALLER'),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
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
  fechaCompromiso: z.coerce.date().optional(),
  checklist: ChecklistEsteticoSchema.optional(),
  accesorios: z.array(z.string().trim().min(1).max(100)).default([]),
});

export const CrearOrdenSchema = OrdenBaseObject.refine(
  (data) => {
    if (data.modalidad === 'DOMICILIO' && !data.direccionId) {
      return false;
    }
    return true;
  },
  {
    message: 'La dirección es obligatoria para la modalidad a domicilio',
    path: ['direccionId'],
  },
);

export type CrearOrdenInput = z.infer<typeof CrearOrdenSchema>;
