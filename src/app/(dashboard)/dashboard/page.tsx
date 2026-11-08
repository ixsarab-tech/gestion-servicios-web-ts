import { connection } from 'next/server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/shared/auth';

export const metadata = {
  title: 'Dashboard',
};

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">¡Bienvenido, {user.nombre}!</h1>
        <p className="mt-1 text-muted-foreground">
          Taller: <span className="font-medium">{user.tenantSlug}</span> · Roles:{' '}
          <span className="font-medium">{user.roles.join(', ')}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Clientes</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Órdenes activas</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Reparaciones hoy</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Facturación mes</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos pasos</CardTitle>
          <CardDescription>Construcción del módulo Clientes y CRM en progreso</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✅ Backend de clientes operativo (schema + service + actions)</li>
            <li>✅ Formulario de creación funcional</li>
            <li>🔨 Lista de clientes (siguiente sub-bloque)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
