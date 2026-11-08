import type { NextConfig } from 'next';

/**
 * Cabeceras de seguridad aplicadas a todas las rutas.
 * CSP se añadirá más adelante cuando exista UI completa.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  // ─── Next 16 (no tocar) ───
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },

  // ─── Modo estricto en desarrollo ───
  reactStrictMode: true,

  // ─── Seguridad y rendimiento ───
  poweredByHeader: false,
  compress: true,

  // ─── Cabeceras HTTP ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // ─── Logs de desarrollo ───
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
