import { axiosInstance } from '@/shared/api/axiosInstance'

import type { Usuario } from '../types'

export async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await axiosInstance.get<Usuario[]>('/admin/usuarios')
  return data
}

/** Idempotente: responde 200 aunque el usuario ya estuviera activo. */
export async function activarUsuario(id: number): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>(`/admin/usuarios/${id}/activar`)
  return data
}

/** Idempotente. El backend responde 400 si el admin intenta desactivarse a sí mismo. */
export async function desactivarUsuario(id: number): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>(`/admin/usuarios/${id}/desactivar`)
  return data
}
