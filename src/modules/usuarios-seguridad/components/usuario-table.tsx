'use client';

import Link from 'next/link';
import { Mail, Pencil, User, UserX } from 'lucide-react';

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

import type { UsuarioResumen } from '../types';

interface UsuarioTableProps {
  usuarios: UsuarioResumen[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    basePath: string;
    searchParams?: Record<string, string | undefined>;
  };
}

function fmtFecha(d?: Date | string | null) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function UsuarioTable({ usuarios, pagination }: UsuarioTableProps) {
  if (usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <User className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No hay usuarios registrados</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/usuarios/nuevo">Crear el primero</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Roles</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="hidden text-center lg:table-cell">Último login</TableHead>
            <TableHead className="w-20 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="font-medium">
                  {u.nombre} {u.apellidos ?? ''}
                </div>
                <div className="text-muted-foreground flex items-center gap-1 text-xs md:hidden">
                  <Mail className="h-3 w-3" /> {u.email}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-sm">{u.email}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {u.roles.length === 0 ? (
                    <span className="text-muted-foreground text-xs italic">Sin roles</span>
                  ) : (
                    u.roles.map((r) => (
                      <Badge key={r.id} variant="outline" className="text-xs">
                        {r.nombre}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={u.activo ? 'default' : 'secondary'}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-center text-sm lg:table-cell">
                {fmtFecha(u.ultimoLogin)}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={`/usuarios/${u.id}`} aria-label="Ver detalle">
                    {u.activo ? (
                      <Pencil className="h-4 w-4" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
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
