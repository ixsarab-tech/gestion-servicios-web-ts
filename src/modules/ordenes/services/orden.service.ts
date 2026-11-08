import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db/client';
import { BusinessRuleError, NotFoundError } from '@/shared/errors';
import { requireCurrentTenantId } from '@/shared/tenant/context';
import type { PaginatedResult } from '@/shared/types/pagination';
import { buildPaginatedResult } from '@/shared/utils/pagination';

import { esTransicionValida } from '../constants/estados-orden';
import type {
  CambiarEstadoInput,
  CrearOrdenInput,
  EditarOrdenInput,
  FiltrosOrdenInput,
} from '../schemas';
import type { OrdenConRelaciones, OrdenResumen } from '../types';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

// ═══════════════════════════════════════════════════════════════
// GENERAR FOLIO ÚNICO (usando lock sobre el tenant)
// ═══════════════════════════════════════════════════════════════

async function generarFolio(
  client: Prisma.TransactionClient | typeof prisma,
  tenantId: string,
  tenantSlug: string,
): Promise<string> {
  // Lock del tenant para serializar la generación (evita colisiones)
  await client.$executeRaw`SELECT id FROM tenants WHERE id = ${tenantId} FOR UPDATE`;

  const anio = new Date().getFullYear();
  const prefix = `${tenantSlug.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${anio}-`;

  const rows = await client.$queryRaw<Array<{ maxSeq: bigint | number | null }>>`
    SELECT MAX(CAST(SUBSTRING(folio, LENGTH(${prefix}) + 1) AS UNSIGNED)) AS maxSeq
    FROM ordenes_servicio
    WHERE tenant_id = ${tenantId} AND folio LIKE ${prefix + '%'}
  `;

  const rawMax = rows[0]?.maxSeq ?? 0;
  const maxSeq = typeof rawMax === 'bigint' ? Number(rawMax) : Number(rawMax ?? 0);
  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
}

// ═══════════════════════════════════════════════════════════════
// CREAR ORDEN (transaccional completo)
// ═══════════════════════════════════════════════════════════════

export async function crearOrden(input: CrearOrdenInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  // Validar que el equipo pertenece al cliente
  const equipo = await client.clienteEquipo.findFirst({
    where: { id: input.equipoId, clienteId: input.clienteId, activo: true },
    select: { id: true },
  });
  if (!equipo) {
    throw new NotFoundError('El equipo no existe o no pertenece al cliente');
  }

  // Validar dirección si modalidad DOMICILIO
  if (input.modalidad === 'DOMICILIO' && input.direccionId) {
    const dir = await client.clienteDireccion.findFirst({
      where: { id: input.direccionId, clienteId: input.clienteId, activo: true },
      select: { id: true },
    });
    if (!dir) {
      throw new NotFoundError('La dirección no existe o no pertenece al cliente');
    }
  }

  // Obtener slug del tenant para el folio
  const tenant = await client.tenant.findUnique({
    where: { id: tenantId },
    select: { slug: true },
  });
  if (!tenant) {
    throw new NotFoundError('Tenant no encontrado');
  }

  const folio = await generarFolio(client, tenantId, tenant.slug);

  const data: Prisma.OrdenServicioUncheckedCreateInput = {
    tenantId,
    folio,
    clienteId: input.clienteId,
    equipoId: input.equipoId,
    tipoServicioId: input.tipoServicioId ?? null,
    direccionId: input.modalidad === 'DOMICILIO' ? (input.direccionId ?? null) : null,
    modalidad: input.modalidad,
    estado: 'RECIBIDO',
    prioridad: input.prioridad,
    fallaReportada: input.fallaReportada ?? null,
    observaciones: input.observaciones ?? null,
    fechaRecepcion: new Date(),
    fechaCompromiso: input.fechaCompromiso ?? null,
  };

  const orden = await client.ordenServicio.create({ data });

  // Crear checklist si se envió
  if (input.checklist) {
    await client.ordenChecklistEstetico.create({
      data: {
        tenantId,
        ordenId: orden.id,
        golpes: input.checklist.golpes,
        rayones: input.checklist.rayones,
        pantallaRota: input.checklist.pantallaRota,
        carcasaDanada: input.checklist.carcasaDanada,
        humedad: input.checklist.humedad,
        faltanTornillos: input.checklist.faltanTornillos,
        notas: input.checklist.notas ?? null,
      },
    });
  }

  // Crear accesorios
  if (input.accesorios.length > 0) {
    await client.ordenAccesorio.createMany({
      data: input.accesorios.map((nombre) => ({
        tenantId,
        ordenId: orden.id,
        nombre,
        recibido: true,
      })),
    });
  }

  // Historial inicial
  await client.ordenEstadoHistorial.create({
    data: {
      tenantId,
      ordenId: orden.id,
      estadoAnterior: null,
      estadoNuevo: 'RECIBIDO',
      comentario: 'Orden creada y equipo recibido',
    },
  });

  return orden;
}

// ═══════════════════════════════════════════════════════════════
// EDITAR ORDEN
// ═══════════════════════════════════════════════════════════════

