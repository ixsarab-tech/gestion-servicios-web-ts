'use client';

import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { CotizacionConRelaciones } from '../types';
import { CotizacionDetalle } from './cotizacion-detalle';
import { CotizacionFormDialog } from './cotizacion-form-dialog';

type OrdenEstado =
  | 'BORRADOR'
  | 'RECIBIDO'
  | 'EN_DIAGNOSTICO'
  | 'PRESUPUESTADO'
  | 'APROBADO'
  | 'REPARANDO'
  | 'LISTO'
  | 'ENTREGADO'
  | 'CANCELADO';

interface CotizacionesSeccionProps {
  ordenId: string;
  ordenEstado: OrdenEstado;
  cotizaciones: CotizacionConRelaciones[];
  puedeCrear: boolean;
  puedeEnviar: boolean;
  puedeAprobar: boolean;
  puedeRechazar: boolean;
  puedeEliminar: boolean;
}

const ESTADOS_QUE_PERMITEN_CREAR: OrdenEstado[] = ['EN_DIAGNOSTICO', 'PRESUPUESTADO'];

export function CotizacionesSeccion({
  ordenId,
  ordenEstado,
  cotizaciones,
  puedeCrear,
  puedeEnviar,
  puedeAprobar,
  puedeRechazar,
  puedeEliminar,
}: CotizacionesSeccionProps) {
  const [crearOpen, setCrearOpen] = useState(false);

  const hayActiva = cotizaciones.some(
    (c) => c.estado === 'BORRADOR' || c.estado === 'ENVIADA',
  );
  const estadoPermiteCrear = ESTADOS_QUE_PERMITEN_CREAR.includes(ordenEstado);
  const puedeIniciar = puedeCrear && estadoPermiteCrear && !hayActiva;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5" />
          Cotizaciones / Presupuestos
        </h2>
        {puedeIniciar && (
          <Button onClick={() => setCrearOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva cotización
          </Button>
        )}
      </div>

      {cotizaciones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Sin cotizaciones registradas para esta orden.
            </p>
            {estadoPermiteCrear && puedeCrear && !hayActiva && (
              <Button className="mt-4" size="sm" onClick={() => setCrearOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Crear la primera cotización
              </Button>
            )}
            {!estadoPermiteCrear && (
              <p className="mt-2 text-xs text-muted-foreground">
                Solo se puede cotizar cuando la orden está en &quot;En diagnóstico&quot; o
                &quot;Presupuestado&quot;.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cotizaciones.map((c, idx) => (
            <CotizacionDetalle
              key={c.id}
              cotizacion={c}
              puedeEnviar={puedeEnviar}
              puedeAprobar={puedeAprobar}
              puedeRechazar={puedeRechazar}
              puedeEliminar={puedeEliminar}
              defaultExpanded={idx === 0}
            />
          ))}
        </div>
      )}

      <CotizacionFormDialog
        open={crearOpen}
        onOpenChange={setCrearOpen}
        ordenId={ordenId}
      />
    </div>
  );
}
