import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import * as authApi from '@/features/auth/api/auth'
import type { LoginCredentials, UserPublic, UsuarioSesion } from '@/features/auth/types'
import { registrarAlVencerSesion } from '@/shared/api/axiosInstance'
import { queryClient } from '@/shared/api/queryClient'

interface AuthState {
  usuario: UsuarioSesion | null
  /** true hasta que checkSession confirma (o descarta) la sesión al montar la app. */
  cargando: boolean
  login: (credenciales: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

function aSesion(usuario: UserPublic): UsuarioSesion {
  return {
    id: usuario.id,
    username: usuario.username,
    full_name: usuario.full_name,
    email: usuario.email,
    role: usuario.role,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      // Los errores se propagan: el formulario los muestra con handleApiError.
      login: async (credenciales) => {
        await authApi.login(credenciales) // el backend responde con la cookie HttpOnly
        const usuario = await authApi.getMe()
        set({ usuario: aSesion(usuario) })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          // Aunque falle la llamada, se limpia la sesión del lado del cliente.
          useAuthStore.getState().limpiarSesion()
        }
      },

      // La cookie es la fuente de verdad: se consulta /auth/me al montar la app.
      checkSession: async () => {
        try {
          const usuario = await authApi.getMe()
          set({ usuario: aSesion(usuario) })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => {
        set({ usuario: null })
        queryClient.clear() // que el próximo usuario no vea datos en caché del anterior
      },
    }),
    {
      name: 'food-store-auth',
      // Solo se guarda `usuario` (nombre, email, rol). Nunca el token.
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
)

// Si la API responde 401 (sesión vencida) o "cuenta desactivada", el interceptor de Axios
// limpia este store.
registrarAlVencerSesion(() => useAuthStore.getState().limpiarSesion())
