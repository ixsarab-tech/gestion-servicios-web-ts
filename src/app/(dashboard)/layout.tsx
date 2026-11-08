import { Suspense } from 'react';
import { connection } from 'next/server';

import { AppHeader, AppSidebar } from '@/components/shared';
import { requireAuth } from '@/shared/auth';

export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Forzamos que el layout sea dinámico (request-time)
  await connection();

  const user = await requireAuth();

  return (
    <div className="flex h-screen flex-col">
      {/* 2. Envolvemos el contenido que usa crypto en Suspense */}
      <Suspense fallback={<div className="h-14 border-b bg-card" />}>
        <AppHeader nombre={user.nombre} email={user.email} tenantNombre={user.tenantSlug} />
      </Suspense>

      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={<div className="w-64 border-r bg-sidebar" />}>
          <AppSidebar permisos={user.permisos} />
        </Suspense>
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
