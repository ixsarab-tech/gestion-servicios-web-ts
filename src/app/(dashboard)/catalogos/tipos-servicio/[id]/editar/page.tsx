import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { TipoServicioFormEdit } from '@/modules/catalogos/components';
import { obtenerTipoServicio } from '@/modules/catalogos/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const instant = false;

export default async function EditarTipoServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const user = await requirePermission('catalogos:tipos-servicio:editar');
  const { id } = await params;

  const tipo = await runAsTenant(user, () => obtenerTipoServicio(id));
  if (!tipo) notFound();

  return (
    <div className="space-y-6">
      <TipoServicioFormEdit tipo={tipo} />
    </div>
  );
}
