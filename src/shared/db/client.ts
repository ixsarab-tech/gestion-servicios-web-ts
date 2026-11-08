import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '@/generated/prisma/client';
import { serverEnv } from '@/shared/config';
import { applyTenantExtension } from '@/shared/tenant/extension';

/**
 * Construye el driver adapter de MariaDB/MySQL a partir de DATABASE_URL.
 */
function buildAdapter(): PrismaMariaDb {
  const url = new URL(serverEnv.DATABASE_URL);

  // En Windows, `localhost` puede resolver a IPv6 (::1), pero Docker Desktop
  // solo mapea el puerto en IPv4. Forzamos 127.0.0.1 para evitar timeouts.
  const host = url.hostname === 'localhost' ? '127.0.0.1' : url.hostname;

  return new PrismaMariaDb({
    host,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 10,
    acquireTimeout: 15_000, // Aumentamos a 15s para dar margen
    connectTimeout: 10_000, // Timeout de conexión inicial
    allowPublicKeyRetrieval: true, // 👈 CLAVE: permite al driver obtener la clave pública RSA de MySQL 8.4
  });
}

/**
 * Cliente Prisma base SIN extensión de tenant.
 * Usar SOLO para: autenticación, seeds, migraciones, admin global.
 */
function createRawClient(): PrismaClient {
  return new PrismaClient({
    adapter: buildAdapter(),
    log: serverEnv.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });
}

/**
 * Cache en globalThis para sobrevivir al HMR de Next.js en desarrollo.
 */
const globalForPrisma = globalThis as unknown as {
  prismaRaw: PrismaClient | undefined;
  prisma: ReturnType<typeof applyTenantExtension<PrismaClient>> | undefined;
};

const baseClient = globalForPrisma.prismaRaw ?? createRawClient();
const tenantClient = globalForPrisma.prisma ?? applyTenantExtension(baseClient);

if (serverEnv.NODE_ENV !== 'production') {
  globalForPrisma.prismaRaw = baseClient;
  globalForPrisma.prisma = tenantClient;
}

/**
 * Cliente tenant-scoped (default).
 * Todas las operaciones sobre modelos tenant-scoped inyectan tenantId automáticamente.
 * Requiere estar dentro de `runWithTenant(...)`.
 */
export const prisma = tenantClient;

/**
 * Cliente SIN filtro de tenant.
 * Para autenticación, seeds, migraciones y operaciones cross-tenant.
 */
export const prismaRaw = baseClient;
