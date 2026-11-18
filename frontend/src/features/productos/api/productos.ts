import { axiosInstance } from '@/shared/api/axiosInstance'

import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
    params: {
      skip: filtros.pagina * filtros.limite, // paginado en el servidor
      limit: filtros.limite,
      search: filtros.search || undefined, // los valores undefined no se envían
      categoria_id: filtros.categoria_id,
    },
  })
  return data
}

export async function crearProducto(datos: ProductoCreate): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>('/productos', datos)
  return data
}

export async function actualizarProducto(id: number, datos: ProductoUpdate): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, datos)
  return data
}

export async function actualizarStock(id: number, datos: ProductoStockUpdate): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, datos)
  return data
}

/** Baja lógica: el backend responde 204 sin cuerpo. */
export async function eliminarProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`)
}
