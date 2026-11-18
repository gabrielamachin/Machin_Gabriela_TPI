const formateador = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
})

export function formatearPrecio(monto: number): string {
  return formateador.format(monto)
}
