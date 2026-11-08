import Link from 'next/link';
import { connection } from 'next/server';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ClienteTable } from '@/modules/clientes-crm/components/cliente-table';
import { FiltrosClienteSchema } from '@/modules/clientes-crm/schemas/filtros-cliente.schema';
import { listarClientes } from '@/modules/clientes-crm/services/cliente.service';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = {
  title: 'Clientes',
};
export const instant = false;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ClientesPage({ searchParams }: PageProps) {
  await connection();

  const user = await requirePermission('clientes:ver');
  const rawParams = await searchParams;
  const filtros = FiltrosClienteSchema.parse(rawParams);

  const resultado = await runAsTenant(user, () => listarClientes(filtros));

  const puedeCrear = user.permisos.includes('clientes:crear');

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {resultado.total} {resultado.total === 1 ? 'cliente' : 'clientes'} en total
          </p>
        </div>
        {puedeCrear && (
          <Button asChild>
            <Link href="/clientes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cliente
            </Link>
          </Button>
        )}
      </div>

      {/* ─── Tabla ─── */}
      <ClienteTable clientes={resultado.items} />

      {/* ─── Paginación ─── */}
      {resultado.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {resultado.page} de {resultado.totalPages}
          </p>
          <div className="flex gap-2">
            {resultado.hasPrev && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/clientes?page=${resultado.page - 1}&pageSize=${resultado.pageSize}`}>
                  Anterior
                </Link>
              </Button>
            )}
            {resultado.hasNext && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/clientes?page=${resultado.page + 1}&pageSize=${resultado.pageSize}`}>
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
