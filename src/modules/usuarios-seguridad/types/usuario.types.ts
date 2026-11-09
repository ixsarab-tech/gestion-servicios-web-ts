export type RolMini = {
  id: string;
  nombre: string;
  descripcion: string | null;
};

export type UsuarioResumen = {
  id: string;
  email: string;
  nombre: string;
  apellidos: string | null;
  telefono: string | null;
  activo: boolean;
  ultimoLogin: Date | null;
  createdAt: Date;
  roles: RolMini[];
};

export type UsuarioConRelaciones = UsuarioResumen & {
  totalSesiones: number;
};

// ═══════════════════════════════════════════════════════════════
// Rol (solo lectura para asignar en la UI)
// ═══════════════════════════════════════════════════════════════

export type RolResumen = {
  id: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
  totalPermisos: number;
};

export type RolConPermisos = RolResumen & {
  permisos: Array<{ codigo: string; descripcion: string }>;
};
