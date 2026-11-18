import { Button } from '@/shared/ui/Button'

interface PaginacionProps {
  /** Página actual, empezando en 0 (skip = pagina × limite). */
  pagina: number
  limite: number
  total: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, limite, total, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / limite))
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-4">
      <Button variante="secondary" tamano="sm" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-slate-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variante="secondary"
        tamano="sm"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </nav>
  )
}
