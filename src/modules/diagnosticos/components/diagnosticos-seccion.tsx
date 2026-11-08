'use client';

import { useState } from 'react';
import { Activity, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { DiagnosticoConRelaciones } from '../types';
import { DiagnosticoDetalle } from './diagnostico-detalle';
import { DiagnosticoFormDialog } from './diagnostico-form-dialog';

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

interface DiagnosticosSeccionProps {
  ordenId: string;
  ordenEstado: OrdenEstado;
  diagnosticos: DiagnosticoConRelaciones[];
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeCompletar: boolean;
}

const ESTADOS_QUE_PERMITEN_CREAR: OrdenEstado[] = ['RECIBIDO', 'EN_DIAGNOSTICO'];

export function DiagnosticosSeccion({
  ordenId,
  ordenEstado,
  diagnosticos,
  puedeCrear,
  puedeEditar,
  puedeCompletar,
}: DiagnosticosSeccionProps) {
  const [crearOpen, setCrearOpen] = useState(false);

  const hayActivo = diagnosticos.some((d) => d.estado === 'BORRADOR' || d.estado === 'EN_PROCESO');
  const estadoPermiteCrear = ESTADOS_QUE_PERMITEN_CREAR.includes(ordenEstado);
  const puedeIniciar = puedeCrear && estadoPermiteCrear && !hayActivo;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Activity className="h-5 w-5" />
          Diagnóstico técnico
        </h2>
        {puedeIniciar && (
          <Button onClick={() => setCrearOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Iniciar diagnóstico
          </Button>
        )}
      </div>

      {diagnosticos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Sin diagnósticos registrados para esta orden.
            </p>
            {estadoPermiteCrear && puedeCrear && (
              <Button className="mt-4" size="sm" onClick={() => setCrearOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Iniciar el primer diagnóstico
              </Button>
            )}
            {!estadoPermiteCrear && (
              <p className="mt-2 text-xs text-muted-foreground">
                El diagnóstico solo puede iniciarse cuando la orden está en estado
                &quot;Recibido&quot; o &quot;En diagnóstico&quot;.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {diagnosticos.map((d, idx) => (
            <DiagnosticoDetalle
              key={d.id}
              diagnostico={d}
              ordenId={ordenId}
              puedeEditar={puedeEditar}
              puedeCompletar={puedeCompletar}
              defaultExpanded={idx === 0}
            />
          ))}
        </div>
      )}

      <DiagnosticoFormDialog open={crearOpen} onOpenChange={setCrearOpen} ordenId={ordenId} />
    </div>
  );
}
