import { DEFAULT_ERROR_MESSAGES, ERROR_CODES, type ErrorCode } from './codes';

/**
 * Error base de la aplicación. Todas las excepciones controladas heredan de esta.
 * Lleva un código tipado para que el handler central lo traduzca a Result.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, message?: string, details?: unknown) {
    super(message ?? DEFAULT_ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ERROR_CODES.VALIDATION, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message?: string) {
    super(ERROR_CODES.UNAUTHENTICATED, message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(ERROR_CODES.FORBIDDEN, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string) {
    super(ERROR_CODES.NOT_FOUND, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ERROR_CODES.CONFLICT, message, details);
    this.name = 'ConflictError';
  }
}

export class TenantError extends AppError {
  constructor(message?: string, code: ErrorCode = ERROR_CODES.TENANT_MISSING) {
    super(code, message);
    this.name = 'TenantError';
  }
}

export class BusinessRuleError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ERROR_CODES.BUSINESS_RULE, message, details);
    this.name = 'BusinessRuleError';
  }
}
