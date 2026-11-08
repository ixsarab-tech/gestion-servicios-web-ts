import Link from 'next/link';
import { connection } from 'next/server';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MarcaTable } from '@/modules/catalogos/components/marca-table';
import { FiltrosMarcaSchema } from '@/modules/catalogos/schemas/marca.schema';
import { listarMarcas } from '@/modules/catalogos/services/marca.service';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = { title: 'Marcas' };
export const instant = false;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MarcasPage({ searchParams }: PageProps) {
  await connection();
  const user = await requirePermission('catalogos:marcas:ver');
  const rawParams = await searchParams;
  const filtros = FiltrosMarcaSchema.parse(rawParams);

  const result = await runAsTenant(user, () => listarMarcas(filtros));

  const puedeCrear = user.permisos.includes('catalogos:marcas:crear');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marcas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? 'marca' : 'marcas'} registradas
          </p>
        </div>
        {puedeCrear && (
          <Button asChild>
            <Link href="/catalogos/marcas/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva marca
            </Link>
          </Button>
        )}
      </div>

      <MarcaTable
        marcas={result.items}
        pagination={{
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          pageSize: result.pageSize,
          basePath: '/catalogos/marcas',
          searchParams: {
            busqueda: filtros.busqueda,
            activo: filtros.activo !== undefined ? String(filtros.activo) : undefined,
          },
        }}
      />
    </div>
  );
}
