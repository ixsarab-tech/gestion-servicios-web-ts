/**
 * Tamaños de página permitidos en listados paginados.
 * Cualquier otro valor será rechazado por los esquemas Zod.
 */
export const TAMANOS_PAGINA = [10, 25, 50, 100] as const;

export type TamanoPagina = (typeof TAMANOS_PAGINA)[number];

/** Tamaño por defecto cuando el cliente no especifica. */
export const TAMANO_PAGINA_DEFAULT: TamanoPagina = 25;

/** Máximo absoluto — protege contra abusos de memoria. */
export const TAMANO_PAGINA_MAXIMO: TamanoPagina = 100;

/** Página por defecto (1-indexed). */
export const PAGINA_DEFAULT = 1;
