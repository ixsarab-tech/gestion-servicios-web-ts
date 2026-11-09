import { z } from 'zod';

/** Password: mínimo 8 chars, al menos 1 letra y 1 número */
const PasswordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(72, 'Máximo 72 caracteres')
  .refine((v) => /[a-zA-Z]/.test(v), 'Debe contener al menos una letra')
  .refine((v) => /\d/.test(v), 'Debe contener al menos un número');

export const EmailSchema = z
  .string()
  .trim()
  .min(1, 'Requerido')
  .email('Email inválido')
  .max(255, 'Máximo 255 caracteres')
  .toLowerCase();

export const NombreSchema = z
  .string()
  .trim()
  .min(1, 'Requerido')
  .max(120, 'Máximo 120 caracteres');

export const ApellidosSchema = z
  .string()
  .trim()
  .max(120, 'Máximo 120 caracteres')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const TelefonoSchema = z
  .string()
  .trim()
  .max(32, 'Máximo 32 caracteres')
  .optional()
  .or(z.literal('').transform(() => undefined));

// ═══════════════════════════════════════════════════════════════
// CREAR
// ═══════════════════════════════════════════════════════════════

export const CrearUsuarioSchema = z.object({
  email: EmailSchema,
  nombre: NombreSchema,
  apellidos: ApellidosSchema,
  telefono: TelefonoSchema,
  password: PasswordSchema,
  rolIds: z.array(z.string().min(1)).min(1, 'Asigna al menos un rol'),
});
export type CrearUsuarioInput = z.infer<typeof CrearUsuarioSchema>;

// ═══════════════════════════════════════════════════════════════
// EDITAR (sin password, sin roles — van por actions separadas)
// ═══════════════════════════════════════════════════════════════

export const EditarUsuarioSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  email: EmailSchema,
  nombre: NombreSchema,
  apellidos: ApellidosSchema,
  telefono: TelefonoSchema,
});
export type EditarUsuarioInput = z.infer<typeof EditarUsuarioSchema>;

// ═══════════════════════════════════════════════════════════════
// PASSWORD
// ═══════════════════════════════════════════════════════════════

export const CambiarPasswordSchema = z
  .object({
    id: z.string().min(1, 'ID requerido'),
    password: PasswordSchema,
    passwordConfirm: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  });
export type CambiarPasswordInput = z.infer<typeof CambiarPasswordSchema>;

// ═══════════════════════════════════════════════════════════════
// DESACTIVAR
// ═══════════════════════════════════════════════════════════════

export const DesactivarUsuarioSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type DesactivarUsuarioInput = z.infer<typeof DesactivarUsuarioSchema>;

export const ReactivarUsuarioSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});
export type ReactivarUsuarioInput = z.infer<typeof ReactivarUsuarioSchema>;

// ═══════════════════════════════════════════════════════════════
// ROLES (asignar / revocar)
// ═══════════════════════════════════════════════════════════════

export const AsignarRolSchema = z.object({
  usuarioId: z.string().min(1, 'Usuario requerido'),
  rolId: z.string().min(1, 'Rol requerido'),
});
export type AsignarRolInput = z.infer<typeof AsignarRolSchema>;

export const RevocarRolSchema = z.object({
  usuarioId: z.string().min(1, 'Usuario requerido'),
  rolId: z.string().min(1, 'Rol requerido'),
});
export type RevocarRolInput = z.infer<typeof RevocarRolSchema>;

// ═══════════════════════════════════════════════════════════════
// FILTROS
// ═══════════════════════════════════════════════════════════════

export const FiltrosUsuarioSchema = z.object({
  busqueda: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  activo: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  rolId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export type FiltrosUsuarioInput = z.infer<typeof FiltrosUsuarioSchema>;
