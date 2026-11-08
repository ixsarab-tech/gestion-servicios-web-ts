import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { MarcaFormEdit } from '@/modules/catalogos/components';
import { obtenerMarca } from '@/modules/catalogos/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const instant = false;

export default async function EditarMarcaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const user = await requirePermission('catalogos:marcas:editar');
  const { id } = await params;

  const marca = await runAsTenant(user, () => obtenerMarca(id));
  if (!marca) notFound();

  return (
    <div className="space-y-6">
      <MarcaFormEdit marca={marca} />
    </div>
  );
}
