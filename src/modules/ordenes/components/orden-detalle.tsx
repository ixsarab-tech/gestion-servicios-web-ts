import { Building2, Calendar, ClipboardList, MapPin, Phone, User, Wrench } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { ESTADO_BADGE_VARIANT, ESTADO_LABELS } from '../constants/estados-orden';
import type { OrdenConRelaciones } from '../types';

interface OrdenDetalleProps {
  orden: OrdenConRelaciones;
}

export function OrdenDetalle({ orden }: OrdenDetalleProps) {
  const nombreCliente = orden.cliente.razonSocial
    ? orden.cliente.razonSocial
    : `${orden.cliente.nombre} ${orden.cliente.apellidos ?? ''}`.trim();

  const checklist = orden.checklistEstetico;
  const checklistItems = checklist
    ? [
        { label: 'Golpes visibles', value: checklist.golpes },
        { label: 'Rayones', value: checklist.rayones },
        { label: 'Pantalla rota', value: checklist.pantallaRota },
        { label: 'Carcasa dañada', value: checklist.carcasaDanada },
        { label: 'Humedad', value: checklist.humedad },
        { label: 'Faltan tornillos', value: checklist.faltanTornillos },
      ].filter((i) => i.value)
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ─── Columna principal ─── */}
      <div className="space-y-6 lg:col-span-2">
        {/* Cabecera */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="font-mono text-2xl">{orden.folio}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recibido el{' '}
                  {orden.fechaRecepcion
                    ? new Date(orden.fechaRecepcion).toLocaleDateString('es-NI')
                    : 'sin fecha'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={ESTADO_BADGE_VARIANT[orden.estado]}>
                  {ESTADO_LABELS[orden.estado]}
                </Badge>
                <Badge variant="outline">{orden.prioridad}</Badge>
                <Badge variant="secondary">{orden.modalidad}</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Cliente y Equipo */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{nombreCliente}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{orden.cliente.telefono}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">
                {orden.equipo.descripcion ?? orden.equipo.modelo ?? 'Equipo'}
              </p>
              {orden.equipo.marca && (
                <p className="text-muted-foreground">Marca: {orden.equipo.marca.nombre}</p>
              )}
              {orden.equipo.numeroSerie && (
                <p className="font-mono text-xs text-muted-foreground">
                  S/N: {orden.equipo.numeroSerie}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Falla y observaciones */}
        {(orden.fallaReportada || orden.observaciones) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                Detalles del servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orden.fallaReportada && (
                <div>
                  <p className="text-xs text-muted-foreground">Falla reportada</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{orden.fallaReportada}</p>
                </div>
              )}
              {orden.observaciones && (
                <>
                  {orden.fallaReportada && <Separator />}
                  <div>
                    <p className="text-xs text-muted-foreground">Observaciones</p>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{orden.observaciones}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Checklist + Accesorios */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-4 w-4" />
                Checklist estético
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {!checklist ? (
                <p className="text-muted-foreground">Sin checklist registrado</p>
              ) : checklistItems.length === 0 ? (
                <p className="text-muted-foreground">Sin daños reportados</p>
              ) : (
                <ul className="space-y-1">
                  {checklistItems.map((i) => (
                    <li key={i.label} className="flex items-center gap-2">
                      <span className="text-destructive">•</span>
                      <span>{i.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              {checklist?.notas && (
                <p className="mt-3 text-xs text-muted-foreground italic">{checklist.notas}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                Accesorios ({orden.accesorios.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {orden.accesorios.length === 0 ? (
                <p className="text-muted-foreground">Sin accesorios recibidos</p>
              ) : (
                <ul className="space-y-1">
                  {orden.accesorios.map((a) => (
                    <li key={a.id}>{a.nombre}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Sidebar ─── */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {orden.fechaRecepcion && (
              <div>
                <p className="text-xs text-muted-foreground">Recepción</p>
                <p className="font-medium">
                  {new Date(orden.fechaRecepcion).toLocaleDateString('es-NI')}
                </p>
              </div>
            )}
            {orden.fechaCompromiso && (
              <div>
                <p className="text-xs text-muted-foreground">Compromiso de entrega</p>
                <p className="font-medium">
                  {new Date(orden.fechaCompromiso).toLocaleDateString('es-NI')}
                </p>
              </div>
            )}
            {orden.fechaEntrega && (
              <div>
                <p className="text-xs text-muted-foreground">Entrega</p>
                <p className="font-medium">
                  {new Date(orden.fechaEntrega).toLocaleDateString('es-NI')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {orden.tecnicoAsignado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Técnico asignado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">
                {orden.tecnicoAsignado.nombre} {orden.tecnicoAsignado.apellidos ?? ''}
              </p>
            </CardContent>
          </Card>
        )}

        {orden.direccion && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Dirección de recolección
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{orden.direccion.etiqueta}</p>
              <p className="text-muted-foreground">{orden.direccion.calle}</p>
              <p className="text-muted-foreground">
                {orden.direccion.ciudad}
                {orden.direccion.departamento ? `, ${orden.direccion.departamento}` : ''}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
