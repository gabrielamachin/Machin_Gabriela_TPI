import type { EstadoPedido } from '@/features/pedidos/types'

const ESTILOS: Record<EstadoPedido, { texto: string; clases: string }> = {
  PENDIENTE: { texto: 'Pendiente', clases: 'bg-amber-100 text-amber-800' },
  EN_PREPARACION: { texto: 'En preparación', clases: 'bg-blue-100 text-blue-800' },
  ENTREGADO: { texto: 'Entregado', clases: 'bg-green-100 text-green-800' },
  CANCELADO: { texto: 'Cancelado', clases: 'bg-red-100 text-red-800' },
}

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { texto, clases } = ESTILOS[estado]
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${clases}`}>
      {texto}
    </span>
  )
}
