import { PrismaClientKnownRequestError } from '@prisma/client-runtime-utils';
import { ZodError } from 'zod';

import { AppError } from './classes';
import { ERROR_CODES, type ErrorCode } from './codes';
import { fail, ok, type Result } from './result';

export interface ErrorContext {
  modulo: string;
  accion: string;
  usuarioId?: string;
  tenantId?: string;
}

export function handleError(err: unknown, ctx: ErrorContext): Result<never> {
  const isDev = process.env.NODE_ENV === 'development';
  const where = `[${ctx.modulo}:${ctx.accion}]`;

  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
      code: i.code,
    }));
    return fail(ERROR_CODES.VALIDATION, `${where} Datos inválidos`, isDev ? issues : undefined);
  }

  if (err instanceof AppError) {
    return fail(err.code, `${where} ${err.message}`, isDev ? err.details : undefined);
  }

  if (err instanceof PrismaClientKnownRequestError) {
    return handlePrismaError(err, where, isDev);
  }

  if (err instanceof Error) {
    if (isDev) {
      console.error(`${where} Unhandled error:`, err);
    }
    return fail(ERROR_CODES.INTERNAL, `${where} ${err.message}`);
  }

  if (isDev) {
    console.error(`${where} Unknown throw:`, err);
  }
  return fail(ERROR_CODES.UNKNOWN, `${where} Error inesperado`);
}

function handlePrismaError(
  err: PrismaClientKnownRequestError,
  where: string,
  isDev: boolean,
): Result<never> {
  switch (err.code) {
    case 'P2002': {
      const fields = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'desconocido';
      return fail(
        ERROR_CODES.DB_UNIQUE_VIOLATION,
        `${where} Ya existe un registro con el mismo valor en: ${fields}`,
        isDev ? err.meta : undefined,
      );
    }
    case 'P2003': {
      return fail(
        ERROR_CODES.DB_FOREIGN_KEY,
        `${where} Referencia a un registro inexistente`,
        isDev ? err.meta : undefined,
      );
    }
    case 'P2025': {
      return fail(ERROR_CODES.NOT_FOUND, `${where} El registro no existe`);
    }
    default:
      return fail(
        ERROR_CODES.DB,
        `${where} Error de base de datos (${err.code})`,
        isDev ? { code: err.code, meta: err.meta } : undefined,
      );
  }
}

export function safeAction<TArgs extends unknown[], TOut>(
  ctx: ErrorContext,
  fn: (...args: TArgs) => Promise<TOut>,
): (...args: TArgs) => Promise<Result<TOut>> {
  return async (...args: TArgs): Promise<Result<TOut>> => {
    try {
      const data = await fn(...args);
      return ok(data);
    } catch (err) {
      return handleError(err, ctx);
    }
  };
}

export type { ErrorCode };
