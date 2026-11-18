import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cambiarEstadoPedido } from '../api/pedidos'
import type { EstadoPedido } from '../types'

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pedidoId, estado }: { pedidoId: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(pedidoId, estado),
    // onSettled: aunque falle (por ejemplo, otro cambió el estado antes), se refresca lo que se ve.
    onSettled: async () => {
      // Invalida la lista y el resumen (cuelgan de ['pedidos']); cancelar además restituye stock.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
