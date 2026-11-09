import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { listarRoles, obtenerUsuario } from '@/modules/usuarios-seguridad/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

import { EditarUsuarioForm } from './editar-form';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarUsuarioPage({ params }: PageProps) {
  await connection();
  const user = await requirePermission('usuarios:editar');
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
          <Link href={`/usuarios/${usuario.id}`} aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar usuario</h1>
          <p className="text-sm text-muted-foreground">
            {usuario.nombre} {usuario.apellidos ?? ''}
          </p>
        </div>
      </div>

      <EditarUsuarioForm
        usuario={{
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          telefono: usuario.telefono,
        }}
        roles={rolesMini}
      />
    </div>
  );
}
