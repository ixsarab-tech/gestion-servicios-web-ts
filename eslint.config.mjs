import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = defineConfig([
  // ─── Base oficial de Next.js 16 ───
  ...nextVitals,
  ...nextTs,

  // ─── Reglas custom del proyecto ───
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // ── TypeScript estricto ──
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off', // la maneja unused-imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // ── Imports: orden y limpieza ──
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Side effects (import 'x')
            ['^\\u0000'],
            // 2. React y Next
            ['^react$', '^next', '^@?\\w'],
            // 3. Alias internos
            ['^@/(.*)$', '^@modules/', '^@shared/', '^@components/'],
            // 4. Relativos
            ['^\\.'],
            // 5. Estilos
            ['^.+\\.(css|scss|sass)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ── Buenas prácticas ──
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
    },
  },

  // ─── Overrides por carpeta ───
  {
    files: ['prisma/seed/**/*.ts', 'scripts/**/*.{ts,mjs}'],
    rules: {
      'no-console': 'off',
    },
  },

  // ─── Ignorados ───
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/generated/**',
    'node_modules/**',
    'prisma/migrations/**',
    'prisma/sql/generated_schema.sql',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
  ]),
]);

export default eslintConfig;
