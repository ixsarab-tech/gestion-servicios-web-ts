'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Mail,
  Pencil,
  Phone,
  Shield,
  UserCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { reactivarUsuarioAction } from '../actions/reactivar-usuario.action';
import { revocarRolAction } from '../actions/revocar-rol.action';
import type { RolMini, UsuarioConRelaciones } from '../types';
import { AsignarRolDialog } from './asignar-rol-dialog';
import { CambiarPasswordDialog } from './cambiar-password-dialog';
import { DesactivarUsuarioDialog } from './desactivar-usuario-dialog';

interface UsuarioDetalleProps {
  usuario: UsuarioConRelaciones;
  rolesDisponibles: RolMini[];
  puedeEditar: boolean;
  puedeDesactivar: boolean;
  puedeAsignarRoles: boolean;
  esMiPropioUsuario: boolean;
}

function fmtFecha(d?: Date | string | null) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function UsuarioDetalle({
  usuario,
  rolesDisponibles,
  puedeEditar,
  puedeDesactivar,
  puedeAsignarRoles,
  esMiPropioUsuario,
}: UsuarioDetalleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [asignarOpen, setAsignarOpen] = useState(false);

  function handleReactivar() {
    startTransition(async () => {
      const result = await reactivarUsuarioAction({ id: usuario.id });
      if (!result.success) {
        toast.error('No se pudo reactivar', { description: result.error });
        return;
      }
      toast.success('Usuario reactivado');
      router.refresh();
    });
  }

  function handleRevocarRol(rolId: string) {
    if (!window.confirm('¿Revocar este rol?')) return;
    startTransition(async () => {
      const result = await revocarRolAction({ usuarioId: usuario.id, rolId });
      if (!result.success) {
        toast.error('No se pudo revocar el rol', { description: result.error });
        return;
      }
      toast.success('Rol revocado');
      router.refresh();
    });
  }

  const rolesAsignados = new Set(usuario.roles.map((r) => r.id));
  const rolesParaAsignar = rolesDisponibles.filter((r) => !rolesAsignados.has(r.id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            {usuario.nombre} {usuario.apellidos ?? ''}
            <Badge variant={usuario.activo ? 'default' : 'secondary'}>
              {usuario.activo ? 'Activo' : 'Inactivo'}
            </Badge>
            {esMiPropioUsuario && <Badge variant="outline">Tú</Badge>}
          </CardTitle>
          <p className="text-muted-foreground text-sm">{usuario.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {puedeEditar && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/usuarios/${usuario.id}/editar`}>
                <Pencil className="mr-1 h-3 w-3" /> Editar
              </Link>
            </Button>
          )}
          {puedeEditar && <CambiarPasswordDialog usuarioId={usuario.id} email={usuario.email} />}
          {puedeDesactivar && usuario.activo && !esMiPropioUsuario && (
            <DesactivarUsuarioDialog usuarioId={usuario.id} email={usuario.email} />
          )}
          {puedeDesactivar && !usuario.activo && (
            <Button size="sm" onClick={handleReactivar} disabled={isPending}>
              <UserCheck className="mr-1 h-3 w-3" /> Reactivar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Mail className="text-muted-foreground h-4 w-4" />
            <span>{usuario.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="text-muted-foreground h-4 w-4" />
            <span>{usuario.telefono ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span>Creado: {fmtFecha(usuario.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="text-muted-foreground h-4 w-4" />
            <span>Último login: {fmtFecha(usuario.ultimoLogin)}</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4" /> Roles asignados ({usuario.roles.length})
            </h3>
            {puedeAsignarRoles && rolesParaAsignar.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setAsignarOpen(true)}>
                + Asignar rol
              </Button>
            )}
          </div>
          {usuario.roles.length === 0 ? (
            <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
              Sin roles asignados.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {usuario.roles.map((r) => (
                <div
                  key={r.id}
                  className="bg-secondary flex items-center gap-2 rounded-md px-2 py-1 text-sm"
                >
                  <span className="font-medium">{r.nombre}</span>
                  {r.descripcion && (
                    <span className="text-muted-foreground text-xs">{r.descripcion}</span>
                  )}
                  {puedeAsignarRoles && usuario.roles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRevocarRol(r.id)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Revocar rol"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <AsignarRolDialog
        open={asignarOpen}
        onOpenChange={setAsignarOpen}
        usuarioId={usuario.id}
        rolesDisponibles={rolesParaAsignar}
      />
    </Card>
  );
}
