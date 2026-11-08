'use client';

import type { EstadoCotizacion } from '@/generated/prisma/client';
import { cn } from '@/lib/utils';

const PASOS: { key: EstadoCotizacion; label: string }[] = [
  { key: 'BORRADOR', label: 'Borrador' },
  { key: 'ENVIADA', label: 'Enviada' },
  { key: 'APROBADA', label: 'Aprobada' },
];

const ORDEN: Record<EstadoCotizacion, number> = {
  BORRADOR: 0,
  ENVIADA: 1,
  APROBADA: 2,
  RECHAZADA: 2,
  VENCIDA: 2,
};

export function CotizacionesTimeline({ estado }: { estado: EstadoCotizacion }) {
  const currentIdx = ORDEN[estado];
  const esRechazo = estado === 'RECHAZADA';
  const esVencida = estado === 'VENCIDA';

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {PASOS.map((paso, i) => {
        const done = i <= currentIdx;
        const fallido = esRechazo && paso.key === 'APROBADA';
        const inactivo = esVencida && paso.key === 'APROBADA';
        return (
          <li key={paso.key} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-2.5 w-2.5 rounded-full',
                fallido ? 'bg-destructive' : inactivo ? 'bg-muted' : done ? 'bg-primary' : 'bg-muted',
              )}
            />
            <span
              className={cn(
                fallido ? 'text-destructive line-through' : done ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {paso.label}
            </span>
            {i < PASOS.length - 1 && (
              <span
                className={cn(
                  'h-px w-6',
                  i < currentIdx && !esRechazo ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

