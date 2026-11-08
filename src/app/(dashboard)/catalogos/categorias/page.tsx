import Link from 'next/link';
import { connection } from 'next/server';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CategoriaTable } from '@/modules/catalogos/components/categoria-table';
import { FiltrosCategoriaSchema } from '@/modules/catalogos/schemas/categoria.schema';
import { listarCategorias } from '@/modules/catalogos/services/categoria.service';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = { title: 'Categorías' };
export const instant = false;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoriasPage({ searchParams }: PageProps) {
  await connection();
  const user = await requirePermission('catalogos:categorias:ver');
  const rawParams = await searchParams;
  const filtros = FiltrosCategoriaSchema.parse(rawParams);

  const result = await runAsTenant(user, () => listarCategorias(filtros));

  const puedeCrear = user.permisos.includes('catalogos:categorias:crear');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? 'categoría' : 'categorías'} registradas
          </p>
        </div>
        {puedeCrear && (
          <Button asChild>
            <Link href="/catalogos/categorias/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Link>
          </Button>
        )}
      </div>

      <CategoriaTable
        categorias={result.items}
        pagination={{
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          pageSize: result.pageSize,
          basePath: '/catalogos/categorias',
          searchParams: {
            busqueda: filtros.busqueda,
            activo: filtros.activo !== undefined ? String(filtros.activo) : undefined,
          },
        }}
      />
    </div>
  );
}
