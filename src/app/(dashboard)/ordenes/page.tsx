import Link from 'next/link';
import { connection } from 'next/server';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OrdenFiltros, OrdenTable } from '@/modules/ordenes/components';
import { FiltrosOrdenSchema } from '@/modules/ordenes/schemas/filtros-orden.schema';
import { contarOrdenesPorEstado, listarOrdenes } from '@/modules/ordenes/services/orden.service';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = { title: 'Órdenes de Servicio' };
export const instant = false;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrdenesPage({ searchParams }: PageProps) {
  await connection();
  const user = await requirePermission('ordenes:ver');
  const rawParams = await searchParams;
  const filtros = FiltrosOrdenSchema.parse(rawParams);

  const [resultado, counts] = await Promise.all([
    runAsTenant(user, () => listarOrdenes(filtros)),
    runAsTenant(user, () => contarOrdenesPorEstado()),
  ]);

  const puedeCrear = user.permisos.includes('ordenes:crear');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de Servicio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {resultado.total} {resultado.total === 1 ? 'orden' : 'órdenes'}
            {filtros.estado ? ` en estado "${filtros.estado}"` : ' en total'}
          </p>
        </div>
        {puedeCrear && (
          <Button asChild>
            <Link href="/ordenes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva orden
            </Link>
          </Button>
        )}
      </div>

      <OrdenFiltros estadoActual={filtros.estado} counts={counts} />

      <OrdenTable ordenes={resultado.items} />

      {resultado.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {resultado.page} de {resultado.totalPages}
          </p>
          <div className="flex gap-2">
            {resultado.hasPrev && (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/ordenes?page=${resultado.page - 1}&pageSize=${resultado.pageSize}${filtros.estado ? `&estado=${filtros.estado}` : ''}`}
                >
                  Anterior
                </Link>
              </Button>
            )}
            {resultado.hasNext && (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/ordenes?page=${resultado.page + 1}&pageSize=${resultado.pageSize}${filtros.estado ? `&estado=${filtros.estado}` : ''}`}
                >
                  Siguiente
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
