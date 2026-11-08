/**
 * Seed base del sistema.
 * Crea: 3 tenants, ~57 permisos globales, 7 roles por tenant,
 * ~16 usuarios por tenant, asignaciones rol↔permiso, usuario↔rol,
 * y configuración por tenant.
 *
 * Idempotente: puede ejecutarse múltiples veces sin duplicar datos
 * (usa upserts).
 *
 * Uso: pnpm db:seed
 */
import { prismaRaw } from '../../src/shared/db/client';
import { CONFIGURACION_DEFAULT, CONFIGURACION_POR_TENANT } from './data/configuracion';
import { PERMISOS } from './data/permisos';
import { ROL_SUPER_ADMIN, ROLES_POR_TENANT, type RolSeed } from './data/roles';
import { TENANTS } from './data/tenants';
import { construirUsuariosDeTenant, SUPER_ADMIN } from './data/usuarios';
import { hashPassword, logInfo, logOk, logSeccion } from './utils';

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Demo1234!';

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 1 — Permisos globales
// ═══════════════════════════════════════════════════════════════

async function seedPermisos(): Promise<Map<string, string>> {
  logSeccion('1. Permisos globales');

  const permisosMap = new Map<string, string>();

  for (const permiso of PERMISOS) {
    const created = await prismaRaw.permiso.upsert({
      where: { codigo: permiso.codigo },
      update: {
        modulo: permiso.modulo,
        descripcion: permiso.descripcion,
      },
      create: {
        codigo: permiso.codigo,
        modulo: permiso.modulo,
        descripcion: permiso.descripcion,
      },
      select: { id: true, codigo: true },
    });
    permisosMap.set(created.codigo, created.id);
  }

  logOk(`${permisosMap.size} permisos`);
  return permisosMap;
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 2 — Tenants
// ═══════════════════════════════════════════════════════════════

async function seedTenant(slug: string, nombre: string, activo: boolean): Promise<string> {
  const tenant = await prismaRaw.tenant.upsert({
    where: { slug },
    update: { nombre, activo },
    create: { slug, nombre, activo },
    select: { id: true },
  });
  return tenant.id;
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 3 — Roles + asignación de permisos
// ═══════════════════════════════════════════════════════════════

async function seedRol(
  tenantId: string,
  rolSeed: RolSeed,
  permisosMap: Map<string, string>,
): Promise<string> {
  const rol = await prismaRaw.rol.upsert({
    where: { tenantId_nombre: { tenantId, nombre: rolSeed.nombre } },
    update: { descripcion: rolSeed.descripcion, esSistema: rolSeed.esSistema },
    create: {
      tenantId,
      nombre: rolSeed.nombre,
      descripcion: rolSeed.descripcion,
      esSistema: rolSeed.esSistema,
    },
    select: { id: true },
  });

  // Asignar permisos al rol
  for (const codigo of rolSeed.permisos) {
    const permisoId = permisosMap.get(codigo);
    if (!permisoId) {
      logInfo(`  ! Permiso desconocido: ${codigo} (rol ${rolSeed.nombre})`);
      continue;
    }

    await prismaRaw.rolPermiso.upsert({
      where: { rolId_permisoId: { rolId: rol.id, permisoId } },
      update: {},
      create: { rolId: rol.id, permisoId },
    });
  }

  return rol.id;
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 4 — Usuarios + asignación de roles
// ═══════════════════════════════════════════════════════════════

interface UsuarioInput {
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  roles: string[];
}

async function seedUsuario(
  tenantId: string,
  usuario: UsuarioInput,
  passwordHash: string,
  rolesMap: Map<string, string>,
): Promise<void> {
  const created = await prismaRaw.usuario.upsert({
    where: { tenantId_email: { tenantId, email: usuario.email } },
    update: {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      activo: true,
    },
    create: {
      tenantId,
      email: usuario.email,
      passwordHash,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      activo: true,
    },
    select: { id: true },
  });

  for (const rolNombre of usuario.roles) {
    const rolId = rolesMap.get(rolNombre);
    if (!rolId) {
      logInfo(`  ! Rol desconocido: ${rolNombre} (usuario ${usuario.email})`);
      continue;
    }

    await prismaRaw.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId: created.id, rolId } },
      update: {},
      create: { usuarioId: created.id, rolId },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 5 — Configuración por tenant
// ═══════════════════════════════════════════════════════════════

async function seedConfiguracionDeTenant(tenantId: string, slug: string): Promise<void> {
  const items = [...CONFIGURACION_DEFAULT, ...(CONFIGURACION_POR_TENANT[slug] ?? [])];

  for (const item of items) {
    await prismaRaw.configuracionTenant.upsert({
      where: { tenantId_clave: { tenantId, clave: item.clave } },
      update: { valor: item.valor },
      create: { tenantId, clave: item.clave, valor: item.valor },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  const inicio = Date.now();

  logSeccion('SEED BASE — gestion-servicios-web-ts');
  logInfo(`Contraseña de seed: ${SEED_PASSWORD}`);
  logInfo(`Entorno: ${process.env.NODE_ENV ?? 'development'}`);

  // 1. Permisos globales
  const permisosMap = await seedPermisos();

  // 2. Hashear password una sola vez
  logSeccion('2. Hasheando password');
  const passwordHash = await hashPassword(SEED_PASSWORD);
  logOk('Password hasheado con bcrypt (10 rounds)');

  // 3. Por cada tenant
  for (const t of TENANTS) {
    logSeccion(`3. Tenant: ${t.slug}`);
    const tenantId = await seedTenant(t.slug, t.nombre, t.activo);
    logOk(`Tenant creado/actualizado: ${t.nombre}`);

    // Roles
    const rolesMap = new Map<string, string>();
    const rolesDeEsteTenant: RolSeed[] = [ROL_SUPER_ADMIN, ...ROLES_POR_TENANT];

    for (const rolSeed of rolesDeEsteTenant) {
      const rolId = await seedRol(tenantId, rolSeed, permisosMap);
      rolesMap.set(rolSeed.nombre, rolId);
    }
    logOk(`${rolesDeEsteTenant.length} roles con permisos asignados`);

    // Usuarios
    const usuarios: UsuarioInput[] = construirUsuariosDeTenant(t.slug);

    // Solo en taller-demo: añadir el super admin global
    if (t.slug === 'taller-demo') {
      usuarios.push(SUPER_ADMIN);
    }

    for (const u of usuarios) {
      await seedUsuario(tenantId, u, passwordHash, rolesMap);
    }
    logOk(`${usuarios.length} usuarios con roles asignados`);

    // Configuración
    await seedConfiguracionDeTenant(tenantId, t.slug);
    logOk('Configuración aplicada');
  }

  // Cierre
  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);
  logSeccion(`✅ SEED COMPLETADO en ${duracion}s`);
}

main()
  .then(async () => {
    await prismaRaw.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n❌ Error fatal en seed:', err);
    await prismaRaw.$disconnect();
    process.exit(1);
  });
