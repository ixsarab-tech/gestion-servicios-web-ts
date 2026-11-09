import { connection } from 'next/server';
import { Users } from 'lucide-react';

import { NuevoUsuarioButton } from '@/modules/usuarios-seguridad/components';
import { UsuarioTable } from '@/modules/usuarios-seguridad/components/usuario-table';
import { FiltrosUsuarioSchema } from '@/modules/usuarios-seguridad/schemas';
import { listarRoles, listarUsuarios } from '@/modules/usuarios-seguridad/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = { title: 'Usuarios' };
export const instant = false;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  await connection();
  const user = await requirePermission('usuarios:ver');
  const rawParams = await searchParams;
  const filtros = FiltrosUsuarioSchema.parse(rawParams);

  const [result, roles] = await runAsTenant(user, () =>
    Promise.all([listarUsuarios(filtros), listarRoles()]),
  );

  const puedeCrear = user.permisos.includes('usuarios:crear');
  const rolesMini = roles.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Users className="h-7 w-7" /> Usuarios
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {result.total} {result.total === 1 ? 'usuario' : 'usuarios'} registrados
          </p>
        </div>
        {puedeCrear && <NuevoUsuarioButton roles={rolesMini} />}
      </div>

      <UsuarioTable
        usuarios={result.items}
        pagination={{
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          pageSize: result.pageSize,
          basePath: '/usuarios',
          searchParams: {
            busqueda: filtros.busqueda,
            activo: filtros.activo !== undefined ? String(filtros.activo) : undefined,
            rolId: filtros.rolId,
          },
        }}
      />
    </div>
  );
}
