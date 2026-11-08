/**
 * Catálogo de códigos de error del sistema.
 * Formato: E_<CATEGORIA>_<DETALLE>
 * Deben ser ESTABLES — los clientes pueden depender de ellos.
 */
export const ERROR_CODES = {
  // Validación de entradas
  VALIDATION: 'E_VALIDATION',

  // Autenticación / Autorización
  UNAUTHENTICATED: 'E_UNAUTHENTICATED',
  FORBIDDEN: 'E_FORBIDDEN',

  // Recursos
  NOT_FOUND: 'E_NOT_FOUND',
  CONFLICT: 'E_CONFLICT',

  // Multi-tenant
  TENANT_MISSING: 'E_TENANT_MISSING',
  TENANT_MISMATCH: 'E_TENANT_MISMATCH',

  // Base de datos
  DB: 'E_DB',
  DB_UNIQUE_VIOLATION: 'E_DB_UNIQUE_VIOLATION',
  DB_FOREIGN_KEY: 'E_DB_FOREIGN_KEY',

  // Reglas de negocio
  BUSINESS_RULE: 'E_BUSINESS_RULE',
  STATE_INVALID: 'E_STATE_INVALID',

  // Genéricos
  INTERNAL: 'E_INTERNAL',
  UNKNOWN: 'E_UNKNOWN',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Mensajes por defecto para cada código.
 * Se usan cuando una excepción no trae mensaje específico.
 */
export const DEFAULT_ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.VALIDATION]: 'Los datos enviados no son válidos',
  [ERROR_CODES.UNAUTHENTICATED]: 'Debes iniciar sesión para continuar',
  [ERROR_CODES.FORBIDDEN]: 'No tienes permisos para realizar esta acción',
  [ERROR_CODES.NOT_FOUND]: 'El recurso solicitado no existe',
  [ERROR_CODES.CONFLICT]: 'Ya existe un registro con estos datos',
  [ERROR_CODES.TENANT_MISSING]: 'Contexto de tenant no disponible',
  [ERROR_CODES.TENANT_MISMATCH]: 'El recurso no pertenece a tu organización',
  [ERROR_CODES.DB]: 'Error en la base de datos',
  [ERROR_CODES.DB_UNIQUE_VIOLATION]: 'Ya existe un registro con estos datos',
  [ERROR_CODES.DB_FOREIGN_KEY]: 'Referencia inválida a otro registro',
  [ERROR_CODES.BUSINESS_RULE]: 'La operación no cumple una regla de negocio',
  [ERROR_CODES.STATE_INVALID]: 'La operación no es válida en el estado actual',
  [ERROR_CODES.INTERNAL]: 'Ocurrió un error interno',
  [ERROR_CODES.UNKNOWN]: 'Ocurrió un error inesperado',
};
