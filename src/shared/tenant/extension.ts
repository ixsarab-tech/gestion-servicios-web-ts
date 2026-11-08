import type { PrismaClient } from '@/generated/prisma/client';

import { requireCurrentTenantId } from './context';

/**
 * Modelos tenant-scoped (camelCase, minúscula en la primera letra).
 * El proxy intercepta el acceso a estos modelos y envuelve sus métodos.
 *
 * Modelos EXCLUIDOS:
 *   - tenant (es el propio tenant)
 *   - permiso (catálogo global)
 *   - rolPermiso / usuarioRol (pivotes, se aíslan vía sus relaciones)
 */
const TENANT_SCOPED_MODELS = new Set([
  'usuario',
  'rol',
  'sesionLogin',
  'configuracionTenant',
  'bitacoraAuditoria',
  'cliente',
  'clienteDireccion',
  'clienteEquipo',
  'catCategoriaEquipo',
  'catMarca',
  'catTipoServicio',
]);

/**
 * Métodos de Prisma que reciben un `where` que debe filtrarse por tenantId.
 */
const METHODS_WITH_WHERE = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'deleteMany',
  'update',
  'delete',
]);

type AnyModel = Record<string, (...args: unknown[]) => unknown>;

/**
 * Envuelve un modelo tenant-scoped en un Proxy que intercepta los métodos
 * de Prisma y añade automáticamente el filtro/valor de `tenantId`.
 */
function wrapModel(model: unknown): unknown {
  return new Proxy(model as AnyModel, {
    get(target, prop: string | symbol, receiver) {
      const original = Reflect.get(target, prop, receiver);

      if (typeof prop !== 'string' || typeof original !== 'function') {
        return original;
      }

      // findUnique / findUniqueOrThrow: NO se inyecta (requieren where único exacto)
      if (prop === 'findUnique' || prop === 'findUniqueOrThrow') {
        return original;
      }

      // Helper: envuelve el throw síncrono en Promise.reject para consistencia con Prisma
      const safeTenantId = (): string | Promise<never> => {
        try {
          return requireCurrentTenantId();
        } catch (e) {
          return Promise.reject(e) as never;
        }
      };

      // Métodos con `where`
      if (METHODS_WITH_WHERE.has(prop)) {
        return function wrappedWithWhere(args: Record<string, unknown> = {}) {
          const tenantId = safeTenantId();
          if (tenantId instanceof Promise) return tenantId;
          const where = (args.where as Record<string, unknown>) ?? {};
          return original.call(target, { ...args, where: { ...where, tenantId } });
        };
      }

      // create
      if (prop === 'create') {
        return function wrappedCreate(args: Record<string, unknown> = {}) {
          const tenantId = safeTenantId();
          if (tenantId instanceof Promise) return tenantId;
          const data = (args.data as Record<string, unknown>) ?? {};
          return original.call(target, { ...args, data: { ...data, tenantId } });
        };
      }

      // createMany
      if (prop === 'createMany') {
        return function wrappedCreateMany(args: Record<string, unknown> = {}) {
          const tenantId = safeTenantId();
          if (tenantId instanceof Promise) return tenantId;
          const data = args.data;
          const newData = Array.isArray(data)
            ? data.map((d) => ({ ...(d as object), tenantId }))
            : { ...(data as object), tenantId };
          return original.call(target, { ...args, data: newData });
        };
      }

      // upsert
      if (prop === 'upsert') {
        return function wrappedUpsert(args: Record<string, unknown> = {}) {
          const tenantId = safeTenantId();
          if (tenantId instanceof Promise) return tenantId;
          return original.call(target, {
            ...args,
            where: { ...((args.where as object) ?? {}), tenantId },
            create: { ...((args.create as object) ?? {}), tenantId },
          });
        };
      }

      return original.bind(target);
    },
  });
}

/**
 * Envuelve el cliente Prisma en un Proxy que intercepta el acceso a los
 * modelos tenant-scoped y aplica las transformaciones automáticamente.
 *
 * A diferencia de `$extends`, este enfoque NO depende de la API interna de
 * Prisma y funciona con la combinación Prisma 7 + driver adapter.
 */
export function applyTenantExtension<T extends PrismaClient>(client: T): T {
  return new Proxy(client, {
    get(target, prop: string | symbol, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (typeof prop === 'string' && TENANT_SCOPED_MODELS.has(prop)) {
        return wrapModel(value);
      }

      return value;
    },
  }) as T;
}
