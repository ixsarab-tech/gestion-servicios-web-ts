import Link from 'next/link';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NuevoUsuarioButton } from '@/modules/usuarios-seguridad/components';
import { listarRoles } from '@/modules/usuarios-seguridad/services';
import { requirePermission } from '@/shared/auth';
import { runAsTenant } from '@/shared/tenant/context';

export const metadata = { title: 'Nuevo usuario' };
export const instant = false;

export default async function NuevoUsuarioPage() {
  await connection();
  const user = await requirePermission('usuarios:crear');
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
          <h1 className="text-2xl font-bold tracking-tight">Nuevo usuario</h1>
          <p className="text-sm text-muted-foreground">
            Crea un usuario y asigna sus roles
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-6">
        <p className="text-muted-foreground text-sm">
          Usa el botón a continuación para abrir el formulario de creación.
        </p>
        <div className="mt-4">
          <NuevoUsuarioButton roles={rolesMini} />
        </div>
      </div>

      <Button asChild variant="outline">
        <Link href="/usuarios">Volver a usuarios</Link>
      </Button>
    </div>
  );
}
