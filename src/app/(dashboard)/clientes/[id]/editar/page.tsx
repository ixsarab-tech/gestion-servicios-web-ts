import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { ClienteFormEdit } from '@/modules/clientes-crm/components';
import { obtenerCliente } from '@/modules/clientes-crm/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const instant = false;

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const user = await requirePermission('clientes:editar');
  const { id } = await params;

  const cliente = await runAsTenant(user, () => obtenerCliente(id));
  if (!cliente) notFound();

  return (
    <div className="space-y-6">
      <ClienteFormEdit cliente={cliente} />
    </div>
  );
}
