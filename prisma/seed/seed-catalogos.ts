/**
 * Seed de catálogos base por tenant.
 * Inserta: 20 marcas + 10 categorías de equipo + 7 tipos de servicio.
 *
 * Idempotente: usa upserts, se puede ejecutar múltiples veces.
 *
 * Uso: pnpm db:seed:catalogos
 */
import { prismaRaw } from '../../src/shared/db/client';
import { CATEGORIAS } from './data/categorias';
import { MARCAS } from './data/marcas';
import { TIPOS_SERVICIO } from './data/tipos-servicio';
import { logInfo, logOk, logSeccion } from './utils';

// ═══════════════════════════════════════════════════════════════
// MARCAS
// ═══════════════════════════════════════════════════════════════

async function seedMarcas(tenantId: string, tenantSlug: string): Promise<number> {
  let count = 0;
  for (const marca of MARCAS) {
    await prismaRaw.catMarca.upsert({
      where: { tenantId_nombre: { tenantId, nombre: marca.nombre } },
      update: { activo: true },
      create: { tenantId, nombre: marca.nombre, activo: true },
    });
    count++;
  }
  logInfo(`  [${tenantSlug}] ${count} marcas insertadas/actualizadas`);
  return count;
}

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS
// ═══════════════════════════════════════════════════════════════

async function seedCategorias(tenantId: string, tenantSlug: string): Promise<number> {
  let count = 0;
  for (const categoria of CATEGORIAS) {
    await prismaRaw.catCategoriaEquipo.upsert({
      where: { tenantId_nombre: { tenantId, nombre: categoria.nombre } },
      update: { descripcion: categoria.descripcion, activo: true },
      create: {
        tenantId,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        activo: true,
        esSistema: false,
      },
    });
    count++;
  }
  logInfo(`  [${tenantSlug}] ${count} categorías insertadas/actualizadas`);
  return count;
}

// ═══════════════════════════════════════════════════════════════
// TIPOS DE SERVICIO
// ═══════════════════════════════════════════════════════════════

async function seedTiposServicio(tenantId: string, tenantSlug: string): Promise<number> {
  let count = 0;
  for (const tipo of TIPOS_SERVICIO) {
    await prismaRaw.catTipoServicio.upsert({
      where: { tenantId_nombre: { tenantId, nombre: tipo.nombre } },
      update: { descripcion: tipo.descripcion, activo: true },
      create: {
        tenantId,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        activo: true,
        esSistema: false,
      },
    });
    count++;
  }
  logInfo(`  [${tenantSlug}] ${count} tipos de servicio insertados/actualizados`);
  return count;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  const inicio = Date.now();

  logSeccion('SEED CATÁLOGOS — marcas + categorías + tipos de servicio');

  // Obtener todos los tenants activos
  const tenants = await prismaRaw.tenant.findMany({
    where: { activo: true },
    select: { id: true, slug: true },
    orderBy: { slug: 'asc' },
  });

  if (tenants.length === 0) {
    console.error('❌ No hay tenants activos. Ejecuta `pnpm db:seed` primero.');
    process.exit(1);
  }

  logInfo(`Tenants encontrados: ${tenants.length}`);

  let totalMarcas = 0;
  let totalCategorias = 0;
  let totalTipos = 0;

  for (const tenant of tenants) {
    logSeccion(`Tenant: ${tenant.slug}`);
    totalMarcas += await seedMarcas(tenant.id, tenant.slug);
    totalCategorias += await seedCategorias(tenant.id, tenant.slug);
    totalTipos += await seedTiposServicio(tenant.id, tenant.slug);
  }

  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);

  logSeccion(`✅ SEED CATÁLOGOS COMPLETADO en ${duracion}s`);
  logOk(`Total marcas: ${totalMarcas}`);
  logOk(`Total categorías: ${totalCategorias}`);
  logOk(`Total tipos de servicio: ${totalTipos}`);
}

main()
  .then(async () => {
    await prismaRaw.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n❌ Error fatal en seed de catálogos:', err);
    await prismaRaw.$disconnect();
    process.exit(1);
  });
