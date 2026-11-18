import { useQuery } from '@tanstack/react-query'

import { getProductos } from '../api/productos'
import type { FiltrosProductos } from '../types'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    // La clave incluye los filtros: cada combinación (búsqueda, categoría, página) se cachea aparte.
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
  })
}
