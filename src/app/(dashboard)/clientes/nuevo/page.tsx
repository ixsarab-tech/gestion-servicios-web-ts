import Link from 'next/link';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClienteForm } from '@/modules/clientes-crm/components/cliente-form';
import { requirePermission } from '@/shared/auth';

export const metadata = {
  title: 'Nuevo cliente',
};

export const instant = false;

export default async function NuevoClientePage() {
  await connection();
  await requirePermission('clientes:crear');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/clientes" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo cliente</h1>
          <p className="text-sm text-muted-foreground">
            Completa los datos para registrar un nuevo cliente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm />
        </CardContent>
      </Card>
    </div>
  );
}
