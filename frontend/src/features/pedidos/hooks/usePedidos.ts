import { useQuery } from '@tanstack/react-query'

import { getMisPedidos, getPedidos } from '../api/pedidos'
import type { FiltrosPedidos } from '../types'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', 'lista', filtros],
    queryFn: () => getPedidos(filtros),
  })
}

export function useMisPedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', 'propios', filtros],
    queryFn: () => getMisPedidos(filtros),
  })
}
