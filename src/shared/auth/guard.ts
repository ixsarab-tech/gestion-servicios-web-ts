import { forbidden, redirect } from 'next/navigation';

import { getSession } from './session';
import type { SessionUser } from './types';

/**
 * Requiere usuario autenticado. Si no hay sesión, redirige a /login.
 *
 * IMPORTANTE: solo se puede llamar desde Server Components o Server Actions.
 * En un servicio puro usar `getSession()` y manejar el null.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Requiere que el usuario tenga AL MENOS uno de los roles indicados.
 * Si no, renderiza `app/forbidden.tsx` con status 403.
 */
export async function requireRole(roles: readonly string[]): Promise<SessionUser> {
  const user = await requireAuth();
  const hasAny = roles.some((rol) => user.roles.includes(rol));
  if (!hasAny) {
    forbidden();
  }
  return user;
}

/**
 * Requiere que el usuario tenga un permiso concreto.
 * Si no, renderiza `app/forbidden.tsx` con status 403.
 */
export async function requirePermission(permiso: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (!user.permisos.includes(permiso)) {
    forbidden();
  }
  return user;
}

/**
 * Comprueba si un usuario tiene un permiso concreto.
 * NO lanza ni redirige — usar para condicionar UI (mostrar/ocultar botones).
 */
export function hasPermission(user: SessionUser, permiso: string): boolean {
  return user.permisos.includes(permiso);
}

/**
 * Comprueba si un usuario tiene AL MENOS uno de los roles indicados.
 * NO lanza ni redirige — usar para condicionar UI.
 */
export function hasRole(user: SessionUser, roles: readonly string[]): boolean {
  return roles.some((rol) => user.roles.includes(rol));
}
