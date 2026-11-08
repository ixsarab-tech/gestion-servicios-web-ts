import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { prismaRaw } from '@/shared/db/client';

import type { CredentialsInput, SessionUser } from './types';

/**
 * Esquema de validación de credenciales.
 * Se valida ANTES de tocar la base de datos.
 */
const credentialsSchema = z.object({
  tenantSlug: z.string().min(1).max(64),
  email: z.email(),
  password: z.string().min(8).max(128),
});

/**
 * Verifica credenciales contra la base de datos.
 * Retorna el SessionUser si son válidas, null en cualquier otro caso.
 *
 * IMPORTANTE: usa prismaRaw porque el contexto de tenant aún no existe
 * durante el login (el usuario todavía no está autenticado).
 */
async function authorizeCredentials(raw: unknown): Promise<SessionUser | null> {
  const parsed = credentialsSchema.safeParse(raw);
  if (!parsed.success) return null;

  const { tenantSlug, email, password } = parsed.data;

  // 1. Buscar el tenant por slug
  const tenant = await prismaRaw.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, slug: true, activo: true },
  });
  if (!tenant || !tenant.activo) return null;

  // 2. Buscar el usuario por (tenantId, email)
  const usuario = await prismaRaw.usuario.findUnique({
    where: {
      tenantId_email: { tenantId: tenant.id, email },
    },
    include: {
      roles: {
        include: {
          rol: {
            include: {
              permisos: {
                include: { permiso: { select: { codigo: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!usuario || !usuario.activo) return null;

  // 3. Verificar password con bcrypt
  const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValido) return null;

  // 4. Extraer roles y permisos (deduplicados)
  const roles = usuario.roles.map((ur) => ur.rol.nombre);
  const permisosSet = new Set<string>();
  for (const ur of usuario.roles) {
    for (const rp of ur.rol.permisos) {
      permisosSet.add(rp.permiso.codigo);
    }
  }
  const permisos = Array.from(permisosSet);

  // 5. Actualizar ultimoLogin (fire and forget, no bloqueante)
  prismaRaw.usuario
    .update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() },
    })
    .catch((err) => {
      console.error('[auth] Error al actualizar ultimoLogin:', err);
    });

  return {
    id: usuario.id,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    email: usuario.email,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    roles,
    permisos,
  } satisfies SessionUser;
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        tenantSlug: { label: 'Taller', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        return authorizeCredentials(credentials);
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as SessionUser;
        token.id = u.id;
        token.tenantId = u.tenantId;
        token.tenantSlug = u.tenantSlug;
        token.nombre = u.nombre;
        token.apellidos = u.apellidos;
        token.roles = u.roles;
        token.permisos = u.permisos;
      }
      return token;
    },

    async session({ session, token }) {
      const user: SessionUser = {
        id: (token.id as string) ?? '',
        tenantId: (token.tenantId as string) ?? '',
        tenantSlug: (token.tenantSlug as string) ?? '',
        email: session.user.email,
        nombre: (token.nombre as string) ?? '',
        apellidos: (token.apellidos as string | null) ?? null,
        roles: (token.roles as string[]) ?? [],
        permisos: (token.permisos as string[]) ?? [],
      };
      session.user = user as unknown as typeof session.user;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export type { CredentialsInput };
