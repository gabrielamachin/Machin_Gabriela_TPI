import { axiosInstance } from '@/shared/api/axiosInstance'

import type { FiltrosProductos, ProductosPaginados } from '../types'

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
