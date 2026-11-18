/** Primer mensaje de error de un campo de TanStack Form (los validadores devuelven strings). */
export function primerError(errores: readonly unknown[]): string | undefined {
  return errores.find((error): error is string => typeof error === 'string' && error.length > 0)
}
