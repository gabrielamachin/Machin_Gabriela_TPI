import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from '../api/categorias'
import type { CategoriaInput } from '../types'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  })
}

// Los productos muestran el nombre de su categoría: también hay que refrescarlos.
function invalidarCategoriasYProductos(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['categorias'] }),
    queryClient.invalidateQueries({ queryKey: ['productos'] }),
  ])
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: CategoriaInput) => crearCategoria(datos),
    onSuccess: () => invalidarCategoriasYProductos(queryClient),
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaInput }) => actualizarCategoria(id, datos),
    onSuccess: () => invalidarCategoriasYProductos(queryClient),
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => invalidarCategoriasYProductos(queryClient),
  })
}