export async function editarOrden(input: EditarOrdenInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const actual = await client.ordenServicio.findFirst({
    where: { id: input.id },
    select: { id: true },
  });
  if (!actual) {
    throw new NotFoundError('Orden no encontrada');
  }

  const data: Prisma.OrdenServicioUncheckedUpdateInput = {};
  if (input.tecnicoAsignadoId !== undefined) {
    data.tecnicoAsignadoId = input.tecnicoAsignadoId;
  }
  if (input.prioridad !== undefined) data.prioridad = input.prioridad;
  if (input.fallaReportada !== undefined) data.fallaReportada = input.fallaReportada ?? null;
  if (input.observaciones !== undefined) data.observaciones = input.observaciones ?? null;
  if (input.fechaCompromiso !== undefined) data.fechaCompromiso = input.fechaCompromiso ?? null;

  return client.ordenServicio.update({
    where: { id: input.id },
    data,
  });
}

// ═══════════════════════════════════════════════════════════════
// CAMBIAR ESTADO (con máquina de estados + historial)
// ═══════════════════════════════════════════════════════════════

export async function cambiarEstado(input: CambiarEstadoInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;
  const tenantId = requireCurrentTenantId();

  const actual = await client.ordenServicio.findFirst({
    where: { id: input.id },
    select: { id: true, estado: true },
  });
  if (!actual) {
    throw new NotFoundError('Orden no encontrada');
  }

  if (!esTransicionValida(actual.estado, input.nuevoEstado)) {
    throw new BusinessRuleError(
      `No se puede cambiar de "${actual.estado}" a "${input.nuevoEstado}"`,
    );
  }

  const orden = await client.ordenServicio.update({
    where: { id: input.id },
    data: {
      estado: input.nuevoEstado,
      ...(input.nuevoEstado === 'ENTREGADO' ? { fechaEntrega: new Date() } : {}),
    },
  });

  await client.ordenEstadoHistorial.create({
    data: {
      tenantId,
      ordenId: input.id,
      estadoAnterior: actual.estado,
      estadoNuevo: input.nuevoEstado,
      comentario: input.comentario ?? null,
    },
  });

  return orden;
}

// ═══════════════════════════════════════════════════════════════
// OBTENER ORDEN COMPLETA
// ═══════════════════════════════════════════════════════════════

export async function obtenerOrden(id: string): Promise<OrdenConRelaciones | null> {
  const orden = await prisma.ordenServicio.findFirst({
    where: { id },
    include: {
      cliente: true,
      equipo: {
        include: {
          marca: { select: { id: true, nombre: true } },
          categoria: { select: { id: true, nombre: true } },
        },
      },
      direccion: true,
      tipoServicio: { select: { id: true, nombre: true } },
      tecnicoAsignado: { select: { id: true, nombre: true, apellidos: true } },
      historialEstados: {
        orderBy: { createdAt: 'desc' },
        include: { usuario: { select: { id: true, nombre: true } } },
      },
      checklistEstetico: true,
      accesorios: true,
    },
  });

  return orden as OrdenConRelaciones | null;
}

// ═══════════════════════════════════════════════════════════════
// LISTAR ÓRDENES (paginado con filtros)
// ═══════════════════════════════════════════════════════════════

export async function listarOrdenes(
  filtros: FiltrosOrdenInput,
): Promise<PaginatedResult<OrdenResumen>> {
  const { busqueda, estado, modalidad, prioridad, tecnicoAsignadoId, page, pageSize } = filtros;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where: Prisma.OrdenServicioWhereInput = {};

  if (estado) where.estado = estado;
  if (modalidad) where.modalidad = modalidad;
  if (prioridad) where.prioridad = prioridad;
  if (tecnicoAsignadoId) where.tecnicoAsignadoId = tecnicoAsignadoId;

  if (busqueda) {
    where.OR = [
      { folio: { contains: busqueda } },
      { cliente: { nombre: { contains: busqueda } } },
      { cliente: { apellidos: { contains: busqueda } } },
      { cliente: { razonSocial: { contains: busqueda } } },
      { equipo: { numeroSerie: { contains: busqueda } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.ordenServicio.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        folio: true,
        estado: true,
        modalidad: true,
        prioridad: true,
        fallaReportada: true,
        fechaRecepcion: true,
        fechaCompromiso: true,
        createdAt: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            razonSocial: true,
            telefono: true,
          },
        },
        equipo: {
          select: { id: true, descripcion: true, numeroSerie: true, modelo: true },
        },
        tecnicoAsignado: {
          select: { id: true, nombre: true, apellidos: true },
        },
      },
    }),
    prisma.ordenServicio.count({ where }),
  ]);

  const mapped: OrdenResumen[] = items.map((o) => ({
    id: o.id,
    folio: o.folio,
    estado: o.estado,
    modalidad: o.modalidad,
    prioridad: o.prioridad,
    fallaReportada: o.fallaReportada,
    fechaRecepcion: o.fechaRecepcion,
    fechaCompromiso: o.fechaCompromiso,
    createdAt: o.createdAt,
    cliente: o.cliente,
    equipo: o.equipo,
    tecnicoAsignado: o.tecnicoAsignado,
  }));

  return buildPaginatedResult(mapped, total, { page, pageSize });
}

// ═══════════════════════════════════════════════════════════════
// CONTAR ORDENES POR ESTADO (para la bandeja de trabajo)
// ═══════════════════════════════════════════════════════════════

export async function contarOrdenesPorEstado(): Promise<{
  total: number;
  porEstado: Record<string, number>;
}> {
  const grupos = await prisma.ordenServicio.groupBy({
    by: ['estado'],
    _count: { _all: true },
  });

  const porEstado: Record<string, number> = {};
  let total = 0;

  for (const g of grupos) {
    const count = g._count._all;
    porEstado[g.estado] = count;
    total += count;
  }

  return { total, porEstado };
}
