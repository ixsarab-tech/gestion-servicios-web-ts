'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Loader2,
  Send,
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

import { eliminarCotizacionAction } from '../actions/eliminar-cotizacion.action';
import { enviarCotizacionAction } from '../actions/enviar-cotizacion.action';
import type { CotizacionConRelaciones } from '../types';
import { AprobarCotizacionDialog } from './aprobar-cotizacion-dialog';
import { CotizacionesTimeline } from './cotizaciones-timeline';
import { RechazarCotizacionDialog } from './rechazar-cotizacion-dialog';

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida',
};

const ESTADO_VARIANT: Record<string, 'outline' | 'secondary' | 'default' | 'destructive'> = {
  BORRADOR: 'outline',
  ENVIADA: 'secondary',
  APROBADA: 'default',
  RECHAZADA: 'destructive',
  VENCIDA: 'outline',
};

interface CotizacionDetalleProps {
  cotizacion: CotizacionConRelaciones;
  puedeEnviar: boolean;
  puedeAprobar: boolean;
  puedeRechazar: boolean;
  puedeEliminar: boolean;
  defaultExpanded?: boolean;
}

function fmt(d?: Date | string | null) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function CotizacionDetalle({
  cotizacion,
  puedeEnviar,
  puedeAprobar,
  puedeRechazar,
  puedeEliminar,
  defaultExpanded = false,
}: CotizacionDetalleProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isPending, startTransition] = useTransition();

  const esBorrador = cotizacion.estado === 'BORRADOR';
  const esEnviada = cotizacion.estado === 'ENVIADA';
  const formatear = (n: number) => formatearMonto(n, cotizacion.moneda as 'NIO' | 'USD');

  function handleEnviar() {
    startTransition(async () => {
      const result = await enviarCotizacionAction({ id: cotizacion.id });
      if (!result.success) {
        toast.error('No se pudo enviar', { description: result.error });
        return;
      }
      toast.success('Cotización enviada');
      router.refresh();
    });
  }

  function handleEliminar() {
    if (!window.confirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.')) return;
    startTransition(async () => {
      const result = await eliminarCotizacionAction({ id: cotizacion.id });
      if (!result.success) {
        toast.error('No se pudo eliminar', { description: result.error });
        return;
      }
      toast.success('Cotización eliminada');
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
          <CardTitle className="text-base">Cotización</CardTitle>
          <Badge variant={ESTADO_VARIANT[cotizacion.estado]}>
            {ESTADO_LABEL[cotizacion.estado]}
          </Badge>
          <span className="text-sm font-semibold">{formatear(cotizacion.total)}</span>
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" /> {fmt(cotizacion.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {esBorrador && puedeEnviar && (
            <Button size="sm" variant="outline" onClick={handleEnviar} disabled={isPending}>
              {isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Send className="mr-1 h-3 w-3" />}
              Enviar
            </Button>
          )}
          {esEnviada && puedeAprobar && (
            <AprobarCotizacionDialog
              cotizacionId={cotizacion.id}
              folio={cotizacion.orden.folio}
              total={cotizacion.total}
              moneda={cotizacion.moneda}
              formatearMonto={formatear}
            />
          )}
          {esEnviada && puedeRechazar && (
            <RechazarCotizacionDialog cotizacionId={cotizacion.id} folio={cotizacion.orden.folio} />
          )}
          {esBorrador && puedeEliminar && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEliminar}
              disabled={isPending}
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <CotizacionesTimeline estado={cotizacion.estado} />

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
              Items ({cotizacion.items.length})
            </p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">P. unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cotizacion.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.concepto}</div>
                        {item.descripcion && (
                          <div className="text-muted-foreground text-xs">{item.descripcion}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                      <TableCell className="text-right">{formatear(item.precioUnitario)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatear(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatear(cotizacion.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (15%)</span>
                <span>{formatear(cotizacion.iva)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{formatear(cotizacion.total)}</span>
              </div>
            </div>
          </div>

          {cotizacion.notas && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Notas</p>
              <p className="text-sm whitespace-pre-wrap">{cotizacion.notas}</p>
            </div>
          )}

          {cotizacion.validaHasta && (
            <p className="text-muted-foreground text-xs">
              Válida hasta: {fmt(cotizacion.validaHasta)}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
