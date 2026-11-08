import type { ErrorCode } from './codes';

/**
 * Tipo Result<T>: representa el resultado de una operación que puede fallar.
 * Reemplaza el uso de excepciones en Server Actions.
 *
 * Uso:
 *   const result = await algunaAction(input);
 *   if (!result.success) {
 *     console.error(result.code, result.error);
 *     return;
 *   }
 *   console.log(result.data); // tipado como T
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode; details?: unknown };

/** Crea un resultado exitoso. */
export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

/** Crea un resultado fallido. */
export function fail(code: ErrorCode, error: string, details?: unknown): Result<never> {
  return { success: false, code, error, details };
}

/** Type guard: comprueba si un Result es exitoso. */
export function isOk<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success;
}

/** Type guard: comprueba si un Result es fallido. */
export function isFail<T>(
  result: Result<T>,
): result is { success: false; error: string; code: ErrorCode; details?: unknown } {
  return !result.success;
}
