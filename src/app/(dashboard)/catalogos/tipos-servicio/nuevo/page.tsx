import Link from 'next/link';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TipoServicioForm } from '@/modules/catalogos/components/tipo-servicio-form';
import { requirePermission } from '@/shared/auth';

export const metadata = { title: 'Nuevo tipo de servicio' };
export const instant = false;

export default async function NuevoTipoServicioPage() {
  await connection();
  await requirePermission('catalogos:tipos-servicio:crear');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/catalogos/tipos-servicio" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo tipo de servicio</h1>
          <p className="text-sm text-muted-foreground">Registra un tipo de servicio</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del tipo de servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <TipoServicioForm />
        </CardContent>
      </Card>
    </div>
  );
}
