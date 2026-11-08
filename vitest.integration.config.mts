import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/integration/setup.ts'],
    include: ['tests/integration/**/*.test.ts'],
    // Los tests de integración corren en serie para evitar colisiones de DB
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@modules': path.resolve(import.meta.dirname, './src/modules'),
      '@shared': path.resolve(import.meta.dirname, './src/shared'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
    },
  },
});
