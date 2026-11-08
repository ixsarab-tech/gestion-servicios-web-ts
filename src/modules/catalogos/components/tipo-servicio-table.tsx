import Link from 'next/link';
import { Pencil, Tag } from 'lucide-react';

import { Pagination } from '@/components/shared/pagination';
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

import type { TipoServicioResumen } from '../types';

interface TipoServicioTableProps {
  tipos: TipoServicioResumen[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    basePath: string;
    searchParams?: Record<string, string | undefined>;
  };
}

export function TipoServicioTable({ tipos, pagination }: TipoServicioTableProps) {
  if (tipos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Tag className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No hay tipos de servicio registrados</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/catalogos/tipos-servicio/nuevo">Crear el primero</Link>
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
            <TableHead className="hidden md:table-cell">Descripción</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="w-20 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tipos.map((tipo) => (
            <TableRow key={tipo.id}>
              <TableCell className="font-medium">{tipo.nombre}</TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {tipo.descripcion ?? '—'}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={tipo.activo ? 'default' : 'secondary'}>
                  {tipo.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={`/catalogos/tipos-servicio/${tipo.id}/editar`} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
