import { AsyncLocalStorage } from 'node:async_hooks';

import { TenantError } from '@/shared/errors';

import type { TenantContext } from './types';

/**
 * Guardamos el AsyncLocalStorage en `globalThis` bajo un Symbol compartido.
 * Esto garantiza que aunque Turbopack cargue este módulo varias veces
 * (code-splitting), el storage sea SIEMPRE el mismo.
 */
const STORAGE_KEY = Symbol.for('app:tenantStorage');

interface GlobalWithTenantStorage {
  [STORAGE_KEY]?: AsyncLocalStorage<TenantContext>;
}

const globalRef = globalThis as unknown as GlobalWithTenantStorage;

if (!globalRef[STORAGE_KEY]) {
  globalRef[STORAGE_KEY] = new AsyncLocalStorage<TenantContext>();
}

const tenantStorage = globalRef[STORAGE_KEY] as AsyncLocalStorage<TenantContext>;

/**
 * Ejecuta un callback dentro del contexto de un tenant específico.
 */
export function runWithTenant<T>(ctx: TenantContext, fn: () => Promise<T>): Promise<T> {
  return tenantStorage.run(ctx, fn);
}

/**
 * Atajo: ejecuta con el tenant del usuario.
 */
export function runAsTenant<T>(
  user: { tenantId: string; id: string },
  fn: () => Promise<T>,
): Promise<T> {
  return runWithTenant({ tenantId: user.tenantId, usuarioId: user.id }, fn);
}

/**
 * Devuelve el tenant actual o `undefined`.
 */
export function getCurrentTenant(): TenantContext | undefined {
  return tenantStorage.getStore();
}

/**
 * Devuelve el tenantId actual o lanza TenantError.
 */
export function requireCurrentTenantId(): string {
  const ctx = tenantStorage.getStore();
  if (!ctx?.tenantId) {
    throw new TenantError('No hay contexto de tenant activo en este request');
  }
  return ctx.tenantId;
}

/**
 * Variante opcional.
 */
export function getCurrentTenantId(): string | undefined {
  return tenantStorage.getStore()?.tenantId;
}
