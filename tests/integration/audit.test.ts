import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { registrarAuditoria, registrarAuditoriaTx, sanitizeForAudit } from '@/shared/audit';
import { prismaRaw } from '@/shared/db/client';
import { withTransaction } from '@/shared/db/transaction';
import { runWithTenant } from '@/shared/tenant/context';

const SUFFIX = `audit-${Date.now()}`;

let tenantId: string;
let usuarioId: string;

beforeAll(async () => {
  const tenant = await prismaRaw.tenant.findUnique({
    where: { slug: 'taller-demo' },
    select: { id: true },
  });
  if (!tenant) {
    throw new Error('Tenant taller-demo no encontrado. Ejecuta `pnpm db:seed`.');
  }
  tenantId = tenant.id;

  const usuario = await prismaRaw.usuario.findFirst({
    where: { tenantId, email: 'admin@taller-demo.local' },
    select: { id: true },
  });
  if (!usuario) {
    throw new Error('Usuario admin no encontrado. Ejecuta `pnpm db:seed`.');
  }
  usuarioId = usuario.id;
});

afterAll(async () => {
  // Limpiar SOLO los registros de prueba (por el módulo único)
  await prismaRaw.bitacoraAuditoria.deleteMany({
    where: { modulo: { contains: SUFFIX } },
  });
});

describe('Auditoría', () => {
  it('registrarAuditoriaTx escribe un registro con todos los campos', async () => {
    await runWithTenant({ tenantId, usuarioId }, async () => {
      await withTransaction(async (tx) => {
        await registrarAuditoriaTx(
          tx,
          {
            modulo: SUFFIX,
            accion: 'CREATE',
            tablaAfectada: 'clientes',
            registroId: 'test-123',
            datosAnteriores: null,
            datosNuevos: { nombre: 'Test', email: 'test@test.com' },
          },
          { ipOrigen: '127.0.0.1', userAgent: 'vitest' },
        );
      });
    });

    const registro = await prismaRaw.bitacoraAuditoria.findFirst({
      where: { modulo: SUFFIX, registroId: 'test-123' },
    });

    expect(registro).toBeDefined();
    expect(registro!.tenantId).toBe(tenantId);
    expect(registro!.usuarioId).toBe(usuarioId);
    expect(registro!.accion).toBe('CREATE');
    expect(registro!.tablaAfectada).toBe('clientes');
    expect(registro!.registroId).toBe('test-123');
    expect(registro!.ipOrigen).toBe('127.0.0.1');
    expect(registro!.userAgent).toBe('vitest');
    expect(registro!.datosNuevos).toMatchObject({ nombre: 'Test' });
  });

  it('registrarAuditoria (standalone) escribe el registro', async () => {
    await runWithTenant({ tenantId, usuarioId }, async () => {
      await registrarAuditoria(
        {
          modulo: SUFFIX,
          accion: 'UPDATE',
          tablaAfectada: 'clientes',
          registroId: 'test-456',
          datosAnteriores: { nombre: 'Antes' },
          datosNuevos: { nombre: 'Después' },
        },
        { ipOrigen: '127.0.0.1', userAgent: 'vitest' },
      );
    });

    const registro = await prismaRaw.bitacoraAuditoria.findFirst({
      where: { modulo: SUFFIX, registroId: 'test-456' },
    });

    expect(registro).toBeDefined();
    expect(registro!.accion).toBe('UPDATE');
    expect(registro!.datosAnteriores).toMatchObject({ nombre: 'Antes' });
    expect(registro!.datosNuevos).toMatchObject({ nombre: 'Después' });
  });

  it('sanitizeForAudit redacta campos sensibles antes de escribir', async () => {
    await runWithTenant({ tenantId, usuarioId }, async () => {
      await registrarAuditoria(
        {
          modulo: SUFFIX,
          accion: 'CREATE',
          tablaAfectada: 'usuarios',
          registroId: 'test-secret',
          datosNuevos: sanitizeForAudit({
            email: 'test@test.com',
            passwordHash: 'ESTE_HASH_NO_DEBE_APARECER',
            password: 'secreto123',
          }),
        },
        { ipOrigen: '127.0.0.1' },
      );
    });

    const registro = await prismaRaw.bitacoraAuditoria.findFirst({
      where: { modulo: SUFFIX, registroId: 'test-secret' },
    });

    expect(registro).toBeDefined();
    const datos = registro!.datosNuevos as Record<string, unknown>;
    expect(datos.email).toBe('test@test.com');
    expect(datos.passwordHash).toBe('[REDACTED]');
    expect(datos.password).toBe('[REDACTED]');
  });

  it('la transacción hace ROLLBACK si una operación falla después de auditar', async () => {
    const countAntes = await prismaRaw.cliente.count({
      where: { apellidos: { contains: SUFFIX } },
    });
    const auditoriaAntes = await prismaRaw.bitacoraAuditoria.count({
      where: { modulo: SUFFIX, registroId: 'test-rollback' },
    });

    await expect(
      runWithTenant({ tenantId, usuarioId }, async () => {
        return withTransaction(async (tx) => {
          await tx.cliente.create({
            data: {
              tipo: 'FISICA',
              nombre: 'Rollback',
              apellidos: `RollbackTest ${SUFFIX}`,
              telefono: '+50588880099',
            } as never,
            select: { id: true },
          });

          await registrarAuditoriaTx(
            tx,
            {
              modulo: SUFFIX,
              accion: 'CREATE',
              tablaAfectada: 'clientes',
              registroId: 'test-rollback',
              datosNuevos: { test: true },
            },
            { ipOrigen: '127.0.0.1' },
          );

          throw new Error('Falló la operación de negocio');
        });
      }),
    ).rejects.toThrow('Falló la operación de negocio');

    // El cliente NO debe existir (rollback del create)
    const countDespues = await prismaRaw.cliente.count({
      where: { apellidos: { contains: SUFFIX } },
    });
    expect(countDespues).toBe(countAntes);

    // La auditoría TAMPOCO debe existir (rollback del insert)
    const auditoriaDespues = await prismaRaw.bitacoraAuditoria.count({
      where: { modulo: SUFFIX, registroId: 'test-rollback' },
    });
    expect(auditoriaDespues).toBe(auditoriaAntes);
  });

  it('la auditoría dentro de transacción falla si no hay tenant', async () => {
    await expect(
      withTransaction(async (tx) => {
        await registrarAuditoriaTx(tx, {
          modulo: SUFFIX,
          accion: 'CREATE',
          tablaAfectada: 'clientes',
          registroId: 'test-no-tenant',
          datosNuevos: { test: true },
        });
      }),
    ).rejects.toThrow(/tenant/i);
  });
});
