import { z } from 'zod';

export const TipoEvidenciaEnum = z.enum(['FOTO', 'VIDEO', 'DOCUMENTO']);
export type TipoEvidenciaType = z.infer<typeof TipoEvidenciaEnum>;

export const CrearEvidenciaSchema = z.object({
  diagnosticoId: z.string().min(1, 'Diagnóstico requerido'),
  tipo: TipoEvidenciaEnum.default('FOTO'),
  url: z
    .url('URL inválida')
    .max(1000, 'Máximo 1000 caracteres')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'La URL debe empezar con http:// o https://',
    ),
  descripcion: z
    .string()
    .trim()
    .max(255, 'Máximo 255 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type CrearEvidenciaInput = z.infer<typeof CrearEvidenciaSchema>;

export const EliminarEvidenciaSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});

export type EliminarEvidenciaInput = z.infer<typeof EliminarEvidenciaSchema>;
