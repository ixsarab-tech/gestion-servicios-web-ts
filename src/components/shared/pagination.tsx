import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  /** Ruta base, ej. '/catalogos/marcas'. */
  basePath: string;
  /** Params a preservar (busqueda, activo…). `page` se gestiona aparte. */
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function href(target: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === 'page') continue;
      if (v !== undefined && v !== '') params.set(k, String(v));
    }
    if (target > 1) params.set('page', String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex flex-col gap-2 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">
        Mostrando {from}–{to} de {total} registros
      </span>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className={prevDisabled ? 'pointer-events-none opacity-50' : undefined}
        >
          <Link href={href(page - 1)} aria-disabled={prevDisabled} tabIndex={prevDisabled ? -1 : 0}>
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Link>
        </Button>
        <span className="text-muted-foreground px-2">
          Página {page} de {totalPages}
        </span>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={nextDisabled ? 'pointer-events-none opacity-50' : undefined}
        >
          <Link
            href={href(page + 1)}
            aria-disabled={nextDisabled}
            tabIndex={nextDisabled ? -1 : 0}
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
