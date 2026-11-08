import type { EstadoDiagnostico, TipoEvidencia } from '@/generated/prisma/client';

export type DiagnosticoConRelaciones = {
  id: string;
  tenantId: string;
  ordenId: string;
  tecnicoId: string;
  estado: EstadoDiagnostico;
  pruebasRealizadas: string | null;
  voltajesMedidos: string | null;
  componentesDanados: string | null;
  observaciones: string | null;
  conclusion: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tecnico: { id: string; nombre: string; apellidos: string | null };
  evidencias: Array<{
    id: string;
    tipo: TipoEvidencia;
    url: string;
    descripcion: string | null;
    createdAt: Date;
  }>;
};

export type DiagnosticoResumen = Pick<
  DiagnosticoConRelaciones,
  | 'id'
  | 'estado'
  | 'pruebasRealizadas'
  | 'conclusion'
  | 'fechaInicio'
  | 'fechaFin'
  | 'createdAt'
  | 'tecnico'
> & {
  totalEvidencias: number;
};
