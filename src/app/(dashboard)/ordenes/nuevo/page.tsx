import Link from 'next/link';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { listarTiposServicio } from '@/modules/catalogos/services/tipo-servicio.service';
import { OrdenFormWizard } from '@/modules/ordenes/components/orden-form-wizard';
import { requirePermission } from '@/shared/auth';
import { prisma } from '@/shared/db/client';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = { title: 'Nueva orden' };
export const instant = false;

export default async function NuevaOrdenPage() {
  await connection();
  const user = await requirePermission('ordenes:crear');

  const [clientes, tiposServicio] = await Promise.all([
    runAsTenant(user, () =>
      prisma.cliente.findMany({
        where: { deletedAt: null, activo: true },
        orderBy: { nombre: 'asc' },
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          razonSocial: true,
          telefono: true,
          equipos: {
            where: { activo: true },
            select: { id: true, descripcion: true, numeroSerie: true, modelo: true },
          },
          direcciones: {
            where: { activo: true },
            select: { id: true, etiqueta: true, calle: true, ciudad: true },
          },
        },
      }),
    ),
    runAsTenant(user, () => listarTiposServicio({ page: 1, pageSize: 200 })),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/ordenes" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva orden de servicio</h1>
          <p className="text-sm text-muted-foreground">
            Completa los pasos para registrar la recepción del equipo
          </p>
        </div>
      </div>

      <OrdenFormWizard clientes={clientes} tiposServicio={tiposServicio.items} />
    </div>
  );
}

