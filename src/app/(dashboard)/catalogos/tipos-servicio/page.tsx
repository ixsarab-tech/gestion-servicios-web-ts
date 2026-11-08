import Link from 'next/link';
import { connection } from 'next/server';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TipoServicioTable } from '@/modules/catalogos/components/tipo-servicio-table';
import { FiltrosTipoServicioSchema } from '@/modules/catalogos/schemas/tipo-servicio.schema';
import { listarTiposServicio } from '@/modules/catalogos/services/tipo-servicio.service';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = { title: 'Tipos de servicio' };
export const instant = false;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TiposServicioPage({ searchParams }: PageProps) {
  await connection();
  const user = await requirePermission('catalogos:tipos-servicio:ver');
  const rawParams = await searchParams;
  const filtros = FiltrosTipoServicioSchema.parse(rawParams);

  const result = await runAsTenant(user, () => listarTiposServicio(filtros));

  const puedeCrear = user.permisos.includes('catalogos:tipos-servicio:crear');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de servicio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? 'tipo' : 'tipos'} registrados
          </p>
        </div>
        {puedeCrear && (
          <Button asChild>
            <Link href="/catalogos/tipos-servicio/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo tipo
            </Link>
          </Button>
        )}
      </div>

      <TipoServicioTable
        tipos={result.items}
        pagination={{
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          pageSize: result.pageSize,
          basePath: '/catalogos/tipos-servicio',
          searchParams: {
            busqueda: filtros.busqueda,
            activo: filtros.activo !== undefined ? String(filtros.activo) : undefined,
          },
        }}
      />
    </div>
  );
}
