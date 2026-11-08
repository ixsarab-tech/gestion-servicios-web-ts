import { z } from 'zod';

import {
  PAGINA_DEFAULT,
  TAMANO_PAGINA_DEFAULT,
  TAMANO_PAGINA_MAXIMO,
  TAMANOS_PAGINA,
} from '@/shared/constants';
import type { PaginatedResult, PaginationParams } from '@/shared/types/pagination';

/**
 * Esquema Zod para validar los parámetros de paginación que vienen
 * de la URL (strings) o de un Server Action (pueden ser números).
 */
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINA_DEFAULT),
  pageSize: z.coerce
    .number()
    .int()
    .refine((v) => TAMANOS_PAGINA.includes(v as (typeof TAMANOS_PAGINA)[number]), {
      message: `pageSize debe ser uno de: ${TAMANOS_PAGINA.join(', ')}`,
    })
    .default(TAMANO_PAGINA_DEFAULT),
});

/**
 * Convierte la entrada cruda (URL, objeto) en `PaginationParams` validados.
 * Nunca lanza: si hay error, devuelve los valores por defecto.
 *
 * Uso:
 *   const params = parsePaginationParams(searchParams);
 *   // { page: 1, pageSize: 25, skip: 0, take: 25 }
 */
export function parsePaginationParams(raw: unknown): PaginationParams {
  const parsed = paginationSchema.safeParse(raw);

  const page = parsed.success ? parsed.data.page : PAGINA_DEFAULT;
  const pageSize = parsed.success
    ? Math.min(parsed.data.pageSize, TAMANO_PAGINA_MAXIMO)
    : TAMANO_PAGINA_DEFAULT;

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Construye un `PaginatedResult<T>` a partir de los items ya consultados
 * y el total de registros.
 *
 * Uso:
 *   const [items, total] = await Promise.all([
 *     prisma.cliente.findMany({ skip, take }),
 *     prisma.cliente.count(),
 *   ]);
 *   return buildPaginatedResult(items, total, params);
 */
export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  params: Pick<PaginationParams, 'page' | 'pageSize'>,
): PaginatedResult<T> {
  const { page, pageSize } = params;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
