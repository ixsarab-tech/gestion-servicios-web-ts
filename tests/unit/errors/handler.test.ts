import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { AppError } from '@/shared/errors/classes';
import { ERROR_CODES } from '@/shared/errors/codes';
import { handleError } from '@/shared/errors/handler';

const ctx = { modulo: 'test', accion: 'test-action' };

describe('errors/handler', () => {
  describe('ZodError', () => {
    it('convierte un ZodError a Result con código VALIDATION', () => {
      const schema = z.object({ email: z.email() });
      const parsed = schema.safeParse({ email: 'no-es-email' });
      if (parsed.success) throw new Error('esperaba fallo de parseo');

      const result = handleError(parsed.error, ctx);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.VALIDATION);
        expect(result.error).toContain('[test:test-action]');
      }
    });
  });

  describe('AppError', () => {
    it('preserva el código de un AppError', () => {
      const err = new AppError(ERROR_CODES.BUSINESS_RULE, 'Regla violada');
      const result = handleError(err, ctx);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.BUSINESS_RULE);
        expect(result.error).toContain('Regla violada');
      }
    });
  });

  describe('Error genérico', () => {
    it('cae en INTERNAL para Error sin código', () => {
      const result = handleError(new Error('boom'), ctx);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.INTERNAL);
        expect(result.error).toContain('boom');
      }
    });

    it('cae en UNKNOWN para throws no-Error', () => {
      const result = handleError('texto raro', ctx);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.UNKNOWN);
      }
    });
  });
});
