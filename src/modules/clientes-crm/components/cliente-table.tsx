import Link from 'next/link';
import { Pencil, Users } from 'lucide-react';

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

import type { ClienteResumen } from '../types';

interface ClienteTableProps {
  clientes: ClienteResumen[];
}

export function ClienteTable({ clientes }: ClienteTableProps) {
  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Users className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No hay clientes que mostrar</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/clientes/nuevo">Crear el primero</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="hidden text-center md:table-cell">Equipos</TableHead>
            <TableHead className="hidden text-center md:table-cell">Direcciones</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="w-20 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => {
            const nombreCompleto = cliente.razonSocial
              ? cliente.razonSocial
              : `${cliente.nombre} ${cliente.apellidos ?? ''}`.trim();

            return (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">
                  <Link href={`/clientes/${cliente.id}`} className="hover:underline">
                    {nombreCompleto}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{cliente.telefono}</span>
                    {cliente.email && (
                      <span className="text-xs text-muted-foreground">{cliente.email}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">
                    {cliente.tipo === 'JURIDICA' ? 'Jurídica' : 'Física'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-center md:table-cell">
                  {cliente.totalEquipos}
                </TableCell>
                <TableCell className="hidden text-center md:table-cell">
                  {cliente.totalDirecciones}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={cliente.activo ? 'default' : 'secondary'}>
                    {cliente.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link href={`/clientes/${cliente.id}/editar`} aria-label="Editar">
                      <Pencil className="h-4 w-4" />
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
