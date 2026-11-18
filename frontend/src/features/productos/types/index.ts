import type { Categoria } from '@/features/categorias/types'

export interface Producto {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria | null
}

export interface ProductosPaginados {
  total: number
  items: Producto[]
}

/** Filtros del listado. `pagina` empieza en 0: skip = pagina × limite. */
export interface FiltrosProductos {
  search?: string
  categoria_id?: number
  pagina: number
  limite: number
}

/** Alta de producto (POST). */
export interface ProductoCreate {
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
}

/** Edición de datos del producto (PUT). El stock y la disponibilidad se cambian aparte (PATCH). */
export interface ProductoUpdate {
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
}

/** Cambio de stock y/o disponibilidad (PATCH /productos/{id}/stock). */
export interface ProductoStockUpdate {
  stock?: number
  disponible?: boolean
}
