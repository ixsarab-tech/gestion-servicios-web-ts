'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tenantSlug = formData.get('tenantSlug') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tenantSlug, email, password }),
        });

        const data = (await response.json()) as { success?: boolean; error?: string };

        if (!response.ok) {
          setError(data.error ?? 'Credenciales inválidas');
          toast.error('No pudiste iniciar sesión');
          return;
        }

        toast.success('Bienvenido');

        // ⚠️ window.location.href fuerza recarga completa,
        // asegurando que la cookie se envíe en el siguiente request.
        //window.location.href = '/dashboard';
        router.push('/dashboard');
        router.refresh(); // Importante para que el servidor reconozca la nueva sesión
      } catch {
        setError('Error de conexión. Intenta de nuevo.');
        toast.error('Error de red');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenantSlug">Taller</Label>
        <Input
          id="tenantSlug"
          name="tenantSlug"
          placeholder="taller-demo"
          defaultValue="taller-demo"
          required
          autoComplete="organization"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@taller-demo.local"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
