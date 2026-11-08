import { z } from 'zod';

/**
 * Validación de variables de entorno con Zod.
 * Fail-fast: si falta una variable requerida, el servidor no arranca.
 *
 * ─────────────────────────────────────────────────────────────────
 * SERVER-ONLY: nunca importar este objeto desde un Client Component.
 * ─────────────────────────────────────────────────────────────────
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Base de datos
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  MIGRATE_DATABASE_URL: z.string().min(1, 'MIGRATE_DATABASE_URL es requerida').optional(),
  SHADOW_DATABASE_URL: z.string().min(1).optional(),

  // Auth.js
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET debe tener al menos 32 caracteres'),
  AUTH_URL: z.url('AUTH_URL debe ser una URL válida'),
  AUTH_TRUST_HOST: z
    .string()
    .transform((v) => v === 'true')
    .pipe(z.boolean()),

  // Seeds
  SEED_PASSWORD: z.string().min(8, 'SEED_PASSWORD debe tener al menos 8 caracteres'),
  SEED_LOCALE: z.string().default('es-NI'),
  SEED_FAKER_SEED: z.string().regex(/^\d+$/, 'SEED_FAKER_SEED debe ser numérico'),

  // Observabilidad
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'NEXT_PUBLIC_APP_NAME es requerida'),
  NEXT_PUBLIC_APP_URL: z.url('NEXT_PUBLIC_APP_URL debe ser una URL válida'),
});

/**
 * Variables server-only. Importar SOLO desde código server-side.
 * Intentar leerlas desde el cliente devuelve `undefined` por seguridad de Next.
 */
function parseServerEnv() {
  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `\n[env] Variables de entorno inválidas o faltantes:\n${issues}\n\nRevisa tu archivo .env.local\n`,
    );
  }

  return result.data;
}

/**
 * Variables client-safe (prefijo NEXT_PUBLIC_). Pueden importarse desde cualquier sitio.
 * Deben referenciarse de forma explícita para que Next las inline en el bundle.
 */
function parseClientEnv() {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `\n[env] Variables de entorno públicas inválidas o faltantes:\n${issues}\n\nRevisa tu archivo .env.local\n`,
    );
  }

  return result.data;
}

export const serverEnv = parseServerEnv();
export const clientEnv = parseClientEnv();

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
