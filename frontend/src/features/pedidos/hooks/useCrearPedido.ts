import { useMutation, useQueryClient } from '@tanstack/react-query'

import { crearPedido } from '../api/pedidos'

export function useCrearPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: crearPedido,
    onSuccess: async () => {
      // El pedido nuevo aparece en "Mis pedidos" y el stock de los productos cambió.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
