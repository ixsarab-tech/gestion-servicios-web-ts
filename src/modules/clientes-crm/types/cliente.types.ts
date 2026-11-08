import type { Cliente, ClienteDireccion, ClienteEquipo } from '@/generated/prisma/client';

/**
 * Cliente con sus relaciones cargadas.
 * Útil para vistas de detalle.
 */
export type ClienteConRelaciones = Cliente & {
  direcciones: ClienteDireccion[];
  equipos: ClienteEquipo[];
};

/**
 * Proyección resumida para listados.
 * No trae todos los campos, solo los necesarios para la UI.
 */
export interface ClienteResumen {
  id: string;
  nombre: string;
  apellidos: string | null;
  razonSocial: string | null;
  email: string | null;
  telefono: string;
  tipo: 'FISICA' | 'JURIDICA';
  activo: boolean;
  totalEquipos: number;
  totalDirecciones: number;
  createdAt: Date;
}
