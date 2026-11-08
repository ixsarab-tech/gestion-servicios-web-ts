import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CambiarEstadoDialog, OrdenDetalle, OrdenTimeline } from '@/modules/ordenes/components';
import { obtenerOrden } from '@/modules/ordenes/services/orden.service';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = { title: 'Detalle de la orden' };
export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrdenDetallePage({ params }: PageProps) {
  await connection();
  const user = await requirePermission('ordenes:ver');
  const { id } = await params;

  const orden = await runAsTenant(user, () => obtenerOrden(id));

  if (!orden) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/ordenes" aria-label="Volver">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orden de servicio</h1>
            <p className="font-mono text-sm text-muted-foreground">{orden.folio}</p>
          </div>
        </div>
        <CambiarEstadoDialog orden={{ id: orden.id, estado: orden.estado }} />
      </div>

      <OrdenDetalle orden={orden} />

      <OrdenTimeline historial={orden.historialEstados} />
    </div>
  );
}
