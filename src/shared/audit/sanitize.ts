import { Prisma } from '@/generated/prisma/client';

import { AUDIT_REDACT_KEYS, type Json } from './types';

const REDACTED = '[REDACTED]';

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return AUDIT_REDACT_KEYS.some((k) => lower.includes(k));
}

/**
 * Convierte cualquier valor a un JSON serializable compatible con Prisma:
 *   - Date      → ISO string
 *   - BigInt    → string
 *   - undefined → null
 *   - function  → '[Function]'
 *   - circular  → '[Circular]'
 *   - claves sensibles → '[REDACTED]'
 *
 * No lanza nunca. Si algo falla, devuelve un objeto de error mínimo.
 */
export function sanitizeForAudit<T>(value: T): Json {
  try {
    return toJson(value, new WeakSet());
  } catch {
    return { error: '[sanitizeForAudit failed]' };
  }
}

function toJson(value: unknown, seen: WeakSet<object>): Json {
  // Primitivos
  if (value === null || value === undefined) return null;

  const t = typeof value;
  if (t === 'string') return value as string;
  if (t === 'number') return Number.isFinite(value) ? (value as number) : null;
  if (t === 'boolean') return value as boolean;
  if (t === 'bigint') return (value as bigint).toString();
  if (t === 'function') return '[Function]';
  if (t === 'symbol') return (value as symbol).toString();

  // Fechas
  if (value instanceof Date) return value.toISOString();

  // Prisma.Decimal (decimal.js) → number legible para auditoría
  if (value instanceof Prisma.Decimal) {
    const n = value.toNumber();
    return Number.isFinite(n) ? n : value.toString();
  }

  // Objetos complejos: prevenir ciclos
  const obj = value as object;
  if (seen.has(obj)) return '[Circular]';
  seen.add(obj);

  // Arrays
  if (Array.isArray(value)) {
    return value.map((v) => toJson(v, seen));
  }

  // Objetos planos
  const out: Record<string, Json> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      out[key] = REDACTED;
    } else {
      out[key] = toJson(v, seen);
    }
  }
  return out;
}

