import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CotizacionesSeccion } from '@/modules/diagnostico-cotizacion/components';
import { listarCotizacionesDeOrden } from '@/modules/diagnostico-cotizacion/services';
import { DiagnosticosSeccion } from '@/modules/diagnosticos/components';
import { listarDiagnosticosDeOrden } from '@/modules/diagnosticos/services';
import { CambiarEstadoDialog, OrdenDetalle, OrdenTimeline } from '@/modules/ordenes/components';
import { obtenerOrden } from '@/modules/ordenes/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrdenDetallePage({ params }: PageProps) {
  await connection();
  const user = await requirePermission('ordenes:ver');
  const { id } = await params;

  const orden = await runAsTenant(user, () => obtenerOrden(id));
  if (!orden) notFound();

  const [diagnosticos, cotizaciones] = await Promise.all([
    runAsTenant(user, () => listarDiagnosticosDeOrden(id)),
    runAsTenant(user, () => listarCotizacionesDeOrden(id)),
  ]);

  const puedeCambiarEstado = user.permisos.includes('ordenes:cambiar_estado');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/ordenes" aria-label="Volver">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-tight">{orden.folio}</h1>
            <p className="text-sm text-muted-foreground">Detalle de la orden de servicio</p>
          </div>
        </div>
        {puedeCambiarEstado && <CambiarEstadoDialog orden={orden} />}
      </div>

      <OrdenDetalle orden={orden} />

      <DiagnosticosSeccion
        ordenId={orden.id}
        ordenEstado={orden.estado}
        diagnosticos={diagnosticos}
        puedeCrear={user.permisos.includes('diagnosticos:crear')}
        puedeEditar={user.permisos.includes('diagnosticos:editar')}
        puedeCompletar={user.permisos.includes('diagnosticos:completar')}
      />

      <CotizacionesSeccion
        ordenId={orden.id}
        ordenEstado={orden.estado}
        cotizaciones={cotizaciones}
        puedeCrear={user.permisos.includes('presupuestos:crear')}
        puedeEnviar={user.permisos.includes('presupuestos:enviar')}
        puedeAprobar={user.permisos.includes('presupuestos:aprobar')}
        puedeRechazar={user.permisos.includes('presupuestos:rechazar')}
        puedeEliminar={user.permisos.includes('presupuestos:eliminar')}
      />

      <OrdenTimeline historial={orden.historialEstados} />
    </div>
  );
}
