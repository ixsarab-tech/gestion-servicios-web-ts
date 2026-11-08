/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { SessionUser } from './types';

declare module 'next-auth' {
  /**
   * Extiende el `User` que devuelve `authorize()`.
   * `interface extends` es OBLIGATORIO para module augmentation;
   * el disable de arriba es porque la interfaz queda vacía por diseño.
   */
  interface User extends SessionUser {}

  /**
   * Extiende la `Session` que expone `auth()`.
   */
  interface Session {
    user: SessionUser;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extiende el JWT que viaja en la cookie de sesión.
   */
  interface JWT {
    id: string;
    tenantId: string;
    tenantSlug: string;
    nombre: string;
    apellidos: string | null;
    roles: string[];
    permisos: string[];
  }
}

export {};
