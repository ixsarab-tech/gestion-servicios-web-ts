import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { listarCategorias, listarMarcas } from '@/modules/catalogos/services';
import { ClienteDetalle } from '@/modules/clientes-crm/components';
import { obtenerCliente } from '@/modules/clientes-crm/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const instant = false;

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const user = await requirePermission('clientes:ver');
  const { id } = await params;

  const [cliente, categoriasPage, marcasPage] = await runAsTenant(user, () =>
    Promise.all([
      obtenerCliente(id),
      listarCategorias({ page: 1, pageSize: 200 }),
      listarMarcas({ page: 1, pageSize: 200 }),
    ]),
  );

  if (!cliente) notFound();

  return (
    <div className="space-y-6">
      <ClienteDetalle
        cliente={cliente}
        categorias={categoriasPage.items}
        marcas={marcasPage.items}
      />
    </div>
  );
}
