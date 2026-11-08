import Link from 'next/link';
import { ClipboardList, Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { ESTADO_BADGE_VARIANT, ESTADO_LABELS } from '../constants/estados-orden';
import type { OrdenResumen } from '../types';

interface OrdenTableProps {
  ordenes: OrdenResumen[];
}

export function OrdenTable({ ordenes }: OrdenTableProps) {
  if (ordenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <ClipboardList className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No hay órdenes registradas</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/ordenes/nuevo">Crear la primera</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Folio</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Equipo</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="hidden text-center lg:table-cell">Prioridad</TableHead>
            <TableHead className="hidden text-center lg:table-cell">Modalidad</TableHead>
            <TableHead className="hidden md:table-cell">Fecha</TableHead>
            <TableHead className="w-20 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenes.map((orden) => {
            const nombreCliente = orden.cliente.razonSocial
              ? orden.cliente.razonSocial
              : `${orden.cliente.nombre} ${orden.cliente.apellidos ?? ''}`.trim();

            return (
              <TableRow key={orden.id}>
                <TableCell className="font-mono text-xs font-medium">{orden.folio}</TableCell>
                <TableCell>
                  <Link href={`/ordenes/${orden.id}`} className="font-medium hover:underline">
                    {nombreCliente}
                  </Link>
                  <p className="text-xs text-muted-foreground">{orden.cliente.telefono}</p>
                </TableCell>
                <TableCell className="hidden text-sm md:table-cell">
                  {orden.equipo.descripcion ?? orden.equipo.modelo ?? 'Equipo'}
                  {orden.equipo.numeroSerie && (
                    <p className="font-mono text-xs text-muted-foreground">
                      {orden.equipo.numeroSerie}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={ESTADO_BADGE_VARIANT[orden.estado]}>
                    {ESTADO_LABELS[orden.estado]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-center lg:table-cell">
                  <Badge variant="outline">{orden.prioridad}</Badge>
                </TableCell>
                <TableCell className="hidden text-center lg:table-cell">
                  <Badge variant="secondary">{orden.modalidad}</Badge>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {new Date(orden.createdAt).toLocaleDateString('es-NI')}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link href={`/ordenes/${orden.id}`} aria-label="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
