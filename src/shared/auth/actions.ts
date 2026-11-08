'use server';

import { z } from 'zod';

const LoginSchema = z.object({
  tenantSlug: z.string().min(1, 'Requerido').max(64),
  email: z.email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
});

export interface LoginState {
  success: boolean;
  error?: string;
}

/**
 * NOTA: el signIn se ejecuta desde el cliente con `next-auth/react`.
 * Esta acción solo valida y devuelve OK/error.
 * El redirect lo maneja el cliente.
 */
export async function validateLoginInput(formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    tenantSlug: formData.get('tenantSlug'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  return { success: true };
}

export async function signOutAction(): Promise<void> {
  const { signOut } = await import('./config');
  await signOut({ redirectTo: '/login' });
}
