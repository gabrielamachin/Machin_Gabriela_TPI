import { axiosInstance } from '@/shared/api/axiosInstance'

import type { Categoria, CategoriaInput } from '../types'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(datos: CategoriaInput): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>('/categorias', datos)
  return data
}

export async function actualizarCategoria(id: number, datos: CategoriaInput): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, datos)
  return data
}

/** Baja lógica: el backend responde 204 sin cuerpo. */
export async function eliminarCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`)
}
