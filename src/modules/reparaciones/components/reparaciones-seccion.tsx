'use client';

import { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { ReparacionConRelaciones } from '../types';
import { ReparacionDetalle } from './reparacion-detalle';
import { ReparacionFormDialog } from './reparacion-form-dialog';

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

interface ReparacionesSeccionProps {
  ordenId: string;
  ordenEstado: OrdenEstado;
  reparacion: ReparacionConRelaciones | null;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeCompletar: boolean;
  puedeBloquear: boolean;
  puedeEliminar: boolean;
}

const ESTADOS_QUE_PERMITEN_CREAR: OrdenEstado[] = ['APROBADO', 'REPARANDO'];
const ESTADOS_QUE_MUESTRAN: OrdenEstado[] = ['APROBADO', 'REPARANDO', 'LISTO', 'ENTREGADO'];

export function ReparacionesSeccion({
  ordenId,
  ordenEstado,
  reparacion,
  puedeCrear,
  puedeEditar,
  puedeCompletar,
  puedeBloquear,
  puedeEliminar,
}: ReparacionesSeccionProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const estadoMuestra = ESTADOS_QUE_MUESTRAN.includes(ordenEstado);
  const estadoPermiteCrear = ESTADOS_QUE_PERMITEN_CREAR.includes(ordenEstado);
  const puedeIniciar = puedeCrear && estadoPermiteCrear && !reparacion;

  // No mostrar la sección si la orden no está en un estado relevante
  if (!estadoMuestra && !reparacion) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Wrench className="h-5 w-5" />
          Reparación
        </h2>
        {puedeIniciar && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Iniciar reparación
          </Button>
        )}
      </div>

      {!reparacion ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Wrench className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Sin reparación registrada para esta orden.
            </p>
            {estadoPermiteCrear && puedeCrear && (
              <Button className="mt-4" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Iniciar reparación
              </Button>
            )}
            {!estadoPermiteCrear && (
              <p className="mt-2 text-xs text-muted-foreground">
                La reparación solo puede iniciarse cuando la orden está aprobada o en reparación.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <ReparacionDetalle
          reparacion={reparacion}
          puedeEditar={puedeEditar}
          puedeCompletar={puedeCompletar}
          puedeBloquear={puedeBloquear}
          puedeEliminar={puedeEliminar}
        />
      )}

      <ReparacionFormDialog open={createOpen} onOpenChange={setCreateOpen} ordenId={ordenId} />
    </div>
  );
}
