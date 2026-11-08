import Link from 'next/link';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoriaForm } from '@/modules/catalogos/components/categoria-form';
import { requirePermission } from '@/shared/auth';

export const metadata = { title: 'Nueva categoría' };
export const instant = false;

export default async function NuevaCategoriaPage() {
  await connection();
  await requirePermission('catalogos:categorias:crear');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/catalogos/categorias" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva categoría</h1>
          <p className="text-sm text-muted-foreground">Registra una categoría de equipo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos de la categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriaForm />
        </CardContent>
      </Card>
    </div>
  );
}
