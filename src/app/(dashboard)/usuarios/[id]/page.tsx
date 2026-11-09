import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UsuarioDetalle } from '@/modules/usuarios-seguridad/components';
import { listarRoles, obtenerUsuario } from '@/modules/usuarios-seguridad/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UsuarioDetallePage({ params }: PageProps) {
  await connection();
  const user = await requirePermission('usuarios:ver');
  const { id } = await params;

  const usuario = await runAsTenant(user, () => obtenerUsuario(id));
  if (!usuario) notFound();

  const roles = await runAsTenant(user, () => listarRoles());
  const rolesMini = roles.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/usuarios" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {usuario.nombre} {usuario.apellidos ?? ''}
          </h1>
          <p className="text-sm text-muted-foreground">Detalle del usuario</p>
        </div>
      </div>

      <UsuarioDetalle
        usuario={usuario}
        rolesDisponibles={rolesMini}
        puedeEditar={user.permisos.includes('usuarios:editar')}
        puedeDesactivar={user.permisos.includes('usuarios:desactivar')}
        puedeAsignarRoles={user.permisos.includes('usuarios:asignar_roles')}
        esMiPropioUsuario={user.id === usuario.id}
      />
    </div>
  );
}
