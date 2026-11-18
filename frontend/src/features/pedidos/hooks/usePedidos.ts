import { useQuery } from '@tanstack/react-query'

import { getPedidos } from '../api/pedidos'
import type { FiltrosPedidos } from '../types'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', 'lista', filtros],
    queryFn: () => getPedidos(filtros),
  })
}
