import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { CategoriaFormEdit } from '@/modules/catalogos/components';
import { obtenerCategoria } from '@/modules/catalogos/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const instant = false;

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const user = await requirePermission('catalogos:categorias:editar');
  const { id } = await params;

  const categoria = await runAsTenant(user, () => obtenerCategoria(id));
  if (!categoria) notFound();

  return (
    <div className="space-y-6">
      <CategoriaFormEdit categoria={categoria} />
    </div>
  );
}
