import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  children?: ReactNode // acción opcional (por ejemplo, un enlace o botón)
}

export function EstadoVacio({ titulo, descripcion, children }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-lg font-semibold text-slate-800">{titulo}</p>
      {descripcion && <p className="max-w-md text-sm text-slate-500">{descripcion}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}
