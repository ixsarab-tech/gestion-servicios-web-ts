import { describe, expect, it } from 'vitest';

import { sanitizeForAudit } from '@/shared/audit/sanitize';

describe('audit/sanitize', () => {
  it('redacta password y passwordHash', () => {
    const input = { email: 'a@b.com', password: 'secreto', passwordHash: '$2a$...' };
    const out = sanitizeForAudit(input) as Record<string, unknown>;
    expect(out.email).toBe('a@b.com');
    expect(out.password).toBe('[REDACTED]');
    expect(out.passwordHash).toBe('[REDACTED]');
  });

  it('redacta claves sensibles case-insensitive', () => {
    const out = sanitizeForAudit({ AccessToken: 'x', CVV: '123' }) as Record<string, unknown>;
    expect(out.AccessToken).toBe('[REDACTED]');
    expect(out.CVV).toBe('[REDACTED]');
  });

  it('convierte Date a ISO string', () => {
    const fecha = new Date('2026-01-15T10:00:00.000Z');
    const out = sanitizeForAudit({ fecha }) as Record<string, unknown>;
    expect(out.fecha).toBe('2026-01-15T10:00:00.000Z');
  });

  it('convierte BigInt a string', () => {
    const out = sanitizeForAudit({ id: BigInt(123) }) as Record<string, unknown>;
    expect(out.id).toBe('123');
  });

  it('maneja ciclos sin lanzar', () => {
    const obj: Record<string, unknown> = { nombre: 'x' };
    obj.self = obj;
    const out = sanitizeForAudit(obj) as Record<string, unknown>;
    expect(out.nombre).toBe('x');
    expect(out.self).toBe('[Circular]');
  });

  it('convierte undefined a null', () => {
    const out = sanitizeForAudit({ a: undefined }) as Record<string, unknown>;
    expect(out.a).toBeNull();
  });

  it('no lanza con valores problemáticos', () => {
    expect(() => sanitizeForAudit(Symbol('x'))).not.toThrow();
    expect(() => sanitizeForAudit(() => 1)).not.toThrow();
  });
});
