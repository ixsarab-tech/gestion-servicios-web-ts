import type { CatCategoriaEquipo, CatMarca, CatTipoServicio } from '@/generated/prisma/client';

/**
 * Proyección resumida de Marca para listados.
 */
export type MarcaResumen = Pick<CatMarca, 'id' | 'nombre' | 'activo' | 'createdAt'> & {
  totalEquipos: number;
};

/**
 * Proyección resumida de Categoría para listados.
 */
export type CategoriaResumen = Pick<
  CatCategoriaEquipo,
  'id' | 'nombre' | 'descripcion' | 'activo' | 'createdAt'
> & {
  totalEquipos: number;
};

/**
 * Proyección resumida de Tipo de Servicio para listados.
 */
export type TipoServicioResumen = Pick<
  CatTipoServicio,
  'id' | 'nombre' | 'descripcion' | 'activo' | 'createdAt'
>;
