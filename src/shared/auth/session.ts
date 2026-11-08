import { AuthError } from '@/shared/errors';

import { auth } from './config';
import type { SessionUser } from './types';

/**
 * Obtiene la sesión actual o null si no hay usuario autenticado.
 * NO lanza excepciones — usar en Server Components que permiten anónimos.
 */
export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Obtiene la sesión actual o lanza AuthError si no hay usuario.
 * Usar en Server Actions / servicios que requieren autenticación.
 */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new AuthError('Debes iniciar sesión para continuar');
  }
  return user;
}
