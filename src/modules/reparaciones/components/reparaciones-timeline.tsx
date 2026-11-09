'use client';

import type { EstadoReparacion } from '@/generated/prisma/client';
import { cn } from '@/lib/utils';

const PASOS: { key: EstadoReparacion; label: string }[] = [
  { key: 'PENDIENTE', label: 'Pendiente' },
  { key: 'EN_PROCESO', label: 'En proceso' },
  { key: 'COMPLETADA', label: 'Completada' },
];

const ORDEN: Record<EstadoReparacion, number> = {
  PENDIENTE: 0,
  EN_PROCESO: 1,
  COMPLETADA: 2,
  BLOQUEADA: 1,
};

export function ReparacionesTimeline({ estado }: { estado: EstadoReparacion }) {
  const currentIdx = ORDEN[estado];
  const bloqueada = estado === 'BLOQUEADA';

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {PASOS.map((paso, i) => {
        const done = i <= currentIdx;
        return (
          <li key={paso.key} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-2.5 w-2.5 rounded-full',
                bloqueada && paso.key === 'EN_PROCESO'
                  ? 'bg-destructive'
                  : done
                    ? 'bg-primary'
                    : 'bg-muted',
              )}
            />
            <span className={cn(done ? 'text-foreground' : 'text-muted-foreground')}>
              {paso.label}
            </span>
            {i < PASOS.length - 1 && (
              <span
                className={cn('h-px w-6', i < currentIdx && !bloqueada ? 'bg-primary' : 'bg-muted')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
