import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma, prismaRaw } from '@/shared/db/client';
import { runWithTenant } from '@/shared/tenant/context';

/**
 * IDs de los tenants creados por el seed base.
 */
let tallerDemoId: string;
let tallerNorteId: string;

/**
 * Sufijo único para no colisionar con datos existentes.
 */
const SUFFIX = `test-${Date.now()}`;

/**
 * Cliente de prueba creado en taller-demo.
 */
let clienteDemoId: string;

/**
 * Cliente de prueba creado en taller-norte.
 */
let clienteNorteId: string;

// ═══════════════════════════════════════════════════════════════
// SETUP / TEARDOWN
// ═══════════════════════════════════════════════════════════════

beforeAll(async () => {
  // Buscar los 2 tenants del seed
  const tenants = await prismaRaw.tenant.findMany({
    where: { slug: { in: ['taller-demo', 'taller-norte'] } },
    select: { id: true, slug: true },
  });

  const demo = tenants.find((t) => t.slug === 'taller-demo');
  const norte = tenants.find((t) => t.slug === 'taller-norte');

  if (!demo || !norte) {
    throw new Error('Seeds base no cargados. Ejecuta `pnpm db:seed` primero.');
  }

  tallerDemoId = demo.id;
  tallerNorteId = norte.id;

  // Crear un cliente de prueba en cada tenant (con prismaRaw, sin contexto tenant)
  const clienteDemo = await prismaRaw.cliente.create({
    data: {
      tenantId: tallerDemoId,
      tipo: 'FISICA',
      nombre: 'Cliente',
      apellidos: `Demo ${SUFFIX}`,
      telefono: '+50588880001',
    },
    select: { id: true },
  });
  clienteDemoId = clienteDemo.id;

  const clienteNorte = await prismaRaw.cliente.create({
    data: {
      tenantId: tallerNorteId,
      tipo: 'FISICA',
      nombre: 'Cliente',
      apellidos: `Norte ${SUFFIX}`,
      telefono: '+50588880002',
    },
    select: { id: true },
  });
  clienteNorteId = clienteNorte.id;
});

afterAll(async () => {
  // Limpieza: borrar los clientes de prueba
  await prismaRaw.cliente.deleteMany({
    where: { id: { in: [clienteDemoId, clienteNorteId] } },
  });
});

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe('Aislamiento multi-tenant', () => {
  it('findMany en taller-demo NO ve clientes de taller-norte', async () => {
    const clientes = await runWithTenant({ tenantId: tallerDemoId }, async () => {
      return prisma.cliente.findMany({
        where: { apellidos: { contains: SUFFIX } },
        select: { id: true, tenantId: true },
      });
    });

    expect(clientes).toHaveLength(1);
    expect(clientes[0]?.id).toBe(clienteDemoId);
    expect(clientes[0]?.tenantId).toBe(tallerDemoId);
  });

  it('findMany en taller-norte NO ve clientes de taller-demo', async () => {
    const clientes = await runWithTenant({ tenantId: tallerNorteId }, async () => {
      return prisma.cliente.findMany({
        where: { apellidos: { contains: SUFFIX } },
        select: { id: true, tenantId: true },
      });
    });

    expect(clientes).toHaveLength(1);
    expect(clientes[0]?.id).toBe(clienteNorteId);
    expect(clientes[0]?.tenantId).toBe(tallerNorteId);
  });

  it('findFirst en taller-demo NO encuentra cliente de taller-norte', async () => {
    const cliente = await runWithTenant({ tenantId: tallerDemoId }, async () => {
      return prisma.cliente.findFirst({
        where: { id: clienteNorteId },
      });
    });

    expect(cliente).toBeNull();
  });

  it('create inyecta automáticamente el tenantId correcto', async () => {
    const creado = await runWithTenant({ tenantId: tallerNorteId }, async () => {
      return prisma.cliente.create({
        data: {
          tipo: 'FISICA',
          nombre: 'Auto',
          apellidos: `AutoTenant ${SUFFIX}`,
          telefono: '+50588880003',
          // La extensión (proxy) inyecta tenantId en runtime
        } as never,
        select: { id: true, tenantId: true },
      });
    });

    expect(creado.tenantId).toBe(tallerNorteId);

    // Limpieza
    await prismaRaw.cliente.delete({ where: { id: creado.id } });
  });

  it('sin tenant en contexto lanza error al consultar modelo tenant-scoped', async () => {
    await expect(prisma.cliente.findMany()).rejects.toThrow(/tenant/i);
  });

  it('prismaRaw ignora el contexto y ve TODO (para admin global)', async () => {
    const clientes = await prismaRaw.cliente.findMany({
      where: { apellidos: { contains: SUFFIX } },
      select: { id: true },
    });

    expect(clientes.length).toBeGreaterThanOrEqual(2);
  });

  it('el conteo (count) también está aislado por tenant', async () => {
    const [countDemo, countNorte] = await Promise.all([
      runWithTenant({ tenantId: tallerDemoId }, () =>
        prisma.cliente.count({ where: { apellidos: { contains: SUFFIX } } }),
      ),
      runWithTenant({ tenantId: tallerNorteId }, () =>
        prisma.cliente.count({ where: { apellidos: { contains: SUFFIX } } }),
      ),
    ]);

    expect(countDemo).toBe(1);
    expect(countNorte).toBe(1);
  });
});
