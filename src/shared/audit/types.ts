import type { AccionAuditoria } from '@/generated/prisma/client';

/**
 * Tipo JSON serializable compatible con el campo `Json` de Prisma.
 */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * Entrada de auditoría. Todos los campos son obligatorios excepto los datos.
 */
export interface AuditEntryInput {
  modulo: string;
  accion: AccionAuditoria;
  tablaAfectada: string;
  registroId: string | bigint;
  datosAnteriores?: Json | null;
  datosNuevos?: Json | null;
}

/**
 * Contexto opcional que se toma automáticamente del request cuando es posible.
 */
export interface AuditEntryContext {
  ipOrigen?: string | null;
  userAgent?: string | null;
}

/**
 * Campos que JAMÁS deben quedar en la bitácora.
 * La comparación es case-insensitive y busca coincidencias parciales.
 */
export const AUDIT_REDACT_KEYS: readonly string[] = [
  'password',
  'passwordhash',
  'password_hash',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'secret',
  'apikey',
  'api_key',
  'cvv',
  'cvc',
  'cardnumber',
  'card_number',
  'creditcard',
  'credit_card',
  'pin',
  'ssn',
] as const;
