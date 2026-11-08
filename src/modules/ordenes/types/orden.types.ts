import type {
  Cliente,
  ClienteDireccion,
  ClienteEquipo,
  EstadoOrden,
  ModalidadOrden,
  OrdenServicio,
  PrioridadOrden,
} from '@/generated/prisma/client';

export interface OrdenResumen {
  id: string;
  folio: string;
  estado: EstadoOrden;
  modalidad: ModalidadOrden;
  prioridad: PrioridadOrden;
  fallaReportada: string | null;
  fechaRecepcion: Date | null;
  fechaCompromiso: Date | null;
  createdAt: Date;
  cliente: Pick<Cliente, 'id' | 'nombre' | 'apellidos' | 'razonSocial' | 'telefono'>;
  equipo: Pick<ClienteEquipo, 'id' | 'descripcion' | 'numeroSerie' | 'modelo'>;
  tecnicoAsignado: { id: string; nombre: string; apellidos: string | null } | null;
}

export type OrdenConRelaciones = OrdenServicio & {
  cliente: Cliente;
  equipo: ClienteEquipo & {
    marca: { id: string; nombre: string } | null;
    categoria: { id: string; nombre: string } | null;
  };

  direccion: ClienteDireccion | null;
  tipoServicio: { id: string; nombre: string } | null;
  tecnicoAsignado: { id: string; nombre: string; apellidos: string | null } | null;
  historialEstados: Array<{
    id: string;
    estadoAnterior: EstadoOrden | null;
    estadoNuevo: EstadoOrden;
    comentario: string | null;
    createdAt: Date;
    usuario: { id: string; nombre: string } | null;
  }>;
  checklistEstetico: {
    id: string;
    golpes: boolean;
    rayones: boolean;
    pantallaRota: boolean;
    carcasaDanada: boolean;
    humedad: boolean;
    faltanTornillos: boolean;
    notas: string | null;
  } | null;
  accesorios: Array<{
    id: string;
    nombre: string;
    recibido: boolean;
  }>;
};
