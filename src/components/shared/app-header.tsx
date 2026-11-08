'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/shared/auth/actions';

interface AppHeaderProps {
  nombre: string;
  email: string;
  tenantNombre: string;
}

export function AppHeader({ nombre, email, tenantNombre }: AppHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const iniciales = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function handleLogout() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{tenantNombre}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {iniciales}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm leading-tight font-medium">{nombre}</span>
            <span className="text-xs leading-tight text-muted-foreground">{email}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          {isPending ? 'Saliendo...' : 'Cerrar sesión'}
        </Button>
      </div>
    </header>
  );
}
