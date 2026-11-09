import type { EstadoReparacion } from '@/generated/prisma/client';

export type RepuestoResumen = {
  id: string;
  nombre: string;
  descripcion: string | null;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  createdAt: Date;
};

export type ReparacionResumen = {
  id: string;
  estado: EstadoReparacion;
  notas: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  totalRepuestos: number;
  costoTotal: number;
};

export type ReparacionConRelaciones = ReparacionResumen & {
  orden: { id: string; folio: string; estado: string };
  tecnico: { id: string; nombre: string; apellidos: string | null };
  diagnostico: { id: string } | null;
  repuestos: RepuestoResumen[];
};
