import type { EstadoCotizacion } from '@/generated/prisma/client';

export type CotizacionItemResumen = {
  id: string;
  concepto: string;
  descripcion: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  orden: number;
};

export type CotizacionResumen = {
  id: string;
  estado: EstadoCotizacion;
  subtotal: number;
  iva: number;
  total: number;
  moneda: string;
  notas: string | null;
  validaHasta: Date | null;
  enviadaEn: Date | null;
  respondidaEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
};

export type CotizacionConRelaciones = CotizacionResumen & {
  orden: { id: string; folio: string; estado: string };
  diagnostico: { id: string } | null;
  items: CotizacionItemResumen[];
};
