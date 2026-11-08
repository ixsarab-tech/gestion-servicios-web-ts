import Link from 'next/link';
import { ShieldX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Acceso denegado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No tienes permiso para acceder a esta página. Si crees que es un error, contacta con tu
            administrador.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Volver al dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
