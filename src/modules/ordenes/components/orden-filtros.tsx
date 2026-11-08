'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ESTADO_LABELS } from '../constants/estados-orden';

interface FiltrosProps {
  estadoActual?: string;
  counts: {
    total: number;
    porEstado: Record<string, number>;
  };
}

const ESTADOS_FILTRO = [
  'RECIBIDO',
  'EN_DIAGNOSTICO',
  'PRESUPUESTADO',
  'APROBADO',
  'REPARANDO',
  'LISTO',
  'ENTREGADO',
] as const;

export function OrdenFiltros({ estadoActual, counts }: FiltrosProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(estado?: string): string {
    const params = new URLSearchParams(searchParams.toString());
    if (estado) {
      params.set('estado', estado);
    } else {
      params.delete('estado');
    }
    params.delete('page');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant={!estadoActual ? 'default' : 'outline'} size="sm" asChild>
        <Link href={buildHref()}>
          Todas
          <Badge variant="secondary" className="ml-2">
            {counts.total}
          </Badge>
        </Link>
      </Button>

      {ESTADOS_FILTRO.map((estado) => {
        const count = counts.porEstado[estado] ?? 0;
        const isActive = estadoActual === estado;

        if (count === 0 && !isActive) {
          return null;
        }

        return (
          <Button
            key={estado}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            asChild
            className={cn(!isActive && count === 0 && 'opacity-50')}
          >
            <Link href={buildHref(estado)}>
              {ESTADO_LABELS[estado as keyof typeof ESTADO_LABELS]}
              <Badge variant="secondary" className="ml-2">
                {count}
              </Badge>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
