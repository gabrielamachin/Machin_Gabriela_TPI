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
