'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatearMonto } from '@/shared/constants/monedas';

import { eliminarReparacionAction } from '../actions/eliminar-reparacion.action';
import { eliminarRepuestoAction } from '../actions/eliminar-repuesto.action';
import type { ReparacionConRelaciones, RepuestoResumen } from '../types';
import { BloquearReparacionDialog } from './bloquear-reparacion-dialog';
import { CompletarReparacionDialog } from './completar-reparacion-dialog';
import { ReparacionFormDialog } from './reparacion-form-dialog';
import { ReparacionesTimeline } from './reparaciones-timeline';
import { RepuestoFormDialog } from './repuesto-form-dialog';

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  COMPLETADA: 'Completada',
  BLOQUEADA: 'Bloqueada',
};

const ESTADO_VARIANT: Record<string, 'outline' | 'secondary' | 'default' | 'destructive'> = {
  PENDIENTE: 'outline',
  EN_PROCESO: 'secondary',
  COMPLETADA: 'default',
  BLOQUEADA: 'destructive',
};

interface ReparacionDetalleProps {
  reparacion: ReparacionConRelaciones;
  puedeEditar: boolean;
  puedeCompletar: boolean;
  puedeBloquear: boolean;
  puedeEliminar: boolean;
}

function fmt(d?: Date | string | null) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ReparacionDetalle({
  reparacion,
  puedeEditar,
  puedeCompletar,
  puedeBloquear,
  puedeEliminar,
}: ReparacionDetalleProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addRepuestoOpen, setAddRepuestoOpen] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState<RepuestoResumen | null>(null);
  const [isPending, startTransition] = useTransition();

  const completada = reparacion.estado === 'COMPLETADA';
  const bloqueada = reparacion.estado === 'BLOQUEADA';
  const esPendiente = reparacion.estado === 'PENDIENTE';
  const esEnProceso = reparacion.estado === 'EN_PROCESO';

  function handleEliminarReparacion() {
    if (!window.confirm('¿Eliminar esta reparación? Esta acción no se puede deshacer.')) return;
    startTransition(async () => {
      const result = await eliminarReparacionAction({ id: reparacion.id });
      if (!result.success) {
        toast.error('No se pudo eliminar', { description: result.error });
        return;
      }
      toast.success('Reparación eliminada');
      router.refresh();
    });
  }

  function handleEliminarRepuesto(id: string) {
    if (!window.confirm('¿Eliminar este repuesto?')) return;
    startTransition(async () => {
      const result = await eliminarRepuestoAction({ id });
      if (!result.success) {
        toast.error('No se pudo eliminar', { description: result.error });
        return;
      }
      toast.success('Repuesto eliminado');
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader
        className="flex cursor-pointer flex-row items-center justify-between space-y-0"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-wrap items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <CardTitle className="text-base">Reparación</CardTitle>
          <Badge variant={ESTADO_VARIANT[reparacion.estado]}>
            {ESTADO_LABEL[reparacion.estado]}
          </Badge>
          <span className="text-sm font-semibold">
            {formatearMonto(reparacion.costoTotal, 'NIO')}
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" /> {fmt(reparacion.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!completada && puedeEditar && (
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1 h-3 w-3" /> Editar
            </Button>
          )}
          {esEnProceso && puedeCompletar && (
            <CompletarReparacionDialog reparacionId={reparacion.id} folio={reparacion.orden.folio} />
          )}
          {(esPendiente || esEnProceso) && puedeBloquear && (
            <BloquearReparacionDialog reparacionId={reparacion.id} folio={reparacion.orden.folio} />
          )}
          {esPendiente && puedeEliminar && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEliminarReparacion}
              disabled={isPending}
              aria-label="Eliminar reparación"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <ReparacionesTimeline estado={reparacion.estado} />

          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <span>
              <strong className="text-foreground">Técnico:</strong> {reparacion.tecnico.nombre}{' '}
              {reparacion.tecnico.apellidos ?? ''}
            </span>
            {reparacion.fechaInicio && (
              <span>
                <strong className="text-foreground">Inicio:</strong> {fmt(reparacion.fechaInicio)}
              </span>
            )}
            {reparacion.fechaFin && (
              <span>
                <strong className="text-foreground">Fin:</strong> {fmt(reparacion.fechaFin)}
              </span>
            )}
          </div>

          {reparacion.notas && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Notas</p>
              <p className="text-sm whitespace-pre-wrap">{reparacion.notas}</p>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Repuestos ({reparacion.repuestos.length})
              </p>
              {!completada && puedeEditar && (
                <Button size="sm" variant="outline" onClick={() => setAddRepuestoOpen(true)}>
                  <Plus className="mr-1 h-3 w-3" /> Agregar repuesto
                </Button>
              )}
            </div>

            {reparacion.repuestos.length === 0 ? (
              <p className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
                Sin repuestos registrados.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Costo unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      {!completada && puedeEditar && <TableHead className="w-24" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reparacion.repuestos.map((rep) => (
                      <TableRow key={rep.id}>
                        <TableCell>
                          <div className="font-medium">{rep.nombre}</div>
                          {rep.descripcion && (
                            <div className="text-muted-foreground text-xs">{rep.descripcion}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{rep.cantidad}</TableCell>
                        <TableCell className="text-right">
                          {formatearMonto(rep.costoUnitario, 'NIO')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatearMonto(rep.subtotal, 'NIO')}
                        </TableCell>
                        {!completada && puedeEditar && (
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setEditingRepuesto(rep)}
                              aria-label="Editar repuesto"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleEliminarRepuesto(rep.id)}
                              disabled={isPending}
                              aria-label="Eliminar repuesto"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {reparacion.repuestos.length > 0 && (
              <div className="mt-2 flex justify-end">
                <div className="text-sm">
                  <span className="text-muted-foreground">Costo total: </span>
                  <span className="font-semibold">{formatearMonto(reparacion.costoTotal, 'NIO')}</span>
                </div>
              </div>
            )}
          </div>

          {bloqueada && (
            <p className="text-destructive text-sm">
              ⚠️ Reparación bloqueada. Corrige la condición y vuelve a intentarlo.
            </p>
          )}
        </CardContent>
      )}

      <ReparacionFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        ordenId={reparacion.orden.id}
        reparacion={reparacion}
      />
      <RepuestoFormDialog
        open={addRepuestoOpen}
        onOpenChange={setAddRepuestoOpen}
        reparacionId={reparacion.id}
      />
      {editingRepuesto && (
        <RepuestoFormDialog
          open={!!editingRepuesto}
          onOpenChange={(o) => !o && setEditingRepuesto(null)}
          reparacionId={reparacion.id}
          repuesto={editingRepuesto}
        />
      )}
    </Card>
  );
}
