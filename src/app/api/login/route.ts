import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { prismaRaw } from '@/shared/db/client';

const LoginSchema = z.object({
  tenantSlug: z.string().min(1).max(64),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { tenantSlug, email, password } = parsed.data;

    const tenant = await prismaRaw.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, slug: true, activo: true },
    });
    if (!tenant || !tenant.activo) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const usuario = await prismaRaw.usuario.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
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
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValido) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const roles = usuario.roles.map((ur) => ur.rol.nombre);
    const permisosSet = new Set<string>();
    for (const ur of usuario.roles) {
      for (const rp of ur.rol.permisos) {
        permisosSet.add(rp.permiso.codigo);
      }
    }
    const permisos = Array.from(permisosSet);

    await prismaRaw.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() },
    });

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      console.error('[login] AUTH_SECRET no configurado');
      return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
    }

    const cookieName = 'authjs.session-token';

    const token = await encode({
      token: {
        id: usuario.id,
        sub: usuario.id,
        email: usuario.email,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        roles,
        permisos,
      },
      secret,
      salt: cookieName,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false,
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[login] Error:', error);
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}
