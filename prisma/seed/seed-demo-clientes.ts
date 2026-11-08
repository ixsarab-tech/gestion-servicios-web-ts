/**
 * Seed de direcciones y equipos de prueba para los clientes existentes.
 *
 * Idempotente: usa búsqueda por (tenantId, cliente, calle) y (tenantId, numeroSerie)
 * para no duplicar registros.
 *
 * Uso: pnpm db:seed:demo-clientes
 */
import { prismaRaw } from '../../src/shared/db/client';
import { DIRECCIONES } from './data/direcciones';
import { EQUIPOS } from './data/equipos';
import { logInfo, logOk, logSeccion } from './utils';

// ═══════════════════════════════════════════════════════════════
// BUSCAR CLIENTE (por email o por nombre+apellidos)
// ═══════════════════════════════════════════════════════════════

async function buscarCliente(
  tenantId: string,
  criterio: { email?: string; nombre?: string; apellidos?: string },
): Promise<{ id: string; nombre: string } | null> {
  if (criterio.email) {
    return prismaRaw.cliente.findFirst({
      where: { tenantId, email: criterio.email, deletedAt: null },
      select: { id: true, nombre: true },
    });
  }

  if (criterio.nombre && criterio.apellidos) {
    return prismaRaw.cliente.findFirst({
      where: {
        tenantId,
        nombre: criterio.nombre,
        apellidos: criterio.apellidos,
        deletedAt: null,
      },
      select: { id: true, nombre: true },
    });
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// DIRECCIONES
// ═══════════════════════════════════════════════════════════════

async function seedDirecciones(tenantId: string, tenantSlug: string): Promise<number> {
  let count = 0;

  for (const dir of DIRECCIONES) {
    const cliente = await buscarCliente(tenantId, {
      email: dir.clienteEmail,
      nombre: dir.clienteNombre,
      apellidos: dir.clienteApellidos,
    });

    if (!cliente) {
      // El cliente no existe en este tenant — es normal, solo tiene datos en taller-demo
      continue;
    }

    // Buscar si ya existe la dirección (por clienteId + calle)
    const existente = await prismaRaw.clienteDireccion.findFirst({
      where: { tenantId, clienteId: cliente.id, calle: dir.calle },
      select: { id: true },
    });

    if (existente) {
      // Ya existe, actualizar
      await prismaRaw.clienteDireccion.update({
        where: { id: existente.id },
        data: {
          etiqueta: dir.etiqueta,
          ciudad: dir.ciudad,
          departamento: dir.departamento,
          pais: dir.pais,
          codigoPostal: dir.codigoPostal ?? null,
          referencias: dir.referencias ?? null,
          esPrincipal: dir.esPrincipal,
          activo: true,
        },
      });
    } else {
      // Crear nueva
      await prismaRaw.clienteDireccion.create({
        data: {
          tenantId,
          clienteId: cliente.id,
          etiqueta: dir.etiqueta,
          calle: dir.calle,
          ciudad: dir.ciudad,
          departamento: dir.departamento,
          pais: dir.pais,
          codigoPostal: dir.codigoPostal ?? null,
          referencias: dir.referencias ?? null,
          esPrincipal: dir.esPrincipal,
          activo: true,
        },
      });
    }

    count++;
  }

  logInfo(`  [${tenantSlug}] ${count} direcciones insertadas/actualizadas`);
  return count;
}

// ═══════════════════════════════════════════════════════════════
// EQUIPOS
// ═══════════════════════════════════════════════════════════════

async function seedEquipos(tenantId: string, tenantSlug: string): Promise<number> {
  let count = 0;

  // Cache de marcas y categorías para no consultar N veces
  const marcasCache = new Map<string, string>();
  const categoriasCache = new Map<string, string>();

  async function getMarcaId(nombre?: string): Promise<string | null> {
    if (!nombre) return null;
    if (marcasCache.has(nombre)) return marcasCache.get(nombre) ?? null;

    const marca = await prismaRaw.catMarca.findFirst({
      where: { tenantId, nombre },
      select: { id: true },
    });
    if (marca) {
      marcasCache.set(nombre, marca.id);
      return marca.id;
    }
    return null;
  }

  async function getCategoriaId(nombre?: string): Promise<string | null> {
    if (!nombre) return null;
    if (categoriasCache.has(nombre)) return categoriasCache.get(nombre) ?? null;

    const categoria = await prismaRaw.catCategoriaEquipo.findFirst({
      where: { tenantId, nombre },
      select: { id: true },
    });
    if (categoria) {
      categoriasCache.set(nombre, categoria.id);
      return categoria.id;
    }
    return null;
  }

  for (const eq of EQUIPOS) {
    const cliente = await buscarCliente(tenantId, {
      email: eq.clienteEmail,
      nombre: eq.clienteNombre,
      apellidos: eq.clienteApellidos,
    });

    if (!cliente) {
      // El cliente no existe en este tenant
      continue;
    }

    const marcaId = await getMarcaId(eq.marcaNombre);
    const categoriaId = await getCategoriaId(eq.categoriaNombre);

    // Buscar si ya existe el equipo (por numeroSerie)
    const existente = await prismaRaw.clienteEquipo.findFirst({
      where: { tenantId, numeroSerie: eq.numeroSerie },
      select: { id: true },
    });

    const data = {
      tenantId,
      clienteId: cliente.id,
      marcaId,
      categoriaId,
      modelo: eq.modelo,
      numeroSerie: eq.numeroSerie,
      descripcion: eq.descripcion,
      observaciones: eq.observaciones ?? null,
      fechaAdquisicion: eq.fechaAdquisicion ? new Date(eq.fechaAdquisicion) : null,
      activo: true,
    };

    if (existente) {
      await prismaRaw.clienteEquipo.update({
        where: { id: existente.id },
        data,
      });
    } else {
      await prismaRaw.clienteEquipo.create({ data });
    }

    count++;
  }

  logInfo(`  [${tenantSlug}] ${count} equipos insertados/actualizados`);
  return count;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  const inicio = Date.now();

  logSeccion('SEED DEMO CLIENTES — direcciones + equipos');

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

  let totalDirecciones = 0;
  let totalEquipos = 0;

  for (const tenant of tenants) {
    logSeccion(`Tenant: ${tenant.slug}`);
    totalDirecciones += await seedDirecciones(tenant.id, tenant.slug);
    totalEquipos += await seedEquipos(tenant.id, tenant.slug);
  }

  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);

  logSeccion(`✅ SEED DEMO CLIENTES COMPLETADO en ${duracion}s`);
  logOk(`Total direcciones: ${totalDirecciones}`);
  logOk(`Total equipos: ${totalEquipos}`);
}

main()
  .then(async () => {
    await prismaRaw.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n❌ Error fatal en seed de demo clientes:', err);
    await prismaRaw.$disconnect();
    process.exit(1);
  });
