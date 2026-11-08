import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '@/shared/errors/codes';
import { fail, isFail, isOk, ok } from '@/shared/errors/result';

describe('errors/result', () => {
  describe('ok()', () => {
    it('envuelve un valor en un Result exitoso', () => {
      const result = ok({ id: 'abc', nombre: 'Cliente' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('abc');
      }
    });

    it('acepta primitivos', () => {
      const result = ok(42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });
  });

  describe('fail()', () => {
    it('crea un Result fallido con código', () => {
      const result = fail(ERROR_CODES.NOT_FOUND, 'No existe');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.NOT_FOUND);
        expect(result.error).toBe('No existe');
      }
    });

    it('incluye details cuando se pasan', () => {
      const details = { campo: 'email' };
      const result = fail(ERROR_CODES.VALIDATION, 'inválido', details);
      if (!result.success) {
        expect(result.details).toEqual(details);
      }
    });
  });

  describe('type guards', () => {
    it('isOk() detecta éxito', () => {
      expect(isOk(ok(1))).toBe(true);
      expect(isOk(fail(ERROR_CODES.UNKNOWN, 'x'))).toBe(false);
    });

    it('isFail() detecta fallo', () => {
      expect(isFail(fail(ERROR_CODES.UNKNOWN, 'x'))).toBe(true);
      expect(isFail(ok(1))).toBe(false);
    });
  });
});
