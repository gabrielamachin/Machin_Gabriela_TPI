import { isAxiosError } from 'axios'

// Mensaje exacto que devuelve el backend (400) cuando la cuenta está desactivada.
export const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

/** Obtiene el campo `detail` del cuerpo de una respuesta de error de la API. */
export function extraerDetail(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    return data.detail
  }
  return undefined
}

// Los 422 de FastAPI traen una lista de { loc: [...], msg: "..." }.
function formatearErroresValidacion(detail: unknown[]): string {
  return detail
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null
      if (!('msg' in item) || typeof item.msg !== 'string') return null
      const loc: unknown[] = 'loc' in item && Array.isArray(item.loc) ? item.loc : []
      const campo = loc.filter((parte) => parte !== 'body' && parte !== 'query').join('.')
      return campo ? `${campo}: ${item.msg}` : item.msg
    })
    .filter((mensaje): mensaje is string => mensaje !== null)
    .join(' · ')
}

/** Convierte cualquier error (de la API o no) en un mensaje listo para mostrar en pantalla. */
export function handleApiError(
  error: unknown,
  mensajePorDefecto = 'Ocurrió un error inesperado. Intentá de nuevo.',
): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá tu conexión.'
    }
    const detail = extraerDetail(error.response.data)
    if (typeof detail === 'string' && detail) return detail
    if (Array.isArray(detail)) {
      const mensaje = formatearErroresValidacion(detail)
      if (mensaje) return mensaje
    }
    return mensajePorDefecto
  }
  if (error instanceof Error) return error.message
  return mensajePorDefecto
}
