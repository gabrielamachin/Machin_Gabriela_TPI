const formateador = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

// El backend guarda las fechas en UTC y las serializa SIN zona horaria ("2026-11-17T17:03:00").
// JavaScript interpretaría eso como hora local y mostraría la hora corrida: se fuerza UTC.
const CON_ZONA = /(Z|[+-]\d{2}:?\d{2})$/i

export function formatearFecha(valor: string): string {
  const fecha = new Date(CON_ZONA.test(valor) ? valor : `${valor}Z`)
  return Number.isNaN(fecha.getTime()) ? valor : formateador.format(fecha)
}
