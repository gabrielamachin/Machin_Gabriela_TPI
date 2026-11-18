import { Card } from '@/shared/ui/Card'

interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  descripcion?: string
  /** Clase de color del borde superior (identifica el indicador a simple vista). */
  acento?: string
}

export function TarjetaResumen({ titulo, valor, descripcion, acento = 'border-t-slate-300' }: TarjetaResumenProps) {
  return (
    <Card className={`flex flex-col gap-1 border-t-4 p-5 ${acento}`}>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="text-3xl font-bold text-slate-900">{valor}</p>
      {descripcion && <p className="text-xs text-slate-500">{descripcion}</p>}
    </Card>
  )
}
