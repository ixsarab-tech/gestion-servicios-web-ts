import Link from 'next/link';
import { FolderTree, Pencil } from 'lucide-react';

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

import type { CategoriaResumen } from '../types';

interface CategoriaTableProps {
  categorias: CategoriaResumen[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    basePath: string;
    searchParams?: Record<string, string | undefined>;
  };
}

export function CategoriaTable({ categorias, pagination }: CategoriaTableProps) {
  if (categorias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <FolderTree className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No hay categorías registradas</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/catalogos/categorias/nuevo">Crear la primera</Link>
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
            <TableHead className="hidden text-center md:table-cell">Equipos</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="w-20 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">{cat.nombre}</TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {cat.descripcion ?? '—'}
              </TableCell>
              <TableCell className="hidden text-center md:table-cell">{cat.totalEquipos}</TableCell>
              <TableCell className="text-center">
                <Badge variant={cat.activo ? 'default' : 'secondary'}>
                  {cat.activo ? 'Activa' : 'Inactiva'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={`/catalogos/categorias/${cat.id}/editar`} aria-label="Editar">
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
