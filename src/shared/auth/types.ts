/**
 * Usuario autenticado dentro de la sesión.
 * Vive en el JWT y viaja en cada request.
 */
export interface SessionUser {
  id: string;
  tenantId: string;
  tenantSlug: string;
  email: string;
  nombre: string;
  apellidos: string | null;
  roles: string[];
  permisos: string[];
}

/**
 * Entrada del provider de credenciales.
 * Estos nombres DEBEN coincidir con los que envía el formulario de login.
 */
export interface CredentialsInput {
  tenantSlug: string;
  email: string;
  password: string;
}

/**
 * Roles reconocidos por el sistema.
 * Un usuario puede tener varios roles asignados.
 */
export const ROLE_CODES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_TALLER: 'admin_taller',
  RECEPCIONISTA: 'recepcionista',
  TECNICO: 'tecnico',
  TECNICO_CAMPO: 'tecnico_campo',
  CONTADOR: 'contador',
  CLIENTE_PORTAL: 'cliente_portal',
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];
