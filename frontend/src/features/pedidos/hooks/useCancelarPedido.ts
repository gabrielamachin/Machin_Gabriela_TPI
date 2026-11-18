import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelarPedido } from '../api/pedidos'

export function useCancelarPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelarPedido,
    // onSettled (y no solo onSuccess): si falla porque el estado cambió mientras tanto,
    // igual se refresca la lista para mostrar el estado real.
    onSettled: async () => {
      // Cancelar restituye el stock, así que también se refresca el catálogo.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
