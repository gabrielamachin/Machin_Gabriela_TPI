/**
 * Pantalla a la que volver después de iniciar sesión: la que pidió el usuario antes de que
 * ProtectedRoute lo mandara a /login (guardada en location.state.desde), o el inicio.
 * Solo se aceptan rutas internas, para no permitir redirecciones a otros sitios.
 */
export function destinoPostLogin(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'desde' in state &&
    typeof state.desde === 'string' &&
    state.desde.startsWith('/') &&
    !state.desde.startsWith('//')
  ) {
    return state.desde
  }
  return '/'
}
