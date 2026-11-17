import axios, { isAxiosError } from 'axios'

import { CUENTA_DESACTIVADA, extraerDetail } from './handleApiError'

const baseURL = import.meta.env.VITE_API_URL
if (!baseURL) {
  throw new Error('Falta la variable VITE_API_URL (ver frontend/.env.example)')
}

// Cliente HTTP único. withCredentials hace que el navegador adjunte la cookie HttpOnly
// de sesión en cada petición: el frontend nunca lee ni guarda el token.
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

// Endpoints donde un 401 es esperable y NO significa "sesión vencida":
// credenciales incorrectas en el login y consulta inicial de sesión.
const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']

// El authStore registra acá cómo limpiar la sesión. Se hace por registro (y no
// importando el store) para evitar una dependencia circular: el store usa esta instancia.
let alVencerSesion: () => void = () => {}

export function registrarAlVencerSesion(handler: () => void): void {
  alVencerSesion = handler
}

axiosInstance.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (isAxiosError(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''

      const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.endsWith(ruta))
      const cuentaDesactivada = status === 400 && extraerDetail(data) === CUENTA_DESACTIVADA

      // Se limpia el authStore; ProtectedRoute redirige a /login al quedar sin usuario.
      if (sesionVencida || cuentaDesactivada) alVencerSesion()
    }
    return Promise.reject(error)
  },
)
