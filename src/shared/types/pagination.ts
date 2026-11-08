/**
 * Resultado paginado estándar del sistema.
 * Todas las listas que devuelvan datos paginados usan esta forma.
 */
export interface PaginatedResult<T> {
  /** Elementos de la página actual. */
  items: T[];
  /** Total de registros en la base de datos (aplicando filtros). */
  total: number;
  /** Página actual (1-indexed). */
  page: number;
  /** Tamaño de página. */
  pageSize: number;
  /** Total de páginas disponibles. */
  totalPages: number;
  /** ¿Existe una página siguiente? */
  hasNext: boolean;
  /** ¿Existe una página anterior? */
  hasPrev: boolean;
}

/**
 * Parámetros de paginación normalizados.
 * Resultado de `parsePaginationParams()`.
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  /** Cantidad de registros a saltar (skip de Prisma). */
  skip: number;
  /** Cantidad de registros a tomar (take de Prisma). */
  take: number;
}
